/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigation } from './src/navigation';
import { AppProvider } from './src/context/AppContext';
import AppDialogProvider from './src/components/AppDialogProvider';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppDialogProvider>
        <AppProvider>
          <AppNavigation />
        </AppProvider>
      </AppDialogProvider>
    </GestureHandlerRootView>
  );
}
export default App;
