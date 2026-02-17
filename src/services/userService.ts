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

        // Normalize input numbers to E.164 format and other potential formats
        const formatsToCheck = new Set<string>();
        phoneNumbers.forEach(num => {
            const clean = num.replace(/[^\d+]/g, '');
            if (clean) {
                formatsToCheck.add(clean);
                // Also add without + if it exists
                if (clean.startsWith('+')) {
                    formatsToCheck.add(clean.substring(1));
                }
                // Also add last 10 digits (local format)
                if (clean.length > 10) {
                    formatsToCheck.add(clean.slice(-10));
                }
            }
        });


        const allNumbers = Array.from(formatsToCheck);

        // Firestore 'in' query limit is 10
        const chunkSize = 10;
        const chunks = [];
        for (let i = 0; i < allNumbers.length; i += chunkSize) {
            chunks.push(allNumbers.slice(i, i + chunkSize));
        }

        const usersMap = new Map<string, User>();
        for (const chunk of chunks) {
            try {
                const snapshot = await this.collection
                    .where('phoneNumber', 'in', chunk)
                    .get();

                snapshot.docs.forEach(doc => {
                    usersMap.set(doc.id, { id: doc.id, ...doc.data() } as User);
                });
            } catch (err) {
                console.error('UserService: Error fetching chunk', err);
            }
        }
        return Array.from(usersMap.values());
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
