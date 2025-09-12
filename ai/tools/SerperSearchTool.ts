import { FunctionDeclaration, Type } from "@google/genai";

export class SerperSearchTool {
  private apiKey: string;
  private baseUrl: string = "https://google.serper.dev";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "serper_search",
      description: "Advanced Google search API powered by Serper.dev that provides comprehensive search capabilities across multiple content types. Access web results, images, places, news, shopping, and videos with intelligent filtering and localization. Perfect for research automation, content discovery, competitive analysis, local business intelligence, news monitoring, and visual content search. Supports geolocation targeting, language preferences, time-based filtering, and safe search controls for precise, relevant results.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: {
            type: Type.STRING,
            description: "Search query to find information about. Use natural language or keywords for best results. Examples: 'latest AI developments 2025', 'best restaurants near me', 'machine learning tutorials', 'company sustainability reports'. Supports complex queries with operators for precise results."
          },
          searchType: {
            type: Type.STRING,
            description: "Content type to search: 'search' (web pages with snippets, answer boxes, related searches), 'images' (photos with metadata and thumbnails), 'places' (local businesses with ratings, addresses, contact info), 'news' (recent articles with dates and sources), 'shopping' (products with prices, ratings, delivery info), 'videos' (video content with duration, channels, thumbnails). Default: 'search' for general web results."
          },
          num: {
            type: Type.NUMBER,
            description: "Maximum number of results to return (default: 10, max: 100). Higher values provide more comprehensive data but may increase response time. Consider your needs vs. processing speed when setting this value."
          },
          gl: {
            type: Type.STRING,
            description: "Country code for geolocation targeting (e.g., 'us' for United States, 'uk' for United Kingdom, 'ca' for Canada, 'de' for Germany). Use to get region-specific results, local businesses, or country-relevant content. Essential for local SEO research and market analysis."
          },
          hl: {
            type: Type.STRING,
            description: "Language code for result localization (e.g., 'en' for English, 'es' for Spanish, 'fr' for French, 'de' for German). Ensures results are in the specified language and culturally appropriate for the target audience."
          },
          location: {
            type: Type.STRING,
            description: "Geographic location for local search (e.g., 'New York, NY', 'London, UK', 'Tokyo, Japan'). Primarily used with 'places' search type to find businesses, restaurants, services in specific areas. Format: 'City, State/Country' for best results."
          },
          tbs: {
            type: Type.STRING,
            description: "Time-based search filters to narrow results by date. Common formats: 'qdr:d' (past 24 hours), 'qdr:w' (past week), 'qdr:m' (past month), 'qdr:y' (past year). Useful for finding recent news, updates, or time-sensitive information. Combine with other filters for precise temporal targeting."
          },
          safe: {
            type: Type.STRING,
            description: "Safe search content filtering: 'active' (filters adult content, default), 'off' (includes all content). Use 'active' for family-friendly applications, educational tools, or professional research. Disable only when specifically requiring unrestricted access."
          }
        },
        required: ["query"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`🔍 Serper searching (${args.searchType || 'web'}): "${args.query}"`);

      const searchType = args.searchType || 'search';
      const endpoint = `${this.baseUrl}/${searchType}`;

      const requestBody: any = {
        q: args.query,
        num: Math.min(args.num || 10, 100)
      };

      // Add optional parameters if provided
      if (args.gl) requestBody.gl = args.gl;
      if (args.hl) requestBody.hl = args.hl;
      if (args.location) requestBody.location = args.location;
      if (args.tbs) requestBody.tbs = args.tbs;
      if (args.safe) requestBody.safe = args.safe;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Process different types of results
      const processedResult: any = {
        success: true,
        query: args.query,
        searchType: searchType,
        searchTime: new Date().toISOString()
      };

      // Handle different search types
      switch (searchType) {
        case 'search':
          processedResult.organic = result.organic?.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            date: item.date,
            position: item.position
          })) || [];
          
          processedResult.answerBox = result.answerBox || null;
          processedResult.peopleAlsoAsk = result.peopleAlsoAsk || [];
          processedResult.relatedSearches = result.relatedSearches || [];
          processedResult.knowledgeGraph = result.knowledgeGraph || null;
          break;

        case 'images':
          processedResult.images = result.images?.map((item: any) => ({
            title: item.title,
            imageUrl: item.imageUrl,
            imageWidth: item.imageWidth,
            imageHeight: item.imageHeight,
            thumbnailUrl: item.thumbnailUrl,
            source: item.source,
            link: item.link
          })) || [];
          break;

        case 'places':
          processedResult.places = result.places?.map((item: any) => ({
            title: item.title,
            address: item.address,
            latitude: item.latitude,
            longitude: item.longitude,
            rating: item.rating,
            ratingCount: item.ratingCount,
            category: item.category,
            phoneNumber: item.phoneNumber,
            website: item.website,
            cid: item.cid
          })) || [];
          break;

        case 'news':
          processedResult.news = result.news?.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            date: item.date,
            source: item.source,
            imageUrl: item.imageUrl
          })) || [];
          break;

        case 'shopping':
          processedResult.shopping = result.shopping?.map((item: any) => ({
            title: item.title,
            price: item.price,
            source: item.source,
            link: item.link,
            imageUrl: item.imageUrl,
            rating: item.rating,
            ratingCount: item.ratingCount,
            delivery: item.delivery
          })) || [];
          break;

        case 'videos':
          processedResult.videos = result.videos?.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            date: item.date,
            source: item.source,
            channel: item.channel,
            duration: item.duration,
            imageUrl: item.imageUrl
          })) || [];
          break;
      }

      processedResult.resultsCount = this.getResultCount(processedResult, searchType);
      return processedResult;

    } catch (error: unknown) {
      console.error("❌ Serper search failed:", error);
      return {
        success: false,
        error: `Serper search failed: ${error instanceof Error ? error.message : String(error)}`,
        query: args.query,
        searchType: args.searchType || 'search'
      };
    }
  }

  private getResultCount(result: any, searchType: string): number {
    switch (searchType) {
      case 'search':
        return result.organic?.length || 0;
      case 'images':
        return result.images?.length || 0;
      case 'places':
        return result.places?.length || 0;
      case 'news':
        return result.news?.length || 0;
      case 'shopping':
        return result.shopping?.length || 0;
      case 'videos':
        return result.videos?.length || 0;
      default:
        return 0;
    }
  }
}
