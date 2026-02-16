import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { ChatStackParamList, Chat } from '../../constants/types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useAuthStore, useChatStore } from '../../store';
import ChatListItem from '../../components/chat/ChatListItem';

type NavProp = StackNavigationProp<ChatStackParamList, 'ChatList'>;

const ChatListScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const { user } = useAuthStore();
    const { chats, isLoadingChats, subscribeToChats } = useChatStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        const unsubscribe = subscribeToChats(user.id);
        return () => unsubscribe();
    }, [user?.id, subscribeToChats]);

    const filteredChats = chats.filter((chat) => {
        if (!searchQuery.trim()) return true;
        return (
            chat.otherUser?.displayName
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) || false
        );
    });

    const onRefresh = useCallback(() => {
        if (!user?.id) return;
        setRefreshing(true);
        // Re-subscribe triggers a fresh fetch from Firestore
        const unsub = subscribeToChats(user.id);
        // Wait briefly for data, then stop refresh indicator
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
        // Clean up the duplicate subscription
        return () => unsub();
    }, [user?.id, subscribeToChats]);

    const handleChatPress = (chat: Chat) => {
        if (!chat.otherUser) return;
        navigation.navigate('Chat', {
            chatId: chat.id,
            otherUser: chat.otherUser,
        });
    };

    const renderItem = ({ item }: { item: Chat }) => (
        <ChatListItem
            chat={item}
            onPress={() => handleChatPress(item)}
        />
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Icon name="chatbubbles-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No chats yet</Text>
            <Text style={styles.emptySubtitle}>
                Start a new conversation by tapping the button below
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Icon name="search" size={18} color={Colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search"
                        placeholderTextColor={Colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close-circle" size={18} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Chat List */}
            <FlatList
                data={filteredChats}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={!isLoadingChats ? renderEmpty : null}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.primary}
                    />
                }
                contentContainerStyle={
                    filteredChats.length === 0 ? styles.emptyList : undefined
                }
            />

            {/* FAB - New Chat */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('NewChat')}
                activeOpacity={0.8}>
                <Icon name="create-outline" size={26} color={Colors.white} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    searchContainer: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.background,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.divider,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBg,
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.md,
        height: 38,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: Colors.textPrimary,
        padding: 0,
    },
    emptyList: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxxl,
    },
    emptyTitle: {
        ...Typography.h3,
        color: Colors.textPrimary,
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.lg,
    },
});

export default ChatListScreen;
