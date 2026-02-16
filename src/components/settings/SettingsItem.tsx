import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing } from '../../constants/theme';

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
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.6}
            disabled={!onPress}>
            <View
                style={[
                    styles.iconContainer,
                    {
                        backgroundColor: danger
                            ? Colors.danger + '15'
                            : (iconColor || Colors.primary) + '15',
                    },
                ]}>
                <Icon
                    name={icon}
                    size={22}
                    color={danger ? Colors.danger : iconColor || Colors.primary}
                />
            </View>
            <View style={styles.content}>
                <Text
                    style={[styles.label, danger && { color: Colors.danger }]}
                    numberOfLines={1}>
                    {label}
                </Text>
                {subtitle && (
                    <Text style={styles.subtitle} numberOfLines={1}>
                        {subtitle}
                    </Text>
                )}
            </View>
            {rightElement || (showChevron && onPress && (
                <Icon
                    name="chevron-forward"
                    size={20}
                    color={Colors.textSecondary}
                />
            ))}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.background,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    label: {
        ...Typography.body,
        color: Colors.textPrimary,
    },
    subtitle: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 2,
    },
});

export default SettingsItem;
