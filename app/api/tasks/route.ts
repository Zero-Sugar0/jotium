//app/api/tasks/route.ts
import { eq } from "drizzle-orm";
import {NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { task, Task } from "@/db/schema";
import { db } from "@/lib/db";
import scheduler from "@/lib/taskScheduler";
import { generateUUID } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = session.user.id as string;
  const tasks = await db.select().from(task).where(eq(task.userId, userId));
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = session.user.id as string;
  const {
    name,
    description,
    frequency,
    time,
    day,
    date,
    isActive,
    timezone,
  }: {
    name: string;
    description: string;
    frequency: string;
    time: string;
    day?: string;
    date?: string;
    isActive?: boolean;
    timezone?: string;
  } = await request.json();

  const newTask: Omit<Task, "id" | "createdAt" | "updatedAt"> = {
    userId,
    name,
    description,
    frequency,
    time,
    day: day ?? null,
    date: date ? date : null,
    isActive: isActive ?? true,
    timezone: timezone ?? 'America/Los_Angeles',
    lastRunStatus: null,
    nextRunAt: null,
    lastRunAt: null,
  };

  const inserted = await db
    .insert(task)
    .values({
    ...newTask,
    id: generateUUID(),
    createdAt: new Date(),
    })
    .returning();

  // Schedule the task if active
  if (isActive !== false) {
    await scheduler.addOrUpdateTask(inserted[0]);
  }

  return NextResponse.json(inserted[0]);
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const {
    id,
    name,
    description,
    frequency,
    time,
    day,
    date,
    isActive,
    timezone,
  }: {
    id: string;
    name?: string;
    description?: string;
    frequency?: string;
    time?: string;
    day?: string;
    date?: string;
    isActive?: boolean;
    timezone?: string;
  } = await request.json();

  const updates: Partial<Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">> = {
    ...(name && { name }),
    ...(description && { description }),
    ...(frequency && { frequency }),
    ...(time && { time }),
    ...(day !== undefined && { day }),
    ...(date !== undefined && { date: date ?? null }),
    ...(isActive !== undefined && { isActive }),
    ...(timezone && { timezone }),
    
  };

  const updated = await db
    .update(task)
    .set(updates)
    .where(eq(task.id, id))
    .returning();

  // Update scheduler
  await scheduler.addOrUpdateTask(updated[0]);

  return NextResponse.json(updated[0]);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return new NextResponse("Missing task id", { status: 400 });
  }

  // Remove from scheduler
  await scheduler.removeTask(id);
  
  await db.delete(task).where(eq(task.id, id));
  return new NextResponse(null, { status: 204 });
}
