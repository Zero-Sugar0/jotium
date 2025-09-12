import { FunctionDeclaration, Type } from "@google/genai";
import { tavily } from "@tavily/core";

export class TavilyWebSearchTool {
  private tavilyClient: any;

  constructor(apiKey: string) {
    this.tavilyClient = tavily({ apiKey });
  }

  // Original web search functionality
  getSearchDefinition(): FunctionDeclaration {
    return {
      name: "tavily_web_search",
      description: "Access real-time web intelligence through Tavily's AI-powered search engine. Find current information, breaking news, research data, and up-to-date content from across the internet. Perfect for staying informed about recent events, gathering competitive intelligence, conducting market research, or finding the latest developments in any topic. Combines traditional web crawling with AI analysis to deliver comprehensive, relevant results with source attribution.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: {
            type: Type.STRING,
            description: "Your search query to find current information about any topic. Use natural language questions or keywords. Examples: 'latest AI developments 2024', 'climate change impacts on agriculture', 'best practices for React hooks', 'stock market trends this week'. Be specific for better results."
          },
          maxResults: {
            type: Type.NUMBER,
            description: "Maximum number of search results to return (default: 5, max: 20). Higher values provide more comprehensive coverage but may include less relevant results. Use 5-10 for focused searches, 15-20 for comprehensive research."
          },
          searchDepth: {
            type: Type.STRING,
            description: "Search comprehensiveness level: 'basic' for quick answers and fast response times, or 'advanced' for thorough research with deeper analysis and more comprehensive results (default: advanced). Use 'advanced' for important research tasks."
          },
          includeAnswer: {
            type: Type.BOOLEAN,
            description: "Include an AI-generated summary answer from the search results (default: true). Provides a concise overview of the most relevant findings. Disable when you want only raw search results without AI summarization."
          },
          includeDomains: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Whitelist specific domains to include in search results. Useful for focusing on trusted sources like 'wikipedia.org', 'github.com', 'arxiv.org'. Format: 'example.com' or 'subdomain.example.com'. Multiple domains act as OR filters."
          },
          excludeDomains: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Blacklist specific domains to exclude from search results. Useful for filtering out unwanted sources like social media, shopping sites, or competitor websites. Format: 'example.com' or 'subdomain.example.com'. Multiple domains act as OR filters."
          }
        },
        required: ["query"]
      }
    };
  }

  // Fixed content extraction functionality based on official docs
  getExtractDefinition(): FunctionDeclaration {
    return {
      name: "web_extract",
      description: "Intelligently extract clean, structured content from specific web pages or URLs using AI-powered content analysis. Perfect for getting detailed text from articles, blog posts, documentation, product pages, or any web content. Automatically removes ads, navigation, and clutter while preserving the main content, formatting, and structure. Supports multiple output formats and can extract images alongside text content.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          urls: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of URLs to extract content from. Maximum 20 URLs per request. Accepts full URLs like 'https://example.com/article' or 'https://docs.example.com/guide'. Supports HTTP and HTTPS protocols."
          },
          includeImages: {
            type: Type.BOOLEAN,
            description: "Include a list of images extracted from the URLs in the response (default: false). When enabled, returns image URLs found in the content for visual analysis or processing."
          },
          extractDepth: {
            type: Type.STRING,
            description: "Content extraction thoroughness: 'basic' for quick extraction with standard content detection, or 'advanced' for comprehensive extraction with deeper content analysis and higher success rate (default: basic). Use 'advanced' for complex pages or when basic extraction misses important content.",
            enum: ["basic", "advanced"]
          },
          format: {
            type: Type.STRING,
            description: "Output format for extracted content: 'markdown' for rich formatting with headers, links, and styling, or 'text' for plain text without formatting (default: markdown). Markdown preserves document structure and is ideal for further processing.",
            enum: ["markdown", "text"]
          }
        },
        required: ["urls"]
      }
    };
  }

  // Fixed crawl functionality based on official docs
  getCrawlDefinition(): FunctionDeclaration {
    return {
      name: "web_crawl",
      description: "Systematically crawl and explore websites to gather comprehensive information by following internal links and discovering related content. This intelligent crawler navigates through website pages based on your instructions, collecting data, extracting content, and building a complete picture of the site's information. Perfect for website audits, content discovery, competitive analysis, research data collection, and building knowledge bases from web sources.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          url: {
            type: Type.STRING,
            description: "The root URL to begin the crawl from. This serves as the starting point for exploration. Format: 'https://example.com' or 'https://docs.example.com'. The crawler will discover and follow internal links from this starting point."
          },
          maxDepth: {
            type: Type.NUMBER,
            description: "Maximum crawl depth defining how many link levels away from the base URL the crawler can explore (default: 1). Depth 1 explores direct links from the starting page, depth 2 explores links from those pages, etc. Higher values discover more content but take longer."
          },
          maxBreadth: {
            type: Type.NUMBER,
            description: "Maximum number of links to follow per level of the tree (default: 20). Limits how many links are processed at each depth level. Higher values explore more pages per level but may include less relevant content."
          },
          limit: {
            type: Type.NUMBER,
            description: "Total number of pages the crawler will process before stopping (default: 50). Acts as a safety limit to prevent excessive crawling. Adjust based on site size and your information needs."
          },
          instructions: {
            type: Type.STRING,
            description: "Natural language instructions to guide the crawler on what information to look for and extract. Examples: 'Find all product information and pricing', 'Extract documentation and API references', 'Collect blog posts and articles', 'Gather company information and team details'. Be specific about content types and topics of interest."
          },
          selectPaths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Regex patterns to select only URLs with specific path patterns for focused crawling. Examples: '/docs/.*' for documentation only, '/blog/.*' for blog posts, '/products/.*' for product pages. Multiple patterns act as OR filters."
          },
          selectDomains: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Regex patterns to restrict crawling to specific domains or subdomains. Useful for multi-site crawling or focusing on specific sections. Examples: '^docs\\.example\\.com$', '^blog\\.example\\.com$'. Leave empty to crawl within the starting domain."
          },
          excludePaths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Regex patterns to exclude URLs with specific path patterns. Useful for avoiding unwanted content like '/admin/.*', '/login', '/cart', or '/search'. Helps focus crawling on relevant content."
          },
          excludeDomains: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Regex patterns to exclude specific domains or subdomains from crawling. Useful for avoiding external sites, CDNs, or unwanted domains. Format: '^cdn\\.example\\.com$', '^ads\\.example\\.com$'."
          },
          allowExternal: {
            type: Type.BOOLEAN,
            description: "Whether to include links from external domains in crawl output (default: false). When false, crawler stays within the starting domain. When true, may discover and include relevant external links, but focuses primarily on the starting site."
          },
          includeImages: {
            type: Type.BOOLEAN,
            description: "Whether to extract and include image URLs from the crawled pages (default: false). When enabled, returns image URLs found in content for visual analysis or media processing."
          },
          categories: {
            type: Type.ARRAY,
            items: { 
              type: Type.STRING,
              enum: ["Careers", "Blog", "Documentation", "About", "Pricing", "Community", "Developers", "Contact", "Media"]
            },
            description: "Filter URLs using predefined content categories like 'Blog', 'Documentation', 'Careers', 'Pricing'. Useful for focusing on specific types of content. Multiple categories act as OR filters."
          },
          extractDepth: {
            type: Type.STRING,
            description: "Content extraction depth during crawling: 'basic' for standard content extraction, or 'advanced' for comprehensive extraction with deeper analysis and more detailed content (default: basic). Use 'advanced' when you need rich, detailed content from each page.",
            enum: ["basic", "advanced"]
          },
          format: {
            type: Type.STRING,
            description: "Output format for extracted content: 'markdown' for rich formatting with headers, links, and styling, or 'text' for plain text without formatting (default: markdown). Markdown preserves document structure and is ideal for further processing."
          }
        },
        required: ["url"]
      }
    };
  }

  // Get all tool definitions
  getAllDefinitions(): FunctionDeclaration[] {
    return [
      this.getSearchDefinition(),
      this.getExtractDefinition(),
      this.getCrawlDefinition()
    ];
  }

  async executeSearch(args: any): Promise<any> {
    try {
      console.log(`🔍 Searching: "${args.query}"`);
      
      const searchOptions: any = {
        searchDepth: args.searchDepth || "advanced",
        maxResults: Math.min(args.maxResults || 5, 20),
        includeAnswer: args.includeAnswer !== false
      };

      // Add domain filters if provided
      if (args.includeDomains && args.includeDomains.length > 0) {
        searchOptions.includeDomains = args.includeDomains;
      }
      
      if (args.excludeDomains && args.excludeDomains.length > 0) {
        searchOptions.excludeDomains = args.excludeDomains;
      }

      const result = await this.tavilyClient.search(args.query, searchOptions);

      // Process and clean results
      const processedResults = result.results?.map((item: { title: string; url: string; content: string; score: number; published_date: string }) => ({
        title: item.title,
        url: item.url,
        content: item.content,
        score: item.score,
        publishedDate: item.published_date
      })) || [];

      return {
        success: true,
        query: args.query,
        answer: result.answer || null,
        results: processedResults,
        resultsCount: processedResults.length,
        searchTime: new Date().toISOString(),
        images: result.images || [],
        followUpQuestions: result.follow_up_questions || []
      };

    } catch (error: unknown) {
      console.error("❌ Web search failed:", error);
      return {
        success: false,
        error: `Web search failed: ${error instanceof Error ? error.message : String(error)}`,
        query: args.query
      };
    }
  }

  async executeExtract(args: any): Promise<any> {
    try {
      console.log(`📄 Extracting content from ${args.urls.length} URL(s)`);
      
      // Validate URLs array
      if (!Array.isArray(args.urls) || args.urls.length === 0) {
        throw new Error("URLs must be a non-empty array");
      }

      if (args.urls.length > 20) {
        throw new Error("Maximum 20 URLs allowed per request");
      }

      // Build extract options based on official documentation
      const extractOptions: any = {};
      
      if (args.includeImages !== undefined) {
        extractOptions.includeImages = args.includeImages;
      }
      
      if (args.extractDepth) {
        extractOptions.extractDepth = args.extractDepth;
      }
      
      if (args.format) {
        extractOptions.format = args.format;
      }

      // Call Tavily extract method with proper signature: tvly.extract(urls, options)
      const result = await this.tavilyClient.extract(args.urls, extractOptions);

      // Process extracted content based on actual Tavily response structure
      const processedResults = result.results?.map((item: { 
        url: string; 
        rawContent: string; 
        images?: string[];
      }) => ({
        url: item.url,
        content: item.rawContent || '', // Raw content from Tavily (in markdown format by default)
        images: item.images || [],
        extractedAt: new Date().toISOString(),
        contentLength: item.rawContent?.length || 0,
        status: item.rawContent ? 'success' : 'failed'
      })) || [];

      // Handle failed results if present in response - Tavily uses failedResults (camelCase)
      const failedResults = result.failedResults?.map((failedItem: any) => ({
        url: failedItem.url || 'unknown',
        error: failedItem.error || 'extraction failed',
        status: 'failed'
      })) || [];

      return {
        success: true,
        extractedUrls: args.urls,
        results: processedResults,
        failedResults: failedResults,
        totalResults: processedResults.length,
        successfulExtractions: processedResults.filter((r: { status: string; }) => r.status === 'success').length,
        failedExtractions: failedResults.length,
        extractionTime: new Date().toISOString(),
        responseTime: result.responseTime || 0, // Tavily uses responseTime (camelCase)
        extractOptions: extractOptions
      };

    } catch (error: unknown) {
      console.error("❌ Content extraction failed:", error);
      return {
        success: false,
        error: `Content extraction failed: ${error instanceof Error ? error.message : String(error)}`,
        urls: args.urls
      };
    }
  }

  async executeCrawl(args: any): Promise<any> {
    try {
      console.log(`🕷️ Starting crawl from: "${args.url}"`);
      if (args.instructions) {
        console.log(`📋 Instructions: "${args.instructions}"`);
      }
      
      // Build crawl options based on actual Tavily JavaScript SDK documentation
      const crawlOptions: any = {};

      if (args.maxDepth !== undefined) {
        crawlOptions.maxDepth = args.maxDepth;
      }
      
      if (args.maxBreadth !== undefined) {
        crawlOptions.maxBreadth = args.maxBreadth;
      }
      
      if (args.limit !== undefined) {
        crawlOptions.limit = args.limit;
      }
      
      if (args.instructions) {
        crawlOptions.instructions = args.instructions;
      }
      
      if (args.selectPaths && args.selectPaths.length > 0) {
        crawlOptions.selectPaths = args.selectPaths;
      }
      
      if (args.selectDomains && args.selectDomains.length > 0) {
        crawlOptions.selectDomains = args.selectDomains;
      }
      
      if (args.excludePaths && args.excludePaths.length > 0) {
        crawlOptions.excludePaths = args.excludePaths;
      }
      
      if (args.excludeDomains && args.excludeDomains.length > 0) {
        crawlOptions.excludeDomains = args.excludeDomains;
      }
      
      if (args.allowExternal !== undefined) {
        crawlOptions.allowExternal = args.allowExternal;
      }
      
      if (args.includeImages !== undefined) {
        crawlOptions.includeImages = args.includeImages;
      }
      
      if (args.categories && args.categories.length > 0) {
        crawlOptions.categories = args.categories;
      }
      
      if (args.extractDepth) {
        crawlOptions.extractDepth = args.extractDepth;
      }
      
      if (args.format) {
        crawlOptions.format = args.format;
      }

      // Call Tavily crawl method - the JS SDK signature is: client.crawl(url, options)
      const result = await this.tavilyClient.crawl(args.url, crawlOptions);

      // Process crawl results based on official response format
      const processedPages = result.results?.map((page: { 
        url: string; 
        raw_content: string; 
        images?: string[];
      }) => ({
        url: page.url,
        content: page.raw_content || '', // Content in markdown format by default
        images: page.images || [],
        extractedAt: new Date().toISOString(),
        contentLength: page.raw_content?.length || 0
      })) || [];

      return {
        success: true,
        startUrl: args.url,
        instructions: args.instructions,
        baseUrl: result.baseUrl || args.url,
        crawlSummary: `Crawled ${processedPages.length} pages successfully`,
        pages: processedPages,
        totalPages: processedPages.length,
        responseTime: result.responseTime || 0,
        crawlTime: new Date().toISOString(),
        crawlOptions: crawlOptions,
        discoveredUrls: processedPages.map((p: { url: string; }) => p.url)
      };

    } catch (error: unknown) {
      console.error("❌ Web crawl failed:", error);
      return {
        success: false,
        error: `Web crawl failed: ${error instanceof Error ? error.message : String(error)}`,
        startUrl: args.url,
        instructions: args.instructions
      };
    }
  }

  // Legacy method for backward compatibility
  async search(query: string, options: any = {}): Promise<any> {
    return this.executeSearch({ query, ...options });
  }

  // New convenience methods
  async extract(urls: string[], options: any = {}): Promise<any> {
    return this.executeExtract({ urls, ...options });
  }

  async crawl(startUrl: string, instructions?: string, options: any = {}): Promise<any> {
    return this.executeCrawl({ url: startUrl, instructions, ...options });
  }
}
