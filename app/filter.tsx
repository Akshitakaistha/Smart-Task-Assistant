import { useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { VoiceButton } from '@/components/VoiceButton';
import { TaskCard } from '@/components/TaskCard';
import { parseVoiceFilter } from '@/utils/voiceParser';
import { useFilteredTasks, useTasks } from '@/providers/TaskProvider';
import { Filter as FilterIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function FilterScreen() {
  const router = useRouter();
  const { completeTask, deleteTask } = useTasks();
  const [filter, setFilter] = useState<{
    priority?: string;
    category?: string;
    searchText?: string;
    dueToday?: boolean;
    dueTime?: string;
    maxDuration?: number;
  } | undefined>();

  const filteredTasks = useFilteredTasks(filter);
  const [filterDescription, setFilterDescription] = useState('');

  const handleVoiceTranscription = async (text: string) => {
    try {
      const parsedFilter = await parseVoiceFilter(text);
      setFilter(parsedFilter);
      setFilterDescription(text);
      
      console.log('Applied filter:', parsedFilter);
    } catch (error) {
      console.error('Failed to parse voice filter:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Voice Filter',
          headerStyle: {
            backgroundColor: '#9B59B6',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700' as const,
          },
        }}
      />

      <LinearGradient
        colors={['#9B59B6', '#8E44AD']}
        style={styles.header}
      >
        <FilterIcon size={32} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Filter Tasks</Text>
        <Text style={styles.headerSubtitle}>
          Ask what tasks you want to see
        </Text>
      </LinearGradient>

      <View style={styles.voiceSection}>
        <VoiceButton
          onTranscription={handleVoiceTranscription}
          buttonText="Tap and ask"
          size="large"
        />
        
        <Text style={styles.voiceHint}>
          Try: &quot;Show me today&apos;s tasks&quot; or &quot;High priority tasks&quot; or &quot;Tasks I can do in 15 minutes&quot;
        </Text>

        {filterDescription && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterText}>
              Showing: {filterDescription}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
        </Text>

        {filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FilterIcon size={64} color="#BDC3C7" />
            <Text style={styles.emptyText}>
              {filter
                ? 'No tasks match your filter'
                : 'Use voice to filter your tasks'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
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
          />
        )}
      </View>
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
    textAlign: 'center',
  },
  voiceSection: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  voiceHint: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  filterBadge: {
    backgroundColor: '#9B59B6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  resultsContainer: {
    flex: 1,
    paddingTop: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#2C3E50',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
});
