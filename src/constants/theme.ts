export const Colors = {
    primary: '#2AABEE', // Telegram Blue
    primaryDark: '#1D3243', // Tab bubble / Active state
    primaryLight: '#54B4E8',
    secondary: '#2AABEE',

    // Message bubbles
    sentBubble: '#2B5278',
    sentBubbleText: '#FFFFFF',
    receivedBubble: '#182533',
    receivedBubbleText: '#FFFFFF',

    // Backgrounds
    background: '#0E1621', // Main dark background (Darker than before)
    backgroundSecondary: '#17212B', // Header background
    surface: '#17212B', // Section backgrounds
    surfaceDark: '#0E1621',
    headerBg: '#17212B',
    headerBgDark: '#0E1621',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#6D7F8F', // Muted blue-grey text
    textAccent: '#2AABEE',
    textLink: '#2AABEE',

    // UI
    border: '#1C2A36',
    borderDark: '#1C2A36',
    divider: '#0E1621',
    inputBg: '#1F2933', // Search bar background
    badge: '#2AABEE', // Unread badges
    badgeMuted: '#6D7F8F',
    online: '#2AABEE',
    danger: '#E53935',
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
    transparent: 'transparent',

    // Misc
    checkmark: '#2AABEE',
    timestamp: '#6D7F8F',
    pinned: '#6D7F8F',
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
