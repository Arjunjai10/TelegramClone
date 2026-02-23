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
import { Colors, BorderRadius } from '../../constants/theme';

interface ChatListItemProps {
    chat: Chat;
    isPinned?: boolean;
    isMuted?: boolean;
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

const ChatListItem: React.FC<ChatListItemProps> = ({ chat, isPinned, isMuted, onPress, onLongPress }) => {
    const otherUser = chat.otherUser;
    const lastMsg = chat.lastMessage;
    // Fallback if not explicitly passed
    const _isPinned = isPinned ?? false;
    const hasUnread = chat.unreadCount > 0;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.65}>
            <Avatar
                uri={otherUser?.photoURL}
                name={otherUser?.displayName || 'User'}
                size={52}
                showOnline={otherUser?.online}
                online={otherUser?.online}
            />
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.name} numberOfLines={1}>
                            {otherUser?.displayName || 'Unknown'}
                        </Text>
                        {(otherUser?.id === 'bot' || isMuted) && (
                            <Icon name="volume-mute" size={13} color={Colors.textTertiary} style={styles.mutedIcon} />
                        )}
                    </View>
                    <View style={styles.timeContainer}>
                        {_isPinned && (
                            <Icon
                                name="pin"
                                size={12}
                                color={Colors.textTertiary}
                                style={{ marginRight: 5, transform: [{ rotate: '45deg' }] }}
                            />
                        )}
                        <Text style={[styles.time, hasUnread && styles.timeUnread]}>
                            {lastMsg?.timestamp ? formatTime(lastMsg.timestamp) : ''}
                        </Text>
                    </View>
                </View>
                <View style={styles.bottomRow}>
                    <Text style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]} numberOfLines={1}>
                        {lastMsg?.text || 'Start a conversation'}
                    </Text>
                    {hasUnread && (
                        <View style={[styles.unreadBadge, chat.unreadCount > 1000 && styles.unreadBadgeMuted]}>
                            <Text style={styles.unreadCount}>
                                {chat.unreadCount > 999 ? '999+' : chat.unreadCount}
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
        paddingHorizontal: 18,
        paddingVertical: 11,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    content: {
        flex: 1,
        marginLeft: 14,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginRight: 4,
        letterSpacing: -0.2,
    },
    mutedIcon: { marginLeft: 3 },
    timeContainer: { flexDirection: 'row', alignItems: 'center' },
    time: {
        fontSize: 12,
        color: Colors.textTertiary,
        fontWeight: '500',
    },
    timeUnread: { color: Colors.gold, fontWeight: '600' },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 14,
        color: Colors.textSecondary,
        flex: 1,
        marginRight: 8,
        fontWeight: '400',
    },
    lastMessageUnread: {
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    unreadBadge: {
        backgroundColor: Colors.gold,
        borderRadius: BorderRadius.full,
        minWidth: 22,
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 7,
        shadowColor: Colors.gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 4,
    },
    unreadBadgeMuted: { backgroundColor: Colors.badgeMuted, shadowOpacity: 0 },
    unreadCount: { color: Colors.background, fontSize: 11, fontWeight: '800' },
});

export default ChatListItem;
