import { create } from 'zustand';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { User } from '../constants/types';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { notificationService } from '../services/notificationService';

interface AuthState {
    user: User | null;
    firebaseUser: FirebaseAuthTypes.User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isProfileComplete: boolean;
    confirmationResult: FirebaseAuthTypes.ConfirmationResult | null;

    setUser: (user: User | null) => void;
    setFirebaseUser: (user: FirebaseAuthTypes.User | null) => void;
    setIsLoading: (loading: boolean) => void;
    setIsProfileComplete: (complete: boolean) => void;
    setConfirmationResult: (result: FirebaseAuthTypes.ConfirmationResult | null) => void;
    signOut: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    checkProfileComplete: () => Promise<boolean>;
    initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    firebaseUser: null,
    isAuthenticated: false,
    isLoading: true,
    isProfileComplete: false,
    confirmationResult: null,

    setConfirmationResult: (confirmationResult) => set({ confirmationResult }),
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setIsProfileComplete: (isProfileComplete) => set({ isProfileComplete }),

    signOut: async () => {
        const { user } = get();
        if (user) {
            // Best-effort — don't let this block sign-out
            userService.setOnlineStatus(user.id, false).catch(() => { });
        }
        await authService.signOut();
        notificationService.displayLocalNotification('Logged Out', 'You have been successfully logged out.');
        set({
            user: null,
            firebaseUser: null,
            isAuthenticated: false,
            isProfileComplete: false,
        });
    },

    loginWithGoogle: async () => {
        set({ isLoading: true });
        try {
            const result = await authService.signInWithGoogle();
            if (!result?.user) {
                set({ isLoading: false });
                return;
            }

            const fbUser = result.user;
            set({ firebaseUser: fbUser });

            // Fetch existing user doc and set online in parallel
            const [userData] = await Promise.all([
                userService.getUser(fbUser.uid),
                userService.setOnlineStatus(fbUser.uid, true).catch(() => { }),
            ]);

            if (!userData) {
                // First-time Google sign-in: create profile
                const newUser: Partial<User> = {
                    displayName: fbUser.displayName ?? '',
                    email: fbUser.email ?? '',
                    photoURL: fbUser.photoURL ?? '',
                    phoneNumber: fbUser.phoneNumber ?? '',
                    bio: '',
                    isBot: false,
                    online: true,
                };
                await userService.setUser(fbUser.uid, newUser);
                const finalUser = { id: fbUser.uid, ...newUser } as User;
                set({
                    user: finalUser,
                    isAuthenticated: true,
                    isProfileComplete: !!finalUser.displayName,
                    isLoading: false,
                });
            } else {
                // Existing user: fill in any missing fields from Google profile
                const updates: Partial<User> = {};
                if (!userData.email && fbUser.email) updates.email = fbUser.email;
                if (!userData.photoURL && fbUser.photoURL) updates.photoURL = fbUser.photoURL;

                if (Object.keys(updates).length > 0) {
                    await userService.setUser(fbUser.uid, updates);
                }

                set({
                    user: { ...userData, ...updates },
                    isAuthenticated: true,
                    isProfileComplete: !!userData.displayName,
                    isLoading: false,
                });
            }
            notificationService.displayLocalNotification('Login Successful', `Welcome back${fbUser.displayName ? ', ' + fbUser.displayName : ''}!`);
        } catch (error) {
            console.error('[authStore.loginWithGoogle]', error);
            set({ isLoading: false });
            throw error;
        }
    },

    checkProfileComplete: async () => {
        const { firebaseUser } = get();
        if (!firebaseUser) return false;
        try {
            const userData = await userService.getUser(firebaseUser.uid);
            const isComplete = !!(userData?.displayName);
            set({ user: userData, isProfileComplete: isComplete, isAuthenticated: true });
            if (isComplete) {
                userService.setOnlineStatus(firebaseUser.uid, true).catch(() => { });
            }
            return isComplete;
        } catch (error) {
            console.error('[authStore.checkProfileComplete]', error);
            return false;
        }
    },

    initialize: () => {
        const unsubscribe = authService.onAuthStateChanged(async (fbUser) => {
            if (fbUser) {
                set({ firebaseUser: fbUser, isLoading: true });
                try {
                    const userData = await userService.getUser(fbUser.uid);
                    const isComplete = !!(userData?.displayName);
                    set({
                        user: userData,
                        isAuthenticated: true,
                        isProfileComplete: isComplete,
                        isLoading: false,
                    });
                    if (isComplete) {
                        userService.setOnlineStatus(fbUser.uid, true).catch(() => { });
                    }
                } catch (error) {
                    console.error('[authStore.initialize] Failed to load user data:', error);
                    // User data load failed — sign out to prevent broken auth state
                    await authService.signOut().catch(() => { });
                    set({
                        user: null,
                        firebaseUser: null,
                        isAuthenticated: false,
                        isProfileComplete: false,
                        isLoading: false,
                    });
                }
            } else {
                set({
                    user: null,
                    firebaseUser: null,
                    isAuthenticated: false,
                    isProfileComplete: false,
                    isLoading: false,
                });
            }
        });
        return unsubscribe;
    },
}));
