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
                        .map(p => p.number.replace(/[^\d+]/g, ''))
                        .filter(n => n.length >= 10);

                    const uniqueNumbers = [...new Set(phoneNumbers)];

                    if (uniqueNumbers.length > 0) {
                        const matchedUsers = await userService.getUsersByPhoneNumbers(uniqueNumbers);
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

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Contacts</Text>
                <TouchableOpacity style={styles.headerAction}>
                    <Icon name="stats-chart-outline" size={24} color={Colors.white} style={{ transform: [{ rotate: '90deg' }] }} />
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

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Action Cards */}
                <View style={styles.actionCard}>
                    <TouchableOpacity style={styles.actionItem}>
                        <View style={[styles.actionIconContainer, { backgroundColor: '#2AABEE' }]}>
                            <Icon name="person-add" size={20} color={Colors.white} />
                        </View>
                        <Text style={styles.actionText}>Invite Friends</Text>
                    </TouchableOpacity>
                    <View style={styles.actionDivider} />
                    <TouchableOpacity style={styles.actionItem}>
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

                {/* Contacts List */}
                {isLoading ? (
                    <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
                ) : (
                    contacts.map(renderContact)
                )}
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={styles.fab}>
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
        height: 56,
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
});

export default ContactsScreen;
