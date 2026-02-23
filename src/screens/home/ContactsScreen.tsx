import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Platform,
    ActivityIndicator,
    Alert,
    PermissionsAndroid,
    ScrollView,
    Share,
} from 'react-native';
import Contacts from 'react-native-contacts';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { User } from '../../constants/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore, useChatStore } from '../../store';
import { userService } from '../../services/userService';
import Avatar from '../../components/common/Avatar';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 10;

const ContactsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { user } = useAuthStore();
    const { createChat } = useChatStore();
    const [contacts, setContacts] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            let hasPermission = false;

            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                    {
                        title: 'Contacts',
                        message: 'This app would like to view your contacts to find friends.',
                        buttonPositive: 'OK',
                    },
                );
                hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                // iOS
                const status = await Contacts.requestPermission();
                hasPermission = status === 'authorized';
            }

            if (hasPermission) {
                const deviceContacts = await Contacts.getAll();
                const phoneNumbers = deviceContacts
                    .flatMap(c => c.phoneNumbers)
                    .map(p => p.number.replace(/[^\d+]/g, ''))
                    .filter(n => n.length >= 10);

                const uniqueNumbers = [...new Set(phoneNumbers)];

                if (uniqueNumbers.length > 0) {
                    const matchedUsers = await userService.getUsersByPhoneNumbers(uniqueNumbers);

                    if (matchedUsers.length > 0) {
                        setContacts(matchedUsers.filter(u => u.id !== user.id));
                    } else {
                        // Fallback: If no contacts match, show some recommended users
                        const allUsers = await userService.getAllUsers(user.id);
                        setContacts(allUsers);
                    }
                } else {
                    // Fallback if device has no contacts
                    const allUsers = await userService.getAllUsers(user.id);
                    setContacts(allUsers);
                }
            } else {
                // Fallback if permission denied
                const allUsers = await userService.getAllUsers(user.id);
                setContacts(allUsers);
            }
        } catch (error) {
            console.error('Failed to load contacts:', error);
            // Fallback on error
            try {
                const allUsers = await userService.getAllUsers(user.id);
                setContacts(allUsers);
            } catch (e) { }
        } finally {
            setIsLoading(false);
        }
    };

    const filteredContacts = contacts
        .filter((c) => {
            if (!searchQuery.trim()) return true;
            return c.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
        })
        .sort((a, b) => {
            // Sort by online status first
            if (a.online === b.online) {
                // If both are same online status, sort by lastSeen descending
                const aTime = a.lastSeen?.toMillis() || 0;
                const bTime = b.lastSeen?.toMillis() || 0;
                return bTime - aTime;
            }
            // Online users come before offline users
            return a.online ? -1 : 1;
        });

    const handleContactPress = async (contact: User) => {
        if (!user?.id) return;
        try {
            const chatId = await createChat(user.id, contact.id);
            navigation.navigate('ChatsTab', {
                screen: 'Chat',
                params: {
                    chatId,
                    otherUser: contact,
                },
            });
        } catch (error) {
        }
    };

    const formatLastSeen = (contact: User): string => {
        if (contact.online) return 'online';
        return 'last seen recently';
    };

    const renderContact = (contact: User) => (
        <TouchableOpacity
            key={contact.id}
            style={styles.contactItem}
            activeOpacity={0.6}
            onPress={() => handleContactPress(contact)}>
            <Avatar
                uri={contact.photoURL}
                name={contact.displayName}
                size={48}
                showOnline={contact.online}
            />
            <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.displayName}</Text>
                <Text style={contact.online ? styles.contactStatusOnline : styles.contactStatus}>
                    {formatLastSeen(contact)}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No contacts found</Text>
            <Text style={styles.emptySubtitle}>
                Invite your friends to Telegram or wait for them to join!
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={loadContacts}>
                <Text style={styles.refreshButtonText}>Sync Contacts</Text>
            </TouchableOpacity>
        </View>
    );

    const handleInviteFriends = async () => {
        try {
            await Share.share({
                message: 'Join me on VChat! A secure premium messaging app built with React Native.',
                title: 'Invite to VChat',
            });
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleRecentCalls = () => {
        Alert.alert(
            'Coming Soon',
            'VoIP audio and video calls are currently in development.',
            [{ text: 'OK', style: 'cancel' }]
        );
    };

    const renderHeader = () => (
        <View>
            {/* Action Cards */}
            <View style={styles.actionCard}>
                <TouchableOpacity style={styles.actionItem} onPress={handleInviteFriends}>
                    <View style={[styles.actionIconContainer, { backgroundColor: '#2AABEE' }]}>
                        <Icon name="person-add" size={20} color={Colors.white} />
                    </View>
                    <Text style={styles.actionText}>Invite Friends</Text>
                </TouchableOpacity>
                <View style={styles.actionDivider} />
                <TouchableOpacity style={styles.actionItem} onPress={handleRecentCalls}>
                    <View style={[styles.actionIconContainer, { backgroundColor: '#4DCD5E' }]}>
                        <Icon name="call" size={20} color={Colors.white} />
                    </View>
                    <Text style={styles.actionText}>Recent calls</Text>
                </TouchableOpacity>
            </View>

            {/* Section Header */}
            <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeaderText}>Sorted by last seen time</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Contacts</Text>
                <TouchableOpacity style={styles.headerAction} onPress={loadContacts}>
                    <Icon name="refresh-outline" size={24} color={Colors.white} />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Icon name="search" size={20} color={Colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Contacts"
                        placeholderTextColor={Colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => renderContact(item)}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={!isLoading ? renderEmpty : null}
                contentContainerStyle={styles.scrollContent}
                refreshing={isLoading}
                onRefresh={loadContacts}
            />

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NewChat')}>
                <Icon name="person-add" size={24} color={Colors.white} />
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
        height: Platform.OS === 'ios' ? 88 : 56 + (StatusBar.currentHeight || 24),
        paddingTop: STATUSBAR_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: Colors.white,
    },
    headerAction: {
        padding: 4,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBg,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchInput: {
        flex: 1,
        fontSize: 17,
        color: Colors.white,
        marginLeft: 12,
        padding: 0,
    },
    scrollContent: {
        paddingBottom: 80,
    },
    actionCard: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 24,
        overflow: 'hidden',
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    actionIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionText: {
        fontSize: 17,
        fontWeight: '500',
        color: Colors.white,
    },
    actionDivider: {
        height: 1,
        backgroundColor: Colors.background,
        marginLeft: 64,
    },
    sectionHeaderContainer: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    contactInfo: {
        marginLeft: 16,
        flex: 1,
    },
    contactName: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.white,
    },
    contactStatus: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    contactStatusOnline: {
        fontSize: 14,
        color: Colors.primary,
        marginTop: 2,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: 80,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.white,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 22,
    },
    refreshButton: {
        marginTop: 24,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: Colors.primary + '20',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    refreshButtonText: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ContactsScreen;
