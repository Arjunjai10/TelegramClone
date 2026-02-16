import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import Avatar from '../common/Avatar';
import { Chat } from '../../constants/types';
import { Colors, Typography, Spacing } from '../../constants/theme';

interface ChatListItemProps {
    chat: Chat;
    onPress: () => void;
    onLongPress?: () => void;
}

const formatTime = (timestamp: any): string => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date)) return format(date, 'EEE');
    return format(date, 'dd/MM/yy');
};

const ChatListItem: React.FC<ChatListItemProps> = ({
    chat,
    onPress,
    onLongPress,
}) => {
    const otherUser = chat.otherUser;
    const lastMsg = chat.lastMessage;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.6}>
            <Avatar
                uri={otherUser?.photoURL}
                name={otherUser?.displayName || 'User'}
                size={52}
                showOnline
                online={otherUser?.online || false}
            />
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={styles.name} numberOfLines={1}>
                        {otherUser?.displayName || 'Unknown'}
                    </Text>
                    <Text style={styles.time}>
                        {lastMsg?.timestamp ? formatTime(lastMsg.timestamp) : ''}
                    </Text>
                </View>
                <View style={styles.bottomRow}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {lastMsg?.text || 'Start a conversation'}
                    </Text>
                    {chat.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadCount}>
                                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        marginLeft: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.divider,
        paddingBottom: Spacing.md,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
        flex: 1,
        marginRight: Spacing.sm,
    },
    time: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        ...Typography.caption,
        color: Colors.textSecondary,
        flex: 1,
        marginRight: Spacing.sm,
        fontSize: 14,
    },
    unreadBadge: {
        backgroundColor: Colors.badge,
        borderRadius: 12,
        minWidth: 22,
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadCount: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '700',
    },
});

export default ChatListItem;
