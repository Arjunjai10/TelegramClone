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
    Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ChatStackParamList, Message } from '../../constants/types';
import { Colors, BorderRadius } from '../../constants/theme';
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
            setIsTyping(userIds.includes(otherUser.id));
        });
        return () => { unsubscribeMessages(); unsubscribeTyping(); };
    }, [chatId, subscribeToMessages, otherUser.id]);

    const handleSend = useCallback((text: string) => {
        if (!user?.id) return;
        sendMessage(chatId, text, user.id);
        chatService.setTypingStatus(chatId, user.id, false);
    }, [chatId, user?.id, sendMessage]);

    const handleTyping = useCallback((typing: boolean) => {
        if (!user?.id) return;
        chatService.setTypingStatus(chatId, user.id, typing);
    }, [chatId, user?.id]);

    const handleAttach = useCallback(async () => {
        try {
            const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7, maxWidth: 1200, maxHeight: 1200 });
            if (result.assets && result.assets[0]?.uri && user?.id) {
                const upload = await storageService.uploadChatImage(chatId, result.assets[0].uri);
                if (upload.blocked) {
                    Alert.alert('Feature Unavailable', 'Image uploads require Firebase Storage (Blaze plan).');
                    return;
                }
                if (upload.url) {
                    sendMessage(chatId, '', user.id, 'image', upload.url);
                }
            }
        } catch (error) {
            console.error('Image upload error:', error);
        }
    }, [chatId, user?.id, sendMessage]);

    const renderMessage = ({ item }: { item: Message }) => (
        <MessageBubble message={item} isMine={item.senderId === user?.id} />
    );

    const statusText = isTyping
        ? 'typing...'
        : otherUser.online
            ? 'online'
            : 'last seen recently';

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.surface} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="chevron-back" size={26} color={Colors.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.headerInfo}
                    onPress={() => (navigation as any).navigate('ContactInfo', { userId: otherUser.id })}
                    activeOpacity={0.75}>
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
                        <Text style={[
                            styles.headerStatus,
                            isTyping && styles.typingStatus,
                        ]}>
                            {statusText}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerAction}>
                        <Icon name="call-outline" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerAction}>
                        <Icon name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Messages */}
            <FlatList
                data={activeMessages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                inverted
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                style={styles.messageList}
            />

            {/* Input */}
            <MessageInput onSend={handleSend} onAttachPress={handleAttach} onTyping={handleTyping} />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 10,
        paddingBottom: 12,
        paddingHorizontal: 6,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 4,
    },
    headerText: { marginLeft: 10, flex: 1 },
    headerName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: -0.2,
    },
    headerStatus: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 1,
        fontWeight: '500',
    },
    typingStatus: { color: Colors.primary, fontWeight: '600' },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    headerAction: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Messages
    messageList: { flex: 1 },
    messagesList: {
        paddingVertical: 12,
        paddingHorizontal: 6,
    },
});

export default ChatScreen;
