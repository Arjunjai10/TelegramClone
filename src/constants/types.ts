import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface User {
    id: string;
    displayName: string;
    phoneNumber: string;
    photoURL: string;
    bio: string;
    online: boolean;
    lastSeen: FirebaseFirestoreTypes.Timestamp | null;
    createdAt: FirebaseFirestoreTypes.Timestamp | null;
}

export interface Chat {
    id: string;
    participants: string[];
    lastMessage: {
        text: string;
        senderId: string;
        timestamp: FirebaseFirestoreTypes.Timestamp | null;
    } | null;
    unreadCount: number;
    createdAt: FirebaseFirestoreTypes.Timestamp | null;
    // Populated client-side
    otherUser?: User;
}

export type MessageType = 'text' | 'image';

export interface Message {
    id: string;
    text: string;
    senderId: string;
    imageURL?: string;
    type: MessageType;
    read: boolean;
    createdAt: FirebaseFirestoreTypes.Timestamp | null;
}

export interface Contact {
    id: string;
    displayName: string;
    phoneNumber: string;
    photoURL: string;
    online: boolean;
}

// Navigation param lists
export type AuthStackParamList = {
    Splash: undefined;
    Login: undefined;
    PhoneInput: undefined;
    OTP: { phoneNumber: string };
    ProfileSetup: undefined;
};

export type MainTabParamList = {
    ChatsTab: undefined;
    ContactsTab: undefined;
    SettingsTab: undefined;
    ProfileTab: undefined;
};

export type ChatStackParamList = {
    ChatList: undefined;
    Chat: { chatId: string; otherUser: User };
    NewChat: undefined;
    ContactInfo: { userId: string };
};

export type SettingsStackParamList = {
    Settings: undefined;
    EditProfile: undefined;
};
