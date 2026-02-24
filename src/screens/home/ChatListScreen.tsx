import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ScrollView,
    StatusBar,
    Animated,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { Swipeable } from 'react-native-gesture-handler';
import { Alert } from 'react-native';
import { ChatStackParamList, Chat } from '../../constants/types';
import { Colors, BorderRadius, Typography, Spacing } from '../../constants/theme';
import { useAuthStore, useChatStore, useSettingsStore } from '../../store';
import ChatListItem from '../../components/chat/ChatListItem';

type NavProp = StackNavigationProp<ChatStackParamList, 'ChatList'>;
type FilterKey = 'All' | 'Unread' | 'Groups' | 'Bots';

const ChatListScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const { user } = useAuthStore();
    const { chats, isLoadingChats, subscribeToChats } = useChatStore();
    const { chat: chatSettings, togglePinChat, toggleMuteChat } = useSettingsStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [filterType, setFilterType] = useState<FilterKey>('All');
    const [searchFocused, setSearchFocused] = useState(false);

    // UI State
    const searchInputRef = useRef<TextInput>(null);
    const [actionSheetVisible, setActionSheetVisible] = useState(false);
    const [chatContextMenu, setChatContextMenu] = useState<{ visible: boolean; chat: Chat | null }>({ visible: false, chat: null });

    const fabScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(fabScale, { toValue: 1.07, duration: 1400, useNativeDriver: true }),
                Animated.timing(fabScale, { toValue: 1, duration: 1400, useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        const unsubscribe = subscribeToChats(user.id);
        return () => unsubscribe();
    }, [user?.id, subscribeToChats]);

    const filteredChats = chats
        .filter((chat) => {
            const matchesSearch = !searchQuery.trim() ||
                chat.otherUser?.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;
            if (filterType === 'Unread') return chat.unreadCount > 0;
            if (filterType === 'Groups') return chat.participants.length > 2;
            if (filterType === 'Bots') return chat.otherUser?.isBot || false;
            return true;
        })
        .sort((a, b) => {
            // Sort pinned chats to the top
            const aPinned = chatSettings.pinnedChats?.includes(a.id) ?? false;
            const bPinned = chatSettings.pinnedChats?.includes(b.id) ?? false;
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            // Otherwise maintain default chronological backend sort (or handle timestamp if needed)
            return 0;
        });

    const unreadCount = chats.filter((c) => c.unreadCount > 0).length;

    const onRefresh = useCallback(() => {
        if (!user?.id) return;
        setRefreshing(true);
        subscribeToChats(user.id);
        setTimeout(() => setRefreshing(false), 1500);
    }, [user?.id, subscribeToChats]);

    const handleChatPress = (chat: Chat) => {
        if (!chat.otherUser) return;
        navigation.navigate('Chat', { chatId: chat.id, otherUser: chat.otherUser });
    };

    const handleDeleteChat = (chat: Chat) => {
        setChatContextMenu({ visible: false, chat: null });
        Alert.alert('Delete Chat', 'This will permanently remove the conversation.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    try { await useChatStore.getState().deleteChat(chat.id); }
                    catch { Alert.alert('Error', 'Failed to delete chat'); }
                },
            },
        ]);
    };

    const handlePinMuteToggle = (action: 'pin' | 'mute') => {
        const targetChatId = chatContextMenu.chat?.id;
        if (!targetChatId) return;

        if (action === 'pin') togglePinChat(targetChatId);
        if (action === 'mute') toggleMuteChat(targetChatId);

        setChatContextMenu({ visible: false, chat: null });
    };

    const renderRightActions = (
        progress: Animated.AnimatedInterpolation<number>,
        _dragX: Animated.AnimatedInterpolation<number>,
        chat: Chat
    ) => {
        const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1], extrapolate: 'clamp' });
        return (
            <TouchableOpacity style={styles.deleteAction} onPress={() => handleDeleteChat(chat)}>
                <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
                    <Icon name="trash-outline" size={20} color="white" />
                    <Text style={styles.deleteText}>Delete</Text>
                </Animated.View>
            </TouchableOpacity>
        );
    };

    const renderItem = ({ item }: { item: Chat }) => {
        const isPinned = chatSettings.pinnedChats?.includes(item.id) ?? false;
        const isMuted = chatSettings.mutedChats?.includes(item.id) ?? false;

        return (
            <Swipeable renderRightActions={(p, d) => renderRightActions(p, d, item)}>
                <ChatListItem
                    chat={item}
                    isPinned={isPinned}
                    isMuted={isMuted}
                    onPress={() => handleChatPress(item)}
                    onLongPress={() => setChatContextMenu({ visible: true, chat: item })}
                />
            </Swipeable>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
                <Icon name="chatbubbles-outline" size={38} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>Tap the compose button to start messaging</Text>
        </View>
    );

    const filterTabs: { key: FilterKey; label: string; badge?: number }[] = [
        { key: 'All', label: 'All' },
        { key: 'Unread', label: 'Unread', badge: unreadCount > 0 ? unreadCount : undefined },
        { key: 'Groups', label: 'Groups' },
        { key: 'Bots', label: 'Bots' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.logoMark}>
                        <View style={styles.logoInner} />
                    </View>
                    <Text style={styles.headerTitle}>Messages</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerAction} onPress={() => searchInputRef.current?.focus()}>
                        <Icon name="search" size={21} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerAction} onPress={() => setActionSheetVisible(true)}>
                        <Icon name="ellipsis-horizontal" size={21} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
                    <Icon
                        name="search"
                        size={16}
                        color={searchFocused ? Colors.primary : Colors.textTertiary}
                        style={{ marginLeft: 14 }}
                    />
                    <TextInput
                        ref={searchInputRef}
                        style={styles.searchInput}
                        placeholder="Search"
                        placeholderTextColor={Colors.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        selectionColor={Colors.primary}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={{ paddingRight: 12 }}>
                            <Icon name="close-circle" size={16} color={Colors.textTertiary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter Pills — real data only, no static counts */}
            <View style={styles.filterWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                    {filterTabs.map((tab) => {
                        const isActive = filterType === tab.key;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                style={[styles.filterTab, isActive && styles.filterTabActive]}
                                onPress={() => setFilterType(tab.key)}
                                activeOpacity={0.7}>
                                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                                    {tab.label}
                                </Text>
                                {tab.badge !== undefined && tab.badge > 0 && (
                                    <View style={[styles.filterBadge, isActive && styles.filterBadgeActive]}>
                                        <Text style={[styles.filterBadgeText, isActive && styles.filterBadgeTextActive]}>
                                            {tab.badge}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Chat List */}
            <FlatList
                data={filteredChats}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={!isLoadingChats ? renderEmpty : null}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
                }
                contentContainerStyle={filteredChats.length === 0 ? [styles.emptyList, { flex: 1 }] : undefined}
                showsVerticalScrollIndicator={false}
            />

            {/* Compose FAB */}
            <Animated.View style={[styles.fabWrapper, { transform: [{ scale: fabScale }] }]}>
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('NewChat')}
                    activeOpacity={0.85}>
                    <Icon name="create-outline" size={24} color={Colors.background} />
                </TouchableOpacity>
            </Animated.View>

            {/* Global Header Action Sheet */}
            {actionSheetVisible && (
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalDismissArea} onPress={() => setActionSheetVisible(false)} />
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHandle} />
                        <TouchableOpacity style={styles.sheetActionRow} onPress={() => { setActionSheetVisible(false); Alert.alert('Coming Soon', 'Group creation in development'); }}>
                            <View style={styles.sheetActionIconContainer}><Icon name="people-outline" size={22} color={Colors.textPrimary} /></View>
                            <Text style={styles.sheetActionText}>New Group</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.sheetActionRow} onPress={() => { setActionSheetVisible(false); Alert.alert('Coming Soon', 'Secret Chats in development'); }}>
                            <View style={[styles.sheetActionIconContainer, { backgroundColor: Colors.primaryDim }]}>
                                <Icon name="lock-closed-outline" size={22} color={Colors.primary} />
                            </View>
                            <Text style={styles.sheetActionText}>New Secret Chat</Text>
                        </TouchableOpacity>
                        <View style={styles.sheetDivider} />
                        <TouchableOpacity style={styles.sheetActionRow} onPress={() => setActionSheetVisible(false)}>
                            <View style={styles.sheetActionIconContainer}><Icon name="checkmark-done-outline" size={22} color={Colors.textPrimary} /></View>
                            <Text style={styles.sheetActionText}>Mark All as Read</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Specific Chat Context Menu Sheet */}
            {chatContextMenu.visible && chatContextMenu.chat && (
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalDismissArea} onPress={() => setChatContextMenu({ visible: false, chat: null })} />
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHandle} />

                        <View style={styles.contextHeader}>
                            <Text style={styles.contextTitle} numberOfLines={1}>{chatContextMenu.chat.otherUser?.displayName || 'Chat Options'}</Text>
                        </View>

                        <TouchableOpacity style={styles.sheetActionRow} onPress={() => handlePinMuteToggle('pin')}>
                            <View style={styles.sheetActionIconContainer}>
                                <Icon name={chatSettings.pinnedChats.includes(chatContextMenu.chat.id) ? "pin" : "pin-outline"} size={22} color={Colors.textPrimary} />
                            </View>
                            <Text style={styles.sheetActionText}>
                                {chatSettings.pinnedChats.includes(chatContextMenu.chat.id) ? "Unpin from Top" : "Pin to Top"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sheetActionRow} onPress={() => handlePinMuteToggle('mute')}>
                            <View style={styles.sheetActionIconContainer}>
                                <Icon name={chatSettings.mutedChats.includes(chatContextMenu.chat.id) ? "volume-high-outline" : "volume-mute-outline"} size={22} color={Colors.textPrimary} />
                            </View>
                            <Text style={styles.sheetActionText}>
                                {chatSettings.mutedChats.includes(chatContextMenu.chat.id) ? "Unmute Notifications" : "Mute Notifications"}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.sheetDivider} />

                        <TouchableOpacity style={styles.sheetActionRow} onPress={() => handleDeleteChat(chatContextMenu.chat!)}>
                            <View style={[styles.sheetActionIconContainer, { backgroundColor: Colors.dangerDim }]}>
                                <Icon name="trash-outline" size={22} color={Colors.error} />
                            </View>
                            <Text style={[styles.sheetActionText, { color: Colors.error }]}>Delete Chat</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    // Header
    header: {
        height: 58,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logoMark: {
        width: 30,
        height: 30,
        borderRadius: 9,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.55,
        shadowRadius: 8,
        elevation: 6,
    },
    logoInner: {
        width: 12,
        height: 12,
        borderRadius: 3,
        backgroundColor: Colors.background,
        opacity: 0.6,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    headerAction: {
        width: 38,
        height: 38,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 2,
    },

    // Search
    searchContainer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceElevated,
        borderRadius: BorderRadius.full,
        height: 40,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    searchBarFocused: { borderColor: Colors.primary },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: Colors.textPrimary,
        marginLeft: 10,
        padding: 0,
    },

    // Filter pills
    filterWrapper: { paddingBottom: 8 },
    filterContent: { paddingHorizontal: 16, gap: 8 },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        height: 32,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    filterTabActive: {
        backgroundColor: Colors.primaryDim,
        borderColor: Colors.primary,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    filterTextActive: { color: Colors.primary },
    filterBadge: {
        backgroundColor: Colors.surfaceBright,
        borderRadius: 10,
        paddingHorizontal: 6,
        height: 17,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
    },
    filterBadgeActive: { backgroundColor: Colors.primary },
    filterBadgeText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '700' },
    filterBadgeTextActive: { color: Colors.background },

    // Empty state
    emptyList: { justifyContent: 'center' },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 48,
        paddingTop: 16,
    },
    emptyIconBg: {
        width: 84,
        height: 84,
        borderRadius: BorderRadius.xxl,
        backgroundColor: Colors.primaryDim,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,200,150,0.2)',
    },
    emptyTitle: {
        fontSize: 19,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 21,
    },

    // FAB
    fabWrapper: {
        position: 'absolute',
        bottom: 28,
        right: 22,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 12,
    },

    // Swipe delete
    deleteAction: {
        backgroundColor: Colors.danger,
        justifyContent: 'center',
        alignItems: 'center',
        width: 78,
        height: '100%',
    },
    deleteText: { color: 'white', fontWeight: '600', fontSize: 11, marginTop: 4 },

    // Modals
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.overlayLight,
        justifyContent: 'flex-end',
        zIndex: 10,
    },
    modalDismissArea: { flex: 1 },
    bottomSheet: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        paddingTop: 12,
    },
    sheetHandle: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: Colors.divider,
        alignSelf: 'center',
        marginBottom: 20,
    },
    contextHeader: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: 12,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
        alignItems: 'center',
    },
    contextTitle: {
        ...Typography.h4,
        color: Colors.textPrimary,
    },
    sheetActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: Spacing.xl,
    },
    sheetActionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surfaceBright,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    sheetActionText: { ...Typography.body, color: Colors.textPrimary, fontWeight: '500' },
    sheetDivider: { height: 1, backgroundColor: Colors.divider, marginLeft: 76 },
});

export default ChatListScreen;
