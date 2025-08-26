import { db } from "@/lib/db";
import { task } from "@/db/schema";
import { eq } from "drizzle-orm";
import { executeTask } from "./runTask";
import * as cron from "node-cron";

/**
 * Task Scheduler Service
 * 
 * This service runs in the background and automatically executes user-defined tasks
 * at their scheduled times (daily, weekly, monthly, etc.)
 */
export class TaskScheduler {
  private static instance: TaskScheduler;
  private scheduledTasks: Map<string, cron.ScheduledTask> = new Map();
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): TaskScheduler {
    if (!TaskScheduler.instance) {
      TaskScheduler.instance = new TaskScheduler();
    }
    return TaskScheduler.instance;
  }

  /**
   * Initialize the scheduler - load all active tasks and schedule them
   */
  public async initialize() {
    if (this.isInitialized) return;
    
    console.log("🔄 Initializing task scheduler...");
    
    // Load all active tasks from database
    const activeTasks = await db.select().from(task).where(eq(task.isActive, true));
    
    // Schedule each task
    for (const taskData of activeTasks) {
      await this.scheduleTask(taskData);
    }
    
    this.isInitialized = true;
    console.log(`✅ Task scheduler initialized with ${activeTasks.length} active tasks`);
  }

  /**
   * Schedule a single task based on its frequency and time
   */
  private async scheduleTask(taskData: any) {
    const { id, frequency, time, day, date, timezone } = taskData;

    if (this.scheduledTasks.has(id)) {
      this.scheduledTasks.get(id)?.stop();
      this.scheduledTasks.delete(id);
    }

    let cronExpression: string;

    const [hours, minutes] = time.split(":").map(Number);

    switch (frequency) {
      case "Daily":
        cronExpression = `${minutes} ${hours} * * *`;
        break;

      case "Weekly":
        if (!day) return;
        const dayMap: { [key: string]: number } = {
          Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
        };
        const dayNumber = dayMap[day];
        if (dayNumber === undefined) return;
        cronExpression = `${minutes} ${hours} * * ${dayNumber}`;
        break;

      case "Monthly":
        const monthlyDay = date ? new Date(date).getUTCDate() : 1;
        cronExpression = `${minutes} ${hours} ${monthlyDay} * *`;
        break;

      case "Once":
        if (!date) return;
        const taskDate = new Date(date);
        
        if (taskDate <= new Date()) {
          console.log(`Skipping past "Once" task: ${taskData.name}`);
          if (taskData.isActive) {
            await db.update(task).set({ isActive: false }).where(eq(task.id, id));
          }
          return;
        }

        const taskDayOfMonth = taskDate.getUTCDate();
        const taskMonth = taskDate.getUTCMonth() + 1;
        cronExpression = `${minutes} ${hours} ${taskDayOfMonth} ${taskMonth} *`;
        break;

      case "Yearly":
        if (!date) return;
        const yearlyDate = new Date(date);
        const yearlyDayOfMonth = yearlyDate.getUTCDate();
        const yearlyMonth = yearlyDate.getUTCMonth() + 1;
        cronExpression = `${minutes} ${hours} ${yearlyDayOfMonth} ${yearlyMonth} *`;
        break;

      default:
        console.warn(`Unknown frequency: ${frequency}`);
        return;
    }

    const scheduledTask = cron.schedule(
      cronExpression,
      async () => {
        console.log(`⏰ Executing scheduled task: ${taskData.name} (${frequency} at ${time})`);
        await this.executeTask(taskData);

        if (frequency === "Once") {
          console.log(`Deactivating "Once" task after execution: ${taskData.name}`);
          await this.removeTask(id);
          await db.update(task).set({ isActive: false }).where(eq(task.id, id));
        }
      },
      {
        timezone: timezone || "America/Los_Angeles",
      }
    );

    this.scheduledTasks.set(id, scheduledTask);
    console.log(`📅 Scheduled task: ${taskData.name} (${frequency} at ${time} in ${timezone})`);
  }

  /**
   * Execute a task and handle any errors
   */
  private async executeTask(taskData: any) {
    try {
      console.log(`🚀 Executing task: ${taskData.name}`);
      const chatId = await executeTask(taskData);
      console.log(`✅ Task completed: ${taskData.name} -> Chat ID: ${chatId}`);
    } catch (error) {
      console.error(`❌ Error executing task ${taskData.name}:`, error);
    }
  }

  /**
   * Add or update a task in the scheduler
   */
  public async addOrUpdateTask(taskData: any) {
    // Remove existing schedule if any
    await this.removeTask(taskData.id);
    
    // Schedule if active
    if (taskData.isActive) {
      await this.scheduleTask(taskData);
    }
  }

  /**
   * Remove a task from the scheduler
   */
  public async removeTask(taskId: string) {
    const scheduledTask = this.scheduledTasks.get(taskId);
    if (scheduledTask) {
      scheduledTask.stop();
      this.scheduledTasks.delete(taskId);
      console.log(`🗑️ Removed scheduled task: ${taskId}`);
    }
  }

  /**
   * Reload all tasks (useful for updates)
   */
  public async reloadTasks() {
    console.log("🔄 Reloading all tasks...");
    
    // Stop all current schedules
    for (const [id, task] of this.scheduledTasks) {
      task.stop();
    }
    this.scheduledTasks.clear();
    
    // Re-initialize
    await this.initialize();
  }

  /**
   * Get status of the scheduler
   */
  public getStatus() {
    return {
      isInitialized: this.isInitialized,
      scheduledTaskCount: this.scheduledTasks.size,
      tasks: Array.from(this.scheduledTasks.keys())
    };
  }
}

// Initialize the scheduler when the module is imported
const scheduler = TaskScheduler.getInstance();
scheduler.initialize().catch(console.error);

// Export for use in other modules
export default scheduler;
