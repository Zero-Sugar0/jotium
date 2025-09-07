//ai/tools/HackerNewsTool.ts
import { FunctionDeclaration, Type } from "@google/genai";

// Interface for Hacker News story/item
interface HackerNewsStory {
  id: number;
  title?: string;
  text?: string;
  by?: string;
  time?: number;
  score?: number;
  descendants?: number;
  url?: string;
  type?: string;
  kids?: number[];
  deleted?: boolean;
  dead?: boolean;
  parent?: number;
  parts?: number[];
  poll?: number;
  [key: string]: any; // Allow additional properties
}

// Interface for enhanced story with computed properties
interface EnhancedStory extends HackerNewsStory {
  timeFormatted: string | null;
  scoreFormatted: string;
  commentCount: number;
  commentCountFormatted: string;
  hnUrl: string;
}

// Interface for Hacker News comment
interface HackerNewsComment {
  id: number;
  by?: string;
  text?: string;
  time?: number;
  score?: number;
  kids?: number[];
  parent?: number;
  deleted?: boolean;
  dead?: boolean;
  [key: string]: any;
}

// Interface for enhanced comment
interface EnhancedComment extends HackerNewsComment {
  timeFormatted: string | null;
  text: string;
  author: string;
  points: number;
  pointsFormatted: string;
  replies?: EnhancedComment[];
}

export class HackerNewsTool {
  private baseUrl: string = "https://hacker-news.firebaseio.com/v0";
  private cache: Map<string, any> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  constructor() {}

  getDefinition(): FunctionDeclaration {
    return {
      name: "hackernews_operations",
      description: "Comprehensive Hacker News operations including top stories, new stories, best stories, ask HN, show HN, job postings, user profiles, comments, search, and real-time updates. No API key required - uses public Firebase API.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: [
              "get_top_stories",
              "get_new_stories",
              "get_best_stories",
              "get_ask_hn",
              "get_show_hn",
              "get_job_stories",
              "get_story_details",
              "get_user_profile",
              "get_user_submissions",
              "get_comments",
              "get_comment_thread",
              "search_stories",
              "get_latest_updates",
              "get_max_item_id",
              "get_story_by_id",
              "get_user_karma",
              "get_user_comments",
              "get_realtime_updates",
              "get_trending_topics",
              "get_weekly_digest",
              "get_monthly_digest",
              "get_yearly_digest",
              "get_story_with_comments",
              "get_user_activity",
              "get_top_authors",
              "get_domain_info",
              "get_similar_stories",
              "get_story_metrics",
              "get_comment_metrics",
              "get_user_metrics"
            ]
          },
          // Story parameters
          storyId: {
            type: Type.NUMBER,
            description: "Hacker News story/item ID"
          },
          storyIds: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: "Array of story IDs to fetch"
          },
          // User parameters
          username: {
            type: Type.STRING,
            description: "Hacker News username"
          },
          // Pagination and limits
          limit: {
            type: Type.NUMBER,
            description: "Maximum number of results to return (default: 30, max: 500)"
          },
          offset: {
            type: Type.NUMBER,
            description: "Offset for pagination (default: 0)"
          },
          // Search parameters
          searchQuery: {
            type: Type.STRING,
            description: "Search query for stories"
          },
          searchType: {
            type: Type.STRING,
            description: "Search type: title, text, url, author",
            enum: ["title", "text", "url", "author"]
          },
          // Time parameters
          timeRange: {
            type: Type.STRING,
            description: "Time range: hour, day, week, month, year, all",
            enum: ["hour", "day", "week", "month", "year", "all"]
          },
          // Filtering
          minScore: {
            type: Type.NUMBER,
            description: "Minimum score threshold for filtering"
          },
          minComments: {
            type: Type.NUMBER,
            description: "Minimum comment count for filtering"
          },
          // Domain filtering
          domain: {
            type: Type.STRING,
            description: "Domain to filter stories by (e.g., github.com, medium.com)"
          },
          // Comment parameters
          commentId: {
            type: Type.NUMBER,
            description: "Comment ID to fetch"
          },
          maxDepth: {
            type: Type.NUMBER,
            description: "Maximum depth for comment threads (default: 3)"
          },
          // Real-time parameters
          since: {
            type: Type.STRING,
            description: "Get items since this timestamp (ISO format)"
          },
          until: {
            type: Type.STRING,
            description: "Get items until this timestamp (ISO format)"
          },
          // Metrics and analytics
          includeMetrics: {
            type: Type.BOOLEAN,
            description: "Include detailed metrics and analytics"
          },
          includeUserInfo: {
            type: Type.BOOLEAN,
            description: "Include detailed user information"
          },
          // Digest parameters
          digestType: {
            type: Type.STRING,
            description: "Digest type: weekly, monthly, yearly",
            enum: ["weekly", "monthly", "yearly"]
          },
          // Activity parameters
          activityType: {
            type: Type.STRING,
            description: "Activity type: submissions, comments, all",
            enum: ["submissions", "comments", "all"]
          },
          // Similarity parameters
          similarityThreshold: {
            type: Type.NUMBER,
            description: "Similarity threshold (0.0-1.0, default: 0.7)"
          },
          // Real-time updates
          realtime: {
            type: Type.BOOLEAN,
            description: "Get real-time updates"
          },
          // Cache control
          useCache: {
            type: Type.BOOLEAN,
            description: "Use cached results if available (default: true)"
          },
          // Format options
          format: {
            type: Type.STRING,
            description: "Output format: json, markdown, html",
            enum: ["json", "markdown", "html"]
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`📰 HackerNews operation: ${args.action}`);
      
      // Check cache first if enabled
      if (args.useCache !== false) {
        const cacheKey = this.generateCacheKey(args);
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          console.log(`🎯 Cache hit for: ${args.action}`);
          return { success: true, cached: true, ...cached };
        }
      }

      let result;
      
      switch (args.action) {
        case "get_top_stories":
          result = await this.getTopStories(args);
          break;
        case "get_new_stories":
          result = await this.getNewStories(args);
          break;
        case "get_best_stories":
          result = await this.getBestStories(args);
          break;
        case "get_ask_hn":
          result = await this.getAskHN(args);
          break;
        case "get_show_hn":
          result = await this.getShowHN(args);
          break;
        case "get_job_stories":
          result = await this.getJobStories(args);
          break;
        case "get_story_details":
          result = await this.getStoryDetails(args);
          break;
        case "get_user_profile":
          result = await this.getUserProfile(args);
          break;
        case "get_user_submissions":
          result = await this.getUserProfile(args); // Use getUserProfile instead
          break;
        case "get_comments":
          result = await this.getComments(args);
          break;
        case "get_comment_thread":
          result = await this.getCommentThread(args);
          break;
        case "search_stories":
          result = await this.searchStories(args);
          break;
        case "get_latest_updates":
          result = await this.getLatestUpdates(args);
          break;
        case "get_max_item_id":
          result = await this.getMaxItemId();
          break;
        case "get_story_by_id":
          result = await this.getStoryById(args);
          break;
        case "get_user_karma":
          result = await this.getUserKarma(args);
          break;
        case "get_user_comments":
          result = await this.getUserComments(args);
          break;
        case "get_realtime_updates":
          result = await this.getRealtimeUpdates(args);
          break;
        case "get_trending_topics":
          result = await this.getTrendingTopics(args);
          break;
        case "get_weekly_digest":
          result = await this.getWeeklyDigest(args);
          break;
        case "get_monthly_digest":
          result = await this.getMonthlyDigest(args);
          break;
        case "get_yearly_digest":
          result = await this.getYearlyDigest(args);
          break;
        case "get_story_with_comments":
          result = await this.getStoryWithComments(args);
          break;
        case "get_user_activity":
          result = await this.getUserActivity(args);
          break;
        case "get_top_authors":
          result = await this.getTopAuthors(args);
          break;
        case "get_domain_info":
          result = await this.getDomainInfo(args);
          break;
        case "get_similar_stories":
          result = await this.getSimilarStories(args);
          break;
        case "get_story_metrics":
          result = await this.getStoryMetrics(args);
          break;
        case "get_comment_metrics":
          result = await this.getCommentMetrics(args);
          break;
        case "get_user_metrics":
          result = await this.getUserMetrics(args);
          break;
        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`
          };
      }

      // Cache the result if caching is enabled
      if (args.useCache !== false && result.success) {
        const cacheKey = this.generateCacheKey(args);
        this.saveToCache(cacheKey, result);
      }

      return result;

    } catch (error: unknown) {
      console.error("❌ HackerNews operation failed:", error);
      return {
        success: false,
        error: `HackerNews operation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Core API methods
  private async fetchFromAPI(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}/${endpoint}.json`;
    console.log(`📡 Fetching: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  private async fetchItem(itemId: number): Promise<any> {
    return await this.fetchFromAPI(`item/${itemId}`);
  }

  private async fetchUser(username: string): Promise<any> {
    return await this.fetchFromAPI(`user/${username}`);
  }

  // Story operations
  private async getTopStories(args: any): Promise<any> {
    const limit = Math.min(args.limit || 30, 500);
    const storyIds = await this.fetchFromAPI('topstories');
    const stories = await this.fetchMultipleItems(storyIds.slice(0, limit));
    
    return {
      success: true,
      stories: this.filterAndSortStories(stories, args),
      count: stories.length,
      type: "top",
      timestamp: new Date().toISOString()
    };
  }

  private async getNewStories(args: any): Promise<any> {
    const limit = Math.min(args.limit || 30, 500);
    const storyIds = await this.fetchFromAPI('newstories');
    const stories = await this.fetchMultipleItems(storyIds.slice(0, limit));
    
    return {
      success: true,
      stories: this.filterAndSortStories(stories, args),
      count: stories.length,
      type: "new",
      timestamp: new Date().toISOString()
    };
  }

  private async getBestStories(args: any): Promise<any> {
    const limit = Math.min(args.limit || 30, 500);
    const storyIds = await this.fetchFromAPI('beststories');
    const stories = await this.fetchMultipleItems(storyIds.slice(0, limit));
    
    return {
      success: true,
      stories: this.filterAndSortStories(stories, args),
      count: stories.length,
      type: "best",
      timestamp: new Date().toISOString()
    };
  }

  private async getAskHN(args: any): Promise<any> {
    const limit = Math.min(args.limit || 30, 500);
    const storyIds = await this.fetchFromAPI('askstories');
    const stories = await this.fetchMultipleItems(storyIds.slice(0, limit));
    
    return {
      success: true,
      stories: this.filterAndSortStories(stories, args),
      count: stories.length,
      type: "ask",
      timestamp: new Date().toISOString()
    };
  }

  private async getShowHN(args: any): Promise<any> {
    const limit = Math.min(args.limit || 30, 500);
    const storyIds = await this.fetchFromAPI('showstories');
    const stories = await this.fetchMultipleItems(storyIds.slice(0, limit));
    
    return {
      success: true,
      stories: this.filterAndSortStories(stories, args),
      count: stories.length,
      type: "show",
      timestamp: new Date().toISOString()
    };
  }

  private async getJobStories(args: any): Promise<any> {
    const limit = Math.min(args.limit || 30, 500);
    const storyIds = await this.fetchFromAPI('jobstories');
    const stories = await this.fetchMultipleItems(storyIds.slice(0, limit));
    
    return {
      success: true,
      stories: this.filterAndSortStories(stories, args),
      count: stories.length,
      type: "job",
      timestamp: new Date().toISOString()
    };
  }

  private async getStoryDetails(args: any): Promise<any> {
    const storyId = args.storyId;
    if (!storyId) {
      return { success: false, error: "storyId is required" };
    }

    const story = await this.fetchItem(storyId);
    if (!story) {
      return { success: false, error: "Story not found" };
    }

    // Fetch comments if requested
    if (args.includeComments && story.kids) {
      const comments = await this.fetchCommentsRecursively(story.kids, args.maxDepth || 3);
      story.comments = comments;
    }

    return {
      success: true,
      story: this.enhanceStory(story),
      timestamp: new Date().toISOString()
    };
  }

  private async getUserProfile(args: any): Promise<any> {
    const username = args.username;
    if (!username) {
      return { success: false, error: "username is required" };
    }

    const user = await this.fetchUser(username);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const profile: any = {
      id: user.id,
      karma: user.karma || 0,
      created: user.created ? new Date(user.created * 1000).toISOString() : null,
      about: user.about || '',
      submitted: user.submitted || [],
      submissionCount: user.submitted ? user.submitted.length : 0,
      avg: user.avg || null,
      delay: user.delay || null
    };

    // Fetch recent submissions if requested
    if (args.includeSubmissions && user.submitted) {
      const recentSubmissions = await this.fetchMultipleItems(user.submitted.slice(-10));
      profile.recentSubmissions = recentSubmissions.filter(item => item !== null);
    }

    return {
      success: true,
      user: profile,
      timestamp: new Date().toISOString()
    };
  }

  // Comment operations
  private async getComments(args: any): Promise<any> {
    const storyId = args.storyId;
    if (!storyId) {
      return { success: false, error: "storyId is required" };
    }

    const story = await this.fetchItem(storyId);
    if (!story || !story.kids) {
      return { success: false, error: "No comments found for this story" };
    }

    const comments = await this.fetchCommentsRecursively(story.kids, args.maxDepth || 3);
    
    return {
      success: true,
      comments: comments,
      count: comments.length,
      storyId: storyId,
      timestamp: new Date().toISOString()
    };
  }

  private async getCommentThread(args: any): Promise<any> {
    const commentId = args.commentId;
    if (!commentId) {
      return { success: false, error: "commentId is required" };
    }

    const comment = await this.fetchItem(commentId);
    if (!comment) {
      return { success: false, error: "Comment not found" };
    }

    // Fetch replies if they exist
    if (comment.kids) {
      const replies = await this.fetchCommentsRecursively(comment.kids, args.maxDepth || 2);
      comment.replies = replies;
    }

    return {
      success: true,
      comment: this.enhanceComment(comment),
      timestamp: new Date().toISOString()
    };
  }

  // Utility methods
  private async fetchMultipleItems(itemIds: number[]): Promise<any[]> {
    const promises = itemIds.map(id => this.fetchItem(id));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => (result as PromiseFulfilledResult<any>).value);
  }

  private async fetchCommentsRecursively(commentIds: number[], maxDepth: number, currentDepth: number = 0): Promise<any[]> {
    if (currentDepth >= maxDepth || !commentIds || commentIds.length === 0) {
      return [];
    }

    const comments = await this.fetchMultipleItems(commentIds);
    
    // Fetch replies for each comment
    for (const comment of comments) {
      if (comment && comment.kids) {
        const replies = await this.fetchCommentsRecursively(comment.kids, maxDepth, currentDepth + 1);
        comment.replies = replies;
      }
    }

    return comments.filter(comment => comment !== null);
  }

  private filterAndSortStories(stories: HackerNewsStory[], args: any): HackerNewsStory[] {
    let filtered = stories.filter((story: HackerNewsStory) => story !== null);

    // Filter by score
    if (args.minScore) {
      filtered = filtered.filter((story: HackerNewsStory) => (story.score || 0) >= args.minScore);
    }

    // Filter by comment count
    if (args.minComments) {
      filtered = filtered.filter((story: HackerNewsStory) => (story.descendants || 0) >= args.minComments);
    }

    // Filter by time range
    if (args.timeRange) {
      const now = Date.now();
      const timeRanges: Record<string, number> = {
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000
      };
      const cutoff = now - (timeRanges[args.timeRange] || timeRanges.day);
      filtered = filtered.filter((story: HackerNewsStory) => (story.time || 0) * 1000 >= cutoff);
    }

    // Sort by score (descending)
    filtered.sort((a, b) => (b.score || 0) - (a.score || 0));

    return filtered;
  }

  private enhanceStory(story: HackerNewsStory): EnhancedStory {
    return {
      ...story,
      timeFormatted: story.time ? new Date(story.time * 1000).toISOString() : null,
      scoreFormatted: story.score ? `${story.score} points` : '0 points',
      commentCount: story.descendants || 0,
      commentCountFormatted: story.descendants ? `${story.descendants} comments` : '0 comments',
      url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      hnUrl: `https://news.ycombinator.com/item?id=${story.id}`
    };
  }

  private enhanceComment(comment: HackerNewsComment): EnhancedComment {
    return {
      ...comment,
      timeFormatted: comment.time ? new Date(comment.time * 1000).toISOString() : null,
      text: comment.text || '',
      author: comment.by || '[deleted]',
      points: comment.score || 0,
      pointsFormatted: comment.score ? `${comment.score} points` : '0 points'
    };
  }

  // Cache methods
  private generateCacheKey(args: any): string {
    return JSON.stringify({ ...args, timestamp: Math.floor(Date.now() / this.cacheTimeout) });
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private saveToCache(key: string, data: any): void {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  // Search functionality (simplified client-side search)
  private async searchStories(args: any): Promise<any> {
    const query = args.searchQuery?.toLowerCase();
    if (!query) {
      return { success: false, error: "searchQuery is required" };
    }

    // Get recent stories and filter locally
    const recentStories = await this.getNewStories({ ...args, limit: 100 });
    if (!recentStories.success) {
      return recentStories;
    }

    const filtered = recentStories.stories.filter((story: HackerNewsStory) => {
      const title = (story.title || '').toLowerCase();
      const text = (story.text || '').toLowerCase();
      const author = (story.by || '').toLowerCase();
      
      switch (args.searchType) {
        case 'title':
          return title.includes(query);
        case 'text':
          return text.includes(query);
        case 'author':
          return author.includes(query);
        case 'url':
          return (story.url || '').toLowerCase().includes(query);
        default:
          return title.includes(query) || text.includes(query) || author.includes(query);
      }
    });

    return {
      success: true,
      query: args.searchQuery,
      results: filtered.length,
      stories: filtered.slice(0, args.limit || 30),
      timestamp: new Date().toISOString()
    };
  }

  // Real-time updates
  private async getLatestUpdates(args: any): Promise<any> {
    const maxItemId = await this.getMaxItemId();
    if (!maxItemId.success) {
      return maxItemId;
    }

    const recentIds = [];
    for (let i = maxItemId.maxId; i > Math.max(0, maxItemId.maxId - 100); i--) {
      recentIds.push(i);
    }

    const items = await this.fetchMultipleItems(recentIds);
    const stories = items.filter(item => item && !item.deleted && item.type === 'story');
    const comments = items.filter(item => item && !item.deleted && item.type === 'comment');

    return {
      success: true,
      stories: stories.slice(0, args.limit || 20),
      comments: comments.slice(0, args.limit || 20),
      maxId: maxItemId.maxId,
      timestamp: new Date().toISOString()
    };
  }

  private async getMaxItemId(): Promise<any> {
    const maxId = await this.fetchFromAPI('maxitem');
    return {
      success: true,
      maxId: maxId,
      timestamp: new Date().toISOString()
    };
  }

  private async getStoryById(args: any): Promise<any> {
    const storyId = args.storyId;
    if (!storyId) {
      return { success: false, error: "storyId is required" };
    }

    const story = await this.fetchItem(storyId);
    if (!story) {
      return { success: false, error: "Story not found" };
    }

    return {
      success: true,
      story: this.enhanceStory(story),
      timestamp: new Date().toISOString()
    };
  }

  // Placeholder methods for future implementation
  private async getUserKarma(args: any): Promise<any> {
    return { success: false, error: "getUserKarma not yet implemented" };
  }

  private async getUserComments(args: any): Promise<any> {
    return { success: false, error: "getUserComments not yet implemented" };
  }

  private async getRealtimeUpdates(args: any): Promise<any> {
    return { success: false, error: "getRealtimeUpdates not yet implemented" };
  }

  private async getTrendingTopics(args: any): Promise<any> {
    return { success: false, error: "getTrendingTopics not yet implemented" };
  }

  private async getWeeklyDigest(args: any): Promise<any> {
    return { success: false, error: "getWeeklyDigest not yet implemented" };
  }

  private async getMonthlyDigest(args: any): Promise<any> {
    return { success: false, error: "getMonthlyDigest not yet implemented" };
  }

  private async getYearlyDigest(args: any): Promise<any> {
    return { success: false, error: "getYearlyDigest not yet implemented" };
  }

  private async getStoryWithComments(args: any): Promise<any> {
    return { success: false, error: "getStoryWithComments not yet implemented" };
  }

  private async getUserActivity(args: any): Promise<any> {
    return { success: false, error: "getUserActivity not yet implemented" };
  }

  private async getTopAuthors(args: any): Promise<any> {
    return { success: false, error: "getTopAuthors not yet implemented" };
  }

  private async getDomainInfo(args: any): Promise<any> {
    return { success: false, error: "getDomainInfo not yet implemented" };
  }

  private async getSimilarStories(args: any): Promise<any> {
    return { success: false, error: "getSimilarStories not yet implemented" };
  }

  private async getStoryMetrics(args: any): Promise<any> {
    return { success: false, error: "getStoryMetrics not yet implemented" };
  }

  private async getCommentMetrics(args: any): Promise<any> {
    return { success: false, error: "getCommentMetrics not yet implemented" };
  }

  private async getUserMetrics(args: any): Promise<any> {
    return { success: false, error: "getUserMetrics not yet implemented" };
  }

  // Static utility methods
  static createTopStoriesRequest(limit: number = 30): any {
    return {
      action: "get_top_stories",
      limit
    };
  }

  static createNewStoriesRequest(limit: number = 30): any {
    return {
      action: "get_new_stories",
      limit
    };
  }

  static createStoryDetailsRequest(storyId: number, includeComments: boolean = true): any {
    return {
      action: "get_story_details",
      storyId,
      includeComments
    };
  }

  static createUserProfileRequest(username: string): any {
    return {
      action: "get_user_profile",
      username
    };
  }

  static createSearchRequest(query: string, searchType: string = 'text', limit: number = 30): any {
    return {
      action: "search_stories",
      searchQuery: query,
      searchType,
      limit
    };
  }
}
