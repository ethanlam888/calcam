import { NextRequest, NextResponse } from "next/server";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

const PROMPT = `Analyze this food image and return ONLY a JSON code block with this exact shape:

\`\`\`json
{
  "totalCalories": 450,
  "confidence": "medium",
  "items": [
    { "name": "Grilled chicken breast", "quantity": "150g", "calories": 248 },
    { "name": "Brown rice", "quantity": "100g", "calories": 112 }
  ],
  "notes": "Estimate assumes no added oils."
}
\`\`\`

Confidence levels: "high" (clearly visible single item with known portion), "medium" (identifiable but portions unclear), "low" (multiple mixed items or poor lighting).
If no food is detected, return totalCalories: 0, empty items array, and explain in notes.
Return ONLY the JSON code block, nothing else.`;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    const validMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validMimeTypes.includes(mimeType)) {
      return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
    }

    const ollamaRes = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llava",
        prompt: PROMPT,
        images: [imageBase64],
        stream: false,
      }),
    }).catch(() => {
      throw new Error("Cannot connect to Ollama. Make sure it is running: ollama serve");
    });

    if (!ollamaRes.ok) {
      const body = await ollamaRes.text();
      throw new Error(`Ollama error ${ollamaRes.status}: ${body}`);
    }

    const data = await ollamaRes.json();
    const text: string = data.response ?? "";

    const jsonMatch = text.match(/```json\n([\s\S]+?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text.trim();
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Analyze error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
