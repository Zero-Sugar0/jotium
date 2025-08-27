import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { getChatMessages } from "@/lib/redis-queries";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");

    const result = await getChatMessages(id, page, limit);
    
    return NextResponse.json({
      messages: result.messages,
      total: result.total,
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
