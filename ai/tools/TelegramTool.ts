import { FunctionDeclaration, Type } from "@google/genai";

export class TelegramTool {
  private baseUrl: string = "https://api.telegram.org/bot";
  private userAgent: string = "TelegramTool/1.0";
  private botToken: string | null = null;
  private defaultChatId: string | null = null;

  constructor(botToken?: string, defaultChatId?: string) {
    this.botToken = botToken || null;
    this.defaultChatId = defaultChatId || null;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "telegram_bot",
      description: "Complete Telegram Bot API integration for automated messaging, content delivery, and interactive bot development. Send text messages, photos, videos, documents, stickers, animations, polls, locations, contacts, and voice messages. Create interactive experiences with inline keyboards, custom reply keyboards, web apps, and callback queries. Supports all major Telegram features including message editing, forwarding, deletion, content protection, threaded conversations, and webhook automation. Perfect for customer service bots, notification systems, content delivery, interactive surveys, location-based services, and automated customer engagement. Works seamlessly with private chats, groups, channels, and forum-style discussions.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          botToken: {
            type: Type.STRING,
            description: "Bot token from @BotFather (format: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11). Required if not set in constructor."
          },
          method: {
            type: Type.STRING,
            description: "Telegram Bot API method to call",
            enum: [
              "sendMessage",
              "sendPhoto", 
              "sendDocument",
              "sendVideo",
              "sendAudio",
              "sendVoice",
              "sendVideoNote",
              "sendLocation",
              "sendVenue",
              "sendContact",
              "sendPoll",
              "sendSticker",
              "sendAnimation",
              "sendMediaGroup",
              "editMessageText",
              "editMessageCaption",
              "deleteMessage",
              "forwardMessage",
              "copyMessage",
              "getMe",
              "getUpdates",
              "getChat",
              "getChatMember",
              "getChatAdministrators",
              "getChatMemberCount",
              "setMyCommands",
              "getMyCommands",
              "answerInlineQuery",
              "answerCallbackQuery",
              "setWebhook",
              "deleteWebhook",
              "getWebhookInfo"
            ]
          },
          chatId: {
            type: Type.STRING,
            description: "Target chat ID, username (@username), or channel username (@channelname). Can be a number (user/group ID) or string (username). Required for most methods unless set in constructor."
          },
          text: {
            type: Type.STRING,
            description: "Text message to send (for sendMessage, editMessageText). Supports Telegram formatting."
          },
          parseMode: {
            type: Type.STRING,
            description: "Message formatting mode",
            enum: ["HTML", "Markdown", "MarkdownV2"]
          },
          photo: {
            type: Type.STRING,
            description: "Photo to send. Can be a file_id, HTTP URL, or file path for sendPhoto"
          },
          document: {
            type: Type.STRING,
            description: "Document to send. Can be a file_id, HTTP URL, or file path for sendDocument"
          },
          video: {
            type: Type.STRING,
            description: "Video to send. Can be a file_id, HTTP URL, or file path for sendVideo"
          },
          audio: {
            type: Type.STRING,
            description: "Audio file to send. Can be a file_id, HTTP URL, or file path for sendAudio"
          },
          voice: {
            type: Type.STRING,
            description: "Voice message to send. Can be a file_id, HTTP URL, or file path for sendVoice"
          },
          sticker: {
            type: Type.STRING,
            description: "Sticker to send. Can be a file_id, HTTP URL, or file path for sendSticker"
          },
          animation: {
            type: Type.STRING,
            description: "Animation (GIF/MP4) to send. Can be a file_id, HTTP URL, or file path for sendAnimation"
          },
          caption: {
            type: Type.STRING,
            description: "Caption for media files (photos, videos, documents, etc.)"
          },
          replyMarkup: {
            type: Type.OBJECT,
            description: "Inline keyboard, custom reply keyboard, or other reply markup",
            properties: {
              inline_keyboard: {
                type: Type.ARRAY,
                description: "Array of button rows for inline keyboard",
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING, description: "Button text" },
                      url: { type: Type.STRING, description: "HTTP URL to open" },
                      callback_data: { type: Type.STRING, description: "Data to send in callback query" },
                      web_app: { type: Type.OBJECT, description: "Web App to launch" },
                      switch_inline_query: { type: Type.STRING, description: "Inline query to insert" }
                    }
                  }
                }
              },
              keyboard: {
                type: Type.ARRAY,
                description: "Custom keyboard layout",
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING, description: "Button text" },
                      request_contact: { type: Type.BOOLEAN, description: "Request contact" },
                      request_location: { type: Type.BOOLEAN, description: "Request location" }
                    }
                  }
                }
              },
              remove_keyboard: { type: Type.BOOLEAN, description: "Remove custom keyboard" },
              force_reply: { type: Type.BOOLEAN, description: "Force reply from user" }
            }
          },
          replyParameters: {
            type: Type.OBJECT,
            description: "Reply to a specific message (Bot API 7.0+)",
            properties: {
              message_id: { type: Type.NUMBER, description: "ID of the message to reply to" },
              chat_id: { type: Type.STRING, description: "Chat ID if replying to message in different chat" },
              allow_sending_without_reply: { type: Type.BOOLEAN, description: "Pass true if message should be sent even if reply target doesn't exist" },
              quote: { type: Type.STRING, description: "Quoted part of the message to reply to" },
              quote_parse_mode: { type: Type.STRING, description: "Parse mode for quote" },
              quote_entities: { 
                type: Type.ARRAY, 
                description: "Message entities in quote",
                items: { type: Type.OBJECT } 
              },
              quote_position: { type: Type.NUMBER, description: "Position of quote in original message" }
            }
          },
          latitude: {
            type: Type.NUMBER,
            description: "Latitude for location sharing"
          },
          longitude: {
            type: Type.NUMBER,
            description: "Longitude for location sharing"
          },
          phoneNumber: {
            type: Type.STRING,
            description: "Contact phone number"
          },
          firstName: {
            type: Type.STRING,
            description: "Contact first name"
          },
          lastName: {
            type: Type.STRING,
            description: "Contact last name"
          },
          question: {
            type: Type.STRING,
            description: "Poll question"
          },
          options: {
            type: Type.ARRAY,
            description: "Poll options",
            items: {
              type: Type.STRING
            }
          },
          pollType: {
            type: Type.STRING,
            description: "Poll type",
            enum: ["regular", "quiz"]
          },
          messageId: {
            type: Type.NUMBER,
            description: "Message ID for editing, deleting, or replying"
          },
          fromChatId: {
            type: Type.STRING,
            description: "Source chat ID for forwarding messages"
          },
          disableWebPagePreview: {
            type: Type.BOOLEAN,
            description: "Disable web page preview for links"
          },
          disableNotification: {
            type: Type.BOOLEAN,
            description: "Send message silently"
          },
          protectContent: {
            type: Type.BOOLEAN,
            description: "Protect content from forwarding and saving"
          },
          messageThreadId: {
            type: Type.NUMBER,
            description: "Message thread ID for forum groups"
          },
          hasProtectedContent: {
            type: Type.BOOLEAN,
            description: "Pass true if content is protected"
          },
          allowSendingWithoutReply: {
            type: Type.BOOLEAN,
            description: "Pass true if message should be sent even if reply target doesn't exist"
          },
          timeout: {
            type: Type.NUMBER,
            description: "Request timeout in milliseconds (default: 30000)"
          },
          retries: {
            type: Type.NUMBER,
            description: "Number of retry attempts on failure (default: 3)"
          }
        },
        required: ["method"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const botToken = args.botToken || this.botToken;
      
      if (!botToken) {
        throw new Error("Bot token is required. Get one from @BotFather on Telegram.");
      }

      if (!this.isValidBotToken(botToken)) {
        throw new Error("Invalid bot token format. Expected format: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11");
      }

      const chatId = args.chatId || this.defaultChatId;
      const method = args.method;

      // Validate required parameters for different methods
      this.validateMethodParameters(method, args, chatId);

      console.log(`🤖 Calling Telegram Bot API method: ${method}`);

      const result = await this.sendApiRequest(botToken, method, args);

      return {
        success: true,
        method: method,
        chatId: chatId,
        response: result.response,
        timestamp: new Date().toISOString(),
        source: "Telegram Bot API"
      };

    } catch (error: unknown) {
      console.error("❌ Telegram Bot API call failed:", error);
      return {
        success: false,
        error: `Telegram Bot API failed: ${error instanceof Error ? error.message : String(error)}`,
        method: args.method,
        chatId: args.chatId || this.defaultChatId,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async sendApiRequest(botToken: string, method: string, args: any): Promise<any> {
    const timeout = args.timeout || 30000;
    const retries = args.retries || 3;
    const url = `${this.baseUrl}${botToken}/${method}`;

    // Prepare request body
    const requestBody = this.prepareRequestBody(method, args);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${retries} - Sending API request to ${method}...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': this.userAgent
        };

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${responseData.description || response.statusText}`);
        }

        if (!responseData.ok) {
          throw new Error(`Telegram API Error ${responseData.error_code}: ${responseData.description}`);
        }

        console.log(`✅ Telegram API call successful on attempt ${attempt}`);

        return {
          response: responseData.result,
          status: response.status,
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

    throw lastError || new Error("All API attempts failed");
  }

  private prepareRequestBody(method: string, args: any): any {
    const chatId = args.chatId || this.defaultChatId;
    const body: any = {};

    // Add chat_id for methods that require it
    if (this.methodRequiresChatId(method) && chatId) {
      body.chat_id = chatId;
    }

    // Method-specific parameter mapping
    switch (method) {
      case 'sendMessage':
        body.text = args.text;
        body.parse_mode = args.parseMode;
        body.disable_web_page_preview = args.disableWebPagePreview;
        body.disable_notification = args.disableNotification;
        body.protect_content = args.protectContent;
        body.message_thread_id = args.messageThreadId;
        body.reply_markup = args.replyMarkup;
        body.reply_parameters = args.replyParameters;
        break;

      case 'sendPhoto':
        body.photo = args.photo;
        body.caption = args.caption;
        body.parse_mode = args.parseMode;
        body.disable_notification = args.disableNotification;
        body.protect_content = args.protectContent;
        body.reply_markup = args.replyMarkup;
        body.reply_parameters = args.replyParameters;
        break;

      case 'sendDocument':
        body.document = args.document;
        body.caption = args.caption;
        body.parse_mode = args.parseMode;
        body.disable_notification = args.disableNotification;
        body.protect_content = args.protectContent;
        body.reply_markup = args.replyMarkup;
        body.reply_parameters = args.replyParameters;
        break;

      case 'sendVideo':
        body.video = args.video;
        body.duration = args.duration;
        body.width = args.width;
        body.height = args.height;
        body.caption = args.caption;
        body.parse_mode = args.parseMode;
        body.supports_streaming = args.supportsStreaming;
        body.disable_notification = args.disableNotification;
        body.protect_content = args.protectContent;
        body.reply_markup = args.replyMarkup;
        body.reply_parameters = args.replyParameters;
        break;

      case 'sendAudio':
        body.audio = args.audio;
        body.caption = args.caption;
        body.parse_mode = args.parseMode;
        body.duration = args.duration;
        body.performer = args.performer;
        body.title = args.title;
        body.disable_notification = args.disableNotification;
        body.protect_content = args.protectContent;
        body.reply_markup = args.replyMarkup;
        body.reply_parameters = args.replyParameters;
        break;

      case 'sendLocation':
        body.latitude = args.latitude;
        body.longitude = args.longitude;
        body.horizontal_accuracy = args.horizontalAccuracy;
        body.live_period = args.livePeriod;
        body.heading = args.heading;
        body.proximity_alert_radius = args.proximityAlertRadius;
        body.disable_notification = args.disableNotification;
        body.protect_content = args.protectContent;
        body.reply_markup = args.replyMarkup;
        body.reply_parameters = args.replyParameters;
        break;

      case 'sendContact':
        body.phone_number = args.phoneNumber;
        body.first_name = args.firstName;
        body.last_name = args.lastName;
        body.vcard = args.vcard;
        body.disable_notification = args.disableNotification;
        body.protect_content = args.protectContent;
        body.reply_markup = args.replyMarkup;
        body.reply_parameters = args.replyParameters;
        break;

      case 'sendPoll':
        body.question = args.question;
        body.options = args.options;
        body.is_anonymous = args.isAnonymous;
        body.type = args.pollType || 'regular';
        body.allows_multiple_answers = args.allowsMultipleAnswers;
        body.correct_option_id = args.correctOptionId;
        body.explanation = args.explanation;
        body.explanation_parse_mode = args.explanationParseMode;
        body.open_period = args.openPeriod;
        body.close_date = args.closeDate;
        body.is_closed = args.isClosed;
        body.disable_notification = args.disableNotification;
        body.protect_content = args.protectContent;
        body.reply_markup = args.replyMarkup;
        body.reply_parameters = args.replyParameters;
        break;

      case 'editMessageText':
        body.text = args.text;
        body.parse_mode = args.parseMode;
        body.disable_web_page_preview = args.disableWebPagePreview;
        body.reply_markup = args.replyMarkup;
        if (args.messageId) {
          body.message_id = args.messageId;
        }
        if (args.inlineMessageId) {
          body.inline_message_id = args.inlineMessageId;
        }
        break;

      case 'deleteMessage':
        body.message_id = args.messageId;
        break;

      case 'forwardMessage':
        body.from_chat_id = args.fromChatId;
        body.message_id = args.messageId;
        body.disable_notification = args.disableNotification;
        body.protect_content = args.protectContent;
        break;

      case 'getUpdates':
        body.offset = args.offset;
        body.limit = args.limit;
        body.timeout = args.getUpdatesTimeout;
        body.allowed_updates = args.allowedUpdates;
        break;

      case 'setWebhook':
        body.url = args.url;
        body.certificate = args.certificate;
        body.ip_address = args.ipAddress;
        body.max_connections = args.maxConnections;
        body.allowed_updates = args.allowedUpdates;
        body.drop_pending_updates = args.dropPendingUpdates;
        body.secret_token = args.secretToken;
        break;

      // Add more method-specific mappings as needed
    }

    // Remove undefined values
    Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);

    return body;
  }

  private methodRequiresChatId(method: string): boolean {
    const methodsWithoutChatId = [
      'getMe', 'getUpdates', 'setWebhook', 'deleteWebhook', 
      'getWebhookInfo', 'setMyCommands', 'getMyCommands',
      'answerInlineQuery'
    ];
    return !methodsWithoutChatId.includes(method);
  }

  private validateMethodParameters(method: string, args: any, chatId: string | null): void {
    // Check if method requires chat_id
    if (this.methodRequiresChatId(method) && !chatId) {
      throw new Error(`Method ${method} requires chatId parameter`);
    }

    // Method-specific validation
    switch (method) {
      case 'sendMessage':
        if (!args.text) throw new Error("sendMessage requires 'text' parameter");
        break;
      case 'sendPhoto':
        if (!args.photo) throw new Error("sendPhoto requires 'photo' parameter");
        break;
      case 'sendDocument':
        if (!args.document) throw new Error("sendDocument requires 'document' parameter");
        break;
      case 'sendVideo':
        if (!args.video) throw new Error("sendVideo requires 'video' parameter");
        break;
      case 'sendAudio':
        if (!args.audio) throw new Error("sendAudio requires 'audio' parameter");
        break;
      case 'sendLocation':
        if (args.latitude === undefined || args.longitude === undefined) {
          throw new Error("sendLocation requires 'latitude' and 'longitude' parameters");
        }
        break;
      case 'sendContact':
        if (!args.phoneNumber || !args.firstName) {
          throw new Error("sendContact requires 'phoneNumber' and 'firstName' parameters");
        }
        break;
      case 'sendPoll':
        if (!args.question || !args.options || !Array.isArray(args.options)) {
          throw new Error("sendPoll requires 'question' and 'options' (array) parameters");
        }
        break;
      case 'editMessageText':
        if (!args.text) throw new Error("editMessageText requires 'text' parameter");
        if (!args.messageId && !args.inlineMessageId) {
          throw new Error("editMessageText requires either 'messageId' or 'inlineMessageId' parameter");
        }
        break;
      case 'deleteMessage':
        if (!args.messageId) throw new Error("deleteMessage requires 'messageId' parameter");
        break;
      case 'forwardMessage':
        if (!args.fromChatId || !args.messageId) {
          throw new Error("forwardMessage requires 'fromChatId' and 'messageId' parameters");
        }
        break;
    }
  }

  private isValidBotToken(token: string): boolean {
    // Telegram bot token format: {bot_id}:{api_hash}
    const tokenPattern = /^\d+:[A-Za-z0-9_-]+$/;
    return tokenPattern.test(token);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility methods for common Telegram operations

  /**
   * Create a simple text message payload
   */
  static createTextMessage(text: string, parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'): any {
    return {
      method: 'sendMessage',
      text,
      parseMode
    };
  }

  /**
   * Create an inline keyboard
   */
  static createInlineKeyboard(buttons: Array<Array<{text: string, url?: string, callback_data?: string}>>): any {
    return {
      inline_keyboard: buttons
    };
  }

  /**
   * Create a custom keyboard
   */
  static createReplyKeyboard(buttons: Array<Array<{text: string, request_contact?: boolean, request_location?: boolean}>>, oneTime?: boolean): any {
    return {
      keyboard: buttons,
      one_time_keyboard: oneTime,
      resize_keyboard: true
    };
  }

  /**
   * Create a photo message payload
   */
  static createPhotoMessage(photo: string, caption?: string, parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'): any {
    return {
      method: 'sendPhoto',
      photo,
      caption,
      parseMode
    };
  }

  /**
   * Create a document message payload
   */
  static createDocumentMessage(document: string, caption?: string, parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'): any {
    return {
      method: 'sendDocument',
      document,
      caption,
      parseMode
    };
  }

  /**
   * Create a location message payload
   */
  static createLocationMessage(latitude: number, longitude: number, livePeriod?: number): any {
    return {
      method: 'sendLocation',
      latitude,
      longitude,
      livePeriod
    };
  }

  /**
   * Create a poll message payload
   */
  static createPollMessage(question: string, options: string[], isAnonymous: boolean = true, type: 'regular' | 'quiz' = 'regular'): any {
    return {
      method: 'sendPoll',
      question,
      options,
      isAnonymous,
      pollType: type
    };
  }

  /**
   * Create a contact message payload
   */
  static createContactMessage(phoneNumber: string, firstName: string, lastName?: string): any {
    return {
      method: 'sendContact',
      phoneNumber,
      firstName,
      lastName
    };
  }

  /**
   * Parse Telegram bot token to extract bot ID
   */
  static parseBotToken(token: string): { botId: string; apiHash: string } | null {
    const match = token.match(/^(\d+):([A-Za-z0-9_-]+)$/);
    if (match) {
      return {
        botId: match[1],
        apiHash: match[2]
      };
    }
    return null;
  }

  /**
   * Format text with HTML formatting
   */
  static formatHTML(text: string, options?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    pre?: boolean;
    url?: string;
  }): string {
    let formatted = text;
    
    if (options?.bold) formatted = `<b>${formatted}</b>`;
    if (options?.italic) formatted = `<i>${formatted}</i>`;
    if (options?.underline) formatted = `<u>${formatted}</u>`;
    if (options?.strikethrough) formatted = `<s>${formatted}</s>`;
    if (options?.code) formatted = `<code>${formatted}</code>`;
    if (options?.pre) formatted = `<pre>${formatted}</pre>`;
    if (options?.url) formatted = `<a href="${options.url}">${formatted}</a>`;
    
    return formatted;
  }

  /**
   * Format text with Markdown formatting
   */
  static formatMarkdown(text: string, options?: {
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
    pre?: boolean;
    url?: string;
  }): string {
    let formatted = text;
    
    if (options?.bold) formatted = `*${formatted}*`;
    if (options?.italic) formatted = `_${formatted}_`;
    if (options?.code) formatted = `\`${formatted}\``;
    if (options?.pre) formatted = `\`\`\`${formatted}\`\`\``;
    if (options?.url) formatted = `[${formatted}](${options.url})`;
    
    return formatted;
  }

  /**
   * Escape special characters for HTML parsing
   */
  static escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Escape special characters for Markdown parsing
   */
  static escapeMarkdown(text: string): string {
    return text
      .replace(/([_*\[\]()~`>#+=|{}.!-])/g, '\\$1');
  }
}
