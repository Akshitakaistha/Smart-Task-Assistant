import { StyleSheet, Text, View, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useTasks } from '@/providers/TaskProvider';
import { TaskCard } from '@/components/TaskCard';
import { Plus, Filter, Info, ListTodo } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
            backgroundColor: '#3498DB',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700' as const,
            fontSize: 20,
          },
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => router.push('/filter')}
                // style={styles.headerButton}
                style={[styles.headerButton, { marginRight: 8 }]}
              >
                <Filter size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
      onPress={() => router.push('/about')}
      style={[styles.headerButton, { marginRight: 8 }]}
    >
      <Info size={24} color="#FFFFFF" /> 
      {/* You can use another icon like Info, User, or InfoIcon */}
    </TouchableOpacity>
            </View>
          ),
        }}
      />

      <LinearGradient
        colors={['#3498DB', '#2980B9']}
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
    backgroundColor: '#F5F6FA',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  headerButton: {
    marginRight: 16,
    padding: 4,
  },
  listContent: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#2C3E50',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 12px rgba(52, 152, 219, 0.4)',
      } as any,
    }),
  },
});
