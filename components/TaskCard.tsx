import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Task } from '@/types/task';
import { CheckCircle2, Clock, Calendar, Edit2, Trash2 } from 'lucide-react-native';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onEdit: () => void;
  onComplete: () => void;
  onDelete: () => void;
}

export function TaskCard({ task, onPress, onEdit, onComplete, onDelete }: TaskCardProps) {
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

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          {task.priority && (
            <View 
              style={[
                styles.priorityBadge, 
                { backgroundColor: priorityColors[task.priority] + '20' }
              ]}
            >
              <Text 
                style={[
                  styles.priorityText, 
                  { color: priorityColors[task.priority] }
                ]}
              >
                {task.priority.toUpperCase()}
              </Text>
            </View>
          )}
          {task.category && (
            <View 
              style={[
                styles.categoryBadge, 
                { backgroundColor: categoryColors[task.category] + '20' }
              ]}
            >
              <Text 
                style={[
                  styles.categoryText, 
                  { color: categoryColors[task.category] }
                ]}
              >
                {task.category}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.taskName} numberOfLines={2}>{task.name}</Text>
      
      {task.description && (
        <Text style={styles.taskDescription} numberOfLines={2}>
          {task.description}
        </Text>
      )}

      <View style={styles.metaRow}>
        {task.dueDate && (
          <View style={styles.metaItem}>
            <Calendar size={14} color="#7F8C8D" />
            <Text style={styles.metaText}>
              {format(new Date(task.dueDate), 'MMM d, yyyy')}
            </Text>
          </View>
        )}
        
        {task.dueTime && (
          <View style={styles.metaItem}>
            <Clock size={14} color="#7F8C8D" />
            <Text style={styles.metaText}>{task.dueTime}</Text>
          </View>
        )}

        {task.duration && (
          <View style={styles.metaItem}>
            <Text style={styles.durationText}>{task.duration}m</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onComplete}
          activeOpacity={0.7}
        >
          <CheckCircle2 size={20} color="#2ED573" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onEdit}
          activeOpacity={0.7}
        >
          <Edit2 size={18} color="#3498DB" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Trash2 size={18} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      } as any,
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  taskName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#2C3E50',
    marginBottom: 6,
  },
  taskDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  durationText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500' as const,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
});
