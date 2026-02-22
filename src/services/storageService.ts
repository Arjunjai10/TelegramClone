import storage from '@react-native-firebase/storage';

export interface UploadResult {
    url: string;
    /** True if upload was blocked by storage plan limitations (Spark plan) */
    blocked: boolean;
}

/**
 * Firebase Storage service.
 *
 * NOTE: Firebase Storage requires the Blaze (pay-as-you-go) plan.
 * On Spark plan, uploads return { url: '', blocked: true }.
 * The caller is responsible for displaying any UI feedback based on `blocked`.
 *
 * Storage does NOT import Alert or Platform — those are UI concerns.
 * Pass the platform-resolved URI from the caller (see uploadAvatar / uploadChatImage).
 */
class StorageService {
    /**
     * Upload a file to the given storage path.
     * Returns the download URL on success, or a blocked result on Spark plan.
     */
    async uploadFile(storagePath: string, localUri: string): Promise<UploadResult> {
        try {
            const ref = storage().ref(storagePath);
            await ref.putFile(localUri);
            const url = await ref.getDownloadURL();
            return { url, blocked: false };
        } catch (error: any) {
            const isStorageBlocked =
                error?.code === 'storage/unauthorized' ||
                error?.code === 'storage/unknown' ||
                error?.message?.includes('billing');

            if (isStorageBlocked) {
                console.warn('[storageService] Storage unavailable on Spark plan');
                return { url: '', blocked: true };
            }

            console.error('[storageService.uploadFile]', error);
            throw new Error('File upload failed');
        }
    }

    /**
     * Upload a user avatar image.
     * Pass a file URI with platform pre-processing applied by the caller:
     *   Platform.OS === 'ios' ? uri.replace('file://', '') : uri
     */
    async uploadAvatar(userId: string, uri: string): Promise<UploadResult> {
        const path = `avatars/${userId}_${Date.now()}.jpg`;
        return this.uploadFile(path, uri);
    }

    /**
     * Upload a chat image.
     */
    async uploadChatImage(chatId: string, uri: string): Promise<UploadResult> {
        const path = `chats/${chatId}/${Date.now()}.jpg`;
        return this.uploadFile(path, uri);
    }

    /**
     * Delete a file from storage by its path.
     */
    async deleteFile(path: string): Promise<void> {
        try {
            await storage().ref(path).delete();
        } catch (error) {
            console.warn('[storageService.deleteFile]', error);
        }
    }
}

export const storageService = new StorageService();
