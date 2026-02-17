import React, { useState, useRef } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

interface MessageInputProps {
    onSend: (text: string) => void;
    onAttachPress?: () => void;
    onTyping?: (isTyping: boolean) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
    onSend,
    onAttachPress,
    onTyping,
}) => {
    const [text, setText] = useState('');
    const inputRef = useRef<TextInput>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSend = () => {
        const msg = text.trim();
        if (!msg) return;
        onSend(msg);
        setText('');
        if (onTyping) {
            onTyping(false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }
    };

    const handleTextChange = (val: string) => {
        setText(val);
        if (onTyping) {
            onTyping(true);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                onTyping(false);
            }, 2000);
        }
    };

    const hasText = text.trim().length > 0;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.iconButton}
                onPress={onAttachPress}
                activeOpacity={0.6}>
                <Icon name="attach" size={26} color={Colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.inputWrapper}>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder="Message"
                    placeholderTextColor={Colors.textSecondary}
                    value={text}
                    onChangeText={handleTextChange}
                    multiline
                    maxLength={4096}
                />
                <TouchableOpacity style={styles.emojiButton} activeOpacity={0.6}>
                    <Icon name="happy-outline" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.sendButton, hasText && styles.sendButtonActive]}
                onPress={hasText ? handleSend : undefined}
                activeOpacity={0.6}>
                <Icon
                    name={hasText ? 'send' : 'mic'}
                    size={22}
                    color={Colors.white}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.background,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.divider,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: Colors.inputBg,
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.md,
        paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 0,
        minHeight: 40,
        maxHeight: 120,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.textPrimary,
        paddingVertical: Platform.OS === 'ios' ? 0 : Spacing.sm,
        maxHeight: 100,
    },
    emojiButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: Spacing.xs,
        height: 40,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Spacing.xs,
    },
    sendButtonActive: {
        backgroundColor: Colors.primary,
    },
});

export default MessageInput;
