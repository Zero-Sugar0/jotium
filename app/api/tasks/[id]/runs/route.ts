import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUserById } from "@/db/queries";
import { getUserChats } from "@/lib/redis-queries";

/**
 * GET /api/tasks/:id/runs
 * Returns a list of synthetic chat IDs (and metadata) that were created by running the specified task.
 * Each chat ID follows the pattern `task-{taskId}-{timestamp}`.
 */
export async function GET(request: NextRequest) {
  // Authenticate user
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const userId = session.user.id as string;

  // Extract task ID from the URL
  const { pathname } = new URL(request.url);
  const idMatch = pathname.match(/\/api\/tasks\/([^/]+)\/runs/);
  const taskId = idMatch ? idMatch[1] : null;
  if (!taskId) {
    return new NextResponse("Task ID missing in URL", { status: 400 });
  }

  // Verify the task belongs to the user
  const user = await getUserById(userId);
  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  // Fetch all chats for the user and filter those that belong to this task
  const chats = await getUserChats(userId);
  const taskRuns = chats.filter((chat) => chat.id.startsWith(`task-${taskId}-`));

  return NextResponse.json(taskRuns);
}
