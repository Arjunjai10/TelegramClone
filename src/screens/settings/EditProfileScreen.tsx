import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Platform,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store';
import { userService } from '../../services/userService';
import { storageService } from '../../services/storageService';
import Avatar from '../../components/common/Avatar';

const EditProfileScreen: React.FC = () => {
    const navigation = useNavigation();
    const { user, setUser } = useAuthStore();

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [avatarUri, setAvatarUri] = useState(user?.photoURL || '');
    const [newAvatarLocal, setNewAvatarLocal] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePickAvatar = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 500,
                maxHeight: 500,
            });
            if (result.assets && result.assets[0]?.uri) {
                setNewAvatarLocal(result.assets[0].uri);
                setAvatarUri(result.assets[0].uri);
            }
        } catch (error) {
            console.warn('Image picker error:', error);
        }
    };

    const handleSave = async () => {
        if (!displayName.trim()) {
            Alert.alert('Required', 'Display name cannot be empty.');
            return;
        }
        if (!user?.id) return;

        setIsLoading(true);
        try {
            let photoURL = user.photoURL;
            if (newAvatarLocal) {
                photoURL = await storageService.uploadAvatar(user.id, newAvatarLocal);
            }

            const updatedData = {
                displayName: displayName.trim(),
                bio: bio.trim(),
                photoURL,
            };

            await userService.setUser(user.id, updatedData);
            setUser({ ...user, ...updatedData });
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.goBack()}>
                    <Icon name="close" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleSave}
                    disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color={Colors.white} size="small" />
                    ) : (
                        <Icon name="checkmark" size={26} color={Colors.white} />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled">
                {/* Avatar */}
                <TouchableOpacity
                    style={styles.avatarContainer}
                    onPress={handlePickAvatar}
                    activeOpacity={0.8}>
                    <Avatar
                        uri={avatarUri}
                        name={displayName || '?'}
                        size={100}
                    />
                    <View style={styles.cameraIcon}>
                        <Icon name="camera" size={18} color={Colors.white} />
                    </View>
                </TouchableOpacity>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Display Name</Text>
                        <TextInput
                            style={styles.input}
                            value={displayName}
                            onChangeText={setDisplayName}
                            placeholder="Your name"
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.input, styles.bioInput]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Tell something about yourself"
                            placeholderTextColor={Colors.textSecondary}
                            multiline
                            maxLength={150}
                        />
                        <Text style={styles.charCount}>
                            {bio.length}/150
                        </Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone</Text>
                        <Text style={styles.readonlyText}>
                            {user?.phoneNumber || 'Not set'}
                        </Text>
                    </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.headerBg,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 10,
        paddingBottom: 12,
        paddingHorizontal: Spacing.sm,
    },
    headerButton: {
        padding: Spacing.sm,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...Typography.h3,
        color: Colors.white,
    },
    scrollContent: {
        paddingHorizontal: Spacing.xxl,
        paddingTop: Spacing.xxl,
        paddingBottom: Spacing.xxxl,
    },
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: Spacing.xxxl,
        position: 'relative',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2.5,
        borderColor: Colors.white,
    },
    form: {},
    inputGroup: {
        marginBottom: Spacing.xl,
    },
    label: {
        ...Typography.caption,
        color: Colors.primary,
        marginBottom: Spacing.xs,
        fontWeight: '600',
    },
    input: {
        borderBottomWidth: 1.5,
        borderBottomColor: Colors.border,
        paddingVertical: Spacing.md,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    bioInput: {
        minHeight: 50,
        textAlignVertical: 'top',
    },
    charCount: {
        ...Typography.small,
        color: Colors.textSecondary,
        textAlign: 'right',
        marginTop: 4,
    },
    readonlyText: {
        ...Typography.body,
        color: Colors.textSecondary,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1.5,
        borderBottomColor: Colors.border,
    },
});

export default EditProfileScreen;
