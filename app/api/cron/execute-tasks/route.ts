import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { task } from "@/db/schema";
import { db } from "@/lib/db";
import { executeTask } from "@/lib/runTask";

/**
 * API endpoint for Vercel Cron to execute scheduled tasks
 * This endpoint runs every minute to check and execute due tasks
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request (Vercel adds this header)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("🔄 Cron job: Checking for scheduled tasks...");

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentDate = now.getDate();

    // Load all active tasks
    const activeTasks = await db.select().from(task).where(eq(task.isActive, true));

    let executedCount = 0;

    for (const taskData of activeTasks) {
      const { id, name, frequency, time, day, date, timezone } = taskData;
      
      // Parse time (format: "HH:MM")
      const [taskHour, taskMinute] = time.split(":").map(Number);
      
      // Check if this task should run now
      let shouldExecute = false;

      switch (frequency) {
        case "Daily":
          shouldExecute = taskHour === currentHour && taskMinute === currentMinute;
          break;

        case "Weekly":
          if (day) {
            const dayMap: { [key: string]: number } = {
              Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
            };
            const targetDay = dayMap[day];
            shouldExecute = targetDay === currentDay && taskHour === currentHour && taskMinute === currentMinute;
          }
          break;

        case "Monthly":
          shouldExecute = currentDate === (date ? new Date(date).getDate() : 1) && 
                          taskHour === currentHour && 
                          taskMinute === currentMinute;
          break;

        case "Once":
          if (date) {
            const taskDate = new Date(date);
            shouldExecute = taskDate.getDate() === currentDate && 
                           taskDate.getMonth() === now.getMonth() && 
                           taskHour === currentHour && 
                           taskMinute === currentMinute;
          }
          break;

        case "Yearly":
          if (date) {
            const taskDate = new Date(date);
            shouldExecute = taskDate.getDate() === currentDate && 
                           taskDate.getMonth() === now.getMonth() && 
                           taskHour === currentHour && 
                           taskMinute === currentMinute;
          }
          break;
      }

      if (shouldExecute) {
        try {
          console.log(`⏰ Executing scheduled task: ${name} (${frequency})`);
          await executeTask(taskData);
          executedCount++;

          // For "Once" tasks, deactivate after execution
          if (frequency === "Once") {
            await db.update(task).set({ isActive: false }).where(eq(task.id, id));
            console.log(`Deactivated "Once" task after execution: ${name}`);
          }
        } catch (error) {
          console.error(`❌ Error executing task ${name}:`, error);
        }
      }
    }

    console.log(`✅ Cron job completed. Executed ${executedCount} tasks.`);
    
    return NextResponse.json({
      success: true,
      executedCount,
      timestamp: now.toISOString(),
    });

  } catch (error) {
    console.error("❌ Cron job error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
