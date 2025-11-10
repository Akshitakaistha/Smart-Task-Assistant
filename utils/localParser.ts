import * as chrono from "chrono-node";

type TaskPriority = 'high' | 'medium' | 'low';
type TaskCategory = 'work' | 'personal' | 'urgent' | 'other';

export async function parseVoiceFilterLocal(transcription: string): Promise<{
  priority?: TaskPriority;
  category?: TaskCategory;
  searchText?: string;
  dueToday?: boolean;
  dueTime?: string;
  maxDuration?: number;
}> {
  try {
    console.log('Parsing voice filter locally:', transcription);
    let text = transcription.toLowerCase().trim();

    const result: {
      priority?: TaskPriority;
      category?: TaskCategory;
      searchText?: string;
      dueToday?: boolean;
      dueTime?: string;
      maxDuration?: number;
    } = {};

    // -----------------------------
    // 1️⃣ PRIORITY DETECTION
    // -----------------------------
    if (/\b(high|urgent|critical|important|asap)\b/.test(text)) result.priority = 'high';
    else if (/\b(low|less important|not urgent)\b/.test(text)) result.priority = 'low';
    else if (/\b(medium|normal|regular)\b/.test(text)) result.priority = 'medium';

    // -----------------------------
// 2️⃣ CATEGORY DETECTION (Improved)
// -----------------------------
  if (/\b(work|office|project|meeting|client|report)\b/.test(text)) result.category = 'work';
    else if (/\b(personal|home|family|grocer|shopping|self|health)\b/.test(text)) result.category = 'personal';
    else if (/\b(urgent|emergency|immediate)\b/.test(text)) result.category = 'urgent';
    else if (/\b(other|misc|general)\b/.test(text)) result.category = 'other';
// ⚠️ Do NOT default to "other" unless explicitly mentioned
// Leave category undefined if no match

// -----------------------------
// 6️⃣ SEARCH TEXT DETECTION (Improved)
// -----------------------------
// let searchText = text
//   .replace(/\b(show|list|find|tell|me|tasks?|task|about|of|for|where|that|to|the|my|at|in|on|with|which|are|by|from|who|whose|having|have)\b/g, '')
//   .replace(/\b(high|low|medium|urgent|personal|work|today|tonight|minute|minutes|hour|hours|priority|important|critical)\b/g, '')
//   .trim();

// // Extract meaningful phrases (e.g., “buy groceries”, “call mom”, etc.)
// if (searchText.length > 0) {
//   searchText = searchText.replace(/[.,!?]+$/, '').trim();
//   // Remove leftover filler words like "which are on" or "that are"
//   searchText = searchText.replace(/\b(which|are|on|is|was|be|being|been)\b/g, '').trim();

//   // Remove multiple spaces
//   searchText = searchText.replace(/\s{2,}/g, ' ').trim();

//   result.searchText = searchText.length > 0 ? searchText : undefined;
// }
let searchText = text
      .replace(/\b(show|list|find|filter|tell|me|tasks?|task|about|of|for|where|that|to|the|my|at|in|on|with|which|are|by|from|who|whose|having|have)\b/g, '')
      .replace(/\b(high|low|medium|urgent|personal|work|today|tonight|minute|minutes|hour|hours|priority|important|critical|category)\b/g, '')
      .trim();

    // Remove filler phrases like "or challenge category", "with category", "having category"
    searchText = searchText.replace(/\b(or|and)?\s*(challenge|category|type|kind|group)\b/g, '').trim();

    // Clean punctuation and multiple spaces
    searchText = searchText.replace(/[.,!?]+$/, '').replace(/\s{2,}/g, ' ').trim();

    // ✅ If category is detected and search text is empty or useless → ignore it
    if (result.category && (!searchText || searchText.length < 3)) {
      searchText = '';
    }

    if (searchText.length > 0) result.searchText = searchText;


    // -----------------------------
    // 3️⃣ DUE TODAY DETECTION
    // -----------------------------
    if (/\b(today|tonight|this day)\b/.test(text)) result.dueToday = true;
    else result.dueToday = false;

    // -----------------------------
    // 4️⃣ DUE TIME DETECTION (HH:MM)
    // -----------------------------
    const chronoResults = chrono.parse(text);
    if (chronoResults.length > 0) {
      const parsedDate = chronoResults[0].start?.date();
      if (parsedDate) {
        const hours = parsedDate.getHours().toString().padStart(2, '0');
        const minutes = parsedDate.getMinutes().toString().padStart(2, '0');
        result.dueTime = `${hours}:${minutes}`;
      }
    }

    // -----------------------------
    // 5️⃣ MAX DURATION DETECTION (in minutes)
    // -----------------------------
    const durationMatch = text.match(/(\d+)\s*(min|mins|minute|minutes|hour|hours|hr|hrs)/);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      if (/(hour|hours|hr|hrs)/.test(durationMatch[2])) {
        result.maxDuration = value * 60;
      } else {
        result.maxDuration = value;
      }
    }

    // -----------------------------
    // 6️⃣ SEARCH TEXT DETECTION
    // -----------------------------
  

    // -----------------------------
    // 7️⃣ Default fallback
    // -----------------------------
    if (
      !result.priority &&
      !result.category &&
      !result.dueToday &&
      !result.dueTime &&
      !result.maxDuration &&
      !result.searchText
    ) {
      result.searchText = text;
    }

    console.log('Local filter parse result:', result);
    return result;
  } catch (err) {
    console.error('Error in parseVoiceFilterLocal:', err);
    return { searchText: transcription };
  }
}
