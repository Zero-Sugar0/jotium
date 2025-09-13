import { useEffect, useRef, RefObject, useCallback, useState } from "react";

export function useScrollToBottom<T extends HTMLElement>(
  deps: any[] = []
): [RefObject<T>, RefObject<T>, () => void, boolean] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);
  // State to track if the user has scrolled up
  const [hasScrolledUp, setHasScrolledUp] = useState(false);

  // Effect to handle user scroll behavior
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      // If user is more than 100px from the bottom, show the scroll-to-bottom button
      if (scrollFromBottom > 100) {
        setHasScrolledUp(true);
      } else {
        setHasScrolledUp(false);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = useCallback((force: boolean = false) => {
    const end = endRef.current;
    if (!end) return;

    if (force) {
      // When forcing scroll, reset the scrolled up flag
      setHasScrolledUp(false);
      end.scrollIntoView({ behavior: "smooth", block: "end" });
      return;
    }

    // Auto-scroll only if the user hasn't scrolled up
    if (!hasScrolledUp) {
      end.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [hasScrolledUp]);

  const forceScrollToBottom = useCallback(() => {
    scrollToBottom(true);
  }, [scrollToBottom]);

  // Effect to auto-scroll when new messages are added
  useEffect(() => {
    // A small delay to allow the DOM to update before scrolling
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return [containerRef, endRef, forceScrollToBottom, hasScrolledUp];
}
