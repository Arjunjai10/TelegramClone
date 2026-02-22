export const getAuth = () => ({
    currentUser: null,
    signInWithPhoneNumber: async () => ({
        confirm: async () => ({ user: { uid: 'web-user' } }),
    }),
    signOut: async () => { },
});

export const signInWithCredential = async () => ({ user: { uid: 'web-user' } });
export const onAuthStateChanged = (auth: any, callback: any) => {
    callback(null);
    return () => { };
};
export const signOut = async () => { };
export const GoogleAuthProvider = {
    credential: () => ({}),
};
export const signInWithPhoneNumber = async () => ({
    confirm: async () => ({ user: { uid: 'web-user' } })
});
