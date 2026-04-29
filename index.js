/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

if (__DEV__) {
  const API_LOG_PREFIXES = [
    '[API REQUEST]',
    '[API RESPONSE]',
    '[API PARSE ERROR]',
    '[API ERROR RESPONSE]',
    '[API NETWORK ERROR]',
  ];

  const shouldPrintApiLogOnly = (args) => {
    const first = args?.[0];
    return typeof first === 'string' && API_LOG_PREFIXES.some((prefix) => first.startsWith(prefix));
  };

  const originalLog = console.log.bind(console);
  const originalInfo = console.info.bind(console);
  const originalWarn = console.warn.bind(console);
  const originalDebug = console.debug.bind(console);
  const originalError = console.error.bind(console);

  console.log = (...args) => {
    if (shouldPrintApiLogOnly(args)) {
      originalLog(...args);
    }
  };

  console.info = (...args) => {
    if (shouldPrintApiLogOnly(args)) {
      originalInfo(...args);
    }
  };

  console.warn = (...args) => {
    if (shouldPrintApiLogOnly(args)) {
      originalWarn(...args);
    }
  };

  console.debug = (...args) => {
    if (shouldPrintApiLogOnly(args)) {
      originalDebug(...args);
    }
  };

  console.error = (...args) => {
    if (shouldPrintApiLogOnly(args)) {
      originalError(...args);
    }
  };
}

AppRegistry.registerComponent(appName, () => App);
