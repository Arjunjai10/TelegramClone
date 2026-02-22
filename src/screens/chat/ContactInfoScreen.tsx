import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
    Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ChatStackParamList, User } from '../../constants/types';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { userService } from '../../services/userService';
import Avatar from '../../components/common/Avatar';

type RoutePropType = RouteProp<ChatStackParamList, 'ContactInfo'>;

const InfoRow: React.FC<{
    icon: string;
    value: string;
    label: string;
    last?: boolean;
}> = ({ icon, value, label, last }) => (
    <>
        <View style={infoStyles.row}>
            <View style={infoStyles.iconBg}>
                <Icon name={icon} size={16} color={Colors.primary} />
            </View>
            <View style={infoStyles.content}>
                <Text style={infoStyles.value} numberOfLines={2}>{value}</Text>
                <Text style={infoStyles.label}>{label}</Text>
            </View>
        </View>
        {!last && <View style={infoStyles.separator} />}
    </>
);

const infoStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
    iconBg: {
        width: 34,
        height: 34,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.primaryDim,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: { flex: 1 },
    value: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
    label: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
    separator: { height: 1, backgroundColor: Colors.divider, marginLeft: 46 },
});

const ContactInfoScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<RoutePropType>();
    const { userId } = route.params;
    const [contact, setContact] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = userService.onUserChanged(userId, (user) => {
            setContact(user);
        });
        return () => unsubscribe();
    }, [userId]);

    if (!contact) return null;

    const infoRows: { icon: string; value: string; label: string }[] = [
        ...(contact.phoneNumber ? [{ icon: 'call-outline', value: contact.phoneNumber, label: 'Phone' }] : []),
        ...(contact.bio ? [{ icon: 'information-circle-outline', value: contact.bio, label: 'Bio' }] : []),
    ];

    const statusText = contact.online ? 'online' : 'last seen recently';

    const handleBlock = () => {
        Alert.alert('Block User', `Block ${contact.displayName}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Block', style: 'destructive', onPress: () => navigation.goBack() },
        ]);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.surface} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                    <Icon name="chevron-back" size={26} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Contact Info</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <Icon name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>

                {/* Profile hero */}
                <View style={styles.profileHero}>
                    <Avatar
                        uri={contact.photoURL}
                        name={contact.displayName}
                        size={80}
                        showOnline
                        online={contact.online}
                    />
                    <Text style={styles.name} numberOfLines={1}>{contact.displayName}</Text>
                    <Text style={[styles.status, contact.online && styles.statusOnline]}>
                        {statusText}
                    </Text>
                </View>

                {/* Quick actions */}
                <View style={styles.quickActions}>
                    {[
                        { icon: 'chatbubble-outline', label: 'Message' },
                        { icon: 'call-outline', label: 'Call' },
                        { icon: 'videocam-outline', label: 'Video' },
                    ].map((a) => (
                        <TouchableOpacity key={a.label} style={styles.quickBtn} activeOpacity={0.75}>
                            <View style={styles.quickIconBg}>
                                <Icon name={a.icon} size={20} color={Colors.primary} />
                            </View>
                            <Text style={styles.quickLabel}>{a.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Info card */}
                {infoRows.length > 0 && (
                    <View style={styles.card}>
                        {infoRows.map((row, i) => (
                            <InfoRow
                                key={row.label}
                                icon={row.icon}
                                value={row.value}
                                label={row.label}
                                last={i === infoRows.length - 1}
                            />
                        ))}
                    </View>
                )}

                {/* Actions card */}
                <View style={styles.card}>
                    {[
                        { icon: 'notifications-outline', label: 'Notifications', color: Colors.textPrimary },
                        { icon: 'images-outline', label: 'Media & Files', color: Colors.textPrimary },
                        { icon: 'search-outline', label: 'Search in Chat', color: Colors.textPrimary },
                    ].map((item, i, arr) => (
                        <React.Fragment key={item.label}>
                            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
                                <View style={styles.actionIconBg}>
                                    <Icon name={item.icon} size={16} color={Colors.primary} />
                                </View>
                                <Text style={[styles.actionLabel, { color: item.color }]}>{item.label}</Text>
                                <Icon name="chevron-forward" size={16} color={Colors.textTertiary} />
                            </TouchableOpacity>
                            {i < arr.length - 1 && <View style={styles.rowDivider} />}
                        </React.Fragment>
                    ))}
                </View>

                {/* Danger card */}
                <View style={styles.card}>
                    {[
                        { icon: 'volume-mute-outline', label: 'Mute', danger: false },
                        { icon: 'ban-outline', label: 'Block User', danger: true, onPress: handleBlock },
                        { icon: 'trash-outline', label: 'Delete Chat', danger: true },
                    ].map((item, i, arr) => (
                        <React.Fragment key={item.label}>
                            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={item.onPress}>
                                <View style={[styles.actionIconBg, item.danger && styles.dangerIconBg]}>
                                    <Icon name={item.icon} size={16} color={item.danger ? Colors.danger : Colors.primary} />
                                </View>
                                <Text style={[styles.actionLabel, item.danger && styles.dangerLabel]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                            {i < arr.length - 1 && <View style={styles.rowDivider} />}
                        </React.Fragment>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 8,
        paddingBottom: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    headerBtn: {
        width: 42,
        height: 42,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 17,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: -0.3,
    },

    scrollContent: { paddingBottom: 32, paddingTop: 8 },

    // Profile hero — compact
    profileHero: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
    },
    name: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
        marginTop: 12,
        marginBottom: 5,
        maxWidth: '85%',
        textAlign: 'center',
    },
    status: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
    statusOnline: { color: Colors.primary, fontWeight: '600' },

    // Quick actions
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    quickBtn: { alignItems: 'center', flex: 1 },
    quickIconBg: {
        width: '100%',
        height: 50,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    quickLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },

    // Cards
    card: {
        backgroundColor: Colors.surface,
        marginHorizontal: 16,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: 16,
        paddingVertical: 4,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    // Action rows inside cards
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
    },
    actionIconBg: {
        width: 34,
        height: 34,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.primaryDim,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dangerIconBg: { backgroundColor: Colors.dangerDim },
    actionLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    dangerLabel: { color: Colors.danger },
    rowDivider: { height: 1, backgroundColor: Colors.divider, marginLeft: 46 },
});

export default ContactInfoScreen;
