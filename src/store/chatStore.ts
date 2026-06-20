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
        recipientId: string,
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
 * TTL: 5 minutes per entry — profile updates propagate within that window.
 */
const USER_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const userCache = new Map<string, { user: User; cachedAt: number }>();

const getCachedUser = (id: string): User | undefined => {
    const entry = userCache.get(id);
    if (!entry) return undefined;
    if (Date.now() - entry.cachedAt > USER_CACHE_TTL_MS) {
        userCache.delete(id);
        return undefined;
    }
    return entry.user;
};

const setCachedUser = (id: string, user: User) => {
    userCache.set(id, { user, cachedAt: Date.now() });
};

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
            .filter((id): id is string => !!id && !getCachedUser(id));

        // Fetch uncached users in parallel (one fetch per unique uncached user)
        if (uncachedIds.length > 0) {
            const uniqueIds = [...new Set(uncachedIds)];
            await Promise.all(
                uniqueIds.map(async (id) => {
                    try {
                        const user = await userService.getUser(id);
                        if (user) setCachedUser(id, user);
                    } catch {
                        // Non-critical — chat still renders without otherUser
                    }
                }),
            );
        }

        return chats.map((chat) => {
            const otherId = chat.participants.find((p) => p !== currentUserId);
            const otherUser = otherId ? getCachedUser(otherId) : undefined;
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

    sendMessage: async (chatId, text, senderId, recipientId, type = 'text', imageURL) => {
        // ---------- Optimistic UI ----------
        // Insert a local pending message immediately so the user sees instant feedback.
        // The Firestore onSnapshot listener will replace this with the real message.
        const pendingId = `pending_${Date.now()}`;
        const pendingMessage: Message = {
            id: pendingId,
            text,
            senderId,
            type,
            read: false,
            createdAt: null,          // null signals 'pending' to MessageBubble
            ...(imageURL !== undefined && { imageURL }),
        };
        set((state) => ({ activeMessages: [pendingMessage, ...state.activeMessages] }));

        const messageData: Omit<Message, 'id' | 'createdAt'> = {
            text,
            senderId,
            type,
            read: false,
            ...(imageURL !== undefined && { imageURL }),
        };
        try {
            await chatService.sendMessage(chatId, messageData);

            // Only increment the recipient's unread count — not the sender's.
            await chatService.incrementUnreadCount(chatId, senderId, recipientId);
        } catch (error) {
            console.error('[chatStore.sendMessage]', error);
            // Remove the optimistic message on failure
            set((state) => ({
                activeMessages: state.activeMessages.filter((m) => m.id !== pendingId),
            }));
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
