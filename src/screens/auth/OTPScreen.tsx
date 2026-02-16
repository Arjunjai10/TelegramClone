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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthStackParamList } from '../../constants/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store';
import { authService } from '../../services/authService';

type NavProp = StackNavigationProp<AuthStackParamList, 'OTP'>;
type RoutePropType = RouteProp<AuthStackParamList, 'OTP'>;

const OTP_LENGTH = 6;

const OTPScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute<RoutePropType>();
    const { phoneNumber } = route.params;
    const { checkProfileComplete, confirmationResult, setConfirmationResult } = useAuthStore();

    const [code, setCode] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [activeConfirmation, setActiveConfirmation] = useState(confirmationResult);
    const [isResending, setIsResending] = useState(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const isVerifyingRef = useRef(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((t) => (t > 0 ? t - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Auto-focus next input
        if (text && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-verify when all digits entered
        if (index === OTP_LENGTH - 1 && text) {
            const fullCode = newCode.join('');
            if (fullCode.length === OTP_LENGTH) {
                verifyCode(fullCode);
            }
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
            const newCode = [...code];
            newCode[index - 1] = '';
            setCode(newCode);
        }
    };

    const verifyCode = async (fullCode: string) => {
        if (isVerifyingRef.current) return;
        isVerifyingRef.current = true;
        setIsLoading(true);
        try {
            if (!activeConfirmation) {
                Alert.alert('Session Expired', 'Please resend the verification code.');
                setIsLoading(false);
                isVerifyingRef.current = false;
                return;
            }
            await activeConfirmation.confirm(fullCode);
            const profileComplete = await checkProfileComplete();
            if (!profileComplete) {
                navigation.navigate('ProfileSetup');
            }
            // If profile is complete, AppNavigator will auto-redirect to MainTabs
        } catch (error: any) {
            Alert.alert('Error', 'Invalid verification code. Please try again.');
            setCode(new Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
            isVerifyingRef.current = false;
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            const newConfirmation = await authService.signInWithPhoneNumber(phoneNumber);
            setConfirmationResult(newConfirmation);
            setActiveConfirmation(newConfirmation);
            setTimer(60);
            setCode(new Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
            Alert.alert('Code Sent', 'A new verification code has been sent.');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to resend code. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <Icon name="mail-open" size={36} color={Colors.white} />
                    </View>
                    <Text style={styles.title}>Enter Code</Text>
                    <Text style={styles.subtitle}>
                        We've sent the code to{'\n'}
                        <Text style={styles.phone}>{phoneNumber}</Text>
                    </Text>
                </View>

                {/* OTP Input */}
                <View style={styles.otpContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => { inputRefs.current[index] = ref; }}
                            style={[
                                styles.otpInput,
                                digit ? styles.otpInputFilled : null,
                            ]}
                            value={digit}
                            onChangeText={(text) => handleCodeChange(text, index)}
                            onKeyPress={({ nativeEvent }) =>
                                handleKeyPress(nativeEvent.key, index)
                            }
                            keyboardType="number-pad"
                            maxLength={1}
                            autoFocus={index === 0}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                {isLoading && (
                    <ActivityIndicator
                        size="large"
                        color={Colors.primary}
                        style={styles.loader}
                    />
                )}

                {/* Resend */}
                <View style={styles.resendContainer}>
                    {timer > 0 ? (
                        <Text style={styles.timerText}>
                            Resend code in {timer}s
                        </Text>
                    ) : (
                        <TouchableOpacity onPress={handleResend} disabled={isResending}>
                            {isResending ? (
                                <ActivityIndicator size="small" color={Colors.primary} />
                            ) : (
                                <Text style={styles.resendText}>Resend Code</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
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
        paddingTop: 60,
    },
    backButton: {
        marginBottom: Spacing.xxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxxl,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        ...Typography.h2,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    phone: {
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: Spacing.xxl,
    },
    otpInput: {
        width: 46,
        height: 52,
        borderRadius: BorderRadius.md,
        borderWidth: 2,
        borderColor: Colors.border,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '700',
        color: Colors.textPrimary,
        backgroundColor: Colors.inputBg,
    },
    otpInputFilled: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '10',
    },
    loader: {
        marginBottom: Spacing.lg,
    },
    resendContainer: {
        alignItems: 'center',
    },
    timerText: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    resendText: {
        ...Typography.bodyBold,
        color: Colors.primary,
    },
});

export default OTPScreen;
