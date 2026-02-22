/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { notificationService } from './src/services/notificationService';

// Initialize background handlers before App launches
notificationService.setupBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
