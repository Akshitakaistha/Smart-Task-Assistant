import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '@/types/task';
import { CheckCircle2, Clock, Calendar, Edit2, Trash2 } from 'lucide-react-native';
import { format } from 'date-fns';
import { colors, spacing, borderRadius, shadows } from '@/constants/theme';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onEdit: () => void;
  onComplete: () => void;
  onDelete: () => void;
}

export function TaskCard({ task, onPress, onEdit, onComplete, onDelete }: TaskCardProps) {
  const priorityColors = colors.priority;
  const categoryColors = colors.category;

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
            <Calendar size={14} color={colors.text.secondary} />
            <Text style={styles.metaText}>
              {format(new Date(task.dueDate), 'MMM d, yyyy')}
            </Text>
          </View>
        )}

        {task.dueTime && (
          <View style={styles.metaItem}>
            <Clock size={14} color={colors.text.secondary} />
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
          <CheckCircle2 size={20} color={colors.success} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onEdit}
          activeOpacity={0.7}
        >
          <Edit2 size={18} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Trash2 size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm + spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm + spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm - 2,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm - 2,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  taskName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: 6,
  },
  taskDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm + spacing.xs,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm + spacing.xs,
    marginBottom: spacing.sm + spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  durationText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500' as const,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm + spacing.xs,
    paddingTop: spacing.sm + spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  actionButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
});
