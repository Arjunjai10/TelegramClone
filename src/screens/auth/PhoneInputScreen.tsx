import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StatusBar,
    Animated,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthStackParamList } from '../../constants/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store';

const { width } = Dimensions.get('window');
type NavProp = StackNavigationProp<AuthStackParamList, 'PhoneInput'>;

const PhoneInputScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Entrance animations
    const fadeCard = useRef(new Animated.Value(0)).current;
    const slideCard = useRef(new Animated.Value(30)).current;
    const scaleBtn = useRef(new Animated.Value(1)).current;
    const focusLine = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeCard, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideCard, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        Animated.timing(focusLine, {
            toValue: isFocused ? 1 : 0,
            duration: 250,
            useNativeDriver: false,
        }).start();
    }, [isFocused]);

    const focusBorderColor = focusLine.interpolate({
        inputRange: [0, 1],
        outputRange: [Colors.border, Colors.primary],
    });

    const handleNext = async () => {
        const fullNumber = `${countryCode}${phoneNumber}`.replace(/\s/g, '');
        if (phoneNumber.length < 10) {
            Alert.alert('Invalid Number', 'Please enter a valid phone number.');
            return;
        }

        // Button press animation
        Animated.sequence([
            Animated.timing(scaleBtn, { toValue: 0.96, duration: 80, useNativeDriver: true }),
            Animated.spring(scaleBtn, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();

        setIsLoading(true);
        try {
            const confirmation = await authService.signInWithPhoneNumber(fullNumber);
            useAuthStore.getState().setConfirmationResult(confirmation);
            navigation.navigate('OTP', { phoneNumber: fullNumber });
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            {/* Orb backdrop */}
            <View style={styles.orb} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

                {/* Header nav */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="chevron-back" size={26} color={Colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <Animated.View
                    style={[
                        styles.content,
                        { opacity: fadeCard, transform: [{ translateY: slideCard }] },
                    ]}>
                    {/* Icon badge */}
                    <View style={styles.iconBadge}>
                        <Icon name="phone-portrait-outline" size={28} color={Colors.primary} />
                    </View>

                    <Text style={styles.title}>Your Phone</Text>
                    <Text style={styles.subtitle}>
                        Enter your number to receive a one-time verification code.
                    </Text>

                    {/* Phone input card */}
                    <Animated.View style={[styles.inputCard, { borderColor: focusBorderColor }]}>
                        {/* Country code segment */}
                        <View style={styles.countrySegment}>
                            <TextInput
                                style={styles.countryCodeInput}
                                value={countryCode}
                                onChangeText={setCountryCode}
                                keyboardType="phone-pad"
                                maxLength={4}
                                selectionColor={Colors.primary}
                            />
                        </View>
                        <View style={styles.dividerLine} />
                        {/* Phone number segment */}
                        <TextInput
                            style={styles.phoneInput}
                            placeholder="Phone number"
                            placeholderTextColor={Colors.textTertiary}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            maxLength={15}
                            autoFocus
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            selectionColor={Colors.primary}
                        />
                    </Animated.View>

                    <Text style={styles.note}>
                        We'll send you an SMS with a verification code.
                    </Text>

                    {/* Next button */}
                    <Animated.View style={{ transform: [{ scale: scaleBtn }] }}>
                        <TouchableOpacity
                            style={[styles.nextButton, isLoading && styles.nextButtonDisabled]}
                            onPress={handleNext}
                            disabled={isLoading}
                            activeOpacity={0.85}>
                            {isLoading ? (
                                <ActivityIndicator color={Colors.background} />
                            ) : (
                                <>
                                    <Text style={styles.nextButtonText}>SEND CODE</Text>
                                    <Icon name="arrow-forward" size={18} color={Colors.background} style={{ marginLeft: 8 }} />
                                </>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        overflow: 'hidden',
    },
    orb: {
        position: 'absolute',
        width: width * 0.9,
        height: width * 0.9,
        borderRadius: width * 0.45,
        backgroundColor: Colors.primary,
        opacity: 0.05,
        top: -width * 0.4,
        right: -width * 0.2,
    },
    header: {
        height: 56,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 28,
        justifyContent: 'center',
        paddingBottom: 40,
    },
    iconBadge: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.primaryDim,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(0,200,150,0.2)',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 10,
        letterSpacing: -0.8,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 22,
        marginBottom: 36,
        fontWeight: '400',
    },
    inputCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceElevated,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        borderColor: Colors.border,
        marginBottom: 16,
        height: 58,
        overflow: 'hidden',
    },
    countrySegment: {
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countryCodeInput: {
        fontSize: 17,
        color: Colors.primary,
        fontWeight: '700',
        textAlign: 'center',
        minWidth: 46,
    },
    dividerLine: {
        width: 1,
        height: 28,
        backgroundColor: Colors.border,
    },
    phoneInput: {
        flex: 1,
        fontSize: 17,
        color: Colors.textPrimary,
        paddingHorizontal: 16,
        fontWeight: '500',
    },
    note: {
        fontSize: 13,
        color: Colors.textTertiary,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 18,
        letterSpacing: 0.1,
    },
    nextButton: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
        elevation: 10,
    },
    nextButtonDisabled: {
        opacity: 0.6,
    },
    nextButtonText: {
        color: Colors.background,
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
});

export default PhoneInputScreen;
