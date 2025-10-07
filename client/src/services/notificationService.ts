// Notification Service for Web Push Notifications
class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private permission: NotificationPermission = 'default';

  constructor() {
    this.permission = Notification.permission;
    this.initializeServiceWorker();
  }

  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        // Service Worker registered successfully
      } catch (error) {
        // Service Worker registration failed
      }
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    // Always refresh permission status from browser
    this.permission = Notification.permission;

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      return false;
    }

    // For 'default' permission, try to request
    if (this.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        this.permission = permission;
        return permission === 'granted';
      } catch (error) {
        return false;
      }
    }

    return false;
  }

  // Check if notifications are supported and permitted
  isSupported(): boolean {
    // Always check current permission from browser
    const currentPermission = Notification.permission;
    this.permission = currentPermission;
    return 'Notification' in window && currentPermission === 'granted';
  }

  // Show local notification
  showNotification(title: string, options: NotificationOptions = {}) {
    if (!this.isSupported()) {
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'chat-message',
      requireInteraction: true,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

    } catch (error) {
      // Silent fail for notification errors
    }
  }

  // Show message notification
  showMessageNotification(senderName: string, message: string, chatId: string) {
    const title = `New message from ${senderName}`;
    const body = message.length > 100 ? message.substring(0, 100) + '...' : message;
    
    this.showNotification(title, {
      body,
      tag: `message-${chatId}`,
      data: { chatId, senderName, message }
    });
  }

  // Show typing notification
  showTypingNotification(senderName: string) {
    this.showNotification(`${senderName} is typing...`, {
      tag: 'typing',
      requireInteraction: false,
      silent: true
    });
  }

  // Clear all notifications
  clearNotifications() {
    if (this.registration) {
      this.registration.getNotifications().then(notifications => {
        notifications.forEach(notification => notification.close());
      });
    }
  }

  // Get notification permission status
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  // Refresh permission status from browser
  refreshPermissionStatus(): NotificationPermission {
    this.permission = Notification.permission;
    return this.permission;
  }

  // Subscribe to push notifications (for future server-side push)
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      // Service Worker not registered
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
        )
      });

      // Push subscription created
      return subscription;
    } catch (error) {
      // Error subscribing to push notifications
      return null;
    }
  }

  // Convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Create singleton instance
const notificationService = new NotificationService();
export default notificationService;