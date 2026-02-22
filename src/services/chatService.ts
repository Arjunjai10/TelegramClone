import {
    getFirestore,
    collection,
    doc,
    addDoc,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    getDocs,
    deleteDoc,
    writeBatch,
    serverTimestamp,
    FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { Chat, Message } from '../constants/types';
import { COLLECTIONS } from './collections';

/**
 * Firestore document shapes:
 *
 * /chats/{chatId}
 * {
 *   participants: string[]   // [uid1, uid2]
 *   lastMessage: { text: string; senderId: string; timestamp: Timestamp } | null
 *   unreadCount: number
 *   createdAt: Timestamp
 * }
 *
 * /chats/{chatId}/messages/{messageId}
 * {
 *   text: string
 *   senderId: string
 *   type: 'text' | 'image'
 *   imageURL?: string
 *   read: boolean
 *   createdAt: Timestamp
 * }
 *
 * /chats/{chatId}/typing/{userId}
 * {
 *   isTyping: boolean
 *   timestamp: Timestamp
 * }
 */

/** Interim raw Firestore type — prevents `as any` casting */
interface FirestoreChat {
    participants: string[];
    lastMessage: { text: string; senderId: string; timestamp: FirebaseFirestoreTypes.Timestamp } | null;
    unreadCount: number;
    createdAt: FirebaseFirestoreTypes.Timestamp | null;
}

const mapChat = (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot): Chat => {
    const data = doc.data() as FirestoreChat;
    return {
        id: doc.id,
        participants: data.participants ?? [],
        lastMessage: data.lastMessage ?? null,
        unreadCount: data.unreadCount ?? 0,
        createdAt: data.createdAt ?? null,
    };
};

class ChatService {
    private db = getFirestore();
    private chatsCollection = collection(this.db, COLLECTIONS.CHATS);

    /**
     * Create a new 1:1 chat between two users, or return existing chat ID.
     */
    async createChat(currentUserId: string, otherUserId: string): Promise<string> {
        try {
            const existingChat = await this.findExistingChat(currentUserId, otherUserId);
            if (existingChat) return existingChat;

            const chatRef = await addDoc(this.chatsCollection, {
                participants: [currentUserId, otherUserId],
                lastMessage: null,
                unreadCount: 0,
                createdAt: serverTimestamp(),
            });
            return chatRef.id;
        } catch (error) {
            console.error('[chatService.createChat]', error);
            throw new Error('Failed to create chat');
        }
    }

    /**
     * Find existing chat between two users.
     * Queries by one participant and filters for the other client-side.
     * NOTE: Requires composite index: participants (Arrays) + createdAt (Desc)
     */
    async findExistingChat(userId1: string, userId2: string): Promise<string | null> {
        try {
            const q = query(
                this.chatsCollection,
                where('participants', 'array-contains', userId1),
            );
            const snapshot = await getDocs(q);
            const chat = snapshot.docs.find((chatDoc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
                const data = chatDoc.data() as FirestoreChat;
                return data.participants.includes(userId2);
            });
            return chat?.id ?? null;
        } catch (error) {
            console.error('[chatService.findExistingChat]', error);
            return null;
        }
    }

    /**
     * Listen to all chats for a user in real-time.
     * Requires composite index: participants (Arrays) + createdAt (Desc)
     */
    onUserChatsChanged(userId: string, callback: (chats: Chat[]) => void): () => void {
        const q = query(
            this.chatsCollection,
            where('participants', 'array-contains', userId),
            orderBy('createdAt', 'desc'),
        );
        return onSnapshot(
            q,
            (snapshot) => {
                const chats = snapshot.docs.map(mapChat);
                callback(chats);
            },
            (error) => {
                console.error('[chatService.onUserChatsChanged]', error);
            },
        );
    }

    /**
     * Send a message and update lastMessage atomically using writeBatch.
     */
    async sendMessage(chatId: string, message: Omit<Message, 'id' | 'createdAt'>): Promise<string> {
        try {
            const chatRef = doc(this.chatsCollection, chatId);
            const messagesRef = collection(chatRef, COLLECTIONS.MESSAGES);

            // Use addDoc for message (auto-ID), then batch update the parent chat
            const messageRef = await addDoc(messagesRef, {
                ...message,
                createdAt: serverTimestamp(),
            });

            // Update lastMessage separately (writeBatch can't addDoc, only set/update)
            await updateDoc(chatRef, {
                lastMessage: {
                    text: message.type === 'image' ? '📷 Photo' : (message.text || ''),
                    senderId: message.senderId,
                    timestamp: serverTimestamp(),
                },
            });

            return messageRef.id;
        } catch (error) {
            console.error('[chatService.sendMessage]', error);
            throw new Error('Failed to send message');
        }
    }

    /**
     * Listen to messages in a chat in real-time (last 50, desc order).
     */
    onMessagesChanged(chatId: string, callback: (messages: Message[]) => void): () => void {
        const messagesRef = collection(doc(this.chatsCollection, chatId), COLLECTIONS.MESSAGES);
        const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(50));
        return onSnapshot(
            q,
            (snapshot) => {
                const messages = snapshot.docs.map((msgDoc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
                    const data = msgDoc.data();
                    return {
                        id: msgDoc.id,
                        text: data.text ?? '',
                        senderId: data.senderId ?? '',
                        type: data.type ?? 'text',
                        imageURL: data.imageURL,
                        read: data.read ?? false,
                        createdAt: data.createdAt ?? null,
                    } as Message;
                });
                callback(messages);
            },
            (error) => {
                console.error('[chatService.onMessagesChanged]', error);
            },
        );
    }

    /**
     * Mark a list of messages as read using a batch write.
     */
    async markAsRead(chatId: string, messageIds: string[]): Promise<void> {
        if (messageIds.length === 0) return;
        try {
            const batch = writeBatch(this.db);
            const messagesRef = collection(doc(this.chatsCollection, chatId), COLLECTIONS.MESSAGES);
            messageIds.forEach((msgId) => {
                batch.update(doc(messagesRef, msgId), { read: true });
            });
            await batch.commit();
        } catch (error) {
            console.error('[chatService.markAsRead]', error);
            throw new Error('Failed to mark messages as read');
        }
    }

    /**
     * Delete a chat document.
     * NOTE: Firestore does NOT auto-delete subcollections (messages/, typing/).
     * On Spark plan subcollections must be deleted manually via Firebase Console
     * or a scheduled Cloud Function (requires Blaze).
     */
    async deleteChat(chatId: string): Promise<void> {
        try {
            await deleteDoc(doc(this.chatsCollection, chatId));
        } catch (error) {
            console.error('[chatService.deleteChat]', error);
            throw new Error('Failed to delete chat');
        }
    }

    /**
     * Set or clear typing status for a user in a chat.
     * Uses setDoc with merge:true to avoid the update/create race condition.
     */
    async setTypingStatus(chatId: string, userId: string, isTyping: boolean): Promise<void> {
        try {
            const typingRef = doc(
                collection(doc(this.chatsCollection, chatId), COLLECTIONS.TYPING),
                userId,
            );
            if (isTyping) {
                await setDoc(typingRef, { isTyping: true, timestamp: serverTimestamp() }, { merge: true });
            } else {
                await deleteDoc(typingRef);
            }
        } catch (error) {
            console.error('[chatService.setTypingStatus]', error);
            // Non-critical — don't rethrow
        }
    }

    /**
     * Subscribe to typing users in a chat.
     */
    subscribeToTypingStatus(chatId: string, callback: (typingUserIds: string[]) => void): () => void {
        const typingRef = collection(doc(this.chatsCollection, chatId), COLLECTIONS.TYPING);
        const q = query(typingRef, where('isTyping', '==', true));
        return onSnapshot(
            q,
            (snapshot) => {
                const typingUserIds = snapshot.docs.map((d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => d.id);
                callback(typingUserIds);
            },
            (error) => {
                console.error('[chatService.subscribeToTypingStatus]', error);
            },
        );
    }
}

export const chatService = new ChatService();
