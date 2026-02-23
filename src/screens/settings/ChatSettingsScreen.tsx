import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useSettingsStore } from '../../store';

const TEXT_SIZES = ['12', '14', '16', '18', '20'];

const ChatSettingsScreen: React.FC = () => {
    const navigation = useNavigation();
    const { chat, updateChat } = useSettingsStore();

    // Settings state
    const { textSize, enterIsSend, saveToGallery, wallpaper } = chat;

    const [modalVisible, setModalVisible] = useState(false);

    const handleSelectTextSize = (size: string) => {
        updateChat({ textSize: size });
        setModalVisible(false);
    };

    const handleChangeWallpaper = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: 1,
            });

            if (result.didCancel) return;

            if (result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                if (uri) {
                    updateChat({ wallpaper: uri });
                }
            }
        } catch (error) {
            console.error('[ChatSettingsScreen] Error picking wallpaper:', error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chat Settings</Text>
                <View style={styles.headerButton} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>SETTINGS</Text>
                <View style={styles.sectionContainer}>
                    <TouchableOpacity style={styles.settingRow} onPress={() => setModalVisible(true)}>
                        <Text style={styles.settingLabel}>Message Text Size</Text>
                        <Text style={styles.settingValue}>{textSize} <Icon name="chevron-forward" color={Colors.textSecondary} /></Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.settingRow} onPress={handleChangeWallpaper}>
                        <Text style={styles.settingLabel}>Change Chat Wallpaper</Text>
                        <View style={styles.wallpaperRight}>
                            {wallpaper ? (
                                <Text style={styles.settingValue}>Custom <Icon name="chevron-forward" color={Colors.textSecondary} /></Text>
                            ) : (
                                <Icon name="chevron-forward" color={Colors.textSecondary} />
                            )}
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Enter is Send</Text>
                        <Switch value={enterIsSend} onValueChange={(val) => updateChat({ enterIsSend: val })} trackColor={{ false: Colors.border, true: Colors.primary }} />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Save to Gallery</Text>
                        <Switch value={saveToGallery} onValueChange={(val) => updateChat({ saveToGallery: val })} trackColor={{ false: Colors.border, true: Colors.primary }} />
                    </View>
                </View>

            </ScrollView>

            {/* Text Size Selection Modal */}
            {modalVisible && (
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalDismissArea} onPress={() => setModalVisible(false)} />
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>Message Text Size</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close-circle" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        {TEXT_SIZES.map((size, index) => (
                            <TouchableOpacity
                                key={size}
                                style={[styles.sheetOption, index !== TEXT_SIZES.length - 1 && styles.sheetOptionBorder]}
                                onPress={() => handleSelectTextSize(size)}
                            >
                                <Text style={[
                                    styles.sheetOptionText,
                                    textSize === size && styles.sheetOptionSelectedText
                                ]}>
                                    {size}
                                </Text>
                                {textSize === size && (
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
    wallpaperRight: {
        flexDirection: 'row',
        alignItems: 'center',
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

export default ChatSettingsScreen;
