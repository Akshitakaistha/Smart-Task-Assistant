import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useTasks } from '@/providers/TaskProvider';
import { Calendar, Clock, Timer, AlertCircle, CheckCircle2, Edit2, Trash2, ArrowRight } from 'lucide-react-native';
import { format } from 'date-fns';

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTask, completeTask, deleteTask } = useTasks();

  const task = getTask(id || '');

  if (!task) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Task Details',
            headerStyle: {
              backgroundColor: '#3498DB',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color="#E74C3C" />
          <Text style={styles.errorText}>Task not found</Text>
        </View>
      </View>
    );
  }

  const priorityColors = {
    high: '#FF4757',
    medium: '#FFA502',
    low: '#2ED573',
  };

  const categoryColors = {
    work: '#5F27CD',
    personal: '#00D2D3',
    urgent: '#EE5A6F',
    other: '#95A5A6',
  };

  const handleComplete = async () => {
    await completeTask(task.id);
    router.back();
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Task Details',
          headerStyle: {
            backgroundColor: '#3498DB',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700' as const,
          },
        }}
      />

      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.badges}>
            {task.priority && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: priorityColors[task.priority] + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: priorityColors[task.priority] },
                  ]}
                >
                  {task.priority.toUpperCase()} PRIORITY
                </Text>
              </View>
            )}
            {task.category && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: categoryColors[task.category] + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: categoryColors[task.category] },
                  ]}
                >
                  {task.category.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.taskName}>{task.name}</Text>

          {task.description && (
            <Text style={styles.taskDescription}>{task.description}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          {task.dueDate && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Calendar size={20} color="#3498DB" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Due Date</Text>
                <Text style={styles.detailValue}>
                  {format(new Date(task.dueDate), 'EEEE, MMMM d, yyyy')}
                </Text>
              </View>
            </View>
          )}

          {task.dueTime && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Clock size={20} color="#3498DB" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Due Time</Text>
                <Text style={styles.detailValue}>{task.dueTime}</Text>
              </View>
            </View>
          )}

          {task.duration && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Timer size={20} color="#3498DB" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>{task.duration} minutes</Text>
              </View>
            </View>
          )}

          {task.reminderMinutes !== undefined && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <AlertCircle size={20} color="#3498DB" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Reminder</Text>
                <Text style={styles.detailValue}>
                  {task.reminderMinutes} minutes before
                </Text>
              </View>
            </View>
          )}

          {task.dependency && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <ArrowRight size={20} color="#3498DB" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Dependency</Text>
                <Text style={styles.detailValue}>{task.dependency}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Calendar size={20} color="#7F8C8D" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>
                {format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <CheckCircle2 size={22} color="#FFFFFF" />
          <Text style={styles.completeButtonText}>Complete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/edit-task?id=${task.id}` as any)}
          activeOpacity={0.8}
        >
          <Edit2 size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Trash2 size={20} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    gap: 12,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  taskName: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: '#2C3E50',
    lineHeight: 34,
  },
  taskDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    lineHeight: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 24,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#2C3E50',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
    gap: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#7F8C8D',
    fontWeight: '600' as const,
  },
  detailValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500' as const,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  completeButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2ED573',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3498DB',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#E74C3C',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    fontWeight: '600' as const,
  },
});
