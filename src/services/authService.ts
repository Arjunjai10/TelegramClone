import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

class AuthService {
    /**
     * Send OTP to phone number
     */
    async signInWithPhoneNumber(
        phoneNumber: string,
    ): Promise<FirebaseAuthTypes.ConfirmationResult> {
        return auth().signInWithPhoneNumber(phoneNumber);
    }

    /**
     * Confirm OTP code
     */
    async confirmCode(
        confirmation: FirebaseAuthTypes.ConfirmationResult,
        code: string,
    ): Promise<FirebaseAuthTypes.UserCredential | null> {
        return confirmation.confirm(code);
    }

    /**
     * Sign out
     */
    async signOut(): Promise<void> {
        return auth().signOut();
    }

    /**
     * Get current user
     */
    getCurrentUser(): FirebaseAuthTypes.User | null {
        return auth().currentUser;
    }

    /**
     * Listen to auth state changes
     */
    onAuthStateChanged(
        callback: (user: FirebaseAuthTypes.User | null) => void,
    ): () => void {
        return auth().onAuthStateChanged(callback);
    }
}

export const authService = new AuthService();
