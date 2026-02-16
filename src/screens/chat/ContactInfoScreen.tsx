import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ChatStackParamList, User } from '../../constants/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { userService } from '../../services/userService';
import Avatar from '../../components/common/Avatar';
import SettingsItem from '../../components/settings/SettingsItem';

type RoutePropType = RouteProp<ChatStackParamList, 'ContactInfo'>;

const ContactInfoScreen: React.FC = () => {
    const navigation = useNavigation();
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

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerAction}>
                    <Icon name="ellipsis-vertical" size={22} color={Colors.white} />
                </TouchableOpacity>
            </View>

            <ScrollView>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <Avatar
                        uri={contact.photoURL}
                        name={contact.displayName}
                        size={90}
                        showOnline
                        online={contact.online}
                    />
                    <Text style={styles.name}>{contact.displayName}</Text>
                    <Text style={styles.status}>
                        {contact.online ? 'online' : 'last seen recently'}
                    </Text>
                </View>

                {/* Info Section */}
                <View style={styles.section}>
                    {contact.phoneNumber && (
                        <SettingsItem
                            icon="call-outline"
                            label={contact.phoneNumber}
                            subtitle="Phone"
                            showChevron={false}
                        />
                    )}
                    {contact.bio && (
                        <SettingsItem
                            icon="information-circle-outline"
                            label={contact.bio}
                            subtitle="Bio"
                            showChevron={false}
                        />
                    )}
                </View>

                {/* Actions */}
                <View style={[styles.section, styles.sectionSpaced]}>
                    <SettingsItem
                        icon="notifications-outline"
                        label="Notifications"
                        subtitle="On"
                    />
                    <SettingsItem
                        icon="images-outline"
                        label="Media, Links, and Docs"
                    />
                </View>

                {/* Danger Zone */}
                <View style={[styles.section, styles.sectionSpaced]}>
                    <SettingsItem
                        icon="volume-mute-outline"
                        label="Mute"
                        danger={false}
                    />
                    <SettingsItem
                        icon="ban-outline"
                        label="Block User"
                        danger
                    />
                    <SettingsItem
                        icon="trash-outline"
                        label="Delete Chat"
                        danger
                    />
                </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.headerBg,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 10,
        paddingBottom: 10,
        paddingHorizontal: Spacing.sm,
    },
    backButton: {
        padding: Spacing.sm,
    },
    headerAction: {
        padding: Spacing.sm,
    },
    profileCard: {
        alignItems: 'center',
        backgroundColor: Colors.background,
        paddingVertical: Spacing.xxl,
        marginBottom: Spacing.sm,
    },
    name: {
        ...Typography.h2,
        color: Colors.textPrimary,
        marginTop: Spacing.lg,
    },
    status: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    section: {
        backgroundColor: Colors.background,
        marginBottom: Spacing.sm,
    },
    sectionSpaced: {
        marginTop: Spacing.sm,
    },
});

export default ContactInfoScreen;
