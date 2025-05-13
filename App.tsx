import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, LogBox, Platform } from 'react-native';
import AppNavigator from './Navigation/AppNavigator';
import { AuthProvider } from './services/auth/auth.service';
import { ShiftsProvider } from './services/shifts/shifts.service';
import { NotificationProvider } from './services/notifications/notification.service';

// Ignore specific log warnings for third-party libraries
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native',
  'Possible Unhandled Promise Rejection',
  'Setting a timer for a long period',
  'expo-notifications module has not been properly initialized',
  'Found screens with the same name nested inside one another',
  '[react-native-gesture-handler]',
]);

// App Theme Constants
export const THEME = {
  colors: {
    primary: '#3498db',
    secondary: '#2ecc71',
    accent: '#f39c12',
    danger: '#e74c3c',
    background: '#f5f5f5',
    cardBackground: '#ffffff',
    text: '#2c3e50',
    textLight: '#7f8c8d',
    border: '#ddd',
  },
  fontSize: {
    small: 12,
    medium: 16,
    large: 18,
    xlarge: 24,
    xxlarge: 32,
  },
  spacing: {
    xs: 5,
    small: 10,
    medium: 15,
    large: 20,
    xlarge: 30,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    round: 50,
  }
};

export default function App() {
  // Apply fixes for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Force app to redraw on load
      setTimeout(() => {
        StatusBar.setHidden(true);
        setTimeout(() => {
          StatusBar.setHidden(false);
        }, 50);
      }, 500);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
      <AuthProvider>
        <ShiftsProvider>
          <NotificationProvider>
            <AppNavigator />
          </NotificationProvider>
        </ShiftsProvider>
      </AuthProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
});