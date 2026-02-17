import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NetworkBanner: React.FC = () => {
    const netInfo = useNetInfo();
    const insets = useSafeAreaInsets();
    const [heightAnim] = useState(new Animated.Value(0));
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (netInfo.isConnected === false) {
            setIsVisible(true);
            Animated.timing(heightAnim, {
                toValue: 40 + insets.top,
                duration: 300,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(heightAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                if (netInfo.isConnected !== false) {
                    setIsVisible(false);
                }
            });
        }
    }, [netInfo.isConnected, heightAnim, insets.top]);

    if (!isVisible && netInfo.isConnected !== false) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                { height: heightAnim, paddingTop: insets.top },
            ]}>
            <Text style={styles.text}>No Internet Connection</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.danger,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        overflow: 'hidden',
    },
    text: {
        ...Typography.caption,
        color: Colors.white,
        fontWeight: '600',
        paddingBottom: Spacing.xs,
    },
});

export default NetworkBanner;
