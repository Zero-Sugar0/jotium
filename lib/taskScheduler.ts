import { eq } from "drizzle-orm";
import * as cron from "node-cron";

import { task } from "@/db/schema";
import { db } from "@/lib/db";

import { executeTask } from "./runTask";

/**
 * Task Scheduler Service
 * 
 * This service now serves as a compatibility layer for local development.
 * In production, Vercel Cron handles task scheduling via /api/cron/execute-tasks
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
   * Initialize the scheduler - only for local development
   * In production, Vercel Cron handles scheduling
   */
  public async initialize() {
    if (this.isInitialized) return;
    
    // Skip initialization in production (Vercel environment)
    if (process.env.VERCEL === "1") {
      console.log("🔄 Production environment detected - using Vercel Cron");
      this.isInitialized = true;
      return;
    }
    
    console.log("🔄 Initializing task scheduler for local development...");
    
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
   * Only runs in local development
   */
  private async scheduleTask(taskData: any) {
    // Skip scheduling in production
    if (process.env.VERCEL === "1") {
      return;
    }

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
   * In production, this only updates the database - Vercel Cron handles execution
   */
  public async addOrUpdateTask(taskData: any) {
    // Remove existing schedule if any
    await this.removeTask(taskData.id);
    
    // In production, we only need to ensure the task is in the database
    // Vercel Cron will handle the scheduling
    if (process.env.VERCEL === "1") {
      console.log(`📝 Task ${taskData.name} updated in database - Vercel Cron will handle scheduling`);
      return;
    }
    
    // Schedule if active (local development only)
    if (taskData.isActive) {
      await this.scheduleTask(taskData);
    }
  }

  /**
   * Remove a task from the scheduler
   */
  public async removeTask(taskId: string) {
    // Skip in production
    if (process.env.VERCEL === "1") {
      return;
    }

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
    // Skip in production
    if (process.env.VERCEL === "1") {
      console.log("🔄 Skipping reload in production - Vercel Cron handles this");
      return;
    }

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
    if (process.env.VERCEL === "1") {
      return {
        isInitialized: true,
        scheduledTaskCount: 0,
        tasks: [],
        note: "Using Vercel Cron for task scheduling"
      };
    }

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
