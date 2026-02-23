import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useSettingsStore, useChatStore } from '../../store';
import { notificationService } from '../../services/notificationService';

const NotificationsScreen: React.FC = () => {
    const navigation = useNavigation();
    const { notifications, updateNotifications } = useSettingsStore();
    const { chats } = useChatStore();

    // Notification state
    const {
        privateChats, groupChats, channels,
        inAppSounds, inAppVibrate, inAppPreview,
        badgeAppIcon
    } = notifications;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.headerButton} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>MESSAGE NOTIFICATIONS</Text>
                <View style={styles.sectionContainer}>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Private Chats</Text>
                        <Switch value={privateChats} onValueChange={(val) => updateNotifications({ privateChats: val })} trackColor={{ false: Colors.border, true: Colors.primary }} />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Group Chats</Text>
                        <Switch value={groupChats} onValueChange={(val) => updateNotifications({ groupChats: val })} trackColor={{ false: Colors.border, true: Colors.primary }} />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Channels</Text>
                        <Switch value={channels} onValueChange={(val) => updateNotifications({ channels: val })} trackColor={{ false: Colors.border, true: Colors.primary }} />
                    </View>
                </View>

                <Text style={styles.sectionTitle}>IN-APP NOTIFICATIONS</Text>
                <View style={styles.sectionContainer}>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>In-App Sounds</Text>
                        <Switch value={inAppSounds} onValueChange={(val) => updateNotifications({ inAppSounds: val })} trackColor={{ false: Colors.border, true: Colors.primary }} />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>In-App Vibrate</Text>
                        <Switch value={inAppVibrate} onValueChange={(val) => updateNotifications({ inAppVibrate: val })} trackColor={{ false: Colors.border, true: Colors.primary }} />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>In-App Preview</Text>
                        <Switch value={inAppPreview} onValueChange={(val) => updateNotifications({ inAppPreview: val })} trackColor={{ false: Colors.border, true: Colors.primary }} />
                    </View>
                </View>

                <Text style={styles.sectionTitle}>BADGE COUNTER</Text>
                <View style={styles.sectionContainer}>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Badge App Icon</Text>
                        <Switch
                            value={badgeAppIcon}
                            onValueChange={(val) => {
                                updateNotifications({ badgeAppIcon: val });
                                // Immediately update badge on toggle by calculating total from chats store,
                                // or setting to 0 if we toggled off. notificationService handles checking settings state inside.
                                // However, updateNotifications is async state internally in Zustand so we pass the value manually 
                                // to a scoped check to be safe, or we let notificationService handle it by calling it directly 
                                // but we need to ensure the store is flushed. For robustness, we'll force the badge count here.
                                if (val) {
                                    const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
                                    notificationService.updateBadgeCount(totalUnread);
                                } else {
                                    notificationService.updateBadgeCount(0); // force clear
                                }
                            }}
                            trackColor={{ false: Colors.border, true: Colors.primary }}
                        />
                    </View>
                </View>

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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.headerBg,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 10,
        paddingBottom: 12,
        paddingHorizontal: Spacing.sm,
    },
    headerButton: {
        padding: Spacing.sm,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...Typography.h3,
        color: Colors.white,
    },
    scrollContent: {
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.xxxl,
    },
    sectionTitle: {
        ...Typography.caption,
        color: Colors.textSecondary,
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.sm,
        fontWeight: '600',
    },
    sectionContainer: {
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.xl,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
    },
    settingLabel: {
        ...Typography.body,
        color: Colors.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.divider,
        marginLeft: Spacing.xl,
    },
});

export default NotificationsScreen;
