import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store';
import { userService } from '../../services/userService';
import { storageService } from '../../services/storageService';
import Avatar from '../../components/common/Avatar';
import firestore from '@react-native-firebase/firestore';

const ProfileSetupScreen: React.FC = () => {
    const { firebaseUser, setUser, setIsProfileComplete } = useAuthStore();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUri, setAvatarUri] = useState('');
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
                setAvatarUri(result.assets[0].uri);
            }
        } catch (error) {
            console.warn('Image picker error:', error);
        }
    };

    const handleComplete = async () => {
        if (!firstName.trim()) {
            Alert.alert('Required', 'Please enter your first name.');
            return;
        }

        if (!firebaseUser) {
            Alert.alert('Error', 'Authentication error. Please try again.');
            return;
        }

        setIsLoading(true);
        try {
            let photoURL = '';
            if (avatarUri) {
                const upload = await storageService.uploadAvatar(firebaseUser.uid, avatarUri);
                if (upload.blocked) {
                    Alert.alert('Feature Unavailable', 'Image uploads require Firebase Storage (Blaze plan). Your profile will be saved without a photo.');
                } else {
                    photoURL = upload.url;
                }
            }

            const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
            const userData = {
                id: firebaseUser.uid,
                displayName,
                phoneNumber: firebaseUser.phoneNumber || '',
                photoURL,
                bio: bio.trim(),
                online: true,
                lastSeen: firestore.FieldValue.serverTimestamp() as any,
                createdAt: firestore.FieldValue.serverTimestamp() as any,
            };

            await userService.setUser(firebaseUser.uid, userData);
            setUser(userData as any);
            setIsProfileComplete(true);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create profile.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.title}>Your Profile</Text>
                    <Text style={styles.subtitle}>
                        Enter your name and add a profile picture
                    </Text>
                </View>

                {/* Avatar */}
                <TouchableOpacity
                    style={styles.avatarContainer}
                    onPress={handlePickAvatar}
                    activeOpacity={0.8}>
                    <Avatar
                        uri={avatarUri}
                        name={firstName || '?'}
                        size={100}
                    />
                    <View style={styles.cameraIcon}>
                        <Icon name="camera" size={18} color={Colors.white} />
                    </View>
                </TouchableOpacity>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>First name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="First name"
                            placeholderTextColor={Colors.textSecondary}
                            value={firstName}
                            onChangeText={setFirstName}
                            autoFocus
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Last name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Last name (optional)"
                            placeholderTextColor={Colors.textSecondary}
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.input, styles.bioInput]}
                            placeholder="Tell something about yourself"
                            placeholderTextColor={Colors.textSecondary}
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            maxLength={150}
                        />
                    </View>
                </View>

                {/* Complete Button */}
                <TouchableOpacity
                    style={[styles.completeButton, isLoading && styles.buttonDisabled]}
                    onPress={handleComplete}
                    disabled={isLoading}
                    activeOpacity={0.8}>
                    {isLoading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.completeText}>START MESSAGING</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: Spacing.xxl,
        paddingTop: 80,
        paddingBottom: Spacing.xxxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    title: {
        ...Typography.h2,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
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
    form: {
        marginBottom: Spacing.xxl,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
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
    completeButton: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.lg,
        alignItems: 'center',
        height: 52,
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    completeText: {
        ...Typography.button,
        color: Colors.white,
    },
});

export default ProfileSetupScreen;
