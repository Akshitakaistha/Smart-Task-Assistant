import { z } from "zod";

interface GenerateObjectOptions<T> {
  messages: { role: "user" | "system" | "assistant"; content: string }[];
  schema: z.ZodSchema<T>;
}

export async function generateObject<T>({
  messages,
  schema,
}: GenerateObjectOptions<T>): Promise<T> {
  console.log("🚀 Sending structured request to OpenRouter...");

  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  const model = "mistralai/mistral-7b-instruct";

  if (!apiKey) {
    console.warn("⚠️ No OpenRouter API key found! Returning empty object.");
    return schema.parse({});
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
      }),
    });

    const json = await response.json();
    console.log("📩 OpenRouter full response:", JSON.stringify(json, null, 2));

    const rawContent = json?.choices?.[0]?.message?.content?.trim?.() ?? "";
    console.log("🧠 Raw AI output:", rawContent);

    if (!rawContent || rawContent.length < 5) {
      console.warn("Empty or invalid AI response. Returning schema defaults.");
      return schema.parse({});
    }

    const cleaned = extractJSON(rawContent);
    let parsed: any = {};

    try {
      parsed = cleaned ? JSON.parse(cleaned) : {};
      console.log("JSON parsed successfully:", parsed);
    } catch (parseErr) {
      console.warn("AI response was not JSON. Attempting fallback parse...");
      parsed = extractFromPlainText(cleaned);
    }

    const normalized = normalizeKeys(parsed);

    console.log("Normalized object before schema validation:", normalized);

    try {
      const validated = schema.parse(normalized);
      console.log("Schema validated successfully:", validated);
      return validated;
    } catch (validationErr) {
      console.warn("Schema validation failed:", validationErr);
      const fallback = schema.parse({});
      console.log("Returning schema defaults instead:", fallback);
      return fallback;
    }
  } catch (err) {
    console.error("generateObject() failed:", err);
    const fallback = schema.parse({});
    return fallback;
  }
}

function extractJSON(rawContent: string): string {
  let cleaned = rawContent;

  const jsonMatch = rawContent.match(/{[\s\S]*}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  } else {
    const firstBrace = rawContent.indexOf('{');
    const lastBrace = rawContent.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = rawContent.slice(firstBrace, lastBrace + 1);
    }
  }

  return cleaned
    .replace(/```json|```|<s>|<\/s>|\[OUT\]|\[\/OUT\]/gi, "")
    .trim();
}

function extractFromPlainText(text: string): any {
  return {
    name: (text.match(/Task Name:\s*(.+)/i)?.[1] || "").trim(),
    description: (text.match(/Description:\s*(.+)/i)?.[1] || "").trim(),
    dueDate: (text.match(/Date:\s*(\d{4}-\d{2}-\d{2})/i)?.[1] || "").trim(),
    dueTime: (text.match(/Time:\s*(\d{2}:\d{2})/i)?.[1] || "").trim(),
    duration: parseInt(text.match(/Duration:\s*(\d+)/i)?.[1] || "0", 10),
    priority:
      text.toLowerCase().includes("high") ? "high" :
      text.toLowerCase().includes("low") ? "low" : "medium",
    category:
      text.toLowerCase().includes("work") ? "work" :
      text.toLowerCase().includes("personal") ? "personal" : "other",
    reminderMinutes: parseInt(text.match(/Remind.*?(\d+)/i)?.[1] || "0", 10),
  };
}

function normalizeKeys(parsed: any): any {
  const normalized: any = { ...parsed };

  if (parsed.task_name && !parsed.name) normalized.name = parsed.task_name;
  if (parsed.taskName && !parsed.name) normalized.name = parsed.taskName;
  if (parsed.date && !parsed.dueDate) normalized.dueDate = parsed.date;
  if (parsed.time && !parsed.dueTime) normalized.dueTime = parsed.time;

  if (parsed.reminder && !parsed.reminderMinutes) {
    const reminderMatch = String(parsed.reminder).match(/(\d+)/);
    normalized.reminderMinutes = reminderMatch ? parseInt(reminderMatch[1], 10) : 0;
  }

  if (typeof normalized.reminderMinutes === "string") {
    const numMatch = normalized.reminderMinutes.match(/(\d+)/);
    normalized.reminderMinutes = numMatch ? parseInt(numMatch[1], 10) : 0;
  }

  if (parsed.duration === "") normalized.duration = undefined;

  return normalized;
}
