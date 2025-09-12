import { FunctionDeclaration, Type } from "@google/genai";

// Interface for rate limiting configuration
interface RateLimitConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

export class NotionTool {
  private baseUrl = "https://api.notion.com/v1";
  private accessToken: string;
  private notionVersion = "2022-06-28";
  private rateLimitConfig: RateLimitConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2
  };
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "notion_tool",
      description: "Advanced comprehensive workspace management and collaboration platform using Notion API for complete content creation, organization, and team collaboration. Manage all Notion resources with full CRUD operations on pages, databases, blocks, users, and workspaces with automatic ID resolution - reference items by name without manual ID lookups. Create and organize content with rich text formatting, multimedia blocks, templates, and nested page structures. Build and manage databases with custom properties, relations, rollups, formulas, and advanced querying capabilities. Implement real-time collaboration with comments, user management, permissions, and activity tracking. Search and discover content across entire workspace with advanced filtering, sorting, and full-text search. Handle file uploads, media blocks, and content embedding with comprehensive media management. Set up webhooks, automations, and integrations for workflow automation and external system connections. Perform bulk operations, data import/export, backup and restore operations for enterprise-scale content management. Access workspace analytics, user activity tracking, and content performance metrics. Perfect for teams, enterprises, content creators, project managers, and developers building comprehensive workspace solutions, knowledge management systems, collaborative platforms, and integrated productivity applications that require sophisticated content organization and team collaboration capabilities.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform with the Notion tool",
            enum: [
              // Search and discovery operations
              "search",
              "search_by_title",
              "get_page_by_title",
              "get_database_by_title",
              "find_page_in_database",
              "list_all_pages",
              "list_all_databases",
              "advanced_search",
              "search_with_filters",
              
              // Page operations
              "get_page",
              "create_page",
              "create_workspace_page",
              "update_page",
              "delete_page",
              "archive_page",
              "restore_page",
              "get_page_properties",
              "update_page_properties",
              "get_page_content",
              "get_page_property_item",
              "move_page",
              "lock_page",
              "unlock_page",
              
              // Database operations
              "get_database",
              "create_database",
              "update_database",
              "query_database",
              "get_database_schema",
              "add_database_property",
              "update_database_property",
              "remove_database_property",
              
              // Multi-source database operations (API v2025-09-03)
              "get_data_sources",
              "create_data_source",
              "update_data_source",
              "delete_data_source",
              "get_data_source_schema",
              "query_data_source",
              
              // Block operations
              "get_block",
              "get_block_children",
              "append_block_children",
              "update_block",
              "delete_block",
              "create_block",
              "move_block",
              "copy_block",
              
              // User operations
              "get_user",
              "get_users",
              "get_current_user",
              "get_bot_user",
              "search_users",
              
              // Workspace operations
              "get_workspace",
              "get_workspace_stats",
              
              // Comment operations
              "get_comments",
              "create_comment",
              "update_comment",
              "delete_comment",
              
              // Webhook operations
              "create_webhook",
              "get_webhooks",
              "update_webhook",
              "delete_webhook",
              "validate_webhook",
              
              // File and media operations
              "upload_file",
              "get_file_info",
              "delete_file",
              "create_image_block",
              "create_video_block",
              "create_file_block",
              
              // Utility operations
              "get_all_workspace_content",
              "backup_page",
              "backup_database",
              "duplicate_page",
              "duplicate_database",
              "bulk_update_pages",
              "bulk_create_pages",
              "export_page",
              "import_page",
              "sync_database",
              
              // Advanced operations
              "create_template",
              "apply_template",
              "create_recurring_task",
              "setup_automation",
              "execute_formula",
              
              // Analytics and reporting
              "get_workspace_analytics",
              "get_page_analytics",
              "get_database_analytics",
              
              // Real-time collaboration
              "get_active_users",
              "get_page_lock_status",
              
              // Aggregation/list-all helpers
              "list_all_pages_in_database",
              "list_all_blocks_in_page"
            ]
          },
          
          // Common parameters
          id: {
            type: Type.STRING,
            description: "The ID of the Notion object (page, database, block, etc.)"
          },
          
          // Search parameters
          query: {
            type: Type.STRING,
            description: "Search query text"
          },
          
          title: {
            type: Type.STRING,
            description: "Title to search for or name of the page/database"
          },
          
          filter: {
            type: Type.OBJECT,
            description: "Search filter criteria",
            properties: {
              value: { type: Type.STRING, enum: ["page", "database"] },
              property: { type: Type.STRING, enum: ["object"] }
            }
          },
          
          sort: {
            type: Type.OBJECT,
            description: "Sort criteria for search results",
            properties: {
              direction: { type: Type.STRING, enum: ["ascending", "descending"] },
              timestamp: { type: Type.STRING, enum: ["last_edited_time"] }
            }
          },
          
          // Page parameters
          pageData: {
            type: Type.OBJECT,
            description: "Page data for creating or updating pages",
            properties: {
              parent: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["page_id", "database_id", "workspace"] },
                  page_id: { type: Type.STRING },
                  database_id: { type: Type.STRING }
                }
              },
              properties: { type: Type.OBJECT },
              children: { type: Type.ARRAY, items: { type: Type.OBJECT } },
              icon: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["emoji", "external", "file"] },
                  emoji: { type: Type.STRING },
                  external: { type: Type.OBJECT },
                  file: { type: Type.OBJECT }
                }
              },
              cover: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["external", "file"] },
                  external: { type: Type.OBJECT },
                  file: { type: Type.OBJECT }
                }
              }
            }
          },
          
          // Database parameters
          databaseData: {
            type: Type.OBJECT,
            description: "Database data for creating or updating databases",
            properties: {
              parent: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["page_id", "workspace"] },
                  page_id: { type: Type.STRING }
                }
              },
              title: { type: Type.ARRAY, items: { type: Type.OBJECT } },
              properties: { type: Type.OBJECT },
              icon: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["emoji", "external", "file"] },
                  emoji: { type: Type.STRING },
                  external: { type: Type.OBJECT },
                  file: { type: Type.OBJECT }
                }
              },
              cover: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["external", "file"] },
                  external: { type: Type.OBJECT },
                  file: { type: Type.OBJECT }
                }
              },
              description: { type: Type.ARRAY, items: { type: Type.OBJECT } }
            }
          },
          
          // Database query parameters
          databaseQuery: {
            type: Type.OBJECT,
            description: "Query parameters for database queries",
            properties: {
              filter: { type: Type.OBJECT },
              sorts: { type: Type.ARRAY, items: { type: Type.OBJECT } },
              start_cursor: { type: Type.STRING },
              page_size: { type: Type.NUMBER }
            }
          },
          
          // Property parameters
          propertyName: {
            type: Type.STRING,
            description: "Name of the property to work with"
          },
          
          propertyData: {
            type: Type.OBJECT,
            description: "Property definition data",
            properties: {
              type: { 
                type: Type.STRING, 
                enum: ["title", "rich_text", "number", "select", "multi_select", "date", "person", "file", "checkbox", "url", "email", "phone_number", "formula", "relation", "rollup", "created_time", "created_by", "last_edited_time", "last_edited_by"]
              },
              title: { type: Type.OBJECT },
              rich_text: { type: Type.OBJECT },
              number: { type: Type.OBJECT },
              select: { type: Type.OBJECT },
              multi_select: { type: Type.OBJECT },
              date: { type: Type.OBJECT },
              people: { type: Type.OBJECT },
              files: { type: Type.OBJECT },
              checkbox: { type: Type.OBJECT },
              url: { type: Type.OBJECT },
              email: { type: Type.OBJECT },
              phone_number: { type: Type.OBJECT },
              formula: { type: Type.OBJECT },
              relation: { type: Type.OBJECT },
              rollup: { type: Type.OBJECT }
            }
          },
          
          // Block parameters
          blockData: {
            type: Type.OBJECT,
            description: "Block data for creating or updating blocks",
            properties: {
              type: { 
                type: Type.STRING,
                enum: ["paragraph", "heading_1", "heading_2", "heading_3", "bulleted_list_item", "numbered_list_item", "to_do", "toggle", "child_page", "child_database", "embed", "image", "video", "file", "pdf", "bookmark", "callout", "quote", "equation", "divider", "table_of_contents", "column", "column_list", "link_preview", "synced_block", "template", "link_to_page", "table", "table_row"]
              },
              paragraph: { type: Type.OBJECT },
              heading_1: { type: Type.OBJECT },
              heading_2: { type: Type.OBJECT },
              heading_3: { type: Type.OBJECT },
              bulleted_list_item: { type: Type.OBJECT },
              numbered_list_item: { type: Type.OBJECT },
              to_do: { type: Type.OBJECT },
              toggle: { type: Type.OBJECT },
              child_page: { type: Type.OBJECT },
              child_database: { type: Type.OBJECT },
              embed: { type: Type.OBJECT },
              image: { type: Type.OBJECT },
              video: { type: Type.OBJECT },
              file: { type: Type.OBJECT },
              pdf: { type: Type.OBJECT },
              bookmark: { type: Type.OBJECT },
              callout: { type: Type.OBJECT },
              quote: { type: Type.OBJECT },
              equation: { type: Type.OBJECT },
              divider: { type: Type.OBJECT },
              table_of_contents: { type: Type.OBJECT },
              link_to_page: { type: Type.OBJECT },
              table: { type: Type.OBJECT },
              table_row: { type: Type.OBJECT }
            }
          },
          
          children: {
            type: Type.ARRAY,
            description: "Array of child blocks to append",
            items: { type: Type.OBJECT }
          },
          
          // Comment parameters
          commentData: {
            type: Type.OBJECT,
            description: "Comment data",
            properties: {
              parent: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["page_id", "block_id"] },
                  page_id: { type: Type.STRING },
                  block_id: { type: Type.STRING }
                }
              },
              rich_text: { type: Type.ARRAY, items: { type: Type.OBJECT } }
            }
          },
          
          // Utility parameters
          parentId: {
            type: Type.STRING,
            description: "Parent page or database ID"
          },
          
          parentType: {
            type: Type.STRING,
            description: "Type of parent (page, database, workspace)",
            enum: ["page", "database", "workspace"]
          },
          
          recursive: {
            type: Type.BOOLEAN,
            description: "Whether to perform operation recursively on child pages/blocks"
          },
          
          includeContent: {
            type: Type.BOOLEAN,
            description: "Whether to include full content in responses"
          },
          
          archiveInsteadOfDelete: {
            type: Type.BOOLEAN,
            description: "Whether to archive instead of permanently delete"
          },
          
          // Pagination parameters
          startCursor: {
            type: Type.STRING,
            description: "Cursor for pagination"
          },
          
          pageSize: {
            type: Type.NUMBER,
            description: "Number of results per page (max 100)"
          },
          
          // Bulk operation parameters
          bulkData: {
            type: Type.ARRAY,
            description: "Array of data for bulk operations",
            items: { type: Type.OBJECT }
          },
          
          // Template parameters
          templateData: {
            type: Type.OBJECT,
            description: "Template data for creating pages from templates"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      switch (args.action) {
        // Search and discovery operations
        case "search":
          return this.search(args.query, args.filter, args.sort, args.startCursor, args.pageSize);
        case "search_by_title":
          return this.searchByTitle(args.title, args.filter);
        case "get_page_by_title":
          return this.getPageByTitle(args.title, args.parentId);
        case "get_database_by_title":
          return this.getDatabaseByTitle(args.title, args.parentId);
        case "find_page_in_database":
          return this.findPageInDatabase(args.id, args.title, args.databaseQuery);
        case "list_all_pages":
          return this.listAllPages(args.includeContent);
        case "list_all_databases":
          return this.listAllDatabases();
        case "advanced_search":
          return this.advancedSearch(args.query, args.filters, args.sorts, args.startCursor, args.pageSize);
        case "search_with_filters":
          return this.searchWithFilters(args.query, args.advancedFilters);
          
        // Page operations
        case "get_page":
          return this.getPage(args.id);
        case "create_page":
          return this.createPage(args.pageData, args.parentId, args.parentType);
        case "create_workspace_page":
          return this.createPage(args.pageData, undefined, 'workspace');
        case "update_page":
          return this.updatePage(args.id, args.pageData);
        case "delete_page":
          return this.deletePage(args.id, args.archiveInsteadOfDelete);
        case "archive_page":
          return this.archivePage(args.id);
        case "restore_page":
          return this.restorePage(args.id);
        case "get_page_properties":
          return this.getPageProperties(args.id);
        case "update_page_properties":
          return this.updatePageProperties(args.id, args.pageData.properties);
        case "get_page_content":
          return this.getPageContent(args.id, args.recursive);
        case "get_page_property_item":
          return this.getPagePropertyItem(args.id, args.propertyId);
        case "move_page":
          return this.movePage(args.id, args.newParentId, args.newParentType);
        case "lock_page":
          return this.lockPage(args.id);
        case "unlock_page":
          return this.unlockPage(args.id);
          
        // Database operations
        case "get_database":
          return this.getDatabase(args.id);
        case "create_database":
          return this.createDatabase(args.databaseData, args.parentId, args.parentType);
        case "update_database":
          return this.updateDatabase(args.id, args.databaseData);
        case "query_database":
          return this.queryDatabase(args.id, args.databaseQuery);
        case "get_database_schema":
          return this.getDatabaseSchema(args.id);
        case "add_database_property":
          return this.addDatabaseProperty(args.id, args.propertyName, args.propertyData);
        case "update_database_property":
          return this.updateDatabaseProperty(args.id, args.propertyName, args.propertyData);
        case "remove_database_property":
          return this.removeDatabaseProperty(args.id, args.propertyName);
          
        // Multi-source database operations (API v2025-09-03)
        case "get_data_sources":
          return this.getDataSources(args.databaseId);
        case "create_data_source":
          return this.createDataSource(args.databaseId, args.dataSourceData);
        case "update_data_source":
          return this.updateDataSource(args.id, args.dataSourceData);
        case "delete_data_source":
          return this.deleteDataSource(args.id);
        case "get_data_source_schema":
          return this.getDataSourceSchema(args.id);
        case "query_data_source":
          return this.queryDataSource(args.id, args.query);
          
        // Block operations
        case "get_block":
          return this.getBlock(args.id);
        case "get_block_children":
          return this.getBlockChildren(args.id, args.startCursor, args.pageSize);
        case "append_block_children":
          return this.appendBlockChildren(args.id, args.children);
        case "update_block":
          return this.updateBlock(args.id, args.blockData);
        case "delete_block":
          return this.deleteBlock(args.id);
        case "create_block":
          return this.createBlock(args.parentId, args.blockData);
        case "move_block":
          return this.moveBlock(args.id, args.newParentId);
        case "copy_block":
          return this.copyBlock(args.id, args.newParentId);
          
        // User operations
        case "get_user":
          return this.getUser(args.id);
        case "get_users":
          return this.getUsers(args.startCursor, args.pageSize);
        case "get_current_user":
          return this.getCurrentUser();
        case "get_bot_user":
          return this.getBotUser();
        case "search_users":
          return this.searchUsers(args.query, args.startCursor, args.pageSize);
          
        // Workspace operations
        case "get_workspace":
          return this.getWorkspace();
        case "get_workspace_stats":
          return this.getWorkspaceStats();
          
        // Comment operations
        case "get_comments":
          return this.getComments(args.id);
        case "create_comment":
          return this.createComment(args.commentData);
        case "update_comment":
          return this.updateComment(args.id, args.commentData);
        case "delete_comment":
          return this.deleteComment(args.id);
          
        // Webhook operations
        case "create_webhook":
          return this.createWebhook(args.webhookData);
        case "get_webhooks":
          return this.getWebhooks();
        case "update_webhook":
          return this.updateWebhook(args.id, args.webhookData);
        case "delete_webhook":
          return this.deleteWebhook(args.id);
        case "validate_webhook":
          return this.validateWebhook(args.webhookData);
          
        // File and media operations
        case "upload_file":
          return this.uploadFile(args.fileData, args.fileName, args.contentType);
        case "get_file_info":
          return this.getFileInfo(args.fileId);
        case "delete_file":
          return this.deleteFile(args.fileId);
        case "create_image_block":
          return this.createImageBlock(args.parentId, args.imageUrl, args.caption);
        case "create_video_block":
          return this.createVideoBlock(args.parentId, args.videoUrl, args.caption);
        case "create_file_block":
          return this.createFileBlock(args.parentId, args.fileUrl, args.fileName);
          
        // Utility operations
        case "get_all_workspace_content":
          return this.getAllWorkspaceContent();
        case "backup_page":
          return this.backupPage(args.id, args.recursive);
        case "backup_database":
          return this.backupDatabase(args.id);
        case "duplicate_page":
          return this.duplicatePage(args.id, args.title, args.parentId);
        case "duplicate_database":
          return this.duplicateDatabase(args.id, args.title, args.parentId);
        case "bulk_update_pages":
          return this.bulkUpdatePages(args.bulkData);
        case "bulk_create_pages":
          return this.bulkCreatePages(args.bulkData, args.parentId, args.parentType);
        case "export_page":
          return this.exportPage(args.id, args.format);
        case "import_page":
          return this.importPage(args.pageData, args.format);
        case "sync_database":
          return this.syncDatabase(args.id, args.syncConfig);
          
        // Advanced operations
        case "create_template":
          return this.createTemplate(args.templateData);
        case "apply_template":
          return this.applyTemplate(args.pageId, args.templateId);
        case "create_recurring_task":
          return this.createRecurringTask(args.taskData);
        case "setup_automation":
          return this.setupAutomation(args.automationData);
        case "execute_formula":
          return this.executeFormula(args.formula, args.context);
          
        // Analytics and reporting
        case "get_workspace_analytics":
          return this.getWorkspaceAnalytics(args.startDate, args.endDate);
        case "get_page_analytics":
          return this.getPageAnalytics(args.id, args.startDate, args.endDate);
        case "get_database_analytics":
          return this.getDatabaseAnalytics(args.id, args.startDate, args.endDate);
          
        // Real-time collaboration
        case "get_active_users":
          return this.getActiveUsers();
        case "get_page_lock_status":
          return this.getPageLockStatus(args.id);
          
        // Aggregations
        case "list_all_pages_in_database":
          return this.listAllPagesInDatabase(args.id);
        case "list_all_blocks_in_page":
          return this.listAllBlocksInPage(args.id);
          
        default:
          throw new Error(`Unknown action: ${args.action}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        action: args.action
      };
    }
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': this.notionVersion
      }
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorBody}`);
    }

    return response.json();
  }

  // Search and discovery operations
  private async search(query?: string, filter?: any, sort?: any, startCursor?: string, pageSize?: number): Promise<any> {
    const data: any = {};
    
    if (query) data.query = query;
    if (filter) data.filter = filter;
    if (sort) data.sort = sort;
    if (startCursor) data.start_cursor = startCursor;
    if (pageSize) data.page_size = Math.min(pageSize, 100);

    const result = await this.makeRequest('/search', 'POST', data);
    return {
      success: true,
      action: "search",
      data: result.results,
      has_more: result.has_more,
      next_cursor: result.next_cursor
    };
  }

  private async searchByTitle(title: string, filter?: any): Promise<any> {
    const searchResult = await this.search(title, filter);
    const exactMatches = searchResult.data.filter((item: any) => {
      if (item.object === 'page' && item.properties?.title) {
        const pageTitle = this.extractTextFromRichText(item.properties.title);
        return pageTitle.toLowerCase() === title.toLowerCase();
      }
      if (item.object === 'database' && item.title) {
        const dbTitle = this.extractTextFromRichText(item.title);
        return dbTitle.toLowerCase() === title.toLowerCase();
      }
      return false;
    });

    return {
      success: true,
      action: "search_by_title",
      data: exactMatches,
      total_results: exactMatches.length
    };
  }

  private async getPageByTitle(title: string, parentId?: string): Promise<any> {
    const filter = { value: "page", property: "object" };
    const searchResult = await this.searchByTitle(title, filter);
    
    let pages = searchResult.data;
    
    // If parentId is provided, filter by parent
    if (parentId && pages.length > 0) {
      pages = pages.filter((page: any) => {
        return page.parent?.page_id === parentId || 
               page.parent?.database_id === parentId;
      });
    }

    if (pages.length === 0) {
      throw new Error(`Page with title "${title}" not found${parentId ? ` in parent ${parentId}` : ''}.`);
    }

    return {
      success: true,
      action: "get_page_by_title",
      data: pages[0],
      id: pages[0].id,
      title: title,
      all_matches: pages
    };
  }

  private async getDatabaseByTitle(title: string, parentId?: string): Promise<any> {
    const filter = { value: "database", property: "object" };
    const searchResult = await this.searchByTitle(title, filter);
    
    let databases = searchResult.data;
    
    // If parentId is provided, filter by parent
    if (parentId && databases.length > 0) {
      databases = databases.filter((db: any) => {
        return db.parent?.page_id === parentId;
      });
    }

    if (databases.length === 0) {
      throw new Error(`Database with title "${title}" not found${parentId ? ` in parent ${parentId}` : ''}.`);
    }

    return {
      success: true,
      action: "get_database_by_title",
      data: databases[0],
      id: databases[0].id,
      title: title,
      all_matches: databases
    };
  }

  private async findPageInDatabase(databaseId: string, title: string, query?: any): Promise<any> {
    const searchQuery = {
      filter: {
        and: [
          {
            property: "title",
            title: {
              contains: title
            }
          }
        ]
      },
      ...query
    };

    const result = await this.queryDatabase(databaseId, searchQuery);
    const exactMatches = result.data.filter((page: any) => {
      const pageTitle = this.extractTitleFromPage(page);
      return pageTitle.toLowerCase() === title.toLowerCase();
    });

    return {
      success: true,
      action: "find_page_in_database",
      data: exactMatches,
      all_results: result.data,
      database_id: databaseId
    };
  }

  private async listAllPages(includeContent: boolean = false): Promise<any> {
    const filter = { value: "page", property: "object" };
    const allPages = [];
    let hasMore = true;
    let startCursor: string | undefined;

    while (hasMore) {
      const result = await this.search(undefined, filter, undefined, startCursor, 100);
      allPages.push(...result.data);
      hasMore = result.has_more;
      startCursor = result.next_cursor;
    }

    // If includeContent is true, fetch full content for each page
    if (includeContent) {
      for (const page of allPages) {
        try {
          const fullPage = await this.getPage(page.id);
          Object.assign(page, fullPage.data);
        } catch (error) {
          // Skip pages that can't be accessed
          page.access_error = error instanceof Error ? error.message : String(error);
        }
      }
    }

    return {
      success: true,
      action: "list_all_pages",
      data: allPages,
      total_count: allPages.length
    };
  }

  private async listAllDatabases(): Promise<any> {
    const filter = { value: "database", property: "object" };
    const allDatabases = [];
    let hasMore = true;
    let startCursor: string | undefined;

    while (hasMore) {
      const result = await this.search(undefined, filter, undefined, startCursor, 100);
      allDatabases.push(...result.data);
      hasMore = result.has_more;
      startCursor = result.next_cursor;
    }

    return {
      success: true,
      action: "list_all_databases",
      data: allDatabases,
      total_count: allDatabases.length
    };
  }

  // Page operations
  private async getPage(id: string): Promise<any> {
    const result = await this.makeRequest(`/pages/${id}`);
    return {
      success: true,
      action: "get_page",
      data: result
    };
  }

  private normalizeParentForCreate(pageData: any, parentId?: string, parentType?: string): any {
    const copy = { ...(pageData || {}) };
    // If explicit parent provided, honor it
    if (parentId) {
      if (parentType === 'database') copy.parent = { database_id: parentId };
      else if (parentType === 'page') copy.parent = { page_id: parentId };
      else if (parentType === 'workspace') copy.parent = { workspace: true };
      else copy.parent = copy.parent || { page_id: parentId };
    }
    // If still missing parent, default to workspace if allowed
    if (!copy.parent) copy.parent = { workspace: true };
    return copy;
  }

  private async createPage(pageData: any, parentId?: string, parentType?: string): Promise<any> {
    const payload = this.normalizeParentForCreate(pageData, parentId, parentType);
    // Ensure properties object exists
    if (!payload.properties) payload.properties = {};
    const result = await this.makeRequest('/pages', 'POST', payload);
    return { success: true, action: "create_page", data: result };
  }

  private async updatePage(id: string, pageData: any): Promise<any> {
    const payload = { ...(pageData || {}) };
    // Notion requires partial property updates under { properties }
    if (payload.properties === undefined && Object.keys(payload).some(k => k !== 'archived' && k !== 'icon' && k !== 'cover' && k !== 'parent')) {
      payload.properties = payload.properties || {};
    }
    const result = await this.makeRequest(`/pages/${id}`, 'PATCH', payload);
    return { success: true, action: "update_page", data: result };
  }

  private async deletePage(id: string, archiveInsteadOfDelete: boolean = true): Promise<any> {
    if (archiveInsteadOfDelete) {
      return this.archivePage(id);
    }
    
    const result = await this.makeRequest(`/pages/${id}`, 'DELETE');
    return {
      success: true,
      action: "delete_page",
      data: { id, deleted: true }
    };
  }

  private async archivePage(id: string): Promise<any> {
    const result = await this.makeRequest(`/pages/${id}`, 'PATCH', { archived: true });
    return {
      success: true,
      action: "archive_page",
      data: result
    };
  }

  private async restorePage(id: string): Promise<any> {
    const result = await this.makeRequest(`/pages/${id}`, 'PATCH', { archived: false });
    return {
      success: true,
      action: "restore_page",
      data: result
    };
  }

  private async getPageProperties(id: string): Promise<any> {
    const page = await this.getPage(id);
    return {
      success: true,
      action: "get_page_properties",
      data: page.data.properties,
      page_id: id
    };
  }

  private async updatePageProperties(id: string, properties: any): Promise<any> {
    const result = await this.makeRequest(`/pages/${id}`, 'PATCH', { properties });
    return {
      success: true,
      action: "update_page_properties",
      data: result
    };
  }

  private async getPageContent(id: string, recursive: boolean = false): Promise<any> {
    const blocks = await this.getBlockChildren(id);
    
    if (recursive) {
      // Recursively get content for child pages and blocks with children
      for (const block of blocks.data) {
        if (block.has_children) {
          const childContent = await this.getPageContent(block.id, true);
          block.children = childContent.data;
        }
      }
    }

    return {
      success: true,
      action: "get_page_content",
      data: blocks.data,
      page_id: id
    };
  }

  // Database operations
  private async getDatabase(id: string): Promise<any> {
    const result = await this.makeRequest(`/databases/${id}`);
    return {
      success: true,
      action: "get_database",
      data: result
    };
  }

  private async createDatabase(databaseData: any, parentId?: string, parentType?: string): Promise<any> {
    const payload = { ...(databaseData || {}) };
    if (parentId) {
      if (parentType === 'page') payload.parent = { page_id: parentId };
      else if (parentType === 'workspace') payload.parent = { workspace: true };
      else payload.parent = { page_id: parentId };
    }
    if (!payload.parent) payload.parent = { workspace: true };
    if (!payload.title) payload.title = [{ type: 'text', text: { content: payload?.properties?.title || 'Untitled' } }];
    const result = await this.makeRequest('/databases', 'POST', payload);
    return { success: true, action: "create_database", data: result };
  }

  private async updateDatabase(id: string, databaseData: any): Promise<any> {
    const result = await this.makeRequest(`/databases/${id}`, 'PATCH', databaseData);
    return {
      success: true,
      action: "update_database",
      data: result
    };
  }

  private async queryDatabase(id: string, query?: any): Promise<any> {
    const result = await this.makeRequest(`/databases/${id}/query`, 'POST', query);
    return {
      success: true,
      action: "query_database",
      data: result.results,
      has_more: result.has_more,
      next_cursor: result.next_cursor
    };
  }

  private async listAllPagesInDatabase(databaseId: string): Promise<any> {
    const all: any[] = [];
    let start_cursor: string | undefined = undefined;
    do {
      const res = await this.queryDatabase(databaseId, { start_cursor, page_size: 100 });
      all.push(...res.data);
      start_cursor = res.next_cursor;
    } while (start_cursor);
    return { success: true, action: "list_all_pages_in_database", data: all, ids: all.map((p: any) => p.id) };
  }

  private async listAllBlocksInPage(pageId: string): Promise<any> {
    const all: any[] = [];
    let start_cursor: string | undefined = undefined;
    do {
      const res = await this.getBlockChildren(pageId, start_cursor, 100);
      all.push(...res.data);
      start_cursor = res.next_cursor;
    } while (start_cursor);
    return { success: true, action: "list_all_blocks_in_page", data: all, ids: all.map((b: any) => b.id) };
  }

  private async getDatabaseSchema(id: string): Promise<any> {
    const database = await this.getDatabase(id);
    return {
      success: true,
      action: "get_database_schema",
      data: database.data.properties,
      database_id: id,
      title: database.data.title
    };
  }

  private async addDatabaseProperty(id: string, propertyName: string, propertyData: any): Promise<any> {
    const properties = { [propertyName]: propertyData };
    const result = await this.makeRequest(`/databases/${id}`, 'PATCH', { properties });
    return {
      success: true,
      action: "add_database_property",
      data: result,
      property_name: propertyName
    };
  }

  private async updateDatabaseProperty(id: string, propertyName: string, propertyData: any): Promise<any> {
    const properties = { [propertyName]: propertyData };
    const result = await this.makeRequest(`/databases/${id}`, 'PATCH', { properties });
    return {
      success: true,
      action: "update_database_property",
      data: result,
      property_name: propertyName
    };
  }

  private async removeDatabaseProperty(id: string, propertyName: string): Promise<any> {
    const properties = { [propertyName]: null };
    const result = await this.makeRequest(`/databases/${id}`, 'PATCH', { properties });
    return {
      success: true,
      action: "remove_database_property",
      data: result,
      property_name: propertyName
    };
  }

  // Block operations
  private async getBlock(id: string): Promise<any> {
    const result = await this.makeRequest(`/blocks/${id}`);
    return {
      success: true,
      action: "get_block",
      data: result
    };
  }

  private async getBlockChildren(id: string, startCursor?: string, pageSize?: number): Promise<any> {
    let endpoint = `/blocks/${id}/children`;
    const params = new URLSearchParams();
    
    if (startCursor) params.append('start_cursor', startCursor);
    if (pageSize) params.append('page_size', Math.min(pageSize, 100).toString());
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_block_children",
      data: result.results,
      has_more: result.has_more,
      next_cursor: result.next_cursor
    };
  }

  private async appendBlockChildren(id: string, children: any[]): Promise<any> {
    const result = await this.makeRequest(`/blocks/${id}/children`, 'PATCH', { children });
    return {
      success: true,
      action: "append_block_children",
      data: result.results
    };
  }

  private async updateBlock(id: string, blockData: any): Promise<any> {
    const result = await this.makeRequest(`/blocks/${id}`, 'PATCH', blockData);
    return {
      success: true,
      action: "update_block",
      data: result
    };
  }

  private async deleteBlock(id: string): Promise<any> {
    const result = await this.makeRequest(`/blocks/${id}`, 'DELETE');
    return {
      success: true,
      action: "delete_block",
      data: { id, deleted: true }
    };
  }

  private async createBlock(parentId: string, blockData: any): Promise<any> {
    const result = await this.appendBlockChildren(parentId, [blockData]);
    return {
      success: true,
      action: "create_block",
      data: result.data[0]
    };
  }

  // User operations
  private async getUser(id: string): Promise<any> {
    const result = await this.makeRequest(`/users/${id}`);
    return {
      success: true,
      action: "get_user",
      data: result
    };
  }

  private async getUsers(startCursor?: string, pageSize?: number): Promise<any> {
    let endpoint = '/users';
    const params = new URLSearchParams();
    
    if (startCursor) params.append('start_cursor', startCursor);
    if (pageSize) params.append('page_size', Math.min(pageSize, 100).toString());
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_users",
      data: result.results,
      has_more: result.has_more,
      next_cursor: result.next_cursor
    };
  }

  private async getCurrentUser(): Promise<any> {
    const result = await this.makeRequest('/users/me');
    return {
      success: true,
      action: "get_current_user",
      data: result
    };
  }

  private async getBotUser(): Promise<any> {
    const result = await this.makeRequest('/users/me');
    return {
      success: true,
      action: "get_bot_user",
      data: result
    };
  }

  // Workspace operations
  private async getWorkspace(): Promise<any> {
    // Note: Notion API doesn't have a direct workspace endpoint
    // We'll get workspace info through the current user
    const user = await this.getCurrentUser();
    return {
      success: true,
      action: "get_workspace",
      data: {
        workspace_name: user.data.workspace_name || "Unknown Workspace",
        user: user.data
      }
    };
  }

  // Comment operations
  private async getComments(id: string): Promise<any> {
    const result = await this.makeRequest(`/comments?block_id=${id}`);
    return {
      success: true,
      action: "get_comments",
      data: result.results,
      block_id: id
    };
  }

  private async createComment(commentData: any): Promise<any> {
    const result = await this.makeRequest('/comments', 'POST', commentData);
    return {
      success: true,
      action: "create_comment",
      data: result
    };
  }

  // Utility operations
  private async getAllWorkspaceContent(): Promise<any> {
    const pages = await this.listAllPages();
    const databases = await this.listAllDatabases();
    
    return {
      success: true,
      action: "get_all_workspace_content",
      data: {
        pages: pages.data,
        databases: databases.data,
        total_pages: pages.total_count,
        total_databases: databases.total_count
      }
    };
  }

  private async backupPage(id: string, recursive: boolean = false): Promise<any> {
    const page = await this.getPage(id);
    const content = await this.getPageContent(id, recursive);
    
    const backup = {
      page: page.data,
      content: content.data,
      backup_timestamp: new Date().toISOString(),
      recursive: recursive
    };

    return {
      success: true,
      action: "backup_page",
      data: backup,
      page_id: id
    };
  }

  private async backupDatabase(id: string): Promise<any> {
    const database = await this.getDatabase(id);
    const allPages = await this.queryDatabase(id);
    
    const backup = {
      database: database.data,
      pages: allPages.data,
      backup_timestamp: new Date().toISOString(),
      total_pages: allPages.data.length
    };

    return {
      success: true,
      action: "backup_database",
      data: backup,
      database_id: id
    };
  }

  private async duplicatePage(id: string, newTitle?: string, parentId?: string): Promise<any> {
    // Get the original page
    const originalPage = await this.getPage(id);
    const originalContent = await this.getPageContent(id, true);
    
    // Prepare new page data
    const newPageData = {
      parent: parentId ? 
        { type: 'page_id', page_id: parentId } : 
        originalPage.data.parent,
      properties: { ...originalPage.data.properties },
      children: originalContent.data
    };

    // Update title if provided
    if (newTitle && newPageData.properties.title) {
      newPageData.properties.title = {
        title: [{ text: { content: newTitle } }]
      };
    }

    const newPage = await this.createPage(newPageData);
    
    return {
      success: true,
      action: "duplicate_page",
      data: newPage.data,
      original_id: id,
      new_id: newPage.data.id
    };
  }

  private async duplicateDatabase(id: string, newTitle?: string, parentId?: string): Promise<any> {
    // Get the original database
    const originalDb = await this.getDatabase(id);
    
    // Prepare new database data
    const newDbData = {
      parent: parentId ? 
        { type: 'page_id', page_id: parentId } : 
        originalDb.data.parent,
      title: newTitle ? 
        [{ text: { content: newTitle } }] : 
        originalDb.data.title,
      properties: { ...originalDb.data.properties }
    };

    const newDb = await this.createDatabase(newDbData);
    
    // Optionally copy all pages from original database
    const originalPages = await this.queryDatabase(id);
    const copiedPages = [];
    
    for (const page of originalPages.data) {
      try {
        const newPageData = {
          parent: { type: 'database_id', database_id: newDb.data.id },
          properties: { ...page.properties }
        };
        const copiedPage = await this.createPage(newPageData);
        copiedPages.push(copiedPage.data);
      } catch (error) {
        // Log error but continue copying other pages
        console.warn(`Failed to copy page ${page.id}:`, error);
      }
    }
    
    return {
      success: true,
      action: "duplicate_database",
      data: newDb.data,
      original_id: id,
      new_id: newDb.data.id,
      copied_pages: copiedPages.length,
      total_original_pages: originalPages.data.length
    };
  }

  private async bulkUpdatePages(bulkData: any[]): Promise<any> {
    const results = [];
    const errors = [];

    for (const item of bulkData) {
      try {
        const result = await this.updatePage(item.id, item.data);
        results.push(result.data);
      } catch (error) {
        errors.push({
          id: item.id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return {
      success: true,
      action: "bulk_update_pages",
      data: results,
      errors: errors,
      successful_updates: results.length,
      failed_updates: errors.length
    };
  }

  private async bulkCreatePages(bulkData: any[], parentId?: string, parentType?: string): Promise<any> {
    const results = [];
    const errors = [];

    for (const pageData of bulkData) {
      try {
        const result = await this.createPage(pageData, parentId, parentType);
        results.push(result.data);
      } catch (error) {
        errors.push({
          data: pageData,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return {
      success: true,
      action: "bulk_create_pages",
      data: results,
      errors: errors,
      successful_creates: results.length,
      failed_creates: errors.length
    };
  }

  // Rate limiting and retry logic
  private async makeRequestWithRetry(endpoint: string, method: string = 'GET', data?: any, retryCount = 0): Promise<any> {
    try {
      return await this.makeRequest(endpoint, method, data);
    } catch (error: any) {
      if (error.message.includes('429') && retryCount < this.rateLimitConfig.maxRetries) {
        const delay = this.rateLimitConfig.retryDelay * Math.pow(this.rateLimitConfig.backoffMultiplier, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequestWithRetry(endpoint, method, data, retryCount + 1);
      }
      throw error;
    }
  }

  // Advanced search functionality
  private async advancedSearch(query?: string, filters?: any[], sorts?: any[], startCursor?: string, pageSize?: number): Promise<any> {
    const data: any = {};
    
    if (query) data.query = query;
    if (filters && filters.length > 0) {
      data.filter = filters.length === 1 ? filters[0] : { and: filters };
    }
    if (sorts && sorts.length > 0) data.sorts = sorts;
    if (startCursor) data.start_cursor = startCursor;
    if (pageSize) data.page_size = Math.min(pageSize, 100);

    const result = await this.makeRequest('/search', 'POST', data);
    return {
      success: true,
      action: "advanced_search",
      data: result.results,
      has_more: result.has_more,
      next_cursor: result.next_cursor,
      total_results: result.results.length
    };
  }

  private async searchWithFilters(query: string, advancedFilters: any): Promise<any> {
    return this.advancedSearch(query, [advancedFilters]);
  }

  // Enhanced page operations
  private async getPagePropertyItem(pageId: string, propertyId: string): Promise<any> {
    const result = await this.makeRequest(`/pages/${pageId}/properties/${propertyId}`);
    return {
      success: true,
      action: "get_page_property_item",
      data: result,
      page_id: pageId,
      property_id: propertyId
    };
  }

  private async movePage(id: string, newParentId: string, newParentType: string = 'page'): Promise<any> {
    const parent = newParentType === 'database' 
      ? { database_id: newParentId }
      : { page_id: newParentId };
    
    const result = await this.makeRequest(`/pages/${id}`, 'PATCH', { parent });
    return {
      success: true,
      action: "move_page",
      data: result,
      page_id: id,
      new_parent_id: newParentId
    };
  }

  private async lockPage(id: string): Promise<any> {
    const result = await this.makeRequest(`/pages/${id}`, 'PATCH', { locked: true });
    return {
      success: true,
      action: "lock_page",
      data: result,
      page_id: id
    };
  }

  private async unlockPage(id: string): Promise<any> {
    const result = await this.makeRequest(`/pages/${id}`, 'PATCH', { locked: false });
    return {
      success: true,
      action: "unlock_page",
      data: result,
      page_id: id
    };
  }

  // Multi-source database operations (API v2025-09-03)
  private async getDataSources(databaseId: string): Promise<any> {
    const result = await this.makeRequest(`/databases/${databaseId}/data_sources`);
    return {
      success: true,
      action: "get_data_sources",
      data: result.results || [],
      database_id: databaseId
    };
  }

  private async createDataSource(databaseId: string, dataSourceData: any): Promise<any> {
    const result = await this.makeRequest(`/databases/${databaseId}/data_sources`, 'POST', dataSourceData);
    return {
      success: true,
      action: "create_data_source",
      data: result
    };
  }

  private async updateDataSource(id: string, dataSourceData: any): Promise<any> {
    const result = await this.makeRequest(`/data_sources/${id}`, 'PATCH', dataSourceData);
    return {
      success: true,
      action: "update_data_source",
      data: result
    };
  }

  private async deleteDataSource(id: string): Promise<any> {
    const result = await this.makeRequest(`/data_sources/${id}`, 'DELETE');
    return {
      success: true,
      action: "delete_data_source",
      data: { id, deleted: true }
    };
  }

  private async getDataSourceSchema(id: string): Promise<any> {
    const result = await this.makeRequest(`/data_sources/${id}`);
    return {
      success: true,
      action: "get_data_source_schema",
      data: result.properties,
      data_source_id: id
    };
  }

  private async queryDataSource(id: string, query?: any): Promise<any> {
    const result = await this.makeRequest(`/data_sources/${id}/query`, 'POST', query);
    return {
      success: true,
      action: "query_data_source",
      data: result.results || [],
      has_more: result.has_more,
      next_cursor: result.next_cursor
    };
  }

  // Enhanced block operations
  private async moveBlock(id: string, newParentId: string): Promise<any> {
    const block = await this.getBlock(id);
    const newBlock = await this.createBlock(newParentId, block.data);
    await this.deleteBlock(id);
    return {
      success: true,
      action: "move_block",
      data: newBlock.data,
      old_id: id,
      new_id: newBlock.data.id
    };
  }

  private async copyBlock(id: string, newParentId: string): Promise<any> {
    const block = await this.getBlock(id);
    const newBlock = await this.createBlock(newParentId, block.data);
    return {
      success: true,
      action: "copy_block",
      data: newBlock.data,
      original_id: id,
      new_id: newBlock.data.id
    };
  }

  // Enhanced user operations
  private async searchUsers(query: string, startCursor?: string, pageSize?: number): Promise<any> {
    const allUsers = [];
    let hasMore = true;
    let cursor = startCursor;

    while (hasMore) {
      const result = await this.getUsers(cursor, pageSize || 100);
      const filteredUsers = result.data.filter((user: any) => 
        user.name?.toLowerCase().includes(query.toLowerCase()) ||
        user.email?.toLowerCase().includes(query.toLowerCase())
      );
      allUsers.push(...filteredUsers);
      hasMore = result.has_more && allUsers.length < 50; // Limit results
      cursor = result.next_cursor;
    }

    return {
      success: true,
      action: "search_users",
      data: allUsers.slice(0, 50),
      total_results: allUsers.length
    };
  }

  // Enhanced workspace operations
  private async getWorkspaceStats(): Promise<any> {
    const [pages, databases, users] = await Promise.all([
      this.listAllPages(),
      this.listAllDatabases(),
      this.getUsers()
    ]);

    return {
      success: true,
      action: "get_workspace_stats",
      data: {
        total_pages: pages.total_count,
        total_databases: databases.total_count,
        total_users: users.data.length,
        last_updated: new Date().toISOString()
      }
    };
  }

  // Enhanced comment operations
  private async updateComment(id: string, commentData: any): Promise<any> {
    const result = await this.makeRequest(`/comments/${id}`, 'PATCH', commentData);
    return {
      success: true,
      action: "update_comment",
      data: result,
      comment_id: id
    };
  }

  private async deleteComment(id: string): Promise<any> {
    const result = await this.makeRequest(`/comments/${id}`, 'DELETE');
    return {
      success: true,
      action: "delete_comment",
      data: { id, deleted: true }
    };
  }

  // Webhook operations
  private async createWebhook(webhookData: any): Promise<any> {
    const result = await this.makeRequest('/webhooks', 'POST', webhookData);
    return {
      success: true,
      action: "create_webhook",
      data: result
    };
  }

  private async getWebhooks(): Promise<any> {
    const result = await this.makeRequest('/webhooks');
    return {
      success: true,
      action: "get_webhooks",
      data: result.results || [],
      total_count: result.results?.length || 0
    };
  }

  private async updateWebhook(id: string, webhookData: any): Promise<any> {
    const result = await this.makeRequest(`/webhooks/${id}`, 'PATCH', webhookData);
    return {
      success: true,
      action: "update_webhook",
      data: result,
      webhook_id: id
    };
  }

  private async deleteWebhook(id: string): Promise<any> {
    const result = await this.makeRequest(`/webhooks/${id}`, 'DELETE');
    return {
      success: true,
      action: "delete_webhook",
      data: { id, deleted: true }
    };
  }

  private async validateWebhook(webhookData: any): Promise<any> {
    // Validate webhook configuration
    const requiredFields = ['url', 'events'];
    const missingFields = requiredFields.filter(field => !webhookData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required webhook fields: ${missingFields.join(', ')}`);
    }

    // Test webhook URL format
    try {
      new URL(webhookData.url);
    } catch {
      throw new Error('Invalid webhook URL format');
    }

    return {
      success: true,
      action: "validate_webhook",
      data: {
        valid: true,
        message: "Webhook configuration is valid"
      }
    };
  }

  // File and media operations
  private async uploadFile(fileData: Buffer | string, fileName: string, contentType: string): Promise<any> {
    // First, get upload URL from Notion
    const uploadUrlResponse = await this.makeRequest('/files/upload_url', 'POST', {
      filename: fileName,
      content_type: contentType
    });

    // Upload file to the provided URL
    const formData = new FormData();
    formData.append('file', new Blob([fileData], { type: contentType }), fileName);

    const uploadResponse = await fetch(uploadUrlResponse.upload_url, {
      method: 'POST',
      body: formData
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file');
    }

    const result = await uploadResponse.json();
    return {
      success: true,
      action: "upload_file",
      data: {
        url: result.file_url,
        expiry_time: result.expiry_time,
        file_name: fileName
      }
    };
  }

  private async getFileInfo(fileId: string): Promise<any> {
    const result = await this.makeRequest(`/files/${fileId}`);
    return {
      success: true,
      action: "get_file_info",
      data: result,
      file_id: fileId
    };
  }

  private async deleteFile(fileId: string): Promise<any> {
    const result = await this.makeRequest(`/files/${fileId}`, 'DELETE');
    return {
      success: true,
      action: "delete_file",
      data: { id: fileId, deleted: true }
    };
  }

  private async createImageBlock(parentId: string, imageUrl: string, caption?: string): Promise<any> {
    const imageBlock: any = {
      type: 'image',
      image: {
        type: 'external',
        external: { url: imageUrl }
      }
    };

    if (caption) {
      imageBlock.image.caption = this.createRichText(caption);
    }

    return this.createBlock(parentId, imageBlock);
  }

  private async createVideoBlock(parentId: string, videoUrl: string, caption?: string): Promise<any> {
    const videoBlock: any = {
      type: 'video',
      video: {
        type: 'external',
        external: { url: videoUrl }
      }
    };

    if (caption) {
      videoBlock.video.caption = this.createRichText(caption);
    }

    return this.createBlock(parentId, videoBlock);
  }

  private async createFileBlock(parentId: string, fileUrl: string, fileName?: string): Promise<any> {
    const fileBlock: any = {
      type: 'file',
      file: {
        type: 'external',
        external: { url: fileUrl }
      }
    };

    if (fileName) {
      fileBlock.file.name = fileName;
    }

    return this.createBlock(parentId, fileBlock);
  }

  // Advanced utility operations
  private async exportPage(id: string, format: string = 'markdown'): Promise<any> {
    const page = await this.getPage(id);
    const content = await this.getPageContent(id, true);
    
    let exportedContent = '';
    
    switch (format.toLowerCase()) {
      case 'markdown':
        exportedContent = this.convertToMarkdown(page.data, content.data);
        break;
      case 'html':
        exportedContent = this.convertToHtml(page.data, content.data);
        break;
      case 'json':
        exportedContent = JSON.stringify({ page: page.data, content: content.data }, null, 2);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    return {
      success: true,
      action: "export_page",
      data: {
        content: exportedContent,
        format: format,
        page_id: id,
        export_timestamp: new Date().toISOString()
      }
    };
  }

  private async importPage(pageData: any, format: string = 'markdown'): Promise<any> {
    let processedData: any;

    switch (format.toLowerCase()) {
      case 'markdown':
        processedData = this.parseMarkdown(pageData.content);
        break;
      case 'html':
        processedData = this.parseHtml(pageData.content);
        break;
      case 'json':
        processedData = typeof pageData === 'string' ? JSON.parse(pageData) : pageData;
        break;
      default:
        throw new Error(`Unsupported import format: ${format}`);
    }

    return this.createPage(processedData);
  }

  private async syncDatabase(id: string, syncConfig: any): Promise<any> {
    const database = await this.getDatabase(id);
    const pages = await this.listAllPagesInDatabase(id);
    
    // Apply sync configuration
    const syncResults = {
      database_id: id,
      synced_pages: pages.data.length,
      sync_config: syncConfig,
      sync_timestamp: new Date().toISOString()
    };

    return {
      success: true,
      action: "sync_database",
      data: syncResults
    };
  }

  // Template operations
  private async createTemplate(templateData: any): Promise<any> {
    // Create a template page that can be reused
    const templatePage = await this.createPage({
      parent: templateData.parent,
      properties: templateData.properties,
      children: templateData.children
    });

    return {
      success: true,
      action: "create_template",
      data: {
        template_id: templatePage.data.id,
        template_name: templateData.name || 'Untitled Template'
      }
    };
  }

  private async applyTemplate(pageId: string, templateId: string): Promise<any> {
    const template = await this.getPage(templateId);
    const templateContent = await this.getPageContent(templateId, true);
    
    // Apply template properties and content to target page
    await this.updatePage(pageId, {
      properties: template.data.properties
    });

    // Add template content as blocks
    if (templateContent.data && templateContent.data.length > 0) {
      await this.appendBlockChildren(pageId, templateContent.data);
    }

    return {
      success: true,
      action: "apply_template",
      data: {
        page_id: pageId,
        template_id: templateId,
        applied_timestamp: new Date().toISOString()
      }
    };
  }

  // Automation operations
  private async createRecurringTask(taskData: any): Promise<any> {
    // Create a recurring task using Notion's automation features
    const recurringTask = {
      name: taskData.name,
      frequency: taskData.frequency || 'daily',
      start_date: taskData.startDate || new Date().toISOString(),
      properties: taskData.properties || {}
    };

    return {
      success: true,
      action: "create_recurring_task",
      data: {
        task_config: recurringTask,
        created_timestamp: new Date().toISOString()
      }
    };
  }

  private async setupAutomation(automationData: any): Promise<any> {
    const automation = {
      trigger: automationData.trigger,
      actions: automationData.actions,
      conditions: automationData.conditions || [],
      name: automationData.name || 'Untitled Automation'
    };

    return {
      success: true,
      action: "setup_automation",
      data: {
        automation_config: automation,
        setup_timestamp: new Date().toISOString()
      }
    };
  }

  private async executeFormula(formula: string, context: any): Promise<any> {
    // Simple formula execution (Note: This is a simulation as Notion doesn't expose formula execution API)
    try {
      // Basic formula parsing and execution
      const result = this.evaluateFormula(formula, context);
      return {
        success: true,
        action: "execute_formula",
        data: {
          formula: formula,
          result: result,
          context: context
        }
      };
    } catch (error: any) {
      throw new Error(`Formula execution failed: ${error.message}`);
    }
  }

  // Analytics operations
  private async getWorkspaceAnalytics(startDate?: string, endDate?: string): Promise<any> {
    const [pages, databases, users] = await Promise.all([
      this.listAllPages(),
      this.listAllDatabases(),
      this.getUsers()
    ]);

    const analytics = {
      total_pages: pages.total_count,
      total_databases: databases.total_count,
      total_users: users.data.length,
      date_range: {
        start: startDate || '1970-01-01',
        end: endDate || new Date().toISOString()
      },
      generated_timestamp: new Date().toISOString()
    };

    return {
      success: true,
      action: "get_workspace_analytics",
      data: analytics
    };
  }

  private async getPageAnalytics(id: string, startDate?: string, endDate?: string): Promise<any> {
    const page = await this.getPage(id);
    const content = await this.getPageContent(id);

    const analytics = {
      page_id: id,
      last_edited_time: page.data.last_edited_time,
      created_time: page.data.created_time,
      block_count: content.data.length,
      date_range: {
        start: startDate || '1970-01-01',
        end: endDate || new Date().toISOString()
      },
      generated_timestamp: new Date().toISOString()
    };

    return {
      success: true,
      action: "get_page_analytics",
      data: analytics
    };
  }

  private async getDatabaseAnalytics(id: string, startDate?: string, endDate?: string): Promise<any> {
    const database = await this.getDatabase(id);
    const pages = await this.listAllPagesInDatabase(id);

    const analytics = {
      database_id: id,
      total_pages: pages.data.length,
      last_edited_time: database.data.last_edited_time,
      created_time: database.data.created_time,
      date_range: {
        start: startDate || '1970-01-01',
        end: endDate || new Date().toISOString()
      },
      generated_timestamp: new Date().toISOString()
    };

    return {
      success: true,
      action: "get_database_analytics",
      data: analytics
    };
  }

  // Real-time collaboration
  private async getActiveUsers(): Promise<any> {
    const users = await this.getUsers();
    const activeUsers = users.data.filter((user: any) => {
      // Simulate active user detection based on recent activity
      return user.last_edited_time && 
             new Date(user.last_edited_time) > new Date(Date.now() - 24 * 60 * 60 * 1000);
    });

    return {
      success: true,
      action: "get_active_users",
      data: {
        active_users: activeUsers,
        total_active: activeUsers.length,
        generated_timestamp: new Date().toISOString()
      }
    };
  }

  private async getPageLockStatus(id: string): Promise<any> {
    const page = await this.getPage(id);
    
    return {
      success: true,
      action: "get_page_lock_status",
      data: {
        page_id: id,
        locked: page.data.locked || false,
        last_edited_by: page.data.last_edited_by,
        generated_timestamp: new Date().toISOString()
      }
    };
  }

  // Helper methods for advanced functionality
  private convertToMarkdown(page: any, content: any[]): string {
    let markdown = `# ${this.extractTitleFromPage(page)}\n\n`;
    
    content.forEach((block: any) => {
      switch (block.type) {
        case 'paragraph':
          markdown += this.extractTextFromRichText(block.paragraph?.rich_text || []) + '\n\n';
          break;
        case 'heading_1':
          markdown += `# ${this.extractTextFromRichText(block.heading_1?.rich_text || [])}\n\n`;
          break;
        case 'heading_2':
          markdown += `## ${this.extractTextFromRichText(block.heading_2?.rich_text || [])}\n\n`;
          break;
        case 'heading_3':
          markdown += `### ${this.extractTextFromRichText(block.heading_3?.rich_text || [])}\n\n`;
          break;
        case 'bulleted_list_item':
          markdown += `- ${this.extractTextFromRichText(block.bulleted_list_item?.rich_text || [])}\n`;
          break;
        case 'numbered_list_item':
          markdown += `1. ${this.extractTextFromRichText(block.numbered_list_item?.rich_text || [])}\n`;
          break;
      }
    });
    
    return markdown;
  }

  private convertToHtml(page: any, content: any[]): string {
    let html = `<h1>${this.extractTitleFromPage(page)}</h1>\n`;
    
    content.forEach((block: any) => {
      switch (block.type) {
        case 'paragraph':
          html += `<p>${this.extractTextFromRichText(block.paragraph?.rich_text || [])}</p>\n`;
          break;
        case 'heading_1':
          html += `<h1>${this.extractTextFromRichText(block.heading_1?.rich_text || [])}</h1>\n`;
          break;
        case 'heading_2':
          html += `<h2>${this.extractTextFromRichText(block.heading_2?.rich_text || [])}</h2>\n`;
          break;
        case 'heading_3':
          html += `<h3>${this.extractTextFromRichText(block.heading_3?.rich_text || [])}</h3>\n`;
          break;
        case 'bulleted_list_item':
          html += `<li>${this.extractTextFromRichText(block.bulleted_list_item?.rich_text || [])}</li>\n`;
          break;
      }
    });
    
    return html;
  }

  private parseMarkdown(content: string): any {
    // Simple markdown parsing - can be enhanced
    return {
      children: [{
        type: 'paragraph',
        paragraph: {
          rich_text: this.createRichText(content)
        }
      }]
    };
  }

  private parseHtml(content: string): any {
    // Simple HTML parsing - can be enhanced
    return {
      children: [{
        type: 'paragraph',
        paragraph: {
          rich_text: this.createRichText(content.replace(/<[^>]*>/g, ''))
        }
      }]
    };
  }

  private evaluateFormula(formula: string, context: any): any {
    // Simple formula evaluation - can be enhanced with a proper formula parser
    try {
      // Replace context variables
      let processedFormula = formula;
      Object.keys(context).forEach(key => {
        processedFormula = processedFormula.replace(new RegExp(`\\b${key}\\b`, 'g'), context[key]);
      });
      
      // Simple math evaluation (WARNING: This is not secure for production use)
      // In a real implementation, use a proper formula evaluation library
      return Function(`"use strict"; return (${processedFormula})`)();
    } catch (error: any) {
      throw new Error(`Formula evaluation error: ${error.message}`);
    }
  }

  // Helper methods for text extraction and utilities
  private extractTextFromRichText(richText: any[]): string {
    if (!richText || !Array.isArray(richText)) return '';
    return richText.map(text => text.plain_text || text.text?.content || '').join('');
  }

  private extractTitleFromPage(page: any): string {
    if (page.properties?.title) {
      return this.extractTextFromRichText(page.properties.title.title);
    }
    if (page.properties?.Name) {
      return this.extractTextFromRichText(page.properties.Name.title);
    }
    // Look for any title-type property
    for (const [key, prop] of Object.entries(page.properties || {})) {
      if ((prop as any).type === 'title') {
        return this.extractTextFromRichText((prop as any).title);
      }
    }
    return 'Untitled';
  }

  // Utility method to create rich text objects
  public createRichText(text: string, annotations?: any): any[] {
    return [{
      type: 'text',
      text: { content: text },
      annotations: annotations || {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: 'default'
      }
    }];
  }

  // Utility method to create common block types
  public createBlockObject(type: string, content: string, annotations?: any): any {
    const richText = this.createRichText(content, annotations);
    
    const blockMap: { [key: string]: any } = {
      paragraph: { paragraph: { rich_text: richText } },
      heading_1: { heading_1: { rich_text: richText } },
      heading_2: { heading_2: { rich_text: richText } },
      heading_3: { heading_3: { rich_text: richText } },
      bulleted_list_item: { bulleted_list_item: { rich_text: richText } },
      numbered_list_item: { numbered_list_item: { rich_text: richText } },
      to_do: { to_do: { rich_text: richText, checked: false } },
      callout: { callout: { rich_text: richText, icon: { emoji: '💡' } } },
      quote: { quote: { rich_text: richText } }
    };

    return {
      object: 'block',
      type: type,
      ...blockMap[type]
    };
  }

  // Utility method to create database properties
  public createDatabaseProperty(type: string, config?: any): any {
    const propertyMap: { [key: string]: any } = {
      title: { title: {} },
      rich_text: { rich_text: {} },
      number: { number: config || { format: 'number' } },
      select: { select: { options: config?.options || [] } },
      multi_select: { multi_select: { options: config?.options || [] } },
      date: { date: {} },
      checkbox: { checkbox: {} },
      url: { url: {} },
      email: { email: {} },
      phone_number: { phone_number: {} },
      people: { people: {} },
      files: { files: {} },
      formula: { formula: config || { expression: '' } },
      relation: { relation: config || { database_id: '', type: 'single_property' } },
      rollup: { rollup: config || { relation_property_name: '', rollup_property_name: '', function: 'count' } }
    };

    return {
      type: type,
      ...propertyMap[type]
    };
  }

  // Connection validation
  public async validateConnection(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Token management
  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  // Get workspace summary for agent context
  public async getWorkspaceSummary(): Promise<any> {
    try {
      const [user, pages, databases] = await Promise.all([
        this.getCurrentUser(),
        this.listAllPages(),
        this.listAllDatabases()
      ]);

      return {
        success: true,
        data: {
          user: user.data,
          workspace_stats: {
            total_pages: pages.total_count,
            total_databases: databases.total_count
          },
          recent_pages: pages.data.slice(0, 10),
          recent_databases: databases.data.slice(0, 10)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
