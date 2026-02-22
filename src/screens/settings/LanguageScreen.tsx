import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useSettingsStore } from '../../store';

const LanguageScreen: React.FC = () => {
    const navigation = useNavigation();

    // Settings state
    const { language: selectedLanguage, setLanguage: setSelectedLanguage } = useSettingsStore();

    const languages = [
        'English',
        'Arabic',
        'Catalan',
        'Dutch',
        'French',
        'German',
        'Indonesian',
        'Italian',
        'Japanese',
        'Korean',
        'Malay',
        'Portuguese',
        'Russian',
        'Spanish',
        'Turkish',
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Language</Text>
                <View style={styles.headerButton} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.sectionContainer}>
                    {languages.map((lang, index) => (
                        <View key={lang}>
                            <TouchableOpacity style={styles.settingRow} onPress={() => setSelectedLanguage(lang)}>
                                <Text style={styles.settingLabel}>{lang}</Text>
                                {selectedLanguage === lang && (
                                    <Icon name="checkmark" size={20} color={Colors.primary} />
                                )}
                            </TouchableOpacity>
                            {index < languages.length - 1 && <View style={styles.divider} />}
                        </View>
                    ))}
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

export default LanguageScreen;
