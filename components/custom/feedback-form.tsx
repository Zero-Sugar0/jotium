"use client";

import { useState } from "react";
import { toast } from "sonner"; // Import toast for notifications

import { MessageSquareTextIcon, SmileIcon, MehIcon, FrownIcon, XIcon } from "./icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface FeedbackFormProps {
  onClose: () => void;
}

export const FeedbackForm = ({ onClose }: FeedbackFormProps) => {
  const [feedbackText, setFeedbackText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sentiment, setSentiment] = useState<"positive" | "neutral" | "negative" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission loading

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      toast.error("Feedback cannot be empty.");
      return;
    }
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }

    setIsSubmitting(true);
    const submitPromise = fetch("/api/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "treffbour@gmail.com", // The specified email address
        type: "feedback",
        data: {
          name,
          email,
          feedbackText,
          sentiment,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    toast.promise(submitPromise, {
      loading: "Submitting feedback...",
      success: () => {
        onClose();
        return "Feedback submitted successfully!";
      },
      error: (err) => {
        console.error("Failed to send feedback:", err);
        return `Failed to submit feedback: ${err.message || "Unknown error"}`;
      },
      finally: () => {
        setIsSubmitting(false);
      },
    });
  };

  return (
    <div className="p-3 md:p-4 bg-background rounded-lg shadow-lg max-w-sm md:max-w-md mx-auto">
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <MessageSquareTextIcon size={18} className="md:w-5 md:h-5" />
          <h3 className="text-base md:text-lg font-semibold">Submit Feedback</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 md:h-10 md:w-10">
          <XIcon size={16} className="md:w-5 md:h-5" />
        </Button>
      </div>
      <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mb-3 md:mb-4">
        We are always looking for ways to improve our product. Please let us
        know what you think.
      </p>
      
      <Input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-3 rounded-xl"
      />
      
      <Input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-3 rounded-xl"
      />
      
      <Textarea
        placeholder="Give us your feedback..."
        value={feedbackText}
        onChange={(e) => setFeedbackText(e.target.value)}
        className="mb-3 md:mb-4 min-h-[80px] md:min-h-[100px] rounded-xl"
      />
      <div className="flex gap-2 mb-3 md:mb-4">
        <Button
          variant="outline"
          size="icon"
          className={`h-8 w-8 md:h-10 md:w-10 rounded-full ${sentiment === "positive" ? "bg-green-500/20 border-green-500" : ""}`}
          onClick={() => setSentiment("positive")}
        >
          <SmileIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={`h-8 w-8 md:h-10 md:w-10 rounded-full ${sentiment === "neutral" ? "bg-yellow-500/20 border-yellow-500" : ""}`}
          onClick={() => setSentiment("neutral")}
        >
          <MehIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={`h-8 w-8 md:h-10 md:w-10 rounded-full ${sentiment === "negative" ? "bg-red-500/20 border-red-500" : ""}`}
          onClick={() => setSentiment("negative")}
        >
          <FrownIcon />
        </Button>
      </div>
      <Button onClick={handleSubmit} className="w-full rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </div>
  );
};