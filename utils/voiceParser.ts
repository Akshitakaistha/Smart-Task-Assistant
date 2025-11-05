// import { generateObject } from '@rork/toolkit-sdk';
import { generateObject } from '@/utils/generateObject';
import { z } from 'zod';
import { ParsedTaskData, TaskPriority, TaskCategory } from '@/types/task';

const taskSchema = z.object({
  name: z.string().optional().describe('The task name or title extracted from the voice input'),
  description: z.string().optional().describe('Additional details or description of the task'),
  dueDate: z.string().optional().describe('Due date in YYYY-MM-DD format if mentioned'),
  dueTime: z.string().optional().describe('Due time in HH:MM 24-hour format if mentioned'),
  duration: z.number().optional().describe('Estimated task duration in minutes if mentioned'),
  // priority: z.enum(['high', 'medium', 'low']).optional().catch('medium'),
  // category: z.enum(['work', 'personal', 'urgent', 'other']).optional().catch('other'),

   priority: z
    .union([
      z.enum(['high', 'medium', 'low']),
      z.literal(''),
      z.null(),
      z.undefined(),
    ])
    .transform((val) => (val === '' || val == null ? 'medium' : val))
    .default('medium'),
  category: z
    .union([
      z.enum(['work', 'personal', 'urgent', 'other']),
      z.literal(''),
      z.null(),
      z.undefined(),
    ])
    .transform((val) => (val === '' || val == null ? 'other' : val))
    .default('other'),
  reminderMinutes: z.number().optional().describe('Minutes before due time to send reminder'),
});

export async function parseVoiceInput(transcription: string): Promise<ParsedTaskData> {
  try {
    console.log('Parsing voice input:', transcription);

    const today = new Date();
    const contextMessage = `Today is ${today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}. Current time is ${today.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })}.`;

    const result = await generateObject({
      messages: [
        {
          role: 'user',
          content: `${contextMessage}\n\nExtract task information from this voice input: "${transcription}"\n\nRules:
- Extract task name, description, date, time, duration, priority, category, and reminder
- For relative times like "in 15 minutes", "at 5pm", "tomorrow", calculate actual date/time
- For durations like "15 minutes", "1 hour", convert to minutes
- If priority words like "urgent", "important" are mentioned, set priority to high
- If no specific info is mentioned, leave fields empty
- Return dates in YYYY-MM-DD format
- Return times in HH:MM 24-hour format`,
        },
      ],
      schema: taskSchema,
    });

    console.log('Parsed task data:', result);
    return result;
  } catch (error) {
    console.error('Failed to parse voice input:', error);
    return {
      name: transcription,
    };
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
      searchText: z.string().optional().describe('Keywords to search in task names and descriptions'),
      dueToday: z.boolean().optional().describe('True if user wants to see only today\'s tasks'),
      dueTime: z.string().optional().describe('Specific time in HH:MM format if user asks for tasks at a specific time'),
      maxDuration: z.number().optional().describe('Maximum task duration in minutes if user asks for quick tasks'),
    });

    const today = new Date();
    const contextMessage = `Today is ${today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}. Current time is ${today.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })}.`;

    const result = await generateObject({
      messages: [
        {
          role: 'user',
//           content: `${contextMessage}\n\nExtract filter criteria from this voice query: "${transcription}"\n\nExamples:
// - "Show me today's tasks" -> dueToday: true
// - "Show me high priority tasks" -> priority: "high"
// - "Tasks I can finish in 15 minutes" -> maxDuration: 15
// - "Show me tasks at 5:30 PM" -> dueTime: "17:30"
// - "What work tasks do I have" -> category: "work"`,
// content: `${contextMessage}

// You are an assistant that extracts filters from natural language task queries.
// ALWAYS respond **only in valid JSON**, matching this exact structure:
// {
//   "priority": "high" | "medium" | "low",
//   "category": "work" | "personal" | "urgent" | "other",
//   "searchText": "string",
//   "dueToday": true | false,
//   "dueTime": "HH:MM",
//   "maxDuration": number
// }

// Now extract filters from this user query:
// "${transcription}"

// Examples:
// - "Show me today's tasks" → {"dueToday": true}
// - "Show me high priority tasks" → {"priority": "high"}
// - "Tasks I can finish in 15 minutes" → {"maxDuration": 15}
// - "What work tasks do I have" → {"category": "work"}
// `,
content: `${contextMessage}

You are an assistant that extracts **filter criteria** for a task management app from natural language queries.

Return **only valid JSON** with this structure:
{
  "priority": "high" | "medium" | "low",
  "category": "work" | "personal" | "urgent" | "other",
  "searchText": "string",
  "dueToday": true | false,
  "dueTime": "HH:MM",
  "maxDuration": number
}

Rules:
- Always return a JSON object, even if fields are empty.
- If the query contains a task name, action, or object (like “buy groceries”, “finish report”, “call mom”), and it's not clearly a category, priority, or time → put it in **searchText**.
- If user says something like “tasks to buy groceries”, “show grocery tasks”, “where I have to call”, “show reports”, etc., put that entire meaningful phrase as **searchText**.
- For relative time words ("today", "tomorrow"), set the appropriate field (use dueToday: true for today).
- For duration-like queries (“15 minute tasks”), set **maxDuration**.
- Never return explanations, markdown, or natural language — only pure JSON.

Now extract filters from this query:
"${transcription}"

### Examples ###
"Show me today's tasks" → {"dueToday": true}
"Show me high priority tasks" → {"priority": "high"}
"Tasks I can finish in 15 minutes" → {"maxDuration": 15}
"What work tasks do I have" → {"category": "work"}
"Tell me tasks where I have to buy groceries" → {"searchText": "buy groceries"}
"Show urgent personal tasks for today" → {"priority": "high", "category": "personal", "dueToday": true}`



        },
      ],
      schema: filterSchema,
    });

    console.log('Parsed filter:', result);
    if (
  !result.priority &&
  !result.category &&
  !result.dueToday &&
  !result.dueTime &&
  !result.maxDuration &&
  !result.searchText
) {
  result.searchText = transcription
    .trim()
    .replace(/^show|list|find|tell|tasks|task|me|about|of|for|where|that|to|the/gi, '')
    .trim();
}

    return result;
  } catch (error) {
    console.error('Failed to parse voice filter:', error);
    return {
      searchText: transcription,
    };
  }
}
