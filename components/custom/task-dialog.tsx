//components/custom/task-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { cn } from "@/lib/utils";

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
}

interface TaskCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask?: (taskData: TaskData) => void;
  editingTask?: Task | null;
}

interface TaskData {
  name: string;
  frequency: "Once" | "Daily" | "Weekly" | "Monthly" | "Yearly";
  time: string;
  date?: Date;
  day?: string;
  instructions: string;
}

export const TaskCreationDialog = ({
  open,
  onOpenChange,
  onCreateTask,
  editingTask,
}: TaskCreationDialogProps) => {
  const [taskName, setTaskName] = useState("");
  const [frequency, setFrequency] = useState<TaskData["frequency"]>("Once");
  const [time, setTime] = useState("14:10");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [day, setDay] = useState("Sunday");
  const [instructions, setInstructions] = useState("");

  const frequencies: TaskData["frequency"][] = ["Once", "Daily", "Weekly", "Monthly", "Yearly"];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Populate form when editing a task
  useEffect(() => {
    if (editingTask && open) {
      setTaskName(editingTask.name);
      setFrequency(editingTask.frequency as TaskData["frequency"]);
      setTime(editingTask.time);
      setInstructions(editingTask.description);
      
      if (editingTask.day) {
        setDay(editingTask.day);
      }
      
      if (editingTask.date) {
        setDate(new Date(editingTask.date));
      }
    } else if (!editingTask && open) {
      // Reset form for new task
      setTaskName("");
      setFrequency("Once");
      setTime("14:10");
      setDate(new Date());
      setDay("Sunday");
      setInstructions("");
    }
  }, [editingTask, open]);

  const handleCreateTask = () => {
    const taskData: TaskData = {
      name: taskName,
      frequency,
      time,
      date: frequency !== "Daily" && frequency !== "Weekly" ? date : undefined,
      day: frequency === "Weekly" ? day : undefined,
      instructions,
    };
    
    onCreateTask?.(taskData);
    
    // Reset form
    setTaskName("");
    setFrequency("Once");
    setTime("14:10");
    setDate(new Date());
    setDay("Sunday");
    setInstructions("");
    
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form
    setTaskName("");
    setFrequency("Once");
    setTime("14:10");
    setDate(new Date());
    setDay("Sunday");
    setInstructions("");
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] p-0 gap-0 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-3 sm:p-6 pb-2 sm:pb-4">
          <h2 className="text-sm sm:text-base font-medium mb-2">
            {editingTask ? "Edit Task" : "Name of task"}
          </h2>
          <Input
            placeholder="Enter task name..."
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="text-sm"
          />
        </div>

        <div className="px-3 sm:px-6 space-y-4 sm:space-y-6">
          {/* Frequency Section */}
          <div>
            <h3 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">Frequency</h3>
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              {frequencies.map((freq) => (
                <Button
                  key={freq}
                  variant={frequency === freq ? "default" : "outline"}
                  size="sm"
                  className="text-xs px-2 sm:px-3 py-1 sm:py-1.5 h-auto"
                  onClick={() => setFrequency(freq)}
                >
                  {freq}
                </Button>
              ))}
            </div>
          </div>

          {/* Time, Day, and Date Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm font-medium">On</span>
                <span className="text-xs sm:text-sm">Time</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-auto text-xs sm:text-sm font-mono px-2 sm:px-3"
                />
              </div>
            </div>

            {/* Day selector for Weekly */}
            {frequency === "Weekly" && (
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium">Day</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-xs sm:text-sm justify-start text-left font-normal px-2 sm:px-3"
                    >
                      <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      {day}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="end">
                    <div className="grid grid-cols-1 gap-1">
                      {days.map((dayOption) => (
                        <Button
                          key={dayOption}
                          variant={day === dayOption ? "default" : "ghost"}
                          size="sm"
                          className="text-xs justify-start"
                          onClick={() => setDay(dayOption)}
                        >
                          {dayOption}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Date Picker - Only show for Once, Monthly, Yearly */}
            {(frequency === "Once" || frequency === "Monthly" || frequency === "Yearly") && (
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium">Date</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "text-xs sm:text-sm justify-start text-left font-normal px-2 sm:px-3",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      {date ? format(date, "MMM d, yyyy") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Instructions Section */}
          <div>
            <h3 className="text-xs sm:text-sm font-medium mb-2">Instructions</h3>
            <Textarea
              placeholder="Enter prompt here."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="min-h-[80px] sm:min-h-[120px] resize-none text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-6 pt-4 border-t mt-4 sm:mt-6">
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs sm:text-sm px-4 sm:px-6"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs sm:text-sm px-4 sm:px-6"
              onClick={handleCreateTask}
              disabled={!taskName.trim()}
            >
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 