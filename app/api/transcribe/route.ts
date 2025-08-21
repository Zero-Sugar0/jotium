import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { audioBase64, mimeType = "audio/wav" } = await request.json();

    if (!audioBase64) {
      return NextResponse.json(
        { error: "No audio data provided" },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });
    
    const contents = [
      { text: "Please transcribe this audio accurately. Return only the transcribed text without any additional commentary." },
      {
        inlineData: {
          mimeType,
          data: audioBase64,
        },
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    const transcription = response.text?.trim() || "";

    return NextResponse.json({ transcription });

  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
