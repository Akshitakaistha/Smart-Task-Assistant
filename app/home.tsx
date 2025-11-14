import { StyleSheet, Text, View, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useTasks } from '@/providers/TaskProvider';
import { TaskCard } from '@/components/TaskCard';
import { Plus, Filter, Info, ListTodo } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows } from '@/constants/theme';

export default function HomeScreen() {
  const { tasks, completeTask, deleteTask, isLoading } = useTasks();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      const dateCompare = a.dueDate.localeCompare(b.dueDate);
      if (dateCompare !== 0) return dateCompare;
      
      if (a.dueTime && b.dueTime) {
        return a.dueTime.localeCompare(b.dueTime);
      }
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Smart Task Assistant',
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.text.inverse,
          headerTitleStyle: {
            fontWeight: '700' as const,
            fontSize: 20,
          },
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => router.push('/filter')}
                style={[styles.headerButton, { marginRight: 8 }]}
              >
                <Filter size={24} color={colors.text.inverse} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/about')}
                style={[styles.headerButton, { marginRight: 8 }]}
              >
                <Info size={24} color={colors.text.inverse} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <ListTodo size={32} color="#FFFFFF" />
        <Text style={styles.headerTitle}>My Tasks</Text>
        <Text style={styles.headerSubtitle}>
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
        </Text>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading tasks...</Text>
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ListTodo size={64} color="#BDC3C7" />
          <Text style={styles.emptyTitle}>No tasks yet</Text>
          <Text style={styles.emptyText}>
            Tap the + button or use voice to add your first task
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedTasks}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => router.push(`/task/${item.id}` as any)}
              onEdit={() => router.push(`/edit-task?id=${item.id}` as any)}
              onComplete={() => completeTask(item.id)}
              onDelete={() => deleteTask(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-task')}
        activeOpacity={0.8}
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text.inverse,
    marginTop: spacing.sm,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.inverse,
    opacity: 0.9,
  },
  headerButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
});
