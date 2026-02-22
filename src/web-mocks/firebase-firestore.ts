const firestoreMock = () => ({
    collection: () => ({
        doc: () => ({
            set: async () => { },
            get: async () => ({ exists: false, data: () => ({}) }),
            update: async () => { },
            onSnapshot: (callback: any) => {
                callback({ docs: [] });
                return () => { };
            },
            collection: () => ({
                orderBy: () => ({
                    onSnapshot: (callback: any) => {
                        callback({ docs: [] });
                        return () => { };
                    }
                }),
                add: async () => { },
            })
        }),
        where: () => ({
            onSnapshot: (callback: any) => {
                callback({ docs: [] });
                return () => { };
            }
        })
    }),
});

firestoreMock.FieldValue = {
    serverTimestamp: () => new Date(),
};

export default firestoreMock;
