import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useTasks } from '@/providers/TaskProvider';
import { TaskPriority, TaskCategory } from '@/types/task';
import { Save, X, Calendar, Clock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditTaskScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTask, updateTask } = useTasks();

  const task = getTask(id || '');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [dueTime, setDueTime] = useState<Date | undefined>();
  const [duration, setDuration] = useState('');
  const [priority, setPriority] = useState<TaskPriority | undefined>();
  const [category, setCategory] = useState<TaskCategory | undefined>();
  const [reminderMinutes, setReminderMinutes] = useState('');
  const [dependency, setDependency] = useState('');
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description || '');
      if (task.dueDate) setDueDate(new Date(task.dueDate));
      if (task.dueTime) {
        const [hours, minutes] = task.dueTime.split(':').map(Number);
        const time = new Date();
        time.setHours(hours, minutes, 0, 0);
        setDueTime(time);
      }
      setDuration(task.duration?.toString() || '');
      setPriority(task.priority);
      setCategory(task.category);
      setReminderMinutes(task.reminderMinutes?.toString() || '');
      setDependency(task.dependency || '');
    }
  }, [task]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    if (!id) return;

    try {
      await updateTask(id, {
        name: name.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate?.toISOString().split('T')[0],
        dueTime: dueTime
          ? `${dueTime.getHours().toString().padStart(2, '0')}:${dueTime.getMinutes().toString().padStart(2, '0')}`
          : undefined,
        duration: duration ? parseInt(duration) : undefined,
        priority,
        category,
        reminderMinutes: reminderMinutes ? parseInt(reminderMinutes) : undefined,
        dependency: dependency.trim() || undefined,
      });

      router.back();
    } catch (error) {
      console.error('Failed to update task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Edit Task' }} />
        <Text style={styles.errorText}>Task not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Edit Task',
          headerStyle: {
            backgroundColor: '#3498DB',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700' as const,
          },
        }}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Task Details</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Task Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter task name"
              placeholderTextColor="#95A5A6"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              placeholderTextColor="#95A5A6"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfWidth]}>
              <Text style={styles.label}>Due Date</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={18} color="#7F8C8D" />
                <Text style={styles.pickerText}>
                  {dueDate ? dueDate.toLocaleDateString() : 'Select date'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.fieldGroup, styles.halfWidth]}>
              <Text style={styles.label}>Due Time</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock size={18} color="#7F8C8D" />
                <Text style={styles.pickerText}>
                  {dueTime
                    ? `${dueTime.getHours().toString().padStart(2, '0')}:${dueTime.getMinutes().toString().padStart(2, '0')}`
                    : 'Select time'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g., 30"
              placeholderTextColor="#95A5A6"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.buttonGroup}>
              {(['high', 'medium', 'low'] as TaskPriority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.optionButton,
                    priority === p && styles.optionButtonActive,
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      priority === p && styles.optionButtonTextActive,
                    ]}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.buttonGroup}>
              {(['work', 'personal', 'urgent', 'other'] as TaskCategory[]).map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.optionButton,
                    category === c && styles.optionButtonActive,
                  ]}
                  onPress={() => setCategory(c)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      category === c && styles.optionButtonTextActive,
                    ]}
                  >
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Reminder (minutes before)</Text>
            <TextInput
              style={styles.input}
              value={reminderMinutes}
              onChangeText={setReminderMinutes}
              placeholder="e.g., 15"
              placeholderTextColor="#95A5A6"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Dependency (optional)</Text>
            <TextInput
              style={styles.input}
              value={dependency}
              onChangeText={setDependency}
              placeholder="Enter dependent task name"
              placeholderTextColor="#95A5A6"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <X size={20} color="#E74C3C" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Update Task</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_event: any, selectedDate?: Date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              setDueDate(selectedDate);
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={dueTime || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_event: any, selectedTime?: Date) => {
            setShowTimePicker(Platform.OS === 'ios');
            if (selectedTime) {
              setDueTime(selectedTime);
            }
          }}
        />
      )}
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
  scrollContent: {
    paddingBottom: 20,
  },
  formSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#2C3E50',
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#2C3E50',
    marginBottom: 8,
  },
  required: {
    color: '#E74C3C',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  pickerText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  optionButtonActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#7F8C8D',
  },
  optionButtonTextActive: {
    color: '#FFFFFF',
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
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#E74C3C',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3498DB',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 40,
  },
});
