import { create } from 'zustand';
import { User } from '../constants/types';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

interface AuthState {
    user: User | null;
    firebaseUser: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isProfileComplete: boolean;
    setUser: (user: User | null) => void;
    setFirebaseUser: (user: any | null) => void;
    setIsLoading: (loading: boolean) => void;
    setIsProfileComplete: (complete: boolean) => void;
    signOut: () => Promise<void>;
    checkProfileComplete: () => Promise<boolean>;
    initialize: () => () => void;
    confirmationResult: any | null;
    setConfirmationResult: (result: any | null) => void;
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
            await userService.setOnlineStatus(user.id, false);
        }
        await authService.signOut();
        set({
            user: null,
            firebaseUser: null,
            isAuthenticated: false,
            isProfileComplete: false,
        });
    },

    checkProfileComplete: async () => {
        const { firebaseUser } = get();
        if (!firebaseUser) return false;

        const userData = await userService.getUser(firebaseUser.uid);
        if (userData && userData.displayName) {
            set({ user: userData, isProfileComplete: true, isAuthenticated: true });
            await userService.setOnlineStatus(firebaseUser.uid, true);
            return true;
        }
        set({ isProfileComplete: false });
        return false;
    },

    initialize: () => {
        const unsubscribe = authService.onAuthStateChanged(async (fbUser) => {
            set({ isLoading: true });
            if (fbUser) {
                set({ firebaseUser: fbUser });
                try {
                    const userData = await userService.getUser(fbUser.uid);
                    if (userData && userData.displayName) {
                        set({
                            user: userData,
                            isAuthenticated: true,
                            isProfileComplete: true,
                            isLoading: false,
                        });
                        try {
                            await userService.setOnlineStatus(fbUser.uid, true);
                        } catch (e) {
                            console.warn('Failed to set online status:', e);
                        }
                    } else {
                        // User verified phone but hasn't completed profile
                        set({
                            isAuthenticated: true,
                            isProfileComplete: false,
                            isLoading: false,
                        });
                    }
                } catch (error) {
                    console.error('Failed to load user data:', error);
                    // On network error, still mark as authenticated so user isn't stuck
                    set({
                        isAuthenticated: true,
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
