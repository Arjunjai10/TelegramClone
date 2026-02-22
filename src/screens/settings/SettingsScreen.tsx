import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    StatusBar,
    Dimensions,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../store';
import Avatar from '../../components/common/Avatar';
import SettingsItem from '../../components/settings/SettingsItem';
import { launchImageLibrary } from 'react-native-image-picker';
import { storageService } from '../../services/storageService';
import { userService } from '../../services/userService';

const { width } = Dimensions.get('window');

interface SettingsSection {
    icon: string;
    label: string;
    subtitle?: string;
    iconColor: string;
    onPress?: () => void;
    badge?: string;
}

const SettingsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { user, signOut } = useAuthStore();

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => { await signOut(); },
            },
        ]);
    };

    const handleChangeAvatar = async () => {
        try {
            const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
            if (result.assets && result.assets[0]?.uri && user?.id) {
                const upload = await storageService.uploadAvatar(user.id, result.assets[0].uri);
                if (upload.blocked) {
                    Alert.alert('Feature Unavailable', 'Image uploads require Firebase Storage (Blaze plan).');
                } else if (upload.url) {
                    await userService.setUser(user.id, { photoURL: upload.url });
                    useAuthStore.getState().setUser({ ...user, photoURL: upload.url });
                }
            }
        } catch { }
    };

    const accountItems: SettingsSection[] = [
        {
            icon: 'person-outline',
            label: 'Edit Profile',
            subtitle: 'Name, bio, username',
            iconColor: Colors.primary,
            onPress: () => navigation.navigate('EditProfile'),
        },
        {
            icon: 'notifications-outline',
            label: 'Notifications',
            subtitle: 'Sounds, vibration, badges',
            iconColor: '#FF6B6B',
            onPress: () => navigation.navigate('Notifications'),
        },
        {
            icon: 'shield-checkmark-outline',
            label: 'Privacy & Security',
            subtitle: 'Last seen, blocked users',
            iconColor: '#4ECDC4',
            onPress: () => navigation.navigate('PrivacySecurity'),
        },
    ];

    const appItems: SettingsSection[] = [
        {
            icon: 'chatbubble-outline',
            label: 'Chat Settings',
            subtitle: 'Wallpaper, font size',
            iconColor: Colors.gold,
            onPress: () => navigation.navigate('ChatSettings'),
        },
        {
            icon: 'server-outline',
            label: 'Data & Storage',
            subtitle: 'Auto-download, cache',
            iconColor: '#BB8FCE',
            onPress: () => navigation.navigate('DataStorage'),
        },
        {
            icon: 'language-outline',
            label: 'Language',
            subtitle: 'English',
            iconColor: '#5B9BD5',
            onPress: () => navigation.navigate('Language'),
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
                <TouchableOpacity style={styles.headerIcon}>
                    <Icon name="ellipsis-horizontal" size={21} color={Colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Profile Card */}
                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={() => navigation.navigate('EditProfile')}
                    activeOpacity={0.75}>
                    {/* Ambient glow */}
                    <View style={styles.cardGlow} />

                    <View style={styles.avatarWrapper}>
                        <Avatar uri={user?.photoURL} name={user?.displayName || 'User'} size={72} />
                        <TouchableOpacity style={styles.cameraButton} onPress={handleChangeAvatar}>
                            <Icon name="camera" size={14} color={Colors.background} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName} numberOfLines={1}>
                            {user?.displayName || 'Your Name'}
                        </Text>
                        {!!user?.phoneNumber && (
                            <Text style={styles.profilePhone}>{user.phoneNumber}</Text>
                        )}
                        {!!user?.bio && (
                            <Text style={styles.profileBio} numberOfLines={2}>{user.bio}</Text>
                        )}
                    </View>

                    <Icon name="chevron-forward" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>

                {/* Account Section */}
                <Text style={styles.sectionLabel}>ACCOUNT</Text>
                <View style={styles.menuCard}>
                    {accountItems.map((item, i) => (
                        <React.Fragment key={item.label}>
                            <SettingsItem
                                icon={item.icon}
                                label={item.label}
                                subtitle={item.subtitle}
                                iconColor={item.iconColor}
                                onPress={item.onPress}
                            />
                            {i < accountItems.length - 1 && <View style={styles.divider} />}
                        </React.Fragment>
                    ))}
                </View>

                {/* App Section */}
                <Text style={styles.sectionLabel}>APP</Text>
                <View style={styles.menuCard}>
                    {appItems.map((item, i) => (
                        <React.Fragment key={item.label}>
                            <SettingsItem
                                icon={item.icon}
                                label={item.label}
                                subtitle={item.subtitle}
                                iconColor={item.iconColor}
                                onPress={item.onPress}
                            />
                            {i < appItems.length - 1 && <View style={styles.divider} />}
                        </React.Fragment>
                    ))}
                </View>

                {/* Sign Out */}
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.8}>
                    <Icon name="log-out-outline" size={18} color={Colors.danger} />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>

                {/* Version */}
                <Text style={styles.version}>TelegramClone v1.0</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    header: {
        height: Platform.OS === 'ios' ? 88 : 56 + (StatusBar.currentHeight || 24),
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    headerIcon: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },

    scrollContent: {
        paddingTop: 20,
        paddingBottom: 52,
    },

    // Profile card
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: 18,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 28,
        overflow: 'hidden',
    },
    cardGlow: {
        position: 'absolute',
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        backgroundColor: Colors.primary,
        opacity: 0.04,
        top: -width * 0.15,
        left: -width * 0.1,
    },
    avatarWrapper: { position: 'relative' },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.surface,
    },
    profileInfo: {
        flex: 1,
        marginLeft: 14,
    },
    profileName: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: -0.3,
        marginBottom: 3,
    },
    profilePhone: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    profileBio: {
        fontSize: 12,
        color: Colors.textTertiary,
        lineHeight: 17,
        marginTop: 2,
    },

    // Section labels
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textTertiary,
        letterSpacing: 1.2,
        paddingHorizontal: 28,
        marginBottom: 8,
    },

    // Menu card
    menuCard: {
        backgroundColor: Colors.surface,
        marginHorizontal: 16,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 28,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.divider,
        marginLeft: 56,
    },

    // Sign out
    signOutButton: {
        marginHorizontal: 16,
        height: 50,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.dangerDim,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,71,87,0.2)',
        marginBottom: 20,
    },
    signOutText: { color: Colors.danger, fontSize: 15, fontWeight: '700' },

    version: {
        textAlign: 'center',
        fontSize: 11,
        color: Colors.textTertiary,
        letterSpacing: 0.3,
    },
});

export default SettingsScreen;
