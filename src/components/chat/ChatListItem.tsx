import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import Icon from 'react-native-vector-icons/Ionicons';
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
    const isPinned = chat.participants.length > 5; // Placeholder logic for pinning

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.6}>
            <Avatar
                uri={otherUser?.photoURL}
                name={otherUser?.displayName || 'User'}
                size={54}
                showOnline={otherUser?.online}
            />
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.name} numberOfLines={1}>
                            {otherUser?.displayName || 'Unknown'}
                        </Text>
                        {otherUser?.id === 'bot' && (
                            <Icon name="volume-mute" size={14} color={Colors.textSecondary} style={styles.mutedIcon} />
                        )}
                    </View>
                    <View style={styles.timeContainer}>
                        {isPinned && (
                            <Icon name="pin" size={14} color={Colors.pinned} style={styles.pinnedIcon} />
                        )}
                        <Text style={styles.time}>
                            {lastMsg?.timestamp ? formatTime(lastMsg.timestamp) : ''}
                        </Text>
                    </View>
                </View>
                <View style={styles.bottomRow}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {lastMsg?.text || 'Start a conversation'}
                    </Text>
                    {chat.unreadCount > 0 && (
                        <View style={[styles.unreadBadge, chat.unreadCount > 1000 && styles.unreadBadgeMuted]}>
                            <Text style={styles.unreadCount}>
                                {chat.unreadCount > 999 ? chat.unreadCount : chat.unreadCount}
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
        paddingVertical: 12,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        marginLeft: 14,
        paddingBottom: 4,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    name: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginRight: 4,
    },
    mutedIcon: {
        marginLeft: 4,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pinnedIcon: {
        marginRight: 6,
        transform: [{ rotate: '45deg' }],
    },
    time: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 15,
        color: Colors.textSecondary,
        flex: 1,
        marginRight: Spacing.sm,
    },
    unreadBadge: {
        backgroundColor: Colors.badge,
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    unreadBadgeMuted: {
        backgroundColor: Colors.badgeMuted,
    },
    unreadCount: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default ChatListItem;
