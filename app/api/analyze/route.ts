import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

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
If no food is detected, return totalCalories: 0, empty items array, and explain in notes.`;

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

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const result = await model.generateContent([
      { inlineData: { data: imageBase64, mimeType } },
      PROMPT,
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/```json\n([\s\S]+?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Analyze error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
