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
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const getAvatarColor = (name: string): string => {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
        '#BB8FCE', '#85C1E9', '#F0B27A', '#82E0AA',
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

    const onlineSize = Math.max(size * 0.25, 10);

    return (
        <View style={[styles.container, containerStyle, style]}>
            {uri ? (
                <Image
                    source={{ uri }}
                    style={[styles.image, containerStyle]}
                />
            ) : (
                <View
                    style={[
                        styles.placeholder,
                        containerStyle,
                        { backgroundColor: getAvatarColor(name) },
                    ]}>
                    <Text
                        style={[
                            styles.initials,
                            { fontSize: size * 0.36 },
                        ]}>
                        {getInitials(name)}
                    </Text>
                </View>
            )}
            {showOnline && online && (
                <View
                    style={[
                        styles.onlineBadge,
                        {
                            width: onlineSize,
                            height: onlineSize,
                            borderRadius: onlineSize / 2,
                            borderWidth: size > 40 ? 2.5 : 2,
                        },
                    ]}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    image: {
        resizeMode: 'cover',
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        color: Colors.white,
        fontWeight: '600',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.online,
        borderColor: Colors.white,
    },
});

export default Avatar;
