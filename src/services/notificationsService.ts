import { Device } from '../types';
import api, { notificationApi } from './api';

// Notification types
export type NotificationType = 'info' | 'warning' | 'alert' | 'success';

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  deviceId?: number;
  deviceName?: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Store notifications in localStorage to persist between sessions
const STORAGE_KEY = 'field_eyes_notifications';

// Get notifications from localStorage
const getStoredNotifications = (): Notification[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save notifications to localStorage
const saveNotifications = (notifications: Notification[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
};

// Generate a unique ID for notifications
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Create a new notification
export const createNotification = (
  type: NotificationType,
  message: string,
  deviceId?: number,
  deviceName?: string
): Notification => {
  return {
    id: generateId(),
    type,
    deviceId,
    deviceName,
    message,
    timestamp: new Date().toISOString(),
    read: false
  };
};

// Add a notification to the store
export const addNotification = async (notification: Notification): Promise<void> => {
  // First store locally
  const notifications = getStoredNotifications();
  notifications.unshift(notification); // Add to beginning of array
  
  // Limit to 50 notifications
  if (notifications.length > 50) {
    notifications.pop();
  }
  
  saveNotifications(notifications);
  
  // Also trigger browser notification if supported
  if (Notification && Notification.permission === 'granted') {
    new Notification(notification.deviceName || 'FieldEyes', {
      body: notification.message,
      icon: '/favicon.ico'
    });
  }
  
  // Get user notification preferences from localStorage
  const userSettingsStr = localStorage.getItem('userSettings');
  const userSettings = userSettingsStr ? JSON.parse(userSettingsStr) : null;
  
  // Then try to save to backend
  try {
    await notificationApi.createNotification({
      type: notification.type,
      message: notification.message,
      device_id: notification.deviceId,
      device_name: notification.deviceName
    });
    
    // Check if user has configured email notifications
    if (userSettings?.notifications?.email && userSettings?.notifications?.emailAddress) {
      // This would be handled by the backend in a real implementation
      console.log(`Email notification would be sent to: ${userSettings.notifications.emailAddress}`);
    }
    
    // Check if user has configured SMS notifications
    if (userSettings?.notifications?.sms && userSettings?.notifications?.phoneNumber) {
      // This would be handled by the backend in a real implementation
      console.log(`SMS notification would be sent to: ${userSettings.notifications.phoneNumber}`);
    }
  } catch (error) {
    console.error('Failed to save notification to backend', error);
  }
};

// Get all notifications
export const getNotifications = async (unreadOnly: boolean = false): Promise<Notification[]> => {
  try {
    // Try to get from API first
    const response = await notificationApi.getNotifications(unreadOnly);
    if (response.data && response.data.notifications) {
      // Map the server notifications to our local format
      const notifications = response.data.notifications.map((n: any) => ({
        id: n.id.toString(),
        type: n.type as NotificationType,
        deviceId: n.device_id,
        deviceName: n.device_name,
        message: n.message,
        timestamp: n.created_at,
        read: n.read
      }));
      
      // Update the local storage with the latest from the server
      saveNotifications(notifications);
      return notifications;
    }
    
    // Fall back to local storage if API call succeeds but returns no data
    return getStoredNotifications();
  } catch (error) {
    console.error('Failed to fetch notifications from API', error);
    // Fall back to local storage if API call fails
    return getStoredNotifications();
  }
};

// Mark a notification as read
export const markAsRead = async (notificationId: string): Promise<void> => {
  // First update locally
  const notifications = getStoredNotifications();
  const updatedNotifications = notifications.map(notification => 
    notification.id === notificationId 
      ? { ...notification, read: true } 
      : notification
  );
  saveNotifications(updatedNotifications);
  
  // Then try to update in backend
  try {
    await notificationApi.markAsRead(parseInt(notificationId, 10));
  } catch (error) {
    console.error('Failed to mark notification as read in backend', error);
  }
};

// Mark all notifications as read
export const markAllAsRead = async (): Promise<void> => {
  // First update locally
  const notifications = getStoredNotifications();
  const updatedNotifications = notifications.map(notification => 
    ({ ...notification, read: true })
  );
  saveNotifications(updatedNotifications);
  
  // Then try to update in backend
  try {
    await notificationApi.markAllAsRead();
  } catch (error) {
    console.error('Failed to mark all notifications as read in backend', error);
  }
};

// Delete a notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  // First update locally
  const notifications = getStoredNotifications();
  const updatedNotifications = notifications.filter(
    notification => notification.id !== notificationId
  );
  saveNotifications(updatedNotifications);
  
  // Then try to update in backend
  try {
    await notificationApi.deleteNotification(parseInt(notificationId, 10));
  } catch (error) {
    console.error('Failed to delete notification in backend', error);
  }
};

// Clear all notifications
export const clearNotifications = (): void => {
  saveNotifications([]);
};

// Request browser notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// Generate notifications based on device data
export const generateDeviceNotifications = async (devices: Device[]): Promise<void> => {
  // Try to call backend API to generate notifications
  try {
    await notificationApi.generateDeviceNotifications();
    // After generating notifications, refresh the list
    await getNotifications();
    return;
  } catch (error) {
    console.error('Failed to generate notifications from backend, falling back to client-side', error);
  }
  
  // Fall back to client-side notification generation
  // Get current time for comparison
  const now = new Date();
  
  devices.forEach(device => {
    const lastReading = new Date(device.last_reading);
    const hoursSinceLastReading = (now.getTime() - lastReading.getTime()) / (1000 * 60 * 60);
    
    // Device hasn't reported data in over 24 hours
    if (hoursSinceLastReading > 24) {
      addNotification(
        createNotification(
          'warning',
          `Device hasn't sent data in ${Math.floor(hoursSinceLastReading)} hours.`,
          device.id,
          device.name
        )
      );
    }
    
    // Low battery notification
    if (device.battery < 20) {
      addNotification(
        createNotification(
          'alert',
          `Battery level is critically low (${device.battery}%).`,
          device.id,
          device.name
        )
      );
    }
    
    // Status notifications
    if (device.status === 'inactive') {
      addNotification(
        createNotification(
          'warning',
          `Device is currently inactive.`,
          device.id,
          device.name
        )
      );
    }
    
    // Connection strength warnings
    if (device.signal < 30) {
      addNotification(
        createNotification(
          'info',
          `Poor signal strength detected (${device.signal}%).`,
          device.id,
          device.name
        )
      );
    }
  });
}; 