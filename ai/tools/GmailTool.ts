//ai/tools/GmailTool.ts
import { FunctionDeclaration, Type } from "@google/genai";
import { getValidOAuthAccessToken } from "@/lib/oauth-refresh";

export class GmailTool {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "gmail_operations",
      description: "Access Gmail's complete email management capabilities through a unified interface. Send professional emails with rich HTML formatting as the primary method, search through your entire email history using powerful Gmail search syntax, organize messages with custom labels, and manage your inbox efficiently. Perfect for email automation, customer communication, newsletter management, and building email-based workflows. HTML formatting is recommended for professional emails with links, styling, and rich content, while plain text remains available for simple communications.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: ["send_email", "list_messages", "get_message", "search_messages", "create_label", "list_labels"]
          },
          // Send email parameters
          to: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Primary email recipients (required for send_email). Accepts multiple email addresses in array format. Use standard email format: 'user@example.com', 'John Doe <john@example.com>'. Supports Gmail aliases and Google Workspace accounts."
          },
          cc: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Carbon copy recipients (optional for send_email). Recipients visible to all other recipients. Use for transparency when multiple people need to see the email. Format same as 'to' field."
          },
          bcc: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Blind carbon copy recipients (optional for send_email). Recipients hidden from other recipients. Use for privacy when sending to multiple people who shouldn't see each other's addresses."
          },
          subject: {
            type: Type.STRING,
            description: "Email subject line (required for send_email). Keep concise and descriptive. Appears in inbox preview. Supports Unicode characters and emojis. Maximum recommended length is 78 characters for optimal display across email clients."
          },
          body: {
            type: Type.STRING,
            description: "Email body content (required for send_email). Supports plain text or HTML formatting. For HTML emails, set isHtml to true. Can include links, formatting, and basic HTML tags. Maximum size limit applies per Gmail API restrictions."
          },
          isHtml: {
            type: Type.BOOLEAN,
            description: "Email format setting (default: false). When true, treats body as HTML content allowing rich formatting, links, images, and styling. When false, sends as plain text. Use HTML for professional emails with formatting requirements."
          },
          // List/search parameters
          query: {
            type: Type.STRING,
            description: "Gmail search query using Gmail's advanced search syntax. Examples: 'from:sender@example.com', 'subject:meeting', 'has:attachment', 'older_than:2d', 'label:inbox is:unread'. Combine multiple criteria with spaces. Supports operators like from:, to:, subject:, has:, older_than:, newer_than:, label:, is:starred/unread/read."
          },
          maxResults: {
            type: Type.NUMBER,
            description: "Maximum number of messages to return per request (default: 10, max: 100). Higher values reduce API calls but may impact performance. Use with nextPageToken for pagination when dealing with large result sets."
          },
          labelIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Gmail label IDs to filter messages. Use system labels like 'INBOX', 'UNREAD', 'STARRED' or custom label IDs from list_labels. Multiple labels act as AND filters. Common labels: 'INBOX', 'SENT', 'DRAFT', 'SPAM', 'TRASH'."
          },
          // Message ID for get_message
          messageId: {
            type: Type.STRING,
            description: "Unique Gmail message ID to retrieve specific email (required for get_message). Obtain from list_messages or search_messages responses. Format: alphanumeric string like '16a3c5e8d9f2b4a1'. Each message has a unique ID within your Gmail account."
          },
          // Label creation
          labelName: {
            type: Type.STRING,
            description: "Custom label name to create for organizing emails (required for create_label). Choose descriptive names for categorization like 'Work', 'Personal', 'Newsletters', 'Important'. Cannot duplicate existing label names. Supports spaces and special characters."
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
          error: "Gmail OAuth connection not found. Please connect your Gmail account first."
        };
      }

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      switch (args.action) {
        case "send_email":
          return await this.sendEmail(args, headers);
        case "list_messages":
          return await this.listMessages(args, headers);
        case "get_message":
          return await this.getMessage(args, headers);
        case "search_messages":
          return await this.searchMessages(args, headers);
        case "create_label":
          return await this.createLabel(args, headers);
        case "list_labels":
          return await this.listLabels(headers);
        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`
          };
      }
    } catch (error: unknown) {
      console.error("❌ Gmail operation failed:", error);
      return {
        success: false,
        error: `Gmail operation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async sendEmail(args: any, headers: any): Promise<any> {
    if (!args.to || !Array.isArray(args.to) || args.to.length === 0) {
      return { success: false, error: "Recipients (to) are required for sending email" };
    }
    if (!args.subject) {
      return { success: false, error: "Subject is required for sending email" };
    }
    if (!args.body) {
      return { success: false, error: "Body is required for sending email" };
    }

    // Create email content
    const email = this.createEmailMessage({
      to: args.to,
      cc: args.cc || [],
      bcc: args.bcc || [],
      subject: args.subject,
      body: args.body,
      isHtml: args.isHtml || false
    });

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        raw: Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to send email: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.id,
      threadId: result.threadId,
      labelIds: result.labelIds
    };
  }

  private async listMessages(args: any, headers: any): Promise<any> {
    const params = new URLSearchParams();
    if (args.maxResults) params.append('maxResults', String(Math.min(args.maxResults, 100)));
    if (args.labelIds && Array.isArray(args.labelIds)) {
      args.labelIds.forEach((labelId: string) => params.append('labelIds', labelId));
    }
    if (args.query) params.append('q', args.query);

    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list messages: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      messages: result.messages || [],
      nextPageToken: result.nextPageToken,
      resultSizeEstimate: result.resultSizeEstimate
    };
  }

  private async getMessage(args: any, headers: any): Promise<any> {
    if (!args.messageId) {
      return { success: false, error: "Message ID is required" };
    }

    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${args.messageId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get message: ${error}` };
    }

    const message = await response.json();
    
    // Parse message for easier consumption
    const parsed = this.parseMessage(message);
    
    return {
      success: true,
      message: parsed
    };
  }

  private async searchMessages(args: any, headers: any): Promise<any> {
    if (!args.query) {
      return { success: false, error: "Query is required for search" };
    }

    return await this.listMessages(args, headers);
  }

  private async createLabel(args: any, headers: any): Promise<any> {
    if (!args.labelName) {
      return { success: false, error: "Label name is required" };
    }

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: args.labelName,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create label: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      label: result
    };
  }

  private async listLabels(headers: any): Promise<any> {
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list labels: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      labels: result.labels || []
    };
  }

  private createEmailMessage(emailData: any): string {
    const { to, cc, bcc, subject, body, isHtml } = emailData;
    
    let email = '';
    email += `To: ${to.join(', ')}\r\n`;
    if (cc && cc.length > 0) email += `Cc: ${cc.join(', ')}\r\n`;
    if (bcc && bcc.length > 0) email += `Bcc: ${bcc.join(', ')}\r\n`;
    email += `Subject: ${subject}\r\n`;
    email += `Content-Type: ${isHtml ? 'text/html' : 'text/plain'}; charset=utf-8\r\n`;
    email += `MIME-Version: 1.0\r\n\r\n`;
    email += body;
    
    return email;
  }

  private parseMessage(message: any): any {
    const headers = message.payload?.headers || [];
    const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value;

    let body = '';
    if (message.payload?.body?.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else if (message.payload?.parts) {
      // Handle multipart messages
      const textPart = message.payload.parts.find((part: any) => part.mimeType === 'text/plain');
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    }

    return {
      id: message.id,
      threadId: message.threadId,
      labelIds: message.labelIds,
      snippet: message.snippet,
      historyId: message.historyId,
      internalDate: message.internalDate,
      from: getHeader('From'),
      to: getHeader('To'),
      cc: getHeader('Cc'),
      bcc: getHeader('Bcc'),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      body,
      sizeEstimate: message.sizeEstimate
    };
  }
}
