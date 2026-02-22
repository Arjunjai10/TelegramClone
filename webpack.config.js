const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = path.resolve(__dirname, './');

// This is needed for webpack to compile JavaScript.
// Many OSS React Native packages are not compiled to ES5 before being
// published. If you depend on uncompiled packages they may cause webpack build
// errors. To fix this webpack can be configured to compile to the necessary
// `include` path.
const babelLoaderConfiguration = {
    test: /\.(js|jsx|ts|tsx)$/,
    // Add every directory that needs to be compiled by Babel during the build.
    include: [
        path.resolve(appDirectory, 'index.web.js'),
        path.resolve(appDirectory, 'App.tsx'),
        path.resolve(appDirectory, 'src'),
        path.resolve(appDirectory, 'node_modules/react-native-vector-icons'),
        path.resolve(appDirectory, 'node_modules/@react-navigation'),
        path.resolve(appDirectory, 'node_modules/react-native-gesture-handler'),
        path.resolve(appDirectory, 'node_modules/react-native-screens'),
        path.resolve(appDirectory, 'node_modules/react-native-safe-area-context'),
        // add any other node_modules that need transpilation here
    ],
    use: {
        loader: 'babel-loader',
        options: {
            cacheDirectory: true,
            presets: ['module:@react-native/babel-preset'],
            // Remove 'react-native-web' babel plugin as it breaks RNW v0.19+
        },
    },
};

// Disable strict ESM for these old modules
const fullySpecifiedRule = {
    test: /\.m?js/,
    resolve: {
        fullySpecified: false,
    },
};

// This is needed for webpack to import static images in JavaScript files.
const imageLoaderConfiguration = {
    test: /\.(gif|jpe?g|png|svg)$/,
    use: {
        loader: 'url-loader',
        options: {
            name: '[name].[ext]',
            esModule: false,
        },
    },
};

module.exports = {
    entry: [
        path.resolve(appDirectory, 'index.web.js') // Web entry point
    ],
    output: {
        filename: 'bundle.web.js',
        path: path.resolve(appDirectory, 'dist'),
        publicPath: '/'
    },
    module: {
        rules: [
            fullySpecifiedRule,
            babelLoaderConfiguration,
            imageLoaderConfiguration,
        ],
    },
    resolve: {
        alias: {
            'react-native$': 'react-native-web',
            'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter$': 'react-native-web/dist/vendor/react-native/RCTDeviceEventEmitter',
            'react-native/Libraries/vendor/emitter/EventEmitter$': 'react-native-web/dist/vendor/react-native/emitter/EventEmitter',
            'react-native/Libraries/EventEmitter/NativeEventEmitter$': 'react-native-web/dist/vendor/react-native/NativeEventEmitter',
            'react-native/Libraries/Utilities/Platform$': 'react-native-web/dist/exports/Platform',
            'react-native/Libraries/Utilities/PolyfillFunctions$': 'react-native-web/dist/modules/PolyfillFunctions',
            // Mock out unsupported native modules on web
            '@react-native-firebase/app': path.resolve(__dirname, 'src/web-mocks/firebase-app.ts'),
            '@react-native-firebase/auth': path.resolve(__dirname, 'src/web-mocks/firebase-auth.ts'),
            '@react-native-firebase/firestore': path.resolve(__dirname, 'src/web-mocks/firebase-firestore.ts'),
            '@react-native-firebase/messaging': path.resolve(__dirname, 'src/web-mocks/firebase-messaging.ts'),
            '@react-native-firebase/storage': path.resolve(__dirname, 'src/web-mocks/firebase-storage.ts'),
            '@notifee/react-native': path.resolve(__dirname, 'src/web-mocks/notifee.ts'),
            'react-native-bootsplash': path.resolve(__dirname, 'src/web-mocks/bootsplash.ts'),
            'react-native-contacts': path.resolve(__dirname, 'src/web-mocks/contacts.ts'),
            'react-native-image-picker': path.resolve(__dirname, 'src/web-mocks/image-picker.ts'),
            '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/web-mocks/async-storage.ts'),
            '@react-native-community/netinfo': path.resolve(__dirname, 'src/web-mocks/netinfo.ts'),
            // Add other mock aliases as needed
        },
        extensions: ['.web.js', '.js', '.web.ts', '.ts', '.web.tsx', '.tsx', '.json'],
        exportsFields: [],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(appDirectory, 'public/index.html'),
        }),
    ],
    devServer: {
        historyApiFallback: {},
        hot: true,
        port: 8080,
    },
};
