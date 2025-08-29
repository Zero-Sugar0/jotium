"use client";

import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation"; 
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

import { Message } from "@/ai/types";
import { Message as PreviewMessage } from "@/components/custom/message";
import { generateUUID } from "@/lib/utils";

import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";
import { useScrollToBottom } from "./use-scroll-to-bottom";

const MESSAGES_PER_PAGE = 25; // Define how many messages to fetch per page

export function Chat({
  id,
  initialMessages,
  messageCount,
  messageLimit,
  messageLimitResetAt,
}: {
  id: string;
  initialMessages: Array<Message>;
  messageCount: number;
  messageLimit: number;
  messageLimitResetAt: Date | null;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(
    initialMessages.length === MESSAGES_PER_PAGE
  ); // Assume more if initial load filled the page
  const [loadingMore, setLoadingMore] = useState(false);
  const [messagesContainerRef, messagesEndRef, forceScrollToBottom] =
    useScrollToBottom<HTMLDivElement>([messages]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [firstName, setFirstName] = useState<string | undefined>(undefined);
  const [executingTools, setExecutingTools] = useState<string[]>([]); // New state for executing tools (array)
  const [messageToolsMap, setMessageToolsMap] = useState<{[messageId: string]: string[]}>({});  // Track tools per message
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    fetch("/account/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.firstName) setFirstName(data.firstName);
      });
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || loadingMore) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;
    
    // Store current scroll position relative to the bottom
    const container = messagesContainerRef.current;
    const scrollFromBottom = container ? container.scrollHeight - container.scrollTop : 0;
    
    try {
      const response = await fetch(
        `/api/message?chatId=${id}&page=${nextPage}&limit=${MESSAGES_PER_PAGE}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch more messages");
      }
      const { messages: newMessages } = await response.json();

      if (newMessages.length > 0) {
        setMessages((prev) => [...newMessages, ...prev]);
        setCurrentPage(nextPage);
        setHasMoreMessages(newMessages.length === MESSAGES_PER_PAGE);
        
        // Restore scroll position after loading more messages
        if (container) {
          requestAnimationFrame(() => {
            const newScrollTop = container.scrollHeight - scrollFromBottom;
            container.scrollTop = newScrollTop;
          });
        }
      } else {
        setHasMoreMessages(false);
      }
    } catch (err) {
      console.error("Error loading more messages:", err);
      toast.error("Failed to load more messages.");
    } finally {
      setLoadingMore(false);
    }
  }, [id, currentPage, hasMoreMessages, loadingMore]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Check if scrolled to the very top
      if (container.scrollTop === 0 && hasMoreMessages && !loadingMore) {
        loadMoreMessages();
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMoreMessages, loadingMore, loadMoreMessages]);

  const handleSubmit = async (e?: { preventDefault?: () => void }) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (!input.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: generateUUID(),
      role: "user",
      content: input,
      timestamp: Date.now(),
      attachments,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
    setIsLoading(true);
    setError(null);

    // Create new AbortController for this request
    const controller = new AbortController();
    setAbortController(controller);

    // Force scroll to bottom immediately when user sends a message
    requestAnimationFrame(() => {
      forceScrollToBottom();
    });

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, messages: [...messages, userMessage] }),
      signal: controller.signal,
    });

    if (response.status === 429) {
      console.error("Error: Message limit reached.");
      toast.error("You've reached your daily message limit. Please upgrade your plan for more messages.");
      setIsLoading(false);
      setAbortController(null);
      setMessages((prev) => prev.slice(0, prev.length - 1));
      return;
    }

    if (!response.ok) {
      if (response.status === 0 && controller.signal.aborted) {
        // Request was aborted by user
        setMessages((prev) => prev.slice(0, prev.length - 1));
      } else {
        console.error("Error: Failed to send message.");
        toast.error("Failed to send message. Please try again.");
        setMessages((prev) => prev.slice(0, prev.length - 1));
      }
      setIsLoading(false);
      setAbortController(null);
      return;
    }

    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        id: generateUUID(),
        role: "assistant",
        content: "",
        thoughts: "",
        timestamp: Date.now(),
        attachments: [],
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Force scroll again when assistant message starts
      requestAnimationFrame(() => {
        forceScrollToBottom();
      });

      const startTime = Date.now();
      let pendingAttachments: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.substring(6);
            if (jsonStr.trim().startsWith("{") && jsonStr.trim().endsWith("}")) {
              try {
                const data = JSON.parse(jsonStr);
                if (data.type === "thought") {
                  assistantMessage.thoughts += data.content;
                } else if (data.type === "response") {
                  assistantMessage.content += data.content;
                } else if (data.type === "error") {
                  setError(data.content);
                } else if (data.type === "tool-start") {
                  setExecutingTools(prev => [...prev, data.toolName]); // Add tool to executing array
                  // Also store tools for this specific message
                  setMessageToolsMap(prev => ({
                    ...prev,
                    [assistantMessage.id]: [...(prev[assistantMessage.id] || []), data.toolName]
                  }));
                }
                if (data.attachments && Array.isArray(data.attachments)) {
                  pendingAttachments = data.attachments;
                  assistantMessage.attachments = pendingAttachments;
                }
                assistantMessage.duration = Date.now() - startTime;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id ? { ...assistantMessage } : msg
                  )
                );
              } catch (error) {
                console.error("Error parsing stream data:", error, jsonStr);
              }
            }
          }
        }
      }
      
      assistantMessage.duration = Date.now() - startTime;
      if (pendingAttachments.length > 0) {
        assistantMessage.attachments = pendingAttachments;
      }
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id ? { ...assistantMessage } : msg
        )
      );
      setExecutingTools([]); // Reset executing tools after response
      
      // Final scroll to bottom when message is complete
      requestAnimationFrame(() => {
        forceScrollToBottom();
      });
      
      router.refresh(); // Refresh server components to update message count
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="flex flex-col h-dvh bg-gradient-to-br from-background via-background to-muted/20">
        {/* Messages Container - This is the ONLY scrollable area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto scroll-smooth pt-12"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--border)) transparent'
          }}
        >
          {/* Content with proper padding */}
          <div className="px-3 sm:px-5 md:px-7 lg:mx-[132px] lg:px-10 xl:px-14 2xl:px-18">
            <div className="max-w-2xl mx-auto layout-stable">
              {/* Top padding for first message */}
              <div className="pt-4 sm:pt-6" />
              
              <AnimatePresence mode="popLayout">
                {loadingMore && (
                  <div className="text-center py-1.5 text-sm text-muted-foreground">
                    Loading more messages...
                  </div>
                )}
                {messages.length === 0 && !loadingMore && (
                  <Overview firstName={firstName} key="overview" />
                )}

                {messages.map((message, index) => (
                  <PreviewMessage
                    key={message.id}
                    chatId={id}
                    role={message.role}
                    content={message.content}
                    thoughts={message.thoughts}
                    toolInvocations={message.toolCalls as any}
                    duration={message.duration}
                    attachments={message.attachments}
                    executingTools={
                      // Show executing tools for current streaming message OR completed tools for finished messages
                      index === messages.length - 1 && 
                      message.role === "assistant" && 
                      isLoading 
                        ? executingTools 
                        : messageToolsMap[message.id] || []
                    }
                    isStreaming={
                      index === messages.length - 1 && 
                      message.role === "assistant" && 
                      isLoading
                    }
                    onEditMessage={
                      message.role === "user" && typeof message.content === "string"
                        ? async (newContent: string) => {
                            try {
                              setIsLoading(true);
                              setError(null);
                              setExecutingTools([]);
                              // Create new AbortController for regeneration
                              const controller = new AbortController();
                              setAbortController(controller);
                              
                              // Trim conversation to the edited message (inclusive)
                              const baseMessages = messages
                                .slice(0, index + 1)
                                .map((m, i) => (i === index ? { ...m, content: newContent } : m));

                              // Update UI to reflect trimmed history
                              setMessages(baseMessages);

                              const response = await fetch("/api/chat", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id, messages: baseMessages, regenerate: true }),
                                signal: controller.signal,
                              });

                              if (!response.ok) {
                                if (response.status === 0 && controller.signal.aborted) {
                                  // Request was aborted by user
                                  setMessages((prev) => prev.slice(0, prev.length - 1));
                                } else {
                                  throw new Error("Failed to regenerate response");
                                }
                                setIsLoading(false);
                                setAbortController(null);
                                return;
                              }

                              if (response.body) {
                                const reader = response.body.getReader();
                                const decoder = new TextDecoder();
                                let assistantMessage: Message = {
                                  id: generateUUID(),
                                  role: "assistant",
                                  content: "",
                                  thoughts: "",
                                  timestamp: Date.now(),
                                  attachments: [],
                                };
                                setMessages((prev) => [...prev, assistantMessage]);

                                const startTime = Date.now();
                                let pendingAttachments: any[] = [];

                                while (true) {
                                  const { done, value } = await reader.read();
                                  if (done) break;

                                  const chunk = decoder.decode(value, { stream: true });
                                  const lines = chunk.split("\n\n");

                                  for (const line of lines) {
                                    if (line.startsWith("data: ")) {
                                      const jsonStr = line.substring(6);
                                      if (jsonStr.trim().startsWith("{") && jsonStr.trim().endsWith("}")) {
                                        try {
                                          const data = JSON.parse(jsonStr);
                                          if (data.type === "thought") {
                                            assistantMessage.thoughts += data.content;
                                          } else if (data.type === "response") {
                                            assistantMessage.content += data.content;
                                          } else if (data.type === "error") {
                                            setError(data.content);
                                          } else if (data.type === "tool-start") {
                                            setExecutingTools(prev => [...prev, data.toolName]);
                                            setMessageToolsMap(prev => ({
                                              ...prev,
                                              [assistantMessage.id]: [...(prev[assistantMessage.id] || []), data.toolName]
                                            }));
                                          }
                                          if (data.attachments && Array.isArray(data.attachments)) {
                                            pendingAttachments = data.attachments;
                                            assistantMessage.attachments = pendingAttachments;
                                          }
                                          assistantMessage.duration = Date.now() - startTime;
                                          setMessages((prev) => prev.map((msg) => msg.id === assistantMessage.id ? { ...assistantMessage } : msg));
                                        } catch (error) {
                                          console.error("Error parsing stream data:", error, jsonStr);
                                        }
                                      }
                                    }
                                  }
                                }

                                assistantMessage.duration = Date.now() - startTime;
                                if (pendingAttachments.length > 0) {
                                  assistantMessage.attachments = pendingAttachments;
                                }
                                setMessages((prev) => prev.map((msg) => msg.id === assistantMessage.id ? { ...assistantMessage } : msg));
                                setExecutingTools([]);
                                setAbortController(null);
                                
                                // Scroll to bottom after regeneration
                                requestAnimationFrame(() => {
                                  forceScrollToBottom();
                                });
                                
                                router.refresh(); // Refresh server components to update message count
                              }
                            } catch (err) {
                              console.error(err);
                              toast.error("Failed to regenerate response");
                            } finally {
                              setIsLoading(false);
                              setAbortController(null);
                            }
                          }
                        : undefined
                    }
                    onUseAsInput={(text: string) => {
                      setInput(prev => {
                        const base = prev ?? "";
                        return base.length ? `${base}${base.endsWith(" ") ? "" : " "}${text}` : text;
                      });
                    }}
                  />
                ))}
              </AnimatePresence>
              
              {/* Bottom spacing to ensure last message is visible above input */}
              <div className="h-40" />
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Error Display - Fixed position, not part of scroll */}
        {error && (
          <div className="shrink-0 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 pb-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-red-700 dark:text-red-300 text-sm text-center">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        <MultimodalInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={() => {
            if (abortController) {
              abortController.abort();
              setAbortController(null);
              setIsLoading(false);
              setExecutingTools([]);
            }
          }}
          messages={messages as any}
          attachments={attachments}
          setAttachments={setAttachments}
          append={async () => null}
          messageCount={messageCount}
          messageLimit={messageLimit}
          messageLimitResetAt={messageLimitResetAt}
        />
      </div>
      {/* Global styles for scrollbar and code blocks */}
      <style jsx global>{`
        /* For Webkit browsers (Chrome, Safari) */
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background-color: hsl(var(--border));
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background-color: hsl(var(--border) / 0.8);
        }
        /* Shift code blocks slightly left on mobile for visual centering */
        :global(pre) {
          margin-left: -0.375rem;
        }
        @media (min-width: 640px) {
          :global(pre) {
            margin-left: 0;
          }
        }
      `}</style>
    </>
  );
}
