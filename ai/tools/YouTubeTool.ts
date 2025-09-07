import { FunctionDeclaration, Type } from "@google/genai";

export class YouTubeTool {
  constructor() {}

  getDefinition(): FunctionDeclaration {
    return {
      name: "youtube_operations",
      description: "Comprehensive YouTube operations including video search, channel info, trending videos, video details, comments, and more. Uses YouTube's internal APIs and HTML parsing - no API key required.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: [
              "search_videos",
              "get_video_details",
              "get_channel_info",
              "get_trending_videos",
              "get_video_comments",
              "get_channel_videos",
              "get_video_transcript",
              "search_channels"
            ]
          },
          // Search parameters
          query: {
            type: Type.STRING,
            description: "Search query for videos, channels, or playlists"
          },
          maxResults: {
            type: Type.NUMBER,
            description: "Maximum number of results to return (default: 10, max: 50)"
          },
          // Video parameters
          videoId: {
            type: Type.STRING,
            description: "YouTube video ID (e.g., dQw4w9WgXcQ)"
          },
          videoUrl: {
            type: Type.STRING,
            description: "Full YouTube video URL"
          },
          // Channel parameters
          channelId: {
            type: Type.STRING,
            description: "YouTube channel ID or handle (e.g., @username)"
          },
          channelUrl: {
            type: Type.STRING,
            description: "Full YouTube channel URL"
          },
          // Filtering
          region: {
            type: Type.STRING,
            description: "Region code (e.g., US, GB, JP, IN)"
          },
          orderBy: {
            type: Type.STRING,
            description: "Sort order: relevance, date, rating, viewCount, title",
            enum: ["relevance", "date", "rating", "viewCount", "title"]
          },
          sortBy: {
            type: Type.STRING,
            description: "Channel videos sort: Latest, Popular, Oldest",
            enum: ["Latest", "Popular", "Oldest"]
          },
          maxPages: {
            type: Type.NUMBER,
            description: "Maximum number of pages to scrape for pagination"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`📺 YouTube operation: ${args.action}`);
      
      switch (args.action) {
        case "search_videos":
          return await this.searchVideos(args);
        case "get_video_details":
          return await this.getVideoDetails(args);
        case "get_channel_info":
          return await this.getChannelInfo(args);
        case "get_trending_videos":
          return await this.getTrendingVideos(args);
        case "get_video_comments":
          return await this.getVideoComments(args);
        case "get_channel_videos":
          return await this.getChannelVideos(args);
        case "get_video_transcript":
          return await this.getVideoTranscript(args);
        case "search_channels":
          return await this.searchChannels(args);
        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`
          };
      }
    } catch (error: unknown) {
      console.error(`❌ YouTube operation '${args.action}' failed:`, error);
      return {
        success: false,
        error: `YouTube operation '${args.action}' failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private extractVideoId(urlOrId: string): string {
    if (urlOrId.includes('youtube.com') || urlOrId.includes('youtu.be')) {
      const match = urlOrId.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([^&\n?#]+)/);
      return match ? match[1] : urlOrId;
    }
    return urlOrId;
  }

  private extractChannelId(urlOrId: string): string {
    if (urlOrId.includes('youtube.com')) {
      const match = urlOrId.match(/youtube\.com\/(?:channel\/|c\/|user\/|@)([^/?]+)/);
      return match ? match[1] : urlOrId;
    }
    return urlOrId;
  }

  private formatNumber(num: number | string): string {
    if (typeof num === 'string') {
      // Handle strings like "1.2K", "5M", etc.
      const upperStr = num.toUpperCase().replace(/[,\s]/g, '');
      if (upperStr.includes('K')) {
        return (parseFloat(upperStr) * 1000).toFixed(0);
      } else if (upperStr.includes('M')) {
        return (parseFloat(upperStr) * 1000000).toFixed(0);
      } else if (upperStr.includes('B')) {
        return (parseFloat(upperStr) * 1000000000).toFixed(0);
      }
      return upperStr;
    }
    
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  private formatDuration(seconds: number | string): string {
    const totalSeconds = typeof seconds === 'string' ? parseInt(seconds) : seconds;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  private async makeYouTubeRequest(url: string, options: any = {}): Promise<any> {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      ...options.headers
    };

    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  private async callYouTubeAPI(baseUrl: string, payload: any): Promise<any> {
    const apiPayload = {
      context: {
        client: {
          hl: "en",
          gl: "US",
          clientName: "WEB",
          clientVersion: "2.20241201.01.00",
          originalUrl: "https://www.youtube.com",
          platform: "DESKTOP",
          clientFormFactor: "UNKNOWN_FORM_FACTOR",
          userInterfaceTheme: "USER_INTERFACE_THEME_LIGHT",
          timeZone: "UTC",
          browserName: "Chrome",
          browserVersion: "122.0.0.0",
          acceptHeader: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          deviceExperimentId: "",
          screenWidthPoints: 1920,
          screenHeightPoints: 1080,
          screenPixelDensity: 1,
          utcOffsetMinutes: 0,
          connectionType: "CONN_CELLULAR_4G",
          memoryTotalKbytes: "8000000"
        },
        user: { lockedSafetyMode: false },
        request: { useSsl: true }
      },
      ...payload
    };

    const response = await this.makeYouTubeRequest(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-YouTube-Client-Name': '1',
        'X-YouTube-Client-Version': '2.20241201.01.00'
      },
      body: JSON.stringify(apiPayload)
    });

    return response.json();
  }

  private extractJSONFromHTML(html: string, varName: string): any {
    try {
      const regex = new RegExp(`var ${varName} = ({.*?});`, 's');
      const match = html.match(regex);
      if (match) {
        return JSON.parse(match[1]);
      }
      return null;
    } catch (error) {
      console.error(`Failed to extract ${varName}:`, error);
      return null;
    }
  }

  private findNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private findAllNestedValues(obj: any, key: string, results: any[] = []): any[] {
    if (obj && typeof obj === 'object') {
      if (obj[key]) {
        results.push(obj[key]);
      }
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          this.findAllNestedValues(obj[prop], key, results);
        }
      }
    }
    return results;
  }

  private async searchVideos(args: any): Promise<any> {
    const query = args.query;
    const maxResults = Math.min(args.maxResults || 10, 50);
    
    if (!query) {
      return { success: false, error: "Query is required for video search" };
    }

    try {
      // Method 1: Use YouTube's internal search API
      const searchPayload = {
        query: query,
        params: "EgIQAQ%3D%3D" // Video filter
      };

      const apiUrl = "https://www.youtube.com/youtubei/v1/search?prettyPrint=false";
      const data = await this.callYouTubeAPI(apiUrl, searchPayload);

      const videoRenderers = this.findAllNestedValues(data, 'videoRenderer');
      
      const videos = videoRenderers.slice(0, maxResults).map((video: any) => {
        const viewCountText = video.viewCountText?.simpleText || 
                             video.shortViewCountText?.simpleText || '0 views';
        
        return {
          videoId: video.videoId,
          title: video.title?.runs?.[0]?.text || video.title?.simpleText || 'No title',
          description: video.detailedMetadataSnippets?.[0]?.snippetText?.runs?.[0]?.text || 
                      video.descriptionSnippet?.runs?.[0]?.text || '',
          author: video.ownerText?.runs?.[0]?.text || 'Unknown',
          authorId: video.ownerText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.split('/')?.[2] || '',
          published: video.publishedTimeText?.simpleText || 'Unknown',
          viewCount: viewCountText,
          viewCountNumber: this.parseViewCount(viewCountText),
          duration: video.lengthText?.simpleText || '0:00',
          thumbnail: video.thumbnail?.thumbnails?.[0]?.url || '',
          url: `https://www.youtube.com/watch?v=${video.videoId}`
        };
      });

      return {
        success: true,
        query,
        results: videos.length,
        videos,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      // Fallback method: Parse search results page HTML
      try {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        const response = await this.makeYouTubeRequest(searchUrl);
        const html = await response.text();
        
        const ytInitialData = this.extractJSONFromHTML(html, 'ytInitialData');
        if (!ytInitialData) {
          throw new Error('Failed to extract search data from HTML');
        }

        const videoRenderers = this.findAllNestedValues(ytInitialData, 'videoRenderer');
        
        const videos = videoRenderers.slice(0, maxResults).map((video: any) => ({
          videoId: video.videoId,
          title: video.title?.runs?.[0]?.text || 'No title',
          description: video.detailedMetadataSnippets?.[0]?.snippetText?.runs?.[0]?.text || '',
          author: video.ownerText?.runs?.[0]?.text || 'Unknown',
          published: video.publishedTimeText?.simpleText || 'Unknown',
          viewCount: video.viewCountText?.simpleText || '0 views',
          duration: video.lengthText?.simpleText || '0:00',
          thumbnail: video.thumbnail?.thumbnails?.[0]?.url || '',
          url: `https://www.youtube.com/watch?v=${video.videoId}`
        }));

        return {
          success: true,
          query,
          results: videos.length,
          videos,
          timestamp: new Date().toISOString()
        };

      } catch (fallbackError) {
        return {
          success: false,
          error: `Failed to search videos: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`
        };
      }
    }
  }

  private parseViewCount(viewCountText: string): number {
    if (!viewCountText) return 0;
    
    const match = viewCountText.match(/([\d,.]+)\s*([KMB]?)/i);
    if (!match) return 0;
    
    const number = parseFloat(match[1].replace(/,/g, ''));
    const multiplier = match[2].toUpperCase();
    
    switch (multiplier) {
      case 'K': return Math.floor(number * 1000);
      case 'M': return Math.floor(number * 1000000);
      case 'B': return Math.floor(number * 1000000000);
      default: return Math.floor(number);
    }
  }

  private async getVideoDetails(args: any): Promise<any> {
    const videoId = this.extractVideoId(args.videoId || args.videoUrl || '');
    
    if (!videoId) {
      return { success: false, error: "Video ID or URL is required" };
    }

    try {
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const response = await this.makeYouTubeRequest(videoUrl);
      const html = await response.text();

      const ytInitialPlayerResponse = this.extractJSONFromHTML(html, 'ytInitialPlayerResponse');
      const ytInitialData = this.extractJSONFromHTML(html, 'ytInitialData');

      if (!ytInitialPlayerResponse || !ytInitialData) {
        throw new Error('Failed to extract video data from HTML');
      }

      const videoDetails = ytInitialPlayerResponse.videoDetails;
      const microformat = ytInitialPlayerResponse.microformat?.playerMicroformatRenderer;

      // Extract engagement data
      const topLevelButtons = this.findAllNestedValues(ytInitialData, 'topLevelButtons')?.[0] || [];
      const likeButton = topLevelButtons.find((btn: any) => btn.toggleButtonRenderer?.defaultIcon?.iconType === 'LIKE');
      const likeCount = likeButton?.toggleButtonRenderer?.defaultText?.accessibility?.accessibilityData?.label || '0';

      // Extract channel info
      const videoOwnerRenderer = this.findAllNestedValues(ytInitialData, 'videoOwnerRenderer')?.[0];
      const subscriberCount = videoOwnerRenderer?.subscriberCountText?.simpleText || '0 subscribers';

      return {
        success: true,
        video: {
          videoId: videoDetails.videoId,
          title: videoDetails.title,
          description: videoDetails.shortDescription,
          author: videoDetails.author,
          channelId: videoDetails.channelId,
          lengthSeconds: parseInt(videoDetails.lengthSeconds) || 0,
          duration: this.formatDuration(videoDetails.lengthSeconds),
          viewCount: this.formatNumber(videoDetails.viewCount),
          viewCountNumber: parseInt(videoDetails.viewCount) || 0,
          likeCount: this.formatNumber(likeCount.replace(/\D/g, '') || '0'),
          publishDate: microformat?.publishDate || 'Unknown',
          uploadDate: microformat?.uploadDate || 'Unknown',
          category: microformat?.category || 'Unknown',
          tags: videoDetails.keywords || [],
          thumbnail: videoDetails.thumbnail?.thumbnails?.[0]?.url,
          isLiveContent: videoDetails.isLiveContent || false,
          url: `https://www.youtube.com/watch?v=${videoDetails.videoId}`,
          embedUrl: `https://www.youtube.com/embed/${videoDetails.videoId}`,
          channel: {
            name: videoDetails.author,
            id: videoDetails.channelId,
            subscriberCount: subscriberCount,
            thumbnail: videoOwnerRenderer?.thumbnail?.thumbnails?.[0]?.url
          }
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to get video details: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async getTrendingVideos(args: any): Promise<any> {
    const region = args.region || 'US';
    const maxResults = Math.min(args.maxResults || 10, 50);

    try {
      const trendingUrl = `https://www.youtube.com/feed/trending`;
      const response = await this.makeYouTubeRequest(trendingUrl);
      const html = await response.text();

      const ytInitialData = this.extractJSONFromHTML(html, 'ytInitialData');
      if (!ytInitialData) {
        throw new Error('Failed to extract trending data from HTML');
      }

      const videoRenderers = this.findAllNestedValues(ytInitialData, 'videoRenderer');
      
      const trendingVideos = videoRenderers.slice(0, maxResults).map((video: any) => ({
        videoId: video.videoId,
        title: video.title?.runs?.[0]?.text || 'No title',
        description: video.detailedMetadataSnippets?.[0]?.snippetText?.runs?.[0]?.text || '',
        author: video.ownerText?.runs?.[0]?.text || 'Unknown',
        published: video.publishedTimeText?.simpleText || 'Unknown',
        viewCount: video.viewCountText?.simpleText || '0 views',
        duration: video.lengthText?.simpleText || '0:00',
        thumbnail: video.thumbnail?.thumbnails?.[0]?.url || '',
        url: `https://www.youtube.com/watch?v=${video.videoId}`
      }));

      return {
        success: true,
        region,
        results: trendingVideos.length,
        videos: trendingVideos,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to get trending videos: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async getChannelInfo(args: any): Promise<any> {
    const channelId = this.extractChannelId(args.channelId || args.channelUrl || '');
    
    if (!channelId) {
      return { success: false, error: "Channel ID or URL is required" };
    }

    try {
      const channelUrl = channelId.startsWith('@') 
        ? `https://www.youtube.com/${channelId}`
        : `https://www.youtube.com/channel/${channelId}`;
      
      const response = await this.makeYouTubeRequest(channelUrl);
      const html = await response.text();

      const ytInitialData = this.extractJSONFromHTML(html, 'ytInitialData');
      if (!ytInitialData) {
        throw new Error('Failed to extract channel data from HTML');
      }

      const header = ytInitialData.header?.c4TabbedHeaderRenderer || ytInitialData.header?.pageHeaderRenderer;
      const metadata = ytInitialData.metadata?.channelMetadataRenderer;

      return {
        success: true,
        channel: {
          name: header?.title || metadata?.title || 'Unknown',
          channelId: metadata?.externalId || channelId,
          description: metadata?.description || '',
          subscriberCount: header?.subscriberCountText?.simpleText || '0 subscribers',
          videoCount: header?.videosCountText?.runs?.[0]?.text || 'Unknown',
          viewCount: header?.viewCountText?.simpleText || 'Unknown',
          joinDate: header?.joinedDateText?.runs?.[1]?.text || 'Unknown',
          country: metadata?.country || 'Unknown',
          avatar: header?.avatar?.thumbnails?.[0]?.url || metadata?.avatar?.thumbnails?.[0]?.url,
          banner: header?.banner?.thumbnails?.[0]?.url,
          verified: !!(header?.badges?.find((badge: any) => badge.metadataBadgeRenderer?.style === 'BADGE_STYLE_TYPE_VERIFIED')),
          url: metadata?.channelUrl || channelUrl
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to get channel info: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async getChannelVideos(args: any): Promise<any> {
    const channelId = this.extractChannelId(args.channelId || args.channelUrl || '');
    const maxResults = Math.min(args.maxResults || 10, 50);
    const sortBy = args.sortBy || 'Latest';
    
    if (!channelId) {
      return { success: false, error: "Channel ID or URL is required" };
    }

    try {
      const channelUrl = channelId.startsWith('@') 
        ? `https://www.youtube.com/${channelId}/videos`
        : `https://www.youtube.com/channel/${channelId}/videos`;
      
      const response = await this.makeYouTubeRequest(channelUrl);
      const html = await response.text();

      const ytInitialData = this.extractJSONFromHTML(html, 'ytInitialData');
      if (!ytInitialData) {
        throw new Error('Failed to extract channel videos data from HTML');
      }

      const videoRenderers = this.findAllNestedValues(ytInitialData, 'videoRenderer');
      const gridVideoRenderers = this.findAllNestedValues(ytInitialData, 'gridVideoRenderer');
      
      const allVideos = [...videoRenderers, ...gridVideoRenderers];
      
      const videos = allVideos.slice(0, maxResults).map((video: any) => ({
        videoId: video.videoId,
        title: video.title?.runs?.[0]?.text || video.title?.simpleText || 'No title',
        description: video.detailedMetadataSnippets?.[0]?.snippetText?.runs?.[0]?.text || '',
        published: video.publishedTimeText?.simpleText || 'Unknown',
        viewCount: video.viewCountText?.simpleText || video.shortViewCountText?.simpleText || '0 views',
        duration: video.lengthText?.simpleText || video.thumbnailOverlays?.find((overlay: any) => 
          overlay.thumbnailOverlayTimeStatusRenderer)?.thumbnailOverlayTimeStatusRenderer?.text?.simpleText || '0:00',
        thumbnail: video.thumbnail?.thumbnails?.[0]?.url || '',
        url: `https://www.youtube.com/watch?v=${video.videoId}`
      }));

      return {
        success: true,
        channelId,
        sortBy,
        results: videos.length,
        videos,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to get channel videos: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async getVideoComments(args: any): Promise<any> {
    const videoId = this.extractVideoId(args.videoId || args.videoUrl || '');
    const maxResults = Math.min(args.maxResults || 20, 100);

    if (!videoId) {
      return { success: false, error: "Video ID or URL is required" };
    }

    try {
      // First get the video page to extract continuation token
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const response = await this.makeYouTubeRequest(videoUrl);
      const html = await response.text();

      const ytInitialData = this.extractJSONFromHTML(html, 'ytInitialData');
      if (!ytInitialData) {
        throw new Error('Failed to extract video data from HTML');
      }

      // Find comments continuation token
      const continuationTokens = this.findAllNestedValues(ytInitialData, 'continuationCommand');
      const commentsContinuation = continuationTokens.find((token: any) => 
        token.token && token.token.includes('comments')
      );

      if (!commentsContinuation) {
        return {
          success: true,
          videoId,
          results: 0,
          comments: [],
          message: "No comments available or comments are disabled",
          timestamp: new Date().toISOString()
        };
      }

      // Call comments API
      const commentsPayload = {
        continuation: commentsContinuation.token
      };

      const apiUrl = "https://www.youtube.com/youtubei/v1/next?prettyPrint=false";
      const data = await this.callYouTubeAPI(apiUrl, commentsPayload);

      const commentRenderers = this.findAllNestedValues(data, 'commentRenderer');
      
      const comments = commentRenderers.slice(0, maxResults).map((comment: any) => ({
        commentId: comment.commentId,
        author: comment.authorText?.simpleText || 'Unknown',
        authorThumbnail: comment.authorThumbnail?.thumbnails?.[0]?.url || '',
        content: comment.contentText?.runs?.map((run: any) => run.text).join('') || '',
        published: comment.publishedTimeText?.runs?.[0]?.text || 'Unknown',
        likeCount: parseInt(comment.voteCount?.simpleText?.replace(/\D/g, '') || '0'),
        isHearted: !!(comment.actionButtons?.commentActionButtonsRenderer?.likeButton?.toggleButtonRenderer?.isToggled),
        replyCount: parseInt(comment.replyCount?.toString() || '0'),
        isPinned: !!(comment.pinnedCommentBadge)
      }));

      return {
        success: true,
        videoId,
        results: comments.length,
        comments,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to get video comments: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async searchChannels(args: any): Promise<any> {
    const query = args.query;
    const maxResults = Math.min(args.maxResults || 10, 50);
    
    if (!query) {
      return { success: false, error: "Query is required for channel search" };
    }

    try {
      const searchPayload = {
        query: query,
        params: "EgIQAg%3D%3D" // Channel filter
      };

      const apiUrl = "https://www.youtube.com/youtubei/v1/search?prettyPrint=false";
      const data = await this.callYouTubeAPI(apiUrl, searchPayload);

      const channelRenderers = this.findAllNestedValues(data, 'channelRenderer');
      
      const channels = channelRenderers.slice(0, maxResults).map((channel: any) => ({
        channelId: channel.channelId,
        title: channel.title?.simpleText || 'No title',
        description: channel.descriptionSnippet?.runs?.[0]?.text || '',
        subscriberCount: channel.subscriberCountText?.simpleText || 'Unknown',
        videoCount: channel.videoCountText?.runs?.[0]?.text || 'Unknown',
        thumbnail: channel.thumbnail?.thumbnails?.[0]?.url || '',
        verified: !!(channel.ownerBadges?.find((badge: any) => 
          badge.metadataBadgeRenderer?.style === 'BADGE_STYLE_TYPE_VERIFIED')),
        url: `https://www.youtube.com/channel/${channel.channelId}`
      }));

      return {
        success: true,
        query,
        results: channels.length,
        channels,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to search channels: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async getVideoTranscript(args: any): Promise<any> {
    const videoId = this.extractVideoId(args.videoId || args.videoUrl || '');
    
    if (!videoId) {
      return { success: false, error: "Video ID or URL is required" };
    }

    try {
      // Get video page to extract transcript data
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const response = await this.makeYouTubeRequest(videoUrl);
      const html = await response.text();

      const ytInitialPlayerResponse = this.extractJSONFromHTML(html, 'ytInitialPlayerResponse');
      if (!ytInitialPlayerResponse) {
        throw new Error('Failed to extract player data from HTML');
      }

      // Check if captions are available
      const captions = ytInitialPlayerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      
      if (!captions || captions.length === 0) {
        return {
          success: false,
          error: "No transcripts available for this video"
        };
      }

      // Get English transcript (or first available)
      const englishCaption = captions.find((caption: any) => 
        caption.languageCode === 'en' || caption.languageCode.startsWith('en')
      ) || captions[0];

      const transcriptUrl = englishCaption.baseUrl;
      const transcriptResponse = await this.makeYouTubeRequest(transcriptUrl);
      const transcriptXml = await transcriptResponse.text();

      // Parse XML transcript
      const textRegex = /<text[^>]*start="([^"]*)"[^>]*dur="([^"]*)"[^>]*>([^<]*)</g;
      const transcript: any[] = [];
      let match;

      while ((match = textRegex.exec(transcriptXml)) !== null) {
        const startTime = parseFloat(match[1]);
        const duration = parseFloat(match[2]);
        const text = match[3]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        transcript.push({
          start: startTime,
          duration: duration,
          text: text.trim(),
          startFormatted: this.formatDuration(Math.floor(startTime))
        });
      }

      return {
        success: true,
        videoId,
        language: englishCaption.languageCode,
        languageName: englishCaption.name?.simpleText || 'Unknown',
        transcriptCount: transcript.length,
        transcript,
        fullText: transcript.map(item => item.text).join(' '),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to get video transcript: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Utility methods for common operations
  static createSearchRequest(query: string, maxResults: number = 10): any {
    return {
      action: "search_videos",
      query,
      maxResults
    };
  }

  static createVideoDetailsRequest(videoId: string): any {
    return {
      action: "get_video_details",
      videoId
    };
  }

  static createChannelInfoRequest(channelId: string): any {
    return {
      action: "get_channel_info",
      channelId
    };
  }

  static createTrendingRequest(region: string = 'US', maxResults: number = 10): any {
    return {
      action: "get_trending_videos",
      region,
      maxResults
    };
  }

  static createCommentsRequest(videoId: string, maxResults: number = 20): any {
    return {
      action: "get_video_comments",
      videoId,
      maxResults
    };
  }

  static createChannelVideosRequest(channelId: string, sortBy: string = 'Latest', maxResults: number = 10): any {
    return {
      action: "get_channel_videos",
      channelId,
      sortBy,
      maxResults
    };
  }

  static createTranscriptRequest(videoId: string): any {
    return {
      action: "get_video_transcript",
      videoId
    };
  }

  static createChannelSearchRequest(query: string, maxResults: number = 10): any {
    return {
      action: "search_channels",
      query,
      maxResults
    };
  }
}