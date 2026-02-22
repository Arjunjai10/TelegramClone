import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

interface SettingsItemProps {
    icon: string;
    iconColor?: string;
    label: string;
    subtitle?: string;
    onPress?: () => void;
    showChevron?: boolean;
    rightElement?: React.ReactNode;
    danger?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
    icon,
    iconColor,
    label,
    subtitle,
    onPress,
    showChevron = true,
    rightElement,
    danger = false,
}) => {
    const color = danger ? Colors.danger : (iconColor || Colors.primary);

    return (
        <>
            <TouchableOpacity
                style={styles.container}
                onPress={onPress}
                activeOpacity={0.65}
                disabled={!onPress}>
                <View style={[styles.iconContainer, { backgroundColor: color + '18' }]}>
                    <Icon name={icon} size={20} color={color} />
                </View>
                <View style={styles.content}>
                    <Text style={[styles.label, danger && { color: Colors.danger }]} numberOfLines={1}>
                        {label}
                    </Text>
                    {subtitle && (
                        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
                    )}
                </View>
                {rightElement || (showChevron && onPress && (
                    <Icon name="chevron-forward" size={17} color={Colors.textTertiary} />
                ))}
            </TouchableOpacity>
            <View style={styles.divider} />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 14,
        backgroundColor: Colors.surface,
    },
    iconContainer: {
        width: 38,
        height: 38,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: { flex: 1, marginLeft: 14 },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
        letterSpacing: -0.1,
    },
    subtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
        fontWeight: '400',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.divider,
        marginLeft: 70,
    },
});

export default SettingsItem;
