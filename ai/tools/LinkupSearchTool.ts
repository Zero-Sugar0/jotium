import { FunctionDeclaration, Type } from "@google/genai";
import { LinkupClient } from "linkup-sdk";

export class LinkupSearchTool {
  private linkupClient: LinkupClient;

  constructor(apiKey: string) {
    this.linkupClient = new LinkupClient({ apiKey });
  }

  // Main search functionality
  getSearchDefinition(): FunctionDeclaration {
    return {
      name: "linkup_search",
      description: "Search the web using Linkup's AI-optimized search engine. Supports both standard (fast) and deep (agentic) search modes with various output formats including sourced answers, search results, and structured outputs.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: {
            type: Type.STRING,
            description: "The search query string. Can be simple questions or complex research requests."
          },
          depth: {
            type: Type.STRING,
            description: "Search depth: 'standard' for fast straightforward queries, 'deep' for complex agentic workflows that can handle multi-step research",
            enum: ["standard", "deep"]
          },
          outputType: {
            type: Type.STRING,
            description: "Response format: 'sourcedAnswer' for AI-generated answers with sources, 'searchResults' for raw search results, 'structuredOutput' for custom schema-based responses",
            enum: ["sourcedAnswer", "searchResults", "structuredOutput"]
          },
          structuredOutputSchema: {
            type: Type.STRING,
            description: "JSON schema defining the structure for structured output. Required when outputType is 'structuredOutput'. Define the exact format you want the response in."
          },
          includeImages: {
            type: Type.BOOLEAN,
            description: "Include relevant images in the search results (default: false)"
          },
          fromDate: {
            type: Type.STRING,
            description: "Filter results from this date onwards (ISO format: YYYY-MM-DD)"
          },
          toDate: {
            type: Type.STRING,
            description: "Filter results up to this date (ISO format: YYYY-MM-DD)"
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
        required: ["query", "depth", "outputType"]
      }
    };
  }

  // Get all tool definitions
  getAllDefinitions(): FunctionDeclaration[] {
    return [this.getSearchDefinition()];
  }

  async executeSearch(args: any): Promise<any> {
    try {
      console.log(`🔍 Linkup Search: "${args.query}"`);
      console.log(`📊 Mode: ${args.depth} | Output: ${args.outputType}`);
      
      // Build search options
      const searchOptions: any = {
        query: args.query,
        depth: args.depth,
        outputType: args.outputType
      };

      // Add structured output schema if provided
      if (args.structuredOutputSchema && args.outputType === 'structuredOutput') {
        try {
          // Validate that it's valid JSON
          JSON.parse(args.structuredOutputSchema);
          searchOptions.structuredOutputSchema = args.structuredOutputSchema;
        } catch (error) {
          throw new Error("Invalid JSON schema provided for structuredOutputSchema");
        }
      } else if (args.outputType === 'structuredOutput' && !args.structuredOutputSchema) {
        throw new Error("structuredOutputSchema is required when outputType is 'structuredOutput'");
      }

      // Add optional parameters
      if (args.includeImages !== undefined) {
        searchOptions.includeImages = args.includeImages;
      }

      // Handle date filters
      if (args.fromDate) {
        try {
          searchOptions.fromDate = new Date(args.fromDate);
        } catch (error) {
          throw new Error(`Invalid fromDate format: ${args.fromDate}. Use ISO format (YYYY-MM-DD)`);
        }
      }

      if (args.toDate) {
        try {
          searchOptions.toDate = new Date(args.toDate);
        } catch (error) {
          throw new Error(`Invalid toDate format: ${args.toDate}. Use ISO format (YYYY-MM-DD)`);
        }
      }

      // Add domain filters
      if (args.includeDomains && args.includeDomains.length > 0) {
        searchOptions.include_domains = args.includeDomains;
      }

      if (args.excludeDomains && args.excludeDomains.length > 0) {
        searchOptions.exclude_domains = args.excludeDomains;
      }

      const startTime = Date.now();
      const result = await this.linkupClient.search(searchOptions);
      const responseTime = Date.now() - startTime;

      // Process the response based on output type
      let processedResult;
      
      switch (args.outputType) {
        case 'sourcedAnswer':
          processedResult = this.processSourcedAnswer(result);
          break;
        case 'searchResults':
          processedResult = this.processSearchResults(result);
          break;
        case 'structuredOutput':
          processedResult = this.processStructuredOutput(result);
          break;
        default:
          processedResult = result;
      }

      return {
        success: true,
        query: args.query,
        depth: args.depth,
        outputType: args.outputType,
        result: processedResult,
        responseTime: responseTime,
        searchTime: new Date().toISOString(),
        searchOptions: searchOptions
      };

    } catch (error: unknown) {
      console.error("❌ Linkup search failed:", error);
      return {
        success: false,
        error: `Linkup search failed: ${error instanceof Error ? error.message : String(error)}`,
        query: args.query,
        depth: args.depth,
        outputType: args.outputType
      };
    }
  }

  private processSourcedAnswer(result: any): any {
    return {
      answer: result.answer || result.response || '',
      sources: result.sources || [],
      images: result.images || [],
      metadata: {
        confidence: result.confidence,
        totalSources: result.sources?.length || 0
      }
    };
  }

  private processSearchResults(result: any): any {
    const results = result.results || [];
    return {
      results: results.map((item: any) => ({
        title: item.title || '',
        url: item.url || '',
        snippet: item.snippet || item.content || '',
        publishedDate: item.published_date || item.date,
        source: item.source || '',
        relevanceScore: item.score
      })),
      totalResults: results.length,
      images: result.images || []
    };
  }

  private processStructuredOutput(result: any): any {
    return {
      structuredData: result.structuredOutput || result.data || result,
      schema: result.schema,
      metadata: {
        processingTime: result.processingTime,
        dataPoints: result.dataPoints
      }
    };
  }

  // Convenience methods for different search types
  async searchStandard(query: string, options: any = {}): Promise<any> {
    return this.executeSearch({
      query,
      depth: 'standard',
      outputType: 'sourcedAnswer',
      ...options
    });
  }

  async searchDeep(query: string, options: any = {}): Promise<any> {
    return this.executeSearch({
      query,
      depth: 'deep',
      outputType: 'sourcedAnswer',
      ...options
    });
  }

  async searchResults(query: string, depth: 'standard' | 'deep' = 'standard', options: any = {}): Promise<any> {
    return this.executeSearch({
      query,
      depth,
      outputType: 'searchResults',
      ...options
    });
  }

  async searchStructured(query: string, schema: string, depth: 'standard' | 'deep' = 'deep', options: any = {}): Promise<any> {
    return this.executeSearch({
      query,
      depth,
      outputType: 'structuredOutput',
      structuredOutputSchema: schema,
      ...options
    });
  }

  // Legacy method for backward compatibility
  async search(query: string, options: any = {}): Promise<any> {
    return this.executeSearch({ 
      query, 
      depth: options.depth || 'standard',
      outputType: options.outputType || 'sourcedAnswer',
      ...options 
    });
  }
}