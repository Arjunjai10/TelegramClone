import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useSettingsStore } from '../../store';

const PrivacySecurityScreen: React.FC = () => {
    const navigation = useNavigation();
    const { privacy, updatePrivacy } = useSettingsStore();

    // Privacy state
    const {
        phoneNumber, lastSeen, profilePhoto,
        calls, passcode, twoStepVerification
    } = privacy;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy and Security</Text>
                <View style={styles.headerButton} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>PRIVACY</Text>
                <View style={styles.sectionContainer}>
                    <TouchableOpacity style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Phone Number</Text>
                        <Text style={styles.settingValue}>{phoneNumber} <Icon name="chevron-forward" color={Colors.textSecondary} /></Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Last Seen & Online</Text>
                        <Text style={styles.settingValue}>{lastSeen} <Icon name="chevron-forward" color={Colors.textSecondary} /></Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Profile Photo</Text>
                        <Text style={styles.settingValue}>{profilePhoto} <Icon name="chevron-forward" color={Colors.textSecondary} /></Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Calls</Text>
                        <Text style={styles.settingValue}>{calls} <Icon name="chevron-forward" color={Colors.textSecondary} /></Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>SECURITY</Text>
                <View style={styles.sectionContainer}>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Passcode Lock</Text>
                        <Switch value={passcode} onValueChange={(val) => updatePrivacy({ passcode: val })} trackColor={{ false: Colors.border, true: Colors.primary }} />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Two-Step Verification</Text>
                        <Switch value={twoStepVerification} onValueChange={(val) => updatePrivacy({ twoStepVerification: val })} trackColor={{ false: Colors.border, true: Colors.primary }} />
                    </View>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Active Sessions</Text>
                        <Icon name="chevron-forward" color={Colors.textSecondary} />
                    </TouchableOpacity>
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
    settingValue: {
        ...Typography.body,
        color: Colors.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.divider,
        marginLeft: Spacing.xl,
    },
});

export default PrivacySecurityScreen;
