import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ChatStackParamList } from '../constants/types';
import { Colors } from '../constants/theme';
import ChatListScreen from '../screens/home/ChatListScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import NewChatScreen from '../screens/home/NewChatScreen';
import ContactInfoScreen from '../screens/chat/ContactInfoScreen';

const Stack = createStackNavigator<ChatStackParamList>();

const ChatStack: React.FC = () => {
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
                name="ChatList"
                component={ChatListScreen}
                options={{ title: 'Telegram' }}
            />
            <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="NewChat"
                component={NewChatScreen}
                options={{ title: 'New Chat' }}
            />
            <Stack.Screen
                name="ContactInfo"
                component={ContactInfoScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default ChatStack;
