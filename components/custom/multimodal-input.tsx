//components/custom/multimodal-input.tsx
"use client";

import { Attachment, ChatRequestOptions, CreateMessage, Message } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { AudioLines, Mic, Square, X } from "lucide-react";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  ChangeEvent,
} from "react";
import { toast } from "sonner";

import { RecordingWaves, useAudio, AudioButtons } from "./audio";
import { ArrowUpIcon, PaperclipIcon, StopIcon } from "./icons";
import { MessageLimitBanner } from "./message-limit-banner";
import { PreviewAttachment } from "./preview-attachment";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const suggestedActions = [
  {
    title: "Research & Analyze",
    label: "Deep dive into any topic with data and insights",
    action: "Research the latest developments in quantum computing and AI. Find 3-5 recent breakthrough papers, summarize the key findings, create visualizations showing the progress timeline, and identify potential real-world applications in the next 2-5 years.",
    icon: "🔬",
  },
  {
    title: "Plan & Organize",
    label: "Create projects, schedule tasks, manage workflow",
    action: "Create a comprehensive project plan for developing a mobile app. Set up the project structure in Linear with phases: Research, Design, Development, Testing, Launch. Schedule weekly check-ins, create milestone deadlines, and send progress updates to stakeholders.",
    icon: "📋",
  },
  {
    title: "Create & Design",
    label: "Generate content, designs, and creative assets",
    action: "Design a modern landing page for a sustainable fashion brand. Create wireframes, generate compelling copy, suggest color schemes and typography, and provide 3 different layout concepts with explanations of the design choices.",
    icon: "🎨",
  },
  {
    title: "Code & Build",
    label: "Develop features, fix bugs, optimize performance",
    action: "Build a real-time collaborative text editor with syntax highlighting for multiple programming languages. Include features like live cursors, version history, and export functionality. Use modern web technologies and ensure responsive design.",
    icon: "⚡",
  },
  {
    title: "Travel & Explore",
    label: "Plan trips, find deals, create itineraries",
    action: "Plan a 7-day eco-friendly trip to Costa Rica. Find sustainable accommodations, arrange transportation, create a day-by-day itinerary focusing on wildlife watching and nature experiences, and calculate the carbon footprint with offset options.",
    icon: "🌿",
  },
  {
    title: "Learn & Grow",
    label: "Discover courses, track progress, build skills",
    action: "Create a personalized learning path for mastering data science. Find the best online courses, set up a 6-month study schedule with weekly goals, suggest practical projects, and track progress with regular assessments.",
    icon: "📚",
  },
  {
    title: "Health & Wellness",
    label: "Fitness plans, nutrition tracking, mindfulness",
    action: "Design a holistic wellness program including: personalized workout routines based on fitness level, meal planning with recipes and nutritional breakdown, meditation and mindfulness exercises, and progress tracking with weekly check-ins.",
    icon: "💪",
  },
  {
    title: "Business & Strategy",
    label: "Market analysis, competitive research, growth planning",
    action: "Conduct a comprehensive market analysis for launching a plant-based food delivery service. Research competitors, identify target demographics, analyze pricing strategies, create financial projections, and develop a go-to-market strategy.",
    icon: "📊",
  },
];

export function MultimodalInput({
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  append,
  handleSubmit,
  messageCount,
  messageLimit,
  messageLimitResetAt,
}: {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  messageCount: number;
  messageLimit: number;
  messageLimitResetAt: Date | null;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Use the audio hook
  const {
    isRecording,
    isTranscribing,
    audioBlob,
    startRecording,
    stopRecording,
    cancelRecording,
    transcribeAudio
  } = useAudio(setInput, textareaRef);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [input]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    if (!input.trim() && attachments.length === 0 && !audioBlob) return;
    
    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    if (typeof window !== "undefined" && window.innerWidth > 768) {
      textareaRef.current?.focus();
    }
  }, [attachments, handleSubmit, input, audioBlob]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/files/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      } else {
        const { error } = await response.json();
        toast.error(error);
      }
    } catch (error) {
      toast.error("Failed to upload file, please try again!");
    }
  };

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error("Error uploading files!", error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  const handleRemoveAttachment = useCallback(
    (attachmentToRemove: Attachment) => {
      setAttachments((currentAttachments) =>
        currentAttachments.filter(
          (attachment) => attachment.url !== attachmentToRemove.url,
        ),
      );
    },
    [setAttachments],
  );

  // Handle paste events for clipboard images
  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }

      if (files.length > 0) {
        event.preventDefault();
        setUploadQueue(files.map((file) => file.name));

        try {
          const uploadPromises = files.map((file) => uploadFile(file));
          const uploadedAttachments = await Promise.all(uploadPromises);
          const successfullyUploadedAttachments = uploadedAttachments.filter(
            (attachment) => attachment !== undefined,
          );

          setAttachments((currentAttachments) => [
            ...currentAttachments,
            ...successfullyUploadedAttachments,
          ]);
        } catch (error) {
          console.error("Error uploading pasted files!", error);
        } finally {
          setUploadQueue([]);
        }
      }
    },
    [setAttachments],
  );

  // Handle drag and drop events
  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragCounter(prev => prev + 1);
    
    if (event.dataTransfer?.items && event.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragCounter(prev => prev - 1);
    
    if (dragCounter === 1) {
      setIsDragging(false);
      setDragCounter(0);
    }
  }, [dragCounter]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    const files = Array.from(event.dataTransfer?.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || 
      file.type === 'application/pdf' ||
      file.type.startsWith('audio/')
    );

    if (validFiles.length > 0) {
      setUploadQueue(validFiles.map((file) => file.name));

      try {
        const uploadPromises = validFiles.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error("Error uploading dropped files!", error);
      } finally {
        setUploadQueue([]);
      }
    }
  }, [setAttachments]);

  // Set up event listeners for paste and drag/drop
  useEffect(() => {
    const handleGlobalPaste = (event: ClipboardEvent) => {
      // Only handle paste if the textarea is focused
      if (document.activeElement === textareaRef.current) {
        handlePaste(event);
      }
    };

    const handleGlobalDrop = (event: DragEvent) => {
      // Only handle drop if it's over our component
      const target = event.target as Element;
      if (target.closest('.multimodal-input-container')) {
        handleDrop(event as any);
      }
    };

    const handleGlobalDragOver = (event: DragEvent) => {
      const target = event.target as Element;
      if (target.closest('.multimodal-input-container')) {
        handleDragOver(event as any);
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    document.addEventListener('drop', handleGlobalDrop);
    document.addEventListener('dragover', handleGlobalDragOver);

    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
      document.removeEventListener('drop', handleGlobalDrop);
      document.removeEventListener('dragover', handleGlobalDragOver);
    };
  }, [handlePaste, handleDrop, handleDragOver]);

  const hasContent = input.trim().length > 0 || attachments.length > 0 || !!audioBlob;

  const handleAudioClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-transparent z-30 mt-0 pb-4">
      <div className="w-full flex justify-center px-4 sm:px-0">
        <div className="relative w-full md:max-w-xl lg:max-w-xl xl:max-w-2xl flex flex-col gap-1 sm:gap-1 multimodal-input-container">
          {/* Suggested Actions - Responsive grid */}
          <AnimatePresence>
            {messages.length === 0 &&
              attachments.length === 0 &&
              uploadQueue.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 w-full"
                >
                  {suggestedActions.map((suggestedAction, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      key={index}
                      className="block"
                    >
                      <button
                        onClick={() => {
                          setInput(suggestedAction.action);
                          textareaRef.current?.focus();
                        }}
                  className="group w-full text-left bg-background/70 backdrop-blur-sm border border-border/40 hover:border-border/70 transition-all duration-300 ease-out rounded-xl sm:rounded-2xl p-2 sm:p-3 hover:bg-background/80 hover:shadow-md hover:-translate-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] group-hover:scale-110 transition-transform duration-200 shrink-0">
                            {suggestedAction.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-foreground block text-[10px] leading-tight truncate">
                              {suggestedAction.title}
                            </span>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
          </AnimatePresence>

          <input
            type="file"
            className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
            ref={fileInputRef}
            multiple
            onChange={handleFileChange}
            tabIndex={-1}
          />

          {/* Input Container - Responsive sizing with mobile padding */}
          <div 
            className={`
              relative bg-background/90 backdrop-blur-md border border-border/30 rounded-2xl sm:rounded-3xl
              transition-all duration-300 ease-out shadow-sm hover:shadow-md
              ${isFocused ? "border-primary/40 shadow-lg ring-2 sm:ring-4 ring-primary/20 scale-[1.01]" : "hover:border-border/60"}
              ${input.trim().length > 0 ? "border-primary/25 shadow-md" : ""}
              ${isDragging ? "border-primary/50 bg-primary/5" : ""}
            `} 
            style={{ animation: 'glowing 3s infinite alternate' }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            {/* Drag overlay */}
            {isDragging && (
              <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary/50 rounded-2xl sm:rounded-3xl flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="text-4xl mb-2">📁</div>
                  <p className="text-primary font-medium">Drop files here to upload</p>
                </div>
              </div>
            )}

            <MessageLimitBanner
              messageCount={messageCount}
              messageLimit={messageLimit}
              messageLimitResetAt={messageLimitResetAt}
            />
            
            {/* Attachments Preview - Inside Input Area */}
            <AnimatePresence>
              {(attachments.length > 0 || uploadQueue.length > 0) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 sm:px-4 pt-3 sm:pt-4 pb-0"
                >
                  <div className="flex flex-row gap-2 overflow-x-auto pb-2">
                    {attachments.map((attachment) => (
                      <PreviewAttachment 
                        key={attachment.url} 
                        attachment={attachment} 
                        onRemove={() => handleRemoveAttachment(attachment)} 
                      />
                    ))}

                    {uploadQueue.map((filename) => (
                      <PreviewAttachment
                        key={filename}
                        attachment={{
                          url: "",
                          name: filename,
                          contentType: "",
                        }}
                        isUploading={true}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {isRecording ? (
              <div className="p-3 sm:p-4">
                <RecordingWaves isRecording={isRecording} />
              </div>
            ) : (
              <Textarea
                ref={textareaRef}
                placeholder="Ask Jotium anything... "
                value={input}
                onChange={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`
                  min-h-[100px] sm:min-h-[100px] max-h-[300px] sm:max-h-[300px] overflow-y-auto resize-none 
                  border-0 bg-transparent text-sm sm:text-sm placeholder:text-muted-foreground/60 
                  focus-visible:ring-0 focus-visible:ring-offset-0 p-3 sm:p-4 
                  pr-20 sm:pr-28 leading-relaxed thin-scrollbar
                `}
                rows={2}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    if (isMobile) {
                      return;
                    } else {
                      event.preventDefault();
                      if (isLoading) {
                        toast.error("Please wait for the agent to finish its response!");
                      } else {
                        submitForm();
                      }
                    }
                  }
                }}
              />
            )}

            {/* Action Buttons - Responsive positioning */}
            <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex items-center gap-1.5 sm:gap-2">
              <Button
                className="rounded-full p-1.5 sm:p-2 size-8 sm:size-10 border-border/50 bg-background/50 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-200"
                onClick={(event) => {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }}
                variant="outline"
                disabled={isLoading || isRecording || isTranscribing}
                size="sm"
              >
                <PaperclipIcon size={14} className="sm:size-4" />
              </Button>

              {isLoading ? (
                <Button
                  className="rounded-full p-1.5 sm:p-2 size-8 sm:size-10 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
                  onClick={(event) => {
                    event.preventDefault();
                    stop();
                  }}
                  size="sm"
                >
                  <StopIcon size={14} className="sm:size-4" />
                </Button>
              ) : isTranscribing ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-full">
                  <AudioLines size={14} className="sm:size-4 text-primary animate-pulse" />
                  <span className="text-xs text-primary font-medium">Transcribing...</span>
                </div>
              ) : (
                <Button
                  className={`
                    rounded-full p-1.5 sm:p-2 size-8 sm:size-10 transition-all duration-200
                    ${(input.trim().length > 0 || attachments.length > 0)
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:scale-105"
                      : isRecording
                      ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    }
                  `}
                  onClick={(event) => {
                    event.preventDefault();
                    if (input.trim().length > 0 || attachments.length > 0) {
                      submitForm();
                    } else {
                      handleAudioClick();
                    }
                  }}
                  disabled={uploadQueue.length > 0 || isTranscribing}
                  size="sm"
                >
                  {(input.trim().length > 0 || attachments.length > 0) ? (
                    <ArrowUpIcon size={14} className="sm:size-4" />
                  ) : isRecording ? (
                    <Square size={14} className="sm:size-4" />
                  ) : (
                    <Mic size={14} className="sm:size-4" />
                  )}
                </Button>
              )}

              {/* Cancel recording button */}
              {isRecording && (
                <Button
                  className="rounded-full p-1.5 sm:p-2 size-8 sm:size-10 bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200"
                  onClick={(event) => {
                    event.preventDefault();
                    cancelRecording();
                  }}
                  size="sm"
                >
                  <X size={14} className="sm:size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Global styles for scrollbar and code blocks */}
      <style jsx global>{`
        /* For Webkit browsers (Chrome, Safari) */
        .thin-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .thin-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .thin-scrollbar::-webkit-scrollbar-thumb {
          background-color: hsl(var(--border));
          border-radius: 3px;
        }
        .thin-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: hsl(var(--border) / 0.8);
        }
        /* For Firefox */
        .thin-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--border)) transparent;
        }
      `}</style>
    </div>
  );
}
