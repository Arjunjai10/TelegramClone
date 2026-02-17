import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { Swipeable } from 'react-native-gesture-handler';
import { Alert, Animated } from 'react-native';
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

    const handleDeleteChat = (chat: Chat) => {
        Alert.alert(
            'Delete Chat',
            'Are you sure you want to delete this chat? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await useChatStore.getState().deleteChat(chat.id);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete chat');
                        }
                    },
                },
            ]
        );
    };

    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, chat: Chat) => {
        const trans = dragX.interpolate({
            inputRange: [-80, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return (
            <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => handleDeleteChat(chat)}>
                <Animated.View style={{ transform: [{ scale: trans }] }}>
                    <Icon name="trash-outline" size={24} color="white" />
                    <Text style={styles.deleteText}>Delete</Text>
                </Animated.View>
            </TouchableOpacity>
        );
    };

    const renderItem = ({ item }: { item: Chat }) => (
        <Swipeable
            renderRightActions={(progress, dragX) =>
                renderRightActions(progress, dragX, item)
            }>
            <ChatListItem
                chat={item}
                onPress={() => handleChatPress(item)}
            />
        </Swipeable>
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
            {/* Custom Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Icon name="logo-telegram" size={28} color={Colors.white} />
                    <Text style={styles.headerTitle}>Telegram</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerAction}>
                        <Icon name="ellipsis-vertical" size={20} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Icon name="search" size={18} color={Colors.textSecondary} style={{ marginLeft: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Chats"
                        placeholderTextColor={Colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                    <TouchableOpacity style={[styles.filterTab, styles.filterTabActive]}>
                        <Text style={styles.filterTextActive}>All Chats</Text>
                        <View style={styles.filterBadgeActive}>
                            <Text style={styles.filterBadgeTextActive}>29</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterTab}>
                        <Text style={styles.filterText}>Series 🔥</Text>
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>41</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterTab}>
                        <Text style={styles.filterText}>Groups</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterTab}>
                        <Text style={styles.filterText}>Bots</Text>
                    </TouchableOpacity>
                </ScrollView>
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
                    filteredChats.length === 0 ? [styles.emptyList, { flex: 1 }] : undefined
                }
            />

            {/* FAB - New Chat */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('NewChat')}
                activeOpacity={0.8}>
                <Icon name="add" size={30} color={Colors.white} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: Colors.background,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.white,
        marginLeft: 12,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAction: {
        padding: 8,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C2733', // More accurate grey for search bar
        borderRadius: 10, // Less rounded than before
        paddingHorizontal: 12,
        height: 44,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.textPrimary,
        marginLeft: 8,
        padding: 0,
    },
    filterWrapper: {
        height: 48,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    filterContent: {
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    filterTabActive: {
        backgroundColor: Colors.primaryDark,
    },
    filterText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    filterTextActive: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.primary,
    },
    filterBadge: {
        backgroundColor: Colors.surface,
        borderRadius: 10,
        paddingHorizontal: 6,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
    },
    filterBadgeActive: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        paddingHorizontal: 6,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
    },
    filterBadgeText: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: 'bold',
    },
    filterBadgeTextActive: {
        fontSize: 11,
        color: Colors.white,
        fontWeight: 'bold',
    },
    emptyList: {
        justifyContent: 'center',
    },
    emptyContainer: {
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
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    deleteAction: {
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
    },
    deleteText: {
        color: 'white',
        fontWeight: '600',
        padding: 5,
        fontSize: 12,
    },
});

export default ChatListScreen;
