import { FunctionDeclaration, Type } from "@google/genai";

export class WordPressTool {
  private siteUrl: string;
  private username: string;
  private applicationPassword: string;
  private baseUrl: string;

  constructor(siteUrl?: string, username?: string, applicationPassword?: string) {
    this.siteUrl = siteUrl || '';
    this.username = username || '';
    this.applicationPassword = applicationPassword || '';
    this.baseUrl = siteUrl ? `${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2` : '';
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "wordpress_management",
      description: "Comprehensive WordPress REST API management tool for complete website operations. Create, read, update, and delete posts, pages, media, users, comments, categories, and tags. Supports bulk operations, advanced filtering, custom post types, and complete content management workflows. Perfect for headless WordPress implementations, content automation, blog management, e-commerce integration, and multi-site administration. Handles authentication via Application Passwords, JWT tokens, and provides seamless integration with WordPress ecosystems.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "WordPress operation to perform. Options: 'setup_site' (configure WordPress connection), 'discover_site' (auto-detect WordPress installation), 'create_post' (new blog post/article), 'get_post' (retrieve post content), 'update_post' (modify existing post), 'delete_post' (remove post), 'list_posts' (browse posts with filters), 'create_page' (new static page), 'get_page' (retrieve page), 'update_page' (modify page), 'list_pages' (browse pages), 'upload_media' (add images/files), 'get_media' (retrieve media info), 'list_media' (browse media library), 'create_user' (add new user), 'get_user' (user details), 'list_users' (browse users), 'create_comment' (add comment), 'list_comments' (browse comments), 'create_category' (new category), 'list_categories' (browse categories), 'create_tag' (new tag), 'list_tags' (browse tags), 'search_content' (global search), 'get_site_info' (WordPress details), 'bulk_create_posts' (multiple posts), 'get_post_revisions' (version history)."
          },
          siteUrl: {
            type: Type.STRING,
            description: "WordPress site URL (required for setup_site). Include protocol and domain. Examples: 'https://mysite.com', 'https://blog.company.com'. Must be accessible and have REST API enabled. Used as base for all API endpoints."
          },
          username: {
            type: Type.STRING,
            description: "WordPress username for authentication (required for setup_site). Must be existing WordPress user with appropriate permissions. Used with Application Password for secure API access without exposing main password."
          },
          applicationPassword: {
            type: Type.STRING,
            description: "WordPress Application Password for secure authentication (required for setup_site). Generate in WordPress Admin > Users > Profile > Application Passwords. Format: 'xxxx xxxx xxxx xxxx xxxx xxxx'. Preferred authentication method for REST API."
          },
          postId: {
            type: Type.NUMBER,
            description: "Post identifier for operations on specific posts (required for get_post, update_post, delete_post, get_post_revisions). Example: 123. Used to target specific blog posts or custom post type entries."
          },
          pageId: {
            type: Type.NUMBER,
            description: "Page identifier for page-specific operations (required for get_page, update_page). Example: 456. Used to target specific WordPress pages for content management."
          },
          userId: {
            type: Type.NUMBER,
            description: "User identifier for user operations (required for get_user). Example: 789. Used to target specific WordPress users for profile management and user operations."
          },
          mediaId: {
            type: Type.NUMBER,
            description: "Media attachment identifier (required for get_media). Example: 321. Used to target specific images, documents, or media files in WordPress media library."
          },
          commentId: {
            type: Type.NUMBER,
            description: "Comment identifier for comment operations. Example: 654. Used to target specific comments for moderation, replies, or content management."
          },
          categoryId: {
            type: Type.NUMBER,
            description: "Category identifier for category operations. Example: 987. Used to target specific categories for taxonomy management and content organization."
          },
          tagId: {
            type: Type.NUMBER,
            description: "Tag identifier for tag operations. Example: 147. Used to target specific tags for taxonomy management and content tagging."
          },
          title: {
            type: Type.STRING,
            description: "Post/page title (required for create_post, create_page). Examples: 'How to Use WordPress API', '10 Best Practices for SEO'. Becomes the main heading and URL slug. Keep descriptive and SEO-friendly."
          },
          content: {
            type: Type.STRING,
            description: "Post/page content body (required for create_post, create_page). Supports HTML markup, WordPress blocks (Gutenberg), and shortcodes. Can include images, links, formatting. Use WordPress block editor syntax for modern content."
          },
          excerpt: {
            type: Type.STRING,
            description: "Post excerpt or summary for social sharing and archives. Brief description of content, typically 1-2 sentences. Used in post previews, RSS feeds, and meta descriptions for SEO."
          },
          status: {
            type: Type.STRING,
            description: "Publication status for posts/pages. Options: 'publish' (live content), 'draft' (unpublished work), 'private' (admin-only), 'future' (scheduled), 'pending' (awaiting review). Default: 'draft'. Choose based on content workflow."
          },
          categories: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: "Category IDs to assign to post. Examples: [1, 5, 12]. Used for content organization and navigation. Categories are hierarchical taxonomy for grouping related content."
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: "Tag IDs to assign to post. Examples: [23, 45, 67]. Used for content discovery and cross-referencing. Tags are non-hierarchical keywords for content association."
          },
          featuredMedia: {
            type: Type.NUMBER,
            description: "Featured image media ID for posts/pages. Example: 234. Sets the main image displayed with content in themes and social sharing. Must be existing media library item."
          },
          author: {
            type: Type.NUMBER,
            description: "Author user ID for content attribution (default: current user). Example: 1. Used for content ownership, author pages, and byline display in themes."
          },
          slug: {
            type: Type.STRING,
            description: "URL slug for posts/pages (auto-generated from title if not provided). Examples: 'wordpress-api-guide', 'contact-us'. Used in permanent URLs. Keep short, descriptive, and SEO-friendly."
          },
          metaFields: {
            type: Type.OBJECT,
            description: "Custom meta fields for posts/pages. Format: {'field_name': 'value'}. Examples: {'seo_title': 'Custom Title', 'custom_field': 'value'}. Used for custom data, SEO, and theme-specific content."
          },
          password: {
            type: Type.STRING,
            description: "Password for protected posts/pages. When set, content requires password to view. Used for member-only content or restricted access materials."
          },
          parent: {
            type: Type.NUMBER,
            description: "Parent page ID for hierarchical content structure. Example: 10. Used to create page hierarchies and navigation trees. Only applicable for pages and hierarchical post types."
          },
          menuOrder: {
            type: Type.NUMBER,
            description: "Custom ordering number for pages/posts. Example: 5. Lower numbers appear first. Used for manual content ordering when not sorting by date or alphabetically."
          },
          commentStatus: {
            type: Type.STRING,
            description: "Comment permission for posts. Options: 'open' (allow comments), 'closed' (no comments). Default follows site settings. Controls user engagement and interaction."
          },
          fileData: {
            type: Type.STRING,
            description: "Base64 encoded file data for media upload (required for upload_media). Binary content of image, document, or media file converted to base64 string for API transmission."
          },
          fileName: {
            type: Type.STRING,
            description: "Original filename for media upload (required for upload_media). Examples: 'image.jpg', 'document.pdf'. Must include proper file extension for correct MIME type detection."
          },
          altText: {
            type: Type.STRING,
            description: "Alternative text for uploaded images (accessibility and SEO). Describes image content for screen readers and search engines. Important for accessibility compliance."
          },
          caption: {
            type: Type.STRING,
            description: "Image caption text displayed below image in content. Provides context or description for media items. Visible to site visitors in most themes."
          },
          name: {
            type: Type.STRING,
            description: "Full name for user creation (required for create_user). Examples: 'John Smith', 'Sarah Johnson'. Used for author display and user identification throughout WordPress."
          },
          email: {
            type: Type.STRING,
            description: "Email address for user operations (required for create_user). Must be unique in WordPress installation. Used for notifications, password resets, and user communication."
          },
          role: {
            type: Type.STRING,
            description: "User role defining capabilities. Options: 'subscriber' (basic), 'contributor' (write), 'author' (publish own), 'editor' (manage content), 'administrator' (full access). Default: 'subscriber'."
          },
          description: {
            type: Type.STRING,
            description: "User biography or category/tag description. Used in author pages, taxonomy archives, and user profiles. Supports basic HTML formatting."
          },
          commentContent: {
            type: Type.STRING,
            description: "Comment text content (required for create_comment). The actual comment message from user. Supports basic HTML and is subject to site comment policies and moderation."
          },
          commentAuthor: {
            type: Type.STRING,
            description: "Comment author name (required for create_comment when not logged in). Display name for comment attribution. Used when commenting without WordPress account."
          },
          commentAuthorEmail: {
            type: Type.STRING,
            description: "Comment author email (required for create_comment when not logged in). Used for notifications and gravatar display. Not publicly visible but required for comment submission."
          },
          categoryName: {
            type: Type.STRING,
            description: "Category name for creation (required for create_category). Examples: 'Technology', 'Travel Tips'. Used for content organization and site navigation structure."
          },
          tagName: {
            type: Type.STRING,
            description: "Tag name for creation (required for create_tag). Examples: 'wordpress', 'api', 'tutorial'. Used for content discovery and cross-referencing between posts."
          },
          query: {
            type: Type.STRING,
            description: "Search query for content search (required for search_content). Natural language or keywords to find posts, pages, and content. Examples: 'WordPress tutorial', 'API integration guide'."
          },
          limit: {
            type: Type.NUMBER,
            description: "Maximum number of results to return for list operations (default: 10, max: 100). Higher limits provide more data but may impact performance. Use pagination for large datasets."
          },
          offset: {
            type: Type.NUMBER,
            description: "Number of items to skip for pagination (default: 0). Used with limit for browsing large result sets. Example: offset=20 with limit=10 gets items 21-30."
          },
          orderBy: {
            type: Type.STRING,
            description: "Field to sort results by. Options vary by content type: posts/pages ('date', 'title', 'menu_order', 'modified'), users ('name', 'registered_date'), media ('date', 'title'). Default: 'date'."
          },
          order: {
            type: Type.STRING,
            description: "Sort direction for results. Options: 'asc' (ascending/oldest first), 'desc' (descending/newest first). Default: 'desc'. Use 'asc' for chronological, 'desc' for recent-first."
          },
          includeIds: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: "Specific IDs to include in results. Examples: [1, 5, 10]. Used to retrieve specific sets of posts, pages, or other content types by their database IDs."
          },
          excludeIds: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: "Specific IDs to exclude from results. Examples: [3, 7, 15]. Used to filter out specific content items from list results for customized content display."
          },
          search: {
            type: Type.STRING,
            description: "Search term for filtering list results. Searches within titles, content, and excerpts. Examples: 'tutorial', 'WordPress'. Used for finding specific content within larger datasets."
          },
          bulkPosts: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT },
            description: "Array of post objects for bulk creation (required for bulk_create_posts). Each object should contain title, content, and other post fields. Maximum 50 posts per batch for optimal performance."
          },
          context: {
            type: Type.STRING,
            description: "Response context level. Options: 'view' (public data), 'edit' (full data for editing), 'embed' (minimal data for embedding). Default: 'view'. Affects amount of data returned."
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const action = args.action;
      console.log(`📝 WordPress ${action}: ${args.postId || args.pageId || args.userId || args.siteUrl || 'operation'}`);

      switch (action) {
        case 'setup_site':
          return await this.setupSite(args);
        case 'discover_site':
          return await this.discoverSite(args);
        case 'create_post':
          return await this.createPost(args);
        case 'get_post':
          return await this.getPost(args);
        case 'update_post':
          return await this.updatePost(args);
        case 'delete_post':
          return await this.deletePost(args);
        case 'list_posts':
          return await this.listPosts(args);
        case 'create_page':
          return await this.createPage(args);
        case 'get_page':
          return await this.getPage(args);
        case 'update_page':
          return await this.updatePage(args);
        case 'list_pages':
          return await this.listPages(args);
        case 'upload_media':
          return await this.uploadMedia(args);
        case 'get_media':
          return await this.getMedia(args);
        case 'list_media':
          return await this.listMedia(args);
        case 'create_user':
          return await this.createUser(args);
        case 'get_user':
          return await this.getUser(args);
        case 'list_users':
          return await this.listUsers(args);
        case 'create_comment':
          return await this.createComment(args);
        case 'list_comments':
          return await this.listComments(args);
        case 'create_category':
          return await this.createCategory(args);
        case 'list_categories':
          return await this.listCategories(args);
        case 'create_tag':
          return await this.createTag(args);
        case 'list_tags':
          return await this.listTags(args);
        case 'search_content':
          return await this.searchContent(args);
        case 'get_site_info':
          return await this.getSiteInfo(args);
        case 'bulk_create_posts':
          return await this.bulkCreatePosts(args);
        case 'get_post_revisions':
          return await this.getPostRevisions(args);
        default:
          throw new Error(`Unknown action: ${action}`);
      }

    } catch (error: unknown) {
      console.error("❌ WordPress operation failed:", error);
      return {
        success: false,
        error: `WordPress operation failed: ${error instanceof Error ? error.message : String(error)}`,
        action: args.action
      };
    }
  }

  private async setupSite(args: any): Promise<any> {
    if (!args.siteUrl || !args.username || !args.applicationPassword) {
      throw new Error("siteUrl, username, and applicationPassword are required for setup_site action");
    }

    this.siteUrl = args.siteUrl.replace(/\/$/, '');
    this.username = args.username;
    this.applicationPassword = args.applicationPassword;
    this.baseUrl = `${this.siteUrl}/wp-json/wp/v2`;

    // Test the connection
    try {
      const testResponse = await this.makeRequest('GET', '/users/me');
      return {
        success: true,
        action: 'setup_site',
        message: 'WordPress site configured successfully',
        siteUrl: this.siteUrl,
        user: testResponse,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        action: 'setup_site',
        error: 'Failed to connect to WordPress site. Check URL and credentials.',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async discoverSite(args: any): Promise<any> {
    if (!args.siteUrl) {
      throw new Error("siteUrl is required for discover_site action");
    }

    const baseUrl = args.siteUrl.replace(/\/$/, '');
    
    try {
      // Test if WordPress REST API is available
      const response = await fetch(`${baseUrl}/wp-json/wp/v2`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          action: 'discover_site',
          message: 'WordPress REST API discovered',
          siteUrl: baseUrl,
          apiInfo: data,
          endpoints: data?.routes ? Object.keys(data.routes) : [],
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(`API not available: ${response.status}`);
      }
    } catch (error) {
      return {
        success: false,
        action: 'discover_site',
        error: `Could not discover WordPress at ${baseUrl}: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async createPost(args: any): Promise<any> {
    if (!args.title || !args.content) {
      throw new Error("title and content are required for create_post action");
    }

    const postData: any = {
      title: args.title,
      content: args.content,
      status: args.status || 'draft'
    };

    if (args.excerpt) postData.excerpt = args.excerpt;
    if (args.categories) postData.categories = args.categories;
    if (args.tags) postData.tags = args.tags;
    if (args.featuredMedia) postData.featured_media = args.featuredMedia;
    if (args.author) postData.author = args.author;
    if (args.slug) postData.slug = args.slug;
    if (args.password) postData.password = args.password;
    if (args.commentStatus) postData.comment_status = args.commentStatus;
    if (args.metaFields) postData.meta = args.metaFields;

    const response = await this.makeRequest('POST', '/posts', postData);
    
    return {
      success: true,
      action: 'create_post',
      post: response,
      postId: response.id,
      postUrl: response.link,
      timestamp: new Date().toISOString()
    };
  }

  private async getPost(args: any): Promise<any> {
    if (!args.postId) {
      throw new Error("postId is required for get_post action");
    }

    const params = new URLSearchParams();
    if (args.context) params.append('context', args.context);

    let url = `/posts/${args.postId}`;
    if (params.toString()) url += `?${params.toString()}`;

    const response = await this.makeRequest('GET', url);
    
    return {
      success: true,
      action: 'get_post',
      post: response,
      timestamp: new Date().toISOString()
    };
  }

  private async updatePost(args: any): Promise<any> {
    if (!args.postId) {
      throw new Error("postId is required for update_post action");
    }

    const updateData: any = {};

    if (args.title) updateData.title = args.title;
    if (args.content) updateData.content = args.content;
    if (args.excerpt) updateData.excerpt = args.excerpt;
    if (args.status) updateData.status = args.status;
    if (args.categories) updateData.categories = args.categories;
    if (args.tags) updateData.tags = args.tags;
    if (args.featuredMedia) updateData.featured_media = args.featuredMedia;
    if (args.slug) updateData.slug = args.slug;
    if (args.password) updateData.password = args.password;
    if (args.commentStatus) updateData.comment_status = args.commentStatus;
    if (args.metaFields) updateData.meta = args.metaFields;

    const response = await this.makeRequest('POST', `/posts/${args.postId}`, updateData);
    
    return {
      success: true,
      action: 'update_post',
      post: response,
      timestamp: new Date().toISOString()
    };
  }

  private async deletePost(args: any): Promise<any> {
    if (!args.postId) {
      throw new Error("postId is required for delete_post action");
    }

    const response = await this.makeRequest('DELETE', `/posts/${args.postId}`);
    
    return {
      success: true,
      action: 'delete_post',
      postId: args.postId,
      deleted: response.deleted || true,
      timestamp: new Date().toISOString()
    };
  }

  private async listPosts(args: any): Promise<any> {
    const params = new URLSearchParams();

    if (args.limit) params.append('per_page', Math.min(args.limit, 100).toString());
    if (args.offset) params.append('offset', args.offset.toString());
    if (args.orderBy) params.append('orderby', args.orderBy);
    if (args.order) params.append('order', args.order);
    if (args.search) params.append('search', args.search);
    if (args.author) params.append('author', args.author.toString());
    if (args.categories) params.append('categories', args.categories.join(','));
    if (args.tags) params.append('tags', args.tags.join(','));
    if (args.includeIds) params.append('include', args.includeIds.join(','));
    if (args.excludeIds) params.append('exclude', args.excludeIds.join(','));
    if (args.status) params.append('status', args.status);
    if (args.context) params.append('context', args.context);

    let url = '/posts';
    if (params.toString()) url += `?${params.toString()}`;

    const response = await this.makeRequest('GET', url);
    
    return {
      success: true,
      action: 'list_posts',
      posts: response,
      count: response.length,
      timestamp: new Date().toISOString()
    };
  }

  private async createPage(args: any): Promise<any> {
    if (!args.title || !args.content) {
      throw new Error("title and content are required for create_page action");
    }

    const pageData: any = {
      title: args.title,
      content: args.content,
      status: args.status || 'draft'
    };

    if (args.slug) pageData.slug = args.slug;
    if (args.parent) pageData.parent = args.parent;
    if (args.menuOrder) pageData.menu_order = args.menuOrder;
    if (args.featuredMedia) pageData.featured_media = args.featuredMedia;
    if (args.commentStatus) pageData.comment_status = args.commentStatus;
    if (args.password) pageData.password = args.password;
    if (args.metaFields) pageData.meta = args.metaFields;

    const response = await this.makeRequest('POST', '/pages', pageData);
    
    return {
      success: true,
      action: 'create_page',
      page: response,
      pageId: response.id,
      pageUrl: response.link,
      timestamp: new Date().toISOString()
    };
  }

  private async getPage(args: any): Promise<any> {
    if (!args.pageId) {
      throw new Error("pageId is required for get_page action");
    }

    const response = await this.makeRequest('GET', `/pages/${args.pageId}`);
    
    return {
      success: true,
      action: 'get_page',
      page: response,
      timestamp: new Date().toISOString()
    };
  }

  private async updatePage(args: any): Promise<any> {
    if (!args.pageId) {
      throw new Error("pageId is required for update_page action");
    }

    const updateData: any = {};

    if (args.title) updateData.title = args.title;
    if (args.content) updateData.content = args.content;
    if (args.status) updateData.status = args.status;
    if (args.slug) updateData.slug = args.slug;
    if (args.parent) updateData.parent = args.parent;
    if (args.menuOrder) updateData.menu_order = args.menuOrder;
    if (args.featuredMedia) updateData.featured_media = args.featuredMedia;
    if (args.commentStatus) updateData.comment_status = args.commentStatus;
    if (args.password) updateData.password = args.password;
    if (args.metaFields) updateData.meta = args.metaFields;

    const response = await this.makeRequest('POST', `/pages/${args.pageId}`, updateData);
    
    return {
      success: true,
      action: 'update_page',
      page: response,
      timestamp: new Date().toISOString()
    };
  }

  private async listPages(args: any): Promise<any> {
    const params = new URLSearchParams();

    if (args.limit) params.append('per_page', Math.min(args.limit, 100).toString());
    if (args.offset) params.append('offset', args.offset.toString());
    if (args.orderBy) params.append('orderby', args.orderBy);
    if (args.order) params.append('order', args.order);
    if (args.search) params.append('search', args.search);
    if (args.parent) params.append('parent', args.parent.toString());
    if (args.status) params.append('status', args.status);

    let url = '/pages';
    if (params.toString()) url += `?${params.toString()}`;

    const response = await this.makeRequest('GET', url);
    
    return {
      success: true,
      action: 'list_pages',
      pages: response,
      count: response.length,
      timestamp: new Date().toISOString()
    };
  }

  private async uploadMedia(args: any): Promise<any> {
    if (!args.fileData || !args.fileName) {
      throw new Error("fileData and fileName are required for upload_media action");
    }

    // Convert base64 to binary
    const binaryData = Buffer.from(args.fileData, 'base64');
    
    const formData = new FormData();
    const blob = new Blob([binaryData]);
    formData.append('file', blob, args.fileName);
    
    if (args.altText) formData.append('alt_text', args.altText);
    if (args.caption) formData.append('caption', args.caption);

    const credentials = Buffer.from(`${this.username}:${this.applicationPassword}`).toString('base64');
    
    const response = await fetch(`${this.baseUrl}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Media upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      action: 'upload_media',
      media: result,
      mediaId: result.id,
      mediaUrl: result.source_url,
      timestamp: new Date().toISOString()
    };
  }

  private async getMedia(args: any): Promise<any> {
    if (!args.mediaId) {
      throw new Error("mediaId is required for get_media action");
    }

    const response = await this.makeRequest('GET', `/media/${args.mediaId}`);
    
    return {
      success: true,
      action: 'get_media',
      media: response,
      timestamp: new Date().toISOString()
    };
  }

  private async listMedia(args: any): Promise<any> {
    const params = new URLSearchParams();

    if (args.limit) params.append('per_page', Math.min(args.limit, 100).toString());
    if (args.offset) params.append('offset', args.offset.toString());
    if (args.orderBy) params.append('orderby', args.orderBy);
    if (args.order) params.append('order', args.order);
    if (args.search) params.append('search', args.search);

    let url = '/media';
    if (params.toString()) url += `?${params.toString()}`;

    const response = await this.makeRequest('GET', url);
    
    return {
      success: true,
      action: 'list_media',
      media: response,
      count: response.length,
      timestamp: new Date().toISOString()
    };
  }

  private async createUser(args: any): Promise<any> {
    if (!args.name || !args.email) {
      throw new Error("name and email are required for create_user action");
    }

    const userData: any = {
      name: args.name,
      email: args.email,
      username: args.username || args.email.split('@')[0],
      password: args.password || this.generateRandomPassword(),
      roles: [args.role || 'subscriber']
    };

    if (args.description) userData.description = args.description;

    const response = await this.makeRequest('POST', '/users', userData);
    
    return {
      success: true,
      action: 'create_user',
      user: response,
      userId: response.id,
      generatedPassword: userData.password,
      timestamp: new Date().toISOString()
    };
  }

  private async getUser(args: any): Promise<any> {
    if (!args.userId) {
      throw new Error("userId is required for get_user action");
    }

    const response = await this.makeRequest('GET', `/users/${args.userId}`);
    
    return {
      success: true,
      action: 'get_user',
      user: response,
      timestamp: new Date().toISOString()
    };
  }

  private async listUsers(args: any): Promise<any> {
    const params = new URLSearchParams();

    if (args.limit) params.append('per_page', Math.min(args.limit, 100).toString());
    if (args.offset) params.append('offset', args.offset.toString());
    if (args.orderBy) params.append('orderby', args.orderBy);
    if (args.order) params.append('order', args.order);
    if (args.search) params.append('search', args.search);
    if (args.role) params.append('roles', args.role);

    let url = '/users';
    if (params.toString()) url += `?${params.toString()}`;

    const response = await this.makeRequest('GET', url);
    
    return {
      success: true,
      action: 'list_users',
      users: response,
      count: response.length,
      timestamp: new Date().toISOString()
    };
  }

  private async createComment(args: any): Promise<any> {
    if (!args.postId || !args.commentContent) {
      throw new Error("postId and commentContent are required for create_comment action");
    }

    const commentData: any = {
      post: args.postId,
      content: args.commentContent
    };

    if (args.commentAuthor) commentData.author_name = args.commentAuthor;
    if (args.commentAuthorEmail) commentData.author_email = args.commentAuthorEmail;
    if (args.parent) commentData.parent = args.parent;

    const response = await this.makeRequest('POST', '/comments', commentData);
    
    return {
      success: true,
      action: 'create_comment',
      comment: response,
      commentId: response.id,
      timestamp: new Date().toISOString()
    };
  }

  private async listComments(args: any): Promise<any> {
    const params = new URLSearchParams();

    if (args.limit) params.append('per_page', Math.min(args.limit, 100).toString());
    if (args.offset) params.append('offset', args.offset.toString());
    if (args.orderBy) params.append('orderby', args.orderBy);
    if (args.order) params.append('order', args.order);
    if (args.search) params.append('search', args.search);
    if (args.postId) params.append('post', args.postId.toString());
    if (args.status) params.append('status', args.status);

    let url = '/comments';
    if (params.toString()) url += `?${params.toString()}`;

    const response = await this.makeRequest('GET', url);
    
    return {
      success: true,
      action: 'list_comments',
      comments: response,
      count: response.length,
      timestamp: new Date().toISOString()
    };
  }

  private async createCategory(args: any): Promise<any> {
    if (!args.categoryName) {
      throw new Error("categoryName is required for create_category action");
    }

    const categoryData: any = {
      name: args.categoryName
    };

    if (args.description) categoryData.description = args.description;
    if (args.slug) categoryData.slug = args.slug;
    if (args.parent) categoryData.parent = args.parent;

    const response = await this.makeRequest('POST', '/categories', categoryData);
    
    return {
      success: true,
      action: 'create_category',
      category: response,
      categoryId: response.id,
      timestamp: new Date().toISOString()
    };
  }

  private async listCategories(args: any): Promise<any> {
    const params = new URLSearchParams();

    if (args.limit) params.append('per_page', Math.min(args.limit, 100).toString());
    if (args.offset) params.append('offset', args.offset.toString());
    if (args.orderBy) params.append('orderby', args.orderBy);
    if (args.order) params.append('order', args.order);
    if (args.search) params.append('search', args.search);
    if (args.parent !== undefined) params.append('parent', args.parent.toString());

    let url = '/categories';
    if (params.toString()) url += `?${params.toString()}`;

    const response = await this.makeRequest('GET', url);
    
    return {
      success: true,
      action: 'list_categories',
      categories: response,
      count: response.length,
      timestamp: new Date().toISOString()
    };
  }

  private async createTag(args: any): Promise<any> {
    if (!args.tagName) {
      throw new Error("tagName is required for create_tag action");
    }

    const tagData: any = {
      name: args.tagName
    };

    if (args.description) tagData.description = args.description;
    if (args.slug) tagData.slug = args.slug;

    const response = await this.makeRequest('POST', '/tags', tagData);
    
    return {
      success: true,
      action: 'create_tag',
      tag: response,
      tagId: response.id,
      timestamp: new Date().toISOString()
    };
  }

  private async listTags(args: any): Promise<any> {
    const params = new URLSearchParams();

    if (args.limit) params.append('per_page', Math.min(args.limit, 100).toString());
    if (args.offset) params.append('offset', args.offset.toString());
    if (args.orderBy) params.append('orderby', args.orderBy);
    if (args.order) params.append('order', args.order);
    if (args.search) params.append('search', args.search);

    let url = '/tags';
    if (params.toString()) url += `?${params.toString()}`;

    const response = await this.makeRequest('GET', url);
    
    return {
      success: true,
      action: 'list_tags',
      tags: response,
      count: response.length,
      timestamp: new Date().toISOString()
    };
  }

  private async searchContent(args: any): Promise<any> {
    if (!args.query) {
      throw new Error("query is required for search_content action");
    }

    const params = new URLSearchParams();
    params.append('search', args.query);
    if (args.limit) params.append('per_page', Math.min(args.limit, 100).toString());

    // Search across multiple content types
    const searchPromises = [
      this.makeRequest('GET', `/posts?${params.toString()}`),
      this.makeRequest('GET', `/pages?${params.toString()}`),
      this.makeRequest('GET', `/media?${params.toString()}`)
    ];

    try {
      const [posts, pages, media] = await Promise.all(searchPromises);
      
      return {
        success: true,
        action: 'search_content',
        query: args.query,
        results: {
          posts: posts || [],
          pages: pages || [],
          media: media || []
        },
        totalResults: (posts?.length || 0) + (pages?.length || 0) + (media?.length || 0),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // If some searches fail, return partial results
      const posts = await this.makeRequest('GET', `/posts?${params.toString()}`).catch(() => []);
      
      return {
        success: true,
        action: 'search_content',
        query: args.query,
        results: { posts, pages: [], media: [] },
        totalResults: posts.length,
        note: 'Partial results due to search limitations',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async getSiteInfo(args: any): Promise<any> {
    try {
      const [siteInfo, userInfo] = await Promise.all([
        fetch(`${this.siteUrl}/wp-json`).then(r => r.json()),
        this.makeRequest('GET', '/users/me').catch(() => null)
      ]);

      return {
        success: true,
        action: 'get_site_info',
        siteInfo: siteInfo,
        currentUser: userInfo,
        siteUrl: this.siteUrl,
        apiVersion: siteInfo?.namespaces?.includes('wp/v2') ? 'v2' : 'unknown',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        action: 'get_site_info',
        error: `Failed to get site info: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async bulkCreatePosts(args: any): Promise<any> {
    if (!args.bulkPosts || !Array.isArray(args.bulkPosts)) {
      throw new Error("bulkPosts array is required for bulk_create_posts action");
    }

    const results: any[] = [];
    const errors: any[] = [];

    for (const postData of args.bulkPosts) {
      try {
        if (!postData.title || !postData.content) {
          throw new Error("Each post must have title and content");
        }

        const post: any = {
          title: postData.title,
          content: postData.content,
          status: postData.status || 'draft'
        };

        if (postData.excerpt) post.excerpt = postData.excerpt;
        if (postData.categories) post.categories = postData.categories;
        if (postData.tags) post.tags = postData.tags;
        if (postData.featuredMedia) post.featured_media = postData.featuredMedia;
        if (postData.author) post.author = postData.author;
        if (postData.slug) post.slug = postData.slug;

        const response = await this.makeRequest('POST', '/posts', post);
        results.push({
          success: true,
          post: response,
          postId: response.id,
          postUrl: response.link
        });

      } catch (error) {
        errors.push({
          title: postData.title,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return {
      success: true,
      action: 'bulk_create_posts',
      results: results,
      errors: errors,
      successCount: results.length,
      errorCount: errors.length,
      timestamp: new Date().toISOString()
    };
  }

  private async getPostRevisions(args: any): Promise<any> {
    if (!args.postId) {
      throw new Error("postId is required for get_post_revisions action");
    }

    const response = await this.makeRequest('GET', `/posts/${args.postId}/revisions`);
    
    return {
      success: true,
      action: 'get_post_revisions',
      postId: args.postId,
      revisions: response,
      count: response.length,
      timestamp: new Date().toISOString()
    };
  }

  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    if (!this.baseUrl || !this.username || !this.applicationPassword) {
      return {
        success: false,
        error: "WordPress not configured. Please use 'setup_site' action with your site URL and credentials first.",
        needsSetup: true,
        timestamp: new Date().toISOString()
      };
    }

    const url = `${this.baseUrl}${endpoint}`;
    const credentials = Buffer.from(`${this.username}:${this.applicationPassword}`).toString('base64');

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'User-Agent': 'WordPressTool/1.0'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle specific WordPress error responses
        if (response.status === 401) {
          return {
            success: false,
            error: "Authentication failed. Please check your username and application password.",
            needsSetup: true,
            timestamp: new Date().toISOString()
          };
        }
        
        if (response.status === 403) {
          throw new Error(`Insufficient permissions: ${errorText}`);
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Handle DELETE requests that may return no content
      if (method === 'DELETE' && response.status === 200) {
        const result = await response.json();
        return result;
      }

      return await response.json();
      
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch failed')) {
        return {
          success: false,
          error: "Connection failed. Please check the site URL and ensure WordPress is accessible.",
          needsSetup: true,
          details: error.message,
          timestamp: new Date().toISOString()
        };
      }
      throw error;
    }
  }

  private generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}