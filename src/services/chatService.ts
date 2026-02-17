import firestore from '@react-native-firebase/firestore';
import { Chat, Message } from '../constants/types';

class ChatService {
    private chatsCollection = firestore().collection('chats');

    /**
     * Create a new chat between two users
     */
    async createChat(currentUserId: string, otherUserId: string): Promise<string> {
        // Check if chat already exists
        const existingChat = await this.findExistingChat(currentUserId, otherUserId);
        if (existingChat) return existingChat;

        const chatRef = await this.chatsCollection.add({
            participants: [currentUserId, otherUserId],
            lastMessage: null,
            unreadCount: 0,
            createdAt: firestore.FieldValue.serverTimestamp(),
        });
        return chatRef.id;
    }

    /**
     * Find existing chat between two users
     */
    async findExistingChat(
        userId1: string,
        userId2: string,
    ): Promise<string | null> {
        const snapshot = await this.chatsCollection
            .where('participants', 'array-contains', userId1)
            .get();

        const chat = snapshot.docs.find(doc => {
            const data = doc.data();
            return data.participants.includes(userId2);
        });

        return chat?.id || null;
    }

    /**
     * Get all chats for a user
     */
    async getUserChats(userId: string): Promise<Chat[]> {
        const snapshot = await this.chatsCollection
            .where('participants', 'array-contains', userId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Chat[];
    }

    /**
     * Listen to user's chats in real-time
     */
    onUserChatsChanged(
        userId: string,
        callback: (chats: Chat[]) => void,
    ): () => void {
        return this.chatsCollection
            .where('participants', 'array-contains', userId)
            .orderBy('createdAt', 'desc')
            .onSnapshot(
                snapshot => {
                    const chats = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Chat[];
                    callback(chats);
                },
                error => {
                    console.error('Chat listener error:', error);
                },
            );
    }

    /**
     * Send a message
     */
    async sendMessage(
        chatId: string,
        message: Omit<Message, 'id' | 'createdAt'>,
    ): Promise<string> {
        const messagesRef = this.chatsCollection
            .doc(chatId)
            .collection('messages');

        const messageRef = await messagesRef.add({
            ...message,
            createdAt: firestore.FieldValue.serverTimestamp(),
        });

        // Update last message on chat doc
        await this.chatsCollection.doc(chatId).update({
            lastMessage: {
                text: message.type === 'image' ? '📷 Photo' : message.text,
                senderId: message.senderId,
                timestamp: firestore.FieldValue.serverTimestamp(),
            },
        });

        return messageRef.id;
    }

    /**
     * Listen to messages in a chat
     */
    onMessagesChanged(
        chatId: string,
        callback: (messages: Message[]) => void,
    ): () => void {
        return this.chatsCollection
            .doc(chatId)
            .collection('messages')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .onSnapshot(
                snapshot => {
                    const messages = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Message[];
                    callback(messages);
                },
                error => {
                    console.error('Message listener error:', error);
                },
            );
    }

    /**
     * Mark messages as read
     */
    async markAsRead(chatId: string, messageIds: string[]): Promise<void> {
        const batch = firestore().batch();
        messageIds.forEach(msgId => {
            const ref = this.chatsCollection
                .doc(chatId)
                .collection('messages')
                .doc(msgId);
            batch.update(ref, { read: true });
        });
        await batch.commit();
    }

    /**
     * Delete a chat
     */
    async deleteChat(chatId: string): Promise<void> {
        await this.chatsCollection.doc(chatId).delete();
    }

    /**
     * Set typing status
     */
    async setTypingStatus(chatId: string, userId: string, isTyping: boolean): Promise<void> {
        const typingRef = this.chatsCollection
            .doc(chatId)
            .collection('typing')
            .doc(userId);

        if (isTyping) {
            await typingRef.set({
                isTyping: true,
                timestamp: firestore.FieldValue.serverTimestamp(),
            });
        } else {
            await typingRef.delete();
        }
    }

    /**
     * Subscribe to typing status
     */
    subscribeToTypingStatus(
        chatId: string,
        callback: (typingUserIds: string[]) => void,
    ): () => void {
        return this.chatsCollection
            .doc(chatId)
            .collection('typing')
            .where('isTyping', '==', true)
            // Optional: filter by recent timestamp to avoid stuck indicators
            // .where('timestamp', '>', ...) 
            .onSnapshot(
                snapshot => {
                    const typingUserIds = snapshot.docs.map(doc => doc.id);
                    callback(typingUserIds);
                },
                error => {
                    console.error('Typing listener error:', error);
                },
            );
    }
}

export const chatService = new ChatService();
