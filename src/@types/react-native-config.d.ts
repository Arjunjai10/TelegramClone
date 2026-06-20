/**
 * Type declarations for react-native-config.
 * Values come from the .env file at the project root.
 * Add new variables here as you add them to .env.
 */
declare module 'react-native-config' {
    interface NativeConfig {
        GOOGLE_WEB_CLIENT_ID?: string;
    }

    const Config: NativeConfig;
    export default Config;
}
