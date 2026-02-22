import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../store';
import Avatar from '../../components/common/Avatar';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { storageService } from '../../services/storageService';
import { userService } from '../../services/userService';

const ProfileScreen: React.FC = () => {
    const { user, setUser } = useAuthStore();
    const navigation = useNavigation<any>();
    const [isLoading, setIsLoading] = useState(false);

    const handlePickAvatar = async () => {
        if (!user?.id) return;
        try {
            const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, maxWidth: 500, maxHeight: 500 });
            if (result.assets && result.assets[0]?.uri) {
                setIsLoading(true);
                const upload = await storageService.uploadAvatar(user.id, result.assets[0].uri);
                if (upload.blocked) {
                    Alert.alert('Feature Unavailable', 'Image uploads require Firebase Storage (Blaze plan).');
                } else if (upload.url) {
                    await userService.setUser(user.id, { photoURL: upload.url });
                    setUser({ ...user, photoURL: upload.url });
                }
                setIsLoading(false);
            }
        } catch (error) {
            console.warn('Image picker error:', error);
            setIsLoading(false);
        }
    };

    const actionButtons = [
        { icon: 'camera-outline', label: 'Set Photo', onPress: handlePickAvatar },
        { icon: 'pencil-outline', label: 'Edit Info', onPress: () => navigation.navigate('EditProfile') },
        { icon: 'settings-outline', label: 'Settings', onPress: () => navigation.navigate('Settings') },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            {/* Header */}
            <SafeAreaView style={styles.safeHeader}>
                <View style={styles.headerBar}>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerIconBtn}>
                            <Icon name="qr-code-outline" size={21} color={Colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerIconBtn}>
                            <Icon name="ellipsis-horizontal" size={21} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>

                {/* Avatar + name */}
                <View style={styles.profileHero}>
                    <View style={styles.avatarWrapper}>
                        <Avatar uri={user?.photoURL} name={user?.displayName || 'User'} size={86} />
                        <View style={styles.onlineRing} />
                    </View>
                    <Text style={styles.profileName} numberOfLines={1}>
                        {user?.displayName || 'User'}
                    </Text>
                    <View style={styles.statusRow}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineStatus}>online</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    {actionButtons.map((btn) => (
                        <TouchableOpacity
                            key={btn.label}
                            style={styles.actionButton}
                            onPress={btn.onPress}
                            activeOpacity={0.75}>
                            <View style={styles.actionIconContainer}>
                                <Icon name={btn.icon} size={20} color={Colors.primary} />
                            </View>
                            <Text style={styles.actionText}>{btn.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Detail Card */}
                <View style={styles.detailCard}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailIconBg}>
                            <Icon name="call-outline" size={16} color={Colors.primary} />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailValue} numberOfLines={1}>
                                {user?.phoneNumber || 'No number'}
                            </Text>
                            <Text style={styles.detailLabel}>Mobile</Text>
                        </View>
                    </View>
                    {!!user?.bio && (
                        <>
                            <View style={styles.detailSeparator} />
                            <View style={styles.detailRow}>
                                <View style={styles.detailIconBg}>
                                    <Icon name="information-circle-outline" size={16} color={Colors.primary} />
                                </View>
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailValue} numberOfLines={2}>{user.bio}</Text>
                                    <Text style={styles.detailLabel}>Bio</Text>
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* Empty media state */}
                <View style={styles.mediaEmptyCard}>
                    <View style={styles.emptyIconBg}>
                        <Icon name="images-outline" size={28} color={Colors.primary} />
                    </View>
                    <View style={styles.mediaEmptyText}>
                        <Text style={styles.emptyTitle}>No media shared yet</Text>
                        <Text style={styles.emptySubtitle}>Shared photos and videos will appear here</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    safeHeader: {
        backgroundColor: Colors.background,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0,
    },
    headerBar: {
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    headerIconBtn: {
        width: 38,
        height: 38,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },

    scrollContent: { paddingBottom: 32 },

    // Hero — tighter vertical padding
    profileHero: {
        alignItems: 'center',
        paddingTop: 28,
        paddingBottom: 20,
    },
    avatarWrapper: { position: 'relative', marginBottom: 12 },
    onlineRing: {
        position: 'absolute',
        top: -3,
        left: -3,
        right: -3,
        bottom: -3,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: Colors.primary,
        opacity: 0.45,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
        marginBottom: 6,
        maxWidth: '80%',
        textAlign: 'center',
    },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    onlineDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: Colors.primary,
    },
    onlineStatus: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

    // Action buttons row
    actionRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 10,
        marginBottom: 16,
    },
    actionButton: { flex: 1, alignItems: 'center' },
    actionIconContainer: {
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
    actionText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600', letterSpacing: 0.1, textAlign: 'center' },

    // Detail card
    detailCard: {
        backgroundColor: Colors.surface,
        marginHorizontal: 16,
        borderRadius: BorderRadius.lg,
        paddingVertical: 4,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
    detailIconBg: {
        width: 34,
        height: 34,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.primaryDim,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailContent: { flex: 1 },
    detailValue: { fontSize: 15, color: Colors.textPrimary, fontWeight: '600' },
    detailLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 1, fontWeight: '500' },
    detailSeparator: { height: 1, backgroundColor: Colors.divider, marginLeft: 46 },

    // Media empty state — compact inline card, not full-bleed section
    mediaEmptyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        marginHorizontal: 16,
        borderRadius: BorderRadius.lg,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 14,
    },
    emptyIconBg: {
        width: 52,
        height: 52,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.primaryDim,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
        borderWidth: 1,
        borderColor: 'rgba(0,200,150,0.2)',
    },
    mediaEmptyText: { flex: 1 },
    emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3 },
    emptySubtitle: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
});

export default ProfileScreen;
