import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

            updateNotifications: (updates) => set((state) => ({
                notifications: { ...state.notifications, ...updates }
            })),

            updatePrivacy: (updates) => set((state) => ({
                privacy: { ...state.privacy, ...updates }
            })),

            updateChat: (updates) => set((state) => ({
                chat: { ...state.chat, ...updates }
            })),

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
