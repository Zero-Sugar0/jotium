import { FunctionDeclaration, Type } from "@google/genai";

export class JinaTool {
  private readerBaseUrl: string = "https://r.jina.ai";
  private searchBaseUrl: string = "https://s.jina.ai";
  private apiBaseUrl: string = "https://api.jina.ai/v1";
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "jina_ai_service",
      description: "Access Jina AI's comprehensive suite of tools including Reader API for URL content extraction, Search API for web searching, Reranker API for result relevancy, and Embeddings API. Supports multimodal content, image captioning, PDF reading, streaming responses, and advanced filtering.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          service: {
            type: Type.STRING,
            description: "Jina AI service to use: 'reader' (convert URL to LLM-friendly content), 'search' (web search), 'rerank' (rerank documents), 'embeddings' (generate embeddings)"
          },
          // Reader API parameters
          url: {
            type: Type.STRING,
            description: "URL to read/convert (required for reader service)"
          },
          // Search API parameters
          query: {
            type: Type.STRING,
            description: "Search query (required for search service)"
          },
          site: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Restrict search to specific domains/websites (for search service)"
          },
          // Common parameters for Reader and Search
          responseFormat: {
            type: Type.STRING,
            description: "Response format: 'text' (default), 'markdown', 'html', 'json', 'streaming'"
          },
          withGeneratedAlt: {
            type: Type.BOOLEAN,
            description: "Enable image captioning with VLM (default: false)"
          },
          noCache: {
            type: Type.BOOLEAN,
            description: "Bypass cached results (default: false)"
          },
          cacheTolerance: {
            type: Type.NUMBER,
            description: "Cache tolerance in seconds (default uses system default)"
          },
          timeout: {
            type: Type.NUMBER,
            description: "Request timeout in seconds"
          },
          // Reader-specific parameters
          setCookie: {
            type: Type.STRING,
            description: "Forward cookies for authentication (reader only)"
          },
          proxyUrl: {
            type: Type.STRING,
            description: "Proxy server URL (reader only)"
          },
          targetSelector: {
            type: Type.STRING,
            description: "CSS selector to focus on specific page content (reader only)"
          },
          waitForSelector: {
            type: Type.STRING,
            description: "CSS selector to wait for before capturing content (reader only)"
          },
          screenshot: {
            type: Type.BOOLEAN,
            description: "Return webpage screenshot URL instead of content (reader only)"
          },
          // Reranker API parameters
          documents: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                title: { type: Type.STRING }
              }
            },
            description: "Array of documents to rerank (required for rerank service)"
          },
          topN: {
            type: Type.NUMBER,
            description: "Number of top results to return (rerank service, default: 10)"
          },
          model: {
            type: Type.STRING,
            description: "Model to use for reranking: 'jina-reranker-v2-base-multilingual' (default), 'jina-reranker-v1-base-en', 'jina-reranker-v1-turbo-en'"
          },
          // Embeddings API parameters
          input: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of texts to embed (required for embeddings service)"
          },
          embeddingType: {
            type: Type.STRING,
            description: "Embedding type: 'float' (default), 'base64', 'binary', 'ubinary'"
          },
          task: {
            type: Type.STRING,
            description: "Task type for embeddings: 'retrieval.query', 'retrieval.passage', 'text-matching', 'classification'"
          },
          dimensions: {
            type: Type.NUMBER,
            description: "Output embedding dimensions (model dependent)"
          },
          late_chunking: {
            type: Type.BOOLEAN,
            description: "Enable late chunking for better performance on long texts"
          },
          // Advanced parameters
          maxQueryLength: {
            type: Type.NUMBER,
            description: "Maximum query length for chunking (rerank service)"
          },
          maxLength: {
            type: Type.NUMBER,
            description: "Maximum document length for chunking (rerank service)"
          },
          overlap: {
            type: Type.NUMBER,
            description: "Overlap between adjacent chunks (rerank service, default: 80)"
          }
        },
        required: ["service"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`🔍 Jina AI ${args.service}: Processing request`);

      switch (args.service) {
        case 'reader':
          return await this.executeReader(args);
        case 'search':
          return await this.executeSearch(args);
        case 'rerank':
          return await this.executeRerank(args);
        case 'embeddings':
          return await this.executeEmbeddings(args);
        default:
          throw new Error(`Unsupported service: ${args.service}. Available services: reader, search, rerank, embeddings`);
      }

    } catch (error: unknown) {
      console.error("❌ Jina AI service failed:", error);
      return {
        success: false,
        error: `Jina AI ${args.service} failed: ${error instanceof Error ? error.message : String(error)}`,
        service: args.service
      };
    }
  }

  private async executeReader(args: any): Promise<any> {
    if (!args.url) {
      throw new Error("URL is required for reader service");
    }

    const headers: Record<string, string> = {
      "User-Agent": "JinaTool/1.0"
    };

    // Set headers based on parameters
    if (args.withGeneratedAlt) {
      headers["X-With-Generated-Alt"] = "true";
    }
    if (args.setCookie) {
      headers["X-Set-Cookie"] = args.setCookie;
    }
    if (args.proxyUrl) {
      headers["X-Proxy-Url"] = args.proxyUrl;
    }
    if (args.targetSelector) {
      headers["X-Target-Selector"] = args.targetSelector;
    }
    if (args.waitForSelector) {
      headers["X-Wait-For-Selector"] = args.waitForSelector;
    }
    if (args.noCache) {
      headers["X-No-Cache"] = "true";
    }
    if (args.cacheTolerance) {
      headers["X-Cache-Tolerance"] = args.cacheTolerance.toString();
    }
    if (args.timeout) {
      headers["X-Timeout"] = args.timeout.toString();
    }

    // Set response format
    if (args.responseFormat === 'json') {
      headers["Accept"] = "application/json";
    } else if (args.responseFormat === 'streaming') {
      headers["Accept"] = "text/event-stream";
    }

    // Handle screenshot mode
    if (args.screenshot) {
      headers["X-Respond-With"] = "screenshot";
    } else if (args.responseFormat === 'markdown') {
      headers["X-Respond-With"] = "markdown";
    } else if (args.responseFormat === 'html') {
      headers["X-Respond-With"] = "html";
    } else if (args.responseFormat === 'text') {
      headers["X-Respond-With"] = "text";
    }

    const response = await fetch(`${this.readerBaseUrl}/${args.url}`, {
      method: "GET",
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    let content;
    if (args.responseFormat === 'json') {
      content = await response.json();
    } else if (args.responseFormat === 'streaming') {
      content = await response.text(); // In practice, you'd handle the stream
    } else {
      content = await response.text();
    }

    return {
      success: true,
      service: "reader",
      url: args.url,
      content: content,
      timestamp: new Date().toISOString(),
      features: {
        imageCaption: !!args.withGeneratedAlt,
        proxy: !!args.proxyUrl,
        targetSelector: !!args.targetSelector,
        streaming: args.responseFormat === 'streaming'
      }
    };
  }

  private async executeSearch(args: any): Promise<any> {
    if (!args.query) {
      throw new Error("Query is required for search service");
    }

    const headers: Record<string, string> = {
      "User-Agent": "JinaTool/1.0"
    };

    // Set response format
    if (args.responseFormat === 'json') {
      headers["Accept"] = "application/json";
    } else if (args.responseFormat === 'streaming') {
      headers["Accept"] = "text/event-stream";
    }

    if (args.withGeneratedAlt) {
      headers["X-With-Generated-Alt"] = "true";
    }
    if (args.noCache) {
      headers["X-No-Cache"] = "true";
    }
    if (args.cacheTolerance) {
      headers["X-Cache-Tolerance"] = args.cacheTolerance.toString();
    }

    // Build URL with query parameters
    const searchParams = new URLSearchParams();
    if (args.site && Array.isArray(args.site)) {
      args.site.forEach((s: string) => searchParams.append('site', s));
    }

    const queryParam = encodeURIComponent(args.query);
    const searchUrl = `${this.searchBaseUrl}/${queryParam}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

    const response = await fetch(searchUrl, {
      method: "GET",
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    let content;
    if (args.responseFormat === 'json') {
      content = await response.json();
    } else {
      content = await response.text();
    }

    return {
      success: true,
      service: "search",
      query: args.query,
      results: content,
      timestamp: new Date().toISOString(),
      searchParameters: {
        sites: args.site,
        format: args.responseFormat || 'text'
      }
    };
  }

  private async executeRerank(args: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error("API key is required for rerank service");
    }
    if (!args.query) {
      throw new Error("Query is required for rerank service");
    }
    if (!args.documents || !Array.isArray(args.documents)) {
      throw new Error("Documents array is required for rerank service");
    }

    const requestBody = {
      model: args.model || "jina-reranker-v2-base-multilingual",
      query: args.query,
      documents: args.documents.map((doc: any) => 
        typeof doc === 'string' ? doc : (doc.text || doc.title || JSON.stringify(doc))
      ),
      top_n: args.topN || 10,
      ...(args.maxQueryLength && { max_query_length: args.maxQueryLength }),
      ...(args.maxLength && { max_length: args.maxLength }),
      ...(args.overlap && { overlap: args.overlap })
    };

    const response = await fetch(`${this.apiBaseUrl}/rerank`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
        "User-Agent": "JinaTool/1.0"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    return {
      success: true,
      service: "rerank",
      query: args.query,
      model: requestBody.model,
      results: result.results || result,
      timestamp: new Date().toISOString(),
      parameters: {
        topN: requestBody.top_n,
        documentsCount: args.documents.length
      }
    };
  }

  private async executeEmbeddings(args: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error("API key is required for embeddings service");
    }
    if (!args.input || !Array.isArray(args.input)) {
      throw new Error("Input array is required for embeddings service");
    }

    const requestBody = {
      model: args.model || "jina-embeddings-v3",
      input: args.input,
      encoding_format: args.embeddingType || "float",
      ...(args.task && { task: args.task }),
      ...(args.dimensions && { dimensions: args.dimensions }),
      ...(args.late_chunking && { late_chunking: args.late_chunking })
    };

    const response = await fetch(`${this.apiBaseUrl}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
        "User-Agent": "JinaTool/1.0"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    return {
      success: true,
      service: "embeddings",
      model: requestBody.model,
      data: result.data || result,
      usage: result.usage,
      timestamp: new Date().toISOString(),
      parameters: {
        inputCount: args.input.length,
        encodingFormat: requestBody.encoding_format,
        task: args.task,
        dimensions: args.dimensions
      }
    };
  }

  // Utility method to validate API key
  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "jina-embeddings-v3",
          input: ["test"]
        })
      });

      return response.status !== 401;
    } catch (error) {
      return false;
    }
  }

  // Utility method to get account info
  async getAccountInfo(): Promise<any> {
    if (!this.apiKey) {
      return {
        success: false,
        error: "API key is required"
      };
    }

    try {
      // Test with a minimal request
      const response = await fetch(`${this.apiBaseUrl}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "jina-embeddings-v3",
          input: ["test"]
        })
      });

      if (response.status === 401) {
        return {
          success: false,
          error: "Invalid API key"
        };
      }

      return {
        success: true,
        message: "API key is valid and active",
        services: {
          reader: "Available without API key",
          search: "Available without API key", 
          rerank: "Requires API key",
          embeddings: "Requires API key"
        },
        recommendations: [
          "Check your dashboard at jina.ai for detailed usage statistics",
          "Monitor your API usage to avoid rate limits",
          "Use Reader and Search APIs without authentication for basic needs"
        ]
      };

    } catch (error: unknown) {
      return {
        success: false,
        error: `Account validation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Utility method for bulk URL reading
  async readMultipleUrls(urls: string[], options?: any): Promise<any> {
    const results = await Promise.allSettled(
      urls.map(url => this.execute({ service: 'reader', url, ...options }))
    );

    return {
      success: true,
      service: "reader-bulk",
      results: results.map((result, index) => ({
        url: urls[index],
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : undefined,
        error: result.status === 'rejected' ? result.reason?.message : undefined
      })),
      timestamp: new Date().toISOString(),
      summary: {
        total: urls.length,
        successful: results.filter(r => r.status === 'fulfilled').length,
        failed: results.filter(r => r.status === 'rejected').length
      }
    };
  }

  // Utility method for search with automatic result reading
  async deepSearch(query: string, options?: any): Promise<any> {
    try {
      // First perform search
      const searchResult = await this.execute({
        service: 'search',
        query,
        responseFormat: 'json',
        ...options
      });

      if (!searchResult.success) {
        return searchResult;
      }

      // Extract URLs from search results if available
      let urls: string[] = [];
      if (Array.isArray(searchResult.results)) {
        urls = searchResult.results
          .map((result: any) => result.url)
          .filter((url: string) => url)
          .slice(0, 5); // Limit to top 5 results
      }

      // Read content from each URL
      const readResults = urls.length > 0 ? 
        await this.readMultipleUrls(urls, { responseFormat: 'markdown' }) : 
        { results: [] };

      return {
        success: true,
        service: "deep-search",
        query,
        searchResults: searchResult,
        contentResults: readResults,
        timestamp: new Date().toISOString(),
        summary: {
          searchResultsFound: Array.isArray(searchResult.results) ? searchResult.results.length : 0,
          urlsProcessed: urls.length,
          successfulReads: readResults.results?.filter((r: any) => r.success).length || 0
        }
      };

    } catch (error: unknown) {
      return {
        success: false,
        error: `Deep search failed: ${error instanceof Error ? error.message : String(error)}`,
        query
      };
    }
  }
}