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
      description: "Search the web for current information using Tavily search engine. Use this for real-time information, news, research, or when you need to find current data.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: {
            type: Type.STRING,
            description: "The search query to find information about"
          },
          maxResults: {
            type: Type.NUMBER,
            description: "Maximum number of results to return (default: 5, max: 20)"
          },
          searchDepth: {
            type: Type.STRING,
            description: "Search depth: 'basic' for quick results or 'advanced' for comprehensive search (default: advanced)",
            enum: ["basic", "advanced"]
          },
          includeAnswer: {
            type: Type.BOOLEAN,
            description: "Whether to include a summarized answer from the search results (default: true)"
          },
          includeDomains: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of domains to specifically include in search results"
          },
          excludeDomains: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of domains to exclude from search results"
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
      description: "Extract structured content and information from specific web pages or URLs. Perfect for getting detailed content from articles, blog posts, documentation, or any web page.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          urls: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of URLs to extract content from. Maximum 20 URLs per request."
          },
          includeImages: {
            type: Type.BOOLEAN,
            description: "Include a list of images extracted from the URLs in the response (default: false)"
          },
          extractDepth: {
            type: Type.STRING,
            description: "The depth of extraction: 'basic' for quick extraction or 'advanced' for comprehensive extraction with higher success rate (default: basic)",
            enum: ["basic", "advanced"]
          },
          format: {
            type: Type.STRING,
            description: "The format of extracted content: 'markdown' or 'text' (default: markdown)",
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
      description: "Crawl and explore a website systematically to gather comprehensive information. This tool navigates through website pages following links to collect data based on specific instructions.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          url: {
            type: Type.STRING,
            description: "The root URL to begin the crawl from"
          },
          maxDepth: {
            type: Type.NUMBER,
            description: "Max depth of the crawl. Defines how far from the base URL the crawler can explore (default: 1)"
          },
          maxBreadth: {
            type: Type.NUMBER,
            description: "Max number of links to follow per level of the tree (default: 20)"
          },
          limit: {
            type: Type.NUMBER,
            description: "Total number of links the crawler will process before stopping (default: 50)"
          },
          instructions: {
            type: Type.STRING,
            description: "Natural language instructions for the crawler. Guide what information to look for and extract."
          },
          selectPaths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Regex patterns to select only URLs with specific path patterns (e.g., '/docs/.*', '/api/v1.*')"
          },
          selectDomains: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Regex patterns to select crawling to specific domains or subdomains"
          },
          excludePaths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Regex patterns to exclude URLs with specific path patterns"
          },
          excludeDomains: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Regex patterns to exclude specific domains or subdomains from crawling"
          },
          allowExternal: {
            type: Type.BOOLEAN,
            description: "Whether to return links from external domains in crawl output (default: false)"
          },
          includeImages: {
            type: Type.BOOLEAN,
            description: "Whether to extract image URLs from the crawled pages (default: false)"
          },
          categories: {
            type: Type.ARRAY,
            items: { 
              type: Type.STRING,
              enum: ["Careers", "Blog", "Documentation", "About", "Pricing", "Community", "Developers", "Contact", "Media"]
            },
            description: "Filter URLs using predefined categories"
          },
          extractDepth: {
            type: Type.STRING,
            description: "Advanced extraction retrieves more data but may increase latency: 'basic' or 'advanced' (default: basic)",
            enum: ["basic", "advanced"]
          },
          format: {
            type: Type.STRING,
            description: "The format of extracted content: 'markdown' or 'text' (default: markdown)",
            enum: ["markdown", "text"]
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
