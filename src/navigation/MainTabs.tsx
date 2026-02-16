import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { MainTabParamList } from '../constants/types';
import { Colors } from '../constants/theme';
import ChatStack from './ChatStack';
import ContactsScreen from '../screens/home/ContactsScreen';
import SettingsStack from './SettingsStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.background,
                    borderTopColor: Colors.divider,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 4,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textSecondary,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = 'chatbubbles-outline';
                    if (route.name === 'ChatsTab') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    } else if (route.name === 'ContactsTab') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'SettingsTab') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
            })}>
            <Tab.Screen
                name="ChatsTab"
                component={ChatStack}
                options={{ tabBarLabel: 'Chats' }}
            />
            <Tab.Screen
                name="ContactsTab"
                component={ContactsScreen}
                options={{ tabBarLabel: 'Contacts' }}
            />
            <Tab.Screen
                name="SettingsTab"
                component={SettingsStack}
                options={{ tabBarLabel: 'Settings' }}
            />
        </Tab.Navigator>
    );
};

export default MainTabs;
