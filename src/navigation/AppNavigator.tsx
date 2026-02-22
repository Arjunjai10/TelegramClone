import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuthStore } from '../store';
import { Colors } from '../constants/theme';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { notificationService } from '../services/notificationService';

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

    if (isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
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
