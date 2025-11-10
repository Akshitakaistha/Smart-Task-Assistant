
// import * as chrono from "chrono-node";
// import { z } from "zod";

// /* ------------------------------
// 📘 TASK SCHEMA
// ------------------------------ */
// export const taskSchema = z.object({
//   name: z.string().optional(),
//   description: z.string().optional(),
//   dueDate: z.string().optional(),   // YYYY-MM-DD (IST)
//   dueTime: z.string().optional(),   // HH:MM (24h) IST
//   duration: z.number().optional(),  // minutes
//   priority: z.enum(["low", "medium", "high"]).default("medium"),
//   category: z.enum(["work", "personal", "urgent", "other"]).default("other"),
//   reminderMinutes: z.number().optional(),
// });

// /* ------------------------------
// HELPERS & CONSTS
// ------------------------------ */
// const pad = (n: number) => String(n).padStart(2, "0");
// const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

// const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +5:30 in ms

// const WORD_NUMBER: Record<string, number> = {
//   zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
//   six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11,
//   twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
//   twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60
// };
// function toNumberToken(tok?: string): number | undefined {
//   if (!tok) return undefined;
//   const n = parseInt(tok, 10);
//   if (!isNaN(n)) return n;
//   return WORD_NUMBER[tok.toLowerCase()] ?? undefined;
// }

// /* ------------------------------
// TEXT NORMALIZATION & STRIP
// ------------------------------ */
// function stripContext(text: string) {
//   return text
//     .replace(/^Extract task information from this voice input:/i, "") // <- remove this
//     .replace(/^Extract task information[\s\S]*?:/i, "")
//     .replace(/^Today is[\s\S]*?Current time.*?\n/i, "")
//     .replace(/\bRules:[\s\S]*$/i, "")
//     .replace(/["“”]/g, "")
//     .trim();
// }


// /* normalize "6 30 p.m." / "630pm" -> "6:30 pm" */
// function normalizeTimeNotation(s: string) {
//   return s
//     .replace(/\b(\d{1,2})\s+(\d{2})\s*(a\.?m\.?|p\.?m\.?)\b/gi, "$1:$2 $3")
//     .replace(/\b(\d{1,2})(\d{2})\s*(a\.?m\.?|p\.?m\.?)\b/gi, "$1:$2 $3")
//     .replace(/\./g, ':')  // replace dot between hour/minutes
//     .replace(/\s+/g, ' ') // normalize spaces
//     .trim();
// }



// /* ------------------------------
// DURATION & REMINDER PARSERS
// ------------------------------ */
// function parseDurationFromText(text: string): number | undefined {
//   const m = text.match(/\bduration\s*(?:is|:)?\s*([a-z0-9]+)\s*(hours?|hrs?|minutes?|mins?)\b/i);
//   if (m) {
//     const num = toNumberToken(m[1]);
//     if (num != null) return /hour|hr/i.test(m[2]) ? num * 60 : num;
//   }
//   // fallback: "for 30 minutes" (avoid matching "at 5:30")
//   const f = text.match(/\bfor\s+([a-z0-9]+)\s*(hours?|hrs?|minutes?|mins?)\b/i);
//   if (f) {
//     const num = toNumberToken(f[1]);
//     if (num != null) return /hour|hr/i.test(f[2]) ? num * 60 : num;
//   }
//   return undefined;
// }

// /* capture "reminder, 45 minutes", "reminder 1 hour", "remind me 15 mins" */
// function parseReminderFromText(text: string): number | undefined {
//   if (/\b(no reminder|don't remind|do not remind|no need to remind)\b/i.test(text)) return 0;

//   let m = text.match(/\breminder\s*(?:is|:|,)?\s*([a-z0-9]+)\s*(hours?|hrs?|minutes?|mins?)\b/i);
//   if (!m) {
//     m = text.match(/\bremind(?: me)?(?: in| after|:)?\s*([a-z0-9]+)\s*(hours?|hrs?|minutes?|mins?)\b/i);
//   }

//   if (m) {
//     const n = toNumberToken(m[1]) ?? parseInt(m[1], 10);
//     if (n != null) return /hour|hr/i.test(m[2]) ? n * 60 : n;
//   }
//   return undefined;
// }


// /* ------------------------------
// TIME PARSING (IST-correct)
// ------------------------------ */
// /**
//  * Given a chrono-parsed Date (which is in runtime local timezone),
//  * convert it into IST Date object reliably:
//  *   - compute UTC ms by subtracting local timezone offset,
//  *   - then add IST offset.
//  */
// function toISTDateFromParsed(parsedDate: Date): Date {
//   const localOffsetMs = parsedDate.getTimezoneOffset() * 60000; // minutes -> ms
//   const utcMs = parsedDate.getTime() + localOffsetMs;
//   const istMs = utcMs + IST_OFFSET_MS;
//   return new Date(istMs);
// }

// /* parse time tokens heuristically when chrono fails */
// function findTimeToken(text: string): string | undefined {
//   const normalized = normalizeTimeNotation(text);

//   // 1️⃣ Explicit context
//   const contextRegex = /\b(?:at|around|due time is|due time|time is|schedule is|scheduled at)\b\s*(\d{1,2}:\d{2}\s*(?:am|pm))\b/i;
//   const c = normalized.match(contextRegex);
//   if (c && c[1]) return c[1];

//   // 2️⃣ Any hh:mm am/pm in text
//   const timeRegex = /\b(\d{1,2}:\d{2}\s*(?:am|pm))\b/i;
//   const t = normalized.match(timeRegex);
//   if (t && t[1]) return t[1];

//   // 3️⃣ fallback hh am/pm
//   const fallback = normalized.match(/\b(\d{1,2}\s*(?:am|pm))\b/i);
//   if (fallback && fallback[1]) return fallback[1];

//   return undefined;
// }


// /* build an IST Date from a base IST date (usually today/tomorrow) + timeToken */
// function buildISTDateForTimeToken(baseIST: Date, token: string) {
//   // normalize token
//   let t = token.replace(/\./g, "").trim().toLowerCase(); // remove dots in am/pm
//   const mer = t.match(/\b(am|pm)\b/);
//   const hasMer = !!mer;
//   t = t.replace(/\b(am|pm)\b/, "").trim();

//   const parts = t.split(/[:.]/).filter(Boolean);
// let hour = parseInt(parts[0] || "0", 10);
// let minute = parts.length > 1 ? parseInt(parts[1], 10) : 0; // fallback 0 if missing


//   if (hasMer) {
//     if (mer && mer[1] === "pm" && hour !== 12) hour += 12;
//     if (mer && mer[1] === "am" && hour === 12) hour = 0;
//   }
//   // create IST date based on baseIST (we assume baseIST is a Date already in IST)
//   const out = new Date(baseIST.getTime());
//   out.setHours(hour, minute, 0, 0);
//   return out;
// }

// // Short and concise task name
// function extractTaskName(text: string): string {
//   const m = text.match(/\b(?:create|make|add|plan|schedule|set|remind|delete|update|fix|call|buy|send|meet|prepare|check|visit)\b(?: a)?(?: task| note| reminder| to[-\s]?do\s+list)?\s*(?:to|for)?\s*(.+?)(?=\.|,|;| and | I want|$)/i);
//   if (m && m[1]) {
//     let name = m[1].replace(/\b(due|duration|priority|category|remind)\b.*$/i, "").trim();
//     if (name.length > 80) name = name.split(/\b(due|duration|priority|category|remind)\b/i)[0].trim();
//     return name.charAt(0).toUpperCase() + name.slice(1);
//   }
//   return text.split(/[.]/)[0].trim();
// }


// function extractDescription(text: string, taskName: string) {
//   let desc = text;

//   // Remove task name from start
//   const nameRegex = new RegExp(`^${taskName}`, "i");
//   desc = desc.replace(nameRegex, "").trim();

//   // Remove metadata phrases (due date/time, duration, priority, category, reminder)
//   desc = desc.replace(/\b(due\s*(date|time)?|duration|priority|category|remind(er)?|schedule(d)?|dependency)\b[^.]*[.]?/gi, "");

//   // Remove extra punctuation at start/end
//   desc = desc.replace(/^[\s:,-]+|[\s:,-]+$/g, "");

//   // Normalize spaces
//   desc = desc.replace(/\s{2,}/g, " ");

//   return desc || taskName;
// }


// /* ------------------------------
// MAIN PARSER (FIXED IST + REMINDER)
// ------------------------------ */
// export async function generateObject<T>({
//   messages,
//   schema,
// }: {
//   messages: { role: "user" | "system" | "assistant"; content: string }[];
//   schema: z.ZodSchema<T>;
// }): Promise<T> {
//   const raw = messages.filter(m => m.role === "user").map(m => m.content).join("\n").trim();
//   if (!raw) return schema.parse({});

//   // remove injected system/context text
//   const text = stripContext(raw);
//   const normalizedTimeText = normalizeTimeNotation(text);
//   console.log("🗣 Clean input:", text);

//   const out: any = {
//     name: undefined,
//     description: undefined,
//     dueDate: undefined,
//     dueTime: undefined,
//     duration: undefined,
//     priority: "medium",
//     category: "other",
//     reminderMinutes: undefined,
//   };

//   // 1) Try chrono parse first (use raw normalized text but reference now)
//   // chrono.parse returns Date in runtime local tz; we will convert to IST correctly.
//   const chronoResults = chrono.parse(normalizedTimeText, new Date());
//  // Prefer time tokens first
// let timeTok = findTimeToken(normalizedTimeText);  // use raw cleaned text
// if (timeTok) {
//   const now = new Date();
//   const utcNowMs = now.getTime() + now.getTimezoneOffset() * 60000;
//   const nowIst = new Date(utcNowMs + IST_OFFSET_MS);
//   const istWithToken = buildISTDateForTimeToken(nowIst, timeTok);
//   out.dueDate = formatDate(istWithToken);
//   out.dueTime = formatTime(istWithToken);
// } else if (chronoResults.length > 0) {
//   const parsedDate = chronoResults[0].start.date();
//   const istDate = toISTDateFromParsed(parsedDate);
//   out.dueDate = formatDate(istDate);
//   out.dueTime = formatTime(istDate);
// }


//   // 2) Duration
//   const dur = parseDurationFromText(normalizedTimeText);
//   if (dur != null) out.duration = dur;

//   // 3) Reminder
//   const rem = parseReminderFromText(normalizedTimeText);
//   if (rem !== undefined) out.reminderMinutes = rem;

//   // 4) Priority
//   if (/\b(priority\s*(is|:)?\s*(low|medium|high))\b/i.test(normalizedTimeText)) {
//     const m = normalizedTimeText.match(/\bpriority\s*(?:is|:)?\s*(low|medium|high)\b/i);
//     if (m) out.priority = m[1].toLowerCase();
//   } else if (/\b(urgent|asap|important)\b/i.test(normalizedTimeText)) {
//     out.priority = "high";
//   }

//   // 5) Category
//   if (/\b(work|office|meeting|project)\b/i.test(normalizedTimeText)) out.category = "work";
//   else if (/\b(personal|home|family|shopping|buy|grocery|market)\b/i.test(normalizedTimeText))
//     out.category = "personal";
//   else if (/\b(urgent|critical)\b/i.test(normalizedTimeText)) out.category = "urgent";

//   // 6) Name extraction (concise)
//   // const verbMatch = normalizedTimeText.match(
//   //   /\b(create|add|make|set|schedule|plan|update|fix|delete|call|buy|send|meet|prepare|check|visit)\b\s+(?:a\s+task\s+to\s+|to\s+)?([^.,;]+)/i
//   // );
//   // if (verbMatch) {
//   //   out.name = `${verbMatch[1]} ${verbMatch[2]}`.trim().replace(/\s{2,}/g, " ");
//   // } else {
//   //   out.name = normalizedTimeText.split(/[.]/)[0].split(/\s+/).slice(0, 10).join(" ");
//   // }
//   out.name = extractTaskName(normalizedTimeText);

//   // 7) Clean description: remove name, remove meta fragments (date/time/duration/priority/category/reminder)
//   // let desc = normalizedTimeText.replace(new RegExp(out.name, "i"), "").trim();
//   // desc = desc
//   //   .replace(/\b(due|date|at|on|duration|priority|category|remind|reminder|dependency|schedule|scheduled)\b[^.,;]*/gi, "")
//   //   .replace(/\s{2,}/g, " ")
//   //   .trim();
//   // out.description = desc || out.name;
//   // 7) Clean description: remove task name and metadata keywords

// // Usage
// out.description = extractDescription(normalizedTimeText, out.name);


//   console.log("🧩 Parsed result (fixed IST + reminder):", out);
//   return schema.parse(out);
// }
import * as chrono from "chrono-node";
import { z } from "zod";

/* ------------------------------
📘 TASK SCHEMA
------------------------------ */
export const taskSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),   // YYYY-MM-DD (IST)
  dueTime: z.string().optional(),   // HH:MM (24h) IST
  duration: z.number().optional(),  // minutes
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  category: z.enum(["work", "personal", "urgent", "other"]).default("other"),
  reminderMinutes: z.number().optional(),
});

/* ------------------------------
HELPERS & CONSTS
------------------------------ */
const pad = (n: number) => String(n).padStart(2, "0");
const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +5:30 in ms

const WORD_NUMBER: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11,
  twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60
};

function toNumberToken(tok?: string): number | undefined {
  if (!tok) return undefined;
  const n = parseInt(tok, 10);
  if (!isNaN(n)) return n;
  return WORD_NUMBER[tok.toLowerCase()] ?? undefined;
}

/* ------------------------------
TEXT NORMALIZATION & STRIP
------------------------------ */
function stripContext(text: string) {
  let cleaned = text
    .replace(/^Extract task information from this voice input:\s*/i, "")
    .replace(/^Extract task information[\s\S]*?:\s*/i, "")
    .replace(/^Today is[\s\S]*?Current time.*?\n/i, "")
    .replace(/\bRules:[\s\S]*$/i, "")
    .replace(/["""]/g, "")
    .trim();
  
  // If the cleaning didn't work, try splitting by colon
  if (cleaned.toLowerCase().startsWith('extract')) {
    const colonIndex = cleaned.indexOf(':');
    if (colonIndex !== -1) {
      cleaned = cleaned.substring(colonIndex + 1).trim();
    }
  }
  
  return cleaned;
}

function normalizeTimeNotation(s: string) {
  return s
    .replace(/\b(\d{1,2})\s+(\d{2})\s*(a\.?m\.?|p\.?m\.?)\b/gi, "$1:$2 $3")
    .replace(/\b(\d{1,2})(\d{2})\s*(a\.?m\.?|p\.?m\.?)\b/gi, "$1:$2 $3")
    .replace(/\./g, ':')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ------------------------------
METADATA DETECTION
------------------------------ */
// All possible metadata keywords that should not be in task name
const METADATA_KEYWORDS = [
  // Time-related
  'due', 'deadline', 'by', 'at', 'on', 'time', 'schedule', 'scheduled',
  'today', 'tomorrow', 'tonight', 'morning', 'afternoon', 'evening', 'night',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'next', 'this', 'week', 'month', 'year',
  // Duration
  'duration', 'for', 'takes', 'lasting',
  // Priority & Category
  'priority', 'urgent', 'important', 'asap', 'critical',
  'work', 'personal', 'category',
  // Reminder
  'remind', 'reminder', 'notify', 'notification', 'alert',
  // Common filler
  'please', 'need to', 'have to', 'want to', 'should', 'must',
  'also', 'and then', 'after that',
];

function findMetadataStart(text: string): number {
  const lower = text.toLowerCase();
  let earliest = text.length;
  
  // Find earliest occurrence of metadata keywords
  for (const keyword of METADATA_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    const match = lower.match(regex);
    if (match && match.index !== undefined && match.index < earliest) {
      earliest = match.index;
    }
  }
  
  // Also check for time patterns (HH:MM, dates)
  const timePatterns = [
    /\b\d{1,2}:\d{2}\s*(?:am|pm)?\b/i,
    /\b\d{1,2}\s*(?:am|pm)\b/i,
    /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/,
  ];
  
  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match && match.index !== undefined && match.index < earliest) {
      earliest = match.index;
    }
  }
  
  return earliest;
}

/* ------------------------------
ENHANCED NAME EXTRACTION
------------------------------ */
function extractTaskName(text: string): string {
  // Remove common voice input prefixes
  let cleaned = text
    .replace(/^(can you |could you |please |i need to |i want to |i have to |i should |let me )/i, '')
    .replace(/^(create|make|add|set|schedule|plan)\s+(a\s+)?(task|reminder|note|todo|to[-\s]?do)(\s+to|\s+for)?\s*/i, '')
    .trim();

  // Find where metadata starts
  const metaStart = findMetadataStart(cleaned);
  
  // Extract core task name before metadata
  let name = cleaned.substring(0, metaStart).trim();
  
  // Clean up punctuation and connectors at the end
  name = name
    .replace(/[,;]?\s*(and|then|also|with)?\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // If name is too short or empty, try to extract action + object
  if (name.length < 3) {
    const actionMatch = text.match(
      /\b(call|email|send|buy|get|pick up|drop off|meet|visit|check|review|complete|finish|submit|prepare|organize|clean|fix|update|write|read|study|practice|exercise|cook|book|pay|cancel|confirm)\s+([^,;.]+?)(?=\s+(?:by|at|on|due|for|duration|priority|remind|and|then)|[,;.]|$)/i
    );
    if (actionMatch) {
      name = `${actionMatch[1]} ${actionMatch[2]}`.trim();
    }
  }
  
  // Fallback: take first meaningful segment
  if (!name || name.length < 3) {
    name = text.split(/[,;.]/)[0]
      .replace(/^(create|make|add|set|schedule|plan)\s+(a\s+)?(task|reminder|note)(\s+to|\s+for)?\s*/i, '')
      .trim();
  }
  
  // Limit length and capitalize
  if (name.length > 100) {
    name = name.substring(0, 100).trim();
  }
  
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/* ------------------------------
ENHANCED DESCRIPTION EXTRACTION
------------------------------ */
function extractDescription(text: string, taskName: string): string {
  let desc = text;
  
  // Remove the task name if it appears at the start
  const nameRegex = new RegExp(`^${escapeRegex(taskName)}`, 'i');
  desc = desc.replace(nameRegex, '').trim();
  
  // Remove common voice command prefixes
  desc = desc.replace(/^(create|make|add|set|schedule|plan)\s+(a\s+)?(task|reminder|note|todo)(\s+to|\s+for)?\s*/i, '');
  
  // Remove all metadata sections
  const metaPatterns = [
    // Time-related
    /\b(due|deadline|by|at|on|scheduled?)\s+(?:date|time|is|:)?\s*[^,;.]*[,;.]?/gi,
    /\b(?:today|tomorrow|tonight|next\s+\w+|this\s+\w+)\b[^,;.]*/gi,
    /\b\d{1,2}:\d{2}\s*(?:am|pm)?(?:\s*(?:am|pm))?\b/gi,
    /\b\d{1,2}\s*(?:am|pm)\b/gi,
    // Duration
    /\b(?:duration|for|takes|lasting)\s+(?:is|:)?\s*\d+\s*(?:hour|hr|minute|min)s?\b/gi,
    // Priority
    /\b(?:priority|urgent|important|asap|critical)(?:\s+(?:is|:))?\s*\w*/gi,
    // Category
    /\b(?:category|work|personal)(?:\s+(?:is|:))?\s*\w*/gi,
    // Reminder
    /\b(?:remind|reminder|notify|alert)(?:\s+me)?(?:\s+(?:in|after|before|is|:))?\s*\d*\s*(?:hour|hr|minute|min)?s?\b/gi,
    /\bno\s+reminder\b/gi,
  ];
  
  for (const pattern of metaPatterns) {
    desc = desc.replace(pattern, '');
  }
  
  // Clean up resulting text
  desc = desc
    .replace(/\s*[,;]\s*[,;]\s*/g, ', ') // Multiple punctuation
    .replace(/^[,;:\s]+|[,;:\s]+$/g, '') // Leading/trailing punct
    .replace(/\s{2,}/g, ' ') // Multiple spaces
    .trim();
  
  // If description is too short or just repeats the name, use the name as description
  if (!desc || desc.length < 3 || desc.toLowerCase() === taskName.toLowerCase()) {
    return taskName;
  }
  
  return desc;
}

function escapeRegex(str: string): string {
  // return str.replace(/[.*+?^${}()|[\]\\]/g, '\\function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\  priority: z.enum(["low", "medium", "high"]).default("medium"),');
}

/* ------------------------------
DURATION & REMINDER PARSERS
------------------------------ */
function parseDurationFromText(text: string): number | undefined {
  const m = text.match(/\bduration\s*(?:is|:)?\s*([a-z0-9]+)\s*(hours?|hrs?|minutes?|mins?)\b/i);
  if (m) {
    const num = toNumberToken(m[1]);
    if (num != null) return /hour|hr/i.test(m[2]) ? num * 60 : num;
  }
  
  const f = text.match(/\bfor\s+([a-z0-9]+)\s*(hours?|hrs?|minutes?|mins?)\b/i);
  if (f) {
    const num = toNumberToken(f[1]);
    if (num != null) return /hour|hr/i.test(f[2]) ? num * 60 : num;
  }
  
  const t = text.match(/\btakes?\s+([a-z0-9]+)\s*(hours?|hrs?|minutes?|mins?)\b/i);
  if (t) {
    const num = toNumberToken(t[1]);
    if (num != null) return /hour|hr/i.test(t[2]) ? num * 60 : num;
  }
  
  return undefined;
}

function parseReminderFromText(text: string): number | undefined {
  if (/\b(no reminder|don't remind|do not remind|no need to remind)\b/i.test(text)) return 0;

  let m = text.match(/\breminder\s*(?:is|:|,)?\s*([a-z0-9]+)\s*(hours?|hrs?|minutes?|mins?)\b/i);
  if (!m) {
    m = text.match(/\bremind(?: me)?(?: in| after| before|:)?\s*([a-z0-9]+)\s*(hours?|hrs?|minutes?|mins?)\b/i);
  }
  if (!m) {
    m = text.match(/\b(?:alert|notify)(?: me)?(?: in| after| before)?\s*([a-z0-9]+)\s*(hours?|hrs?|minutes?|mins?)\b/i);
  }

  if (m) {
    const n = toNumberToken(m[1]) ?? parseInt(m[1], 10);
    if (!isNaN(n)) return /hour|hr/i.test(m[2]) ? n * 60 : n;
  }
  return undefined;
}

/* ------------------------------
TIME PARSING (IST-correct)
------------------------------ */
function toISTDateFromParsed(parsedDate: Date): Date {
  const localOffsetMs = parsedDate.getTimezoneOffset() * 60000;
  const utcMs = parsedDate.getTime() + localOffsetMs;
  const istMs = utcMs + IST_OFFSET_MS;
  return new Date(istMs);
}

function findTimeToken(text: string): string | undefined {
  const normalized = normalizeTimeNotation(text);

  const contextRegex = /\b(?:at|around|due time is|due time|time is|schedule is|scheduled at)\b\s*(\d{1,2}:\d{2}\s*(?:am|pm))\b/i;
  const c = normalized.match(contextRegex);
  if (c && c[1]) return c[1];

  const timeRegex = /\b(\d{1,2}:\d{2}\s*(?:am|pm))\b/i;
  const t = normalized.match(timeRegex);
  if (t && t[1]) return t[1];

  const fallback = normalized.match(/\b(\d{1,2}\s*(?:am|pm))\b/i);
  if (fallback && fallback[1]) return fallback[1];

  return undefined;
}

function buildISTDateForTimeToken(baseIST: Date, token: string) {
  let t = token.replace(/\./g, "").trim().toLowerCase();
  const mer = t.match(/\b(am|pm)\b/);
  const hasMer = !!mer;
  t = t.replace(/\b(am|pm)\b/, "").trim();

  const parts = t.split(/[:.]/).filter(Boolean);
  let hour = parseInt(parts[0] || "0", 10);
  let minute = parts.length > 1 ? parseInt(parts[1], 10) : 0;

  if (hasMer) {
    if (mer && mer[1] === "pm" && hour !== 12) hour += 12;
    if (mer && mer[1] === "am" && hour === 12) hour = 0;
  }
  
  const out = new Date(baseIST.getTime());
  out.setHours(hour, minute, 0, 0);
  return out;
}

/* ------------------------------
MAIN PARSER
------------------------------ */
export async function generateObject<T>({
  messages,
  schema,
}: {
  messages: { role: "user" | "system" | "assistant"; content: string }[];
  schema: z.ZodSchema<T>;
}): Promise<T> {
  const raw = messages.filter(m => m.role === "user").map(m => m.content).join("\n").trim();
  if (!raw) return schema.parse({});

  const text = stripContext(raw);
  const normalizedTimeText = normalizeTimeNotation(text);
  console.log("🗣 Clean input:", text);

  const out: any = {
    name: undefined,
    description: undefined,
    dueDate: undefined,
    dueTime: undefined,
    duration: undefined,
    priority: "medium",
    category: "other",
    reminderMinutes: undefined,
  };

  // 1) Time parsing
  let timeTok = findTimeToken(normalizedTimeText);
  if (timeTok) {
    const now = new Date();
    const utcNowMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const nowIst = new Date(utcNowMs + IST_OFFSET_MS);
    const istWithToken = buildISTDateForTimeToken(nowIst, timeTok);
    out.dueDate = formatDate(istWithToken);
    out.dueTime = formatTime(istWithToken);
  } else {
    const chronoResults = chrono.parse(normalizedTimeText, new Date());
    if (chronoResults.length > 0) {
      const parsedDate = chronoResults[0].start.date();
      const istDate = toISTDateFromParsed(parsedDate);
      out.dueDate = formatDate(istDate);
      out.dueTime = formatTime(istDate);
    }
  }

  // 2) Duration
  const dur = parseDurationFromText(normalizedTimeText);
  if (dur != null) out.duration = dur;

  // 3) Reminder
  const rem = parseReminderFromText(normalizedTimeText);
  if (rem !== undefined) out.reminderMinutes = rem;

  // 4) Priority
  if (/\b(priority\s*(?:is|:)?\s*(low|medium|high))\b/i.test(normalizedTimeText)) {
    const m = normalizedTimeText.match(/\bpriority\s*(?:is|:)?\s*(low|medium|high)\b/i);
    if (m) out.priority = m[1].toLowerCase();
  } else if (/\b(urgent|asap|important|critical)\b/i.test(normalizedTimeText)) {
    out.priority = "high";
  } else if (/\blow\s+priority\b/i.test(normalizedTimeText)) {
    out.priority = "low";
  }

  // 5) Category
  if (/\bcategor(?:y|ies)\s+(?:is|are|:)?\s*(work|personal|urgent|other)\b/i.test(normalizedTimeText)) {
    const catMatch = normalizedTimeText.match(/\bcategor(?:y|ies)\s+(?:is|are|:)?\s*(work|personal|urgent|other)\b/i);
    if (catMatch && catMatch[1]) {
      out.category = catMatch[1].toLowerCase();
    }
  } else if (/\b(work|office|meeting|project|business)\b/i.test(normalizedTimeText)) {
    out.category = "work";
  } else if (/\b(personal|home|family|shopping|buy|grocery|market|health|fitness)\b/i.test(normalizedTimeText)) {
    out.category = "personal";
  } else if (/\b(urgent|critical|emergency)\b/i.test(normalizedTimeText)) {
    out.category = "urgent";
  }

  // 6) Name extraction (must come before description)
  out.name = extractTaskName(normalizedTimeText);

  // 7) Description extraction (uses the extracted name)
  out.description = extractDescription(normalizedTimeText, out.name);

  console.log("🧩 Parsed result:", out);
  return schema.parse(out);
}