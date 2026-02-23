import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useSettingsStore } from '../../store';

const DataStorageScreen: React.FC = () => {
    const navigation = useNavigation();
    const { storage, updateStorage } = useSettingsStore();

    // Settings state
    const { cellular, wifi, roaming } = storage;

    const [modalVisible, setModalVisible] = useState(false);
    const [activeModal, setActiveModal] = useState<'storage' | 'data' | null>(null);

    // Mock calculations
    const [mockStorageSize, setMockStorageSize] = useState('124.5 MB');

    const openModal = (type: 'storage' | 'data') => {
        setActiveModal(type);
        setModalVisible(true);
    };

    const handleClearCache = () => {
        setMockStorageSize('0 KB');
        setModalVisible(false);
        // In a real app, this would clear AsyncStorage or react-native-fast-image cache
    };

    const closeModal = () => {
        setModalVisible(false);
        setActiveModal(null);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Data and Storage</Text>
                <View style={styles.headerButton} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>AUTOMATIC MEDIA DOWNLOAD</Text>
                <View style={styles.sectionContainer}>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Using Cellular</Text>
                        <Switch value={cellular} onValueChange={(val) => updateStorage({ cellular: val })} trackColor={{ false: Colors.border, true: Colors.primary }} />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Using Wi-Fi</Text>
                        <Switch value={wifi} onValueChange={(val) => updateStorage({ wifi: val })} trackColor={{ false: Colors.border, true: Colors.primary }} />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>When Roaming</Text>
                        <Switch value={roaming} onValueChange={(val) => updateStorage({ roaming: val })} trackColor={{ false: Colors.border, true: Colors.primary }} />
                    </View>
                </View>

                <Text style={styles.sectionTitle}>STORAGE USAGE</Text>
                <View style={styles.sectionContainer}>
                    <TouchableOpacity style={styles.settingRow} onPress={() => openModal('storage')}>
                        <Text style={styles.settingLabel}>Storage Usage</Text>
                        <Text style={styles.settingValue}>{mockStorageSize} <Icon name="chevron-forward" color={Colors.textSecondary} /></Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.settingRow} onPress={() => openModal('data')}>
                        <Text style={styles.settingLabel}>Data Usage</Text>
                        <Icon name="chevron-forward" color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* Bottom Sheet Modal */}
            {modalVisible && (
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalDismissArea} onPress={closeModal} />
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>
                                {activeModal === 'storage' ? 'Storage Usage' : 'Data Usage'}
                            </Text>
                            <TouchableOpacity onPress={closeModal}>
                                <Icon name="close-circle" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {activeModal === 'storage' && (
                            <View style={styles.modalContent}>
                                <View style={styles.usageCircle}>
                                    <Icon name="server-outline" size={40} color={Colors.primary} />
                                    <Text style={styles.usageText}>{mockStorageSize}</Text>
                                    <Text style={styles.usageSubtext}>Documents & Data</Text>
                                </View>

                                <TouchableOpacity style={styles.clearCacheBtn} onPress={handleClearCache}>
                                    <Icon name="trash-outline" size={20} color={Colors.error} />
                                    <Text style={styles.clearCacheText}>Clear Cache</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {activeModal === 'data' && (
                            <View style={styles.modalContent}>
                                <View style={styles.dataStatRow}>
                                    <Text style={styles.dataStatLabel}>Messages Sent</Text>
                                    <Text style={styles.dataStatValue}>45.2 MB</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.dataStatRow}>
                                    <Text style={styles.dataStatLabel}>Messages Received</Text>
                                    <Text style={styles.dataStatValue}>112.4 MB</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.dataStatRow}>
                                    <Text style={styles.dataStatLabel}>Photos & Videos (Sent)</Text>
                                    <Text style={styles.dataStatValue}>834.1 MB</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.dataStatRow}>
                                    <Text style={styles.dataStatLabel}>Photos & Videos (Received)</Text>
                                    <Text style={styles.dataStatValue}>2.1 GB</Text>
                                </View>
                            </View>
                        )}

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
    modalContent: {
        paddingVertical: Spacing.md,
    },
    usageCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxxl,
    },
    usageText: {
        ...Typography.h2,
        color: Colors.textPrimary,
        marginTop: Spacing.md,
    },
    usageSubtext: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    clearCacheBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: 8,
        backgroundColor: `${Colors.error}20`,
        marginTop: Spacing.xl,
    },
    clearCacheText: {
        ...Typography.h4,
        color: Colors.error,
        marginLeft: Spacing.sm,
    },
    dataStatRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl,
    },
    dataStatLabel: {
        ...Typography.body,
        color: Colors.textPrimary,
    },
    dataStatValue: {
        ...Typography.body,
        color: Colors.textSecondary,
        fontWeight: '600',
    }
});

export default DataStorageScreen;
