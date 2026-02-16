import storage from '@react-native-firebase/storage';
import { Alert, Platform } from 'react-native';

/**
 * Storage service with Firebase Storage integration.
 * If Firebase Storage is available (Blaze plan), uploads work normally.
 * If unavailable, methods gracefully return empty strings.
 */
class StorageService {
    private hasShownAlert = false;

    private showUpgradeAlert() {
        if (!this.hasShownAlert) {
            this.hasShownAlert = true;
            Alert.alert(
                'Feature Unavailable',
                'Image uploads require Firebase Storage (Blaze plan). Text messaging works perfectly!',
            );
        }
    }

    /**
     * Upload a file to Firebase Storage
     */
    async uploadFile(storagePath: string, localUri: string): Promise<string> {
        try {
            const uploadUri =
                Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri;
            const ref = storage().ref(storagePath);
            await ref.putFile(uploadUri);
            const downloadURL = await ref.getDownloadURL();
            return downloadURL;
        } catch (error: any) {
            // Check if storage is not available (Spark plan)
            if (
                error?.code === 'storage/unauthorized' ||
                error?.code === 'storage/unknown' ||
                error?.message?.includes('billing')
            ) {
                this.showUpgradeAlert();
                return '';
            }
            console.error('Upload failed:', error);
            throw error;
        }
    }

    /**
     * Upload user avatar
     */
    async uploadAvatar(userId: string, uri: string): Promise<string> {
        const path = `avatars/${userId}_${Date.now()}.jpg`;
        return this.uploadFile(path, uri);
    }

    /**
     * Upload chat image
     */
    async uploadChatImage(chatId: string, uri: string): Promise<string> {
        const path = `chats/${chatId}/${Date.now()}.jpg`;
        return this.uploadFile(path, uri);
    }

    /**
     * Delete a file from storage
     */
    async deleteFile(path: string): Promise<void> {
        try {
            await storage().ref(path).delete();
        } catch (error) {
            console.warn('Failed to delete file:', error);
        }
    }
}

export const storageService = new StorageService();

