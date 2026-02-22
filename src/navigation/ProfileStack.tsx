import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from '../constants/types';
import { Colors } from '../constants/theme';
import ProfileScreen from '../screens/settings/ProfileScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationsScreen from '../screens/settings/NotificationsScreen';
import PrivacySecurityScreen from '../screens/settings/PrivacySecurityScreen';
import ChatSettingsScreen from '../screens/settings/ChatSettingsScreen';
import DataStorageScreen from '../screens/settings/DataStorageScreen';
import LanguageScreen from '../screens/settings/LanguageScreen';

const Stack = createStackNavigator<ProfileStackParamList>();

const ProfileStack: React.FC = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}>
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
            <Stack.Screen name="ChatSettings" component={ChatSettingsScreen} />
            <Stack.Screen name="DataStorage" component={DataStorageScreen} />
            <Stack.Screen name="Language" component={LanguageScreen} />
        </Stack.Navigator>
    );
};

export default ProfileStack;
