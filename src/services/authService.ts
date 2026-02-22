import {
    getAuth,
    signInWithCredential,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    FirebaseAuthTypes,
    signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

class AuthService {
    constructor() {
        GoogleSignin.configure({
            webClientId: '127677600795-acf81k4tvp9f02fctalqra97rmbivlhk.apps.googleusercontent.com',
        });
    }

    /**
     * Send OTP to a phone number in E.164 format (e.g. +91XXXXXXXXXX).
     */
    async signInWithPhoneNumber(phoneNumber: string): Promise<FirebaseAuthTypes.ConfirmationResult> {
        try {
            return await firebaseSignInWithPhoneNumber(getAuth(), phoneNumber);
        } catch (error) {
            console.error('[authService.signInWithPhoneNumber]', error);
            throw new Error('Failed to send OTP. Check the phone number and try again.');
        }
    }

    /**
     * Confirm the OTP code received on phone.
     */
    async confirmCode(
        confirmation: FirebaseAuthTypes.ConfirmationResult,
        code: string,
    ): Promise<FirebaseAuthTypes.UserCredential | null> {
        try {
            return await confirmation.confirm(code);
        } catch (error) {
            console.error('[authService.confirmCode]', error);
            throw new Error('Invalid OTP code. Please try again.');
        }
    }

    /**
     * Sign in with Google via Google Sign-In + Firebase credential.
     */
    async signInWithGoogle(): Promise<FirebaseAuthTypes.UserCredential | null> {
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const signInResult = await GoogleSignin.signIn();
            const idToken = signInResult.data?.idToken;
            if (!idToken) throw new Error('No ID token returned from Google Sign-In');
            const credential = GoogleAuthProvider.credential(idToken);
            return await signInWithCredential(getAuth(), credential);
        } catch (error) {
            console.error('[authService.signInWithGoogle]', error);
            throw new Error('Google sign-in failed. Please try again.');
        }
    }

    /**
     * Sign out from both Google and Firebase.
     */
    async signOut(): Promise<void> {
        try {
            await GoogleSignin.signOut();
        } catch {
            // User may not have signed in with Google — safe to ignore
        }
        try {
            await signOut(getAuth());
        } catch (error) {
            console.error('[authService.signOut]', error);
            throw new Error('Sign-out failed');
        }
    }

    /**
     * Returns the currently signed-in Firebase user, or null.
     */
    getCurrentUser(): FirebaseAuthTypes.User | null {
        return getAuth().currentUser;
    }

    /**
     * Subscribe to auth state changes.
     * Returns an unsubscribe function — call it in useEffect cleanup.
     */
    onAuthStateChanged(callback: (user: FirebaseAuthTypes.User | null) => void): () => void {
        return onAuthStateChanged(getAuth(), callback);
    }
}

export const authService = new AuthService();
