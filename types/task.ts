export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'work' | 'personal' | 'urgent' | 'other';

export interface Task {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  duration?: number;
  priority?: TaskPriority;
  category?: TaskCategory;
  reminderMinutes?: number;
  dependency?: string;
  createdAt: string;
  notificationId?: string;
}

export interface ParsedTaskData {
  name?: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  duration?: number;
  priority?: TaskPriority;
  category?: TaskCategory;
  reminderMinutes?: number;
}
