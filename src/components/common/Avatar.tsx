import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius } from '../../constants/theme';

interface AvatarProps {
    uri?: string;
    name?: string;
    size?: number;
    showOnline?: boolean;
    online?: boolean;
    style?: ViewStyle;
}

const getInitials = (name: string): string => {
    const words = name.trim().split(' ');
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
};

// Curated color palette — richer, more premium
const getAvatarColor = (name: string): string => {
    const colors = [
        '#1B6B4A', // deep emerald
        '#4A3B7C', // deep violet
        '#7C3B4A', // deep rose
        '#3B5A7C', // deep blue
        '#7C5A3B', // warm amber
        '#3B7C5A', // teal green
        '#6B3B7C', // plum
        '#7C6B3B', // golden brown
        '#3B7C7C', // deep teal
        '#7C3B3B', // deep crimson
        '#3B3B7C', // indigo
        '#5A7C3B', // olive
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const Avatar: React.FC<AvatarProps> = ({
    uri,
    name = '?',
    size = 48,
    showOnline = false,
    online = false,
    style,
}) => {
    const containerStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
    };

    const onlineDotSize = Math.max(size * 0.27, 10);

    return (
        <View style={[styles.container, containerStyle, style]}>
            {uri ? (
                <Image source={{ uri }} style={[styles.image, containerStyle]} />
            ) : (
                <View
                    style={[
                        styles.placeholder,
                        containerStyle,
                        { backgroundColor: getAvatarColor(name) },
                    ]}>
                    <Text style={[styles.initials, { fontSize: size * 0.37 }]}>
                        {getInitials(name)}
                    </Text>
                </View>
            )}

            {/* Online indicator with glow */}
            {showOnline && online && (
                <View
                    style={[
                        styles.onlineBadge,
                        {
                            width: onlineDotSize,
                            height: onlineDotSize,
                            borderRadius: onlineDotSize / 2,
                            borderWidth: size > 40 ? 2.5 : 2,
                        },
                    ]}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { position: 'relative' },
    image: { resizeMode: 'cover' },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        color: 'rgba(255,255,255,0.95)',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        borderColor: Colors.background,
        // Glow effect
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 5,
        elevation: 4,
    },
});

export default Avatar;
