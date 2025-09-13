//ai/tools/GoogleDriveTool.ts
import { FunctionDeclaration, Type } from "@google/genai";
import { getValidOAuthAccessToken } from "@/lib/oauth-refresh";

export class GoogleDriveTool {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "google_drive_operations",
      description: "Transform your file management with Google Drive's powerful cloud storage platform. Securely store, organize, and share files of any type with advanced collaboration features, real-time synchronization, and seamless integration across Google Workspace. Perfect for document management, team collaboration, automated backups, file sharing, version control, and cross-platform file access. Supports advanced search, permission management, folder organization, file conversion, revision history, and automated workflows with Google Apps Script integration. Features include file revisions management, advanced permission controls, and comprehensive file operations.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: ["upload_file", "download_file", "list_files", "get_file_info", "delete_file", "create_folder", "search_files", "share_file", "copy_file", "move_file", "list_revisions", "get_revision", "download_revision", "list_permissions", "update_permission", "delete_permission", "list_comments", "create_comment", "delete_comment", "trash_file", "untrash_file", "list_trash", "empty_trash", "batch_delete", "batch_share", "get_changes", "watch_file", "list_shared_drives", "create_shared_drive"]
          },
          // File operations
          fileId: {
            type: Type.STRING,
            description: "Unique Google Drive file identifier (required for download_file, get_file_info, delete_file, share_file, copy_file, move_file). Found in file URLs or returned from upload/list operations. Format: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
          },
          fileName: {
            type: Type.STRING,
            description: "Name for the file including extension (required for upload_file, copy_file). Examples: 'report_2024.pdf', 'data_analysis.xlsx', 'presentation_final.pptx'. Include proper extensions for automatic MIME type detection and proper file handling."
          },
          fileContent: {
            type: Type.STRING,
            description: "Base64 encoded binary file content (required for upload_file). Convert your file to base64 format before uploading. Maximum size varies by file type but generally supports files up to 5TB. For large files, consider chunked upload or Google Drive API directly."
          },
          mimeType: {
            type: Type.STRING,
            description: "MIME type indicating file format (required for upload_file). Common types: 'application/pdf' for PDFs, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' for Excel, 'text/plain' for text files, 'image/jpeg' for JPEG images. Auto-detected for many common extensions."
          },
          parentFolderId: {
            type: Type.STRING,
            description: "Target folder ID where to upload/move file (optional, defaults to My Drive root). Use to organize files into specific folders. Find folder IDs by listing folders first or from folder URLs. Leave empty to place in root directory."
          },
          // Folder operations
          folderName: {
            type: Type.STRING,
            description: "Name for the new folder (required for create_folder). Examples: 'Project Files', 'Q4 Reports', 'Team Documents'. Folder names can contain spaces and special characters. Duplicate names are allowed in different parent folders."
          },
          // List/search parameters
          query: {
            type: Type.STRING,
            description: "Advanced search query using Google Drive query syntax (for search_files). Examples: 'name contains 'report'' for filename search, 'mimeType = 'application/pdf'' for PDF files only, 'modifiedTime > '2024-01-01'' for recent files, 'fullText contains 'quarterly'' for content search. Combine with AND/OR for complex queries."
          },
          maxResults: {
            type: Type.NUMBER,
            description: "Maximum number of results to return per page (default: 10, max: 1000). Use for pagination control. Higher values reduce API calls but may impact performance. Combine with nextPageToken for complete results across large datasets."
          },
          orderBy: {
            type: Type.STRING,
            description: "Sort order for file listing results",
            enum: ["createdTime", "folder", "modifiedByMeTime", "modifiedTime", "name", "quotaBytesUsed", "recency", "sharedWithMeTime", "starred", "viewedByMeTime"]
          },
          // Sharing parameters
          shareWithEmail: {
            type: Type.STRING,
            description: "Email address of person to share file with (required for share_file). Must be valid email format. Can be Gmail, Google Workspace, or external email addresses. The recipient will receive a notification email with access link."
          },
          shareRole: {
            type: Type.STRING,
            description: "Permission level for sharing. 'owner' = full control including deletion, 'writer' = can edit content and share, 'commenter' = can add comments but not edit, 'reader' = view-only access. Choose based on collaboration needs and security requirements.",
            enum: ["owner", "organizer", "fileOrganizer", "writer", "commenter", "reader"]
          },
          shareType: {
            type: Type.STRING,
            description: "Sharing scope type. 'user' = specific email address, 'group' = Google Group, 'domain' = entire organization, 'anyone' = public link. Use 'user' for individual collaboration, 'anyone' for public sharing with link.",
            enum: ["user", "group", "domain", "anyone"]
          },
          // Copy parameters
          newFileName: {
            type: Type.STRING,
            description: "Custom name for the copied file (optional for copy_file). If not provided, defaults to 'Copy of [original name]'. Useful for creating versions like 'Report_v2_Final.pdf' or 'Data_Analysis_Backup.xlsx'."
          },
          // Move parameters
          newParentFolderId: {
            type: Type.STRING,
            description: "Destination folder ID for moving file (required for move_file). File will be removed from current location and placed in new folder. Use to reorganize file structure or consolidate related files."
          },
          // List filters
          includeItemsFromAllDrives: {
            type: Type.BOOLEAN,
            description: "Include items from shared drives in addition to personal drive (default: false). When true, searches across Team Drives, Shared Drives, and My Drive. Useful for organization-wide file discovery and management."
          },
          spaces: {
            type: Type.STRING,
            description: "Specific storage spaces to search. 'drive' = main Google Drive, 'appDataFolder' = application data, 'photos' = Google Photos. Use 'drive' for regular files, 'photos' for image-specific searches.",
            enum: ["drive", "appDataFolder", "photos"]
          },
          // Revision parameters
          revisionId: {
            type: Type.STRING,
            description: "Revision ID for revision operations (required for get_revision, download_revision). Use 'head' for the latest revision or specific revision ID from list_revisions."
          },
          // Permission parameters
          permissionId: {
            type: Type.STRING,
            description: "Permission ID for permission operations (required for update_permission, delete_permission). Get permission IDs from list_permissions."
          },
          newPermissionRole: {
            type: Type.STRING,
            description: "New role for permission update (required for update_permission). Options: 'owner', 'organizer', 'fileOrganizer', 'writer', 'commenter', 'reader'.",
            enum: ["owner", "organizer", "fileOrganizer", "writer", "commenter", "reader"]
          },
          // Comment parameters
          commentId: {
            type: Type.STRING,
            description: "Comment ID for comment operations (required for delete_comment). Get comment IDs from list_comments."
          },
          commentText: {
            type: Type.STRING,
            description: "Text content for new comment (required for create_comment). Supports rich text and mentions with +email format."
          },
          // Batch operations parameters
          fileIds: {
            type: Type.ARRAY,
            description: "Array of file IDs for batch operations (required for batch_delete, batch_share). Maximum 100 files per batch operation.",
            items: {
              type: Type.STRING,
              description: "A single Google Drive file ID"
            }
          },
          // Change monitoring parameters
          changePageToken: {
            type: Type.STRING,
            description: "Page token for change pagination (optional for get_changes). Use nextPageToken from previous response or omit for first page."
          },
          includeDeleted: {
            type: Type.BOOLEAN,
            description: "Include deleted files in change results (optional for get_changes). Default: false."
          },
          // Shared drive parameters
          sharedDriveId: {
            type: Type.STRING,
            description: "Shared drive ID for shared drive operations (required for list_shared_drives when getting specific drive, create_shared_drive)."
          },
          sharedDriveName: {
            type: Type.STRING,
            description: "Name for new shared drive (required for create_shared_drive)."
          },
          // Webhook parameters
          webhookUrl: {
            type: Type.STRING,
            description: "Webhook URL for file change notifications (required for watch_file). Must be HTTPS and publicly accessible."
          },
          // Intelligent resolution
          autoResolveIds: {
            type: Type.BOOLEAN,
            description: "Automatically resolve file and folder IDs using names when IDs are not provided. When true, the tool will search for files/folders by name and use the most recently modified match. Useful for operations where you know the name but not the ID."
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

      // Intelligent ID resolution for common scenarios
      if (args.autoResolveIds && !args.fileId && (args.fileName || args.query)) {
        const resolvedId = await this.resolveFileId(args, headers);
        if (resolvedId) {
          args.fileId = resolvedId;
        }
      }

      if (args.autoResolveIds && !args.folderId && args.folderName) {
        const resolvedId = await this.resolveFolderId(args, headers);
        if (resolvedId) {
          if (args.action === "move_file") {
            args.newParentFolderId = resolvedId;
          } else {
            args.parentFolderId = resolvedId;
          }
        }
      }

      switch (args.action) {
        case "upload_file":
          return await this.uploadFile(args, headers);
        case "download_file":
          return await this.downloadFile(args, headers);
        case "list_files":
          return await this.listFiles(args, headers);
        case "get_file_info":
          return await this.getFileInfo(args, headers);
        case "delete_file":
          return await this.deleteFile(args, headers);
        case "create_folder":
          return await this.createFolder(args, headers);
        case "search_files":
          return await this.searchFiles(args, headers);
        case "share_file":
          return await this.shareFile(args, headers);
        case "copy_file":
          return await this.copyFile(args, headers);
        case "move_file":
          return await this.moveFile(args, headers);
        case "list_revisions":
          return await this.listRevisions(args, headers);
        case "get_revision":
          return await this.getRevision(args, headers);
        case "download_revision":
          return await this.downloadRevision(args, headers);
        case "list_permissions":
          return await this.listPermissions(args, headers);
        case "update_permission":
          return await this.updatePermission(args, headers);
        case "delete_permission":
          return await this.deletePermission(args, headers);
        case "list_comments":
          return await this.listComments(args, headers);
        case "create_comment":
          return await this.createComment(args, headers);
        case "delete_comment":
          return await this.deleteComment(args, headers);
        case "trash_file":
          return await this.trashFile(args, headers);
        case "untrash_file":
          return await this.untrashFile(args, headers);
        case "list_trash":
          return await this.listTrash(args, headers);
        case "empty_trash":
          return await this.emptyTrash(args, headers);
        case "batch_delete":
          return await this.batchDelete(args, headers);
        case "batch_share":
          return await this.batchShare(args, headers);
        case "get_changes":
          return await this.getChanges(args, headers);
        case "watch_file":
          return await this.watchFile(args, headers);
        case "list_shared_drives":
          return await this.listSharedDrives(args, headers);
        case "create_shared_drive":
          return await this.createSharedDrive(args, headers);
        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`
          };
      }
    } catch (error: unknown) {
      console.error("❌ Google Drive operation failed:", error);
      return {
        success: false,
        error: `Google Drive operation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Intelligent ID resolution methods
  private async resolveFileId(args: any, headers: any): Promise<string | null> {
    try {
      let query = '';
      
      if (args.fileName) {
        query = `name = '${args.fileName.replace(/'/g, "\\'")}'`;
      } else if (args.query) {
        query = args.query;
      }

      if (!query) return null;

      const searchArgs = {
        query: query,
        maxResults: 1,
        orderBy: 'modifiedTime'
      };

      const result = await this.searchFiles(searchArgs, headers);
      
      if (result.success && result.files && result.files.length > 0) {
        const file = result.files[0];
        
        // Add helpful context about the resolution
        console.log(`🔍 Auto-resolved file: "${file.name}" (ID: ${file.id})`);
        
        return file.id;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to auto-resolve file ID:', error);
      return null;
    }
  }

  private async resolveFolderId(args: any, headers: any): Promise<string | null> {
    try {
      if (!args.folderName) return null;

      const query = `name = '${args.folderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder'`;
      
      const searchArgs = {
        query: query,
        maxResults: 1,
        orderBy: 'modifiedTime'
      };

      const result = await this.searchFiles(searchArgs, headers);
      
      if (result.success && result.files && result.files.length > 0) {
        const folder = result.files[0];
        
        // Add helpful context about the resolution
        console.log(`📁 Auto-resolved folder: "${folder.name}" (ID: ${folder.id})`);
        
        return folder.id;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to auto-resolve folder ID:', error);
      return null;
    }
  }

  private async uploadFile(args: any, headers: any): Promise<any> {
    if (!args.fileName) {
      return { success: false, error: "File name is required" };
    }
    if (!args.fileContent) {
      return { success: false, error: "File content is required" };
    }
    if (!args.mimeType) {
      return { success: false, error: "MIME type is required" };
    }

    // Handle PDF files specifically
    let mimeType = args.mimeType;
    if (args.fileName.toLowerCase().endsWith('.pdf') || args.mimeType === 'application/pdf') {
      mimeType = 'application/pdf';
    }

    // Create file metadata
    const metadata = {
      name: args.fileName,
      parents: args.parentFolderId ? [args.parentFolderId] : undefined
    };

    // Use multipart upload for files with content
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    let body = delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) + delimiter +
      `Content-Type: ${mimeType}\r\n` +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      args.fileContent +
      close_delim;

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': headers.Authorization,
        'Content-Type': `multipart/related; boundary="${boundary}"`
      },
      body: body
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Upload error:", error);
      
      // Try simple upload as fallback
      if (response.status === 400) {
        return await this.simpleUploadFile(args, headers);
      }
      
      return { success: false, error: `Failed to upload file: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      file: this.formatFileInfo(result),
      message: `Successfully uploaded ${args.fileName} to Google Drive`
    };
  }

  private async simpleUploadFile(args: any, headers: any): Promise<any> {
    try {
      let mimeType = args.mimeType;
      if (args.fileName.toLowerCase().endsWith('.pdf')) {
        mimeType = 'application/pdf';
      }

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=media', {
        method: 'POST',
        headers: {
          'Authorization': headers.Authorization,
          'Content-Type': mimeType,
          'Content-Length': String(args.fileContent.length)
        },
        body: Buffer.from(args.fileContent, 'base64')
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Simple upload failed: ${error}` };
      }

      const result = await response.json();
      
      // Update file name
      if (args.fileName !== result.name) {
        await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': headers.Authorization,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: args.fileName })
        });
      }

      return {
        success: true,
        file: this.formatFileInfo({ ...result, name: args.fileName }),
        message: `Successfully uploaded ${args.fileName} to Google Drive`
      };
    } catch (error) {
      return { success: false, error: `Simple upload failed: ${error}` };
    }
  }

  // New method for PDF upload
  async uploadPdf(fileName: string, fileContent: string, parentFolderId?: string): Promise<any> {
    return this.execute({
      action: "upload_file",
      fileName: fileName,
      fileContent: fileContent,
      mimeType: "application/pdf",
      parentFolderId: parentFolderId
    });
  }

  private async downloadFile(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }

    // First get file info to check if it's a Google Workspace document
    const fileInfo = await this.getFileInfo(args, headers);
    if (!fileInfo.success) {
      return fileInfo;
    }

    const file = fileInfo.file;
    let downloadUrl = `https://www.googleapis.com/drive/v3/files/${args.fileId}?alt=media`;

    // Handle Google Workspace files (export instead of download)
    if (file.mimeType?.startsWith('application/vnd.google-apps.')) {
      const exportMimeType = this.getExportMimeType(file.mimeType);
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${args.fileId}/export?mimeType=${encodeURIComponent(exportMimeType)}`;
    }

    const response = await fetch(downloadUrl, { headers });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to download file: ${error}` };
    }

    const content = await response.arrayBuffer();
    const base64Content = Buffer.from(content).toString('base64');

    return {
      success: true,
      file: {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        content: base64Content
      }
    };
  }

  private async listFiles(args: any, headers: any): Promise<any> {
    const params = new URLSearchParams();
    params.append('fields', 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, parents, owners, shared, webViewLink, webContentLink)');
    
    if (args.maxResults) params.append('pageSize', String(Math.min(args.maxResults, 1000)));
    if (args.orderBy) params.append('orderBy', args.orderBy);
    if (args.includeItemsFromAllDrives) params.append('includeItemsFromAllDrives', 'true');
    if (args.spaces) params.append('spaces', args.spaces);

    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list files: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      files: result.files?.map((file: any) => this.formatFileInfo(file)) || [],
      nextPageToken: result.nextPageToken
    };
  }

  private async getFileInfo(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}?fields=*`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get file info: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      file: this.formatFileInfo(result)
    };
  }

  private async deleteFile(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to delete file: ${error}` };
    }

    return {
      success: true,
      message: "File deleted successfully"
    };
  }

  private async createFolder(args: any, headers: any): Promise<any> {
    if (!args.folderName) {
      return { success: false, error: "Folder name is required" };
    }

    const metadata = {
      name: args.folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: args.parentFolderId ? [args.parentFolderId] : undefined
    };

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers,
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create folder: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      folder: this.formatFileInfo(result)
    };
  }

  private async searchFiles(args: any, headers: any): Promise<any> {
    if (!args.query) {
      return { success: false, error: "Search query is required" };
    }

    const params = new URLSearchParams();
    params.append('q', args.query);
    params.append('fields', 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, parents, owners, shared, webViewLink, webContentLink)');
    
    if (args.maxResults) params.append('pageSize', String(Math.min(args.maxResults, 1000)));
    if (args.orderBy) params.append('orderBy', args.orderBy);
    if (args.includeItemsFromAllDrives) params.append('includeItemsFromAllDrives', 'true');
    if (args.spaces) params.append('spaces', args.spaces);

    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to search files: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      files: result.files?.map((file: any) => this.formatFileInfo(file)) || [],
      nextPageToken: result.nextPageToken,
      query: args.query
    };
  }

  private async shareFile(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }
    if (!args.shareWithEmail) {
      return { success: false, error: "Email address is required for sharing" };
    }

    const permission = {
      role: args.shareRole || 'reader',
      type: args.shareType || 'user',
      emailAddress: args.shareWithEmail
    };

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}/permissions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(permission)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to share file: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      permission: result,
      message: `File shared successfully with ${args.shareWithEmail}`
    };
  }

  private async copyFile(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }

    const metadata = {
      name: args.newFileName || args.fileName || 'Copy of file',
      parents: args.parentFolderId ? [args.parentFolderId] : undefined
    };

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}/copy`, {
      method: 'POST',
      headers,
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to copy file: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      file: this.formatFileInfo(result)
    };
  }

  private async moveFile(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }
    if (!args.newParentFolderId) {
      return { success: false, error: "New parent folder ID is required" };
    }

    // First get current parents
    const fileInfo = await this.getFileInfo(args, headers);
    if (!fileInfo.success) {
      return fileInfo;
    }

    const currentParents = fileInfo.file.parents?.join(',') || '';

    const params = new URLSearchParams();
    params.append('addParents', args.newParentFolderId);
    if (currentParents) params.append('removeParents', currentParents);

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}?${params}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({}) // Empty body for move operation
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to move file: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      file: this.formatFileInfo(result),
      message: "File moved successfully"
    };
  }

  private formatFileInfo(file: any): any {
    return {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size ? parseInt(file.size) : null,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      parents: file.parents,
      owners: file.owners?.map((owner: any) => ({
        displayName: owner.displayName,
        emailAddress: owner.emailAddress
      })),
      shared: file.shared || false,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink,
      thumbnailLink: file.thumbnailLink,
      iconLink: file.iconLink
    };
  }

  private getExportMimeType(googleMimeType: string): string {
    const exportMap: { [key: string]: string } = {
      'application/vnd.google-apps.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.google-apps.presentation': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.google-apps.drawing': 'image/png',
      'application/vnd.google-apps.script': 'application/vnd.google-apps.script+json'
    };

    return exportMap[googleMimeType] || 'application/pdf';
  }

  // Revision management methods
  private async listRevisions(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}/revisions`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list revisions: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      revisions: result.revisions?.map((revision: any) => ({
        id: revision.id,
        mimeType: revision.mimeType,
        modifiedTime: revision.modifiedTime,
        keepForever: revision.keepForever,
        published: revision.published,
        size: revision.size ? parseInt(revision.size) : null,
        lastModifyingUser: revision.lastModifyingUser ? {
          displayName: revision.lastModifyingUser.displayName,
          emailAddress: revision.lastModifyingUser.emailAddress
        } : null
      })) || []
    };
  }

  private async getRevision(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }
    if (!args.revisionId) {
      return { success: false, error: "Revision ID is required" };
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}/revisions/${args.revisionId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get revision: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      revision: {
        id: result.id,
        mimeType: result.mimeType,
        modifiedTime: result.modifiedTime,
        keepForever: result.keepForever,
        published: result.published,
        size: result.size ? parseInt(result.size) : null,
        exportLinks: result.exportLinks || {},
        lastModifyingUser: result.lastModifyingUser ? {
          displayName: result.lastModifyingUser.displayName,
          emailAddress: result.lastModifyingUser.emailAddress
        } : null
      }
    };
  }

  private async downloadRevision(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }
    if (!args.revisionId) {
      return { success: false, error: "Revision ID is required" };
    }

    // First get the revision info to check export links
    const revisionInfo = await this.getRevision(args, headers);
    if (!revisionInfo.success) {
      return revisionInfo;
    }

    const revision = revisionInfo.revision;
    
    // For Google Workspace files, use export links if available
    if (revision.exportLinks && Object.keys(revision.exportLinks).length > 0) {
      const exportMimeType = 'application/pdf'; // Default to PDF
      const exportUrl = revision.exportLinks[exportMimeType] || Object.values(revision.exportLinks)[0];
      
      const response = await fetch(exportUrl, { headers });
      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Failed to download revision: ${error}` };
      }

      const content = await response.arrayBuffer();
      const base64Content = Buffer.from(content).toString('base64');

      return {
        success: true,
        revision: {
          id: revision.id,
          content: base64Content,
          mimeType: exportMimeType
        }
      };
    }

    // For regular files, try to download the revision
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${args.fileId}?alt=media&revision=${args.revisionId}`;
    const response = await fetch(downloadUrl, { headers });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to download revision: ${error}` };
    }

    const content = await response.arrayBuffer();
    const base64Content = Buffer.from(content).toString('base64');

    return {
      success: true,
      revision: {
        id: revision.id,
        content: base64Content,
        mimeType: revision.mimeType
      }
    };
  }

  // Permission management methods
  private async listPermissions(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }

    const params = new URLSearchParams();
    params.append('fields', 'permissions(id, role, type, emailAddress, displayName, domain, allowFileDiscovery, deleted, pendingOwner)');

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}/permissions?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list permissions: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      permissions: result.permissions?.map((permission: any) => ({
        id: permission.id,
        role: permission.role,
        type: permission.type,
        emailAddress: permission.emailAddress,
        displayName: permission.displayName,
        domain: permission.domain,
        allowFileDiscovery: permission.allowFileDiscovery,
        deleted: permission.deleted,
        pendingOwner: permission.pendingOwner
      })) || []
    };
  }

  private async updatePermission(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }
    if (!args.permissionId) {
      return { success: false, error: "Permission ID is required" };
    }
    if (!args.newPermissionRole) {
      return { success: false, error: "New permission role is required" };
    }

    const permission = {
      role: args.newPermissionRole
    };

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}/permissions/${args.permissionId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(permission)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to update permission: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      permission: {
        id: result.id,
        role: result.role,
        type: result.type,
        emailAddress: result.emailAddress,
        displayName: result.displayName
      },
      message: "Permission updated successfully"
    };
  }

  private async deletePermission(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }
    if (!args.permissionId) {
      return { success: false, error: "Permission ID is required" };
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}/permissions/${args.permissionId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to delete permission: ${error}` };
    }

    return {
      success: true,
      message: "Permission deleted successfully"
    };
  }

  // Comments management methods
  private async listComments(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }

    const params = new URLSearchParams();
    params.append('fields', 'comments(id, content, createdTime, modifiedTime, author, resolved, replies)');

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}/comments?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list comments: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      comments: result.comments?.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        createdTime: comment.createdTime,
        modifiedTime: comment.modifiedTime,
        resolved: comment.resolved,
        author: comment.author ? {
          displayName: comment.author.displayName,
          emailAddress: comment.author.emailAddress
        } : null,
        replies: comment.replies?.map((reply: any) => ({
          id: reply.id,
          content: reply.content,
          createdTime: reply.createdTime,
          author: reply.author ? {
            displayName: reply.author.displayName,
            emailAddress: reply.author.emailAddress
          } : null
        })) || []
      })) || []
    };
  }

  private async createComment(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }
    if (!args.commentText) {
      return { success: false, error: "Comment text is required" };
    }

    const comment = {
      content: args.commentText
    };

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}/comments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(comment)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create comment: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      comment: {
        id: result.id,
        content: result.content,
        createdTime: result.createdTime,
        author: result.author ? {
          displayName: result.author.displayName,
          emailAddress: result.author.emailAddress
        } : null
      },
      message: "Comment created successfully"
    };
  }

  private async deleteComment(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }
    if (!args.commentId) {
      return { success: false, error: "Comment ID is required" };
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}/comments/${args.commentId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to delete comment: ${error}` };
    }

    return {
      success: true,
      message: "Comment deleted successfully"
    };
  }

  // Trash management methods
  private async trashFile(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }

    const metadata = {
      trashed: true
    };

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to trash file: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      file: this.formatFileInfo(result),
      message: "File moved to trash successfully"
    };
  }

  private async untrashFile(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }

    const metadata = {
      trashed: false
    };

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to untrash file: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      file: this.formatFileInfo(result),
      message: "File restored from trash successfully"
    };
  }

  private async listTrash(args: any, headers: any): Promise<any> {
    const params = new URLSearchParams();
    params.append('q', 'trashed = true');
    params.append('fields', 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, parents, owners, shared, webViewLink, webContentLink)');
    
    if (args.maxResults) params.append('pageSize', String(Math.min(args.maxResults, 1000)));
    if (args.orderBy) params.append('orderBy', args.orderBy);

    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list trash: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      files: result.files?.map((file: any) => this.formatFileInfo(file)) || [],
      nextPageToken: result.nextPageToken
    };
  }

  private async emptyTrash(args: any, headers: any): Promise<any> {
    const response = await fetch('https://www.googleapis.com/drive/v3/files/trash', {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to empty trash: ${error}` };
    }

    return {
      success: true,
      message: "Trash emptied successfully"
    };
  }

  // Batch operations methods
  private async batchDelete(args: any, headers: any): Promise<any> {
    if (!args.fileIds || !Array.isArray(args.fileIds) || args.fileIds.length === 0) {
      return { success: false, error: "File IDs array is required and must contain at least one file ID" };
    }
    if (args.fileIds.length > 100) {
      return { success: false, error: "Maximum 100 files allowed per batch operation" };
    }

    const results = [];
    const errors = [];

    for (const fileId of args.fileIds) {
      try {
        const deleteArgs = { ...args, fileId, action: "delete_file" };
        const result = await this.deleteFile(deleteArgs, headers);
        results.push({ fileId, success: result.success, message: result.message || result.error });
      } catch (error) {
        errors.push({ fileId, error: error instanceof Error ? error.message : String(error) });
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      message: `Batch delete completed. ${results.length} successful, ${errors.length} failed`
    };
  }

  private async batchShare(args: any, headers: any): Promise<any> {
    if (!args.fileIds || !Array.isArray(args.fileIds) || args.fileIds.length === 0) {
      return { success: false, error: "File IDs array is required and must contain at least one file ID" };
    }
    if (!args.shareWithEmail) {
      return { success: false, error: "Email address is required for sharing" };
    }
    if (args.fileIds.length > 100) {
      return { success: false, error: "Maximum 100 files allowed per batch operation" };
    }

    const results = [];
    const errors = [];

    for (const fileId of args.fileIds) {
      try {
        const shareArgs = { ...args, fileId, action: "share_file" };
        const result = await this.shareFile(shareArgs, headers);
        results.push({ fileId, success: result.success, message: result.message || result.error });
      } catch (error) {
        errors.push({ fileId, error: error instanceof Error ? error.message : String(error) });
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      message: `Batch share completed. ${results.length} successful, ${errors.length} failed`
    };
  }

  // Change monitoring methods
  private async getChanges(args: any, headers: any): Promise<any> {
    const params = new URLSearchParams();
    params.append('fields', 'nextPageToken, newStartPageToken, changes(fileId, file, changeType, time, removed)');
    
    if (args.changePageToken) params.append('pageToken', args.changePageToken);
    if (args.includeDeleted) params.append('includeDeleted', 'true');
    if (args.includeItemsFromAllDrives) params.append('includeItemsFromAllDrives', 'true');
    if (args.maxResults) params.append('pageSize', String(Math.min(args.maxResults, 100)));

    const response = await fetch(`https://www.googleapis.com/drive/v3/changes?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get changes: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      changes: result.changes?.map((change: any) => ({
        fileId: change.fileId,
        changeType: change.changeType,
        time: change.time,
        removed: change.removed,
        file: change.file ? this.formatFileInfo(change.file) : null
      })) || [],
      nextPageToken: result.nextPageToken,
      newStartPageToken: result.newStartPageToken
    };
  }

  private async watchFile(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }
    if (!args.webhookUrl) {
      return { success: false, error: "Webhook URL is required" };
    }

    const watchRequest = {
      id: `watch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'web_hook',
      address: args.webhookUrl
    };

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}/watch`, {
      method: 'POST',
      headers,
      body: JSON.stringify(watchRequest)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to watch file: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      watch: {
        id: result.id,
        resourceId: result.resourceId,
        resourceUri: result.resourceUri,
        expiration: result.expiration
      },
      message: "File watch set up successfully"
    };
  }

  // Shared drive methods
  private async listSharedDrives(args: any, headers: any): Promise<any> {
    const params = new URLSearchParams();
    params.append('fields', 'nextPageToken, drives(id, name, createdTime, hidden, capabilities, restrictions)');
    
    if (args.maxResults) params.append('pageSize', String(Math.min(args.maxResults, 100)));
    if (args.sharedDriveId) {
      // Get specific shared drive
      const response = await fetch(`https://www.googleapis.com/drive/v3/drives/${args.sharedDriveId}`, {
        headers
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Failed to get shared drive: ${error}` };
      }

      const result = await response.json();
      return {
        success: true,
        drive: {
          id: result.id,
          name: result.name,
          createdTime: result.createdTime,
          hidden: result.hidden,
          capabilities: result.capabilities,
          restrictions: result.restrictions
        }
      };
    }

    // List all shared drives
    const response = await fetch(`https://www.googleapis.com/drive/v3/drives?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list shared drives: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      drives: result.drives?.map((drive: any) => ({
        id: drive.id,
        name: drive.name,
        createdTime: drive.createdTime,
        hidden: drive.hidden,
        capabilities: drive.capabilities,
        restrictions: drive.restrictions
      })) || [],
      nextPageToken: result.nextPageToken
    };
  }

  private async createSharedDrive(args: any, headers: any): Promise<any> {
    if (!args.sharedDriveName) {
      return { success: false, error: "Shared drive name is required" };
    }

    const drive = {
      name: args.sharedDriveName
    };

    const params = new URLSearchParams();
    params.append('requestId', `drive-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

    const response = await fetch(`https://www.googleapis.com/drive/v3/drives?${params}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(drive)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create shared drive: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      drive: {
        id: result.id,
        name: result.name,
        createdTime: result.createdTime
      },
      message: "Shared drive created successfully"
    };
  }
}
