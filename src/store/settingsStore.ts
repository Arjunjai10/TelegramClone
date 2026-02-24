import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';
import { userService } from '../services/userService';

interface NotificationsState {
    privateChats: boolean;
    groupChats: boolean;
    channels: boolean;
    inAppSounds: boolean;
    inAppVibrate: boolean;
    inAppPreview: boolean;
    badgeAppIcon: boolean;
}

interface PrivacyState {
    phoneNumber: string;
    lastSeen: string;
    profilePhoto: string;
    calls: string;
    passcode: boolean;
    twoStepVerification: boolean;
}

interface ChatSettingsState {
    textSize: string;
    enterIsSend: boolean;
    saveToGallery: boolean;
    wallpaper?: string;
    pinnedChats: string[];
    mutedChats: string[];
}

interface DataStorageState {
    cellular: boolean;
    wifi: boolean;
    roaming: boolean;
}

interface SettingsStore {
    notifications: NotificationsState;
    privacy: PrivacyState;
    chat: ChatSettingsState;
    storage: DataStorageState;
    language: string;

    updateNotifications: (updates: Partial<NotificationsState>) => void;
    updatePrivacy: (updates: Partial<PrivacyState>) => void;
    updateChat: (updates: Partial<ChatSettingsState>) => void;
    togglePinChat: (chatId: string) => void;
    toggleMuteChat: (chatId: string) => void;
    updateStorage: (updates: Partial<DataStorageState>) => void;
    setLanguage: (lang: string) => void;
    resetSettings: () => void;
}

const defaultState = {
    notifications: {
        privateChats: true,
        groupChats: true,
        channels: false,
        inAppSounds: true,
        inAppVibrate: true,
        inAppPreview: true,
        badgeAppIcon: true,
    },
    privacy: {
        phoneNumber: 'My Contacts',
        lastSeen: 'Everybody',
        profilePhoto: 'Everybody',
        calls: 'Everybody',
        passcode: false,
        twoStepVerification: false,
    },
    chat: {
        textSize: '16',
        enterIsSend: false,
        saveToGallery: true,
        wallpaper: undefined,
        pinnedChats: [],
        mutedChats: [],
    },
    storage: {
        cellular: true,
        wifi: true,
        roaming: false,
    },
    language: 'English',
};

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            ...defaultState,

            updateNotifications: (updates) => set((state) => {
                const newNotifications = { ...state.notifications, ...updates };

                // Sync changes to Firestore for the backend / other clients to see via `settings` field
                const authState = useAuthStore.getState();
                if (authState.user?.id) {
                    userService.setUser(authState.user.id, {
                        settings: {
                            notifications: {
                                privateChats: newNotifications.privateChats,
                                groupChats: newNotifications.groupChats,
                                inAppSounds: newNotifications.inAppSounds,
                                inAppVibrate: newNotifications.inAppVibrate,
                                inAppPreview: newNotifications.inAppPreview,
                            }
                        }
                    }).catch(console.error);
                }

                return { notifications: newNotifications };
            }),

            updatePrivacy: (updates) => set((state) => {
                const newPrivacy = { ...state.privacy, ...updates };

                // Sync privacy rules to Firestore so other clients can respect them
                const authState = useAuthStore.getState();
                if (authState.user?.id) {
                    userService.setUser(authState.user.id, {
                        settings: {
                            privacy: {
                                phoneNumber: newPrivacy.phoneNumber,
                                lastSeen: newPrivacy.lastSeen,
                                profilePhoto: newPrivacy.profilePhoto,
                                calls: newPrivacy.calls,
                                passcode: newPrivacy.passcode,
                                twoStepVerification: newPrivacy.twoStepVerification
                            }
                        }
                    }).catch(console.error);
                }

                return { privacy: newPrivacy };
            }),

            updateChat: (updates) => set((state) => ({
                chat: { ...state.chat, ...updates }
            })),

            togglePinChat: (chatId) => set((state) => {
                const pinned = state.chat.pinnedChats || [];
                const isPinned = pinned.includes(chatId);
                const pinnedChats = isPinned
                    ? pinned.filter(id => id !== chatId)
                    : [...pinned, chatId];
                return { chat: { ...state.chat, pinnedChats } };
            }),

            toggleMuteChat: (chatId) => set((state) => {
                const muted = state.chat.mutedChats || [];
                const isMuted = muted.includes(chatId);
                const mutedChats = isMuted
                    ? muted.filter(id => id !== chatId)
                    : [...muted, chatId];
                return { chat: { ...state.chat, mutedChats } };
            }),

            updateStorage: (updates) => set((state) => ({
                storage: { ...state.storage, ...updates }
            })),

            setLanguage: (lang) => set({ language: lang }),

            resetSettings: () => set(defaultState),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
