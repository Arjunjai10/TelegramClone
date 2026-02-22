import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ContactsStackParamList } from '../constants/types';
import { Colors } from '../constants/theme';
import ContactsScreen from '../screens/home/ContactsScreen';
import NewChatScreen from '../screens/home/NewChatScreen';

const Stack = createStackNavigator<ContactsStackParamList>();

const ContactsStack: React.FC = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: Colors.headerBg,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTintColor: Colors.white,
                headerTitleStyle: {
                    fontWeight: '600',
                    fontSize: 18,
                },
            }}>
            <Stack.Screen
                name="Contacts"
                component={ContactsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="NewChat"
                component={NewChatScreen}
                options={{ title: 'New Chat' }}
            />
        </Stack.Navigator>
    );
};

export default ContactsStack;
