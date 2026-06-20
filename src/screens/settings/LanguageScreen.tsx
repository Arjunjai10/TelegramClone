import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, StatusBar, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useSettingsStore } from '../../store';

const LanguageScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
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
            <View style={[styles.header, { paddingTop: insets.top + 10, height: (Platform.OS === 'ios' ? 44 : 56) + insets.top }]}>
                <Pressable android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }} style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={Colors.white} />
                </Pressable>
                <Text style={styles.headerTitle}>Language</Text>
                <View style={styles.headerButton} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.sectionContainer}>
                    {languages.map((lang, index) => (
                        <View key={lang}>
                            <Pressable android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }} style={styles.settingRow} onPress={() => setSelectedLanguage(lang)}>
                                <Text style={styles.settingLabel}>{lang}</Text>
                                {selectedLanguage === lang && (
                                    <Icon name="checkmark" size={20} color={Colors.primary} />
                                )}
                            </Pressable>
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
