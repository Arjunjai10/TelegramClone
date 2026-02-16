import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/theme';
import { useAuthStore } from '../../store';
import Avatar from '../../components/common/Avatar';
import SettingsItem from '../../components/settings/SettingsItem';

const SettingsScreen: React.FC = () => {
    const navigation = useNavigation();
    const { user, signOut } = useAuthStore();

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                    },
                },
            ],
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView>
                {/* Profile Card */}
                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={() => (navigation as any).navigate('EditProfile')}
                    activeOpacity={0.7}>
                    <Avatar
                        uri={user?.photoURL}
                        name={user?.displayName || 'User'}
                        size={64}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>
                            {user?.displayName || 'User'}
                        </Text>
                        <Text style={styles.profilePhone}>
                            {user?.phoneNumber || ''}
                        </Text>
                    </View>
                    <View style={styles.editIcon}>
                        <Text style={styles.editIconText}>›</Text>
                    </View>
                </TouchableOpacity>

                {/* Account Section */}
                <View style={styles.sectionWrapper}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.section}>
                        <SettingsItem
                            icon="person-outline"
                            label="Edit Profile"
                            onPress={() => (navigation as any).navigate('EditProfile')}
                        />
                        <SettingsItem
                            icon="shield-checkmark-outline"
                            label="Privacy and Security"
                            iconColor="#7C4DFF"
                        />
                        <SettingsItem
                            icon="notifications-outline"
                            label="Notifications and Sounds"
                            iconColor="#FF6D00"
                        />
                        <SettingsItem
                            icon="server-outline"
                            label="Data and Storage"
                            iconColor="#00BFA5"
                        />
                    </View>
                </View>

                {/* Preferences */}
                <View style={styles.sectionWrapper}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <View style={styles.section}>
                        <SettingsItem
                            icon="chatbubble-ellipses-outline"
                            label="Chat Settings"
                            iconColor="#0091EA"
                        />
                        <SettingsItem
                            icon="color-palette-outline"
                            label="Appearance"
                            iconColor="#AB47BC"
                        />
                        <SettingsItem
                            icon="language-outline"
                            label="Language"
                            subtitle="English"
                            iconColor="#26A69A"
                        />
                    </View>
                </View>

                {/* Help */}
                <View style={styles.sectionWrapper}>
                    <Text style={styles.sectionTitle}>Help</Text>
                    <View style={styles.section}>
                        <SettingsItem
                            icon="help-circle-outline"
                            label="Ask a Question"
                            iconColor="#FF8F00"
                        />
                        <SettingsItem
                            icon="chatbox-outline"
                            label="Telegram FAQ"
                            iconColor="#00897B"
                        />
                    </View>
                </View>

                {/* Sign Out */}
                <View style={[styles.sectionWrapper, { marginBottom: 40 }]}>
                    <View style={styles.section}>
                        <SettingsItem
                            icon="log-out-outline"
                            label="Sign Out"
                            danger
                            showChevron={false}
                            onPress={handleSignOut}
                        />
                    </View>
                </View>

                {/* Version */}
                <Text style={styles.version}>Telegram Clone v1.0.0</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surfaceLight,
    },
    header: {
        backgroundColor: Colors.headerBg,
        paddingHorizontal: Spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 10,
        paddingBottom: Spacing.lg,
    },
    headerTitle: {
        ...Typography.h2,
        color: Colors.white,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: Spacing.lg,
        marginBottom: Spacing.sm,
        ...Shadows.sm,
    },
    profileInfo: {
        flex: 1,
        marginLeft: Spacing.lg,
    },
    profileName: {
        ...Typography.h3,
        color: Colors.textPrimary,
    },
    profilePhone: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    editIcon: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editIconText: {
        fontSize: 22,
        color: Colors.textSecondary,
        fontWeight: '300',
    },
    sectionWrapper: {
        marginTop: Spacing.sm,
    },
    sectionTitle: {
        ...Typography.caption,
        color: Colors.primary,
        fontWeight: '700',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        backgroundColor: Colors.background,
    },
    version: {
        ...Typography.caption,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingBottom: 30,
        marginTop: -20,
    },
});

export default SettingsScreen;
