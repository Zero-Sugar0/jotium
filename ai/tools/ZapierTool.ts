import { FunctionDeclaration, Type } from "@google/genai";

export class ZapierTool {
  private baseUrl: string = "https://hooks.zapier.com/hooks/catch";
  private userAgent: string = "ZapierTool/1.0";
  private apiKey: string | null = null;
  private webhookUrl: string | null = null;

  constructor(apiKey?: string, webhookUrl?: string) {
    this.apiKey = apiKey || null;
    this.webhookUrl = webhookUrl || null;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "zapier_webhook",
      description: "Trigger Zapier webhooks to automate tasks and integrate with 7000+ apps including Gmail, Slack, Google Sheets, Airtable, Trello, and more. Can send data to trigger automated workflows.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          webhookUrl: {
            type: Type.STRING,
            description: "The full Zapier webhook URL (e.g., https://hooks.zapier.com/hooks/catch/123456/abcdef/). Required if not set in constructor."
          },
          data: {
            type: Type.OBJECT,
            description: "Data payload to send to the webhook. Can contain any key-value pairs that your Zap expects.",
            properties: {
              title: {
                type: Type.STRING,
                description: "Title or subject of the action"
              },
              message: {
                type: Type.STRING,
                description: "Main message or content"
              },
              email: {
                type: Type.STRING,
                description: "Email address (for email-related Zaps)"
              },
              name: {
                type: Type.STRING,
                description: "Name field"
              },
              phone: {
                type: Type.STRING,
                description: "Phone number"
              },
              priority: {
                type: Type.STRING,
                description: "Priority level (high, medium, low)"
              },
              category: {
                type: Type.STRING,
                description: "Category or tag"
              },
              dueDate: {
                type: Type.STRING,
                description: "Due date in ISO format (YYYY-MM-DD)"
              },
              amount: {
                type: Type.NUMBER,
                description: "Numerical amount (for financial or quantity data)"
              },
              url: {
                type: Type.STRING,
                description: "URL or link"
              },
              description: {
                type: Type.STRING,
                description: "Detailed description"
              },
              tags: {
                type: Type.ARRAY,
                description: "Array of tags or labels",
                items: {
                  type: Type.STRING
                }
              }
            }
          },
          method: {
            type: Type.STRING,
            description: "HTTP method to use (default: POST). Zapier webhooks typically use POST."
          },
          headers: {
            type: Type.OBJECT,
            description: "Additional headers to send with the request"
          },
          timeout: {
            type: Type.NUMBER,
            description: "Request timeout in milliseconds (default: 30000)"
          },
          retries: {
            type: Type.NUMBER,
            description: "Number of retry attempts on failure (default: 3)"
          },
          validateResponse: {
            type: Type.BOOLEAN,
            description: "Whether to validate the webhook response (default: true)"
          }
        },
        required: ["data"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const webhookUrl = args.webhookUrl || this.webhookUrl;
      
      if (!webhookUrl) {
        throw new Error("Webhook URL is required. Provide it in the constructor or as a parameter.");
      }

      if (!this.isValidZapierWebhookUrl(webhookUrl)) {
        throw new Error("Invalid Zapier webhook URL format. Expected format: https://hooks.zapier.com/hooks/catch/{user_id}/{hook_id}/");
      }

      console.log(`⚡ Triggering Zapier webhook: ${this.maskWebhookUrl(webhookUrl)}`);

      const result = await this.sendWebhookRequest(webhookUrl, args);

      return {
        success: true,
        webhookUrl: this.maskWebhookUrl(webhookUrl),
        data: args.data,
        response: result.response,
        status: result.status,
        timestamp: new Date().toISOString(),
        source: "Zapier"
      };

    } catch (error: unknown) {
      console.error("❌ Zapier webhook failed:", error);
      return {
        success: false,
        error: `Zapier webhook failed: ${error instanceof Error ? error.message : String(error)}`,
        webhookUrl: args.webhookUrl ? this.maskWebhookUrl(args.webhookUrl) : this.maskWebhookUrl(this.webhookUrl || ''),
        data: args.data,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async sendWebhookRequest(webhookUrl: string, args: any): Promise<any> {
    const method = args.method || 'POST';
    const timeout = args.timeout || 30000;
    const retries = args.retries || 3;
    const validateResponse = args.validateResponse !== false;

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': this.userAgent,
      ...args.headers
    };

    // Add API key if available (for Zapier Platform API)
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const requestConfig = {
      method,
      headers,
      body: JSON.stringify(args.data)
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${retries} - Sending webhook request...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(webhookUrl, {
          ...requestConfig,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const responseText = await response.text();
        let responseData: any;

        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = responseText;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${responseText}`);
        }

        if (validateResponse && !this.isValidZapierResponse(response, responseData)) {
          console.warn("⚠️ Webhook response may indicate an issue:", {
            status: response.status,
            response: responseData
          });
        }

        console.log(`✅ Webhook triggered successfully on attempt ${attempt}`);

        return {
          status: response.status,
          response: responseData,
          headers: Object.fromEntries(response.headers.entries()),
          attempt: attempt
        };

      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`⚠️ Attempt ${attempt} failed:`, lastError.message);

        if (attempt < retries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error("All webhook attempts failed");
  }

  private isValidZapierWebhookUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.hostname === 'hooks.zapier.com' && 
             parsed.pathname.includes('/hooks/catch/') &&
             parsed.pathname.split('/').length >= 5;
    } catch {
      return false;
    }
  }

  private isValidZapierResponse(response: Response, data: any): boolean {
    // Zapier typically returns 200 OK with specific response patterns
    if (response.status !== 200) {
      return false;
    }

    // Check for common Zapier error indicators in response
    if (typeof data === 'object' && data !== null) {
      if (data.error || data.errors || data.status === 'error') {
        return false;
      }
    }

    // Check for Zapier success indicators
    if (typeof data === 'object' && data !== null) {
      return data.status === 'success' || 
             data.message === 'success' || 
             data.id !== undefined ||
             Object.keys(data).length > 0;
    }

    // For text responses, check for success patterns
    if (typeof data === 'string') {
      const lowerData = data.toLowerCase();
      return lowerData.includes('success') || 
             lowerData.includes('received') || 
             lowerData.includes('ok') ||
             data.trim().length > 0;
    }

    return true; // Default to valid if we can't determine
  }

  private maskWebhookUrl(url: string): string {
    if (!url) return '';
    
    try {
      const parsed = new URL(url);
      const pathParts = parsed.pathname.split('/');
      
      if (pathParts.length >= 6) {
        // Mask the hook ID (last part) for privacy
        pathParts[pathParts.length - 1] = '***' + pathParts[pathParts.length - 1].slice(-3);
      }
      
      return `${parsed.origin}${pathParts.join('/')}`;
    } catch {
      return url.substring(0, 50) + '***';
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility methods for common Zapier integrations

  /**
   * Create a payload for Gmail integration
   */
  static createEmailPayload(to: string, subject: string, body: string, from?: string, cc?: string[], bcc?: string[]): any {
    return {
      to,
      subject,
      body,
      from,
      cc: cc ? cc.join(',') : undefined,
      bcc: bcc ? bcc.join(',') : undefined,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a payload for Slack integration
   */
  static createSlackPayload(channel: string, text: string, username?: string, iconEmoji?: string): any {
    return {
      channel,
      text,
      username,
      icon_emoji: iconEmoji,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a payload for Google Sheets integration
   */
  static createSheetsPayload(data: Record<string, any>, sheetName?: string): any {
    return {
      sheet_name: sheetName,
      ...data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a payload for Trello integration
   */
  static createTrelloPayload(name: string, desc?: string, listName?: string, boardName?: string, dueDate?: string): any {
    return {
      name,
      desc,
      list_name: listName,
      board_name: boardName,
      due_date: dueDate,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a payload for Airtable integration
   */
  static createAirtablePayload(fields: Record<string, any>, tableName?: string, baseName?: string): any {
    return {
      table_name: tableName,
      base_name: baseName,
      fields,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a payload for webhook testing
   */
  static createTestPayload(): any {
    return {
      test: true,
      message: "Test webhook from ZapierTool",
      timestamp: new Date().toISOString(),
      random_id: Math.random().toString(36).substring(7)
    };
  }

  // Webhook URL validation and parsing utilities

  /**
   * Extract user ID and hook ID from Zapier webhook URL
   */
  static parseWebhookUrl(webhookUrl: string): { userId: string; hookId: string } | null {
    try {
      const url = new URL(webhookUrl);
      const pathParts = url.pathname.split('/').filter(part => part.length > 0);
      
      if (pathParts.length >= 4 && pathParts[0] === 'hooks' && pathParts[1] === 'catch') {
        return {
          userId: pathParts[2],
          hookId: pathParts[3]
        };
      }
    } catch {
      // Invalid URL
    }
    
    return null;
  }

  /**
   * Generate a webhook URL from components (for testing purposes)
   */
  static generateWebhookUrl(userId: string, hookId: string, additionalPath?: string): string {
    const base = `https://hooks.zapier.com/hooks/catch/${userId}/${hookId}`;
    return additionalPath ? `${base}/${additionalPath}` : base;
  }
}