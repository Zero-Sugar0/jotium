import { FunctionDeclaration, Type } from "@google/genai";
import { tavily } from "@tavily/core";

export class WebSearchTool {
  private tavilyClient: any;

  constructor(apiKey: string) {
    this.tavilyClient = tavily({ apiKey });
  }

  // Original web search functionality
  getSearchDefinition(): FunctionDeclaration {
    return {
      name: "web_search",
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
            description: "Search depth: 'basic' for quick results or 'advanced' for comprehensive search (default: advanced)"
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

  // New content extraction functionality
  getExtractDefinition(): FunctionDeclaration {
    return {
      name: "web_extract",
      description: "Extract structured content and information from specific web pages or URLs. Perfect for getting detailed content from articles, blog posts, documentation, or any web page where you need the full text content extracted and processed. Always outputs content in markdown format with advanced extraction depth.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          urls: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of URLs to extract content from. Can handle multiple URLs simultaneously for batch processing."
          },
          includeMetadata: {
            type: Type.BOOLEAN,
            description: "Whether to include page metadata like title, description, author, publish date, and other structured data (default: true)"
          }
        },
        required: ["urls"]
      }
    };
  }

  // New web crawling functionality
  getCrawlDefinition(): FunctionDeclaration {
    return {
      name: "web_crawl",
      description: "Crawl and explore a website systematically to gather comprehensive information. This tool navigates through website pages following links to collect data based on specific instructions. Ideal for research, data collection, site analysis, or when you need to gather information from multiple pages of a website.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          startUrl: {
            type: Type.STRING,
            description: "The starting URL to begin crawling from. This will be the entry point for the crawling process."
          },
          instructions: {
            type: Type.STRING,
            description: "Detailed instructions for what information to look for and extract during the crawl. Be specific about the type of content, data points, or information you want to gather."
          },
          maxDepth: {
            type: Type.NUMBER,
            description: "Maximum depth of links to follow from the starting URL. Depth 0 = only start page, depth 1 = start page + direct links, etc. (default: 1, max: 3)"
          },
          maxBreadth: {
            type: Type.NUMBER,
            description: "Maximum number of pages to crawl per depth level. Controls how many links to follow at each level to prevent excessive crawling (default: 10, max: 50)"
          },
          extractDepth: {
            type: Type.STRING,
            description: "Content extraction depth: 'basic' for quick content extraction, 'advanced' for comprehensive content analysis and structured data extraction (default: advanced)"
          },
          includeDomains: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Restrict crawling to specific domains only. Useful for staying within certain websites or subdomains."
          },
          excludeDomains: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Domains to exclude from crawling. Prevents the crawler from following links to specified domains."
          },
          followExternalLinks: {
            type: Type.BOOLEAN,
            description: "Whether to follow links that lead to external domains outside the starting URL's domain (default: false)"
          }
        },
        required: ["startUrl", "instructions"]
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
      
      const extractOptions: any = {
        extractDepth: "advanced",
        includeImages: false,
        contentFormat: "markdown"
      };

      // Add metadata option if provided
      if (args.includeMetadata !== undefined) {
        extractOptions.includeMetadata = args.includeMetadata;
      }

      const result = await this.tavilyClient.extract(args.urls, extractOptions);

      // Process extracted content
      const processedResults = result.results?.map((item: { url: string; title: string; content: string; metadata: any; images: any[]; status: string; }) => ({
        url: item.url,
        title: item.title,
        content: item.content,
        metadata: item.metadata || {},
        images: item.images || [],
        extractedAt: new Date().toISOString(),
        contentLength: item.content?.length || 0,
        status: item.status || 'success'
      })) || [];

      return {
        success: true,
        extractedUrls: args.urls,
        results: processedResults,
        totalResults: processedResults.length,
        successfulExtractions: processedResults.filter((r: { status: string; }) => r.status === 'success').length,
        extractionTime: new Date().toISOString(),
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
      console.log(`🕷️ Starting crawl from: "${args.startUrl}"`);
      console.log(`📋 Instructions: "${args.instructions}"`);
      
      const crawlOptions: any = {
        instructions: args.instructions,
        maxDepth: Math.min(args.maxDepth || 1, 3),
        maxBreadth: Math.min(args.maxBreadth || 10, 50),
        extractDepth: args.extractDepth || "advanced",
        followExternalLinks: args.followExternalLinks || false
      };

      // Add domain filters if provided
      if (args.includeDomains && args.includeDomains.length > 0) {
        crawlOptions.includeDomains = args.includeDomains;
      }
      
      if (args.excludeDomains && args.excludeDomains.length > 0) {
        crawlOptions.excludeDomains = args.excludeDomains;
      }

      const result = await this.tavilyClient.crawl(args.startUrl, crawlOptions);

      // Process crawl results
      const processedPages = result.results?.map((page: { url: string; title: string; content: string; depth: number; parent_url: string | null; links: any[]; metadata: any; }) => ({
        url: page.url,
        title: page.title,
        content: page.content,
        depth: page.depth || 0,
        parent_url: page.parent_url || null,
        extractedAt: new Date().toISOString(),
        contentLength: page.content?.length || 0,
        links: page.links || [],
        metadata: page.metadata || {}
      })) || [];

      return {
        success: true,
        startUrl: args.startUrl,
        instructions: args.instructions,
        crawlSummary: result.summary || "Crawl completed successfully",
        pages: processedPages,
        totalPages: processedPages.length,
        maxDepthReached: Math.max(...processedPages.map((p: { depth: number; }) => p.depth), 0),
        crawlTime: new Date().toISOString(),
        crawlOptions: crawlOptions,
        discoveredUrls: processedPages.map((p: { url: string; }) => p.url)
      };

    } catch (error: unknown) {
      console.error("❌ Web crawl failed:", error);
      return {
        success: false,
        error: `Web crawl failed: ${error instanceof Error ? error.message : String(error)}`,
        startUrl: args.startUrl,
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

  async crawl(startUrl: string, instructions: string, options: any = {}): Promise<any> {
    return this.executeCrawl({ startUrl, instructions, ...options });
  }
}
