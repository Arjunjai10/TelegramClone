import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../constants/types';
import { Colors } from '../../constants/theme';
import BootSplash from 'react-native-bootsplash';
import { useAuthStore } from '../../store';

type SplashScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Splash'>;

interface Props {
    navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
    const { user, isLoading } = useAuthStore();

    useEffect(() => {
        const init = async () => {
            // Hide the native bootsplash as soon as React Native has rendered this screen
            await BootSplash.hide({ fade: true });
        };

        init();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                // If the user already has a session, they will be redirected to the main app by AppNavigator.
                // But if they end up here, just a safety check. AppNavigator usually handles this.
            } else {
                // Wait a tiny bit and send to Login
                const timer = setTimeout(() => {
                    navigation.replace('Login');
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [user, isLoading, navigation]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background, // Match recent Obsidian theme change
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SplashScreen;
