//components/custom/markdown-components.tsx
import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ComposedChart,
} from "recharts";

// Custom tooltip component to match user-provided image
export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black text-white rounded-md p-1.5 shadow-lg text-xs font-sans w-max max-w-[180px]">
        <p className="mb-1 font-semibold text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-white/80">{entry.name}</span>
            </div>
            <span className="font-bold tabular-nums">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="group/copy inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-all duration-200 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-600"
      aria-label={copied ? "Copied!" : "Copy code"}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-600 dark:text-green-400">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 group-hover/copy:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

// Collapsible Code Block Component
export const CollapsibleCodeBlock = ({ language, children, codeContent }: { language: string, children: any, codeContent: string }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lineCount, setLineCount] = useState(0);

  React.useEffect(() => {
    const lines = codeContent.split('\n').length;
    setLineCount(lines);
    // Auto-collapse if more than 20 lines
    setIsCollapsed(false);
  }, [codeContent]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="my-2 sm:my-4 rounded-lg sm:rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 overflow-hidden shadow-sm w-full -ml-1.5 sm:ml-0 -mr-4 sm:mr-0">
      <div className="flex items-center justify-between px-2 sm:px-3 py-1 sm:py-1.5 bg-zinc-100/80 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
            {language}
          </span>
          {lineCount > 10 && (
            <button
              onClick={toggleCollapse}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-all duration-200"
              aria-label={isCollapsed ? "Expand code" : "Collapse code"}
            >
              <svg 
                className={`w-3 h-3 transition-transform duration-200 ${isCollapsed ? 'rotate-0' : 'rotate-90'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {isCollapsed ? `${lineCount} hidden lines` : 'Collapse'}
            </button>
          )}
        </div>
        <CopyButton text={codeContent} />
      </div>
      <div className={`overflow-x-auto w-full pl-1 pr-0 transition-all duration-300 ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-none opacity-100'}`}>
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          className="!m-0 !bg-transparent !text-xs sm:!text-sm md:!text-base w-full"
          customStyle={{
            padding: '0.75rem 1rem',
            margin: 0,
            background: 'transparent',
            fontSize: 'inherit',
            width: '100%',
            minWidth: '100%'
          }}
          codeTagProps={{
            style: {
              background: 'transparent',
              width: '100%',
              display: 'block'
            }
          }}
        >
          {codeContent}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

// Helper function to check if a link should be rendered inline with subtle styling
export const isInlineLink = (href: string, children: any) => {
  const childText = typeof children === 'string' ? children : 
    (Array.isArray(children) ? children.join('') : '');
  
  // Check if it's a domain-only link or very short
  const isShortDomain = href && (
    href.includes('.org') || 
    href.includes('.com') || 
    href.includes('.net') || 
    href.includes('.edu') ||
    href.includes('.gov')
  ) && childText.length < 30;
  
  return isShortDomain;
};

// Helper function to get favicon URL
export const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
};

// Helper function to check if link should show favicon (standalone links)
export const shouldShowFavicon = (href: string, children: any) => {
  const childText = typeof children === 'string' ? children : 
    (Array.isArray(children) ? children.join('') : '');
  
  // Show favicon for standalone links that aren't inline
  return !isInlineLink(href, children) && href && childText.length > 0;
};

// Helper function to check if URL is a video
export const isVideoUrl = (url: string) => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  const videoServices = ['youtube.com', 'youtu.be', 'vimeo.com', 'twitch.tv'];
  
  return videoExtensions.some(ext => url.toLowerCase().includes(ext)) ||
         videoServices.some(service => url.toLowerCase().includes(service));
};

// YouTube video embed component
export const YouTubeEmbed = ({ url }: { url: string }) => {
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(url);
  if (!videoId) return null;

  return (
    <div className="relative w-full aspect-video rounded-md sm:rounded-lg md:rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-md sm:shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-700">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full border-0"
        loading="lazy"
        title="YouTube video"
      />
    </div>
  );
};

// Vimeo video embed component
export const VimeoEmbed = ({ url }: { url: string }) => {
  const getVimeoId = (url: string) => {
    const regExp = /vimeo.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const videoId = getVimeoId(url);
  if (!videoId) return null;

  return (
    <div className="relative w-full aspect-video rounded-md sm:rounded-lg md:rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-md sm:shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-700">
      <iframe
        src={`https://player.vimeo.com/video/${videoId}?responsive=1&dnt=1`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0"
        loading="lazy"
        title="Vimeo video"
      />
    </div>
  );
};

// Video component for direct video files
export const VideoPlayer = ({ src, ...props }: any) => {
  return (
    <div className="relative w-full rounded-md sm:rounded-lg md:rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-md sm:shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-700">
      <video
        controls
        className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] object-contain"
        preload="metadata"
        playsInline
        {...props}
      >
        <source src={src} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

// Chart rendering utilities
export const sanitizeJson = (input: string) => {
  // Remove block comments and line comments
  let s = input.replace(/\/\*[\s\S]*?\*\//g, "");
  s = s.replace(/(^|\s)\/\/.*$/gm, "");
  // Remove trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, "$1");
  return s.trim();
};

export const safeParse = (text: string): any | null => {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
};

export const renderChart = (spec: any, isSmallScreen: boolean) => {
  const type = spec.type?.toLowerCase();
  const data = spec.data || [];
  const xKey = spec.xKey || "name";
  const yKeys: string[] = spec.yKeys || (spec.yKey ? [spec.yKey] : ["value"]);
  const colors: string[] = spec.colors || [
    "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", // blue, green, amber, red, violet
    "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1", // cyan, lime, orange, pink, indigo
    "#10b981", "#fbbf24", "#f43f5e", "#a855f7", "#14b8a6", // emerald, yellow, rose, purple, teal
    "#64748b", "#f59e0b", "#8b5cf6", "#06b6d4", "#84cc16"  // slate, amber, violet, cyan, lime
  ];
  const height = spec.height || (isSmallScreen ? 240 : 320);
  const stacked = Boolean(spec.stacked);
  // Determine if x-axis labels need rotation on small screens or when labels are long/many
  const categories: string[] = Array.isArray(data) ? data.map((d: any) => String(d?.[xKey] ?? "")) : [];
  const maxLabelLength: number = categories.reduce((m: number, s: string) => Math.max(m, s?.length || 0), 0);
  const rotateLabels: boolean = Boolean(
    spec.rotateLabels ?? (isSmallScreen && (maxLabelLength > 8 || categories.length > 5))
  );
  const xTickProps: any = rotateLabels ? { angle: -35, textAnchor: "end" } : undefined;
  const xAxisExtraProps: any = rotateLabels
    ? { tick: xTickProps, interval: 0, height: 50, tickMargin: 8 }
    : {};
  const bottomMargin = rotateLabels ? 28 : 8;
  const chartMargin = { top: 8, right: 16, bottom: bottomMargin, left: isSmallScreen ? -8 : 0 } as const;

  const Container = ({ children: c }: any) => (
    <figure className="my-3 sm:my-4 md:my-6 w-full overflow-hidden -ml-2 sm:ml-0">
      <div className="w-full h-full">
        <div className="w-full" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {c}
          </ResponsiveContainer>
        </div>
      </div>
      {spec.title && (
        <figcaption className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 text-center">
          {spec.title}
        </figcaption>
      )}
    </figure>
  );

  if (type === "line") {
    return (
      <Container>
        <LineChart data={data} margin={chartMargin}>
          <CartesianGrid stroke="hsl(var(--border))" />
          <XAxis dataKey={xKey} {...xAxisExtraProps} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          {isSmallScreen ? null : <Legend />}
          {yKeys.map((k, i) => (
            <Line key={k} type="monotone" dataKey={k} stroke={colors[i % colors.length]} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </Container>
    );
  }
  if (type === "bar") {
    return (
      <Container>
        <BarChart data={data} margin={chartMargin}>
          <CartesianGrid stroke="hsl(var(--border))" />
          <XAxis dataKey={xKey} {...xAxisExtraProps} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          {isSmallScreen ? null : <Legend />}
          {yKeys.map((k, i) => (
            <Bar key={k} dataKey={k} stackId={stacked ? "stack" : undefined} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </Container>
    );
  }
  if (type === "area") {
    return (
      <Container>
        <AreaChart data={data} margin={chartMargin}>
          <CartesianGrid stroke="hsl(var(--border))" />
          <XAxis dataKey={xKey} {...xAxisExtraProps} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          {isSmallScreen ? null : <Legend />}
          {yKeys.map((k, i) => (
            <Area key={k} type="monotone" dataKey={k} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.25} />
          ))}
        </AreaChart>
      </Container>
    );
  }
  if (type === "pie") {
    const innerRadius = spec.innerRadius ?? 60;
    const outerRadius = spec.outerRadius ?? 100;
    const nameKey = spec.nameKey || xKey;
    const valueKey = yKeys[0] || "value";
    return (
      <Container>
        <PieChart>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          {isSmallScreen ? null : <Legend />}
          <Pie data={data} dataKey={valueKey} nameKey={nameKey} innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={4}>
            {data.map((_: any, i: number) => (
              <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </Container>
    );
  }
  if (type === "radar") {
    const angleKey = spec.angleKey || xKey;
    const radiusKey = yKeys[0] || "value";
    return (
      <Container>
        <RadarChart data={data} outerRadius="80%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey={angleKey} />
          <PolarRadiusAxis />
          {isSmallScreen ? null : <Legend />}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Radar name={radiusKey} dataKey={radiusKey} stroke={colors[0]} fill={colors[0]} fillOpacity={0.35} />
        </RadarChart>
      </Container>
    );
  }
  if (type === "scatter") {
    const yKey = yKeys[0] || "y";
    const zKey = spec.zKey;
    return (
      <Container>
        <ScatterChart margin={chartMargin}>
          <CartesianGrid stroke="hsl(var(--border))" />
          <XAxis dataKey={xKey} {...xAxisExtraProps} />
          <YAxis dataKey={yKey} />
          {zKey ? <ZAxis dataKey={zKey} /> : null}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          {isSmallScreen ? null : <Legend />}
          <Scatter name={yKey} data={data} fill={colors[0]} />
        </ScatterChart>
      </Container>
    );
  }
  if (type === "composed") {
    // spec.series: [{ type: 'bar'|'line'|'area', key: 'uv' }]
    const series = spec.series || yKeys.map((k: string) => ({ type: "bar", key: k }));
    return (
      <Container>
        <ComposedChart data={data} margin={chartMargin}>
          <CartesianGrid stroke="hsl(var(--border))" />
          <XAxis dataKey={xKey} {...xAxisExtraProps} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          {isSmallScreen ? null : <Legend />}
          {series.map((s: any, i: number) => {
            const color = colors[i % colors.length];
            if (s.type === "line") return <Line key={`${s.type}-${s.key}`} type="monotone" dataKey={s.key} stroke={color} strokeWidth={2} dot={false} />;
            if (s.type === "area") return <Area key={`${s.type}-${s.key}`} type="monotone" dataKey={s.key} stroke={color} fill={color} fillOpacity={0.25} />;
            return <Bar key={`${s.type}-${s.key}`} dataKey={s.key} fill={color} radius={[4, 4, 0, 0]} />;
          })}
        </ComposedChart>
      </Container>
    );
  }
  
  return null;
};