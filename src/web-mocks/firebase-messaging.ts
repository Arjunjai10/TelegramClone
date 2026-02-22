const messagingMock = () => ({
    requestPermission: async () => 1,
    getToken: async () => 'mock-token',
    onTokenRefresh: () => () => { },
    setBackgroundMessageHandler: () => { },
    onMessage: () => () => { },
});

messagingMock.AuthorizationStatus = {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
};

export default messagingMock;
