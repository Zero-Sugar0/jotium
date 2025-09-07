import { FunctionDeclaration, Type } from "@google/genai";

export class LangSearchTool {
  private baseUrl: string = "https://api.langsearch.com/v1";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "langsearch_search",
      description: "Search using LangSearch's hybrid semantic search engine. Provides enhanced web results with AI-powered summaries, semantic reranking, and hybrid keyword+vector search for high-quality, contextually relevant results.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: {
            type: Type.STRING,
            description: "The search query to find information about"
          },
          freshness: {
            type: Type.STRING,
            description: "Freshness filter for results: 'noLimit' (default), 'oneYear', 'oneMonth', 'oneWeek', 'oneDay'"
          },
          summary: {
            type: Type.BOOLEAN,
            description: "Generate AI summary of search results with markdown formatting (default: true)"
          },
          count: {
            type: Type.NUMBER,
            description: "Maximum number of search results to return (default: 10, max: 10 based on API docs)"
          },
          includeImages: {
            type: Type.BOOLEAN,
            description: "Include image results in search (default: false)"
          },
          includeVideos: {
            type: Type.BOOLEAN,
            description: "Include video results in search (default: false)"
          },
          region: {
            type: Type.STRING,
            description: "Geographic region for localized results (e.g., 'US', 'GB', 'DE')"
          },
          language: {
            type: Type.STRING,
            description: "Language preference for results (e.g., 'en', 'es', 'fr')"
          },
          semanticRerank: {
            type: Type.BOOLEAN,
            description: "Apply semantic reranking for better relevance (default: true)"
          },
          topN: {
            type: Type.NUMBER,
            description: "Number of top results to semantically rerank (default: 10, max: 50)"
          }
        },
        required: ["query"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`🔍 LangSearch searching: "${args.query}"`);

      // Perform web search first
      const searchResults = await this.performWebSearch(args);
      
      // Optionally apply semantic reranking if enabled and we have results
      let rerankedResults = searchResults;
      if (args.semanticRerank !== false && searchResults.webResults?.length > 0) {
        rerankedResults = await this.applySemanticReranking(args, searchResults);
      }

      return {
        success: true,
        query: args.query,
        searchTime: new Date().toISOString(),
        ...rerankedResults,
        source: "LangSearch",
        features: {
          hybridSearch: true,
          semanticReranking: args.semanticRerank !== false,
          aiSummary: args.summary !== false
        }
      };

    } catch (error: unknown) {
      console.error("❌ LangSearch search failed:", error);
      return {
        success: false,
        error: `LangSearch search failed: ${error instanceof Error ? error.message : String(error)}`,
        query: args.query
      };
    }
  }

  private async performWebSearch(args: any): Promise<any> {
    const requestBody = {
      query: args.query,
      freshness: args.freshness || "noLimit",
      summary: args.summary !== false,
      count: Math.min(args.count || 10, 10), // API max is 10, not 100
      includeImages: args.includeImages || false,
      includeVideos: args.includeVideos || false,
      ...(args.region && { region: args.region }),
      ...(args.language && { language: args.language })
    };

    const response = await fetch(`${this.baseUrl}/web-search`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "LangSearchTool/1.0"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    // Handle the correct response structure from API docs
    if (result.code !== 200) {
      throw new Error(`API Error ${result.code}: ${result.msg || 'Unknown error'}`);
    }

    const data = result.data;

    return {
      summary: data.summary || null,
      webResults: data.webPages?.value?.map((item: any, index: number) => ({
        title: item.name,
        url: item.url,
        snippet: item.snippet,
        summary: item.summary,
        publishedDate: item.datePublished,
        lastCrawled: item.dateLastCrawled,
        position: index + 1,
        score: item.score || null
      })) || [],
      imageResults: data.images?.map((item: any, index: number) => ({
        title: item.title,
        url: item.url,
        imageUrl: item.image_url,
        source: item.source,
        position: index + 1
      })) || [],
      videoResults: data.videos?.map((item: any, index: number) => ({
        title: item.title,
        url: item.url,
        thumbnailUrl: item.thumbnail_url,
        duration: item.duration,
        source: item.source,
        position: index + 1
      })) || [],
      relatedQueries: data.related_queries || [],
      resultsCount: data.webPages?.value?.length || 0,
      totalEstimated: data.webPages?.totalEstimatedMatches || null
    };
  }

  private async applySemanticReranking(args: any, searchResults: any): Promise<any> {
    try {
      // Extract text content from web results for reranking
      const documents = searchResults.webResults?.map((result: any) => 
        `${result.title}\n${result.snippet || ''}`
      ) || [];

      if (documents.length === 0) {
        return searchResults;
      }

      const rerankRequestBody = {
        model: "langsearch-reranker-v1",
        query: args.query,
        top_n: Math.min(args.topN || 10, Math.min(documents.length, 50)), // Max 50 documents
        return_documents: true,
        documents: documents.slice(0, 50) // Ensure we don't exceed 50 documents
      };

      const response = await fetch(`${this.baseUrl}/rerank`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "LangSearchTool/1.0"
        },
        body: JSON.stringify(rerankRequestBody)
      });

      if (!response.ok) {
        console.warn("Semantic reranking failed, using original results");
        return searchResults;
      }

      const rerankResult = await response.json();

      // Handle API response structure
      if (rerankResult.code !== 200) {
        console.warn("Semantic reranking API error:", rerankResult.msg);
        return searchResults;
      }

      // Map reranked results back to original search results
      const rerankedWebResults = rerankResult.results?.map((item: any) => {
        const originalResult = searchResults.webResults[item.index];
        return {
          ...originalResult,
          semanticScore: item.relevance_score,
          reranked: true,
          originalPosition: originalResult.position,
          position: item.index + 1
        };
      }) || searchResults.webResults;

      return {
        ...searchResults,
        webResults: rerankedWebResults,
        semanticReranking: {
          applied: true,
          model: "langsearch-reranker-v1",
          rerankedCount: rerankResult.results?.length || 0,
          avgScore: rerankResult.results?.reduce((sum: number, item: any) => 
            sum + (item.relevance_score || 0), 0) / (rerankResult.results?.length || 1)
        }
      };

    } catch (error) {
      console.warn("Semantic reranking failed:", error);
      return searchResults;
    }
  }

  // Additional utility method for standalone semantic reranking
  async rerank(query: string, documents: string[], options?: {
    topN?: number;
    model?: string;
    returnDocuments?: boolean;
  }): Promise<any> {
    try {
      const requestBody = {
        model: options?.model || "langsearch-reranker-v1",
        query: query,
        top_n: options?.topN || Math.min(10, documents.length),
        return_documents: options?.returnDocuments !== false,
        documents: documents.slice(0, 50) // Ensure max 50 documents
      };

      const response = await fetch(`${this.baseUrl}/rerank`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "LangSearchTool/1.0"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();

      // Handle API response structure
      if (result.code !== 200) {
        throw new Error(`API Error ${result.code}: ${result.msg || 'Unknown error'}`);
      }

      return {
        success: true,
        query: query,
        rerankedResults: result.results?.map((item: any) => ({
          document: item.document,
          relevanceScore: item.relevance_score,
          originalIndex: item.index,
          rank: item.index + 1
        })) || [],
        model: requestBody.model,
        processedCount: documents.length,
        returnedCount: result.results?.length || 0
      };

    } catch (error: unknown) {
      console.error("❌ LangSearch rerank failed:", error);
      return {
        success: false,
        error: `LangSearch rerank failed: ${error instanceof Error ? error.message : String(error)}`,
        query: query
      };
    }
  }

  // Utility method to validate API key
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/web-search`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: "test",
          count: 1
        })
      });

      return response.status !== 401 && response.status !== 403;
    } catch (error) {
      return false;
    }
  }
}