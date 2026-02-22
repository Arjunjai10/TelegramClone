import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Minimal polyfills or initializers for web can go here
if (module.hot) {
    module.hot.accept();
}

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
    initialProps: {},
    rootTag: document.getElementById('root'),
});
