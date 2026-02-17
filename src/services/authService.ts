import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

class AuthService {
    constructor() {
        GoogleSignin.configure({
            webClientId: '127677600795-acf81k4tvp9f02fctalqra97rmbivlhk.apps.googleusercontent.com',
        });
    }

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
     * Sign in with Google
     */
    async signInWithGoogle(): Promise<FirebaseAuthTypes.UserCredential | null> {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const signInResult = await GoogleSignin.signIn();

        let idToken = signInResult.data?.idToken;
        if (!idToken) {
            throw new Error('No ID token found');
        }

        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        return auth().signInWithCredential(googleCredential);
    }

    /**
     * Sign out
     */
    async signOut(): Promise<void> {
        try {
            await GoogleSignin.signOut();
        } catch (e) {
            // Ignore if not signed in with Google
        }
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
