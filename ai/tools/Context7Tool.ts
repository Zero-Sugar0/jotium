import { FunctionDeclaration, Type } from "@google/genai";

export class Context7Tool {
  private baseUrl: string = "https://mcp.context7.com";

  constructor() {
    // Context7 doesn't require API key for HTTP endpoint
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "context7_docs",
      description: "Access real-time, version-specific documentation and code examples for programming libraries through Context7's intelligent documentation platform. Get accurate, current information directly from official sources instead of relying on potentially outdated training data. Perfect for developers who need reliable, up-to-date library documentation, API references, code examples, and implementation guides. Supports popular libraries across multiple programming languages and frameworks with automatic version detection and comprehensive coverage.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "Action to perform: 'resolve' to find library ID by searching for library names, 'get-docs' to fetch documentation using an exact library ID, or 'search-and-get' to automatically resolve the library ID and fetch documentation in one call. Use 'search-and-get' for the most convenient experience when you know the library name but not the exact ID."
          },
          libraryName: {
            type: Type.STRING,
            description: "Name of the library to search for (used with 'resolve' or 'search-and-get' actions). Examples: 'react', 'express', 'mongodb', 'next.js', 'vue', 'django', 'spring-boot'. Use the common name of the library or framework you need documentation for."
          },
          context7CompatibleLibraryID: {
            type: Type.STRING,
            description: "Exact Context7-compatible library ID (e.g., '/mongodb/docs', '/vercel/next.js', '/react/react', '/express/express') - used with 'get-docs' action. You can get this ID by first using the 'resolve' action with your library name."
          },
          topic: {
            type: Type.STRING,
            description: "Optional: Focus the documentation on a specific topic or feature. Examples: 'routing', 'hooks', 'authentication', 'middleware', 'database', 'forms', 'state-management', 'testing', 'deployment'. Helps narrow down large documentation to relevant sections."
          },
          tokens: {
            type: Type.NUMBER,
            description: "Optional: Maximum number of tokens to return (default: 10000, minimum: 10000). Higher values provide more comprehensive documentation but use more tokens. Use 10000-20000 for focused topics, 30000+ for comprehensive library documentation."
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`📚 Context7 ${args.action}: "${args.libraryName || args.context7CompatibleLibraryID}"`);

      switch (args.action) {
        case 'resolve':
          return await this.resolveLibraryId(args);
        case 'get-docs':
          return await this.getLibraryDocs(args);
        case 'search-and-get':
          return await this.searchAndGetDocs(args);
        default:
          throw new Error(`Invalid action: ${args.action}. Use 'resolve', 'get-docs', or 'search-and-get'`);
      }
    } catch (error: unknown) {
      console.error("❌ Context7 request failed:", error);
      return {
        success: false,
        error: `Context7 request failed: ${error instanceof Error ? error.message : String(error)}`,
        action: args.action,
        query: args.libraryName || args.context7CompatibleLibraryID
      };
    }
  }

  private async resolveLibraryId(args: any): Promise<any> {
    if (!args.libraryName) {
      throw new Error("libraryName is required for resolve action");
    }

    const response = await this.makeRequest("resolve-library-id", {
      libraryName: args.libraryName
    });

    return {
      success: true,
      action: "resolve",
      libraryName: args.libraryName,
      resolvedLibraries: response.resolvedLibraries || [],
      suggestions: response.suggestions || [],
      exactMatch: response.exactMatch || null,
      timestamp: new Date().toISOString()
    };
  }

  private async getLibraryDocs(args: any): Promise<any> {
    if (!args.context7CompatibleLibraryID) {
      throw new Error("context7CompatibleLibraryID is required for get-docs action");
    }

    const requestParams: any = {
      context7CompatibleLibraryID: args.context7CompatibleLibraryID
    };

    if (args.topic) {
      requestParams.topic = args.topic;
    }

    if (args.tokens) {
      requestParams.tokens = Math.max(args.tokens, 10000); // Minimum 10000 tokens
    }

    const response = await this.makeRequest("get-library-docs", requestParams);

    return {
      success: true,
      action: "get-docs",
      libraryId: args.context7CompatibleLibraryID,
      topic: args.topic || null,
      documentation: response.documentation || "",
      codeExamples: response.codeExamples || [],
      apiReference: response.apiReference || [],
      metadata: {
        library: response.library || {},
        version: response.version || null,
        lastUpdated: response.lastUpdated || null,
        source: response.source || null
      },
      relatedTopics: response.relatedTopics || [],
      tokensUsed: response.tokensUsed || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async searchAndGetDocs(args: any): Promise<any> {
    if (!args.libraryName) {
      throw new Error("libraryName is required for search-and-get action");
    }

    // First resolve the library ID
    const resolveResult = await this.resolveLibraryId(args);
    
    if (!resolveResult.success || !resolveResult.exactMatch) {
      return {
        success: false,
        action: "search-and-get",
        error: "Could not resolve library to exact match",
        libraryName: args.libraryName,
        resolveResult: resolveResult,
        suggestions: resolveResult.suggestions || [],
        timestamp: new Date().toISOString()
      };
    }

    // Then get the docs using the resolved ID
    const docsArgs = {
      ...args,
      context7CompatibleLibraryID: resolveResult.exactMatch,
      action: "get-docs"
    };

    const docsResult = await this.getLibraryDocs(docsArgs);

    return {
      success: true,
      action: "search-and-get",
      libraryName: args.libraryName,
      resolvedLibraryId: resolveResult.exactMatch,
      topic: args.topic || null,
      documentation: docsResult.documentation || "",
      codeExamples: docsResult.codeExamples || [],
      apiReference: docsResult.apiReference || [],
      metadata: docsResult.metadata || {},
      relatedTopics: docsResult.relatedTopics || [],
      tokensUsed: docsResult.tokensUsed || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async makeRequest(tool: string, params: any): Promise<any> {
    const requestPayload = {
      method: "tools/call",
      params: {
        name: tool,
        arguments: params
      }
    };

    const response = await fetch(`${this.baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // Handle MCP response format
    if (result.error) {
      throw new Error(result.error.message || "MCP server error");
    }

    return result.result || result;
  }

  // Utility methods for common operations
  async searchLibrary(libraryName: string): Promise<string[]> {
    const result = await this.resolveLibraryId({ libraryName });
    return result.success ? result.suggestions : [];
  }

  async getQuickDocs(libraryName: string, topic?: string): Promise<string> {
    const result = await this.searchAndGetDocs({ 
      libraryName, 
      topic,
      tokens: 15000 
    });
    return result.success ? result.documentation : result.error;
  }

  async getCodeExamples(libraryId: string, topic?: string): Promise<any[]> {
    const result = await this.getLibraryDocs({ 
      context7CompatibleLibraryID: libraryId,
      topic 
    });
    return result.success ? result.codeExamples : [];
  }

  // Helper method to format results for display
  formatDocumentation(result: any): string {
    if (!result.success) {
      return `Error: ${result.error}`;
    }

    let formatted = `# ${result.metadata?.library?.name || 'Documentation'}\n\n`;
    
    if (result.metadata?.version) {
      formatted += `**Version:** ${result.metadata.version}\n`;
    }
    
    if (result.topic) {
      formatted += `**Topic:** ${result.topic}\n`;
    }
    
    formatted += `**Last Updated:** ${result.metadata?.lastUpdated || 'Unknown'}\n\n`;
    
    if (result.documentation) {
      formatted += `## Documentation\n${result.documentation}\n\n`;
    }
    
    if (result.codeExamples && result.codeExamples.length > 0) {
      formatted += `## Code Examples\n`;
      result.codeExamples.forEach((example: any, index: number) => {
        formatted += `### Example ${index + 1}\n`;
        formatted += `\`\`\`${example.language || 'javascript'}\n${example.code}\n\`\`\`\n`;
        if (example.description) {
          formatted += `${example.description}\n`;
        }
        formatted += '\n';
      });
    }
    
    if (result.relatedTopics && result.relatedTopics.length > 0) {
      formatted += `## Related Topics\n`;
      formatted += result.relatedTopics.map((topic: string) => `- ${topic}`).join('\n');
      formatted += '\n\n';
    }
    
    return formatted;
  }
}
