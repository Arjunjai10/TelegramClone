import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../constants/types';
import { useAuthStore } from '../../store';

const { width } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
    const { loginWithGoogle } = useAuthStore();

    const handleGoogleSignIn = async () => {
        try {
            // await loginWithGoogle(); // Will be implemented in store
            console.log('Google Sign In pressed');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Icon name="logo-telegram" size={width * 0.4} color={Colors.primary} />
                    <Text style={styles.appName}>Telegram</Text>
                    <Text style={styles.tagline}>
                        The world's fastest messaging app. It is free and secure.
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('PhoneInput')}>
                        <Text style={styles.primaryButtonText}>START MESSAGING</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={handleGoogleSignIn}>
                        <Icon name="logo-google" size={20} color={Colors.white} style={styles.googleIcon} />
                        <Text style={styles.googleButtonText}>Sign in with Google</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Version 1.0.0</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.white,
        marginTop: 20,
    },
    tagline: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
    },
    primaryButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    primaryButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    googleButton: {
        flexDirection: 'row',
        backgroundColor: '#4285F4',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleIcon: {
        marginRight: 10,
    },
    googleButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        paddingBottom: 20,
        alignItems: 'center',
    },
    footerText: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
});

export default LoginScreen;
