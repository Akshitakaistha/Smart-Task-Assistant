// import { useState, useEffect, useMemo, useCallback } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import createContextHook from '@nkzw/create-context-hook';
// import { Task } from '@/types/task';
// import { scheduleTaskNotification, cancelTaskNotification } from '@/utils/notifications';

// const TASKS_STORAGE_KEY = '@smart_tasks';

// export const [TaskProvider, useTasks] = createContextHook(() => {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const loadTasks = useCallback(async () => {
//     try {
//       const stored = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
//       if (stored) {
//         const parsedTasks = JSON.parse(stored);
//         setTasks(parsedTasks);
//       }
//     } catch (error) {
//       console.error('Failed to load tasks:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadTasks();
//   }, [loadTasks]);

//   const saveTasks = useCallback(async (newTasks: Task[]) => {
//     try {
//       await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(newTasks));
//       setTasks(newTasks);
//     } catch (error) {
//       console.error('Failed to save tasks:', error);
//     }
//   }, []);

//   const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
//     const newTask: Task = {
//       ...taskData,
//       id: Date.now().toString(),
//       createdAt: new Date().toISOString(),
//     };

//     if (newTask.dueDate && newTask.dueTime && newTask.reminderMinutes !== undefined) {
//       const notificationId = await scheduleTaskNotification(newTask);
//       newTask.notificationId = notificationId;
//     }

//     const updatedTasks = [...tasks, newTask];
//     await saveTasks(updatedTasks);
//     return newTask;
//   }, [tasks, saveTasks]);

//   const updateTask = useCallback(async (id: string, taskData: Partial<Task>) => {
//     const taskIndex = tasks.findIndex(t => t.id === id);
//     if (taskIndex === -1) return;

//     const existingTask = tasks[taskIndex];
    
//     if (existingTask.notificationId) {
//       await cancelTaskNotification(existingTask.notificationId);
//     }

//     const updatedTask: Task = { ...existingTask, ...taskData };

//     if (updatedTask.dueDate && updatedTask.dueTime && updatedTask.reminderMinutes !== undefined) {
//       const notificationId = await scheduleTaskNotification(updatedTask);
//       updatedTask.notificationId = notificationId;
//     }

//     const updatedTasks = [...tasks];
//     updatedTasks[taskIndex] = updatedTask;
//     await saveTasks(updatedTasks);
//     return updatedTask;
//   }, [tasks, saveTasks]);

//   const deleteTask = useCallback(async (id: string) => {
//     const task = tasks.find(t => t.id === id);
//     if (task?.notificationId) {
//       await cancelTaskNotification(task.notificationId);
//     }
    
//     const updatedTasks = tasks.filter(t => t.id !== id);
//     await saveTasks(updatedTasks);
//   }, [tasks, saveTasks]);

//   const completeTask = useCallback(async (id: string) => {
//     await deleteTask(id);
//   }, [deleteTask]);

//   const getTask = useCallback((id: string) => {
//     return tasks.find(t => t.id === id);
//   }, [tasks]);

//   return useMemo(() => ({
//     tasks,
//     isLoading,
//     addTask,
//     updateTask,
//     deleteTask,
//     completeTask,
//     getTask,
//   }), [tasks, isLoading, addTask, updateTask, deleteTask, completeTask, getTask]);
// });

// export function useFilteredTasks(filter?: {
//   priority?: string;
//   category?: string;
//   searchText?: string;
//   dueToday?: boolean;
//   dueTime?: string;
//   maxDuration?: number;
// }) {
//   const { tasks } = useTasks();

//   return useMemo(() => {
//     if (!filter) return tasks;

//     return tasks.filter(task => {
//       if (filter.priority && task.priority !== filter.priority) {
//         return false;
//       }

//       if (filter.category && task.category !== filter.category) {
//         return false;
//       }

//       if (filter.searchText) {
//         const searchLower = filter.searchText.toLowerCase();
//         const matchesName = task.name.toLowerCase().includes(searchLower);
//         const matchesDescription = task.description?.toLowerCase().includes(searchLower);
//         if (!matchesName && !matchesDescription) {
//           return false;
//         }
//       }

//       if (filter.dueToday && task.dueDate) {
//         const today = new Date().toISOString().split('T')[0];
//         if (task.dueDate !== today) {
//           return false;
//         }
//       }

//       if (filter.dueTime && task.dueTime) {
//         if (task.dueTime !== filter.dueTime) {
//           return false;
//         }
//       }

//       if (filter.maxDuration !== undefined && task.duration) {
//         if (task.duration > filter.maxDuration) {
//           return false;
//         }
//       }

//       return true;
//     });
//   }, [tasks, filter]);
// }

import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Task } from '@/types/task';
import { scheduleTaskNotification, cancelTaskNotification } from '@/utils/notifications';

const TASKS_STORAGE_KEY = '@smart_tasks';

export const [TaskProvider, useTasks] = createContextHook(() => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (stored) {
        const parsedTasks = JSON.parse(stored);
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const saveTasks = useCallback(async (newTasks: Task[]) => {
    try {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  }, []);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    if (newTask.dueDate && newTask.dueTime && newTask.reminderMinutes !== undefined) {
      const notificationId = await scheduleTaskNotification(newTask);
      newTask.notificationId = notificationId;
    }

    const updatedTasks = [...tasks, newTask];
    await saveTasks(updatedTasks);
    return newTask;
  }, [tasks, saveTasks]);

  const updateTask = useCallback(async (id: string, taskData: Partial<Task>) => {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const existingTask = tasks[taskIndex];
    
    if (existingTask.notificationId) {
      await cancelTaskNotification(existingTask.notificationId);
    }

    const updatedTask: Task = { ...existingTask, ...taskData };

    if (updatedTask.dueDate && updatedTask.dueTime && updatedTask.reminderMinutes !== undefined) {
      const notificationId = await scheduleTaskNotification(updatedTask);
      updatedTask.notificationId = notificationId;
    }

    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = updatedTask;
    await saveTasks(updatedTasks);
    return updatedTask;
  }, [tasks, saveTasks]);

  const deleteTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task?.notificationId) {
      await cancelTaskNotification(task.notificationId);
    }
    
    const updatedTasks = tasks.filter(t => t.id !== id);
    await saveTasks(updatedTasks);
  }, [tasks, saveTasks]);

  const completeTask = useCallback(async (id: string) => {
    await deleteTask(id);
  }, [deleteTask]);

  const getTask = useCallback((id: string) => {
    return tasks.find(t => t.id === id);
  }, [tasks]);

  return useMemo(() => ({
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    getTask,
  }), [tasks, isLoading, addTask, updateTask, deleteTask, completeTask, getTask]);
});

export function useFilteredTasks(filter?: {
  priority?: string;
  category?: string;
  searchText?: string;
  dueToday?: boolean;
  dueTime?: string;
  maxDuration?: number;
}) {
  const { tasks } = useTasks();

  return useMemo(() => {
    if (!filter) {
      console.log('No filter applied, returning all tasks:', tasks.length);
      return tasks;
    }

    console.log('Filtering with:', filter);
    console.log('Total tasks:', tasks.length);

    const filtered = tasks.filter(task => {
      console.log('Checking task:', task.name);
      
      if (filter.priority && task.priority !== filter.priority) {
        console.log('  - Priority mismatch:', task.priority, '!==', filter.priority);
        return false;
      }

      if (filter.category && task.category !== filter.category) {
        console.log('  - Category mismatch:', task.category, '!==', filter.category);
        return false;
      }

      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        const matchesName = task.name.toLowerCase().includes(searchLower);
        const matchesDescription = task.description?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesDescription) {
          console.log('  - Search text mismatch');
          return false;
        }
      }

      if (filter.dueToday && task.dueDate) {
        const today = new Date().toISOString().split('T')[0];
        console.log('  - Checking due today:', task.dueDate, 'vs', today);
        if (task.dueDate !== today) {
          console.log('  - Not due today');
          return false;
        }
      }

      if (filter.dueTime && task.dueTime) {
        console.log('  - Checking due time:', task.dueTime, 'vs', filter.dueTime);
        if (task.dueTime !== filter.dueTime) {
          console.log('  - Due time mismatch');
          return false;
        }
      }

      if (filter.maxDuration !== undefined && task.duration) {
        console.log('  - Checking duration:', task.duration, '<=', filter.maxDuration);
        if (task.duration > filter.maxDuration) {
          console.log('  - Duration too long');
          return false;
        }
      }

      console.log('  - Task passed all filters');
      return true;
    });

    console.log('Filtered tasks count:', filtered.length);
    return filtered;
  }, [tasks, filter]);
}
