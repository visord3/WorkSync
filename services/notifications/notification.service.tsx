// services/notifications/notification.service.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
// Temporarily modify this line
// import * as Device from 'expo-device';
// Replace with this temporary workaround:
const Device = { isDevice: true, modelName: "Unknown" };
import * as Notifications from 'expo-notifications';
import { useAuth } from '../auth/auth.service';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseconfig';

// Define notification types
export enum NotificationType {
  SHIFT_REMINDER = 'shift_reminder',
  SHIFT_ASSIGNED = 'shift_assigned',
  SHIFT_CHANGED = 'shift_changed',
  SHIFT_CANCELLED = 'shift_cancelled',
  ADMIN_MESSAGE = 'admin_message',
  SYSTEM = 'system'
}

// Define notification interface
export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: Timestamp;
  recipient: string;
}

// Define notification context type
type NotificationContextType = {
  expoPushToken: string | null; // Changed from string | undefined to string | null
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  requestPermissions: () => Promise<boolean>;
  sendPushNotification: (to: string, title: string, body: string, data?: any) => Promise<boolean>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
};

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Custom hook for using notifications
export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

// Notification provider component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null); // Changed to null
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // services/notifications/notification.service.tsx (continued)
  const [unreadCount, setUnreadCount] = useState(0);

  // Configure notification settings
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Register for push notifications
    registerForPushNotifications();

    // Listen for incoming notifications
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      // Handle incoming notification
      refreshNotifications();
    });

    // Listen for user interactions with notifications
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle notification response
      console.log('Notification tapped:', response);
    });

    // Clean up listeners
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  // Load notifications when user changes
  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Register for push notifications
  const registerForPushNotifications = async () => {
    if (!Device.isDevice) {
      console.log('Push notifications not available on simulator');
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for notifications');
        return;
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync();
      
      // Use null instead of undefined when token might not exist
      // This is the fix for the TypeScript error
      const tokenValue = tokenData.data || null;
      setExpoPushToken(tokenValue);

      // Store token in Firestore if user is authenticated
      if (user && tokenValue) {
        storeTokenInFirestore(tokenValue);
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  // Store token in Firestore
  const storeTokenInFirestore = async (token: string) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Check if user document exists
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Update user document with the token
        await updateDoc(userRef, {
          expoPushTokens: arrayUnion(token),
          lastUpdated: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error storing push token:', error);
    }
  };

  // Load notifications from Firestore
  const loadNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const notificationsRef = doc(db, 'notifications', user.uid);
      const notificationsDoc = await getDoc(notificationsRef);
      
      if (notificationsDoc.exists()) {
        const notificationsData = notificationsDoc.data();
        
        if (notificationsData.items && Array.isArray(notificationsData.items)) {
          // Sort notifications by date (newest first)
          const sortedNotifications = [...notificationsData.items]
            .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
          
          setNotifications(sortedNotifications);
          
          // Count unread notifications
          const unread = sortedNotifications.filter(n => !n.read).length;
          setUnreadCount(unread);
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      } else {
        // Create empty notifications document
        await setDoc(notificationsRef, { items: [] });
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Request notification permissions
  const requestPermissions = async (): Promise<boolean> => {
    if (!Device.isDevice) {
      Alert.alert('Notice', 'Push notifications are not available in the simulator');
      return false;
    }

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const finalStatus = status;
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please enable notifications in your device settings to receive shift updates.'
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  // Send a push notification to a user
  const sendPushNotification = async (
    to: string,
    title: string,
    body: string,
    data?: any
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Get recipient user
      const recipientRef = doc(db, 'users', to);
      const recipientDoc = await getDoc(recipientRef);
      
      if (!recipientDoc.exists()) {
        console.error('Recipient user not found');
        return false;
      }
      
      const recipientData = recipientDoc.data();
      const expoPushTokens = recipientData.expoPushTokens || [];
      
      if (expoPushTokens.length === 0) {
        console.log('No push tokens found for recipient');
        // Save notification to Firestore even if no push tokens
      }
      
      // Save notification to Firestore
      const notificationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const notification: AppNotification = {
        id: notificationId,
        type: data?.type || NotificationType.SYSTEM,
        title,
        body,
        data,
        read: false,
        createdAt: Timestamp.now(),
        recipient: to
      };
      
      const notificationsRef = doc(db, 'notifications', to);
      await updateDoc(notificationsRef, {
        items: arrayUnion(notification)
      });
      
      // Send push notification to all recipient tokens
      // This would typically be handled by a cloud function
      // Here we're just simulating success
      
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId: string): Promise<void> => {
    if (!user) return;
    
    try {
      const updatedNotifications = notifications.map(notification => 
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );
      
      setNotifications(updatedNotifications);
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      
      // Update in Firestore
      const notificationsRef = doc(db, 'notifications', user.uid);
      await setDoc(notificationsRef, { items: updatedNotifications });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true
      }));
      
      setNotifications(updatedNotifications);
      setUnreadCount(0);
      
      // Update in Firestore
      const notificationsRef = doc(db, 'notifications', user.uid);
      await setDoc(notificationsRef, { items: updatedNotifications });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Refresh notifications
  const refreshNotifications = async (): Promise<void> => {
    await loadNotifications();
  };

  // Context value
  const value = {
    expoPushToken,
    notifications,
    unreadCount,
    loading,
    requestPermissions,
    sendPushNotification,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  };

  // Provide notification context to children
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}