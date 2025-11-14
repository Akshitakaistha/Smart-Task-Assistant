import { generateObject } from '@/utils/generateObject';
import { z } from 'zod';
import { ParsedTaskData, TaskPriority, TaskCategory } from '@/types/task';

const taskSchema = z.object({
  name: z.string().optional().describe('The task name or title'),
  description: z.string().optional().describe('Additional details'),
  dueDate: z.string().optional().describe('Due date in YYYY-MM-DD format'),
  dueTime: z.string().optional().describe('Due time in HH:MM 24-hour format'),
  duration: z.number().optional().describe('Duration in minutes'),
  priority: z
    .union([z.enum(['high', 'medium', 'low']), z.literal(''), z.null(), z.undefined()])
    .transform((val) => (val === '' || val == null ? 'medium' : val))
    .default('medium'),
  category: z
    .union([z.enum(['work', 'personal', 'urgent', 'other']), z.literal(''), z.null(), z.undefined()])
    .transform((val) => (val === '' || val == null ? 'other' : val))
    .default('other'),
  reminderMinutes: z.number().optional().describe('Minutes before due time for reminder'),
});

export async function parseVoiceInput(transcription: string): Promise<ParsedTaskData> {
  try {
    console.log('Parsing voice input:', transcription);

    const contextMessage = getContextMessage();
    const result = await generateObject({
      messages: [
        {
          role: 'user',
          content: buildTaskExtractionPrompt(contextMessage, transcription),
        },
      ],
      schema: taskSchema,
    });

    console.log('Parsed task data:', result);
    return result;
  } catch (error) {
    console.error('Failed to parse voice input:', error);
    return { name: transcription };
  }
}

export async function parseVoiceFilter(transcription: string): Promise<{
  priority?: TaskPriority;
  category?: TaskCategory;
  searchText?: string;
  dueToday?: boolean;
  dueTime?: string;
  maxDuration?: number;
}> {
  try {
    console.log('Parsing voice filter:', transcription);

    const filterSchema = z.object({
      priority: z.enum(['high', 'medium', 'low']).optional(),
      category: z.enum(['work', 'personal', 'urgent', 'other']).optional(),
      searchText: z.string().optional().describe('Keywords to search'),
      dueToday: z.boolean().optional().describe('Filter for today\'s tasks'),
      dueTime: z.string().optional().describe('Specific time in HH:MM format'),
      maxDuration: z.number().optional().describe('Maximum duration in minutes'),
    });

    const contextMessage = getContextMessage();

    const result = await generateObject({
      messages: [
        {
          role: 'user',
          content: buildFilterExtractionPrompt(contextMessage, transcription),
        },
      ],
      schema: filterSchema,
    });

    console.log('Parsed filter:', result);

    if (isEmptyFilter(result)) {
      result.searchText = cleanSearchText(transcription);
    }

    return result;
  } catch (error) {
    console.error('Failed to parse voice filter:', error);
    return { searchText: transcription };
  }
}

function getContextMessage(): string {
  const today = new Date();
  return `Today is ${today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}. Current time is ${today.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })}.`;
}

function buildTaskExtractionPrompt(contextMessage: string, transcription: string): string {
  return `${contextMessage}

Extract task information from this voice input: "${transcription}"

Rules:
- Extract task name, description, date, time, duration, priority, category, and reminder
- For relative times like "in 15 minutes", "at 5pm", "tomorrow", calculate actual date/time
- For durations like "15 minutes", "1 hour", convert to minutes
- If priority words like "urgent", "important" are mentioned, set priority to high
- If no specific info is mentioned, leave fields empty
- Return dates in YYYY-MM-DD format
- Return times in HH:MM 24-hour format`;
}

function buildFilterExtractionPrompt(contextMessage: string, transcription: string): string {
  return `${contextMessage}

You are an assistant that extracts filter criteria for a task management app from natural language queries.

Return only valid JSON with this structure:
{
  "priority": "high" | "medium" | "low",
  "category": "work" | "personal" | "urgent" | "other",
  "searchText": "string",
  "dueToday": true | false,
  "dueTime": "HH:MM",
  "maxDuration": number
}

Rules:
- Always return a JSON object, even if fields are empty
- If the query contains a task name, action, or object (like "buy groceries", "finish report"), put it in searchText
- For relative time words ("today", "tomorrow"), set the appropriate field
- For duration queries ("15 minute tasks"), set maxDuration
- Never return explanations, markdown, or natural language

Extract filters from: "${transcription}"

Examples:
"Show me today's tasks" → {"dueToday": true}
"Show me high priority tasks" → {"priority": "high"}
"Tasks I can finish in 15 minutes" → {"maxDuration": 15}
"What work tasks do I have" → {"category": "work"}
"Tell me tasks where I have to buy groceries" → {"searchText": "buy groceries"}
"Show urgent personal tasks for today" → {"priority": "high", "category": "personal", "dueToday": true}`;
}

function isEmptyFilter(filter: any): boolean {
  return !filter.priority && !filter.category && !filter.dueToday &&
         !filter.dueTime && !filter.maxDuration && !filter.searchText;
}

function cleanSearchText(text: string): string {
  return text
    .trim()
    .replace(/^show|list|find|tell|tasks|task|me|about|of|for|where|that|to|the/gi, '')
    .trim();
}
