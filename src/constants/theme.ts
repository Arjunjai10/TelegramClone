export const Colors = {
    primary: '#0088CC',
    primaryDark: '#006699',
    primaryLight: '#54B4E8',
    secondary: '#2AABEE',

    // Message bubbles
    sentBubble: '#EFFDDE',
    sentBubbleText: '#000000',
    receivedBubble: '#FFFFFF',
    receivedBubbleText: '#000000',

    // Dark mode message bubbles
    sentBubbleDark: '#2B5278',
    sentBubbleTextDark: '#FFFFFF',
    receivedBubbleDark: '#182533',
    receivedBubbleTextDark: '#FFFFFF',

    // Backgrounds
    background: '#FFFFFF',
    backgroundDark: '#17212B',
    surfaceLight: '#F0F2F5',
    surfaceDark: '#0E1621',
    headerBg: '#517DA2',
    headerBgDark: '#17212B',

    // Text
    textPrimary: '#000000',
    textPrimaryDark: '#FFFFFF',
    textSecondary: '#707579',
    textSecondaryDark: '#6D7F8F',
    textAccent: '#0088CC',

    // UI
    border: '#E0E0E0',
    borderDark: '#263849',
    divider: '#ECECEC',
    dividerDark: '#1C2A36',
    inputBg: '#F0F2F5',
    inputBgDark: '#242F3D',
    badge: '#4DCD5E',
    online: '#4DCD5E',
    danger: '#E53935',
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
    transparent: 'transparent',

    // Misc
    checkmark: '#4FC3F7',
    timestamp: '#A0ADB8',
};

export const Typography = {
    h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: 0.3 },
    h2: { fontSize: 22, fontWeight: '600' as const, letterSpacing: 0.2 },
    h3: { fontSize: 18, fontWeight: '600' as const, letterSpacing: 0.1 },
    body: { fontSize: 16, fontWeight: '400' as const, letterSpacing: 0 },
    bodyBold: { fontSize: 16, fontWeight: '600' as const, letterSpacing: 0 },
    caption: { fontSize: 13, fontWeight: '400' as const, letterSpacing: 0.1 },
    small: { fontSize: 11, fontWeight: '400' as const, letterSpacing: 0.2 },
    button: { fontSize: 16, fontWeight: '600' as const, letterSpacing: 0.5 },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const BorderRadius = {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 22,
    full: 9999,
};

export const Shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 12,
        elevation: 6,
    },
};
