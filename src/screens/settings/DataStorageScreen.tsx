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
                    <TouchableOpacity style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Storage Usage</Text>
                        <Icon name="chevron-forward" color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Data Usage</Text>
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

export default DataStorageScreen;
