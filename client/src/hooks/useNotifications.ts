import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import notificationService from '../services/notificationService';

interface NotificationSettings {
  enabled: boolean;
  messageNotifications: boolean;
  typingNotifications: boolean;
  soundEnabled: boolean;
}

const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    messageNotifications: true,
    typingNotifications: false,
    soundEnabled: true,
  });

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const { user } = useAppSelector((state) => state.auth);

  // Initialize notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      // Always check current permission from browser
      const currentPermission = Notification.permission;
      setPermissionStatus(currentPermission);

      // Load settings from localStorage
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
        } catch (error) {
          // Silent fail for settings loading
        }
      }
    };

    initializeNotifications();
  }, []);

  // Save settings to localStorage
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
  }, [settings]);

  // Show message notification
  const showMessageNotification = useCallback((senderName: string, message: string, chatId: string) => {
    if (settings.enabled && settings.messageNotifications) {
      notificationService.showMessageNotification(senderName, message, chatId);
    }
  }, [settings.enabled, settings.messageNotifications]);

  // Show typing notification
  const showTypingNotification = useCallback((senderName: string) => {
    if (settings.enabled && settings.typingNotifications) {
      notificationService.showTypingNotification(senderName);
    }
  }, [settings.enabled, settings.typingNotifications]);

  // Request permission
  const requestPermission = useCallback(async () => {
    const granted = await notificationService.requestPermission();
    
    // Update permission status
    const newStatus = granted ? 'granted' : 'denied';
    setPermissionStatus(newStatus);
    
    return granted;
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    notificationService.clearNotifications();
  }, []);

  // Check if notifications are supported
  const isSupported = notificationService.isSupported();

  return {
    settings,
    permissionStatus,
    isSupported,
    updateSettings,
    showMessageNotification,
    showTypingNotification,
    requestPermission,
    clearNotifications,
  };
};

export default useNotifications;
