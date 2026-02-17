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
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../store';
import Avatar from '../../components/common/Avatar';
import SettingsItem from '../../components/settings/SettingsItem';

const SettingsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Icon name="search" size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Icon name="ellipsis-vertical" size={24} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Banner */}
                <View style={styles.profileBanner}>
                    <View style={styles.avatarContainer}>
                        <Avatar
                            uri={user?.photoURL}
                            name={user?.displayName || 'User'}
                            size={100}
                        />
                        <TouchableOpacity style={styles.cameraButton}>
                            <Icon name="camera" size={20} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.profileName}>{user?.displayName || 'Rick Grimes'}</Text>
                    <Text style={styles.profilePhone}>{user?.phoneNumber || '+91 9345999936'}</Text>
                </View>

                {/* Number Confirmation Box */}
                <View style={styles.confirmationBox}>
                    <Text style={styles.confirmationTitle}>Is {user?.phoneNumber || '+91 9345999936'} still your number?</Text>
                    <Text style={styles.confirmationSubtitle}>
                        Keep your number up to date to ensure you can always log into Telegram. <Text style={styles.linkText}>Learn more</Text>
                    </Text>
                    <View style={styles.confirmationButtons}>
                        <TouchableOpacity style={[styles.confirmButton, styles.confirmButtonNo]}>
                            <Text style={styles.confirmButtonText}>No</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.confirmButton, styles.confirmButtonYes]}>
                            <Icon name="thumbs-up" size={18} color={Colors.white} style={{ marginRight: 8 }} />
                            <Text style={styles.confirmButtonText}>Yes</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Settings Menu */}
                <View style={styles.menuContainer}>
                    <SettingsItem
                        icon="person"
                        label="Account"
                        subtitle="Number, Username, Bio"
                        iconColor="#2AABEE"
                    />
                    <SettingsItem
                        icon="chatbubble"
                        label="Chat Settings"
                        subtitle="Wallpaper, Night Mode, Animations"
                        iconColor="#FFC107"
                    />
                    <SettingsItem
                        icon="shield-checkmark"
                        label="Privacy & Security"
                        subtitle="Last Seen, Devices, Passkeys"
                        iconColor="#4CAF50"
                    />
                    <SettingsItem
                        icon="notifications"
                        label="Notifications"
                        subtitle="Sounds, Calls, Badges"
                        iconColor="#F44336"
                    />
                    <SettingsItem
                        icon="server"
                        label="Data and Storage"
                        subtitle="Media download settings"
                        iconColor="#03A9F4"
                    />
                    <SettingsItem
                        icon="copy" // Using copy as a placeholder for Chat Folders
                        label="Chat Folders"
                        iconColor="#3F51B5"
                    />
                </View>

                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    headerRight: {
        flexDirection: 'row',
    },
    headerIcon: {
        marginLeft: 20,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    profileBanner: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Colors.background,
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.white,
    },
    profilePhone: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    confirmationBox: {
        backgroundColor: Colors.surface,
        margin: 16,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    confirmationTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: Colors.white,
        textAlign: 'center',
    },
    confirmationSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 20,
    },
    linkText: {
        color: Colors.primary,
    },
    confirmationButtons: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 12,
    },
    confirmButton: {
        flex: 1,
        height: 48,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonNo: {
        backgroundColor: '#1C2A36', // Lighter grey/blue for No
    },
    confirmButtonYes: {
        backgroundColor: Colors.primary,
    },
    confirmButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    menuContainer: {
        backgroundColor: Colors.surface,
        marginHorizontal: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    signOutButton: {
        marginTop: 24,
        marginHorizontal: 16,
        height: 48,
        borderRadius: 12,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signOutText: {
        color: Colors.danger,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SettingsScreen;
