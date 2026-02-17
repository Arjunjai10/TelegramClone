import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuthStore } from '../store';
import { Colors } from '../constants/theme';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

const AppNavigator: React.FC = () => {
    const { isAuthenticated, isProfileComplete, isLoading, initialize } =
        useAuthStore();



    useEffect(() => {
        const unsubscribe = initialize();
        return () => unsubscribe();
    }, [initialize]);

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
