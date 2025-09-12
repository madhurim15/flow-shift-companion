// Service Worker for FlowLight App
const CACHE_NAME = 'flowlight-v1';
const NOTIFICATION_TAG = 'flowlight-reminder';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle background sync for notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-reminders') {
    event.waitUntil(checkAndSendReminders());
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.data);
  
  event.notification.close();
  
  // Handle action buttons
  if (event.action === 'quick_mood') {
    // Open app to mood selector
    event.waitUntil(
      self.clients.openWindow('/?action=mood_check&reminder=' + event.notification.data.reminderType)
    );
  } else if (event.action === 'snooze') {
    // Schedule reminder for 15 minutes later
    scheduleSnoozeReminder(event.notification.data.reminderType);
  } else {
    // Default action - open app
    event.waitUntil(
      self.clients.openWindow('/?reminder=' + event.notification.data.reminderType)
    );
  }
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    showReminderNotification(data.type, data.message);
  }
});

// Schedule a reminder notification
function scheduleReminderNotification(type, delayMs = 0) {
  const reminderMessages = {
    morning: "Good morning! ✨ How are you feeling as you start your day?",
    afternoon: "Afternoon check-in 🌱 Take a moment to notice how you're doing",
    evening: "Evening reflection 🌅 How has your day been treating you?",
    night: "Gentle evening wind-down 🌙 A moment to check in with yourself"
  };

  setTimeout(() => {
    showReminderNotification(type, reminderMessages[type]);
  }, delayMs);
}

// Show notification with actions
function showReminderNotification(type, message) {
  const options = {
    body: message,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: NOTIFICATION_TAG,
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      reminderType: type,
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'quick_mood',
        title: '✨ Quick Mood Check',
        icon: '/favicon.ico'
      },
      {
        action: 'snooze',
        title: '⏰ Remind me in 15min',
        icon: '/favicon.ico'
      }
    ]
  };

  self.registration.showNotification('FlowLight Gentle Reminder', options);
}

// Schedule snooze reminder
function scheduleSnoozeReminder(type) {
  // Schedule for 15 minutes later
  scheduleReminderNotification(type, 15 * 60 * 1000);
}

// Check and send due reminders
async function checkAndSendReminders() {
  try {
    // This would typically fetch from your backend
    // For now, we'll use local storage or IndexedDB
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    // Default reminder times
    const reminderTimes = {
      morning: '09:00',
      afternoon: '14:00', 
      evening: '19:00',
      night: '21:00'
    };

    // Check if any reminder time matches current time
    for (const [type, time] of Object.entries(reminderTimes)) {
      if (currentTime === time) {
        scheduleReminderNotification(type);
        break;
      }
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}

// Expose functions for main app
self.scheduleReminderNotification = scheduleReminderNotification;
self.showReminderNotification = showReminderNotification;