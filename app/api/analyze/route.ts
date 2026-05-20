import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

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

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: imageBase64,
              },
            },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/```json\n([\s\S]+?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    const result = JSON.parse(jsonStr);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}
