import { FunctionDeclaration, Type } from "@google/genai";
import { getValidOAuthAccessToken } from "@/lib/oauth-refresh";

export interface DiscordConfig {
  token: string;
}

export class DiscordTool {
  private baseUrl: string = "https://discord.com/api/v10";
  private userAgent: string = "DiscordTool/1.0";
  private botToken: string | null = null;
  private defaultGuildId: string | null = null;
  private userId: string;
  private oauthToken: string | null;

  constructor(config: DiscordConfig, userId: string, oauthToken: string | null = null) {
    this.botToken = config.token;
    this.userId = userId;
    this.oauthToken = oauthToken;
    this.defaultGuildId = null;
  }

  /**
   * Get all channels in the default guild
   */
  async getGuildChannels(): Promise<any[]> {
    if (!this.defaultGuildId || !this.botToken) {
      throw new Error("Bot not initialized or no default guild available.");
    }

    const response = await this.sendApiRequest(
      this.botToken,
      "GET /guilds/{guild.id}/channels",
      `${this.baseUrl}/guilds/${this.defaultGuildId}/channels`,
      {}
    );

    return response.response || [];
  }

  /**
   * Find a channel by name in the default guild
   */
  async findChannelByName(channelName: string): Promise<any | null> {
    const channels = await this.getGuildChannels();
    return channels.find((ch: any) => 
      ch.name.toLowerCase() === channelName.toLowerCase()
    ) || null;
  }

  /**
   * Get all roles in the default guild  
   */
  async getGuildRoles(): Promise<any[]> {
    if (!this.defaultGuildId || !this.botToken) {
      throw new Error("Bot not initialized or no default guild available.");
    }

    const response = await this.sendApiRequest(
      this.botToken,
      "GET /guilds/{guild.id}/roles",
      `${this.baseUrl}/guilds/${this.defaultGuildId}/roles`,
      {}
    );

    return response.response || [];
  }

  /**
   * Send a message to a channel by name
   */
  async sendMessageToChannel(channelName: string, content: string, embeds?: any[], components?: any[]): Promise<any> {
    const channel = await this.findChannelByName(channelName);
    
    if (!channel) {
      throw new Error(`Channel '${channelName}' not found in the default guild.`);
    }

    return await this.sendApiRequest(
      this.botToken!,
      "POST /channels/{channel.id}/messages",
      `${this.baseUrl}/channels/${channel.id}/messages`,
      { content, embeds, components }
    );
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "discord_bot",
      description: "Interact with Discord servers using Discord Bot API. Send messages, create slash commands, manage channels, roles, and members. Supports embeds, buttons, select menus, threads, voice channels, and more across guilds and DMs. Supports both bot tokens and OAuth 2.0 authentication with official scopes: identify, email, connections, guilds, guilds.join, applications.commands, applications.commands.permissions.update, webhook.incoming.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          botToken: {
            type: Type.STRING,
            description: "Bot token from Discord Developer Portal (format: MTAx...). Required if not set in constructor. For OAuth 2.0, use access token from OAuth flow."
          },
          endpoint: {
            type: Type.STRING,
            description: "Discord API endpoint to call",
            enum: [
              // Channel endpoints
              "POST /channels/{channel.id}/messages",
              "GET /channels/{channel.id}/messages",
              "GET /channels/{channel.id}/messages/{message.id}",
              "PATCH /channels/{channel.id}/messages/{message.id}",
              "DELETE /channels/{channel.id}/messages/{message.id}",
              "POST /channels/{channel.id}/messages/bulk-delete",
              "PUT /channels/{channel.id}/permissions/{overwrite.id}",
              "DELETE /channels/{channel.id}/permissions/{overwrite.id}",
              "POST /channels/{channel.id}/invites",
              "GET /channels/{channel.id}/invites",
              "POST /channels/{channel.id}/typing",
              "GET /channels/{channel.id}/pins",
              "PUT /channels/{channel.id}/pins/{message.id}",
              "DELETE /channels/{channel.id}/pins/{message.id}",
              "POST /channels/{channel.id}/threads",
              "POST /channels/{channel.id}/messages/{message.id}/threads",
              "PUT /channels/{channel.id}/thread-members/@me",
              "DELETE /channels/{channel.id}/thread-members/@me",
              "GET /channels/{channel.id}/thread-members",
              "PATCH /channels/{channel.id}/thread-members/@me",
              "GET /channels/{channel.id}/thread-members/{user.id}",
              "DELETE /channels/{channel.id}/thread-members/{user.id}",
              
              // Guild endpoints
              "GET /guilds/{guild.id}",
              "PATCH /guilds/{guild.id}",
              "DELETE /guilds/{guild.id}",
              "GET /guilds/{guild.id}/channels",
              "POST /guilds/{guild.id}/channels",
              "PATCH /guilds/{guild.id}/channels",
              "GET /guilds/{guild.id}/members",
              "GET /guilds/{guild.id}/members/{user.id}",
              "PUT /guilds/{guild.id}/members/{user.id}",
              "PATCH /guilds/{guild.id}/members/{user.id}",
              "DELETE /guilds/{guild.id}/members/{user.id}",
              "GET /guilds/{guild.id}/bans",
              "GET /guilds/{guild.id}/bans/{user.id}",
              "PUT /guilds/{guild.id}/bans/{user.id}",
              "DELETE /guilds/{guild.id}/bans/{user.id}",
              "GET /guilds/{guild.id}/roles",
              "POST /guilds/{guild.id}/roles",
              "PATCH /guilds/{guild.id}/roles/{role.id}",
              "DELETE /guilds/{guild.id}/roles/{role.id}",
              "PUT /guilds/{guild.id}/members/{user.id}/roles/{role.id}",
              "DELETE /guilds/{guild.id}/members/{user.id}/roles/{role.id}",
              "POST /guilds/{guild.id}/prune",
              "GET /guilds/{guild.id}/prune",
              "GET /guilds/{guild.id}/regions",
              "GET /guilds/{guild.id}/invites",
              "GET /guilds/{guild.id}/integrations",
              "GET /guilds/{guild.id}/widget",
              "PATCH /guilds/{guild.id}/widget",
              "GET /guilds/{guild.id}/vanity-url",
              "GET /guilds/{guild.id}/widget.json",
              "GET /guilds/{guild.id}/welcome-screen",
              "PATCH /guilds/{guild.id}/welcome-screen",
              "GET /guilds/{guild.id}/voice-states",
              "GET /guilds/{guild.id}/scheduled-events",
              "POST /guilds/{guild.id}/scheduled-events",
              "GET /guilds/{guild.id}/scheduled-events/{guild_scheduled_event.id}",
              "PATCH /guilds/{guild.id}/scheduled-events/{guild_scheduled_event.id}",
              "DELETE /guilds/{guild.id}/scheduled-events/{guild_scheduled_event.id}",
              "GET /guilds/{guild.id}/scheduled-events/{guild_scheduled_event.id}/users",
              "GET /guilds/{guild.id}/templates",
              "POST /guilds/{guild.id}/templates",
              "PUT /guilds/{guild.id}/templates/{template.code}",
              "POST /guilds/templates/{template.code}",
              "GET /guilds/{guild.id}/stickers",
              "POST /guilds/{guild.id}/stickers",
              "GET /guilds/{guild.id}/stickers/{sticker.id}",
              "PATCH /guilds/{guild.id}/stickers/{sticker.id}",
              "DELETE /guilds/{guild.id}/stickers/{sticker.id}",
              
              // Application commands
              "GET /applications/{application.id}/commands",
              "POST /applications/{application.id}/commands",
              "GET /applications/{application.id}/commands/{command.id}",
              "PATCH /applications/{application.id}/commands/{command.id}",
              "DELETE /applications/{application.id}/commands/{command.id}",
              "PUT /applications/{application.id}/commands",
              "GET /applications/{application.id}/guilds/{guild.id}/commands",
              "POST /applications/{application.id}/guilds/{guild.id}/commands",
              "GET /applications/{application.id}/guilds/{guild.id}/commands/{command.id}",
              "PATCH /applications/{application.id}/guilds/{guild.id}/commands/{command.id}",
              "DELETE /applications/{application.id}/guilds/{guild.id}/commands/{command.id}",
              "PUT /applications/{application.id}/guilds/{guild.id}/commands",
              
              // Interaction responses
              "POST /interactions/{interaction.id}/{interaction.token}/callback",
              "GET /webhooks/{application.id}/{interaction.token}/messages/@original",
              "PATCH /webhooks/{application.id}/{interaction.token}/messages/@original",
              "DELETE /webhooks/{application.id}/{interaction.token}/messages/@original",
              "POST /webhooks/{application.id}/{interaction.token}",
              "GET /webhooks/{application.id}/{interaction.token}/messages/{message.id}",
              "PATCH /webhooks/{application.id}/{interaction.token}/messages/{message.id}",
              "DELETE /webhooks/{application.id}/{interaction.token}/messages/{message.id}",
              
              // User/Application info
              "GET /users/@me",
              "GET /users/{user.id}",
              "PATCH /users/@me",
              "GET /users/@me/guilds",
              "DELETE /users/@me/guilds/{guild.id}",
              "GET /applications/@me",
              
              // Voice endpoints
              "GET /voice/regions",
              "GET /voice/connections",
              
              // Stage instance endpoints
              "POST /stage-instances",
              "GET /stage-instances/{channel.id}",
              "PATCH /stage-instances/{channel.id}",
              "DELETE /stage-instances/{channel.id}",
              
              // Sticker endpoints
              "GET /stickers/{sticker.id}",
              "GET /sticker-packs",
              "GET /sticker-packs/{sticker_pack.id}",
              "GET /guilds/{guild.id}/stickers",
              "POST /guilds/{guild.id}/stickers",
              "GET /guilds/{guild.id}/stickers/{sticker.id}",
              "PATCH /guilds/{guild.id}/stickers/{sticker.id}",
              "DELETE /guilds/{guild.id}/stickers/{sticker.id}",
              
              // Emoji endpoints
              "GET /guilds/{guild.id}/emojis",
              "POST /guilds/{guild.id}/emojis",
              "GET /guilds/{guild.id}/emojis/{emoji.id}",
              "PATCH /guilds/{guild.id}/emojis/{emoji.id}",
              "DELETE /guilds/{guild.id}/emojis/{emoji.id}",
              
              // Webhook endpoints
              "POST /channels/{channel.id}/webhooks",
              "GET /channels/{channel.id}/webhooks",
              "GET /guilds/{guild.id}/webhooks",
              "GET /webhooks/{webhook.id}",
              "GET /webhooks/{webhook.id}/{webhook.token}",
              "PATCH /webhooks/{webhook.id}",
              "PATCH /webhooks/{webhook.id}/{webhook.token}",
              "DELETE /webhooks/{webhook.id}",
              "DELETE /webhooks/{webhook.id}/{webhook.token}",
              "POST /webhooks/{webhook.id}/{webhook.token}",
              "POST /webhooks/{webhook.id}/{webhook.token}/slack",
              "POST /webhooks/{webhook.id}/{webhook.token}/github",
              "GET /webhooks/{webhook.id}/{webhook.token}/messages/{message.id}",
              "PATCH /webhooks/{webhook.id}/{webhook.token}/messages/{message.id}",
              "DELETE /webhooks/{webhook.id}/{webhook.token}/messages/{message.id}",
              
              // Audit log endpoints
              "GET /guilds/{guild.id}/audit-logs",
              
              // Integration endpoints
              "GET /guilds/{guild.id}/integrations",
              "DELETE /guilds/{guild.id}/integrations/{integration.id}",
              "GET /guilds/{guild.id}/integrations/{integration.id}",
              "PATCH /guilds/{guild.id}/integrations/{integration.id}",
              
              // Invite endpoints
              "GET /invites/{invite.code}",
              "DELETE /invites/{invite.code}",
              "POST /invites/{invite.code}",
              
              // Template endpoints
              "GET /guilds/templates/{template.code}",
              "POST /guilds/templates/{template.code}",
              "GET /guilds/{guild.id}/templates",
              "POST /guilds/{guild.id}/templates",
              "PUT /guilds/{guild.id}/templates/{template.code}",
              "DELETE /guilds/{guild.id}/templates/{template.code}",
              "PATCH /guilds/{guild.id}/templates/{template.code}",
              "POST /guilds/templates/{template.code}",
              
              // Discovery endpoints
              "GET /discoverable-guilds",
              "GET /guilds/{guild.id}/discovery-requirements",
              "GET /guilds/{guild.id}/discovery-metadata",
              "PATCH /guilds/{guild.id}/discovery-metadata",
              
              // Activity endpoints
              "GET /activities",
              "GET /activities/{activity.id}",
              "GET /activities/{activity.id}/assets",
              "GET /applications/{application.id}/activities",
              "POST /applications/{application.id}/activities",
              "GET /applications/{application.id}/activities/{activity.id}",
              "PATCH /applications/{application.id}/activities/{activity.id}",
              "DELETE /applications/{application.id}/activities/{activity.id}",
              
              // Relationship endpoints
              "GET /users/@me/relationships",
              "PUT /users/@me/relationships/{user.id}",
              "DELETE /users/@me/relationships/{user.id}",
              
              // DM endpoints
              "POST /users/@me/channels",
              "GET /users/@me/channels",
              
              // Connection endpoints
              "GET /users/@me/connections",
              "GET /users/@me/connections/{connection.id}",
              "PATCH /users/@me/connections/{connection.id}",
              "DELETE /users/@me/connections/{connection.id}",
              
              // OAuth2 endpoints
              "GET /oauth2/applications/@me",
              "GET /oauth2/authorize",
              "POST /oauth2/token",
              "POST /oauth2/token/revoke",
              "GET /oauth2/@me",
              
              // CDN endpoints
              "GET /stickers/{sticker.id}",
              "GET /stickers/{sticker.id}.png",
              "GET /emojis/{emoji.id}",
              "GET /emojis/{emoji.id}.png",
              "GET /icons/{guild.id}/{guild.icon}",
              "GET /avatars/{user.id}/{user.avatar}",
              "GET /splashes/{guild.id}/{guild.splash}",
              "GET /banners/{guild.id}/{guild.banner}",
              "GET /banners/{user.id}/{user.banner}",
              
              // Gateway endpoints
              "GET /gateway",
              "GET /gateway/bot"
            ]
          },
          channelId: {
            type: Type.STRING,
            description: "Target channel ID (snowflake). Required for channel operations."
          },
          guildId: {
            type: Type.STRING,
            description: "Target guild/server ID (snowflake). Required for guild operations."
          },
          messageId: {
            type: Type.STRING,
            description: "Target message ID (snowflake). Required for message-specific operations."
          },
          userId: {
            type: Type.STRING,
            description: "Target user ID (snowflake). Required for user-specific operations."
          },
          roleId: {
            type: Type.STRING,
            description: "Target role ID (snowflake). Required for role-specific operations."
          },
          interactionId: {
            type: Type.STRING,
            description: "Interaction ID for slash command responses."
          },
          interactionToken: {
            type: Type.STRING,
            description: "Interaction token for slash command responses."
          },
          applicationId: {
            type: Type.STRING,
            description: "Application ID for slash commands and interactions."
          },
          content: {
            type: Type.STRING,
            description: "Message content (up to 2000 characters)."
          },
          embeds: {
            type: Type.ARRAY,
            description: "Array of embed objects (up to 10 embeds per message)",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Embed title" },
                description: { type: Type.STRING, description: "Embed description" },
                url: { type: Type.STRING, description: "Embed URL" },
                timestamp: { type: Type.STRING, description: "ISO8601 timestamp" },
                color: { type: Type.NUMBER, description: "Embed color (decimal)" },
                footer: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING, description: "Footer text" },
                    icon_url: { type: Type.STRING, description: "Footer icon URL" }
                  }
                },
                image: {
                  type: Type.OBJECT,
                  properties: {
                    url: { type: Type.STRING, description: "Image URL" }
                  }
                },
                thumbnail: {
                  type: Type.OBJECT,
                  properties: {
                    url: { type: Type.STRING, description: "Thumbnail URL" }
                  }
                },
                author: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Author name" },
                    url: { type: Type.STRING, description: "Author URL" },
                    icon_url: { type: Type.STRING, description: "Author icon URL" }
                  }
                },
                fields: {
                  type: Type.ARRAY,
                  description: "Array of embed fields",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "Field name" },
                      value: { type: Type.STRING, description: "Field value" },
                      inline: { type: Type.BOOLEAN, description: "Whether field is inline" }
                    }
                  }
                }
              }
            }
          },
          components: {
            type: Type.ARRAY,
            description: "Array of action row components (buttons, select menus)",
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.NUMBER, description: "Component type (1 for action row)" },
                components: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.NUMBER, description: "Component type (2=button, 3=select)" },
                      style: { type: Type.NUMBER, description: "Button style (1-5)" },
                      label: { type: Type.STRING, description: "Button label" },
                      emoji: { type: Type.OBJECT, description: "Button emoji" },
                      custom_id: { type: Type.STRING, description: "Custom ID for interactions" },
                      url: { type: Type.STRING, description: "URL for link buttons" },
                      disabled: { type: Type.BOOLEAN, description: "Whether component is disabled" },
                      options: {
                        type: Type.ARRAY,
                        description: "Select menu options",
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            label: { type: Type.STRING, description: "Option label" },
                            value: { type: Type.STRING, description: "Option value" },
                            description: { type: Type.STRING, description: "Option description" },
                            emoji: { type: Type.OBJECT, description: "Option emoji" },
                            default: { type: Type.BOOLEAN, description: "Default selected" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          attachments: {
            type: Type.ARRAY,
            description: "Array of file attachments",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Attachment ID" },
                filename: { type: Type.STRING, description: "File name" },
                description: { type: Type.STRING, description: "File description" },
                content_type: { type: Type.STRING, description: "MIME type" },
                size: { type: Type.NUMBER, description: "File size in bytes" },
                url: { type: Type.STRING, description: "File URL" },
                proxy_url: { type: Type.STRING, description: "Proxy URL" }
              }
            }
          },
          flags: {
            type: Type.NUMBER,
            description: "Message flags (64=ephemeral for slash command responses)"
          },
          tts: {
            type: Type.BOOLEAN,
            description: "Whether message is text-to-speech"
          },
          allowedMentions: {
            type: Type.OBJECT,
            description: "Allowed mentions configuration",
            properties: {
              parse: {
                type: Type.ARRAY,
                description: "Allowed mention types",
                items: { type: Type.STRING }
              },
              roles: {
                type: Type.ARRAY,
                description: "Array of role IDs to mention",
                items: { type: Type.STRING }
              },
              users: {
                type: Type.ARRAY,
                description: "Array of user IDs to mention",
                items: { type: Type.STRING }
              },
              replied_user: { type: Type.BOOLEAN, description: "Whether to mention replied user" }
            }
          },
          messageReference: {
            type: Type.OBJECT,
            description: "Message to reply to",
            properties: {
              message_id: { type: Type.STRING, description: "Message ID to reply to" },
              channel_id: { type: Type.STRING, description: "Channel ID of replied message" },
              guild_id: { type: Type.STRING, description: "Guild ID of replied message" },
              fail_if_not_exists: { type: Type.BOOLEAN, description: "Fail if message doesn't exist" }
            }
          },
          name: {
            type: Type.STRING,
            description: "Name for slash commands, channels, roles, etc."
          },
          description: {
            type: Type.STRING,
            description: "Description for slash commands, channels, etc."
          },
          options: {
            type: Type.ARRAY,
            description: "Slash command options",
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.NUMBER, description: "Option type (1-11)" },
                name: { type: Type.STRING, description: "Option name" },
                description: { type: Type.STRING, description: "Option description" },
                required: { type: Type.BOOLEAN, description: "Whether option is required" },
                choices: {
                  type: Type.ARRAY,
                  description: "Predefined choices",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "Choice name" },
                      value: { type: Type.STRING, description: "Choice value" }
                    }
                  }
                },
                channel_types: {
                  type: Type.ARRAY,
                  description: "Channel types for channel options",
                  items: { type: Type.NUMBER }
                },
                min_value: { type: Type.NUMBER, description: "Minimum value" },
                max_value: { type: Type.NUMBER, description: "Maximum value" },
                min_length: { type: Type.NUMBER, description: "Minimum length" },
                max_length: { type: Type.NUMBER, description: "Maximum length" },
                autocomplete: { type: Type.BOOLEAN, description: "Enable autocomplete" }
              }
            }
          },
          type: {
            type: Type.NUMBER,
            description: "Type for various objects (command type, channel type, etc.)"
          },
          permissions: {
            type: Type.STRING,
            description: "Permission bit string for roles, channels, etc."
          },
          color: {
            type: Type.NUMBER,
            description: "Color for roles (decimal format)"
          },
          hoist: {
            type: Type.BOOLEAN,
            description: "Whether role should be displayed separately"
          },
          mentionable: {
            type: Type.BOOLEAN,
            description: "Whether role is mentionable"
          },
          reason: {
            type: Type.STRING,
            description: "Audit log reason"
          },
          limit: {
            type: Type.NUMBER,
            description: "Number of items to retrieve (1-100)"
          },
          before: {
            type: Type.STRING,
            description: "Get messages before this message ID"
          },
          after: {
            type: Type.STRING,
            description: "Get messages after this message ID"
          },
          around: {
            type: Type.STRING,
            description: "Get messages around this message ID"
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
        required: ["endpoint"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      let accessToken: string | null = this.oauthToken;
      if (!accessToken) {
        accessToken = await getValidOAuthAccessToken(this.userId, "discord");
      }

      const token = accessToken || (args.botToken || this.botToken);
      
      if (!token) {
        throw new Error("Bot token or OAuth access token is required. Get one from Discord Developer Portal or authenticate via OAuth.");
      }

      const endpoint = args.endpoint;
      const url = this.buildApiUrl(endpoint, args);

      console.log(`🤖 Calling Discord API endpoint: ${endpoint}`);

      const result = await this.sendApiRequest(token, endpoint, url, args);

      return {
        success: true,
        endpoint: endpoint,
        response: result.response,
        status: result.status,
        timestamp: new Date().toISOString(),
        source: "Discord API"
      };

    } catch (error: unknown) {
      console.error("❌ Discord API call failed:", error);
      return {
        success: false,
        error: `Discord API failed: ${error instanceof Error ? error.message : String(error)}`,
        endpoint: args.endpoint,
        timestamp: new Date().toISOString()
      };
    }
  }

  private buildApiUrl(endpoint: string, args: any): string {
    let url = endpoint;
    
    // Replace path parameters
    if (args.channelId) {
      url = url.replace('{channel.id}', args.channelId);
    }
    if (args.guildId || this.defaultGuildId) {
      url = url.replace('{guild.id}', args.guildId || this.defaultGuildId);
    }
    if (args.messageId) {
      url = url.replace('{message.id}', args.messageId);
    }
    if (args.userId) {
      url = url.replace('{user.id}', args.userId);
    }
    if (args.roleId) {
      url = url.replace('{role.id}', args.roleId);
    }
    if (args.applicationId) {
      url = url.replace('{application.id}', args.applicationId);
    }
    if (args.interactionId) {
      url = url.replace('{interaction.id}', args.interactionId);
    }
    if (args.interactionToken) {
      url = url.replace('{interaction.token}', args.interactionToken);
    }

    // Extract method and path
    const [method, path] = url.split(' ');
    return `${this.baseUrl}${path}`;
  }

  private async sendApiRequest(botToken: string, endpoint: string, url: string, args: any): Promise<any> {
    const timeout = args.timeout || 30000;
    const retries = args.retries || 3;
    
    // Extract HTTP method
    const method = endpoint.split(' ')[0];
    
    // Prepare request body
    const requestBody = this.prepareRequestBody(endpoint, args);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${retries} - Sending API request...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const headers: Record<string, string> = {
          'Authorization': `Bot ${botToken}`,
          'User-Agent': this.userAgent
        };

        let fetchOptions: RequestInit = {
          method,
          headers,
          signal: controller.signal
        };

        // Add body for non-GET requests
        if (method !== 'GET' && requestBody && Object.keys(requestBody).length > 0) {
          headers['Content-Type'] = 'application/json';
          fetchOptions.body = JSON.stringify(requestBody);
        }

        // Add audit log reason to headers if provided
        if (args.reason) {
          headers['X-Audit-Log-Reason'] = encodeURIComponent(args.reason);
        }

        const response = await fetch(url, fetchOptions);

        clearTimeout(timeoutId);

        let responseData: any = null;
        const responseText = await response.text();
        
        if (responseText) {
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = responseText;
          }
        }

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          if (responseData?.message) {
            errorMessage += ` - ${responseData.message}`;
          }
          if (responseData?.errors) {
            errorMessage += ` - Errors: ${JSON.stringify(responseData.errors)}`;
          }
          throw new Error(errorMessage);
        }

        console.log(`✅ Discord API call successful on attempt ${attempt}`);

        return {
          response: responseData,
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

  private prepareRequestBody(endpoint: string, args: any): any {
    const body: any = {};

    // Common message properties
    if (args.content !== undefined) body.content = args.content;
    if (args.embeds !== undefined) body.embeds = args.embeds;
    if (args.components !== undefined) body.components = args.components;
    if (args.attachments !== undefined) body.attachments = args.attachments;
    if (args.flags !== undefined) body.flags = args.flags;
    if (args.tts !== undefined) body.tts = args.tts;
    if (args.allowedMentions !== undefined) body.allowed_mentions = args.allowedMentions;
    if (args.messageReference !== undefined) body.message_reference = args.messageReference;

    // Endpoint-specific properties
    if (endpoint.includes('/commands')) {
      // Slash command properties
      if (args.name !== undefined) body.name = args.name;
      if (args.description !== undefined) body.description = args.description;
      if (args.options !== undefined) body.options = args.options;
      if (args.type !== undefined) body.type = args.type;
      if (args.permissions !== undefined) body.default_member_permissions = args.permissions;
    }

    if (endpoint.includes('/channels') && endpoint.includes('POST')) {
      // Channel creation properties
      if (args.name !== undefined) body.name = args.name;
      if (args.type !== undefined) body.type = args.type;
      if (args.topic !== undefined) body.topic = args.topic;
      if (args.bitrate !== undefined) body.bitrate = args.bitrate;
      if (args.userLimit !== undefined) body.user_limit = args.userLimit;
      if (args.rateLimitPerUser !== undefined) body.rate_limit_per_user = args.rateLimitPerUser;
      if (args.position !== undefined) body.position = args.position;
      if (args.parentId !== undefined) body.parent_id = args.parentId;
      if (args.nsfw !== undefined) body.nsfw = args.nsfw;
    }

    if (endpoint.includes('/roles')) {
      // Role properties
      if (args.name !== undefined) body.name = args.name;
      if (args.permissions !== undefined) body.permissions = args.permissions;
      if (args.color !== undefined) body.color = args.color;
      if (args.hoist !== undefined) body.hoist = args.hoist;
      if (args.mentionable !== undefined) body.mentionable = args.mentionable;
    }

    if (endpoint.includes('/bans')) {
      // Ban properties
      if (args.deleteMessageDays !== undefined) body.delete_message_days = args.deleteMessageDays;
    }

    if (endpoint.includes('/members')) {
      // Member properties
      if (args.nick !== undefined) body.nick = args.nick;
      if (args.roles !== undefined) body.roles = args.roles;
      if (args.mute !== undefined) body.mute = args.mute;
      if (args.deaf !== undefined) body.deaf = args.deaf;
      if (args.channelId !== undefined) body.channel_id = args.channelId;
      if (args.communicationDisabledUntil !== undefined) body.communication_disabled_until = args.communicationDisabledUntil;
    }

    if (endpoint.includes('/callback')) {
      // Interaction callback properties
      if (args.type !== undefined) body.type = args.type;
      if (args.data !== undefined) body.data = args.data;
    }

    if (endpoint.includes('/threads')) {
      // Thread properties
      if (args.name !== undefined) body.name = args.name;
      if (args.autoArchiveDuration !== undefined) body.auto_archive_duration = args.autoArchiveDuration;
      if (args.type !== undefined) body.type = args.type;
      if (args.invitable !== undefined) body.invitable = args.invitable;
      if (args.rateLimitPerUser !== undefined) body.rate_limit_per_user = args.rateLimitPerUser;
    }

    // Remove undefined values
    Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);

    return body;
  }

  private isValidBotToken(token: string): boolean {
    // Discord bot tokens typically start with "MTAx" or "MT" and contain base64 characters
    return /^M[A-Za-z0-9+/=]{50,}/.test(token);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility methods for common Discord operations

  /**
   * Create a simple text message
   */
  static createTextMessage(content: string, channelId: string): any {
    return {
      endpoint: "POST /channels/{channel.id}/messages",
      channelId,
      content
    };
  }

  /**
   * Create an embed message
   */
  static createEmbedMessage(embed: any, channelId: string): any {
    return {
      endpoint: "POST /channels/{channel.id}/messages",
      channelId,
      embeds: [embed]
    };
  }

  /**
   * Create a message with buttons
   */
  static createButtonMessage(content: string, buttons: Array<{label: string, customId?: string, url?: string, style?: number}>, channelId: string): any {
    const components = [{
      type: 1, // Action Row
      components: buttons.map(button => ({
        type: 2, // Button
        style: button.style || 1, // Primary style
        label: button.label,
        custom_id: button.customId,
        url: button.url
      }))
    }];

    return {
      endpoint: "POST /channels/{channel.id}/messages",
      channelId,
      content,
      components
    };
  }

  /**
   * Create a select menu message
   */
  static createSelectMenuMessage(content: string, customId: string, placeholder: string, options: Array<{label: string, value: string, description?: string}>, channelId: string): any {
    const components = [{
      type: 1, // Action Row
      components: [{
        type: 3, // Select Menu
        custom_id: customId,
        placeholder: placeholder,
        options: options
      }]
    }];

    return {
      endpoint: "POST /channels/{channel.id}/messages",
      channelId,
      content,
      components
    };
  }

  /**
   * Create a slash command
   */
  static createSlashCommand(name: string, description: string, options?: any[], applicationId?: string, guildId?: string): any {
    const endpoint = guildId 
      ? "POST /applications/{application.id}/guilds/{guild.id}/commands"
      : "POST /applications/{application.id}/commands";

    return {
      endpoint,
      applicationId,
      guildId,
      name,
      description,
      options
    };
  }

  /**
   * Create an interaction response
   */
  static createInteractionResponse(type: number, data: any, interactionId: string, interactionToken: string): any {
    return {
      endpoint: "POST /interactions/{interaction.id}/{interaction.token}/callback",
      interactionId,
      interactionToken,
      type,
      data
    };
  }

  /**
   * Create an ephemeral reply (slash command response)
   */
  static createEphemeralReply(content: string, interactionId: string, interactionToken: string): any {
    return {
      endpoint: "POST /interactions/{interaction.id}/{interaction.token}/callback",
      interactionId,
      interactionToken,
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        content,
        flags: 64 // EPHEMERAL
      }
    };
  }

  /**
   * Create a standard embed object
   */
  static createEmbed(options: {
    title?: string;
    description?: string;
    color?: number;
    author?: {name: string, iconUrl?: string, url?: string};
    footer?: {text: string, iconUrl?: string};
    image?: string;
    thumbnail?: string;
    fields?: Array<{name: string, value: string, inline?: boolean}>;
    timestamp?: boolean;
  }): any {
    const embed: any = {};

    if (options.title) embed.title = options.title;
    if (options.description) embed.description = options.description;
    if (options.color !== undefined) embed.color = options.color;
    if (options.author) {
      embed.author = {
        name: options.author.name,
        icon_url: options.author.iconUrl,
        url: options.author.url
      };
    }
    if (options.footer) {
      embed.footer = {
        text: options.footer.text,
        icon_url: options.footer.iconUrl
      };
    }
    if (options.image) embed.image = { url: options.image };
    if (options.thumbnail) embed.thumbnail = { url: options.thumbnail };
    if (options.fields) embed.fields = options.fields;
    if (options.timestamp) embed.timestamp = new Date().toISOString();

    return embed;
  }

  /**
   * Create permission overwrite for channels
   */
  static createPermissionOverwrite(id: string, type: number, allow: string, deny: string): any {
    return {
      id,
      type, // 0 = role, 1 = member
      allow,
      deny
    };
  }

  /**
   * Parse Discord snowflake ID to get timestamp
   */
  static parseSnowflake(snowflake: string): Date {
    const timestamp = (BigInt(snowflake) >> 22n) + 1420070400000n;
    return new Date(Number(timestamp));
  }

  /**
   * Convert hex color to decimal
   */
  static hexToDecimal(hex: string): number {
    return parseInt(hex.replace('#', ''), 16);
  }

  /**
   * Convert decimal color to hex
   */
  static decimalToHex(decimal: number): string {
    return `#${decimal.toString(16).padStart(6, '0').toUpperCase()}`;
  }

  /**
   * Calculate permissions bitfield
   */
  static calculatePermissions(permissions: string[]): string {
    const PERMISSIONS: Record<string, bigint> = {
      CREATE_INSTANT_INVITE: 1n << 0n,
      KICK_MEMBERS: 1n << 1n,
      BAN_MEMBERS: 1n << 2n,
      ADMINISTRATOR: 1n << 3n,
      MANAGE_CHANNELS: 1n << 4n,
      MANAGE_GUILD: 1n << 5n,
      ADD_REACTIONS: 1n << 6n,
      VIEW_AUDIT_LOG: 1n << 7n,
      PRIORITY_SPEAKER: 1n << 8n,
      STREAM: 1n << 9n,
      VIEW_CHANNEL: 1n << 10n,
      SEND_MESSAGES: 1n << 11n,
      SEND_TTS_MESSAGES: 1n << 12n,
      MANAGE_MESSAGES: 1n << 13n,
      EMBED_LINKS: 1n << 14n,
      ATTACH_FILES: 1n << 15n,
      READ_MESSAGE_HISTORY: 1n << 16n,
      MENTION_EVERYONE: 1n << 17n,
      USE_EXTERNAL_EMOJIS: 1n << 18n,
      VIEW_GUILD_INSIGHTS: 1n << 19n,
      CONNECT: 1n << 20n,
      SPEAK: 1n << 21n,
      MUTE_MEMBERS: 1n << 22n,
      DEAFEN_MEMBERS: 1n << 23n,
      MOVE_MEMBERS: 1n << 24n,
      USE_VAD: 1n << 25n,
      CHANGE_NICKNAME: 1n << 26n,
      MANAGE_NICKNAMES: 1n << 27n,
      MANAGE_ROLES: 1n << 28n,
      MANAGE_WEBHOOKS: 1n << 29n,
      MANAGE_GUILD_EXPRESSIONS: 1n << 30n,
      USE_APPLICATION_COMMANDS: 1n << 31n,
      REQUEST_TO_SPEAK: 1n << 32n,
      MANAGE_EVENTS: 1n << 33n,
      MANAGE_THREADS: 1n << 34n,
      CREATE_PUBLIC_THREADS: 1n << 35n,
      CREATE_PRIVATE_THREADS: 1n << 36n,
      USE_EXTERNAL_STICKERS: 1n << 37n,
      SEND_MESSAGES_IN_THREADS: 1n << 38n,
      USE_EMBEDDED_ACTIVITIES: 1n << 39n,
      MODERATE_MEMBERS: 1n << 40n,
      VIEW_CREATOR_MONETIZATION_ANALYTICS: 1n << 41n,
      USE_SOUNDBOARD: 1n << 42n,
      USE_EXTERNAL_SOUNDS: 1n << 45n,
      SEND_VOICE_MESSAGES: 1n << 46n
    };

    let bitfield = 0n;
    for (const permission of permissions) {
      if (PERMISSIONS[permission]) {
        bitfield |= PERMISSIONS[permission];
      }
    }

    return bitfield.toString();
  }

  /**
   * Create channel with specific type
   */
  static createChannel(name: string, type: number, guildId: string, options?: {
    topic?: string;
    bitrate?: number;
    userLimit?: number;
    rateLimitPerUser?: number;
    position?: number;
    parentId?: string;
    nsfw?: boolean;
    permissionOverwrites?: any[];
  }): any {
    return {
      endpoint: "POST /guilds/{guild.id}/channels",
      guildId,
      name,
      type,
      ...options
    };
  }

  /**
   * Create role with permissions
   */
  static createRole(name: string, guildId: string, options?: {
    permissions?: string;
    color?: number;
    hoist?: boolean;
    mentionable?: boolean;
  }): any {
    return {
      endpoint: "POST /guilds/{guild.id}/roles",
      guildId,
      name,
      ...options
    };
  }

  /**
   * Ban user with reason
   */
  static banUser(userId: string, guildId: string, reason?: string, deleteMessageDays?: number): any {
    return {
      endpoint: "PUT /guilds/{guild.id}/bans/{user.id}",
      guildId,
      userId,
      reason,
      deleteMessageDays
    };
  }

  /**
   * Kick user (remove from guild)
   */
  static kickUser(userId: string, guildId: string, reason?: string): any {
    return {
      endpoint: "DELETE /guilds/{guild.id}/members/{user.id}",
      guildId,
      userId,
      reason
    };
  }

  /**
   * Add role to user
   */
  static addRoleToUser(userId: string, roleId: string, guildId: string, reason?: string): any {
    return {
      endpoint: "PUT /guilds/{guild.id}/members/{user.id}/roles/{role.id}",
      guildId,
      userId,
      roleId,
      reason
    };
  }

  /**
   * Remove role from user
   */
  static removeRoleFromUser(userId: string, roleId: string, guildId: string, reason?: string): any {
    return {
      endpoint: "DELETE /guilds/{guild.id}/members/{user.id}/roles/{role.id}",
      guildId,
      userId,
      roleId,
      reason
    };
  }

  /**
   * Create thread from message
   */
  static createThread(name: string, channelId: string, messageId?: string, autoArchiveDuration?: number): any {
    const endpoint = messageId 
      ? "POST /channels/{channel.id}/messages/{message.id}/threads"
      : "POST /channels/{channel.id}/threads";
    
    return {
      endpoint,
      channelId,
      messageId,
      name,
      autoArchiveDuration
    };
  }

  /**
   * Edit message
   */
  static editMessage(messageId: string, channelId: string, content?: string, embeds?: any[], components?: any[]): any {
    return {
      endpoint: "PATCH /channels/{channel.id}/messages/{message.id}",
      channelId,
      messageId,
      content,
      embeds,
      components
    };
  }

  /**
   * Delete message
   */
  static deleteMessage(messageId: string, channelId: string, reason?: string): any {
    return {
      endpoint: "DELETE /channels/{channel.id}/messages/{message.id}",
      channelId,
      messageId,
      reason
    };
  }

  /**
   * Get messages from channel
   */
  static getMessages(channelId: string, limit?: number, before?: string, after?: string, around?: string): any {
    return {
      endpoint: "GET /channels/{channel.id}/messages",
      channelId,
      limit,
      before,
      after,
      around
    };
  }

  /**
   * Pin message
   */
  static pinMessage(messageId: string, channelId: string, reason?: string): any {
    return {
      endpoint: "PUT /channels/{channel.id}/pins/{message.id}",
      channelId,
      messageId,
      reason
    };
  }

  /**
   * Unpin message
   */
  static unpinMessage(messageId: string, channelId: string, reason?: string): any {
    return {
      endpoint: "DELETE /channels/{channel.id}/pins/{message.id}",
      channelId,
      messageId,
      reason
    };
  }

  /**
   * Create webhook message
   */
  static createWebhookMessage(applicationId: string, interactionToken: string, content?: string, embeds?: any[], components?: any[], flags?: number): any {
    return {
      endpoint: "POST /webhooks/{application.id}/{interaction.token}",
      applicationId,
      interactionToken,
      content,
      embeds,
      components,
      flags
    };
  }

  /**
   * Follow up to interaction (after initial response)
   */
  static followUpInteraction(applicationId: string, interactionToken: string, content?: string, embeds?: any[], components?: any[], ephemeral?: boolean): any {
    return {
      endpoint: "POST /webhooks/{application.id}/{interaction.token}",
      applicationId,
      interactionToken,
      content,
      embeds,
      components,
      flags: ephemeral ? 64 : undefined
    };
  }

  /**
   * Edit original interaction response
   */
  static editInteractionResponse(applicationId: string, interactionToken: string, content?: string, embeds?: any[], components?: any[]): any {
    return {
      endpoint: "PATCH /webhooks/{application.id}/{interaction.token}/messages/@original",
      applicationId,
      interactionToken,
      content,
      embeds,
      components
    };
  }

  /**
   * Delete original interaction response
   */
  static deleteInteractionResponse(applicationId: string, interactionToken: string): any {
    return {
      endpoint: "DELETE /webhooks/{application.id}/{interaction.token}/messages/@original",
      applicationId,
      interactionToken
    };
  }

  /**
   * Get guild information
   */
  static getGuild(guildId: string, withCounts?: boolean): any {
    return {
      endpoint: "GET /guilds/{guild.id}",
      guildId,
      with_counts: withCounts
    };
  }

  /**
   * Get guild members
   */
  static getGuildMembers(guildId: string, limit?: number, after?: string): any {
    return {
      endpoint: "GET /guilds/{guild.id}/members",
      guildId,
      limit,
      after
    };
  }

  /**
   * Get bot's user information
   */
  static getBotUser(): any {
    return {
      endpoint: "GET /users/@me"
    };
  }

  /**
   * Get user information
   */
  static getUser(userId: string): any {
    return {
      endpoint: "GET /users/{user.id}",
      userId
    };
  }

  /**
   * Common Discord color constants
   */
  static readonly COLORS = {
    DEFAULT: 0x000000,
    WHITE: 0xffffff,
    AQUA: 0x1abc9c,
    GREEN: 0x57f287,
    BLUE: 0x3498db,
    YELLOW: 0xfee75c,
    PURPLE: 0x9b59b6,
    LUMINOUS_VIVID_PINK: 0xe91e63,
    FUCHSIA: 0xeb459e,
    GOLD: 0xf1c40f,
    ORANGE: 0xe67e22,
    RED: 0xed4245,
    GREY: 0x95a5a6,
    NAVY: 0x34495e,
    DARK_AQUA: 0x11806a,
    DARK_GREEN: 0x1f8b4c,
    DARK_BLUE: 0x206694,
    DARK_PURPLE: 0x71368a,
    DARK_VIVID_PINK: 0xad1457,
    DARK_GOLD: 0xc27c0e,
    DARK_ORANGE: 0xa84300,
    DARK_RED: 0x992d22,
    DARK_GREY: 0x979c9f,
    DARKER_GREY: 0x7f8c8d,
    LIGHT_GREY: 0xbcc0c0,
    DARK_NAVY: 0x2c3e50,
    BLURPLE: 0x5865f2,
    GREYPLE: 0x99aab5,
    DARK_BUT_NOT_BLACK: 0x2c2f33,
    NOT_QUITE_BLACK: 0x23272a
  };

  /**
   * Common button styles
   */
  static readonly BUTTON_STYLES = {
    PRIMARY: 1,   // Blurple
    SECONDARY: 2, // Grey  
    SUCCESS: 3,   // Green
    DANGER: 4,    // Red
    LINK: 5       // Grey, navigates to URL
  };

  /**
   * Common channel types
   */
  static readonly CHANNEL_TYPES = {
    GUILD_TEXT: 0,
    DM: 1,
    GUILD_VOICE: 2,
    GROUP_DM: 3,
    GUILD_CATEGORY: 4,
    GUILD_ANNOUNCEMENT: 5,
    ANNOUNCEMENT_THREAD: 10,
    PUBLIC_THREAD: 11,
    PRIVATE_THREAD: 12,
    GUILD_STAGE_VOICE: 13,
    GUILD_DIRECTORY: 14,
    GUILD_FORUM: 15,
    GUILD_MEDIA: 16
  };

  /**
   * Common slash command option types
   */
  static readonly OPTION_TYPES = {
    SUB_COMMAND: 1,
    SUB_COMMAND_GROUP: 2,
    STRING: 3,
    INTEGER: 4,
    BOOLEAN: 5,
    USER: 6,
    CHANNEL: 7,
    ROLE: 8,
    MENTIONABLE: 9,
    NUMBER: 10,
    ATTACHMENT: 11
  };

  /**
   * Common interaction response types
   */
  static readonly INTERACTION_RESPONSE_TYPES = {
    PONG: 1,
    CHANNEL_MESSAGE_WITH_SOURCE: 4,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
    DEFERRED_UPDATE_MESSAGE: 6,
    UPDATE_MESSAGE: 7,
    APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8,
    MODAL: 9,
    PREMIUM_REQUIRED: 10
  };
}
