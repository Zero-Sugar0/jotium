//components/custom/markdown.tsx
import React, { memo, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { createMarkdownComponents } from './markdown-renderers';

const NonMemoizedMarkdown = ({ children, showTypewriter = true }: { children: string; showTypewriter?: boolean }) => {
  const [displayed, setDisplayed] = useState<string>("");
  const displayedRef = useRef<string>("");
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);

  useEffect(() => {
    displayedRef.current = displayed;
  }, [displayed]);

  useEffect(() => {
    const update = () => setIsSmallScreen(typeof window !== 'undefined' && window.innerWidth < 640);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const full = children ?? "";
    if (!showTypewriter) {
      setDisplayed(full);
      return;
    }

    // Determine starting point: append if the new content extends the previous displayed content
    const startIndex = full.startsWith(displayedRef.current)
      ? displayedRef.current.length
      : 0;

    if (startIndex === 0) {
      setDisplayed("");
    }

    if (full.length === startIndex) {
      setDisplayed(full);
      return;
    }

    // Typing speed scales with content length; minimum 1 char per tick
    const remaining = full.length - startIndex;
    const step = Math.max(1, Math.floor(remaining / 120));
    const interval = window.setInterval(() => {
      const current = displayedRef.current;
      const nextLen = Math.min(full.length, (current.startsWith(full.slice(0, startIndex)) ? current.length : startIndex) + step);
      const next = full.slice(0, nextLen);
      setDisplayed(next);
      if (nextLen >= full.length) {
        window.clearInterval(interval);
      }
    }, 16);

    return () => {
      // Cleanup on content change or unmount
      window.clearInterval(interval);
    };
  }, [children, showTypewriter]);

  const components = createMarkdownComponents(isSmallScreen, showTypewriter);

  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none w-full [&>*:first-child]:!mt-0 [&>*:last-child]:!mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, [remarkEmoji, { accessible: true }]]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={components}
      >
        {showTypewriter ? displayed : children}
      </ReactMarkdown>
    </div>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);