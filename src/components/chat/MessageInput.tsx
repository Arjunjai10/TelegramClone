import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

interface MessageInputProps {
    onSend: (text: string) => void;
    onAttachPress?: () => void;
    onTyping?: (isTyping: boolean) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, onAttachPress, onTyping }) => {
    const [text, setText] = useState('');
    const inputRef = useRef<TextInput>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Animations
    const sendScale = useRef(new Animated.Value(1)).current;
    const iconFadeText = useRef(new Animated.Value(0)).current;

    const hasText = text.trim().length > 0;

    // Sync icon fade with hasText
    useEffect(() => {
        Animated.timing(iconFadeText, {
            toValue: hasText ? 1 : 0,
            duration: 180,
            useNativeDriver: true,
        }).start();
    }, [hasText]);

    const handleSend = () => {
        const msg = text.trim();
        if (!msg) return;

        // Spring press animation
        Animated.sequence([
            Animated.timing(sendScale, { toValue: 0.88, duration: 70, useNativeDriver: true }),
            Animated.spring(sendScale, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();

        onSend(msg);
        setText('');
        if (onTyping) {
            onTyping(false);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }
    };

    const handleTextChange = (val: string) => {
        setText(val);
        if (onTyping) {
            onTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => onTyping(false), 2000);
        }
    };

    const micOpacity = iconFadeText.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
    const sendOpacity = iconFadeText.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.iconButton} onPress={onAttachPress} activeOpacity={0.6}>
                <Icon name="add" size={26} color={Colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.inputWrapper}>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder="Message"
                    placeholderTextColor={Colors.textTertiary}
                    value={text}
                    onChangeText={handleTextChange}
                    multiline
                    maxLength={4096}
                    selectionColor={Colors.primary}
                />
                <TouchableOpacity style={styles.emojiButton} activeOpacity={0.6}>
                    <Icon name="happy-outline" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <Animated.View style={{ transform: [{ scale: sendScale }] }}>
                <TouchableOpacity
                    style={styles.sendButtonInner}
                    onPress={hasText ? handleSend : undefined}
                    activeOpacity={0.75}>
                    {/* Mic icon — fades out when typing */}
                    <Animated.View style={[StyleSheet.absoluteFill, styles.iconAbsolute, { opacity: micOpacity }]}>
                        <Icon name="mic" size={20} color={Colors.background} />
                    </Animated.View>
                    {/* Send icon — fades in when has text */}
                    <Animated.View style={[StyleSheet.absoluteFill, styles.iconAbsolute, { opacity: sendOpacity }]}>
                        <Icon name="send" size={18} color={Colors.background} />
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
        gap: 8,
    },
    iconButton: {
        width: 42,
        height: 42,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surfaceElevated,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: Colors.surfaceElevated,
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.md,
        paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 4,
        minHeight: 42,
        maxHeight: 120,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    input: {
        flex: 1,
        fontSize: 15.5,
        color: Colors.textPrimary,
        paddingVertical: Platform.OS === 'ios' ? 0 : 6,
        maxHeight: 100,
        fontWeight: '400',
    },
    emojiButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: Spacing.xs,
        height: 36,
    },
    sendButtonInner: {
        width: 42,
        height: 42,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
    },
    iconAbsolute: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MessageInput;
