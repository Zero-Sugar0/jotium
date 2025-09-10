//app/task/page.tsx
"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Plus, Pen, Play, Pause, Trash2, RotateCcw, ChevronLeft, ChevronRight, MessageCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { LoaderIcon } from "@/components/custom/icons";
import { Markdown } from "@/components/custom/markdown";
import { TaskCreationDialog } from "@/components/custom/task-dialog";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// Custom hook for media query
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);

  return matches;
};

// Task Detail Content Component (shared between Sheet and Drawer)
const TaskDetailContent = ({
  selectedTask,
  currentExecutionIndex,
  taskExecutions,
  onDeleteTask,
  onEditTask,
  onTestTask,
  onPreviousExecution,
  onNextExecution,
  onLatestExecution,
  onChatWithExecution,
  onToggleTask,
  onClose,
  isMobile = false,
}: {
  selectedTask: Task;
  currentExecutionIndex: number;
  taskExecutions: TaskExecution[];
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onTestTask: (task: Task) => void;
  onPreviousExecution: () => void;
  onNextExecution: () => void;
  onLatestExecution: () => void;
  onChatWithExecution: () => void;
  onToggleTask: (taskId: string) => void;
  onClose: () => void;
  isMobile?: boolean;
}) => {
  const formatFrequencyWithTime = (task: Task) => {
    const timeFormatted = task.time;
    
    switch (task.frequency) {
      case "Daily":
        return `Daily at ${timeFormatted}`;
      case "Weekly":
        return `${task.day}s at ${timeFormatted}`;
      case "Monthly":
        return `Monthly at ${timeFormatted}`;
      case "Once":
        return `Once at ${timeFormatted}`;
      case "Yearly":
        return `Yearly at ${timeFormatted}`;
      default:
        return timeFormatted;
    }
  };

  const getTaskExecutions = (taskId: string) => {
    return taskExecutions.filter(exec => exec.taskId === taskId);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header Section */}
      <div className="shrink-0 p-4 border-b border-border/50">
        {/* Task Status and Actions Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${
              selectedTask.isActive 
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' 
                : 'bg-muted text-muted-foreground'
            }`}>
              <div className={`size-1.5 rounded-full ${
                selectedTask.isActive ? 'bg-amber-500' : 'bg-muted-foreground'
              }`} />
              {selectedTask.isActive ? 'Active' : 'Paused'}
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEditTask(selectedTask)}
              className="h-6 px-2 text-xs"
            >
              <Pen className="size-3" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDeleteTask(selectedTask.id)}
              className="size-6 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="size-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </Button>
          </div>
        </div>

        {/* Task Title */}
        <h1 className="text-lg font-medium mb-2 leading-tight">
          {selectedTask.name}
        </h1>

        {/* Task Schedule Info */}
        <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
          <span>{formatFrequencyWithTime(selectedTask)}</span>
          <span>•</span>
          <span>Ran for 1m 29s</span>
        </div>

        {/* Task Description - Single line with ... */}
        <div className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-1">
          {selectedTask.description}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onToggleTask(selectedTask.id)}
              className={`h-7 px-3 text-xs ${
                selectedTask.isActive 
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300' 
                  : 'bg-green-500/20 hover:bg-green-500/30 text-green-700 dark:text-green-300'
              }`}
            >
              {selectedTask.isActive ? (
                <>
                  {isMobile ? <Pause className="size-3" /> : <><Pause className="size-3 mr-1" />Pause</>}
                </>
              ) : (
                <>
                  {isMobile ? <Play className="size-3" /> : <><Play className="size-3 mr-1" />Resume</>}
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onTestTask(selectedTask)}
              className="h-7 px-3 text-xs"
            >
              {isMobile ? <Play className="size-3" /> : <><Play className="size-3 mr-1" />Run</>}
            </Button>

            <Button
              size="sm"
              onClick={() => onTestTask(selectedTask)}
              className="h-7 px-3 text-xs"
            >
              {isMobile ? <Play className="size-3" /> : <><Play className="size-3 mr-1" />Test</>}
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onPreviousExecution}
              disabled={currentExecutionIndex >= getTaskExecutions(selectedTask.id).length - 1}
              className="size-7 p-0"
            >
              <ChevronLeft className="size-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onNextExecution}
              disabled={currentExecutionIndex <= 0}
              className="size-7 p-0"
            >
              <ChevronRight className="size-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onLatestExecution}
              className="h-7 px-3 text-xs"
            >
              Latest
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onChatWithExecution}
              className="h-7 px-3 text-xs flex items-center gap-1"
            >
              <MessageCircle className="size-3" />
              Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area - Smooth Scrolling */}
      <div className="flex-1 overflow-y-auto">
        {getTaskExecutions(selectedTask.id).length === 0 ? (
          <div className="p-6 text-center">
            <h3 className="text-base font-medium mb-2">No execution records yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This task has not been executed yet. Click Test to run it manually.
            </p>
          </div>
        ) : (
          <div className="p-4">
            {/* Execution Header */}
            <div className="mb-6">
              <h2 className="text-base font-medium mb-1">
                {getTaskExecutions(selectedTask.id)[currentExecutionIndex]?.title || "Task Execution Result"}
              </h2>
              <div className="text-xs text-muted-foreground">
                {getTaskExecutions(selectedTask.id)[currentExecutionIndex]?.date} • {getTaskExecutions(selectedTask.id)[currentExecutionIndex]?.runTime}
              </div>
            </div>

            {/* Task Output/Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown showTypewriter={false}>
                {getTaskExecutions(selectedTask.id)[currentExecutionIndex]?.content}
              </Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface Task {
  id: string;
  name: string;
  description: string;
  frequency: "Daily" | "Weekly" | "Monthly" | "Once" | "Yearly";
  time: string;
  day?: string;
  date?: string;
  isActive: boolean;
  isPredefined?: boolean;
  lastExecuted?: string;
  nextExecution?: string;
}

interface TaskData {
  name: string;
  frequency: "Once" | "Daily" | "Weekly" | "Monthly" | "Yearly";
  time: string;
  date?: Date;
  day?: string;
  instructions: string;
}

interface TaskExecution {
  id: string;
  taskId: string;
  title: string;
  content: string;
  timestamp: string;
  date: string;
  runTime: string;
  status: "success" | "error";
}

export default function TasksPage() {
  // Pre-defined tasks and user tasks
  // Pre-defined tasks and user tasks
  const [tasks, setTasks] = useState<Task[]>([]);

  // Task executions/history
  const [taskExecutions, setTaskExecutions] = useState<TaskExecution[]>([]);

  const [currentExecutionIndex, setCurrentExecutionIndex] = useState(0);
  const [isTesting, setIsTesting] = useState(false);

  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const formatTaskSchedule = (task: Task) => {
    const timeFormatted = task.time;
    
    switch (task.frequency) {
      case "Daily":
        return `Daily at ${timeFormatted}`;
      case "Weekly":
        return `${task.day}s at ${timeFormatted}`;
      case "Monthly":
        return `Monthly at ${timeFormatted}`;
      case "Once":
        return `Once at ${timeFormatted}`;
      case "Yearly":
        return `Yearly at ${timeFormatted}`;
      default:
        return timeFormatted;
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, isActive: !task.isActive }
          : task
      )
    );
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toast.success(`Task ${task.isActive ? 'paused' : 'activated'} successfully!`);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskDialog(true);
  };

  const handleAddNewTask = () => {
    setEditingTask(null);
    setShowTaskDialog(true);
  };

  const handleCreateTask = async (taskData: TaskData) => {
    const payload = {
      name: taskData.name,
      description: taskData.instructions,
      frequency: taskData.frequency,
      time: taskData.time,
      day: taskData.day,
      date: taskData.date ? taskData.date.toISOString() : undefined,
      isActive: true,
    };

    try {
      if (editingTask) {
        await fetch("/api/tasks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingTask.id, ...payload }),
        });
        toast.success("Task updated successfully!");
      } else {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Task created successfully!");
      }
      await fetchTasks();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save task.");
    }

    setEditingTask(null);
  };

  const handleTaskClick = async (task: Task) => {
    setSelectedTask(task);
    setIsTaskSheetOpen(true);
    await fetchRuns(task.id);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks?id=${taskId}`, { method: "DELETE" });
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success("Task deleted successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete task.");
    }
    setIsTaskSheetOpen(false);
    setSelectedTask(null);
  };

  const handleTestTask = async (task: Task) => {
    setIsTesting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/run`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Task "${task.name}" executed.`);
        await fetchRuns(task.id);
        if (selectedTask?.id === task.id) {
          setCurrentExecutionIndex(0);
        }
      } else {
        toast.error(`Task execution failed: ${data.message || "unknown error"}`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to execute task.");
    } finally {
      setIsTesting(false);
    }
  };

  const getTaskExecutions = (taskId: string) => {
    return taskExecutions.filter(exec => exec.taskId === taskId);
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load tasks.");
    }
  };

  const fetchRuns = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/runs`);
      const data = await res.json();
      
      const runs: TaskExecution[] = await Promise.all(
        data.map(async (chat: any) => {
          const messagesRes = await fetch(`/api/history/${chat.id}/messages`);
          const messagesData = await messagesRes.json();
          
          const assistantMessage = messagesData.messages?.find(
            (msg: any) => msg.role === 'assistant'
          );
          
          return {
            id: chat.id,
            taskId,
            title: chat.title || "Task Run",
            content: assistantMessage?.content || "No content available",
            timestamp: chat.createdAt,
            date: new Date(chat.createdAt).toDateString(),
            runTime: "",
            status: "success",
          };
        })
      );
      
      setTaskExecutions(prev => {
        const filtered = prev.filter(exec => exec.taskId !== taskId);
        return [...runs, ...filtered];
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to load task runs.");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handlePreviousExecution = () => {
    const executions = getTaskExecutions(selectedTask!.id);
    if (currentExecutionIndex < executions.length - 1) {
      setCurrentExecutionIndex(currentExecutionIndex + 1);
    }
  };

  const handleNextExecution = () => {
    if (currentExecutionIndex > 0) {
      setCurrentExecutionIndex(currentExecutionIndex - 1);
    }
  };

  const handleLatestExecution = () => {
    setCurrentExecutionIndex(0);
  };

  const handleChatWithExecution = () => {
    toast.info("Chat functionality will be available soon!");
  };

  const handleCloseSheet = () => {
    setIsTaskSheetOpen(false);
    setSelectedTask(null);
  };

  return (
    <>
      <style jsx global>{`
        /* Custom scrollbar styles for the entire app */
        ::-webkit-scrollbar {
          width: 3px;
          height: 3px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground));
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground));
        }
        
        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--muted-foreground)) transparent;
        }
        
        /* Specific styles for task page scrollbars */
        .task-scrollbar::-webkit-scrollbar {
          width: 2px;
          height: 2px;
        }
        
        .task-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground));
          border-radius: 2px;
        }
      `}</style>

      {/* Main Layout Container */}
      <div className="flex h-screen">
        {/* Tasks Content - Left side when sheet is open */}
        <div className={`flex-1 transition-all duration-300 ${
          isTaskSheetOpen && isDesktop ? 'w-1/2' : 'w-full'
        }`}>
          <div className="p-4 sm:p-6 pt-16 sm:pt-20 h-full overflow-y-auto task-scrollbar">
            <div className={`mx-auto ${isDesktop ? 'max-w-4xl px-8' : 'max-w-7xl'}`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h1 className="text-sm sm:text-base md:text-lg font-semibold">Tasks</h1>
                <Button
                  onClick={handleAddNewTask}
                  className="flex items-center gap-1 text-[0.7rem] sm:text-xs h-6 sm:h-7 px-2 sm:px-2.5"
                >
                  <Plus className="size-2.5 sm:size-3" />
                  Add new
                </Button>
              </div>

              {/* Active Tasks Section */}
              <div className="mb-5">
                <div className="space-y-1.5">
                {tasks.filter(task => task.isActive).map((task) => (
                    <div
                      key={task.id}
                      className="relative group bg-card border rounded-md p-2.5 hover:bg-accent/50 transition-colors cursor-pointer"
                      onMouseEnter={() => setHoveredTask(task.id)}
                      onMouseLeave={() => setHoveredTask(null)}
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm">
                          {task.name}
                        </h3>
                        {task.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Hover Controls */}
                      <div
                        className={`absolute top-1.5 right-1.5 flex items-center gap-0.5 transition-opacity duration-200 ${
                          hoveredTask === task.id ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <Button
                          size="icon"
                          variant="secondary"
                          className="size-5 p-0 bg-background/80 backdrop-blur-sm hover:bg-background"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTask(task);
                          }}
                        >
                          <Pen className="size-2" />
                        </Button>

                        <Button
                          size="icon"
                          variant="secondary"
                          className={`size-5 p-0 backdrop-blur-sm hover:bg-background ${
                            task.isActive 
                              ? 'bg-amber-500/20 hover:bg-amber-500/30' 
                              : 'bg-green-500/20 hover:bg-green-500/30'
                        }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTask(task.id);
                          }}
                        >
                          {task.isActive ? (
                            <Pause className="size-2" />
                          ) : (
                            <Play className="size-2" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Tasks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="relative group bg-card border rounded-md p-2.5 sm:p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredTask(task.id)}
                    onMouseLeave={() => setHoveredTask(null)}
                    onClick={() => handleTaskClick(task)}
                  >
                    {/* Task Content - Minimal Display */}
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm leading-tight">
                        {task.name}
                      </h3>
                      
                      {task.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Hover Controls - Desktop */}
                    <div
                      className={`hidden md:flex absolute top-1.5 right-1.5 items-center gap-0.5 transition-opacity duration-200 ${
                        hoveredTask === task.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                        <Button
                          size="icon"
                          variant="secondary"
                        className="size-5 p-0 bg-background/80 backdrop-blur-sm hover:bg-background"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTask(task);
                          }}
                        >
                          <Pen className="size-2" />
                        </Button>

                      <Button
                        size="icon"
                        variant="secondary"
                        className={`size-5 p-0 backdrop-blur-sm hover:bg-background ${
                          task.isActive 
                            ? 'bg-amber-500/20 hover:bg-amber-500/30' 
                            : 'bg-green-500/20 hover:bg-green-500/30'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTask(task.id);
                        }}
                      >
                        {task.isActive ? (
                          <Pause className="size-2" />
                        ) : (
                          <Play className="size-2" />
                        )}
                      </Button>
                    </div>

                    {/* Mobile Touch Controls - Always visible on mobile */}
                    <div className="md:hidden absolute top-1.5 right-1.5 flex items-center gap-0.5">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="size-4 p-0 bg-background/80 backdrop-blur-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTask(task);
                        }}
                      >
                        <Pen className="size-1.5" />
                      </Button>

                      <Button
                        size="icon"
                        variant="secondary"
                        className={`size-4 p-0 backdrop-blur-sm ${
                          task.isActive 
                            ? 'bg-amber-500/20' 
                            : 'bg-green-500/20'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTask(task.id);
                        }}
                      >
                        {task.isActive ? (
                          <Pause className="size-1.5" />
                        ) : (
                          <Play className="size-1.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State - Compact */}
              {tasks.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-[0.7rem] sm:text-xs text-muted-foreground mb-1.5">No tasks created yet</p>
                  <Button onClick={handleAddNewTask} variant="outline" className="h-5 sm:h-6 px-2 text-[0.65rem] sm:text-[0.75rem]">
                    <Plus className="size-2 sm:size-2.5 mr-0.5" />
                    Create task
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task Detail Panel - Right side (Desktop only) */}
        {isTaskSheetOpen && isDesktop && selectedTask && (
          <div className="w-1/2 border-l bg-background">
            <TaskDetailContent
              selectedTask={selectedTask}
              currentExecutionIndex={currentExecutionIndex}
              taskExecutions={taskExecutions}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
              onTestTask={handleTestTask}
              onPreviousExecution={handlePreviousExecution}
              onNextExecution={handleNextExecution}
              onLatestExecution={handleLatestExecution}
              onChatWithExecution={handleChatWithExecution}
              onToggleTask={handleToggleTask}
              onClose={handleCloseSheet}
            />
          </div>
        )}
      </div>

      {/* Task Creation/Edit Dialog */}
      <TaskCreationDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        onCreateTask={handleCreateTask}
        editingTask={editingTask}
      />

      {/* Task Detail Sheet (Desktop hidden) / Drawer (Mobile) */}
      {isDesktop ? (
        null
      ) : (
        <Drawer open={isTaskSheetOpen} onOpenChange={setIsTaskSheetOpen}>
          <DrawerContent className="h-[90vh]">
            <VisuallyHidden.Root>
              <DrawerTitle>Task Details</DrawerTitle>
              <DrawerDescription>
                View and manage task details
              </DrawerDescription>
            </VisuallyHidden.Root>
            
            {selectedTask && (
              <TaskDetailContent
                selectedTask={selectedTask}
                currentExecutionIndex={currentExecutionIndex}
                taskExecutions={taskExecutions}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
                onTestTask={handleTestTask}
                onPreviousExecution={handlePreviousExecution}
                onNextExecution={handleNextExecution}
                onLatestExecution={handleLatestExecution}
                onChatWithExecution={handleChatWithExecution}
                onToggleTask={handleToggleTask}
                onClose={handleCloseSheet}
                isMobile={true}
              />
            )}
          </DrawerContent>
        </Drawer>
      )}
    </>
    );
  }
