import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import AppNavigator from './Navigation/AppNavigator';
import { AuthProvider } from './services/auth/auth.service';
import { ShiftsProvider } from './services/shifts/shifts.service';
import { NotificationProvider } from './services/notifications/notification.service';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
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
  },
});