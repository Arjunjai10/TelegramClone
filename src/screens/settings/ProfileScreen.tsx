import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../store';
import Avatar from '../../components/common/Avatar';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen: React.FC = () => {
    const { user } = useAuthStore();
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity>
                    <Icon name="grid-outline" size={24} color={Colors.white} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Icon name="ellipsis-vertical" size={24} color={Colors.white} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileSection}>
                    <Avatar
                        uri={user?.photoURL}
                        name={user?.displayName || 'User'}
                        size={120}
                    />
                    <Text style={styles.profileName}>{user?.displayName || 'Rick Grimes'}</Text>
                    <Text style={styles.onlineStatus}>online</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionButton}>
                        <View style={styles.actionIconContainer}>
                            <Icon name="camera" size={24} color={Colors.white} />
                        </View>
                        <Text style={styles.actionText}>Set Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <View style={styles.actionIconContainer}>
                            <Icon name="pencil" size={24} color={Colors.white} />
                        </View>
                        <Text style={styles.actionText}>Edit Info</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Settings')}>
                        <View style={styles.actionIconContainer}>
                            <Icon name="settings" size={24} color={Colors.white} />
                        </View>
                        <Text style={styles.actionText}>Settings</Text>
                    </TouchableOpacity>
                </View>

                {/* Profile Detail Box */}
                <View style={styles.detailBox}>
                    <Text style={styles.phoneNumber}>{user?.phoneNumber || '+91 9345999936'}</Text>
                    <Text style={styles.phoneLabel}>Mobile</Text>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                        <Text style={styles.activeTabText}>Posts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tab}>
                        <Text style={styles.tabText}>Archived Posts</Text>
                    </TouchableOpacity>
                </View>

                {/* Empty State */}
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No posts yet...</Text>
                    <Text style={styles.emptySubtitle}>
                        Publish photos and videos to display on your profile page
                    </Text>
                    <TouchableOpacity style={styles.addPostButton}>
                        <Icon name="camera" size={20} color={Colors.white} style={{ marginRight: 8 }} />
                        <Text style={styles.addPostText}>Add a post</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
    scrollContent: {
        paddingBottom: 40,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.white,
        marginTop: 16,
    },
    onlineStatus: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
        marginTop: 10,
    },
    actionButton: {
        alignItems: 'center',
        flex: 1,
    },
    actionIconContainer: {
        width: 100,
        height: 60, // Taller buttons like screenshot
        backgroundColor: '#1C2A36', // Secondary background for buttons
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '500',
    },
    detailBox: {
        backgroundColor: Colors.surface,
        margin: 16,
        borderRadius: 16,
        padding: 16,
    },
    phoneNumber: {
        fontSize: 20, // Slightly larger
        color: Colors.white,
        fontWeight: '600',
    },
    phoneLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
        marginTop: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary,
    },
    tabText: {
        color: Colors.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    activeTabText: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.white,
    },
    emptySubtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 12,
    },
    addPostButton: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 24,
        marginTop: 30,
        alignItems: 'center',
    },
    addPostText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
});

export default ProfileScreen;
