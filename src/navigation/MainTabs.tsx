import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MainTabParamList } from '../constants/types';
import { Colors } from '../constants/theme';
import ChatStack from './ChatStack';
import ContactsScreen from '../screens/home/ContactsScreen';
import SettingsStack from './SettingsStack';
import ProfileScreen from '../screens/settings/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon = ({ name, focused, color, badgeCount }: { name: string; focused: boolean; color: string, badgeCount?: number }) => {
    return (
        <View style={styles.iconContainer}>
            {focused && <View style={styles.activeCircle} />}
            <Icon name={name} size={24} color={color} />
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
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.background,
                    borderTopWidth: 0,
                    height: Platform.OS === 'ios' ? 88 : 65,
                    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textSecondary,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                    marginTop: 4,
                },
            })}>
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
                            badgeCount={31} // Matching screenshot
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="ContactsTab"
                component={ContactsScreen}
                options={{
                    tabBarLabel: 'Contacts',
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon
                            name={focused ? 'people' : 'people-outline'}
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
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon
                            name={focused ? 'person' : 'person-outline'}
                            focused={focused}
                            color={color}
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
        opacity: 0.6,
    },
    badgeContainer: {
        position: 'absolute',
        top: -4,
        right: 8,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: Colors.background,
    },
    badgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default MainTabs;
