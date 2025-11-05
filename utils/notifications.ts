import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '@/types/task';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('tasks', {
      name: 'Task Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B6B',
    });
  }

  return true;
}

export async function scheduleTaskNotification(task: Task): Promise<string | undefined> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('No notification permission');
      return undefined;
    }

    if (!task.dueDate || !task.dueTime || task.reminderMinutes === undefined) {
      console.log('Missing required fields for notification');
      return undefined;
    }

    const [hours, minutes] = task.dueTime.split(':').map(Number);
    const dueDateTime = new Date(task.dueDate);
    dueDateTime.setHours(hours, minutes, 0, 0);

    const reminderTime = new Date(dueDateTime.getTime() - task.reminderMinutes * 60 * 1000);
    const now = new Date();

    if (reminderTime <= now) {
      console.log('Reminder time is in the past');
      return undefined;
    }

    const secondsUntilReminder = Math.floor((reminderTime.getTime() - now.getTime()) / 1000);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder',
        body: task.name,
        data: { taskId: task.id },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilReminder,
        channelId: Platform.OS === 'android' ? 'tasks' : undefined,
      },
    });

    console.log('Scheduled notification:', notificationId, 'in', secondsUntilReminder, 'seconds');
    return notificationId;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return undefined;
  }
}

export async function cancelTaskNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Canceled notification:', notificationId);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}
