import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useSettingsStore } from '../../store';

type PrivacySettingKey = 'phoneNumber' | 'lastSeen' | 'profilePhoto' | 'calls';

interface PrivacyOption {
    label: string;
    value: string;
}

const PRIVACY_OPTIONS: PrivacyOption[] = [
    { label: 'Everybody', value: 'Everybody' },
    { label: 'My Contacts', value: 'My Contacts' },
    { label: 'Nobody', value: 'Nobody' },
];

const PrivacySecurityScreen: React.FC = () => {
    const navigation = useNavigation();
    const { privacy, updatePrivacy } = useSettingsStore();

    // Privacy state
    const {
        phoneNumber, lastSeen, profilePhoto,
        calls, passcode, twoStepVerification
    } = privacy;

    const [modalVisible, setModalVisible] = useState(false);
    const [activeSetting, setActiveSetting] = useState<PrivacySettingKey | null>(null);

    const openSettingModal = (setting: PrivacySettingKey) => {
        setActiveSetting(setting);
        setModalVisible(true);
    };

    const handleSelectOption = (value: string) => {
        if (activeSetting) {
            updatePrivacy({ [activeSetting]: value });
        }
        setModalVisible(false);
        setActiveSetting(null);
    };

    const getDisplayTitle = (key: PrivacySettingKey | null) => {
        switch (key) {
            case 'phoneNumber': return 'Phone Number';
            case 'lastSeen': return 'Last Seen & Online';
            case 'profilePhoto': return 'Profile Photo';
            case 'calls': return 'Calls';
            default: return '';
        }
    };

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
                    <TouchableOpacity style={styles.settingRow} onPress={() => openSettingModal('phoneNumber')}>
                        <Text style={styles.settingLabel}>Phone Number</Text>
                        <Text style={styles.settingValue}>{phoneNumber} <Icon name="chevron-forward" color={Colors.textSecondary} /></Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.settingRow} onPress={() => openSettingModal('lastSeen')}>
                        <Text style={styles.settingLabel}>Last Seen & Online</Text>
                        <Text style={styles.settingValue}>{lastSeen} <Icon name="chevron-forward" color={Colors.textSecondary} /></Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.settingRow} onPress={() => openSettingModal('profilePhoto')}>
                        <Text style={styles.settingLabel}>Profile Photo</Text>
                        <Text style={styles.settingValue}>{profilePhoto} <Icon name="chevron-forward" color={Colors.textSecondary} /></Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.settingRow} onPress={() => openSettingModal('calls')}>
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

            {/* Privacy Selection Modal */}
            {modalVisible && (
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalDismissArea} onPress={() => setModalVisible(false)} />
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>Who can see my {getDisplayTitle(activeSetting).toLowerCase()}?</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close-circle" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        {PRIVACY_OPTIONS.map((option, index) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[styles.sheetOption, index !== PRIVACY_OPTIONS.length - 1 && styles.sheetOptionBorder]}
                                onPress={() => handleSelectOption(option.value)}
                            >
                                <Text style={[
                                    styles.sheetOptionText,
                                    activeSetting && privacy[activeSetting] === option.value && styles.sheetOptionSelectedText
                                ]}>
                                    {option.label}
                                </Text>
                                {activeSetting && privacy[activeSetting] === option.value && (
                                    <Icon name="checkmark" size={20} color={Colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
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
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
        zIndex: 10,
    },
    modalDismissArea: {
        flex: 1,
    },
    bottomSheet: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    sheetTitle: {
        ...Typography.h4,
        color: Colors.textPrimary,
    },
    sheetOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl,
    },
    sheetOptionBorder: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
        marginLeft: Spacing.xl,
    },
    sheetOptionText: {
        ...Typography.body,
        color: Colors.textPrimary,
    },
    sheetOptionSelectedText: {
        color: Colors.primary,
        fontWeight: '600',
    }
});

export default PrivacySecurityScreen;
