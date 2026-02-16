import firestore from '@react-native-firebase/firestore';
import { User } from '../constants/types';

class UserService {
    private collection = firestore().collection('users');

    /**
     * Create or update user profile
     */
    async setUser(userId: string, data: Partial<User>): Promise<void> {
        await this.collection.doc(userId).set(
            {
                ...data,
                updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
        );
    }

    /**
     * Get user by ID
     */
    async getUser(userId: string): Promise<User | null> {
        const doc = await this.collection.doc(userId).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as User;
    }

    /**
     * Search users by phone number
     */
    async searchByPhone(phoneNumber: string): Promise<User[]> {
        const snapshot = await this.collection
            .where('phoneNumber', '==', phoneNumber)
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    }

    /**
     * Search users by display name (prefix search)
     */
    async searchByName(name: string): Promise<User[]> {
        const snapshot = await this.collection
            .where('displayName', '>=', name)
            .where('displayName', '<=', name + '\uf8ff')
            .limit(20)
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    }

    /**
     * Get users by phone numbers (for contact syncing)
     */
    async getUsersByPhoneNumbers(phoneNumbers: string[]): Promise<User[]> {
        if (phoneNumbers.length === 0) return [];

        // Firestore 'in' query limit is 10
        const chunkSize = 10;
        const chunks = [];
        for (let i = 0; i < phoneNumbers.length; i += chunkSize) {
            chunks.push(phoneNumbers.slice(i, i + chunkSize));
        }

        const users: User[] = [];
        for (const chunk of chunks) {
            const snapshot = await this.collection
                .where('phoneNumber', 'in', chunk)
                .get();
            snapshot.docs.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() } as User);
            });
        }
        return users;
    }

    /**
     * Get all users (fallback/admin only)
     */
    async getAllUsers(excludeUserId: string): Promise<User[]> {
        const snapshot = await this.collection.limit(50).get();
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as User))
            .filter(user => user.id !== excludeUserId);
    }

    /**
     * Update online status
     */
    async setOnlineStatus(userId: string, online: boolean): Promise<void> {
        await this.collection.doc(userId).update({
            online,
            lastSeen: firestore.FieldValue.serverTimestamp(),
        });
    }

    /**
     * Listen to user changes
     */
    onUserChanged(userId: string, callback: (user: User | null) => void): () => void {
        return this.collection.doc(userId).onSnapshot(doc => {
            if (!doc.exists) {
                callback(null);
                return;
            }
            callback({ id: doc.id, ...doc.data() } as User);
        });
    }
}

export const userService = new UserService();
