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
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                    {
                        title: 'Contacts',
                        message: 'This app would like to view your contacts to find friends.',
                        buttonPositive: 'OK',
                    },
                );

                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    const deviceContacts = await Contacts.getAll();
                    const phoneNumbers = deviceContacts
                        .flatMap(c => c.phoneNumbers)
                        .map(p => p.number.replace(/[^\d+]/g, '')) // basic normalization
                        .filter(n => n.length >= 10); // filter invalid

                    // Remove duplicates
                    const uniqueNumbers = [...new Set(phoneNumbers)];

                    if (uniqueNumbers.length > 0) {
                        const matchedUsers = await userService.getUsersByPhoneNumbers(uniqueNumbers);
                        // Filter out self
                        setContacts(matchedUsers.filter(u => u.id !== user.id));
                    } else {
                        setContacts([]);
                    }
                } else {
                    Alert.alert('Permission Denied', 'Cannot sync contacts without permission.');
                }
            }
        } catch (error) {
            console.error('Failed to load contacts:', error);
            Alert.alert('Error', 'Failed to sync contacts.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredContacts = contacts.filter((c) => {
        if (!searchQuery.trim()) return true;
        return c.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Group contacts by first letter
    const groupedContacts = filteredContacts.reduce((groups, contact) => {
        const letter = (contact.displayName?.[0] || '#').toUpperCase();
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(contact);
        return groups;
    }, {} as Record<string, User[]>);

    const sections = Object.keys(groupedContacts)
        .sort()
        .map((letter) => ({
            letter,
            data: groupedContacts[letter],
        }));

    const handleContactPress = async (contact: User) => {
        if (!user?.id) return;
        try {
            const chatId = await createChat(user.id, contact.id);
            navigation.navigate('ChatStack', {
                screen: 'Chat',
                params: {
                    chatId,
                    otherUser: contact,
                },
            });
        } catch (error) {
            // Error alert already shown by chatStore
        }
    };

    const formatLastSeen = (contact: User): string => {
        if (contact.online) return 'online';
        if (contact.lastSeen) {
            const lastSeenVal = contact.lastSeen as any;
            const lastSeen = lastSeenVal?.toDate ? lastSeenVal.toDate() : new Date(lastSeenVal);
            const now = new Date();
            const diffMs = now.getTime() - lastSeen.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 1) return 'last seen just now';
            if (diffMins < 60) return `last seen ${diffMins}m ago`;
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `last seen ${diffHours}h ago`;
            const diffDays = Math.floor(diffHours / 24);
            return `last seen ${diffDays}d ago`;
        }
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
                size={44}
                showOnline
                online={contact.online}
            />
            <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.displayName}</Text>
                <Text style={styles.contactStatus}>
                    {formatLastSeen(contact)}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Contacts</Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Icon name="search" size={18} color={Colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search contacts"
                        placeholderTextColor={Colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {isLoading ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={sections}
                    keyExtractor={(item) => item.letter}
                    renderItem={({ item }) => (
                        <View>
                            <Text style={styles.sectionHeader}>{item.letter}</Text>
                            {item.data.map(renderContact)}
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="people-outline" size={48} color={Colors.textSecondary} />
                            <Text style={styles.emptyText}>No contacts found on TelegramClone</Text>
                            <Text style={styles.emptySubText}>Invite your friends to join!</Text>
                        </View>
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
    header: {
        backgroundColor: Colors.headerBg,
        paddingHorizontal: Spacing.lg,
        paddingTop: STATUSBAR_HEIGHT,
        paddingBottom: Spacing.lg,
    },
    headerTitle: {
        ...Typography.h2,
        color: Colors.white,
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
    sectionHeader: {
        ...Typography.caption,
        color: Colors.primary,
        fontWeight: '700',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.surfaceLight,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    contactInfo: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    contactName: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
    },
    contactStatus: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        color: Colors.textSecondary,
        marginTop: Spacing.md,
    },
    emptySubText: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: Spacing.sm,
    },
});

export default ContactsScreen;
