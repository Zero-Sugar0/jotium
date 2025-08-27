ALTER TABLE "Task" ADD COLUMN "timezone" varchar(50) DEFAULT 'America/Los_Angeles' NOT NULL;--> statement-breakpoint
ALTER TABLE "Task" ADD COLUMN "lastRunStatus" varchar(20);--> statement-breakpoint
ALTER TABLE "Task" ADD COLUMN "nextRunAt" timestamp;--> statement-breakpoint
ALTER TABLE "Task" ADD COLUMN "lastRunAt" timestamp;