const onlineState = {
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    details: null,
};

const NetInfo = {
    fetch: async () => onlineState,
    addEventListener: (_handler: (state: typeof onlineState) => void) => () => { },
    useNetInfo: () => onlineState,
};

export default NetInfo;
