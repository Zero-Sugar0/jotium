import { FunctionDeclaration, Type } from "@google/genai";

export class SerpstackTool {
  private baseUrl: string = "https://api.serpstack.com";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "serpstack_search",
      description: "Search using Serpstack's real-time Google SERP API. Scrapes comprehensive Google search results including organic results, ads, images, videos, news, shopping, local results, knowledge graphs, and rich snippets with detailed parsing and structured data extraction.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: {
            type: Type.STRING,
            description: "The search query to find information about (supports Google advanced operators like intext:, site:, etc.)"
          },
          engine: {
            type: Type.STRING,
            description: "Search engine to use (default: 'google')"
          },
          type: {
            type: Type.STRING,
            description: "Google search category: 'web' (default), 'images', 'videos', 'news', or 'shopping'"
          },
          device: {
            type: Type.STRING,
            description: "Device type to simulate: 'desktop' (default), 'mobile', or 'tablet'"
          },
          location: {
            type: Type.STRING,
            description: "Geographic location for localized results (use canonical names from locations API)"
          },
          googleDomain: {
            type: Type.STRING,
            description: "Google domain to use (e.g., 'google.com', 'google.co.uk')"
          },
          gl: {
            type: Type.STRING,
            description: "Country code for geolocation (e.g., 'us', 'gb', 'de')"
          },
          hl: {
            type: Type.STRING,
            description: "Language code for interface language (e.g., 'en', 'es', 'fr')"
          },
          autoLocation: {
            type: Type.BOOLEAN,
            description: "Automatically set google_domain, gl, and hl based on location (default: true)"
          },
          safeSearch: {
            type: Type.BOOLEAN,
            description: "Enable Google SafeSearch filtering (default: false)"
          },
          page: {
            type: Type.NUMBER,
            description: "Page number of search results to retrieve (default: 1)"
          },
          num: {
            type: Type.NUMBER,
            description: "Number of organic results per page (default: 10, max: 100)"
          },
          period: {
            type: Type.STRING,
            description: "Time period filter: 'last_hour', 'last_day', 'last_week', 'last_month', 'last_year', or 'custom'"
          },
          periodStart: {
            type: Type.STRING,
            description: "Start date for custom period (YYYY-MM-DD format, requires period='custom')"
          },
          periodEnd: {
            type: Type.STRING,
            description: "End date for custom period (YYYY-MM-DD format, requires period='custom')"
          },
          sort: {
            type: Type.STRING,
            description: "Sort search results by: 'relevance' (default) or 'date'"
          },
          newsType: {
            type: Type.STRING,
            description: "For news searches: 'all' (default) or 'blogs'"
          },
          excludeAutocorrected: {
            type: Type.BOOLEAN,
            description: "Exclude autocorrected results (default: false)"
          },
          // Image-specific parameters
          imagesPage: {
            type: Type.NUMBER,
            description: "Page number for image results (default: 1)"
          },
          imagesColor: {
            type: Type.STRING,
            description: "Image color filter: 'any', 'black_and_white', 'transparent', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink', 'white', 'gray', 'black', 'brown'"
          },
          imagesSize: {
            type: Type.STRING,
            description: "Image size filter: 'large', 'medium', or 'icon'"
          },
          imagesType: {
            type: Type.STRING,
            description: "Image type filter: 'clipart', 'line_drawing', or 'gif'"
          },
          imagesUsage: {
            type: Type.STRING,
            description: "Image usage rights: 'reuse_with_modification', 'reuse', 'non_commercial_reuse_with_modification', or 'non_commercial_reuse'"
          },
          output: {
            type: Type.STRING,
            description: "Response format: 'json' (default) or 'csv'"
          },
          csvFields: {
            type: Type.STRING,
            description: "Comma-separated list of fields to include in CSV output (only when output='csv')"
          }
        },
        required: ["query"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`🔍 Serpstack searching: "${args.query}"`);

      const searchResults = await this.performSearch(args);

      return {
        success: true,
        query: args.query,
        searchTime: new Date().toISOString(),
        ...searchResults,
        source: "Serpstack",
        features: {
          realTimeResults: true,
          richSnippets: true,
          structuredData: true,
          geoTargeting: !!args.location,
          deviceSimulation: args.device || "desktop"
        }
      };

    } catch (error: unknown) {
      console.error("❌ Serpstack search failed:", error);
      return {
        success: false,
        error: `Serpstack search failed: ${error instanceof Error ? error.message : String(error)}`,
        query: args.query
      };
    }
  }

  private async performSearch(args: any): Promise<any> {
    const params = new URLSearchParams({
      access_key: this.apiKey,
      query: args.query,
      ...(args.engine && { engine: args.engine }),
      ...(args.type && { type: args.type }),
      ...(args.device && { device: args.device }),
      ...(args.location && { location: args.location }),
      ...(args.googleDomain && { google_domain: args.googleDomain }),
      ...(args.gl && { gl: args.gl }),
      ...(args.hl && { hl: args.hl }),
      ...(args.autoLocation !== undefined && { auto_location: args.autoLocation ? '1' : '0' }),
      ...(args.safeSearch && { safe: '1' }),
      ...(args.page && { page: args.page.toString() }),
      ...(args.num && { num: args.num.toString() }),
      ...(args.period && { period: args.period }),
      ...(args.periodStart && { period_start: args.periodStart }),
      ...(args.periodEnd && { period_end: args.periodEnd }),
      ...(args.sort && { sort: args.sort }),
      ...(args.newsType && { news_type: args.newsType }),
      ...(args.excludeAutocorrected && { exclude_autocorrected_results: '1' }),
      ...(args.imagesPage && { images_page: args.imagesPage.toString() }),
      ...(args.imagesColor && { images_color: args.imagesColor }),
      ...(args.imagesSize && { images_size: args.imagesSize }),
      ...(args.imagesType && { images_type: args.imagesType }),
      ...(args.imagesUsage && { images_usage: args.imagesUsage }),
      ...(args.output && { output: args.output }),
      ...(args.csvFields && { csv_fields: args.csvFields })
    });

    const response = await fetch(`${this.baseUrl}/search?${params.toString()}`, {
      method: "GET",
      headers: {
        "User-Agent": "SerpstackTool/1.0"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    // Handle API errors
    if (!result.request?.success) {
      const error = result.error || {};
      throw new Error(`Serpstack API Error ${error.code}: ${error.info || error.type || 'Unknown error'}`);
    }

    // Structure the response based on search type
    return this.formatSearchResults(result, args.type || 'web');
  }

  private formatSearchResults(result: any, searchType: string): any {
    const baseResponse = {
      searchParameters: result.search_parameters || {},
      searchInformation: {
        totalResults: result.search_information?.total_results || 0,
        timeTaken: result.search_information?.time_taken_displayed || null,
        didYouMean: result.search_information?.did_you_mean || null,
        showingResultsFor: result.search_information?.showing_results_for || null,
        queryDisplayed: result.search_information?.query_displayed || null,
        detectedLocation: result.search_information?.detected_location || null,
        noResultsForOriginalQuery: result.search_information?.no_results_for_original_query || false
      },
      request: {
        success: result.request?.success || false,
        processedTimestamp: result.request?.processed_timestamp || null,
        searchUrl: result.request?.search_url || null,
        totalTimeTaken: result.request?.total_time_taken || null
      }
    };

    // Add search type specific results
    switch (searchType) {
      case 'images':
        return {
          ...baseResponse,
          imageResults: this.formatImageResults(result.image_results || []),
          resultsCount: result.image_results?.length || 0
        };

      case 'videos':
        return {
          ...baseResponse,
          videoResults: this.formatVideoResults(result.video_results || []),
          resultsCount: result.video_results?.length || 0
        };

      case 'news':
        return {
          ...baseResponse,
          newsResults: this.formatNewsResults(result.news_results || []),
          resultsCount: result.news_results?.length || 0
        };

      case 'shopping':
        return {
          ...baseResponse,
          shoppingResults: this.formatShoppingResults(result.shopping_results || []),
          resultsCount: result.shopping_results?.length || 0
        };

      default: // 'web'
        return {
          ...baseResponse,
          organicResults: this.formatOrganicResults(result.organic_results || []),
          ads: this.formatAds(result.ads || []),
          inlineImages: this.formatInlineImages(result.inline_images || []),
          inlineVideos: this.formatInlineVideos(result.inline_videos || []),
          inlineShopping: this.formatInlineShopping(result.inline_shopping || []),
          localResults: this.formatLocalResults(result.local_results || []),
          localMap: result.local_map || null,
          answerBox: result.answer_box || null,
          knowledgeGraph: result.knowledge_graph || null,
          weatherBox: result.weather_box || null,
          events: result.events || [],
          topCarousel: result.top_carousel || [],
          topStories: this.formatTopStories(result.top_stories || []),
          inlineTweets: result.inline_tweets || [],
          pagination: result.pagination || null,
          resultsCount: result.organic_results?.length || 0
        };
    }
  }

  private formatOrganicResults(results: any[]): any[] {
    return results.map(result => ({
      position: result.position,
      title: result.title,
      url: result.url,
      domain: result.domain,
      displayedUrl: result.displayed_url,
      snippet: result.snippet,
      sitelinks: result.sitelinks || [],
      cachedPageUrl: result.cached_page_url,
      relatedPagesUrl: result.related_pages_url,
      prerender: result.prerender || false,
      richSnippet: result.rich_snippet || null
    }));
  }

  private formatAds(ads: any[]): any[] {
    return ads.map(ad => ({
      position: ad.position,
      blockPosition: ad.block_position,
      title: ad.title,
      url: ad.url,
      trackingUrl: ad.tracking_url,
      displayedUrl: ad.displayed_url,
      domain: ad.domain,
      description: ad.description,
      sitelinks: ad.sitelinks || []
    }));
  }

  private formatImageResults(results: any[]): any[] {
    return results.map(result => ({
      position: result.position,
      title: result.title,
      width: result.width,
      height: result.height,
      imageUrl: result.image_url,
      type: result.type,
      url: result.url,
      source: result.source
    }));
  }

  private formatVideoResults(results: any[]): any[] {
    return results.map(result => ({
      position: result.position,
      title: result.title,
      url: result.url,
      displayedUrl: result.displayed_url,
      uploaded: result.uploaded,
      snippet: result.snippet,
      length: result.length
    }));
  }

  private formatNewsResults(results: any[]): any[] {
    return results.map(result => ({
      position: result.position,
      title: result.title,
      url: result.url,
      sourceName: result.source_name,
      uploaded: result.uploaded,
      uploadedUtc: result.uploaded_utc,
      snippet: result.snippet,
      thumbnailUrl: result.thumbnail_url
    }));
  }

  private formatShoppingResults(results: any[]): any[] {
    return results.map(result => ({
      position: result.position,
      title: result.title,
      url: result.url,
      price: result.price,
      merchant: result.merchant,
      rating: result.rating,
      reviews: result.reviews
    }));
  }

  private formatInlineImages(results: any[]): any[] {
    return results.map(result => ({
      blockPosition: result.block_position,
      imageUrl: result.image_url,
      url: result.url,
      title: result.title
    }));
  }

  private formatInlineVideos(results: any[]): any[] {
    return results.map(result => ({
      link: result.link,
      duration: result.duration,
      durationSec: result.duration_sec,
      title: result.title,
      source: result.source,
      author: result.author,
      date: result.date,
      image: result.image,
      imageUrl: result.image_url,
      rank: result.rank,
      globalRank: result.global_rank
    }));
  }

  private formatInlineShopping(results: any[]): any[] {
    return results.map(result => ({
      position: result.position,
      url: result.url,
      title: result.title,
      price: result.price,
      merchant: result.merchant,
      rating: result.rating,
      reviews: result.reviews
    }));
  }

  private formatLocalResults(results: any[]): any[] {
    return results.map(result => ({
      position: result.position,
      title: result.title,
      coordinates: result.coordinates || null,
      imageUrl: result.image_url,
      address: result.address,
      extensions: result.extensions || [],
      rating: result.rating,
      reviews: result.reviews,
      type: result.type,
      price: result.price,
      url: result.url
    }));
  }

  private formatTopStories(results: any[]): any[] {
    return results.map(result => ({
      blockPosition: result.block_position,
      url: result.url,
      title: result.title,
      source: result.source,
      uploaded: result.uploaded,
      uploadedUtc: result.uploaded_utc
    }));
  }

  // Utility method to search for location suggestions
  async searchLocations(query: string, limit?: number): Promise<any> {
    try {
      const params = new URLSearchParams({
        access_key: this.apiKey,
        query: query,
        ...(limit && { limit: limit.toString() })
      });

      const response = await fetch(`${this.baseUrl}/locations?${params.toString()}`, {
        method: "GET",
        headers: {
          "User-Agent": "SerpstackTool/1.0"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const results = await response.json();

      return {
        success: true,
        query: query,
        locations: results.map((location: any) => ({
          name: location.name,
          canonicalName: location.canonical_name,
          countryCode: location.country_code,
          targetType: location.target_type,
          reach: location.reach,
          latitude: location.latitude,
          longitude: location.longitude
        })) || []
      };

    } catch (error: unknown) {
      console.error("❌ Serpstack location search failed:", error);
      return {
        success: false,
        error: `Serpstack location search failed: ${error instanceof Error ? error.message : String(error)}`,
        query: query
      };
    }
  }

  // Utility method to validate API key
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/search?access_key=${this.apiKey}&query=test`, {
        method: "GET"
      });

      const result = await response.json();
      return result.request?.success === true;
    } catch (error) {
      return false;
    }
  }

  // Utility method to get account info
  async getAccountInfo(): Promise<any> {
    try {
      // Note: Serpstack doesn't have a dedicated account endpoint,
      // so we make a minimal request and check the response for usage info
      const response = await fetch(`${this.baseUrl}/search?access_key=${this.apiKey}&query=test&num=1`, {
        method: "GET"
      });

      const result = await response.json();
      
      if (!result.request?.success) {
        return {
          success: false,
          error: result.error || "Invalid API key"
        };
      }

      return {
        success: true,
        message: "API key is valid and active",
        // Note: Serpstack doesn't expose usage limits in response headers
        // Users need to check their dashboard for usage statistics
        recommendations: [
          "Check your dashboard at serpstack.com for detailed usage statistics",
          "Monitor your API usage to avoid overages",
          "Consider upgrading your plan if you consistently exceed limits"
        ]
      };

    } catch (error: unknown) {
      return {
        success: false,
        error: `Account validation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}