const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash-lite";

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment");
}

export async function suggestTaskOrder(tasks: {
  taskId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  estimatedTime: number;
}[]): Promise<string[]> {
  if (!tasks || tasks.length === 0) return [];

  const cleanTasks = tasks.map((t) => ({
    taskId: t.taskId,
    title: t.title || "",
    description: t.description ?? null,
    dueDate: t.dueDate ?? null,
    estimatedTime: t.estimatedTime,
  }));

  const promptText = `
You are a productivity assistant.
Given the following tasks, provide the optimal order for completion.

Respond ONLY with a JSON array of taskIds.

Tasks:
${JSON.stringify(cleanTasks, null, 2)}
`;

  const body = {
    contents: [
      {
        parts: [
          { text: promptText },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 500,
    },
  };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json();
    console.log("Gemini API raw:", data);

    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    if (!text) {
      console.error("Gemini returned no text:", data);
      return tasks.map((t) => t.taskId);
    }

    // Remove Markdown code blocks if present
    text = text.replace(/^```(?:json)?\s*/, "").replace(/```$/, "").trim();

    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.every((v) => typeof v === "string")) {
      return parsed;
    } else {
      console.warn("Gemini response is not an array of strings:", parsed);
    }
  } catch (err) {
    console.error("Error calling Gemini API:", err);
  }

  // Fallback: original order
  return tasks.map((t) => t.taskId);
}
