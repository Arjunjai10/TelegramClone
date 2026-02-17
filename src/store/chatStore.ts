import { create } from 'zustand';
import { Alert } from 'react-native';
import { Chat, Message } from '../constants/types';
import { chatService } from '../services/chatService';
import { userService } from '../services/userService';

interface ChatState {
    chats: Chat[];
    activeMessages: Message[];
    isLoadingChats: boolean;
    isLoadingMessages: boolean;
    setChats: (chats: Chat[]) => void;
    setActiveMessages: (messages: Message[]) => void;
    subscribeToChats: (userId: string) => () => void;
    subscribeToMessages: (chatId: string) => () => void;
    sendMessage: (chatId: string, text: string, senderId: string, type?: 'text' | 'image', imageURL?: string) => Promise<void>;
    createChat: (currentUserId: string, otherUserId: string) => Promise<string>;
    deleteChat: (chatId: string) => Promise<void>;
    populateChatUsers: (chats: Chat[], currentUserId: string) => Promise<Chat[]>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    chats: [],
    activeMessages: [],
    isLoadingChats: false,
    isLoadingMessages: false,

    setChats: (chats) => set({ chats }),
    setActiveMessages: (activeMessages) => set({ activeMessages }),

    populateChatUsers: async (chats, currentUserId) => {
        const populated = await Promise.all(
            chats.map(async (chat) => {
                const otherId = chat.participants.find((p) => p !== currentUserId);
                if (otherId) {
                    try {
                        const otherUser = await userService.getUser(otherId);
                        return { ...chat, otherUser: otherUser || undefined };
                    } catch (e) {
                        console.warn('Failed to load user:', otherId, e);
                        return chat;
                    }
                }
                return chat;
            }),
        );
        return populated;
    },

    subscribeToChats: (userId) => {
        set({ isLoadingChats: true });
        const unsubscribe = chatService.onUserChatsChanged(userId, async (chats) => {
            const populated = await get().populateChatUsers(chats, userId);
            set({ chats: populated, isLoadingChats: false });
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
        try {
            await chatService.sendMessage(chatId, {
                text,
                senderId,
                type,
                read: false,
                imageURL,
            });
        } catch (error: any) {
            console.error('Failed to send message:', error);
            Alert.alert('Send Failed', 'Message could not be sent. Please check your connection and try again.');
        }
    },

    createChat: async (currentUserId, otherUserId) => {
        try {
            return await chatService.createChat(currentUserId, otherUserId);
        } catch (error: any) {
            console.error('Failed to create chat:', error);
            Alert.alert('Error', 'Could not start a conversation. Please try again.');
            throw error;
        }
    },

    deleteChat: async (chatId) => {
        try {
            await chatService.deleteChat(chatId);
            // Optimistic update
            set((state) => ({
                chats: state.chats.filter((c) => c.id !== chatId),
            }));
        } catch (error: any) {
            console.error('Failed to delete chat:', error);
            Alert.alert('Error', 'Failed to delete chat. Please try again.');
            throw error;
        }
    },
}));
