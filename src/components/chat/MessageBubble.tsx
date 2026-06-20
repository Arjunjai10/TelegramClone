import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Message } from '../../constants/types';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { format } from 'date-fns';
import { useSettingsStore } from '../../store';

interface MessageBubbleProps {
    message: Message;
    isMine: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMine }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const { chat: chatSettings } = useSettingsStore();
    const fontSize = parseInt(chatSettings.textSize || '16', 10);

    const timestamp = message.createdAt?.toDate
        ? format(message.createdAt.toDate(), 'HH:mm')
        : '';

    return (
        <View style={[styles.wrapper, isMine ? styles.wrapperMine : styles.wrapperTheirs]}>
            <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                {message.type === 'image' && message.imageURL && (
                    <View style={styles.imageContainer}>
                        {!imageError ? (
                            <>
                                <Image
                                    source={{ uri: message.imageURL }}
                                    style={styles.image}
                                    resizeMode="cover"
                                    onLoad={() => setImageLoading(false)}
                                    onError={() => { setImageLoading(false); setImageError(true); }}
                                />
                                {imageLoading && (
                                    <View style={styles.imageLoadingOverlay}>
                                        <ActivityIndicator size="small" color={Colors.primary} />
                                    </View>
                                )}
                            </>
                        ) : (
                            <View style={styles.imageErrorContainer}>
                                <Icon name="image-outline" size={32} color={Colors.textSecondary} />
                                <Text style={styles.imageErrorText}>Image unavailable</Text>
                            </View>
                        )}
                    </View>
                )}
                {message.text ? (
                    <Text style={[styles.text, isMine ? styles.textMine : styles.textTheirs, { fontSize }]}>
                        {message.text}
                    </Text>
                ) : null}
                <View style={styles.meta}>
                    <Text style={[styles.time, isMine ? styles.timeMine : styles.timeTheirs]}>
                        {timestamp}
                    </Text>
                    {isMine && (
                        <Icon
                            name={message.read ? 'checkmark-done' : 'checkmark'}
                            size={15}
                            color={message.read ? Colors.primary : Colors.timestampSent}
                            style={styles.checkIcon}
                        />
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginVertical: 2,
        paddingHorizontal: Spacing.sm,
    },
    wrapperMine: { alignItems: 'flex-end' },
    wrapperTheirs: { alignItems: 'flex-start' },
    bubble: {
        maxWidth: '78%',
        paddingHorizontal: 13,
        paddingTop: 9,
        paddingBottom: 6,
        borderRadius: BorderRadius.lg,
    },
    bubbleMine: {
        backgroundColor: Colors.sentBubble,
        borderBottomRightRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(0, 200, 150, 0.12)',
    },
    bubbleTheirs: {
        backgroundColor: Colors.receivedBubble,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    text: { lineHeight: 21, letterSpacing: 0.1, fontWeight: '400' },
    textMine: { color: Colors.sentBubbleText },
    textTheirs: { color: Colors.receivedBubbleText },
    meta: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 4,
        gap: 3,
    },
    time: { fontSize: 11, fontWeight: '500' },
    timeMine: { color: Colors.timestampSent },
    timeTheirs: { color: Colors.textTertiary },
    checkIcon: {},
    imageContainer: {
        position: 'relative',
        marginBottom: Spacing.xs,
    },
    image: {
        width: 220,
        height: 220,
        borderRadius: BorderRadius.md,
    },
    imageLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageErrorContainer: {
        width: 220,
        height: 120,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.surfaceElevated,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    imageErrorText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
});

export default React.memo(MessageBubble);
