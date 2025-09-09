import { Attachment } from "ai";
import { motion } from "framer-motion";
import { X, File, FileText, Music, Video, Archive } from "lucide-react";
import React from "react";

interface PreviewAttachmentProps {
  attachment: Attachment;
  isUploading?: boolean;
  onRemove?: () => void;
}

const getFileIcon = (contentType: string) => {
  if (contentType.startsWith("video/")) return Video;
  if (contentType.startsWith("audio/")) return Music;
  if (contentType.includes("pdf") || contentType.includes("document")) return FileText;
  if (contentType.includes("zip") || contentType.includes("rar")) return Archive;
  return File;
};

const getFileTypeLabel = (contentType: string) => {
  if (contentType.startsWith("image/")) return "Image";
  if (contentType.startsWith("video/")) return "Video";
  if (contentType.startsWith("audio/")) return "Audio";
  if (contentType.includes("pdf")) return "PDF";
  if (contentType.includes("document")) return "Document";
  if (contentType.includes("zip") || contentType.includes("rar")) return "Archive";
  return "File";
};

export function PreviewAttachment({ 
  attachment, 
  isUploading = false,
  onRemove 
}: PreviewAttachmentProps) {
  const isImage = attachment.contentType?.startsWith("image/");
  const IconComponent = getFileIcon(attachment.contentType || "");
  const fileTypeLabel = getFileTypeLabel(attachment.contentType || "");
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative group"
    >
      {/* Main Preview Card */}
      <div className="relative bg-background/60 backdrop-blur-sm border border-border/40 rounded-lg p-2 hover:bg-background/70 transition-colors duration-200">
        
        {/* Close Button - Minimal design */}
        {onRemove && !isUploading && (
          <button
            onClick={onRemove}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-muted hover:bg-destructive text-destructive-foreground rounded-full flex items-center justify-center transition-all duration-200 border border-border shadow-md z-10"
          >
            <X size={12} strokeWidth={2} />
          </button>
        )}
        
        <div className="flex items-center gap-2">
          {/* File Icon/Image */}
          <div className="relative flex-shrink-0">
            {isImage && attachment.url && !isUploading ? (
              <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                <img 
                  src={attachment.url} 
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-md bg-muted border border-border flex items-center justify-center">
                <IconComponent size={16} className="text-muted-foreground" />
              </div>
            )}
            
            {/* Upload Progress Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-md flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
