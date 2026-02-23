import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useSettingsStore } from '../store/settingsStore';

export const notificationService = {
    /**
     * Request permissions (required for iOS and Android 13+)
     */
    requestPermission: async () => {
        try {
            if (Platform.OS === 'ios') {
                const authStatus = await messaging().requestPermission();
                const enabled =
                    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
                return enabled;
            } else {
                const settings = await notifee.requestPermission();
                return settings.authorizationStatus >= 1;
            }
        } catch (error) {
            console.error('[notificationService.requestPermission]', error);
            return false;
        }
    },

    /**
     * Set up Android Notification Channels
     */
    setupChannels: async () => {
        try {
            await notifee.createChannel({
                id: 'messages_full',
                name: 'Chat Messages (Sound & Vibrate)',
                importance: AndroidImportance.HIGH,
                sound: 'default',
                vibration: true,
            });
            await notifee.createChannel({
                id: 'messages_sound',
                name: 'Chat Messages (Sound Only)',
                importance: AndroidImportance.HIGH,
                sound: 'default',
                vibration: false,
            });
            await notifee.createChannel({
                id: 'messages_vibrate',
                name: 'Chat Messages (Vibrate Only)',
                importance: AndroidImportance.HIGH,
                sound: undefined,
                vibration: true,
            });
            await notifee.createChannel({
                id: 'messages_silent',
                name: 'Chat Messages (Silent)',
                importance: AndroidImportance.DEFAULT,
                sound: undefined,
                vibration: false,
            });
            await notifee.createChannel({
                id: 'default',
                name: 'Default Channel',
                importance: AndroidImportance.DEFAULT,
            });
        } catch (error) {
            console.error('[notificationService.setupChannels]', error);
        }
    },

    /**
     * Display a local notification
     */
    displayLocalNotification: async (title: string, body: string, data?: any) => {
        try {
            const { notifications } = useSettingsStore.getState();
            const { privateChats, groupChats, inAppSounds, inAppVibrate, inAppPreview } = notifications;

            // 1. Check if we should notify at all based on chat type
            const isGroup = data?.isGroup === true;
            if (isGroup && !groupChats) return; // Group chat notifications disabled
            if (!isGroup && !privateChats && data?.chatId) return; // Private chat notifications disabled

            // 2. Determine display text based on Preview settings
            const displayTitle = inAppPreview ? title : 'Telegram Clone';
            const displayBody = inAppPreview ? body : 'New Message';

            // 3. Determine Android Channel based on Sound & Vibrate settings
            let channelId = 'messages_silent';
            if (inAppSounds && inAppVibrate) channelId = 'messages_full';
            else if (inAppSounds && !inAppVibrate) channelId = 'messages_sound';
            else if (!inAppSounds && inAppVibrate) channelId = 'messages_vibrate';

            await notifee.displayNotification({
                title: displayTitle,
                body: displayBody,
                data,
                android: {
                    channelId: channelId,
                    smallIcon: 'ic_launcher', // Default React Native icon; replace if needed
                    pressAction: {
                        id: 'default',
                    },
                },
                ios: {
                    foregroundPresentationOptions: {
                        badge: true, // we handle badge number separately via updateBadgeCount
                        sound: inAppSounds,
                        banner: true,
                        list: true,
                    },
                },
            });
        } catch (error) {
            console.error('[notificationService.displayLocalNotification]', error);
        }
    },

    /**
     * Update app badge count based on settings
     */
    updateBadgeCount: async (count: number) => {
        try {
            const { notifications } = useSettingsStore.getState();
            if (notifications.badgeAppIcon) {
                await notifee.setBadgeCount(count);
            } else {
                await notifee.setBadgeCount(0);
            }
        } catch (error) {
            console.error('[notificationService.updateBadgeCount]', error);
        }
    },

    /**
     * Save the FCM Token to the user's Firestore document
     */
    updateUserToken: async (userId: string) => {
        try {
            // Get the device token
            const token = await messaging().getToken();
            if (token) {
                await firestore().collection('users').doc(userId).update({
                    fcmToken: token,
                });
            }

            // Listen to whether the token changes
            return messaging().onTokenRefresh(async (newToken) => {
                await firestore().collection('users').doc(userId).update({
                    fcmToken: newToken,
                });
            });
        } catch (error) {
            console.error('[notificationService.updateUserToken]', error);
            // Return a dummy unsubscribe function if an error occurs
            return () => { };
        }
    },

    /**
     * Set up background message handler
     */
    setupBackgroundHandler: () => {
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('Message handled in the background!', remoteMessage);
            // Notifee can also display a notification here if needed, 
            // but Firebase usually displays data messages automatically 
            // if they contain a "notification" payload.
        });

        notifee.onBackgroundEvent(async ({ type, detail }) => {
            const { notification, pressAction } = detail;
            if (type === EventType.ACTION_PRESS && pressAction?.id) {
                console.log('User pressed background notification', notification);
                // Remove the notification
                if (notification?.id) {
                    await notifee.cancelNotification(notification.id);
                }
            }
        });
    }
};
