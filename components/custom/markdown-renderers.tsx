//components/custom/markdown-renderers.tsx
import Image from "next/image";
import Link from "next/link";
import React from "react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import {
  CollapsibleCodeBlock,
  isInlineLink,
  shouldShowFavicon,
  getFaviconUrl,
  isVideoUrl,
  YouTubeEmbed,
  VimeoEmbed,
  VideoPlayer,
  sanitizeJson,
  safeParse,
  renderChart,
} from './markdown-components';
import PDFViewer from './PDFViewer';
import ScrapeViewer from './ScrapeViewer';
import { StockDisplay } from "./stock";
import { WeatherDisplay } from "./weather";

export const createMarkdownComponents = (isSmallScreen: boolean, showTypewriter: boolean) => ({
  // Beautiful heading hierarchy with proper spacing
  h1: (props: any) => (
    <h1 className="scroll-m-20 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-6 sm:mt-8 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-zinc-200 dark:border-zinc-700 first:mt-0" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="scroll-m-20 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-6 sm:mt-8 mb-3 sm:mb-4 first:mt-0" {...props} />
  ),
  h3: (props: any) => (
    <h3 className="scroll-m-20 text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-5 sm:mt-6 mb-2 sm:mb-3" {...props} />
  ),
  h4: (props: any) => (
    <h4 className="scroll-m-20 text-base sm:text-lg md:text-xl lg:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-4 sm:mt-5 mb-2" {...props} />
  ),
  h5: (props: any) => (
    <h5 className="scroll-m-20 text-sm sm:text-base md:text-lg lg:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-3 sm:mt-4 mb-2" {...props} />
  ),
  h6: (props: any) => (
    <h6 className="scroll-m-20 text-xs sm:text-sm md:text-base lg:text-lg font-semibold tracking-tight text-zinc-700 dark:text-zinc-300 mt-3 mb-2" {...props} />
  ),

  // Enhanced paragraphs with mobile-optimized typography and minimal spacing before code
  p: (props: any) => (
    <p className="leading-6 sm:leading-7 text-sm sm:text-base md:text-lg text-zinc-700 dark:text-zinc-300 mb-2 sm:mb-4 [&:not(:first-child)]:mt-2 sm:[&:not(:first-child)]:mt-4 [&:has(+div>div>div>pre)]:mb-1 sm:[&:has(+div>div>div>pre)]:mb-2" {...props} />
  ),

  // Beautiful code blocks + Chart/Weather/Stock/Map/PDF/Scrape rendering support WITH COLLAPSIBLE FEATURE
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    const codeContentRaw = Array.isArray(children) ? children.join("") : String(children);
    const codeContent = codeContentRaw.replace(/\n$/, "");

    // PDF rendering support in code blocks
    const tryRenderPDF = () => {
      if (!match) return null;
      const lang = (match[1] || "").toLowerCase();
      if (!lang.startsWith("pdf")) return null;
      
      try {
        const trimmed = codeContent.trim();
        if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) {
          return null;
        }
        
        const sanitized = sanitizeJson(trimmed);
        const parsed = safeParse(sanitized);
        if (!parsed) return null;
        
        // Check if it's a PDF tool result
        if (parsed.success && parsed.pdfData && parsed.config && parsed.stats) {
          return (
            <PDFViewer
              pdfData={parsed.pdfData}
              title={parsed.config.title}
              stats={parsed.stats}
            />
          );
        }
        
        return null;
      } catch (err) {
        console.error("PDF render error:", err);
        return null;
      }
    };

    // Scrape rendering support in code blocks
    const tryRenderScrape = () => {
      if (!match) return null;
      const lang = (match[1] || "").toLowerCase();
      if (!lang.startsWith("scrape") && !lang.startsWith("firecrawl")) return null;
      
      try {
        const trimmed = codeContent.trim();
        if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) {
          return null;
        }
        
        const sanitized = sanitizeJson(trimmed);
        const parsed = safeParse(sanitized);
        if (!parsed) return null;
        
        // Check if it's a FireWebScrapeTool result
        if (parsed.success !== undefined && parsed.action && parsed.timestamp) {
          return (
            <ScrapeViewer
              success={parsed.success}
              action={parsed.action}
              url={parsed.url}
              query={parsed.query}
              jobId={parsed.jobId}
              data={parsed.data || parsed.results}
              extractedData={parsed.extractedData}
              schema={parsed.schema}
              formats={parsed.formats}
              limit={parsed.limit}
              timestamp={parsed.timestamp}
              error={parsed.error}
              showTypewriter={showTypewriter}
            />
          );
        }
        
        return null;
      } catch (err) {
        console.error("Scrape render error:", err);
        return null;
      }
    };

    const tryRenderWeather = () => {
      if (!match) return null;
      const lang = (match[1] || "").toLowerCase();
      if (lang !== "weather") return null;
      try {
        const trimmed = codeContent.trim();
        if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return null;
        const sanitized = sanitizeJson(trimmed);
        const weatherData = safeParse(sanitized);
        if (!weatherData) return null;
        return <WeatherDisplay weatherData={JSON.stringify(weatherData)} />;
      } catch (error) {
        console.error("Weather render error:", error);
        return null;
      }
    };

    const tryRenderStock = () => {
      if (!match) return null;
      const lang = (match[1] || "").toLowerCase();
      if (lang !== "stock") return null;
      try {
        const trimmed = codeContent.trim();
        if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return null;
        const sanitized = sanitizeJson(trimmed);
        const stockData = safeParse(sanitized);
        if (!stockData) return null;
        return <StockDisplay stockData={JSON.stringify(stockData)} />;
      } catch (error) {
        console.error("Stock render error:", error);
        return null;
      }
    };

    const tryRenderChart = () => {
      if (!match) return null;
      const lang = (match[1] || "").toLowerCase();
      if (!lang.startsWith("chart")) return null;
      try {
        const trimmed = codeContent.trim();
        if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) {
          return null;
        }
        const sanitized = sanitizeJson(trimmed);
        const parsed = safeParse(sanitized);
        if (!parsed) return null;
        
        // Ensure we have the required chart properties
        if (!parsed.type || !parsed.data) {
          console.warn("Chart missing required properties (type, data)", parsed);
          return null;
        }
        
        const result = renderChart(parsed, isSmallScreen);
        
        // If renderChart returns the error component (not null), use it
        if (result && result.type && result.type.toString().includes('Chart Rendering Error')) {
          return result;
        }
        
        return result;
      } catch (err) {
        // Instead of falling back to code rendering, show a proper error
        console.error("Chart render error:", err);
        return (
          <div className="my-3 sm:my-4 w-full p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-red-700 dark:text-red-300 text-sm font-medium mb-2">Chart Rendering Error</div>
            <div className="text-red-600 dark:text-red-400 text-xs">
              Unable to render chart due to invalid data format. Please check the chart specification.
            </div>
          </div>
        );
      }
    };
    
    // Try scrape rendering first
    const scrape = tryRenderScrape();
    if (!inline && match && scrape) {
      return scrape;
    }

    // Try PDF rendering
    const pdf = tryRenderPDF();
    if (!inline && match && pdf) {
      return pdf;
    }

    const weather = tryRenderWeather();
    if (!inline && match && weather) {
      return weather;
    }

    const stock = tryRenderStock();
    if (!inline && match && stock) {
      return stock;
    }

    const chart = tryRenderChart();
    if (!inline && match && chart) {
      return chart;
    }

    return !inline && match ? (
      <CollapsibleCodeBlock 
        language={match[1]} 
        codeContent={codeContent}
      >
        {children}
      </CollapsibleCodeBlock>
    ) : (
      <code
        className="relative rounded-md bg-zinc-100 dark:bg-zinc-800 px-1.5 sm:px-2 py-0.5 sm:py-1 font-mono text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/50"
        {...props}
      >
        {children}
      </code>
    );
  },

  // Enhanced pre for fallback code blocks - MOBILE OPTIMIZED
  pre: (props: any) => (
    <pre className="p-3 sm:p-6 overflow-x-auto font-mono text-xs sm:text-sm md:text-base text-zinc-800 dark:text-zinc-200 bg-transparent w-full -ml-1.5 sm:ml-0" {...props} />
  ),

  // Comprehensive table styling with mobile responsiveness - FULL WIDTH
  table: (props: any) => (
    <div className="my-4 sm:my-8 overflow-hidden rounded-lg sm:rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-xs sm:text-sm md:text-base min-w-full" {...props} />
      </div>
    </div>
  ),
  thead: (props: any) => (
    <thead className="bg-zinc-50 dark:bg-zinc-800/50" {...props} />
  ),
  th: (props: any) => (
    <th className="p-2 sm:p-4 md:p-6 text-left text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-700" {...props} />
  ),
  td: (props: any) => (
    <td className="p-2 sm:p-4 md:p-6 text-zinc-700 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0" {...props} />
  ),
  tr: (props: any) => (
    <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors" {...props} />
  ),

  // Beautiful list styling - MOBILE OPTIMIZED
  ul: (props: any) => (
    <ul className="my-3 sm:my-6 ml-4 sm:ml-6 list-disc space-y-1 sm:space-y-2 text-zinc-700 dark:text-zinc-300 [&>li]:mt-1 sm:[&>li]:mt-2" {...props} />
  ),
  ol: (props: any) => (
    <ol className="my-3 sm:my-6 ml-4 sm:ml-6 list-decimal space-y-1 sm:space-y-2 text-zinc-700 dark:text-zinc-300 [&>li]:mt-1 sm:[&>li]:mt-2" {...props} />
  ),
  li: (props: any) => (
    <li className="leading-6 sm:leading-7 text-sm sm:text-base md:text-lg pl-1" {...props} />
  ),

  // Enhanced text formatting - MOBILE OPTIMIZED
  strong: (props: any) => (
    <strong className="font-bold text-zinc-900 dark:text-zinc-100" {...props} />
  ),
  em: (props: any) => (
    <em className="italic text-zinc-700 dark:text-zinc-300 max-w-full break-words overflow-wrap anywhere inline align-baseline" {...props} />
  ),
  del: (props: any) => (
    <del className="line-through text-zinc-500 dark:text-zinc-500 decoration-red-500/70" {...props} />
  ),
  mark: (props: any) => (
    <mark className="bg-yellow-200 dark:bg-yellow-800/50 px-1 py-0.5 rounded text-zinc-900 dark:text-zinc-100" {...props} />
  ),

  // Stunning blockquotes - MOBILE OPTIMIZED
  blockquote: (props: any) => (
    <blockquote className="relative my-4 sm:my-8 pl-6 sm:pl-8 pr-4 sm:pr-6 py-4 sm:py-6 bg-gradient-to-r from-blue-50/80 via-blue-50/40 to-transparent dark:from-blue-950/30 dark:via-blue-950/10 dark:to-transparent border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg sm:rounded-r-xl shadow-sm" {...props}>
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 text-blue-500/30 dark:text-blue-400/30">
        <svg className="size-4 sm:size-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
        </svg>
      </div>
      <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-lg leading-relaxed italic font-medium [&>*]:!mb-1 sm:[&>*]:!mb-2 [&>*:last-child]:!mb-0">
        {props.children}
      </div>
    </blockquote>
  ),

  // Enhanced links with beautiful hover effects, intelligent inline styling, and favicons
  a: ({ node, href, children, ...props }: any) => {
    const isInline = isInlineLink(href, children);
    const showFavicon = shouldShowFavicon(href, children);
    const faviconUrl = showFavicon ? getFaviconUrl(href) : null;

    // Handle video URLs
    if (href && isVideoUrl(href)) {
      return (
        <figure className="my-3 sm:my-4 md:my-6 lg:my-8 w-full">
          <div className="w-full max-w-4xl mx-auto">
            {href.includes('youtube.com') || href.includes('youtu.be') ? (
              <YouTubeEmbed url={href} />
            ) : href.includes('vimeo.com') ? (
              <VimeoEmbed url={href} />
            ) : (
              <VideoPlayer src={href} />
            )}
          </div>
          {children && typeof children === 'string' && children !== href && (
            <figcaption className="mt-2 sm:mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 italic font-medium text-center px-2">
              {children}
            </figcaption>
          )}
        </figure>
      );
    }
    
    if (isInline) {
      // Subtle inline link styling for short domain links
      return (
        <Link
          href={href || "#"}
          className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 underline decoration-1 decoration-zinc-400 hover:decoration-zinc-600 underline-offset-1 transition-colors duration-200 font-normal"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </Link>
      );
    }
    // Beautiful prominent link styling with favicon for standalone links
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Link
            href={href || "#"}
            className="group inline-flex items-center gap-0 p-0.5 text-xs font-normal text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded-sm hover:underline transition-all duration-200"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {faviconUrl && (
              <Image
                src={faviconUrl}
                alt=""
                width={12}
                height={12}
                className="size-3 rounded-full bg-white dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            <span className="break-all">{new URL(href).hostname}</span>
          </Link>
        </PopoverTrigger>
        <PopoverContent className="w-64 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-md">
          <div className="font-medium">
            {new URL(href).hostname}
          </div>
          <div className="text-xs text-muted-foreground">
            <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {href}
            </a>
          </div>
          <p className="text-sm mt-2">
            {children && typeof children === 'string' ? children.substring(0, 100) + '...' : 'No description available.'}
          </p>
        </PopoverContent>
      </Popover>
    );
  },

  // Stunning image display - MOBILE OPTIMIZED
  img: ({ node, src, alt, ...props }: any) => {
    // Handle video files in img tags
    if (src && isVideoUrl(src)) {
      return (
        <figure className="my-3 sm:my-4 md:my-6 lg:my-8 text-center w-full">
          <div className="w-full max-w-4xl mx-auto">
            <VideoPlayer src={src} {...props} />
          </div>
          {alt && (
            <figcaption className="mt-2 sm:mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 italic font-medium px-2">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    }

    return (
      <figure className="my-3 sm:my-4 md:my-6 lg:my-8 text-center w-full">
        <div className="group relative inline-block rounded-md sm:rounded-lg md:rounded-xl overflow-hidden shadow-md sm:shadow-lg bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700 w-full max-w-full">
          <Image
            src={src}
            alt={alt || "Image"}
            width={800}
            height={600}
            className="w-full h-auto transition-transform duration-300 group-hover:scale-105 max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] object-contain"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 70vw"
            {...props}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        {alt && (
          <figcaption className="mt-2 sm:mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 italic font-medium px-2">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  },

  // Beautiful horizontal rule - MOBILE OPTIMIZED
  hr: (props: any) => (
    <div className="relative my-6 sm:my-12 flex items-center" {...props}>
      <div className="grow border-t border-zinc-200 dark:border-zinc-700"></div>
      <div className="shrink-0 px-4">
        <div className="size-2 bg-zinc-300 dark:bg-zinc-600 rounded-full"></div>
      </div>
      <div className="grow border-t border-zinc-200 dark:border-zinc-700"></div>
    </div>
  ),

  // Task list items (GitHub Flavored Markdown) - MOBILE OPTIMIZED
  input: (props: any) => {
    if (props.type === 'checkbox') {
      return (
        <input
          {...props}
          className="mr-2 size-3 sm:size-4 rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2"
        />
      );
    }
    return <input {...props} />;
  },

  // Enhanced details/summary for collapsible content - MOBILE OPTIMIZED
  details: (props: any) => (
    <details className="my-3 sm:my-6 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden w-full" {...props} />
  ),
  summary: (props: any) => (
    <summary className="px-3 sm:px-4 py-2 sm:py-3 cursor-pointer font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm sm:text-base" {...props} />
  ),

  // Keyboard key styling - MOBILE OPTIMIZED
  kbd: (props: any) => (
    <kbd className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-sm" {...props} />
  ),

  // Subscript and superscript - MOBILE OPTIMIZED
  sub: (props: any) => (
    <sub className="text-xs" {...props} />
  ),
  sup: (props: any) => (
    <sup className="text-xs" {...props} />
  ),

  // Video element support
  video: (props: any) => (
    <figure className="my-3 sm:my-4 md:my-6 lg:my-8 w-full">
      <div className="w-full max-w-4xl mx-auto">
        <VideoPlayer {...props} />
      </div>
    </figure>
  ),
});
