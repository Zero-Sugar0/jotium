import { FunctionDeclaration, Type } from "@google/genai";

export class FireWebScrapeTool {
  private apiKey: string;
  private baseUrl: string = "https://api.firecrawl.dev";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "fire_web_scrape",
      description: "Advanced web scraping and data extraction tool powered by Firecrawl. Extract content from any website with intelligent parsing that removes ads, navigation, and clutter while preserving the main content. Supports single URL scraping, comprehensive website crawling, structured data extraction with custom schemas, and intelligent web search. Perfect for content aggregation, data mining, competitor analysis, research automation, and building knowledge bases from web sources. Handles JavaScript-rendered content, PDFs, and provides clean, structured output in multiple formats.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "Web scraping operation to perform. Choose 'scrape' for single URL content extraction, 'crawl' for comprehensive website exploration, 'extract' for structured data with custom schemas, 'search' for intelligent web search with content retrieval, or 'check_crawl_status' to monitor ongoing crawl jobs. Each action is optimized for different use cases and data extraction needs."
          },
          url: {
            type: Type.STRING,
            description: "Target URL for scraping, crawling, or data extraction (required for scrape, crawl, extract actions). Supports any valid HTTP/HTTPS URL including dynamic JavaScript sites. Examples: 'https://example.com', 'https://docs.company.com/api', 'https://news.site.com/article'. Ensure URLs are accessible and properly formatted."
          },
          query: {
            type: Type.STRING,
            description: "Search query for web search functionality (required for search action). Use natural language or keywords to find relevant web pages. Examples: 'latest AI developments 2024', 'company sustainability reports', 'machine learning tutorials'. The tool will find and extract content from the most relevant results."
          },
          jobId: {
            type: Type.STRING,
            description: "Crawl job identifier for checking status (required for check_crawl_status action). Obtained from crawl action responses. Format: unique string identifier. Use this to monitor progress of large crawl operations and retrieve results when complete."
          },
          formats: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Output format preferences for extracted content. Options: 'markdown' (clean, readable text), 'html' (raw HTML), 'json' (structured data). Default: ['markdown']. Choose based on your processing needs - markdown for content analysis, HTML for structure preservation, JSON for data extraction. Can combine multiple formats."
          },
          limit: {
            type: Type.NUMBER,
            description: "Maximum number of pages to process. For crawl: 1-100 pages (default: 10). For search: 1-20 results (default: 5). Higher limits provide more comprehensive data but take longer and use more credits. Consider your needs vs. processing time when setting this value."
          },
          onlyMainContent: {
            type: Type.BOOLEAN,
            description: "Intelligent content filtering that removes navigation menus, advertisements, footers, and other non-essential elements (default: true). When enabled, extracts only the main article/content body for cleaner, more relevant data. Disable if you need complete page structure including sidebars and navigation."
          },
          parsePDF: {
            type: Type.BOOLEAN,
            description: "Enable PDF file parsing when encountered (default: false). When true, will extract text content from PDF documents found during crawling or scraping. Useful for research, documentation sites, and academic content. May increase processing time for PDF-heavy sites."
          },
          maxAge: {
            type: Type.NUMBER,
            description: "Maximum age of cached content in milliseconds before fresh scraping (default: 14400000ms = 4 hours). Use to balance between fresh data and processing speed. Set to 0 for always fresh content, or higher values (up to 48 hours) for frequently accessed sites to improve performance and reduce API usage."
          },
          extractionSchema: {
            type: Type.OBJECT,
            description: "JSON schema definition for structured data extraction (required for extract action). Define the exact data structure you want to extract with field names, types, and descriptions. Example: {'type': 'object', 'properties': {'title': {'type': 'string'}, 'price': {'type': 'number'}, 'features': {'type': 'array'}}}. Enables precise data extraction from unstructured web content."
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const action = args.action;
      console.log(`🔥 Firecrawl ${action}: ${args.url || args.query || args.jobId}`);

      switch (action) {
        case 'scrape':
          return await this.scrapeUrl(args);
        case 'crawl':
          return await this.crawlUrl(args);
        case 'extract':
          return await this.extractFromUrl(args);
        case 'search':
          return await this.searchWeb(args);
        case 'check_crawl_status':
          return await this.checkCrawlStatus(args);
        default:
          throw new Error(`Unknown action: ${action}`);
      }

    } catch (error: unknown) {
      console.error("❌ Firecrawl operation failed:", error);
      return {
        success: false,
        error: `Firecrawl operation failed: ${error instanceof Error ? error.message : String(error)}`,
        action: args.action
      };
    }
  }

  private async scrapeUrl(args: any): Promise<any> {
    if (!args.url) {
      throw new Error("URL is required for scrape action");
    }

    const scrapeOptions: any = {
      formats: args.formats || ['markdown']
    };

    if (args.onlyMainContent !== undefined) scrapeOptions.onlyMainContent = args.onlyMainContent;
    if (args.parsePDF !== undefined) scrapeOptions.parsePDF = args.parsePDF;
    if (args.maxAge !== undefined) scrapeOptions.maxAge = args.maxAge;

    const response = await fetch(`${this.baseUrl}/v1/scrape`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: args.url,
        ...scrapeOptions
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: result.success || true,
      action: 'scrape',
      url: args.url,
      data: result.data || result,
      formats: scrapeOptions.formats,
      timestamp: new Date().toISOString()
    };
  }

  private async crawlUrl(args: any): Promise<any> {
    if (!args.url) {
      throw new Error("URL is required for crawl action");
    }

    const crawlOptions: any = {
      limit: Math.min(args.limit || 10, 100),
      scrapeOptions: {
        formats: args.formats || ['markdown']
      }
    };

    if (args.onlyMainContent !== undefined) crawlOptions.scrapeOptions.onlyMainContent = args.onlyMainContent;
    if (args.parsePDF !== undefined) crawlOptions.scrapeOptions.parsePDF = args.parsePDF;
    if (args.maxAge !== undefined) crawlOptions.scrapeOptions.maxAge = args.maxAge;

    const response = await fetch(`${this.baseUrl}/v1/crawl`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: args.url,
        ...crawlOptions
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: result.success || true,
      action: 'crawl',
      url: args.url,
      jobId: result.id || result.jobId,
      data: result.data || result,
      limit: crawlOptions.limit,
      timestamp: new Date().toISOString()
    };
  }

  private async extractFromUrl(args: any): Promise<any> {
    if (!args.url) {
      throw new Error("URL is required for extract action");
    }

    if (!args.extractionSchema) {
      throw new Error("extractionSchema is required for extract action");
    }

    const extractOptions: any = {
      formats: ['json'],
      jsonOptions: {
        schema: args.extractionSchema
      }
    };

    if (args.onlyMainContent !== undefined) extractOptions.onlyMainContent = args.onlyMainContent;
    if (args.parsePDF !== undefined) extractOptions.parsePDF = args.parsePDF;
    if (args.maxAge !== undefined) extractOptions.maxAge = args.maxAge;

    const response = await fetch(`${this.baseUrl}/v1/scrape`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: args.url,
        ...extractOptions
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: result.success || true,
      action: 'extract',
      url: args.url,
      extractedData: result.data?.json || result.json,
      schema: args.extractionSchema,
      timestamp: new Date().toISOString()
    };
  }

  private async searchWeb(args: any): Promise<any> {
    if (!args.query) {
      throw new Error("Query is required for search action");
    }

    const searchOptions: any = {
      limit: Math.min(args.limit || 5, 20),
      scrapeOptions: {
        formats: args.formats || ['markdown']
      }
    };

    if (args.onlyMainContent !== undefined) searchOptions.scrapeOptions.onlyMainContent = args.onlyMainContent;
    if (args.parsePDF !== undefined) searchOptions.scrapeOptions.parsePDF = args.parsePDF;
    if (args.maxAge !== undefined) searchOptions.scrapeOptions.maxAge = args.maxAge;

    const response = await fetch(`${this.baseUrl}/v1/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: args.query,
        ...searchOptions
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: result.success || true,
      action: 'search',
      query: args.query,
      results: result.data || result,
      limit: searchOptions.limit,
      timestamp: new Date().toISOString()
    };
  }

  private async checkCrawlStatus(args: any): Promise<any> {
    if (!args.jobId) {
      throw new Error("jobId is required for check_crawl_status action");
    }

    const response = await fetch(`${this.baseUrl}/v1/crawl/${args.jobId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      action: 'check_crawl_status',
      jobId: args.jobId,
      status: result.status,
      data: result.data,
      total: result.total,
      completed: result.completed,
      creditsUsed: result.creditsUsed,
      expiresAt: result.expiresAt,
      timestamp: new Date().toISOString()
    };
  }
}
