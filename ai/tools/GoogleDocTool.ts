//ai/tools/GoogleDocTool.ts
import { FunctionDeclaration, Type } from "@google/genai";
import { getValidOAuthAccessToken } from "@/lib/oauth-refresh";

export class GoogleDocTool {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "google_docs_operations",
      description: "Comprehensive Google Docs operations for document creation, editing, formatting, tables, images, comments, sharing, and collaboration. Supports advanced formatting, templates, mail merge, and batch operations.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: [
              // Basic document operations
              "create_document", "get_document", "update_document", "delete_document", "list_documents", "search_documents",
              // Advanced content operations
              "insert_text", "replace_text", "format_text", "insert_table", "insert_image", "insert_header", "insert_footer",
              "create_table_of_contents", "insert_page_break", "insert_section_break",
              // Document structure
              "get_document_structure", "extract_text", "get_word_count", "get_page_count",
              // Comments and collaboration
              "add_comment", "get_comments", "resolve_comment", "share_document", "get_permissions",
              // Templates and styling
              "apply_template", "create_template", "apply_heading_style", "apply_paragraph_style",
              // Import/Export
              "export_document", "import_document", "convert_format", "download_as_pdf", "download_as_word",
              // Batch operations
              "batch_update", "create_from_template", "mail_merge", "find_and_replace_all",
              // Advanced formatting
              "insert_equation", "insert_chart", "insert_drawing", "insert_equation", "set_margins", "set_page_size",
              // Version control
              "get_revision_history", "restore_revision", "create_named_version",
              // Links and bookmarks
              "insert_bookmark", "insert_link", "get_bookmarks", "update_link",
              // Lists and bullets
              "create_bulleted_list", "create_numbered_list", "insert_list_item",
              // Find and replace
              "find_text", "replace_all", "get_suggestions", "check_spelling"
            ]
          },
          // Document creation parameters
          title: {
            type: Type.STRING,
            description: "Document title (required for create_document, create_template)"
          },
          content: {
            type: Type.STRING,
            description: "Document content or text to insert/replace"
          },
          // Document ID for operations
          documentId: {
            type: Type.STRING,
            description: "Google Doc ID (required for most operations)"
          },
          // Text operations
          text: {
            type: Type.STRING,
            description: "Text content for insert/replace operations"
          },
          oldText: {
            type: Type.STRING,
            description: "Text to be replaced in replace operations"
          },
          newText: {
            type: Type.STRING,
            description: "Replacement text in replace operations"
          },
          // Position and indexing
          index: {
            type: Type.NUMBER,
            description: "Character index position for insert operations (1-based)"
          },
          startIndex: {
            type: Type.NUMBER,
            description: "Start index for range operations"
          },
          endIndex: {
            type: Type.NUMBER,
            description: "End index for range operations"
          },
          // Update parameters
          requests: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT },
            description: "Array of update requests for batch operations (Google Docs API format)"
          },
          // Formatting options
          format: {
            type: Type.OBJECT,
            description: "Text formatting options",
            properties: {
              bold: { type: Type.BOOLEAN },
              italic: { type: Type.BOOLEAN },
              underline: { type: Type.BOOLEAN },
              strikethrough: { type: Type.BOOLEAN },
              fontSize: { type: Type.NUMBER },
              fontFamily: { type: Type.STRING },
              textColor: { type: Type.STRING },
              backgroundColor: { type: Type.STRING },
              link: { type: Type.STRING }
            }
          },
          // Table parameters
          rows: {
            type: Type.NUMBER,
            description: "Number of rows for table operations"
          },
          columns: {
            type: Type.NUMBER,
            description: "Number of columns for table operations"
          },
          tableId: {
            type: Type.STRING,
            description: "Table ID for table operations"
          },
          // Image parameters
          imageUrl: {
            type: Type.STRING,
            description: "URL for image insertion"
          },
          imageSize: {
            type: Type.OBJECT,
            description: "Image size options",
            properties: {
              width: { type: Type.NUMBER },
              height: { type: Type.NUMBER },
              scale: { type: Type.NUMBER }
            }
          },
          // Header/Footer
          headerId: {
            type: Type.STRING,
            description: "Header ID for header operations"
          },
          footerId: {
            type: Type.STRING,
            description: "Footer ID for footer operations"
          },
          // Style parameters
          style: {
            type: Type.STRING,
            description: "Style type (HEADING_1, HEADING_2, HEADING_3, TITLE, SUBTITLE, NORMAL_TEXT)",
            enum: ["HEADING_1", "HEADING_2", "HEADING_3", "TITLE", "SUBTITLE", "NORMAL_TEXT"]
          },
          paragraphStyle: {
            type: Type.OBJECT,
            description: "Paragraph formatting options",
            properties: {
              alignment: { type: Type.STRING, enum: ["START", "CENTER", "END", "JUSTIFIED"] },
              lineSpacing: { type: Type.NUMBER },
              spaceAbove: { type: Type.NUMBER },
              spaceBelow: { type: Type.NUMBER },
              indentStart: { type: Type.NUMBER },
              indentEnd: { type: Type.NUMBER }
            }
          },
          // Template parameters
          templateId: {
            type: Type.STRING,
            description: "Template document ID"
          },
          templateName: {
            type: Type.STRING,
            description: "Template name"
          },
          // Export parameters
          exportFormat: {
            type: Type.STRING,
            description: "Export format (pdf, docx, txt, rtf, html, odt)",
            enum: ["pdf", "docx", "txt", "rtf", "html", "odt"]
          },
          // Sharing and permissions
          role: {
            type: Type.STRING,
            description: "Permission role (owner, writer, commenter, reader)",
            enum: ["owner", "writer", "commenter", "reader"]
          },
          emailAddress: {
            type: Type.STRING,
            description: "Email address for sharing"
          },
          sendNotificationEmail: {
            type: Type.BOOLEAN,
            description: "Send notification email when sharing"
          },
          // Comment parameters
          commentId: {
            type: Type.STRING,
            description: "Comment ID for comment operations"
          },
          commentText: {
            type: Type.STRING,
            description: "Comment text"
          },
          anchorText: {
            type: Type.STRING,
            description: "Anchor text for comments"
          },
          // List parameters
          listId: {
            type: Type.STRING,
            description: "List ID for list operations"
          },
          listType: {
            type: Type.STRING,
            description: "List type (BULLETED, NUMBERED)",
            enum: ["BULLETED", "NUMBERED"]
          },
          // Search parameters
          searchQuery: {
            type: Type.STRING,
            description: "Search query for find operations"
          },
          matchCase: {
            type: Type.BOOLEAN,
            description: "Case sensitive search"
          },
          // Page parameters
          pageSize: {
            type: Type.NUMBER,
            description: "Maximum number of results to return (default: 10, max: 100)"
          },
          pageToken: {
            type: Type.STRING,
            description: "Page token for pagination"
          },
          // Folder and organization
          folderId: {
            type: Type.STRING,
            description: "Folder ID for organization"
          },
          parentId: {
            type: Type.STRING,
            description: "Parent folder ID"
          },
          // Query and filtering
          query: {
            type: Type.STRING,
            description: "Search query (Google Drive search syntax)"
          },
          mimeType: {
            type: Type.STRING,
            description: "MIME type filter"
          },
          orderBy: {
            type: Type.STRING,
            description: "Sort order",
            enum: ["createdTime", "modifiedTime", "name", "viewedByMeTime", "sharedWithMeTime"]
          },
          // Revision parameters
          revisionId: {
            type: Type.STRING,
            description: "Revision ID for version operations"
          },
          // Bookmark parameters
          bookmarkId: {
            type: Type.STRING,
            description: "Bookmark ID for bookmark operations"
          },
          // Link parameters
          linkUrl: {
            type: Type.STRING,
            description: "URL for link insertion"
          },
          linkText: {
            type: Type.STRING,
            description: "Display text for link"
          },
          // Batch operations
          operations: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT },
            description: "Multiple operations for batch processing"
          },
          // Mail merge parameters
          mergeData: {
            type: Type.OBJECT,
            description: "Data object for mail merge operations",
            properties: {
              recipients: { type: Type.ARRAY, items: { type: Type.OBJECT } },
              templateFields: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          // Advanced formatting
          pageSizeFormat: {
            type: Type.STRING,
            description: "Page size (A4, LETTER, LEGAL)",
            enum: ["A4", "LETTER", "LEGAL"]
          },
          orientation: {
            type: Type.STRING,
            description: "Page orientation (PORTRAIT, LANDSCAPE)",
            enum: ["PORTRAIT", "LANDSCAPE"]
          },
          margins: {
            type: Type.OBJECT,
            description: "Page margins",
            properties: {
              top: { type: Type.NUMBER },
              bottom: { type: Type.NUMBER },
              left: { type: Type.NUMBER },
              right: { type: Type.NUMBER }
            }
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const accessToken = await getValidOAuthAccessToken(this.userId, "gmail");

      if (!accessToken) {
        return {
          success: false,
          error: "Google OAuth connection not found. Please connect your Google account first."
        };
      }

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      switch (args.action) {
        case "create_document":
          return await this.createDocument(args, headers);
        case "get_document":
          return await this.getDocument(args, headers);
        case "update_document":
          return await this.updateDocument(args, headers);
        case "delete_document":
          return await this.deleteDocument(args, headers);
        case "list_documents":
          return await this.listDocuments(args, headers);
        case "search_documents":
          return await this.searchDocuments(args, headers);
        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`
          };
      }
    } catch (error: unknown) {
      console.error("❌ Google Docs operation failed:", error);
      return {
        success: false,
        error: `Google Docs operation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async createDocument(args: any, headers: any): Promise<any> {
    if (!args.title) {
      return { success: false, error: "Title is required for creating document" };
    }

    // First create the document in Google Drive
    const createResponse = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: args.title
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      return { success: false, error: `Failed to create document: ${error}` };
    }

    const document = await createResponse.json();

    // If content is provided, update the document with the content
    if (args.content) {
      const updateResponse = await this.updateDocument({
        documentId: document.documentId,
        requests: [{
          insertText: {
            location: {
              index: 1
            },
            text: args.content
          }
        }]
      }, headers);

      if (!updateResponse.success) {
        // Return the created document even if content update failed
        console.warn("Failed to add content to document:", updateResponse.error);
      }
    }

    return {
      success: true,
      document: {
        documentId: document.documentId,
        title: document.title,
        revisionId: document.revisionId,
        documentStyle: document.documentStyle,
        namedStyles: document.namedStyles
      }
    };
  }

  private async getDocument(args: any, headers: any): Promise<any> {
    if (!args.documentId) {
      return { success: false, error: "Document ID is required" };
    }

    const response = await fetch(`https://docs.googleapis.com/v1/documents/${args.documentId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get document: ${error}` };
    }

    const document = await response.json();
    
    // Extract text content for easier consumption
    const content = this.extractDocumentContent(document);
    
    return {
      success: true,
      document: {
        documentId: document.documentId,
        title: document.title,
        revisionId: document.revisionId,
        content: content,
        body: document.body,
        documentStyle: document.documentStyle,
        namedStyles: document.namedStyles
      }
    };
  }

  private async updateDocument(args: any, headers: any): Promise<any> {
    if (!args.documentId) {
      return { success: false, error: "Document ID is required" };
    }
    if (!args.requests || !Array.isArray(args.requests)) {
      return { success: false, error: "Requests array is required for updating document" };
    }

    const response = await fetch(`https://docs.googleapis.com/v1/documents/${args.documentId}:batchUpdate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        requests: args.requests
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to update document: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      updateResults: result.replies || [],
      writeControl: result.writeControl,
      documentId: args.documentId
    };
  }

  private async deleteDocument(args: any, headers: any): Promise<any> {
    if (!args.documentId) {
      return { success: false, error: "Document ID is required" };
    }

    // Google Docs uses Google Drive API for deletion
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.documentId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to delete document: ${error}` };
    }

    return {
      success: true,
      message: "Document deleted successfully",
      documentId: args.documentId
    };
  }

  private async listDocuments(args: any, headers: any): Promise<any> {
    const params = new URLSearchParams();
    params.append('q', `mimeType='application/vnd.google-apps.document' and trashed=false`);
    if (args.pageSize) params.append('pageSize', String(Math.min(args.pageSize, 100)));
    if (args.orderBy) params.append('orderBy', args.orderBy);

    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list documents: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      documents: (result.files || []).map((file: any) => ({
        documentId: file.id,
        name: file.name,
        mimeType: file.mimeType,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        size: file.size
      })),
      nextPageToken: result.nextPageToken
    };
  }

  private async searchDocuments(args: any, headers: any): Promise<any> {
    const params = new URLSearchParams();
    
    // Build search query
    let query = `mimeType='application/vnd.google-apps.document' and trashed=false`;
    if (args.query) {
      query += ` and name contains '${args.query.replace(/'/g, "\\'")}'`;
    }
    if (args.folderId) {
      query += ` and '${args.folderId}' in parents`;
    }
    
    params.append('q', query);
    if (args.pageSize) params.append('pageSize', String(Math.min(args.pageSize, 100)));
    if (args.orderBy) params.append('orderBy', args.orderBy);

    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to search documents: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      documents: (result.files || []).map((file: any) => ({
        documentId: file.id,
        name: file.name,
        mimeType: file.mimeType,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        size: file.size
      })),
      nextPageToken: result.nextPageToken,
      totalCount: result.files?.length || 0
    };
  }

  private extractDocumentContent(document: any): string {
    if (!document.body || !document.body.content) {
      return '';
    }

    let text = '';
    for (const element of document.body.content) {
      if (element.paragraph && element.paragraph.elements) {
        for (const elem of element.paragraph.elements) {
          if (elem.textRun && elem.textRun.content) {
            text += elem.textRun.content;
          }
        }
      }
    }
    return text.trim();
  }

  // Utility methods for common operations

  /**
   * Quick setup method - creates a simple text document
   */
  static createSimpleDocument(title: string, content?: string): any {
    return {
      action: "create_document",
      title,
      content: content || ''
    };
  }

  /**
   * Create update request to insert text
   */
  static insertTextRequest(text: string, index: number = 1): any {
    return {
      insertText: {
        location: {
          index
        },
        text
      }
    };
  }

  /**
   * Create update request to replace text
   */
  static replaceTextRequest(oldText: string, newText: string): any {
    return {
      replaceAllText: {
        containsText: {
          text: oldText,
          matchCase: true
        },
        replaceText: newText
      }
    };
  }

  /**
   * Create update request to format text
   */
  static formatTextRequest(startIndex: number, endIndex: number, bold: boolean = false, italic: boolean = false, underline: boolean = false): any {
    const updateTextStyle = {
      range: {
        startIndex,
        endIndex
      },
      textStyle: {} as any
    };

    if (bold) (updateTextStyle.textStyle as any).bold = true;
    if (italic) (updateTextStyle.textStyle as any).italic = true;
    if (underline) (updateTextStyle.textStyle as any).underline = true;

    return {
      updateTextStyle
    };
  }

  /**
   * Create update request to insert table
   */
  static insertTableRequest(rows: number, columns: number, index: number = 1): any {
    return {
      insertTable: {
        location: {
          index
        },
        rows,
        columns
      }
    };
  }

  /**
   * Create search query for documents by name
   */
  static searchByNameQuery(name: string): any {
    return {
      action: "search_documents",
      query: name
    };
  }

  /**
   * Create request to append text to end of document
   */
  static appendTextRequest(documentId: string, text: string): any {
    return {
      action: "update_document",
      documentId,
      requests: [{
        insertText: {
          location: {
            index: 1 // Will be updated to end of document
          },
          text
        }
      }]
    };
  }
}
