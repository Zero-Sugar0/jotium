//ai/tools/YouTubeTool.ts
import { FunctionDeclaration, Type } from "@google/genai";

export class YouTubeTool {
  constructor() {}

  getDefinition(): FunctionDeclaration {
    return {
      name: "youtube_operations",
      description: "Comprehensive YouTube operations including video search, channel info, trending videos, video details, comments, and playlist management. No API key required - uses public endpoints and web scraping.",
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
              "search_channels",
              "get_playlist_videos",
              "get_related_videos",
              "get_video_transcript",
              "download_video_info",
              "get_channel_stats",
              "get_video_stats",
              "search_playlists",
              "get_trending_by_category",
              "get_video_suggestions",
              "get_channel_videos",
              "get_video_tags",
              "get_video_chapters",
              "get_live_streams",
              "get_upcoming_videos"
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
            description: "YouTube channel ID"
          },
          channelUrl: {
            type: Type.STRING,
            description: "Full YouTube channel URL"
          },
          // Playlist parameters
          playlistId: {
            type: Type.STRING,
            description: "YouTube playlist ID"
          },
          // Category and filtering
          category: {
            type: Type.STRING,
            description: "Video category (music, gaming, sports, news, etc.)",
            enum: ["music", "gaming", "sports", "news", "entertainment", "education", "science", "technology", "food", "travel", "movies", "tv", "anime", "comedy", "people", "blogs", "howto", "nonprofits", "autos", "pets", "family"]
          },
          region: {
            type: Type.STRING,
            description: "Region code (e.g., US, GB, JP, IN)"
          },
          // Time and sorting
          publishedAfter: {
            type: Type.STRING,
            description: "Filter videos published after this date (ISO format)"
          },
          publishedBefore: {
            type: Type.STRING,
            description: "Filter videos published before this date (ISO format)"
          },
          orderBy: {
            type: Type.STRING,
            description: "Sort order: relevance, date, rating, viewCount, title",
            enum: ["relevance", "date", "rating", "viewCount", "title"]
          },
          // Duration filtering
          duration: {
            type: Type.STRING,
            description: "Video duration filter: short, medium, long, any",
            enum: ["short", "medium", "long", "any"]
          },
          // Quality and features
          videoDefinition: {
            type: Type.STRING,
            description: "Video quality: high, standard, any",
            enum: ["high", "standard", "any"]
          },
          videoDimension: {
            type: Type.STRING,
            description: "Video dimension: 2d, 3d, any",
            enum: ["2d", "3d", "any"]
          },
          // Channel type
          channelType: {
            type: Type.STRING,
            description: "Channel type: any, show",
            enum: ["any", "show"]
          },
          // Live content
          eventType: {
            type: Type.STRING,
            description: "Event type: completed, live, upcoming, any",
            enum: ["completed", "live", "upcoming", "any"]
          },
          // Safe search
          safeSearch: {
            type: Type.STRING,
            description: "Safe search: moderate, strict, none",
            enum: ["moderate", "strict", "none"]
          },
          // Language
          language: {
            type: Type.STRING,
            description: "Language code (e.g., en, es, fr, de, ja)"
          },
          // Comments
          maxComments: {
            type: Type.NUMBER,
            description: "Maximum number of comments to retrieve (default: 20, max: 100)"
          },
          // Transcript
          includeTranscript: {
            type: Type.BOOLEAN,
            description: "Include video transcript if available"
          },
          // Related videos
          relatedMaxResults: {
            type: Type.NUMBER,
            description: "Maximum related videos to return (default: 10)"
          },
          // Channel stats
          includeStats: {
            type: Type.BOOLEAN,
            description: "Include detailed statistics"
          },
          // Video info
          includeChapters: {
            type: Type.BOOLEAN,
            description: "Include video chapters/timestamps"
          },
          includeTags: {
            type: Type.BOOLEAN,
            description: "Include video tags"
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
        case "search_channels":
          return await this.searchChannels(args);
        case "get_playlist_videos":
          return await this.getPlaylistVideos(args);
        case "get_related_videos":
          return await this.getRelatedVideos(args);
        case "get_video_transcript":
          return await this.getVideoTranscript(args);
        case "download_video_info":
          return await this.downloadVideoInfo(args);
        case "get_channel_stats":
          return await this.getChannelStats(args);
        case "get_video_stats":
          return await this.getVideoStats(args);
        case "search_playlists":
          return await this.searchPlaylists(args);
        case "get_trending_by_category":
          return await this.getTrendingByCategory(args);
        case "get_video_suggestions":
          return await this.getVideoSuggestions(args);
        case "get_channel_videos":
          return await this.getChannelVideos(args);
        case "get_video_tags":
          return await this.getVideoTags(args);
        case "get_video_chapters":
          return await this.getVideoChapters(args);
        case "get_live_streams":
          return await this.getLiveStreams(args);
        case "get_upcoming_videos":
          return await this.getUpcomingVideos(args);
        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`
          };
      }
    } catch (error: unknown) {
      console.error("❌ YouTube operation failed:", error);
      return {
        success: false,
        error: `YouTube operation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private extractVideoId(urlOrId: string): string {
    if (urlOrId.includes('youtube.com') || urlOrId.includes('youtu.be')) {
      const match = urlOrId.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([^&\n?#]+)/);
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

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  private async searchVideos(args: any): Promise<any> {
    const query = args.query;
    const maxResults = Math.min(args.maxResults || 10, 50);
    
    if (!query) {
      return { success: false, error: "Query is required for video search" };
    }

    try {
      // Use Invidious API (privacy-focused YouTube alternative)
      const apiUrl = `https://invidious.io/api/v1/search?q=${encodeURIComponent(query)}&type=video&page=1&sort=${args.orderBy || 'relevance'}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok || !Array.isArray(data)) {
        throw new Error('Failed to fetch videos');
      }

      const videos = data.slice(0, maxResults).map((video: any) => ({
        videoId: video.videoId,
        title: video.title,
        description: video.description,
        author: video.author,
        authorId: video.authorId,
        authorUrl: video.authorUrl,
        videoThumbnails: video.videoThumbnails,
        published: video.published,
        publishedText: video.publishedText,
        viewCount: video.viewCount ? this.formatNumber(video.viewCount) : '0',
        viewCountNumber: video.viewCount || 0,
        lengthSeconds: video.lengthSeconds,
        duration: video.lengthSeconds ? this.formatDuration(video.lengthSeconds) : '0:00',
        liveNow: video.liveNow || false,
        paid: video.paid || false,
        premium: video.premium || false,
        isUpcoming: video.isUpcoming || false,
        url: `https://www.youtube.com/watch?v=${video.videoId}`
      }));

      return {
        success: true,
        query,
        results: videos.length,
        videos,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      // Fallback to Piped API (another privacy-focused alternative)
      try {
        const pipedUrl = `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=all`;
        const response = await fetch(pipedUrl);
        const data = await response.json();

        if (!response.ok || !data.items) {
          throw new Error('Failed to fetch videos from fallback');
        }

        const videos = data.items.slice(0, maxResults).map((item: any) => ({
          videoId: item.url.split('v=')[1],
          title: item.title,
          description: item.shortDescription,
          author: item.uploaderName,
          authorId: item.uploaderUrl?.split('/')[2] || '',
          authorUrl: item.uploaderUrl,
          videoThumbnails: [{ url: item.thumbnail, quality: 'maxresdefault', width: 1280, height: 720 }],
          published: item.uploadedDate,
          publishedText: item.uploadedDate,
          viewCount: item.views ? this.formatNumber(item.views) : '0',
          viewCountNumber: item.views || 0,
          duration: item.duration || '0:00',
          liveNow: false,
          paid: false,
          premium: false,
          isUpcoming: false,
          url: item.url
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

  private async getVideoDetails(args: any): Promise<any> {
    const videoId = this.extractVideoId(args.videoId || args.videoUrl || '');
    
    if (!videoId) {
      return { success: false, error: "Video ID or URL is required" };
    }

    try {
      // Use Invidious API for video details
      const apiUrl = `https://invidious.io/api/v1/videos/${videoId}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch video details');
      }

      const videoDetails = {
        videoId: data.videoId,
        title: data.title,
        description: data.description,
        author: data.author,
        authorId: data.authorId,
        authorUrl: data.authorUrl,
        videoThumbnails: data.videoThumbnails,
        published: data.published,
        publishedText: data.publishedText,
        viewCount: data.viewCount ? this.formatNumber(data.viewCount) : '0',
        viewCountNumber: data.viewCount || 0,
        likeCount: data.likeCount ? this.formatNumber(data.likeCount) : '0',
        likeCountNumber: data.likeCount || 0,
        dislikeCount: data.dislikeCount ? this.formatNumber(data.dislikeCount) : '0',
        dislikeCountNumber: data.dislikeCount || 0,
        lengthSeconds: data.lengthSeconds,
        duration: data.lengthSeconds ? this.formatDuration(data.lengthSeconds) : '0:00',
        liveNow: data.liveNow || false,
        paid: data.paid || false,
        premium: data.premium || false,
        isUpcoming: data.isUpcoming || false,
        genre: data.genre || '',
        genreUrl: data.genreUrl || '',
        allowRatings: data.allowRatings || true,
        isFamilyFriendly: data.isFamilyFriendly || true,
        url: `https://www.youtube.com/watch?v=${data.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${data.videoId}`
      };

      // Get additional stats if requested
      if (args.includeStats) {
        const statsResponse = await fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          // Add rating as an optional property to the video details object
          const videoDetailsWithRating = {
            ...videoDetails,
            rating: statsData.rating
          };
          videoDetails.viewCountNumber = statsData.viewCount || videoDetails.viewCountNumber;
          return {
            success: true,
            video: videoDetailsWithRating,
            timestamp: new Date().toISOString()
          };
        }
      }

      return {
        success: true,
        video: videoDetails,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to get video details: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async getChannelInfo(args: any): Promise<any> {
    const channelId = this.extractChannelId(args.channelId || args.channelUrl || '');
    
    if (!channelId) {
      return { success: false, error: "Channel ID or URL is required" };
    }

    try {
      // Use Invidious API for channel info
      const apiUrl = `https://invidious.io/api/v1/channels/${channelId}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch channel info');
      }

      const channelInfo = {
        author: data.author,
        authorId: data.authorId,
        authorUrl: data.authorUrl,
        authorThumbnails: data.authorThumbnails,
        autoGenerated: data.autoGenerated || false,
        description: data.description,
        descriptionHtml: data.descriptionHtml,
        tabs: data.tabs || [],
        tvChannel: data.tvChannel || false,
        subCount: data.subCount ? this.formatNumber(data.subCount) : '0',
        subCountNumber: data.subCount || 0,
        videoCount: data.videoCount ? this.formatNumber(data.videoCount) : '0',
        videoCountNumber: data.videoCount || 0,
        joined: data.joined,
        isFamilyFriendly: data.isFamilyFriendly || true,
        allowedRegions: data.allowedRegions || [],
        latestVideos: data.latestVideos ? data.latestVideos.slice(0, 5).map((video: any) => ({
          videoId: video.videoId,
          title: video.title,
          published: video.published,
          publishedText: video.publishedText,
          viewCount: video.viewCount ? this.formatNumber(video.viewCount) : '0',
          viewCountNumber: video.viewCount || 0,
          lengthSeconds: video.lengthSeconds,
          duration: video.lengthSeconds ? this.formatDuration(video.lengthSeconds) : '0:00',
          url: `https://www.youtube.com/watch?v=${video.videoId}`
        })) : []
      };

      return {
        success: true,
        channel: channelInfo,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to get channel info: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async getTrendingVideos(args: any): Promise<any> {
    const region = args.region || 'US';
    const maxResults = Math.min(args.maxResults || 10, 50);

    try {
      // Use Invidious API for trending videos
      const apiUrl = `https://invidious.io/api/v1/trending?region=${region}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok || !Array.isArray(data)) {
        throw new Error('Failed to fetch trending videos');
      }

      const trendingVideos = data.slice(0, maxResults).map((video: any) => ({
        videoId: video.videoId,
        title: video.title,
        description: video.description,
        author: video.author,
        authorId: video.authorId,
        authorUrl: video.authorUrl,
        videoThumbnails: video.videoThumbnails,
        published: video.published,
        publishedText: video.publishedText,
        viewCount: video.viewCount ? this.formatNumber(video.viewCount) : '0',
        viewCountNumber: video.viewCount || 0,
        lengthSeconds: video.lengthSeconds,
        duration: video.lengthSeconds ? this.formatDuration(video.lengthSeconds) : '0:00',
        liveNow: video.liveNow || false,
        paid: video.paid || false,
        premium: video.premium || false,
        isUpcoming: video.isUpcoming || false,
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

  private async getVideoComments(args: any): Promise<any> {
    const videoId = this.extractVideoId(args.videoId || args.videoUrl || '');
    const maxComments = Math.min(args.maxComments || 20, 100);

    if (!videoId) {
      return { success: false, error: "Video ID or URL is required" };
    }

    try {
      // Use Invidious API for video comments
      const apiUrl = `https://invidious.io/api/v1/comments/${videoId}?sortby=${args.orderBy || 'top'}&continuation=`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok || !data.comments) {
        throw new Error('Failed to fetch video comments');
      }

      const comments = data.comments.slice(0, maxComments).map((comment: any) => ({
        commentId: comment.commentId,
        author: comment.author,
        authorThumbnails: comment.authorThumbnails,
        authorEndpoint: comment.authorEndpoint,
        content: comment.content,
        contentHtml: comment.contentHtml,
        published: comment.published,
        publishedText: comment.publishedText,
        likeCount: comment.likeCount || 0,
        replyCount: comment.replyCount || 0,
        isEdited: comment.isEdited || false,
        isPinned: comment.isPinned || false,
        replies: comment.replies ? comment.replies.map((reply: any) => ({
          commentId: reply.commentId,
          author: reply.author,
          authorThumbnails: reply.authorThumbnails,
          content: reply.content,
          published: reply.published,
          publishedText: reply.publishedText,
          likeCount: reply.likeCount || 0
        })) : []
      }));

      return {
        success: true,
        videoId,
        results: comments.length,
        comments,
        continuation: data.continuation || null,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to get video comments: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Placeholder methods for future implementation
  private async searchChannels(args: any): Promise<any> {
    return { success: false, error: "searchChannels not yet implemented" };
  }

  private async getPlaylistVideos(args: any): Promise<any> {
    return { success: false, error: "getPlaylistVideos not yet implemented" };
  }

  private async getRelatedVideos(args: any): Promise<any> {
    return { success: false, error: "getRelatedVideos not yet implemented" };
  }

  private async getVideoTranscript(args: any): Promise<any> {
    return { success: false, error: "getVideoTranscript not yet implemented" };
  }

  private async downloadVideoInfo(args: any): Promise<any> {
    return { success: false, error: "downloadVideoInfo not yet implemented" };
  }

  private async getChannelStats(args: any): Promise<any> {
    return { success: false, error: "getChannelStats not yet implemented" };
  }

  private async getVideoStats(args: any): Promise<any> {
    return { success: false, error: "getVideoStats not yet implemented" };
  }

  private async searchPlaylists(args: any): Promise<any> {
    return { success: false, error: "searchPlaylists not yet implemented" };
  }

  private async getTrendingByCategory(args: any): Promise<any> {
    return { success: false, error: "getTrendingByCategory not yet implemented" };
  }

  private async getVideoSuggestions(args: any): Promise<any> {
    return { success: false, error: "getVideoSuggestions not yet implemented" };
  }

  private async getChannelVideos(args: any): Promise<any> {
    return { success: false, error: "getChannelVideos not yet implemented" };
  }

  private async getVideoTags(args: any): Promise<any> {
    return { success: false, error: "getVideoTags not yet implemented" };
  }

  private async getVideoChapters(args: any): Promise<any> {
    return { success: false, error: "getVideoChapters not yet implemented" };
  }

  private async getLiveStreams(args: any): Promise<any> {
    return { success: false, error: "getLiveStreams not yet implemented" };
  }

  private async getUpcomingVideos(args: any): Promise<any> {
    return { success: false, error: "getUpcomingVideos not yet implemented" };
  }

  // Utility methods for common operations
  static createSearchRequest(query: string, maxResults: number = 10): any {
    return {
      action: "search_videos",
      query,
      maxResults
    };
  }

  static createVideoDetailsRequest(videoId: string, includeStats: boolean = true): any {
    return {
      action: "get_video_details",
      videoId,
      includeStats
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

  static createCommentsRequest(videoId: string, maxComments: number = 20): any {
    return {
      action: "get_video_comments",
      videoId,
      maxComments
    };
  }
}
