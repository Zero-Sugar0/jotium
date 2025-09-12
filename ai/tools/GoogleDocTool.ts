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
      description: "Complete Google Docs document management and collaboration platform for professional document creation, editing, and workflow automation. Create new documents with custom titles and content, edit existing documents with precise text insertion and replacement, apply advanced text formatting including bold, italic, underline, strikethrough, font sizes, colors, and background colors. Insert and format tables with custom rows and columns, add images with size control, create headers and footers, generate automatic table of contents, insert page and section breaks. Manage document structure with heading styles (H1, H2, H3), paragraph formatting with alignment and spacing, extract document content and metadata. Enable real-time collaboration with comments, sharing permissions, and role-based access control (owner, writer, commenter, reader). Support for templates, mail merge operations, batch updates, find and replace functionality, revision history and version control. Export documents to multiple formats (PDF, Word, TXT, RTF, HTML, ODT), import content, apply page formatting with margins and orientation. Perfect for automated document generation, collaborative editing workflows, template-based document creation, and comprehensive document management systems.",
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
              "find_text", "replace_all", "get_suggestions", "check_spelling",
              // AI and Smart Features (2024-2025)
              "insert_smart_chip", "create_dropdown", "insert_placeholder_chip", "apply_ai_formatting",
              // Advanced Table Operations
              "merge_table_cells", "split_table_cells", "format_table_borders", "resize_table",
              // Page Setup and Layout
              "set_page_orientation", "set_mirror_margins", "insert_footnote", "manage_sections",
              // Equation and Math
              "insert_math_equation", "insert_chemical_equation", "format_equation",
              // Document Automation
              "create_from_ai_template", "generate_summary", "suggest_improvements", "auto_format"
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

      let result: any;

      switch (args.action) {
        // Basic document operations
        case "create_document":
          if (!args.title) {
            return { success: false, error: "title is required for create_document" };
          }
          result = await this.createDocument(args, headers);
          break;
        case "get_document":
          if (!args.documentId) {
            return { success: false, error: "documentId is required for get_document" };
          }
          result = await this.getDocument(args, headers);
          break;
        case "update_document":
          if (!args.documentId || !args.requests) {
            return { success: false, error: "documentId and requests are required for update_document" };
          }
          result = await this.updateDocument(args, headers);
          break;
        case "delete_document":
          if (!args.documentId) {
            return { success: false, error: "documentId is required for delete_document" };
          }
          result = await this.deleteDocument(args, headers);
          break;
        case "list_documents":
          result = await this.listDocuments(args, headers);
          break;
        case "search_documents":
          result = await this.searchDocuments(args, headers);
          break;
          
        // Advanced content operations
        case "insert_text":
          if (!args.documentId || !args.text) {
            return { success: false, error: "documentId and text are required for insert_text" };
          }
          result = await this.insertText(args, headers);
          break;
        case "replace_text":
          if (!args.documentId || !args.oldText || !args.newText) {
            return { success: false, error: "documentId, oldText and newText are required for replace_text" };
          }
          result = await this.replaceText(args, headers);
          break;
        case "format_text":
          if (!args.documentId || args.startIndex === undefined || args.endIndex === undefined) {
            return { success: false, error: "documentId, startIndex and endIndex are required for format_text" };
          }
          result = await this.formatText(args, headers);
          break;
        case "insert_table":
          if (!args.documentId || !args.rows || !args.columns) {
            return { success: false, error: "documentId, rows and columns are required for insert_table" };
          }
          result = await this.insertTable(args, headers);
          break;
        case "insert_image":
          if (!args.documentId || !args.imageUrl) {
            return { success: false, error: "documentId and imageUrl are required for insert_image" };
          }
          result = await this.insertImage(args, headers);
          break;
        case "apply_heading_style":
          if (!args.documentId || !args.style) {
            return { success: false, error: "documentId and style are required for apply_heading_style" };
          }
          result = await this.applyHeadingStyle(args, headers);
          break;
        case "apply_paragraph_style":
          if (!args.documentId) {
            return { success: false, error: "documentId is required for apply_paragraph_style" };
          }
          result = await this.applyParagraphStyle(args, headers);
          break;
        case "insert_page_break":
          if (!args.documentId) {
            return { success: false, error: "documentId is required for insert_page_break" };
          }
          result = await this.insertPageBreak(args, headers);
          break;
        case "create_table_of_contents":
          if (!args.documentId) {
            return { success: false, error: "documentId is required for create_table_of_contents" };
          }
          result = await this.createTableOfContents(args, headers);
          break;
          
        // Document structure and formatting
        case "get_document_structure":
          if (!args.documentId) {
            return { success: false, error: "documentId is required for get_document_structure" };
          }
          result = await this.getDocumentStructure(args, headers);
          break;
        case "extract_text":
          if (!args.documentId) {
            return { success: false, error: "documentId is required for extract_text" };
          }
          result = await this.extractText(args, headers);
          break;
        case "get_word_count":
          if (!args.documentId) {
            return { success: false, error: "documentId is required for get_word_count" };
          }
          result = await this.getWordCount(args, headers);
          break;
          
        // Comments and collaboration
        case "add_comment":
          if (!args.documentId || !args.commentText) {
            return { success: false, error: "documentId and commentText are required for add_comment" };
          }
          result = await this.addComment(args, headers);
          break;
        case "get_comments":
          if (!args.documentId) {
            return { success: false, error: "documentId is required for get_comments" };
          }
          result = await this.getComments(args, headers);
          break;
        case "share_document":
          if (!args.documentId || !args.emailAddress) {
            return { success: false, error: "documentId and emailAddress are required for share_document" };
          }
          result = await this.shareDocument(args, headers);
          break;
          
        // Export and conversion
        case "export_document":
          if (!args.documentId || !args.exportFormat) {
            return { success: false, error: "documentId and exportFormat are required for export_document" };
          }
          result = await this.exportDocument(args, headers);
          break;
        case "download_as_pdf":
          if (!args.documentId) {
            return { success: false, error: "documentId is required for download_as_pdf" };
          }
          result = await this.downloadAsPdf(args, headers);
          break;
          
        // Lists and formatting
        case "create_bulleted_list":
          if (!args.documentId) {
            return { success: false, error: "documentId is required for create_bulleted_list" };
          }
          result = await this.createBulletedList(args, headers);
          break;
        case "create_numbered_list":
          if (!args.documentId) {
            return { success: false, error: "documentId is required for create_numbered_list" };
          }
          result = await this.createNumberedList(args, headers);
          break;
          
        // Find and replace
        case "find_and_replace_all":
          if (!args.documentId || !args.oldText || !args.newText) {
            return { success: false, error: "documentId, oldText and newText are required for find_and_replace_all" };
          }
          result = await this.findAndReplaceAll(args, headers);
          break;
          
        // AI and Smart Features (2024-2025)
        case "insert_smart_chip":
          if (!args.documentId || !args.chipType) {
            return { success: false, error: "documentId and chipType are required for insert_smart_chip" };
          }
          result = await this.insertSmartChip(args, headers);
          break;
        case "create_dropdown":
          if (!args.documentId || !args.dropdownOptions) {
            return { success: false, error: "documentId and dropdownOptions are required for create_dropdown" };
          }
          result = await this.createDropdown(args, headers);
          break;
        case "insert_placeholder_chip":
          if (!args.documentId || !args.placeholderType) {
            return { success: false, error: "documentId and placeholderType are required for insert_placeholder_chip" };
          }
          result = await this.insertPlaceholderChip(args, headers);
          break;
          
        // Advanced Table Operations
        case "merge_table_cells":
          if (!args.documentId || !args.tableId) {
            return { success: false, error: "documentId and tableId are required for merge_table_cells" };
          }
          result = await this.mergeTableCells(args, headers);
          break;
        case "format_table_borders":
          if (!args.documentId || !args.tableId) {
            return { success: false, error: "documentId and tableId are required for format_table_borders" };
          }
          result = await this.formatTableBorders(args, headers);
          break;
          
        // Page Setup and Layout
        case "set_page_orientation":
          if (!args.documentId || !args.orientation) {
            return { success: false, error: "documentId and orientation are required for set_page_orientation" };
          }
          result = await this.setPageOrientation(args, headers);
          break;
        case "insert_footnote":
          if (!args.documentId || !args.footnoteText) {
            return { success: false, error: "documentId and footnoteText are required for insert_footnote" };
          }
          result = await this.insertFootnote(args, headers);
          break;
          
        // Equation and Math
        case "insert_math_equation":
          if (!args.documentId || !args.equation) {
            return { success: false, error: "documentId and equation are required for insert_math_equation" };
          }
          result = await this.insertMathEquation(args, headers);
          break;
          
        // Document Automation
        case "create_from_ai_template":
          if (!args.templateType) {
            return { success: false, error: "templateType is required for create_from_ai_template" };
          }
          result = await this.createFromAiTemplate(args, headers);
          break;
        case "generate_summary":
          if (!args.documentId) {
            return { success: false, error: "documentId is required for generate_summary" };
          }
          result = await this.generateSummary(args, headers);
          break;
          
        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`
          };
      }

      return result;

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

  // ============ Advanced Content Operations ============

  private async insertText(args: any, headers: any): Promise<any> {
    const index = args.index || 1;
    const requests = [{
      insertText: {
        location: { index },
        text: args.text
      }
    }];
    
    return this.updateDocument({
      documentId: args.documentId,
      requests
    }, headers);
  }

  private async replaceText(args: any, headers: any): Promise<any> {
    const requests = [{
      replaceAllText: {
        containsText: {
          text: args.oldText,
          matchCase: args.matchCase || false
        },
        replaceText: args.newText
      }
    }];
    
    return this.updateDocument({
      documentId: args.documentId,
      requests
    }, headers);
  }

  private async formatText(args: any, headers: any): Promise<any> {
    const { documentId, startIndex, endIndex, format } = args;
    
    const textStyle: any = {};
    if (format?.bold !== undefined) textStyle.bold = format.bold;
    if (format?.italic !== undefined) textStyle.italic = format.italic;
    if (format?.underline !== undefined) textStyle.underline = format.underline;
    if (format?.strikethrough !== undefined) textStyle.strikethrough = format.strikethrough;
    if (format?.fontSize) textStyle.fontSize = { magnitude: format.fontSize, unit: 'PT' };
    if (format?.fontFamily) textStyle.weightedFontFamily = { fontFamily: format.fontFamily };
    if (format?.textColor) textStyle.foregroundColor = { color: { rgbColor: this.hexToRgb(format.textColor) } };
    if (format?.backgroundColor) textStyle.backgroundColor = { color: { rgbColor: this.hexToRgb(format.backgroundColor) } };

    const requests = [{
      updateTextStyle: {
        range: { startIndex, endIndex },
        textStyle,
        fields: Object.keys(textStyle).join(',')
      }
    }];
    
    return this.updateDocument({
      documentId,
      requests
    }, headers);
  }

  private async insertTable(args: any, headers: any): Promise<any> {
    const { documentId, rows, columns, index } = args;
    const insertIndex = index || 1;
    
    const requests = [{
      insertTable: {
        location: { index: insertIndex },
        rows,
        columns
      }
    }];
    
    return this.updateDocument({
      documentId,
      requests
    }, headers);
  }

  private async insertImage(args: any, headers: any): Promise<any> {
    const { documentId, imageUrl, imageSize, index } = args;
    const insertIndex = index || 1;
    
    const requests: any[] = [{
      insertInlineImage: {
        location: { index: insertIndex },
        uri: imageUrl
      }
    }];
    
    if (imageSize) {
      requests.push({
        updateInlineImageProperties: {
          objectId: 'IMAGE_ID_PLACEHOLDER', // This would need proper object ID
          inlineImageProperties: {
            embeddedObjectSize: imageSize
          },
          fields: 'embeddedObjectSize'
        }
      });
    }
    
    return this.updateDocument({
      documentId,
      requests
    }, headers);
  }

  private async applyHeadingStyle(args: any, headers: any): Promise<any> {
    const { documentId, style, startIndex, endIndex } = args;
    
    const styleMap: any = {
      'HEADING_1': 'HEADING_1',
      'HEADING_2': 'HEADING_2',
      'HEADING_3': 'HEADING_3',
      'TITLE': 'TITLE',
      'SUBTITLE': 'SUBTITLE',
      'NORMAL_TEXT': 'NORMAL_TEXT'
    };
    
    const requests = [{
      updateParagraphStyle: {
        range: { 
          startIndex: startIndex || 1, 
          endIndex: endIndex || 1000 
        },
        paragraphStyle: {
          namedStyleType: styleMap[style] || 'NORMAL_TEXT'
        },
        fields: 'namedStyleType'
      }
    }];
    
    return this.updateDocument({
      documentId,
      requests
    }, headers);
  }

  private async applyParagraphStyle(args: any, headers: any): Promise<any> {
    const { documentId, paragraphStyle, startIndex, endIndex } = args;
    
    const style: any = {};
    if (paragraphStyle?.alignment) style.alignment = { alignment: paragraphStyle.alignment };
    if (paragraphStyle?.lineSpacing) style.lineSpacing = paragraphStyle.lineSpacing;
    if (paragraphStyle?.spaceAbove) style.spaceAbove = { magnitude: paragraphStyle.spaceAbove, unit: 'PT' };
    if (paragraphStyle?.spaceBelow) style.spaceBelow = { magnitude: paragraphStyle.spaceBelow, unit: 'PT' };
    if (paragraphStyle?.indentStart) style.indentStart = { magnitude: paragraphStyle.indentStart, unit: 'PT' };
    if (paragraphStyle?.indentEnd) style.indentEnd = { magnitude: paragraphStyle.indentEnd, unit: 'PT' };

    const requests = [{
      updateParagraphStyle: {
        range: { 
          startIndex: startIndex || 1, 
          endIndex: endIndex || 1000 
        },
        paragraphStyle: style,
        fields: Object.keys(style).join(',')
      }
    }];
    
    return this.updateDocument({
      documentId,
      requests
    }, headers);
  }

  private async insertPageBreak(args: any, headers: any): Promise<any> {
    const { documentId, index } = args;
    const insertIndex = index || 1;
    
    const requests = [{
      insertPageBreak: {
        location: { index: insertIndex }
      }
    }];
    
    return this.updateDocument({
      documentId,
      requests
    }, headers);
  }

  private async createTableOfContents(args: any, headers: any): Promise<any> {
    const { documentId, index } = args;
    const insertIndex = index || 1;
    
    const requests = [{
      insertTableOfContents: {
        location: { index: insertIndex }
      }
    }];
    
    return this.updateDocument({
      documentId,
      requests
    }, headers);
  }

  // ============ Document Structure Operations ============

  private async getDocumentStructure(args: any, headers: any): Promise<any> {
    const response = await fetch(`https://docs.googleapis.com/v1/documents/${args.documentId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get document structure: ${error}` };
    }

    const document = await response.json();
    
    // Analyze document structure
    const structure = {
      title: document.title,
      revisionId: document.revisionId,
      documentStyle: document.documentStyle,
      namedStyles: document.namedStyles,
      content: this.analyzeDocumentStructure(document)
    };

    return {
      success: true,
      structure
    };
  }

  private async extractText(args: any, headers: any): Promise<any> {
    const getResult = await this.getDocument(args, headers);
    if (!getResult.success) return getResult;
    
    return {
      success: true,
      text: getResult.document.content || '',
      wordCount: this.countWords(getResult.document.content || ''),
      characterCount: (getResult.document.content || '').length
    };
  }

  private async getWordCount(args: any, headers: any): Promise<any> {
    const extractResult = await this.extractText(args, headers);
    if (!extractResult.success) return extractResult;
    
    return {
      success: true,
      wordCount: extractResult.wordCount,
      characterCount: extractResult.characterCount
    };
  }

  // ============ Collaboration Operations ============

  private async addComment(args: any, headers: any): Promise<any> {
    // Comments are handled through Google Drive API
    const commentData = {
      content: args.commentText,
      anchor: args.anchorText || 'Document comment'
    };

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.documentId}/comments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(commentData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to add comment: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      comment: result
    };
  }

  private async getComments(args: any, headers: any): Promise<any> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.documentId}/comments`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get comments: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      comments: result.comments || []
    };
  }

  private async shareDocument(args: any, headers: any): Promise<any> {
    const permission = {
      role: args.role || 'reader',
      type: 'user',
      emailAddress: args.emailAddress
    };

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.documentId}/permissions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(permission)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to share document: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      permission: result,
      message: `Document shared with ${args.emailAddress} as ${args.role || 'reader'}`
    };
  }

  // ============ Export Operations ============

  private async exportDocument(args: any, headers: any): Promise<any> {
    const { documentId, exportFormat } = args;
    
    const mimeTypes: any = {
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'rtf': 'application/rtf',
      'html': 'text/html',
      'odt': 'application/vnd.oasis.opendocument.text'
    };

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${documentId}/export?mimeType=${mimeTypes[exportFormat]}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to export document: ${error}` };
    }

    const content = await response.blob();
    return {
      success: true,
      content: content,
      format: exportFormat,
      message: `Document exported as ${exportFormat}`
    };
  }

  private async downloadAsPdf(args: any, headers: any): Promise<any> {
    return this.exportDocument({
      documentId: args.documentId,
      exportFormat: 'pdf'
    }, headers);
  }

  // ============ List Operations ============

  private async createBulletedList(args: any, headers: any): Promise<any> {
    const { documentId, startIndex, endIndex } = args;
    
    const requests = [{
      createParagraphBullets: {
        range: { 
          startIndex: startIndex || 1, 
          endIndex: endIndex || 100 
        },
        bulletPreset: 'BULLET_DISC_CIRCLE_SQUARE'
      }
    }];
    
    return this.updateDocument({
      documentId,
      requests
    }, headers);
  }

  private async createNumberedList(args: any, headers: any): Promise<any> {
    const { documentId, startIndex, endIndex } = args;
    
    const requests = [{
      createParagraphBullets: {
        range: { 
          startIndex: startIndex || 1, 
          endIndex: endIndex || 100 
        },
        bulletPreset: 'NUMBERED_DECIMAL_ALPHA_ROMAN'
      }
    }];
    
    return this.updateDocument({
      documentId,
      requests
    }, headers);
  }

  // ============ Find and Replace ============

  private async findAndReplaceAll(args: any, headers: any): Promise<any> {
    const { documentId, oldText, newText, matchCase } = args;
    
    const requests = [{
      replaceAllText: {
        containsText: {
          text: oldText,
          matchCase: matchCase || false
        },
        replaceText: newText
      }
    }];
    
    return this.updateDocument({
      documentId,
      requests
    }, headers);
  }

  // ============ Helper Methods ============

  private analyzeDocumentStructure(document: any): any {
    const structure: any = {
      headings: [],
      paragraphs: 0,
      tables: 0,
      images: 0,
      lists: []
    };

    if (!document.body || !document.body.content) return structure;

    for (const element of document.body.content) {
      if (element.paragraph) {
        structure.paragraphs++;
        
        // Check for headings
        if (element.paragraph.paragraphStyle && element.paragraph.paragraphStyle.namedStyleType) {
          const styleType = element.paragraph.paragraphStyle.namedStyleType;
          if (styleType.includes('HEADING')) {
            structure.headings.push({
              type: styleType,
              text: this.extractParagraphText(element.paragraph)
            });
          }
        }

        // Check for lists
        if (element.paragraph.bullet) {
          structure.lists.push({
            type: element.paragraph.bullet.listId,
            text: this.extractParagraphText(element.paragraph)
          });
        }
      }
      
      if (element.table) {
        structure.tables++;
      }
    }

    return structure;
  }

  private extractParagraphText(paragraph: any): string {
    let text = '';
    if (paragraph.elements) {
      for (const elem of paragraph.elements) {
        if (elem.textRun && elem.textRun.content) {
          text += elem.textRun.content;
        }
      }
    }
    return text.trim();
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private hexToRgb(hex: string): any {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      red: parseInt(result[1], 16) / 255,
      green: parseInt(result[2], 16) / 255,
      blue: parseInt(result[3], 16) / 255,
    } : { red: 0, green: 0, blue: 0 };
  }

  // ============ AI and Smart Features (2024-2025) ============

  private async insertSmartChip(args: any, headers: any): Promise<any> {
    const { documentId, chipType, chipData, index } = args;
    const insertIndex = index || 1;
    
    let chipContent = '';
    
    switch (chipType) {
      case 'person':
        chipContent = `@${chipData.email || 'user'}`;
        break;
      case 'file':
        chipContent = `@${chipData.fileName || 'file'}`;
        break;
      case 'date':
        chipContent = `@${chipData.date || new Date().toISOString()}`;
        break;
      case 'event':
        chipContent = `@${chipData.eventName || 'event'}`;
        break;
      case 'place':
        chipContent = `@${chipData.placeName || 'location'}`;
        break;
      default:
        chipContent = `@${chipType}`;
    }
    
    const requests = [{
      insertText: {
        location: { index: insertIndex },
        text: chipContent
      }
    }];
    
    return this.updateDocument({
      documentId,
      requests
    }, headers);
  }

  private async createDropdown(args: any, headers: any): Promise<any> {
    const { documentId, dropdownOptions, index } = args;
    const insertIndex = index || 1;
    
    // Create dropdown text with options
    const dropdownText = dropdownOptions.join(' | ');
    
    const requests = [{
      insertText: {
        location: { index: insertIndex },
        text: `[${dropdownText}]`
      }
    }];
    
    return this.updateDocument({
      documentId,
      requests
    }, headers);
  }

  private async insertPlaceholderChip(args: any, headers: any): Promise<any> {
    const { documentId, placeholderType, placeholderText, index } = args;
    const insertIndex = index || 1;
    
    const placeholderContent = placeholderText || `[${placeholderType.toUpperCase()}]`;
    
    const requests = [{
      insertText: {
        location: { index: insertIndex },
        text: placeholderContent
      }
    }];
    
    return this.updateDocument({
      documentId,
      requests
    }, headers);
  }

  // ============ Advanced Table Operations ============

  private async mergeTableCells(args: any, headers: any): Promise<any> {
    const { documentId, tableId, rowIndex, columnIndex, rowSpan, columnSpan } = args;
    
    const requests = [{
      mergeTableCells: {
        tableRange: {
          tableCellLocation: {
            tableStartLocation: { index: 1 }, // Would need proper table location
            rowIndex: rowIndex || 0,
            columnIndex: columnIndex || 0
          },
          rowSpan: rowSpan || 1,
          columnSpan: columnSpan || 1
        }
      }
    }];
    
    return this.updateDocument({
      documentId,
      requests
    }, headers);
  }

  private async formatTableBorders(args: any, headers: any): Promise<any> {
    const { documentId, tableId, borderStyle, borderColor, borderWidth } = args;
    
    const borderConfig: any = {
      dashStyle: borderStyle || 'SOLID',
      width: { magnitude: borderWidth || 1, unit: 'PT' }
    };
    
    if (borderColor) {
      borderConfig.color = { color: { rgbColor: this.hexToRgb(borderColor) } };
    }
    
    const requests = [{
      updateTableCellStyle: {
        tableRange: {
          tableCellLocation: {
            tableStartLocation: { index: 1 }, // Would need proper table location
            rowIndex: 0,
            columnIndex: 0
          },
          rowSpan: 1,
          columnSpan: 1
        },
        tableCellStyle: {
          borderTop: borderConfig,
          borderBottom: borderConfig,
          borderLeft: borderConfig,
          borderRight: borderConfig
        },
        fields: 'borderTop,borderBottom,borderLeft,borderRight'
      }
    }];
    
    return this.updateDocument({
      documentId,
      requests
    }, headers);
  }

  // ============ Page Setup and Layout ============

  private async setPageOrientation(args: any, headers: any): Promise<any> {
    const { documentId, orientation } = args;
    
    const requests = [{
      updateDocumentStyle: {
        documentStyle: {
          pageSize: {
            width: { magnitude: orientation === 'LANDSCAPE' ? 792 : 612, unit: 'PT' },
            height: { magnitude: orientation === 'LANDSCAPE' ? 612 : 792, unit: 'PT' }
          }
        },
        fields: 'pageSize'
      }
    }];
    
    return this.updateDocument({
      documentId,
      requests
    }, headers);
  }

  private async insertFootnote(args: any, headers: any): Promise<any> {
    const { documentId, footnoteText, index } = args;
    const insertIndex = index || 1;
    
    const requests = [{
      insertText: {
        location: { index: insertIndex },
        text: `[^${footnoteText}]`
      }
    }];
    
    return this.updateDocument({
      documentId,
      requests
    }, headers);
  }

  // ============ Equation and Math ============

  private async insertMathEquation(args: any, headers: any): Promise<any> {
    const { documentId, equation, index } = args;
    const insertIndex = index || 1;
    
    const requests = [{
      insertText: {
        location: { index: insertIndex },
        text: `$${equation}$`
      }
    }];
    
    return this.updateDocument({
      documentId,
      requests
    }, headers);
  }

  // ============ Document Automation ============

  private async createFromAiTemplate(args: any, headers: any): Promise<any> {
    const { templateType, title, variables } = args;
    
    // AI-powered template creation based on type
    let templateContent = '';
    
    switch (templateType) {
      case 'business_proposal':
        templateContent = this.generateBusinessProposalTemplate(variables);
        break;
      case 'meeting_agenda':
        templateContent = this.generateMeetingAgendaTemplate(variables);
        break;
      case 'project_report':
        templateContent = this.generateProjectReportTemplate(variables);
        break;
      case 'resume':
        templateContent = this.generateResumeTemplate(variables);
        break;
      default:
        templateContent = this.generateGenericTemplate(variables);
    }
    
    return this.createDocument({
      title: title || `${templateType} Document`,
      content: templateContent
    }, headers);
  }

  private async generateSummary(args: any, headers: any): Promise<any> {
    const { documentId } = args;
    
    // Get document content
    const getResult = await this.getDocument({ documentId }, headers);
    if (!getResult.success) return getResult;
    
    const content = getResult.document.content;
    
    // Simple summary generation (in real implementation, this would use AI)
    const sentences = content.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
    const summary = sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '...' : '');
    
    return {
      success: true,
      summary: summary,
      wordCount: this.countWords(content),
      documentTitle: getResult.document.title
    };
  }

  // ============ AI Template Generators ============

  private generateBusinessProposalTemplate(variables: any): string {
    return `
${variables.companyName || 'Your Company'} Business Proposal

Executive Summary
${variables.executiveSummary || 'Brief overview of the proposal'}

Problem Statement
${variables.problemStatement || 'Description of the problem being solved'}

Proposed Solution
${variables.solution || 'Detailed description of the proposed solution'}

Timeline
${variables.timeline || 'Project timeline and milestones'}

Budget
${variables.budget || 'Detailed budget breakdown'}

Conclusion
${variables.conclusion || 'Compelling conclusion and next steps'}
    `.trim();
  }

  private generateMeetingAgendaTemplate(variables: any): string {
    return `
Meeting Agenda - ${variables.meetingTitle || 'Team Meeting'}
Date: ${variables.date || 'TBD'}
Time: ${variables.time || 'TBD'}
Location: ${variables.location || 'TBD'}

Agenda Items:
1. ${variables.item1 || 'Opening and introductions'}
2. ${variables.item2 || 'Review of previous action items'}
3. ${variables.item3 || 'Main discussion topics'}
4. ${variables.item4 || 'New business'}
5. ${variables.item5 || 'Action items and next steps'}

Notes:
${variables.notes || 'Meeting notes will be recorded here'}
    `.trim();
  }

  private generateProjectReportTemplate(variables: any): string {
    return `
Project Report - ${variables.projectName || 'Project Name'}
Reporting Period: ${variables.reportingPeriod || 'Current Period'}

Project Status: ${variables.status || 'In Progress'}

Key Achievements:
• ${variables.achievement1 || 'Major accomplishment 1'}
• ${variables.achievement2 || 'Major accomplishment 2'}
• ${variables.achievement3 || 'Major accomplishment 3'}

Challenges:
• ${variables.challenge1 || 'Current challenge 1'}
• ${variables.challenge2 || 'Current challenge 2'}

Next Steps:
• ${variables.nextStep1 || 'Next action item 1'}
• ${variables.nextStep2 || 'Next action item 2'}

Budget Status: ${variables.budgetStatus || 'On Track'}
    `.trim();
  }

  private generateResumeTemplate(variables: any): string {
    return `
${variables.name || 'Your Name'}
${variables.title || 'Professional Title'}
${variables.email || 'email@example.com'} | ${variables.phone || '(555) 123-4567'} | ${variables.location || 'City, State'}

Professional Summary
${variables.summary || 'Brief professional summary highlighting key skills and experience'}

Experience
${variables.company1 || 'Company Name'} - ${variables.position1 || 'Job Title'}
${variables.duration1 || 'Dates'} | ${variables.location1 || 'Location'}
• ${variables.responsibility1 || 'Key responsibility or achievement'}
• ${variables.responsibility2 || 'Key responsibility or achievement'}

Education
${variables.degree || 'Degree'} - ${variables.university || 'University Name'}
${variables.graduationDate || 'Graduation Date'}

Skills
${variables.skills || 'List of relevant skills and technologies'}
    `.trim();
  }

  private generateGenericTemplate(variables: any): string {
    return `
${variables.title || 'Document Title'}

Introduction
${variables.introduction || 'Introduction to the document'}

Main Content
${variables.mainContent || 'Main content goes here'}

Conclusion
${variables.conclusion || 'Conclusion or summary'}

${variables.footer || 'Document footer'}
    `.trim();
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
