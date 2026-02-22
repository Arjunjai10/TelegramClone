export const AndroidImportance = {
    DEFAULT: 3,
    HIGH: 4,
};

export const EventType = {
    ACTION_PRESS: 1,
};

const notifeeMock = {
    requestPermission: async () => ({ authorizationStatus: 1 }),
    createChannel: async () => 'channel-id',
    displayNotification: async () => { },
    onBackgroundEvent: () => { },
    cancelNotification: async () => { },
};

export default notifeeMock;
