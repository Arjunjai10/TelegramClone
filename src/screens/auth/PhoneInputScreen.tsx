import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthStackParamList } from '../../constants/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store';

type NavProp = StackNavigationProp<AuthStackParamList, 'PhoneInput'>;

const PhoneInputScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [isLoading, setIsLoading] = useState(false);

    const handleNext = async () => {
        const fullNumber = `${countryCode}${phoneNumber}`.replace(/\s/g, '');
        if (phoneNumber.length < 10) {
            Alert.alert('Invalid Number', 'Please enter a valid phone number.');
            return;
        }

        setIsLoading(true);
        try {
            const confirmation = await authService.signInWithPhoneNumber(fullNumber);
            useAuthStore.getState().setConfirmationResult(confirmation);
            navigation.navigate('OTP', {
                phoneNumber: fullNumber,
            });
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Icon name="paper-plane" size={40} color={Colors.white} />
                    </View>
                    <Text style={styles.title}>Telegram</Text>
                    <Text style={styles.subtitle}>
                        Please enter your phone number to sign in
                    </Text>
                </View>

                {/* Phone Input */}
                <View style={styles.inputSection}>
                    <View style={styles.countryCodeContainer}>
                        <TextInput
                            style={styles.countryCodeInput}
                            value={countryCode}
                            onChangeText={setCountryCode}
                            keyboardType="phone-pad"
                            maxLength={4}
                        />
                    </View>
                    <View style={styles.phoneInputContainer}>
                        <TextInput
                            style={styles.phoneInput}
                            placeholder="Phone number"
                            placeholderTextColor={Colors.textSecondary}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            maxLength={15}
                            autoFocus
                        />
                    </View>
                </View>

                <Text style={styles.note}>
                    We will send you an SMS with a verification code.
                </Text>

                {/* Next Button */}
                <TouchableOpacity
                    style={[styles.nextButton, isLoading && styles.nextButtonDisabled]}
                    onPress={handleNext}
                    disabled={isLoading}
                    activeOpacity={0.8}>
                    {isLoading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.nextButtonText}>NEXT</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.xxl,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xxxl + 8,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        ...Typography.h1,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    inputSection: {
        flexDirection: 'row',
        marginBottom: Spacing.lg,
    },
    countryCodeContainer: {
        width: 70,
        marginRight: Spacing.sm,
    },
    countryCodeInput: {
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary,
        paddingVertical: Spacing.md,
        fontSize: 18,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    phoneInputContainer: {
        flex: 1,
    },
    phoneInput: {
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary,
        paddingVertical: Spacing.md,
        fontSize: 18,
        color: Colors.textPrimary,
    },
    note: {
        ...Typography.caption,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xxl,
        lineHeight: 18,
    },
    nextButton: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
    },
    nextButtonDisabled: {
        opacity: 0.6,
    },
    nextButtonText: {
        ...Typography.button,
        color: Colors.white,
    },
});

export default PhoneInputScreen;
