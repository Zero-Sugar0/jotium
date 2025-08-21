import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/app/(auth)/auth";

const FileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size should be less than 5MB",
    })
    .refine(
      (file) =>
        [
          // Images
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "image/bmp",
          "image/tiff",
          // PDF
          "application/pdf",
          // Audio formats supported by Gemini
          "audio/wav",
          "audio/wave",
          "audio/x-wav",
          "audio/mp3",
          "audio/mpeg",
          "audio/mp4",
          "audio/aac",
          "audio/aiff",
          "audio/x-aiff",
          "audio/ogg",
          "audio/flac",
          "audio/x-flac",
        ].includes(file.type),
      {
        message: "File type should be JPEG, PNG, WebP, PDF, or supported audio formats (WAV, MP3, AAC, AIFF, OGG, FLAC)",
      },
    ),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const filename = file.name;
    const fileBuffer = await file.arrayBuffer();

    try {
      const data = await put(`${filename}`, fileBuffer, {
        access: "public",
      });

      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
