import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { task, Task } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserAIModel } from "@/lib/user-model";
import { getUserLanguage, getUserById } from "@/db/queries";
import { getUserDailyMessageCount, incrementUserDailyMessageCount } from "@/lib/redis-queries";
import { executeTask } from "@/lib/runTask";

const planLimits: { [key: string]: number } = {
  "Free": 5,
  "Pro": 50,
  "Advanced": Infinity,
};

export async function POST(request: NextRequest) {
  // Authenticate user
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const userId = session.user.id as string;

  // Rate limit check (same logic as chat endpoint)
  const { count, messageLimitResetAt } = await getUserDailyMessageCount(userId);
  const now = new Date();

  // Retrieve user plan to determine limit
  const user = await getUserById(userId);
  const plan = user?.plan || "Free";
  const limit = planLimits[plan] ?? planLimits["Free"];

  if (messageLimitResetAt && now < new Date(messageLimitResetAt) && count >= limit) {
    return new NextResponse("Message limit reached.", { status: 429 });
  }

  // Extract task ID from the URL
  const { pathname } = new URL(request.url);
  const idMatch = pathname.match(/\/api\/tasks\/([^/]+)\/run/);
  const taskId = idMatch ? idMatch[1] : null;
  if (!taskId) {
    return new NextResponse("Task ID missing in URL", { status: 400 });
  }

  // Fetch the task and ensure it belongs to the user
  const tasks = await db.select().from(task).where(eq(task.id, taskId));
  const targetTask = tasks[0] as Task | undefined;
  if (!targetTask || targetTask.userId !== userId) {
    return new NextResponse("Task not found or access denied", { status: 404 });
  }

  // Execute the task using shared logic
  const syntheticChatId = await executeTask(targetTask);

  // Increment daily message count for the user (task counts as a message)
  await incrementUserDailyMessageCount(userId);

  // Return a simple JSON response indicating success and the chat ID
  return NextResponse.json({
    success: true,
    chatId: syntheticChatId,
    message: "Task executed and result stored as a chat.",
  });
}
