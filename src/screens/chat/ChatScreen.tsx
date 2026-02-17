import React, { useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ChatStackParamList, Message } from '../../constants/types';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useAuthStore, useChatStore } from '../../store';
import { launchImageLibrary } from 'react-native-image-picker';
import { storageService } from '../../services/storageService';
import { chatService } from '../../services/chatService';
import MessageBubble from '../../components/chat/MessageBubble';
import MessageInput from '../../components/chat/MessageInput';
import Avatar from '../../components/common/Avatar';

type RoutePropType = RouteProp<ChatStackParamList, 'Chat'>;

const ChatScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<RoutePropType>();
    const { chatId, otherUser } = route.params;
    const { user } = useAuthStore();
    const { activeMessages, subscribeToMessages, sendMessage } = useChatStore();
    const [isTyping, setIsTyping] = React.useState(false);

    useEffect(() => {
        const unsubscribeMessages = subscribeToMessages(chatId);

        const unsubscribeTyping = chatService.subscribeToTypingStatus(chatId, (userIds) => {
            const othersTyping = userIds.includes(otherUser.id);
            setIsTyping(othersTyping);
        });

        return () => {
            unsubscribeMessages();
            unsubscribeTyping();
        };
    }, [chatId, subscribeToMessages, otherUser.id]);

    const handleSend = useCallback(
        (text: string) => {
            if (!user?.id) return;
            sendMessage(chatId, text, user.id);
            chatService.setTypingStatus(chatId, user.id, false);
        },
        [chatId, user?.id, sendMessage],
    );

    const handleTyping = useCallback(
        (typing: boolean) => {
            if (!user?.id) return;
            chatService.setTypingStatus(chatId, user.id, typing);
        },
        [chatId, user?.id],
    );

    const handleAttach = useCallback(async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.7,
                maxWidth: 1200,
                maxHeight: 1200,
            });

            if (result.assets && result.assets[0]?.uri && user?.id) {
                const imageURL = await storageService.uploadChatImage(
                    chatId,
                    result.assets[0].uri,
                );
                sendMessage(chatId, '', user.id, 'image', imageURL);
            }
        } catch (error) {
            console.error('Image upload error:', error);
        }
    }, [chatId, user?.id, sendMessage]);

    const renderMessage = ({ item }: { item: Message }) => (
        <MessageBubble
            message={item}
            isMine={item.senderId === user?.id}
        />
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.headerInfo}
                    onPress={() =>
                        (navigation as any).navigate('ContactInfo', { userId: otherUser.id })
                    }
                    activeOpacity={0.7}>
                    <Avatar
                        uri={otherUser.photoURL}
                        name={otherUser.displayName}
                        size={38}
                        showOnline
                        online={otherUser.online}
                    />
                    <View style={styles.headerText}>
                        <Text style={styles.headerName} numberOfLines={1}>
                            {otherUser.displayName}
                        </Text>
                        <Text style={styles.headerStatus}>
                            {isTyping ? 'typing...' : otherUser.online ? 'online' : 'last seen recently'}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerAction}>
                    <Icon name="call-outline" size={22} color={Colors.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerAction}>
                    <Icon name="ellipsis-vertical" size={22} color={Colors.white} />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <View style={styles.messagesContainer}>
                <FlatList
                    data={activeMessages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    inverted
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Input */}
            <MessageInput
                onSend={handleSend}
                onAttachPress={handleAttach}
                onTyping={handleTyping}
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8F0F7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.headerBg,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 10,
        paddingBottom: 10,
        paddingHorizontal: Spacing.sm,
    },
    backButton: {
        padding: Spacing.sm,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: Spacing.xs,
    },
    headerText: {
        marginLeft: Spacing.sm,
        flex: 1,
    },
    headerName: {
        ...Typography.bodyBold,
        color: Colors.white,
        fontSize: 17,
    },
    headerStatus: {
        ...Typography.small,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 1,
    },
    headerAction: {
        padding: Spacing.sm,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesList: {
        paddingVertical: Spacing.sm,
    },
});

export default ChatScreen;
