"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ScrollToBottomProps {
  onClick: () => void
  isVisible: boolean
  className?: string
}

export function ScrollToBottom({ onClick, isVisible, className }: ScrollToBottomProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-40 left-1/2 transform -translate-x-1/2 z-40 rounded-full p-2 h-10 w-10",
        "bg-background/90 backdrop-blur-sm border border-border/50",
        "hover:bg-background shadow-lg transition-all duration-300",
        "flex items-center justify-center",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none",
        className
      )}
      title="Scroll to bottom"
      variant="ghost"
      size="sm"
    >
      <ChevronDown className="size-5" />
    </Button>
  )
}
