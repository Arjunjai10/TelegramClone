import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MainTabParamList } from '../constants/types';
import { Colors } from '../constants/theme';
import ChatStack from './ChatStack';
import ContactsStack from './ContactsStack';
import SettingsStack from './SettingsStack';
import ProfileStack from './ProfileStack';
import Avatar from '../components/common/Avatar';
import { useAuthStore } from '../store';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon = ({
    name,
    focused,
    color,
    badgeCount,
    isProfile
}: {
    name: string;
    focused: boolean;
    color: string,
    badgeCount?: number;
    isProfile?: boolean;
}) => {
    const { user } = useAuthStore();

    return (
        <View style={styles.iconContainer}>
            {focused && <View style={styles.activeCircle} />}
            {isProfile ? (
                <View style={[styles.avatarBorder, focused && styles.avatarBorderActive]}>
                    <Avatar
                        uri={user?.photoURL || undefined}
                        name={user?.displayName || 'User'}
                        size={24}
                    />
                </View>
            ) : (
                <Icon name={name} size={24} color={color} />
            )}
            {badgeCount && badgeCount > 0 ? (
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{badgeCount}</Text>
                </View>
            ) : null}
        </View>
    );
};

const MainTabs: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => {
                const routeName = getFocusedRouteNameFromRoute(route) ?? (route.name === 'ChatsTab' ? 'ChatList' : route.name === 'ContactsTab' ? 'Contacts' : route.name === 'SettingsTab' ? 'Settings' : 'Profile');

                // Routes where bottom tab bar should be HIDDEN
                const hiddenRoutes = [
                    'Chat', 'NewChat', 'ContactInfo', // Chat routes
                    'EditProfile', 'Notifications', 'PrivacySecurity', 'ChatSettings', 'DataStorage', 'Language' // Settings/Profile routes
                ];

                const isHidden = hiddenRoutes.includes(routeName);

                return {
                    headerShown: false,
                    tabBarStyle: {
                        display: isHidden ? 'none' : 'flex',
                        backgroundColor: Colors.backgroundSecondary,
                        borderTopWidth: 0,
                        height: Platform.OS === 'ios' ? 88 : 70,
                        paddingBottom: Platform.OS === 'ios' ? 25 : 12,
                        paddingTop: 12,
                        elevation: 8,
                    },
                    tabBarActiveTintColor: Colors.primary,
                    tabBarInactiveTintColor: Colors.textSecondary,
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '600',
                        marginTop: 4,
                    },
                };
            }}>
            <Tab.Screen
                name="ChatsTab"
                component={ChatStack}
                options={{
                    tabBarLabel: 'Chats',
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon
                            name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
                            focused={focused}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="ContactsTab"
                component={ContactsStack}
                options={{
                    tabBarLabel: 'Contacts',
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon
                            name={focused ? 'people-circle' : 'people-circle-outline'}
                            focused={focused}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="SettingsTab"
                component={SettingsStack}
                options={{
                    tabBarLabel: 'Settings',
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon
                            name={focused ? 'settings' : 'settings-outline'}
                            focused={focused}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileStack}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon
                            name="person"
                            focused={focused}
                            color={color}
                            isProfile={true}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 32,
        width: 64,
    },
    activeCircle: {
        position: 'absolute',
        width: 64,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primaryDark,
    },
    badgeContainer: {
        position: 'absolute',
        top: -6,
        right: 8,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: Colors.backgroundSecondary,
    },
    badgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    avatarBorder: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarBorderActive: {
        borderColor: Colors.primary,
    },
});

export default MainTabs;
