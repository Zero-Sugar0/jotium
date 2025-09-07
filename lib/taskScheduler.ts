import { eq } from "drizzle-orm";

import { task, Task } from "@/db/schema";
import { db } from "@/lib/db";

import { executeTask } from "./runTask";

/**
 * Task Scheduler Service
 *
 * This service runs an internal scheduler to execute tasks at their scheduled times.
 * It is designed to be independent of external cron services.
 */
export class TaskScheduler {
  private static instance: TaskScheduler;
  private isInitialized = false;
  private timer: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): TaskScheduler {
    if (!TaskScheduler.instance) {
      TaskScheduler.instance = new TaskScheduler();
    }
    return TaskScheduler.instance;
  }

  /**
   * Initialize the scheduler.
   * Loads all active tasks and starts the scheduling loop.
   */
  public async initialize() {
    if (this.isInitialized) return;

    console.log("🔄 Initializing internal task scheduler...");
    this.isInitialized = true;
    this.start();
  }

  /**
   * Starts the scheduler loop.
   * The loop runs every minute to check for tasks that are due.
   */
  public start() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const loop = async () => {
      await this.checkAndExecuteTasks();
      // Set timer to run again at the start of the next minute
      const now = new Date();
      const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
      this.timer = setTimeout(loop, delay);
    };

    loop();
    console.log("✅ Internal task scheduler started.");
  }

  /**
   * Stops the scheduler loop.
   */
  public stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    console.log("🛑 Internal task scheduler stopped.");
  }

  /**
   * Checks for due tasks and executes them.
   * This method is called every minute by the scheduler loop.
   */
  private async checkAndExecuteTasks() {
    console.log("🔄 Checking for scheduled tasks...");

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentDate = now.getDate();

    // Load all active tasks
    const activeTasks = await db
      .select()
      .from(task)
      .where(eq(task.isActive, true));

    let executedCount = 0;

    for (const taskData of activeTasks) {
      const { id, name, frequency, time, day, date } = taskData;

      // Parse time (format: "HH:MM")
      const [taskHour, taskMinute] = time.split(":").map(Number);

      // Check if this task should run now
      let shouldExecute = false;

      switch (frequency) {
        case "Daily":
          shouldExecute =
            taskHour === currentHour && taskMinute === currentMinute;
          break;

        case "Weekly":
          if (day) {
            const dayMap: { [key: string]: number } = {
              Sunday: 0,
              Monday: 1,
              Tuesday: 2,
              Wednesday: 3,
              Thursday: 4,
              Friday: 5,
              Saturday: 6,
            };
            const targetDay = dayMap[day];
            shouldExecute =
              targetDay === currentDay &&
              taskHour === currentHour &&
              taskMinute === currentMinute;
          }
          break;

        case "Monthly":
          shouldExecute =
            currentDate === (date ? new Date(date).getDate() : 1) &&
            taskHour === currentHour &&
            taskMinute === currentMinute;
          break;

        case "Once":
          if (date) {
            const taskDate = new Date(date);
            shouldExecute =
              taskDate.getDate() === currentDate &&
              taskDate.getMonth() === now.getMonth() &&
              taskHour === currentHour &&
              taskMinute === currentMinute;
          }
          break;

        case "Yearly":
          if (date) {
            const taskDate = new Date(date);
            shouldExecute =
              taskDate.getDate() === currentDate &&
              taskDate.getMonth() === now.getMonth() &&
              taskHour === currentHour &&
              taskMinute === currentMinute;
          }
          break;
      }

      if (shouldExecute) {
        try {
          console.log(`⏰ Executing scheduled task: ${name} (${frequency})`);
          await this.executeTask(taskData);
          executedCount++;

          // For "Once" tasks, deactivate after execution
          if (frequency === "Once") {
            await db
              .update(task)
              .set({ isActive: false })
              .where(eq(task.id, id));
            console.log(`Deactivated "Once" task after execution: ${name}`);
          }
        } catch (error) {
          console.error(`❌ Error executing task ${name}:`, error);
        }
      }
    }

    console.log(`✅ Task check completed. Executed ${executedCount} tasks.`);
  }

  /**
   * Execute a task and handle any errors.
   */
  private async executeTask(taskData: Task) {
    try {
      console.log(`🚀 Executing task: ${taskData.name}`);
      const chatId = await executeTask(taskData);
      console.log(`✅ Task completed: ${taskData.name} -> Chat ID: ${chatId}`);
    } catch (error) {
      console.error(`❌ Error executing task ${taskData.name}:`, error);
    }
  }

  /**
   * Add or update a task. In this new model, we don't need to do anything
   * here because the main loop will pick up changes from the database.
   * This method is kept for API compatibility.
   */
  public async addOrUpdateTask(taskData: Task) {
    console.log(
      `📝 Task ${taskData.name} was added or updated. The scheduler will pick it up on the next cycle.`
    );
    // No direct scheduling action needed, the loop will handle it.
  }

  /**
   * Remove a task. Similar to add/update, we don't need to do anything
   * here as the task will simply not be loaded in the next cycle.
   * This method is kept for API compatibility.
   */
  public async removeTask(taskId: string) {
    console.log(
      `🗑️ Task ${taskId} was removed. It will not be executed in the next cycle.`
    );
    // No direct unscheduling action needed.
  }

  /**
   * Reload all tasks by restarting the scheduler.
   */
  public async reloadTasks() {
    console.log("🔄 Reloading all tasks...");
    this.stop();
    this.start();
  }

  /**
   * Get status of the scheduler.
   */
  public getStatus() {
    return {
      isInitialized: this.isInitialized,
      isRunning: this.timer !== null,
      note: "Using internal timer-based scheduler.",
    };
  }
}

// Initialize the scheduler when the module is imported
const scheduler = TaskScheduler.getInstance();
scheduler.initialize().catch(console.error);

// Export for use in other modules
export default scheduler;
