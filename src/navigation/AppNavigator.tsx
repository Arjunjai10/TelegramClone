import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, AppState, AppStateStatus, StyleSheet, View } from 'react-native';
import { useAuthStore } from '../store';
import { userService } from '../services/userService';
import { Colors } from '../constants/theme';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { notificationService } from '../services/notificationService';
import BootSplash from 'react-native-bootsplash';
import messaging from '@react-native-firebase/messaging';

const AppNavigator: React.FC = () => {
    const { isAuthenticated, isProfileComplete, isLoading, initialize, user } =
        useAuthStore();



    useEffect(() => {
        let authUnsubscribe: (() => void) | undefined;
        let tokenUnsubscribe: (() => void) | undefined;

        const initializeApp = async () => {
            authUnsubscribe = initialize();
        };
        initializeApp();

        return () => {
            if (authUnsubscribe) authUnsubscribe();
            if (tokenUnsubscribe) tokenUnsubscribe();
        };
    }, [initialize]);

    // Handle notifications when authenticated
    useEffect(() => {
        let tokenUnsubscribe: (() => void) | undefined;

        const setupNotifications = async () => {
            if (isAuthenticated && isProfileComplete && user?.id) {
                const hasPermission = await notificationService.requestPermission();
                if (hasPermission) {
                    await notificationService.setupChannels();
                    tokenUnsubscribe = await notificationService.updateUserToken(user.id);
                }
            }
        };

        setupNotifications();

        return () => {
            if (tokenUnsubscribe) tokenUnsubscribe();
        };
    }, [isAuthenticated, isProfileComplete, user?.id]);

    // Update online status on app foreground / background transitions
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        // Set online when the effect first runs (app is in foreground)
        userService.setOnlineStatus(user.id, true);

        const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
            const prev = appStateRef.current;
            appStateRef.current = nextState;

            if (prev.match(/inactive|background/) && nextState === 'active') {
                // Foregrounded
                userService.setOnlineStatus(user.id, true);
            } else if (prev === 'active' && nextState.match(/inactive|background/)) {
                // Backgrounded
                userService.setOnlineStatus(user.id, false);
            }
        });

        return () => {
            subscription.remove();
            // Mark offline when the component unmounts (sign-out)
            userService.setOnlineStatus(user.id, false);
        };
    }, [isAuthenticated, user?.id]);

    // Forward foreground FCM pushes to local notification display
    // (Background pushes are handled in index.js via setupBackgroundHandler)
    useEffect(() => {
        const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
            const title = remoteMessage.notification?.title ?? 'New Message';
            const body = remoteMessage.notification?.body ?? '';
            const data = remoteMessage.data ?? {};
            await notificationService.displayLocalNotification(title, body, data);
        });
        return () => unsubscribeForeground();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer onReady={() => BootSplash.hide({ fade: true })}>
            {isAuthenticated && isProfileComplete ? <MainTabs /> : <AuthStack />}
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
});

export default AppNavigator;
