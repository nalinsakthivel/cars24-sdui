/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { perf } from './src/utils/perf';

perf.mark('app_start');

AppRegistry.registerComponent(appName, () => App);
