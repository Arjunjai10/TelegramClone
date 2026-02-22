import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    query,
    where,
    limit,
    getDocs,
    updateDoc,
    onSnapshot,
    serverTimestamp,
    FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { User } from '../constants/types';
import { COLLECTIONS } from './collections';

/**
 * Firestore document shape:
 *
 * /users/{userId}
 * {
 *   displayName: string
 *   email?: string
 *   phoneNumber: string
 *   photoURL: string
 *   bio: string
 *   isBot: boolean
 *   online: boolean
 *   lastSeen: Timestamp | null
 *   createdAt: Timestamp | null
 *   updatedAt: Timestamp
 * }
 */

/** Interim raw type from Firestore — prevents unsafe `as User` casting */
interface FirestoreUser {
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    photoURL?: string;
    bio?: string;
    isBot?: boolean;
    online?: boolean;
    lastSeen?: FirebaseFirestoreTypes.Timestamp | null;
    createdAt?: FirebaseFirestoreTypes.Timestamp | null;
}

/**
 * Trust boundary: validates and maps a raw Firestore doc to a typed User.
 * All missing fields get safe defaults so callers never receive undefined.
 */
const mapUser = (id: string, data: FirestoreUser): User => ({
    id,
    displayName: data.displayName ?? '',
    email: data.email,
    phoneNumber: data.phoneNumber ?? '',
    photoURL: data.photoURL ?? '',
    bio: data.bio ?? '',
    isBot: data.isBot ?? false,
    online: data.online ?? false,
    lastSeen: data.lastSeen ?? null,
    createdAt: data.createdAt ?? null,
});

class UserService {
    private db = getFirestore();
    private usersCollection = collection(this.db, COLLECTIONS.USERS);

    /**
     * Create or merge-update a user profile.
     */
    async setUser(userId: string, data: Partial<User>): Promise<void> {
        try {
            await setDoc(
                doc(this.usersCollection, userId),
                { ...data, updatedAt: serverTimestamp() },
                { merge: true },
            );
        } catch (error) {
            console.error('[userService.setUser]', error);
            throw new Error('Failed to save user profile');
        }
    }

    /**
     * Get a single user by ID. Returns null if not found.
     */
    async getUser(userId: string): Promise<User | null> {
        try {
            const userDoc = await getDoc(doc(this.usersCollection, userId));
            if (!userDoc.exists()) return null;
            return mapUser(userDoc.id, userDoc.data() as FirestoreUser);
        } catch (error) {
            console.error('[userService.getUser]', error);
            throw new Error('Failed to fetch user');
        }
    }

    /**
     * Remove duplicate users (common when testing different auth methods).
     * Deduplicates by phone number first, then falls back to displayName + photoURL.
     * Retains the most recently active profile.
     */
    private deduplicateUsers(users: User[]): User[] {
        const unique = new Map<string, User>();
        for (const u of users) {
             const key = u.phoneNumber ? u.phoneNumber : `${u.displayName}-${u.photoURL}`;
             if (!unique.has(key)) {
                 unique.set(key, u);
             } else {
                 const existing = unique.get(key)!;
                 const existingTime = existing.lastSeen?.toMillis() || 0;
                 const newTime = u.lastSeen?.toMillis() || 0;
                 if (newTime > existingTime) {
                     unique.set(key, u);
                 }
             }
        }
        return Array.from(unique.values());
    }

    /**
     * Search users by exact phone number match.
     */
    async searchByPhone(phoneNumber: string): Promise<User[]> {
        try {
            const q = query(this.usersCollection, where('phoneNumber', '==', phoneNumber));
            const snapshot = await getDocs(q);
            const users = snapshot.docs.map((d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => mapUser(d.id, d.data() as FirestoreUser));
            return this.deduplicateUsers(users);
        } catch (error) {
            console.error('[userService.searchByPhone]', error);
            throw new Error('Failed to search by phone');
        }
    }

    /**
     * Prefix search by display name (case-sensitive, requires Firestore range index).
     */
    async searchByName(name: string): Promise<User[]> {
        try {
            const q = query(
                this.usersCollection,
                where('displayName', '>=', name),
                where('displayName', '<=', name + '\uf8ff'),
                limit(20),
            );
            const snapshot = await getDocs(q);
            const users = snapshot.docs.map((d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => mapUser(d.id, d.data() as FirestoreUser));
            return this.deduplicateUsers(users);
        } catch (error) {
            console.error('[userService.searchByName]', error);
            throw new Error('Failed to search by name');
        }
    }

    /**
     * Fetch users whose phone numbers match any in the given list.
     * Handles E.164, no-plus, and last-10-digit formats for maximum match coverage.
     * Chunks queries to respect Firestore's 10-item `in` query limit.
     */
    async getUsersByPhoneNumbers(phoneNumbers: string[]): Promise<User[]> {
        if (phoneNumbers.length === 0) return [];

        // Normalize to multiple formats to maximise match coverage
        const formatsToCheck = new Set<string>();
        phoneNumbers.forEach((num) => {
            const clean = num.replace(/[^\d+]/g, '');
            if (!clean) return;
            formatsToCheck.add(clean);
            if (clean.startsWith('+')) formatsToCheck.add(clean.substring(1));
            if (clean.length > 10) formatsToCheck.add(clean.slice(-10));
        });

        const allNumbers = Array.from(formatsToCheck);
        const chunkSize = 10;
        const usersArray: User[] = [];

        for (let i = 0; i < allNumbers.length; i += chunkSize) {
            const chunk = allNumbers.slice(i, i + chunkSize);
            try {
                const q = query(this.usersCollection, where('phoneNumber', 'in', chunk));
                const snapshot = await getDocs(q);
                snapshot.docs.forEach((d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
                    usersArray.push(mapUser(d.id, d.data() as FirestoreUser));
                });
            } catch (err) {
                console.error('[userService.getUsersByPhoneNumbers] chunk error', err);
            }
        }

        return this.deduplicateUsers(usersArray);
    }

    /**
     * Get up to 50 users, excluding the given user ID.
     * Used as a fallback when contact sync yields no results.
     */
    async getAllUsers(excludeUserId: string): Promise<User[]> {
        try {
            const q = query(this.usersCollection, limit(50));
            const snapshot = await getDocs(q);
            const users = snapshot.docs
                .map((d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => mapUser(d.id, d.data() as FirestoreUser))
                .filter((u: User) => u.id !== excludeUserId);
            return this.deduplicateUsers(users);
        } catch (error) {
            console.error('[userService.getAllUsers]', error);
            throw new Error('Failed to load users');
        }
    }

    /**
     * Set a user's online/offline status and update lastSeen timestamp.
     * Uses setDoc with merge so it works even if the user doc doesn't exist yet.
     */
    async setOnlineStatus(userId: string, online: boolean): Promise<void> {
        try {
            await setDoc(
                doc(this.usersCollection, userId),
                { online, lastSeen: serverTimestamp() },
                { merge: true },
            );
        } catch (error) {
            console.error('[userService.setOnlineStatus]', error);
            // Non-critical; don't rethrow
        }
    }

    /**
     * Subscribe to real-time changes for a user document.
     * Returns an unsubscribe function — call it in useEffect cleanup.
     */
    onUserChanged(userId: string, callback: (user: User | null) => void): () => void {
        return onSnapshot(
            doc(this.usersCollection, userId),
            (userDoc) => {
                if (!userDoc.exists()) {
                    callback(null);
                    return;
                }
                callback(mapUser(userDoc.id, userDoc.data() as FirestoreUser));
            },
            (error) => {
                console.error('[userService.onUserChanged]', error);
                callback(null);
            },
        );
    }
}

export const userService = new UserService();
