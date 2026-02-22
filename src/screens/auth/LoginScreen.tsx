import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ActivityIndicator } from 'react-native';
import { AuthStackParamList } from '../../constants/types';
import { useAuthStore } from '../../store';

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
    const { loginWithGoogle, isLoading } = useAuthStore();

    // Staggered entrance animations
    const fadeOrbs = useRef(new Animated.Value(0)).current;
    const slideTitle = useRef(new Animated.Value(40)).current;
    const fadeTitle = useRef(new Animated.Value(0)).current;
    const slideSubtitle = useRef(new Animated.Value(30)).current;
    const fadeSubtitle = useRef(new Animated.Value(0)).current;
    const slideBtns = useRef(new Animated.Value(40)).current;
    const fadeBtns = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(fadeOrbs, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.parallel([
                Animated.timing(fadeTitle, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(slideTitle, { toValue: 0, duration: 600, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(fadeSubtitle, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(slideSubtitle, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(fadeBtns, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(slideBtns, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    const handleGoogleSignIn = async () => {
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            {/* Atmospheric orbs */}
            <Animated.View style={[styles.orb1, { opacity: Animated.multiply(fadeOrbs, new Animated.Value(0.12)) }]} />
            <Animated.View style={[styles.orb2, { opacity: Animated.multiply(fadeOrbs, new Animated.Value(0.07)) }]} />

            {/* Diagonal grid overlay */}
            <View style={styles.gridPattern} pointerEvents="none">
                {Array.from({ length: 12 }).map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.gridLine,
                            { top: i * 52, transform: [{ rotate: '-20deg' }] },
                        ]}
                    />
                ))}
            </View>

            <View style={styles.content}>
                {/* Logo mark */}
                <Animated.View
                    style={[
                        styles.logoMark,
                        { opacity: fadeTitle, transform: [{ translateY: slideTitle }] },
                    ]}>
                    <View style={styles.diamondSmall} />
                </Animated.View>

                {/* Headline */}
                <Animated.View
                    style={{ opacity: fadeTitle, transform: [{ translateY: slideTitle }] }}>
                    <Text style={styles.headline}>Connect.</Text>
                    <Text style={[styles.headline, styles.headlineAccent]}>Privately.</Text>
                </Animated.View>

                {/* Tagline */}
                <Animated.Text
                    style={[
                        styles.tagline,
                        { opacity: fadeSubtitle, transform: [{ translateY: slideSubtitle }] },
                    ]}>
                    Fast. Secure. Yours.
                </Animated.Text>

                {/* Buttons */}
                <Animated.View
                    style={[
                        styles.buttonContainer,
                        { opacity: fadeBtns, transform: [{ translateY: slideBtns }] },
                    ]}>
                    {/* Primary CTA */}
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('PhoneInput')}
                        activeOpacity={0.85}>
                        <Text style={styles.primaryButtonText}>START MESSAGING</Text>
                        <Icon name="arrow-forward" size={18} color={Colors.background} style={styles.btnIcon} />
                    </TouchableOpacity>

                    {/* Google sign-in */}
                    <TouchableOpacity
                        style={[styles.googleButton, isLoading && { opacity: 0.7 }]}
                        onPress={handleGoogleSignIn}
                        disabled={isLoading}
                        activeOpacity={0.85}>
                        {isLoading ? (
                            <ActivityIndicator color={Colors.primary} />
                        ) : (
                            <>
                                <Icon name="logo-google" size={18} color={Colors.primary} style={styles.googleIcon} />
                                <Text style={styles.googleButtonText}>Continue with Google</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <View style={styles.footer}>
                <View style={styles.footerDot} />
                <Text style={styles.footerText}>v1.0.0 · end-to-end encrypted</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        overflow: 'hidden',
    },
    orb1: {
        position: 'absolute',
        width: width * 1.1,
        height: width * 1.1,
        borderRadius: width * 0.55,
        backgroundColor: Colors.primary,
        top: -width * 0.5,
        left: -width * 0.3,
    },
    orb2: {
        position: 'absolute',
        width: width * 0.85,
        height: width * 0.85,
        borderRadius: width * 0.425,
        backgroundColor: Colors.gold,
        bottom: height * 0.05,
        right: -width * 0.25,
    },
    gridPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    gridLine: {
        position: 'absolute',
        left: -width,
        right: -width,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.025)',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 36,
        paddingTop: 20,
    },
    logoMark: {
        marginBottom: 28,
    },
    diamondSmall: {
        width: 36,
        height: 36,
        backgroundColor: Colors.primary,
        borderRadius: 8,
        transform: [{ rotate: '45deg' }],
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 16,
        elevation: 12,
    },
    headline: {
        fontSize: 52,
        fontWeight: '900',
        color: Colors.textPrimary,
        lineHeight: 58,
        letterSpacing: -2,
    },
    headlineAccent: {
        color: Colors.primary,
    },
    tagline: {
        fontSize: 17,
        color: Colors.textSecondary,
        marginTop: 16,
        marginBottom: 52,
        letterSpacing: 0.5,
        fontWeight: '500',
    },
    buttonContainer: {
        width: '100%',
        gap: 14,
    },
    primaryButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 17,
        borderRadius: BorderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
        elevation: 10,
    },
    primaryButtonText: {
        color: Colors.background,
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    btnIcon: {
        marginLeft: 10,
    },
    googleButton: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        paddingVertical: 17,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.borderBright,
    },
    googleIcon: {
        marginRight: 10,
    },
    googleButtonText: {
        color: Colors.textPrimary,
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    footer: {
        paddingBottom: 28,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    footerDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: Colors.primary,
    },
    footerText: {
        color: Colors.textTertiary,
        fontSize: 12,
        letterSpacing: 0.3,
    },
});

export default LoginScreen;
