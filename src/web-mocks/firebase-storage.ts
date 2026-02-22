const storageMock = () => ({
    ref: () => ({
        putFile: async () => ({}),
        getDownloadURL: async () => 'http://mock-url.com/image.png',
    }),
});

export default storageMock;
