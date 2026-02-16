import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { ChatStackParamList, User } from '../../constants/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore, useChatStore } from '../../store';
import { userService } from '../../services/userService';
import Avatar from '../../components/common/Avatar';

type NavProp = StackNavigationProp<ChatStackParamList, 'NewChat'>;

const NewChatScreen: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const { user } = useAuthStore();
    const { createChat } = useChatStore();
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const allUsers = await userService.getAllUsers(user.id);
            setUsers(allUsers);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter((u) => {
        if (!searchQuery.trim()) return true;
        return (
            u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.phoneNumber?.includes(searchQuery)
        );
    });

    const handleUserPress = async (otherUser: User) => {
        if (!user?.id) return;
        try {
            const chatId = await createChat(user.id, otherUser.id);
            navigation.replace('Chat', { chatId, otherUser });
        } catch (error) {
            console.error('Failed to create chat:', error);
        }
    };

    const renderItem = ({ item }: { item: User }) => (
        <TouchableOpacity
            style={styles.userItem}
            onPress={() => handleUserPress(item)}
            activeOpacity={0.6}>
            <Avatar
                uri={item.photoURL}
                name={item.displayName}
                size={48}
                showOnline
                online={item.online}
            />
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.displayName}</Text>
                <Text style={styles.userPhone}>{item.phoneNumber}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Icon name="search" size={18} color={Colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or phone"
                        placeholderTextColor={Colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                </View>
            </View>

            {isLoading ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="people-outline" size={48} color={Colors.textSecondary} />
                            <Text style={styles.emptyText}>No users found</Text>
                        </View>
                    }
                    contentContainerStyle={
                        filteredUsers.length === 0 ? styles.emptyList : undefined
                    }
                />
            )}
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
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.divider,
    },
    userInfo: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    userName: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
    },
    userPhone: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    emptyList: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginTop: Spacing.md,
    },
});

export default NewChatScreen;
