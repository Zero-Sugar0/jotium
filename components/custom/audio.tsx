//components/custom/audio.tsx
"use client";

import { motion } from "framer-motion";
import { AudioLines, Mic, Square, X } from "lucide-react";
import React, { useRef, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "../ui/button";

// Real-time audio wave visualization component with original design
export function RecordingWaves({ isRecording }: { isRecording: boolean }) {
  const [audioLevels, setAudioLevels] = useState<number[]>([0, 0, 0, 0, 0]);
  const [recordingTime, setRecordingTime] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const setupAudio = async () => {
      if (!isRecording) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 32;
        analyserRef.current = analyser;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const updateLevels = () => {
          if (!analyserRef.current) return;

          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);

          // Map frequency data to 5 wave bars
          const levels = [
            Math.max(...dataArray.slice(0, 2)),
            Math.max(...dataArray.slice(2, 4)),
            Math.max(...dataArray.slice(4, 6)),
            Math.max(...dataArray.slice(6, 8)),
            Math.max(...dataArray.slice(8, 10)),
          ].map(level => level / 128);

          setAudioLevels(levels);
          animationRef.current = requestAnimationFrame(updateLevels);
        };

        updateLevels();
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    };

    if (isRecording) {
      setupAudio();
      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      // Reset timer when not recording
      setRecordingTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Stop all tracks immediately when not recording
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center space-x-1 h-12">
      {audioLevels.map((level, i) => (
        <motion.div
          key={i}
          className="w-1 bg-primary rounded-full"
          animate={{
            height: [8, 8 + level * 20, 8],
            opacity: [0.7, 0.9 + level * 0.1, 0.7],
          }}
          transition={{
            duration: 0.1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ height: 8 + level * 20 }}
        />
      ))}
      <div className="ml-3 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Listening...</span>
        <span className="text-sm font-mono text-primary">{formatTime(recordingTime)}</span>
      </div>
    </div>
  );
}

export interface AudioHookReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  audioBlob: Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  transcribeAudio: (audioBlob: Blob) => Promise<string>;
}

export function useAudio(setInput: (value: string) => void, textareaRef: React.RefObject<HTMLTextAreaElement>): AudioHookReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [shouldUpload, setShouldUpload] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        // Note: Stream tracks are now stopped in stopRecording() for immediate release
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setShouldUpload(false);
      toast.success("Recording started. Click stop when finished.");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setShouldUpload(true);
      
      // Stop all tracks to release the microphone immediately
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      toast.success("Recording stopped");
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioBlob(null);
      setShouldUpload(false);
      
      // Stop all tracks to release the microphone immediately
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      toast.success("Recording cancelled");
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioBase64: base64,
          mimeType: 'audio/wav',
        }),
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      const transcription = data.transcription || "";
      
      // Add transcription to input
      setInput(transcription);
      
      // Focus textarea for editing
      textareaRef.current?.focus();
      
      return transcription;
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe audio');
      return '';
    } finally {
      setIsTranscribing(false);
    }
  };

  // Auto-transcribe when recording is complete
  useEffect(() => {
    const transcribe = async () => {
      if (audioBlob && !isRecording && shouldUpload) {
        await transcribeAudio(audioBlob);
        setAudioBlob(null);
        setShouldUpload(false);
      }
    };
    
    transcribe();
  }, [audioBlob, isRecording, shouldUpload]);

  return {
    isRecording,
    isTranscribing,
    audioBlob,
    startRecording,
    stopRecording,
    cancelRecording,
    transcribeAudio
  };
}

export interface AudioButtonsProps {
  input: string;
  isLoading: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  uploadQueue: string[];
  submitForm: () => void;
  handleAudioClick: () => void;
  cancelRecording: () => void;
}

export function AudioButtons({
  input,
  isLoading,
  isRecording,
  isTranscribing,
  uploadQueue,
  submitForm,
  handleAudioClick,
  cancelRecording
}: AudioButtonsProps) {
  return (
    <>
      {isLoading ? (
        <Button
          className="rounded-full p-1.5 sm:p-2 size-8 sm:size-10 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
          onClick={(event) => {
            event.preventDefault();
            // stop() function should be passed from parent
          }}
          size="sm"
        >
          <Square size={14} className="sm:size-4" />
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
            ${input.trim().length > 0
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:scale-105"
              : isRecording
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
              : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
            }
          `}
          onClick={(event) => {
            event.preventDefault();
            if (input.trim().length > 0) {
              submitForm();
            } else {
              handleAudioClick();
            }
          }}
          disabled={uploadQueue.length > 0 || isTranscribing}
          size="sm"
        >
          {input.trim().length > 0 ? (
            <Square size={14} className="sm:size-4" />
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
    </>
  );
}