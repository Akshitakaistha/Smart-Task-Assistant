// import { z } from "zod";

// /**
//  * Generates a structured object using OpenRouter LLM.
//  * It ensures robust JSON parsing even if model returns extra text.
//  */
// export async function generateObject({
//   messages,
//   schema,
//   model = "mistralai/mistral-7b-instruct",
// }) {
//   try {
//     console.log("🚀 Sending structured request to OpenRouter...");

//     const finalMessages = [
//       {
//         role: "system",
//         content: `You are a helpful assistant that returns ONLY valid JSON objects, no explanations, no markdown.
// Return a JSON object matching this structure: ${JSON.stringify(
//           schemaToExample(schema),
//           null,
//           2
//         )}`,
//       },
//       ...messages,
//     ];

//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${process.env.EXPO_PUBLIC_OPENROUTER_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model,
//         messages: finalMessages,
//         temperature: 0.3,
//       }),
//     });

//     const data = await response.json();

//     console.log("📩 OpenRouter full response:", JSON.stringify(data, null, 2));

//     const rawText = data?.choices?.[0]?.message?.content ?? "";
//     console.log("🧠 Raw AI output:", rawText);

//     // Extract JSON even if wrapped inside markdown or text
//     const jsonString = extractJson(rawText);
//     let jsonData = {};

//     try {
//       jsonData = JSON.parse(jsonString);
//       console.log("✅ JSON parsed successfully:", jsonData);
//     } catch (err) {
//       console.warn("⚠️ Failed to parse JSON:", err);
//       jsonData = { raw_text: rawText };
//     }

//     // Validate with Zod schema
//     const parsed = schema.safeParse(jsonData);
//     if (!parsed.success) {
//       console.warn("⚠️ Schema validation failed:", parsed.error.errors);

//       const partial = schema.partial().safeParse(jsonData);
//       if (partial.success) {
//         const merged = { ...getSchemaDefaults(schema), ...partial.data };
//         console.log("✅ Partial parse success:", merged);
//         return merged;
//       }

//       console.log("⚠️ Returning schema defaults instead.");
//       return getSchemaDefaults(schema);
//     }

//     console.log("✅ Final structured object:", parsed.data);
//     return parsed.data;
//   } catch (error) {
//     console.error("❌ generateObject error:", error);
//     return getSchemaDefaults(schema);
//   }
// }

// /**
//  * Extracts JSON block from raw text.
//  */
// function extractJson(text) {
//   const match = text.match(/{[\s\S]*}/);
//   return match ? match[0] : "{}";
// }

// /**
//  * Generates default values for Zod schemas.
//  */
// function getSchemaDefaults(schema) {
//   if (schema._def?.typeName !== "ZodObject") return {};

//   const shape = schema._def.shape; // 👈 FIXED
//   const defaults = {};

//   for (const key of Object.keys(shape)) {
//     const def = shape[key];
//     const type = def._def?.typeName;

//     if (def._def?.defaultValue) {
//       defaults[key] = def._def.defaultValue();
//     } else if (type === "ZodEnum") {
//       defaults[key] = def._def.values[0];
//     } else if (type === "ZodNumber") {
//       defaults[key] = 0;
//     } else if (type === "ZodString") {
//       defaults[key] = "";
//     } else if (type === "ZodBoolean") {
//       defaults[key] = false;
//     } else {
//       defaults[key] = null;
//     }
//   }

//   console.log("🧱 Default schema values:", defaults);
//   return defaults;
// }

// function schemaToExample(schema) {
//   const shape = schema._def?.shape ?? {}; // 👈 FIXED
//   const example = {};
//   for (const [key, def] of Object.entries(shape)) {
//     const type = def._def?.typeName;
//     if (type === "ZodEnum") {
//       example[key] = def._def.values[0];
//     } else if (type === "ZodNumber") {
//       example[key] = 0;
//     } else if (type === "ZodBoolean") {
//       example[key] = false;
//     } else {
//       example[key] = "";
//     }
//   }
//   return example;
// }


// /**
//  * Converts a Zod schema into a JSON example prompt.
//  */
// // function schemaToExample(schema) {
// //   const shape = schema._def?.shape?.() ?? {};
// //   const example = {};
// //   for (const [key, def] of Object.entries(shape)) {
// //     const type = def._def?.typeName;
// //     if (type === "ZodEnum") {
// //       example[key] = def._def.values[0];
// //     } else if (type === "ZodNumber") {
// //       example[key] = 0;
// //     } else if (type === "ZodBoolean") {
// //       example[key] = false;
// //     } else {
// //       example[key] = "";
// //     }
// //   }
// //   return example;
// // }
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

    // 🧤 handle empty or invalid output early
    if (!rawContent || rawContent.length < 5) {
      console.warn("⚠️ Empty or invalid AI response. Returning schema defaults.");
      return schema.parse({});
    }

    // --- Clean and extract JSON ---
    // const cleaned = rawContent
    //   .replace(/^[\s\S]*?\{/m, "{")
    //   .replace(/\}[\s\S]*$/m, "}")
    //   .replace(/```json|```|<s>|<\/s>|\[OUT\]|\[\/OUT\]/gi, "")
    //   .trim();

    // --- Clean and extract JSON safely ---
let cleaned = rawContent;

// If the response contains multiple braces, extract only the JSON portion
const jsonMatch = rawContent.match(/{[\s\S]*}/);
if (jsonMatch) {
  cleaned = jsonMatch[0];
} else {
  // fallback: try to slice out anything before first '{' and after last '}'
  const firstBrace = rawContent.indexOf('{');
  const lastBrace = rawContent.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = rawContent.slice(firstBrace, lastBrace + 1);
  }
}

// Remove possible code fences or tags
cleaned = cleaned
  .replace(/```json|```|<s>|<\/s>|\[OUT\]|\[\/OUT\]/gi, "")
  .trim();

  let parsed: any = {};
try {
  parsed = cleaned ? JSON.parse(cleaned) : {};
  console.log("✅ JSON parsed successfully:", parsed);
} catch (parseErr) {
  console.warn("⚠️ AI response was not JSON. Attempting fallback parse...");
  
  // Try to heuristically extract info from plain text
  const text = cleaned;

  const fallback = {
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

  console.log("🧩 Fallback parsed object:", fallback);
  parsed = fallback;
}


    // let parsed: any = {};
    // try {
    //   parsed = cleaned ? JSON.parse(cleaned) : {};
    //   console.log("✅ JSON parsed successfully:", parsed);
    // } catch (parseErr) {
    //   console.error("❌ Failed to parse JSON:", parseErr, "\nRaw cleaned:", cleaned);
    //   parsed = {};
    // }

    // --- Normalize keys ---
    const normalized: any = { ...parsed };

    if (parsed.task_name && !parsed.name) normalized.name = parsed.task_name;
    if (parsed.taskName && !parsed.name) normalized.name = parsed.taskName;
    if (parsed.date && !parsed.dueDate) normalized.dueDate = parsed.date;
    if (parsed.time && !parsed.dueTime) normalized.dueTime = parsed.time;
    // if (parsed.reminder && !parsed.reminderMinutes)
    //   normalized.reminderMinutes = parsed.reminder;
    if (parsed.reminder && !parsed.reminderMinutes) {
  // Extract a number from reminder text (e.g., "10 minutes before the task")
  const reminderMatch = String(parsed.reminder).match(/(\d+)/);
  normalized.reminderMinutes = reminderMatch ? parseInt(reminderMatch[1], 10) : 0;
}

// // Defensive: if reminderMinutes is a string, convert to number
// if (typeof normalized.reminderMinutes === "string") {
//   const match = normalized.reminderMinutes.match(/(\d+)/);
//   normalized.reminderMinutes = match ? parseInt(match[1], 10) : 0;
// }

if (typeof normalized.reminderMinutes === "string") {
  const numMatch = normalized.reminderMinutes.match(/(\d+)/);
  if (numMatch) {
    normalized.reminderMinutes = parseInt(numMatch[1], 10);
  } else {
    normalized.reminderMinutes = 0;
  }
}

    if (parsed.duration === "") normalized.duration = undefined;

    console.log("🧩 Normalized object before schema validation:", normalized);

    try {
      const validated = schema.parse(normalized);
      console.log("✅ Schema validated successfully:", validated);
      return validated;
    } catch (validationErr) {
      console.warn("⚠️ Schema validation failed:", validationErr);
      const fallback = schema.parse({});
      console.log("⚙️ Returning schema defaults instead:", fallback);
      return fallback;
    }
  } catch (err) {
    console.error("❌ generateObject() failed:", err);
    const fallback = schema.parse({});
    return fallback;
  }
}
