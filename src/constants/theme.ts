// ─── Obsidian × Emerald — Custom Premium Dark Theme ───────────────────────────

export const Colors = {
    // ── Core Backgrounds ──────────────────────────────────────────────────────
    background: '#09090F',          // Main deep obsidian
    backgroundSecondary: '#0E0E17', // Slightly lighter obsidian
    surface: '#131720',             // Card / header surface
    surfaceElevated: '#1A2030',     // Inputs, modals, elevated cards
    surfaceBright: '#212840',       // Hover states, separators

    // ── Accent — Emerald ──────────────────────────────────────────────────────
    primary: '#00C896',             // Emerald — primary CTA & active state
    primaryDark: '#009B73',         // Darker emerald
    primaryLight: '#00E5AC',        // Lighter emerald shimmer
    primaryDim: 'rgba(0,200,150,0.12)',  // Tinted icon backgrounds

    // ── Accent — Gold ─────────────────────────────────────────────────────────
    gold: '#E8B86D',                // Warm gold — badges, highlights
    goldDim: 'rgba(232,184,109,0.15)', // Tinted gold bg

    // ── Message Bubbles ───────────────────────────────────────────────────────
    sentBubble: '#0D3D2A',          // Deep emerald for sent
    sentBubbleText: '#E8F8F2',      // Soft white-green
    receivedBubble: '#1A2030',      // Elevated surface for received
    receivedBubbleText: '#E8ECF4',  // Soft white

    // ── Text ─────────────────────────────────────────────────────────────────
    textPrimary: '#F0F4F8',         // Crisp near-white
    textSecondary: '#5A6478',       // Muted slate-blue
    textTertiary: '#3A4255',        // Very muted, barely visible
    textAccent: '#00C896',          // Emerald text links
    textGold: '#E8B86D',            // Gold text

    // ── UI States ─────────────────────────────────────────────────────────────
    border: 'rgba(255,255,255,0.06)',
    borderBright: 'rgba(255,255,255,0.12)',
    divider: 'rgba(255,255,255,0.04)',
    inputBg: '#1A2030',
    badge: '#00C896',               // Emerald badge (default)
    badgeGold: '#E8B86D',           // Gold badge (unread)
    badgeMuted: '#3A4255',
    online: '#00C896',              // Online dot — emerald
    danger: '#FF4757',              // Red for destructive
    dangerDim: 'rgba(255,71,87,0.12)',

    // ── Misc ──────────────────────────────────────────────────────────────────
    checkmark: '#00C896',
    timestamp: '#3A4255',
    timestampSent: '#4A9B78',
    pinned: '#5A6478',
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.4)',
    transparent: 'transparent',

    // ── Header ────────────────────────────────────────────────────────────────
    headerBg: '#131720',
    headerBgDark: '#09090F',
};

export const Typography = {
    h1: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.5 },
    h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
    h3: { fontSize: 19, fontWeight: '700' as const, letterSpacing: -0.2 },
    h4: { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.1 },
    body: { fontSize: 16, fontWeight: '400' as const, letterSpacing: 0 },
    bodyBold: { fontSize: 16, fontWeight: '600' as const, letterSpacing: 0 },
    caption: { fontSize: 13, fontWeight: '400' as const, letterSpacing: 0.1 },
    captionBold: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.2 },
    small: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.3 },
    button: { fontSize: 16, fontWeight: '700' as const, letterSpacing: 0.4 },
    display: { fontSize: 38, fontWeight: '900' as const, letterSpacing: -1.5 },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
};

export const BorderRadius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    xxl: 32,
    full: 9999,
};

export const Shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 10,
    },
    emerald: {
        shadowColor: '#00C896',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    gold: {
        shadowColor: '#E8B86D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
};
