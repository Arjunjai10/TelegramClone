import { create } from 'zustand';
import { Alert } from 'react-native';
import { Chat, Message, User } from '../constants/types';
import { chatService } from '../services/chatService';
import { userService } from '../services/userService';
import { notificationService } from '../services/notificationService';

interface ChatState {
    chats: Chat[];
    activeMessages: Message[];
    isLoadingChats: boolean;
    isLoadingMessages: boolean;

    setChats: (chats: Chat[]) => void;
    setActiveMessages: (messages: Message[]) => void;
    subscribeToChats: (userId: string) => () => void;
    subscribeToMessages: (chatId: string) => () => void;
    sendMessage: (
        chatId: string,
        text: string,
        senderId: string,
        type?: 'text' | 'image',
        imageURL?: string,
    ) => Promise<void>;
    createChat: (currentUserId: string, otherUserId: string) => Promise<string>;
    deleteChat: (chatId: string) => Promise<void>;
    populateChatUsers: (chats: Chat[], currentUserId: string) => Promise<Chat[]>;
}

/**
 * In-memory user cache to prevent N+1 Firestore reads every time chats update.
 * Lives outside the store so it persists across re-renders.
 */
const userCache = new Map<string, User>();

export const useChatStore = create<ChatState>((set, get) => ({
    chats: [],
    activeMessages: [],
    isLoadingChats: false,
    isLoadingMessages: false,

    setChats: (chats) => set({ chats }),
    setActiveMessages: (activeMessages) => set({ activeMessages }),

    /**
     * Enriches chat list with otherUser data.
     * Uses an in-memory cache to avoid re-fetching users already loaded.
     */
    populateChatUsers: async (chats, currentUserId) => {
        // Collect IDs we haven't cached yet
        const uncachedIds = chats
            .map((chat) => chat.participants.find((p) => p !== currentUserId))
            .filter((id): id is string => !!id && !userCache.has(id));

        // Fetch uncached users in parallel (one fetch per unique uncached user)
        if (uncachedIds.length > 0) {
            const uniqueIds = [...new Set(uncachedIds)];
            await Promise.all(
                uniqueIds.map(async (id) => {
                    try {
                        const user = await userService.getUser(id);
                        if (user) userCache.set(id, user);
                    } catch {
                        // Non-critical — chat still renders without otherUser
                    }
                }),
            );
        }

        return chats.map((chat) => {
            const otherId = chat.participants.find((p) => p !== currentUserId);
            const otherUser = otherId ? userCache.get(otherId) : undefined;
            return { ...chat, otherUser };
        });
    },

    subscribeToChats: (userId) => {
        set({ isLoadingChats: true });

        // Track previous chats to detect new messages
        let previousChats: Record<string, number> = {};

        const unsubscribe = chatService.onUserChatsChanged(userId, async (chats) => {
            const populated = await get().populateChatUsers(chats, userId);
            set({ chats: populated, isLoadingChats: false });

            // Calculate exact total unread count for app badge
            const totalUnread = populated.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
            notificationService.updateBadgeCount(totalUnread);

            // Check for new messages to trigger local notifications
            populated.forEach(chat => {
                const lastMsg = chat.lastMessage;
                if (lastMsg) {
                    const msgTime = lastMsg.timestamp?.toMillis() || Date.now();
                    const prevTime = previousChats[chat.id];

                    // Only notify if we have a previous time (meaning this isn't initial load),
                    // the new message time is strictly greater, and the sender is NOT ourselves
                    if (prevTime !== undefined && msgTime > prevTime && lastMsg.senderId !== userId) {
                        const isGroup = chat.participants.length > 2;
                        notificationService.displayLocalNotification(
                            isGroup ? 'Group Chat' : (chat.otherUser?.displayName || 'New Message'),
                            lastMsg.text,
                            { chatId: chat.id, isGroup }
                        );
                    }
                    previousChats[chat.id] = msgTime; // Update tracked timestamp
                }
            });
        });
        return unsubscribe;
    },

    subscribeToMessages: (chatId) => {
        set({ isLoadingMessages: true });
        const unsubscribe = chatService.onMessagesChanged(chatId, (messages) => {
            set({ activeMessages: messages, isLoadingMessages: false });
        });
        return unsubscribe;
    },

    sendMessage: async (chatId, text, senderId, type = 'text', imageURL) => {
        const messageData: Omit<Message, 'id' | 'createdAt'> = {
            text,
            senderId,
            type,
            read: false,
            ...(imageURL !== undefined && { imageURL }),
        };
        try {
            await chatService.sendMessage(chatId, messageData);
        } catch (error) {
            console.error('[chatStore.sendMessage]', error);
            Alert.alert('Send Failed', 'Message could not be sent. Please check your connection and try again.');
        }
    },

    createChat: async (currentUserId, otherUserId) => {
        try {
            return await chatService.createChat(currentUserId, otherUserId);
        } catch (error) {
            console.error('[chatStore.createChat]', error);
            Alert.alert('Error', 'Could not start a conversation. Please try again.');
            throw error;
        }
    },

    deleteChat: async (chatId) => {
        try {
            await chatService.deleteChat(chatId);
            // Optimistic local update
            set((state) => {
                const newChats = state.chats.filter((c) => c.id !== chatId);
                const totalUnread = newChats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
                notificationService.updateBadgeCount(totalUnread);
                return { chats: newChats };
            });
        } catch (error) {
            console.error('[chatStore.deleteChat]', error);
            Alert.alert('Error', 'Failed to delete chat. Please try again.');
            throw error;
        }
    },
}));
