//ai/tools/LinkedInTool.ts
import { FunctionDeclaration, Type } from "@google/genai";
import { getValidOAuthAccessToken } from "@/lib/oauth-refresh";

export class LinkedInTool {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "linkedin_operations",
      description: "Interact with LinkedIn to manage profile, posts, connections, messaging, and company pages. Requires LinkedIn OAuth connection.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: [
              "get_profile",
              "update_profile",
              "create_post",
              "delete_post",
              "get_post",
              "get_posts",
              "search_posts",
              "like_post",
              "comment_on_post",
              "get_connections",
              "send_connection_request",
              "get_messages",
              "send_message",
              "get_company_profile",
              "update_company_profile",
              "create_company_post",
              "get_company_followers",
              "search_companies",
              "get_user_analytics",
              "get_post_analytics",
              "get_network_updates",
              "get_invitations",
              "accept_invitation",
              "ignore_invitation",
              "get_skills",
              "add_skill",
              "remove_skill",
              "get_recommendations",
              "request_recommendation"
            ]
          },
          // Profile parameters
          profileId: {
            type: Type.STRING,
            description: "LinkedIn profile ID (URN format). Use 'me' for current user"
          },
          // Post parameters
          postId: {
            type: Type.STRING,
            description: "LinkedIn post ID for get_post, delete_post, like_post, comment_on_post"
          },
          postContent: {
            type: Type.STRING,
            description: "Content for creating a post (required for create_post)"
          },
          postVisibility: {
            type: Type.STRING,
            description: "Post visibility setting",
            enum: ["PUBLIC", "CONNECTIONS", "GROUP"]
          },
          isReshare: {
            type: Type.BOOLEAN,
            description: "Whether the post is a reshare"
          },
          originalPostId: {
            type: Type.STRING,
            description: "Original post ID if this is a reshare"
          },
          // Comment parameters
          commentText: {
            type: Type.STRING,
            description: "Text content for comment"
          },
          // Search parameters
          query: {
            type: Type.STRING,
            description: "Search query for posts, companies, or people"
          },
          searchType: {
            type: Type.STRING,
            description: "Type of search",
            enum: ["posts", "companies", "people", "jobs"]
          },
          maxResults: {
            type: Type.NUMBER,
            description: "Maximum number of results to return (default: 10, max: 100)"
          },
          // Pagination
          start: {
            type: Type.NUMBER,
            description: "Starting index for pagination"
          },
          // Connection parameters
          connectionId: {
            type: Type.STRING,
            description: "LinkedIn member ID for connection operations"
          },
          message: {
            type: Type.STRING,
            description: "Message text for connection request or direct message"
          },
          // Company parameters
          companyId: {
            type: Type.STRING,
            description: "LinkedIn company ID for company operations"
          },
          companyName: {
            type: Type.STRING,
            description: "Company name for search or creation"
          },
          companyDescription: {
            type: Type.STRING,
            description: "Company description for profile updates"
          },
          companyWebsite: {
            type: Type.STRING,
            description: "Company website URL"
          },
          companyIndustry: {
            type: Type.STRING,
            description: "Company industry type"
          },
          companySize: {
            type: Type.STRING,
            description: "Company size range",
            enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001-10000", "10001+"]
          },
          // Analytics parameters
          analyticsType: {
            type: Type.STRING,
            description: "Type of analytics to retrieve",
            enum: ["profile_views", "post_impressions", "network_growth", "search_appearances"]
          },
          timeRange: {
            type: Type.STRING,
            description: "Time range for analytics",
            enum: ["day", "week", "month", "quarter", "year"]
          },
          // Skill parameters
          skillName: {
            type: Type.STRING,
            description: "Skill name for add_skill action"
          },
          skillId: {
            type: Type.STRING,
            description: "Skill ID for remove_skill action"
          },
          // Recommendation parameters
          recommenderId: {
            type: Type.STRING,
            description: "LinkedIn member ID for recommendation request"
          },
          relationship: {
            type: Type.STRING,
            description: "Relationship type for recommendation",
            enum: ["colleague", "manager", "direct_report", "client", "vendor", "partner", "student", "professor", "alumni"]
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const accessToken = await getValidOAuthAccessToken(this.userId, "linkedin");

      if (!accessToken) {
        return {
          success: false,
          error: "LinkedIn OAuth connection not found. Please connect your LinkedIn account first."
        };
      }

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      };

      switch (args.action) {
        case "get_profile":
          return await this.getProfile(args, headers);
        case "update_profile":
          return await this.updateProfile(args, headers);
        case "create_post":
          return await this.createPost(args, headers);
        case "delete_post":
          return await this.deletePost(args, headers);
        case "get_post":
          return await this.getPost(args, headers);
        case "get_posts":
          return await this.getPosts(args, headers);
        case "search_posts":
          return await this.searchPosts(args, headers);
        case "like_post":
          return await this.likePost(args, headers);
        case "comment_on_post":
          return await this.commentOnPost(args, headers);
        case "get_connections":
          return await this.getConnections(args, headers);
        case "send_connection_request":
          return await this.sendConnectionRequest(args, headers);
        case "get_messages":
          return await this.getMessages(args, headers);
        case "send_message":
          return await this.sendMessage(args, headers);
        case "get_company_profile":
          return await this.getCompanyProfile(args, headers);
        case "update_company_profile":
          return await this.updateCompanyProfile(args, headers);
        case "create_company_post":
          return await this.createCompanyPost(args, headers);
        case "get_company_followers":
          return await this.getCompanyFollowers(args, headers);
        case "search_companies":
          return await this.searchCompanies(args, headers);
        case "get_user_analytics":
          return await this.getUserAnalytics(args, headers);
        case "get_post_analytics":
          return await this.getPostAnalytics(args, headers);
        case "get_network_updates":
          return await this.getNetworkUpdates(args, headers);
        case "get_invitations":
          return await this.getInvitations(args, headers);
        case "accept_invitation":
          return await this.acceptInvitation(args, headers);
        case "ignore_invitation":
          return await this.ignoreInvitation(args, headers);
        case "get_skills":
          return await this.getSkills(args, headers);
        case "add_skill":
          return await this.addSkill(args, headers);
        case "remove_skill":
          return await this.removeSkill(args, headers);
        case "get_recommendations":
          return await this.getRecommendations(args, headers);
        case "request_recommendation":
          return await this.requestRecommendation(args, headers);
        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`
          };
      }
    } catch (error: unknown) {
      console.error("❌ LinkedIn operation failed:", error);
      return {
        success: false,
        error: `LinkedIn operation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async getProfile(args: any, headers: any): Promise<any> {
    const profileId = args.profileId || 'me';
    const response = await fetch(`https://api.linkedin.com/v2/people/${profileId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get profile: ${error}` };
    }

    const profile = await response.json();
    return {
      success: true,
      profile: this.parseProfile(profile)
    };
  }

  private async updateProfile(args: any, headers: any): Promise<any> {
    const profileData: any = {};
    
    if (args.profileSummary) profileData.summary = args.profileSummary;
    if (args.headline) profileData.headline = args.headline;
    if (args.industry) profileData.industry = args.industry;
    if (args.location) profileData.location = args.location;

    const response = await fetch('https://api.linkedin.com/v2/people/me', {
      method: 'PATCH',
      headers,
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to update profile: ${error}` };
    }

    return { success: true, message: "Profile updated successfully" };
  }

  private async createPost(args: any, headers: any): Promise<any> {
    if (!args.postContent) {
      return { success: false, error: "Post content is required for creating a post" };
    }

    const postData: any = {
      author: `urn:li:person:${args.profileId || 'me'}`,
      commentary: args.postContent,
      visibility: args.postVisibility || 'PUBLIC'
    };

    if (args.isReshare && args.originalPostId) {
      postData.content = {
        entity: `urn:li:share:${args.originalPostId}`
      };
    }

    const response = await fetch('https://api.linkedin.com/v2/posts', {
      method: 'POST',
      headers,
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create post: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      postId: result.id,
      message: "Post created successfully"
    };
  }

  private async deletePost(args: any, headers: any): Promise<any> {
    if (!args.postId) {
      return { success: false, error: "Post ID is required for deletion" };
    }

    const response = await fetch(`https://api.linkedin.com/v2/posts/${args.postId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to delete post: ${error}` };
    }

    return { success: true, message: "Post deleted successfully" };
  }

  private async getPost(args: any, headers: any): Promise<any> {
    if (!args.postId) {
      return { success: false, error: "Post ID is required" };
    }

    const response = await fetch(`https://api.linkedin.com/v2/posts/${args.postId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get post: ${error}` };
    }

    const post = await response.json();
    return {
      success: true,
      post: this.parsePost(post)
    };
  }

  private async getPosts(args: any, headers: any): Promise<any> {
    const params = new URLSearchParams();
    if (args.maxResults) params.append('count', String(Math.min(args.maxResults, 100)));
    if (args.start) params.append('start', String(args.start));

    const response = await fetch(`https://api.linkedin.com/v2/posts?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get posts: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      posts: result.elements?.map((post: any) => this.parsePost(post)) || [],
      total: result.paging?.total || 0,
      start: result.paging?.start || 0,
      count: result.paging?.count || 0
    };
  }

  private async searchPosts(args: any, headers: any): Promise<any> {
    if (!args.query) {
      return { success: false, error: "Search query is required" };
    }

    const params = new URLSearchParams();
    params.append('q', args.query);
    if (args.maxResults) params.append('count', String(Math.min(args.maxResults, 100)));
    if (args.start) params.append('start', String(args.start));

    const response = await fetch(`https://api.linkedin.com/v2/posts/search?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to search posts: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      posts: result.elements?.map((post: any) => this.parsePost(post)) || [],
      total: result.paging?.total || 0
    };
  }

  private async likePost(args: any, headers: any): Promise<any> {
    if (!args.postId) {
      return { success: false, error: "Post ID is required for liking" };
    }

    const likeData = {
      actor: `urn:li:person:${args.profileId || 'me'}`,
      object: `urn:li:post:${args.postId}`
    };

    const response = await fetch('https://api.linkedin.com/v2/reactions', {
      method: 'POST',
      headers,
      body: JSON.stringify(likeData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to like post: ${error}` };
    }

    return { success: true, message: "Post liked successfully" };
  }

  private async commentOnPost(args: any, headers: any): Promise<any> {
    if (!args.postId || !args.commentText) {
      return { success: false, error: "Post ID and comment text are required" };
    }

    const commentData = {
      actor: `urn:li:person:${args.profileId || 'me'}`,
      object: `urn:li:post:${args.postId}`,
      message: {
        text: args.commentText
      }
    };

    const response = await fetch('https://api.linkedin.com/v2/comments', {
      method: 'POST',
      headers,
      body: JSON.stringify(commentData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to comment on post: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      commentId: result.id,
      message: "Comment added successfully"
    };
  }

  private async getConnections(args: any, headers: any): Promise<any> {
    const params = new URLSearchParams();
    if (args.maxResults) params.append('count', String(Math.min(args.maxResults, 100)));
    if (args.start) params.append('start', String(args.start));

    const response = await fetch(`https://api.linkedin.com/v2/connections?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get connections: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      connections: result.elements || [],
      total: result.paging?.total || 0
    };
  }

  private async sendConnectionRequest(args: any, headers: any): Promise<any> {
    if (!args.connectionId) {
      return { success: false, error: "Connection ID is required" };
    }

    const invitationData = {
      invitee: `urn:li:person:${args.connectionId}`,
      message: args.message || undefined
    };

    const response = await fetch('https://api.linkedin.com/v2/invitations', {
      method: 'POST',
      headers,
      body: JSON.stringify(invitationData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to send connection request: ${error}` };
    }

    return { success: true, message: "Connection request sent successfully" };
  }

  private async getMessages(args: any, headers: any): Promise<any> {
    const params = new URLSearchParams();
    if (args.maxResults) params.append('count', String(Math.min(args.maxResults, 100)));
    if (args.start) params.append('start', String(args.start));

    const response = await fetch(`https://api.linkedin.com/v2/messages?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get messages: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      messages: result.elements?.map((msg: any) => this.parseMessage(msg)) || [],
      total: result.paging?.total || 0
    };
  }

  private async sendMessage(args: any, headers: any): Promise<any> {
    if (!args.connectionId || !args.message) {
      return { success: false, error: "Connection ID and message are required" };
    }

    const messageData = {
      recipients: [`urn:li:person:${args.connectionId}`],
      sender: `urn:li:person:${args.profileId || 'me'}`,
      message: {
        text: args.message
      }
    };

    const response = await fetch('https://api.linkedin.com/v2/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify(messageData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to send message: ${error}` };
    }

    return { success: true, message: "Message sent successfully" };
  }

  private async getCompanyProfile(args: any, headers: any): Promise<any> {
    if (!args.companyId) {
      return { success: false, error: "Company ID is required" };
    }

    const response = await fetch(`https://api.linkedin.com/v2/companies/${args.companyId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get company profile: ${error}` };
    }

    const company = await response.json();
    return {
      success: true,
      company: this.parseCompany(company)
    };
  }

  private async updateCompanyProfile(args: any, headers: any): Promise<any> {
    if (!args.companyId) {
      return { success: false, error: "Company ID is required" };
    }

    const companyData: any = {};
    if (args.companyName) companyData.name = args.companyName;
    if (args.companyDescription) companyData.description = args.companyDescription;
    if (args.companyWebsite) companyData.websiteUrl = args.companyWebsite;
    if (args.companyIndustry) companyData.industry = args.companyIndustry;
    if (args.companySize) companyData.companySize = args.companySize;

    const response = await fetch(`https://api.linkedin.com/v2/companies/${args.companyId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(companyData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to update company profile: ${error}` };
    }

    return { success: true, message: "Company profile updated successfully" };
  }

  private async createCompanyPost(args: any, headers: any): Promise<any> {
    if (!args.companyId || !args.postContent) {
      return { success: false, error: "Company ID and post content are required" };
    }

    const postData = {
      author: `urn:li:organization:${args.companyId}`,
      commentary: args.postContent,
      visibility: args.postVisibility || 'PUBLIC'
    };

    const response = await fetch('https://api.linkedin.com/v2/posts', {
      method: 'POST',
      headers,
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create company post: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      postId: result.id,
      message: "Company post created successfully"
    };
  }

  private async getCompanyFollowers(args: any, headers: any): Promise<any> {
    if (!args.companyId) {
      return { success: false, error: "Company ID is required" };
    }

    const params = new URLSearchParams();
    if (args.maxResults) params.append('count', String(Math.min(args.maxResults, 100)));
    if (args.start) params.append('start', String(args.start));

    const response = await fetch(`https://api.linkedin.com/v2/companies/${args.companyId}/followers?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get company followers: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      followers: result.elements || [],
      total: result.paging?.total || 0
    };
  }

  private async searchCompanies(args: any, headers: any): Promise<any> {
    if (!args.query) {
      return { success: false, error: "Search query is required" };
    }

    const params = new URLSearchParams();
    params.append('q', args.query);
    if (args.maxResults) params.append('count', String(Math.min(args.maxResults, 100)));
    if (args.start) params.append('start', String(args.start));

    const response = await fetch(`https://api.linkedin.com/v2/companies/search?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to search companies: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      companies: result.elements?.map((company: any) => this.parseCompany(company)) || [],
      total: result.paging?.total || 0
    };
  }

  private async getUserAnalytics(args: any, headers: any): Promise<any> {
    const analyticsType = args.analyticsType || 'profile_views';
    const timeRange = args.timeRange || 'month';

    const response = await fetch(`https://api.linkedin.com/v2/people/me/analytics?type=${analyticsType}&timeRange=${timeRange}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get user analytics: ${error}` };
    }

    const analytics = await response.json();
    return {
      success: true,
      analytics: analytics
    };
  }

  private async getPostAnalytics(args: any, headers: any): Promise<any> {
    if (!args.postId) {
      return { success: false, error: "Post ID is required for analytics" };
    }

    const response = await fetch(`https://api.linkedin.com/v2/posts/${args.postId}/analytics`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get post analytics: ${error}` };
    }

    const analytics = await response.json();
    return {
      success: true,
      analytics: analytics
    };
  }

  private async getNetworkUpdates(args: any, headers: any): Promise<any> {
    const params = new URLSearchParams();
    if (args.maxResults) params.append('count', String(Math.min(args.maxResults, 100)));
    if (args.start) params.append('start', String(args.start));

    const response = await fetch(`https://api.linkedin.com/v2/people/me/network/updates?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get network updates: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      updates: result.elements || [],
      total: result.paging?.total || 0
    };
  }

  private async getInvitations(args: any, headers: any): Promise<any> {
    const params = new URLSearchParams();
    params.append('q', 'invitation');
    if (args.maxResults) params.append('count', String(Math.min(args.maxResults, 100)));
    if (args.start) params.append('start', String(args.start));

    const response = await fetch(`https://api.linkedin.com/v2/invitations?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get invitations: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      invitations: result.elements || [],
      total: result.paging?.total || 0
    };
  }

  private async acceptInvitation(args: any, headers: any): Promise<any> {
    if (!args.invitationId) {
      return { success: false, error: "Invitation ID is required" };
    }

    const response = await fetch(`https://api.linkedin.com/v2/invitations/${args.invitationId}/accept`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to accept invitation: ${error}` };
    }

    return { success: true, message: "Invitation accepted successfully" };
  }

  private async ignoreInvitation(args: any, headers: any): Promise<any> {
    if (!args.invitationId) {
      return { success: false, error: "Invitation ID is required" };
    }

    const response = await fetch(`https://api.linkedin.com/v2/invitations/${args.invitationId}/ignore`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to ignore invitation: ${error}` };
    }

    return { success: true, message: "Invitation ignored successfully" };
  }

  private async getSkills(args: any, headers: any): Promise<any> {
    const profileId = args.profileId || 'me';
    const response = await fetch(`https://api.linkedin.com/v2/people/${profileId}/skills`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get skills: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      skills: result.elements || []
    };
  }

  private async addSkill(args: any, headers: any): Promise<any> {
    if (!args.skillName) {
      return { success: false, error: "Skill name is required" };
    }

    const skillData = {
      name: args.skillName
    };

    const response = await fetch('https://api.linkedin.com/v2/people/me/skills', {
      method: 'POST',
      headers,
      body: JSON.stringify(skillData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to add skill: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      skillId: result.id,
      message: "Skill added successfully"
    };
  }

  private async removeSkill(args: any, headers: any): Promise<any> {
    if (!args.skillId) {
      return { success: false, error: "Skill ID is required" };
    }

    const response = await fetch(`https://api.linkedin.com/v2/people/me/skills/${args.skillId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to remove skill: ${error}` };
    }

    return { success: true, message: "Skill removed successfully" };
  }

  private async getRecommendations(args: any, headers: any): Promise<any> {
    const profileId = args.profileId || 'me';
    const response = await fetch(`https://api.linkedin.com/v2/people/${profileId}/recommendations`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get recommendations: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      recommendations: result.elements || []
    };
  }

  private async requestRecommendation(args: any, headers: any): Promise<any> {
    if (!args.recommenderId || !args.relationship) {
      return { success: false, error: "Recommender ID and relationship are required" };
    }

    const recommendationData = {
      recommender: `urn:li:person:${args.recommenderId}`,
      relationship: args.relationship,
      message: args.message || undefined
    };

    const response = await fetch('https://api.linkedin.com/v2/people/me/recommendations', {
      method: 'POST',
      headers,
      body: JSON.stringify(recommendationData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to request recommendation: ${error}` };
    }

    return { success: true, message: "Recommendation requested successfully" };
  }

  // Helper methods for parsing responses
  private parseProfile(profile: any): any {
    return {
      id: profile.id,
      firstName: profile.localizedFirstName,
      lastName: profile.localizedLastName,
      headline: profile.headline?.localized?.en_US,
      summary: profile.summary?.localized?.en_US,
      industry: profile.industry,
      location: profile.locationName?.localized?.en_US,
      profilePicture: profile.profilePicture?.displayImage,
      publicIdentifier: profile.publicIdentifier,
      vanityName: profile.vanityName,
      lastModified: profile.lastModified
    };
  }

  private parsePost(post: any): any {
    return {
      id: post.id,
      author: post.author,
      commentary: post.commentary?.localized?.en_US,
      content: post.content,
      visibility: post.visibility,
      createdAt: post.createdAt,
      lastModified: post.lastModified,
      likes: post.likesSummary?.totalLikes || 0,
      comments: post.commentsSummary?.totalComments || 0,
      shares: post.sharesSummary?.totalShares || 0
    };
  }

  private parseCompany(company: any): any {
    return {
      id: company.id,
      name: company.localizedName,
      description: company.description?.localized?.en_US,
      websiteUrl: company.websiteUrl,
      industry: company.industry,
      companySize: company.companySize,
      founded: company.founded,
      followers: company.followersCount,
      locations: company.locations,
      specialties: company.specialties,
      type: company.type,
      universalName: company.universalName
    };
  }

  private parseMessage(message: any): any {
    return {
      id: message.id,
      sender: message.sender,
      recipients: message.recipients,
      subject: message.subject,
      body: message.body?.text,
      createdAt: message.createdAt,
      read: message.read
    };
  }
}
