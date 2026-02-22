import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Spacing } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NetworkBanner: React.FC = () => {
    const netInfo = useNetInfo();
    const insets = useSafeAreaInsets();
    const heightAnim = useRef(new Animated.Value(0)).current;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (netInfo.isConnected === false) {
            setIsVisible(true);
            Animated.spring(heightAnim, {
                toValue: 42 + insets.top,
                friction: 10,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(heightAnim, {
                toValue: 0,
                duration: 280,
                useNativeDriver: false,
            }).start(() => {
                if (netInfo.isConnected !== false) setIsVisible(false);
            });
        }
    }, [netInfo.isConnected, insets.top]);

    if (!isVisible && netInfo.isConnected !== false) return null;

    return (
        <Animated.View style={[styles.container, { height: heightAnim, paddingTop: insets.top }]}>
            <Icon name="wifi-outline" size={14} color={Colors.white} style={{ marginRight: 6 }} />
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
        flexDirection: 'row',
        zIndex: 9999,
        overflow: 'hidden',
    },
    text: {
        fontSize: 13,
        color: Colors.white,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
});

export default NetworkBanner;
