//optimized-jotium.ts
//ENHANCED VERSION WITH TOOL CACHING AND CHANGE DETECTION
import { GoogleGenAI, FunctionDeclaration, mcpToTool } from "@google/genai";
import * as fs from "fs/promises";
import dotenv from 'dotenv';
import { getDecryptedApiKey, getDecryptedOAuthAccessToken } from "@/db/queries";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import crypto from 'crypto';

// Import all tools (same as before)
import { WebSearchTool } from './tools/web-search-tool';
import { FileManagerTool } from './tools/file-manager-tool';
import { GitHubTool } from './tools/github-tool';
import { SlackTool } from './tools/slack-tool';
import { ClickUpTool } from './tools/clickup-tool';
import { ApiTool } from './tools/api-tool';
import { DateTimeTool } from './tools/datetime-tool';
import { AsanaTool } from './tools/asana-tool';
import { DuffelFlightTool } from './tools/flight-booking-tool';
import { AyrshareSocialTool } from './tools/ayrshare-tool';
import { CalComTool } from './tools/calcom-tool';
import { CodeExecutionTool } from './tools/code-tool';
import { AgentMemory, Message, Tool, ToolCall, ToolResult } from "./types";
import { generateUUID } from "@/lib/utils";
import { ImageGenerationTool } from './tools/image-gen';
import { WeatherTool } from "./tools/WeatherTool";
import { NotionTool } from './tools/notion-tool';
import { StripeManagementTool } from './tools/stripe-tool';
import { AlphaVantageTool } from './tools/alphavantage-tool';
import { AirtableTool } from './tools/airtable-tool';
import { SupabaseTool } from './tools/supabase-tool';
import { TrelloTool } from './tools/trello';
import { LinearManagementTool } from './tools/linear-tool';
import { DataVisualizationTool } from './tools/dataviz-tool';
import { DuckDuckGoSearchTool } from './tools/DuckDuckGoSearchTool';
import { SerperSearchTool } from './tools/SerperSearchTool';
import { LangSearchTool } from './tools/LangSearchTool';
import { N8NTool } from './tools/N8NTool';
import { ZapierTool } from './tools/ZapierTool';
import { SerpstackTool } from './tools/SerpstackTool';
import { GmailTool } from './tools/GmailTool';
import { GoogleCalendarTool } from './tools/GoogleCalendarTool';
import { GoogleDriveTool } from './tools/GoogleDriveTool';
import { GoogleSheetsTool } from './tools/GoogleSheetsTool';
import { StockTool } from './tools/StockTool';
import { PDFTool } from './tools/PDFTool';
import { FireWebScrapeTool } from './tools/FireWebScrapeTool';
import { EnhancedAgenticEngine, EnhancedActionIntent } from './actions';

dotenv.config();

// Tool cache configuration interface
interface ToolCacheConfig {
  lastUpdated: number;
  mcpConfigHash: string;
  envKeysHash: string;
  userApiKeysHash: string;
  oauthTokensHash: string;
}

// Global tool cache to persist across instances
class GlobalToolCache {
  private static instance: GlobalToolCache;
  private tools: Map<string, Tool> = new Map();
  private mcpClients: Map<string, McpClientInfo> = new Map();
  private cacheConfig: ToolCacheConfig | null = null;
  private isServerless: boolean;

  static getInstance(): GlobalToolCache {
    if (!GlobalToolCache.instance) {
      GlobalToolCache.instance = new GlobalToolCache();
    }
    return GlobalToolCache.instance;
  }

  constructor() {
    // Detect if running in serverless environment (Vercel, AWS Lambda, etc.)
    this.isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.FUNCTION_NAME);
    if (this.isServerless) {
      console.log("Detected serverless environment, using in-memory cache only");
    }
  }

  async loadCacheConfig(): Promise<ToolCacheConfig | null> {
    if (this.isServerless) {
      // In serverless environments, return existing in-memory cache
      return this.cacheConfig;
    }
    
    try {
      const data = await fs.readFile("./tool_cache_config.json", "utf-8");
      const config = JSON.parse(data);
      this.cacheConfig = config;
      return config;
    } catch (error) {
      console.log("No existing tool cache config found");
      return null;
    }
  }

  async saveCacheConfig(config: ToolCacheConfig): Promise<void> {
    // Always store in memory
    this.cacheConfig = config;
    
    if (this.isServerless) {
      // In serverless environments, only use in-memory storage
      console.log("Serverless environment: Cache stored in memory only");
      return;
    }
    
    // In local/server environments, also save to file
    try {
      await fs.writeFile("./tool_cache_config.json", JSON.stringify(config, null, 2));
      console.log("Cache config saved to file");
    } catch (error) {
      console.error("Failed to save tool cache config to file:", error);
      // Don't throw error, in-memory cache is still functional
    }
  }

  getTools(): Map<string, Tool> {
    return new Map(this.tools);
  }

  getMcpClients(): Map<string, McpClientInfo> {
    return new Map(this.mcpClients);
  }

  setTools(tools: Map<string, Tool>): void {
    this.tools = new Map(tools);
  }

  setMcpClients(clients: Map<string, McpClientInfo>): void {
    this.mcpClients = new Map(clients);
  }

  setCacheConfig(config: ToolCacheConfig): void {
    this.cacheConfig = config;
  }

  getCacheConfig(): ToolCacheConfig | null {
    return this.cacheConfig;
  }

  get isServerlessEnvironment(): boolean {
    return this.isServerless;
  }

  async clearCache(): Promise<void> {
    this.tools.clear();
    // Close MCP connections properly
    for (const [serverName, clientInfo] of this.mcpClients) {
      try {
        await clientInfo.client.close();
        console.log(`Closed cached MCP connection: ${serverName}`);
      } catch (error) {
        console.error(`Error closing cached MCP connection ${serverName}:`, error);
      }
    }
    this.mcpClients.clear();
    this.cacheConfig = null;
    
    // Only try to delete file in non-serverless environments
    if (!this.isServerless) {
      try {
        await fs.unlink("./tool_cache_config.json");
        console.log("Cache config file deleted");
      } catch (error) {
        // File might not exist, which is fine
        console.log("Cache config file deletion skipped (file may not exist)");
      }
    } else {
      console.log("Serverless environment: In-memory cache cleared");
    }
  }
}

// MCP Client interface
interface McpClientInfo {
  client: Client;
  callableTool: any;
  serverName: string;
}

// Extended Part interface for MCP
interface McpPart {
  text?: string;
  toolResponse?: { response: any; };
  functionResponse?: { response: any; };
  [key: string]: any;
}

export class AIAgent {
  private ai: GoogleGenAI;
  private memory: AgentMemory;
  private memoryPath: string;
  private maxMessages: number = 19;
  private tools: Map<string, Tool> = new Map();
  private model: string;
  private agenticEngine!: EnhancedAgenticEngine;
  private context: { currentDate: Date; userTimezone: string; domainExpertise: string[] };
  private language: string;
  private mcpClients: Map<string, McpClientInfo> = new Map();
  private globalCache: GlobalToolCache;
  private userId?: string;

  constructor(
    geminiApiKey: string,
    userId?: string,
    memoryPath: string = "./agent_memory.json",
    model: string = "gemini-2.0-flash",
    language: string = "en"
  ) {
    this.ai = new GoogleGenAI({ apiKey: geminiApiKey });
    this.memoryPath = memoryPath;
    this.memory = { messages: [], lastUpdated: Date.now() };
    this.model = model;
    this.language = language;
    this.userId = userId;
    this.globalCache = GlobalToolCache.getInstance();
    this.context = {
      currentDate: new Date(),
      userTimezone:
        (Intl.DateTimeFormat().resolvedOptions().timeZone as string) || 'UTC',
      domainExpertise: []
    };
    this.updateTemporalContext();
  }

  // Generate hash for configuration to detect changes
  private generateHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Get MCP configuration hash
  private async getMcpConfigHash(): Promise<string> {
    try {
      const possiblePaths = [
        "./ai/mcp.json",
        "ai/mcp.json", 
        "./mcp.json",
        "mcp.json",
        process.cwd() + "/ai/mcp.json",
        process.cwd() + "/mcp.json"
      ];
      
      let mcpConfigData = '';
      for (const path of possiblePaths) {
        try {
          mcpConfigData = await fs.readFile(path, "utf-8");
          console.log(`Found MCP config at: ${path}`);
          break;
        } catch (error) {
          // Try next path
        }
      }
      
      return this.generateHash(mcpConfigData);
    } catch (error) {
      console.log("MCP config not found, using empty hash");
      return '';
    }
  }

  // Get environment variables hash for API keys
  private getEnvKeysHash(): string {
    const envKeys = [
      'TAVILY_API_KEY', 'ALPHAVANTAGE_API_KEY', 'GEMINI_API_KEY', 'DUFFEL_API_KEY',
      'LANGSEARCH_API_KEY', 'SERPSTACK_API_KEY', 'SERPER_API_KEY', 'AIRTABLE_API_KEY',
      'AYRSHARE_API_KEY', 'CALCOM_API_KEY', 'GITHUB_TOKEN', 'NOTION_API_KEY',
      'CLICKUP_API_TOKEN', 'SLACK_BOT_TOKEN', 'SUPABASE_URL', 'SUPABASE_KEY',
      'ASANA_API_KEY', 'TRELLO_API_KEY', 'TRELLO_TOKEN', 'LINEAR_API_KEY',
      'N8N_BASE_URL', 'N8N_API_KEY', 'ZAPIER_API_KEY', 'ZAPIER_WEBHOOK_URL'
    ];
    
    const envData = envKeys
      .map(key => `${key}:${process.env[key] || ''}`)
      .join('|');
    
    return this.generateHash(envData);
  }

  // Get user API keys hash
  private async getUserApiKeysHash(): Promise<string> {
    if (!this.userId) return '';
    
    const services = [
      'Airtable', 'Ayrshare', 'Cal.com', 'GitHub', 'Notion', 'Stripe',
      'ClickUp', 'Slack', 'Supabase URL', 'Supabase Key', 'Asana',
      'Trello', 'Trello Token', 'Linear', 'n8n Base URL', 'n8n API Key',
      'Zapier API Key', 'Zapier Webhook URL'
    ];

    const userKeysData: string[] = [];
    for (const service of services) {
      try {
        const key = await getDecryptedApiKey({ userId: this.userId, service });
        userKeysData.push(`${service}:${key || ''}`);
      } catch (error) {
        userKeysData.push(`${service}:`);
      }
    }

    return this.generateHash(userKeysData.join('|'));
  }

  // Get OAuth tokens hash
  private async getOAuthTokensHash(): Promise<string> {
    if (!this.userId) return '';
    
    const oauthServices = ['gmail'];
    const oauthData: string[] = [];
    
    for (const service of oauthServices) {
      try {
        const token = await getDecryptedOAuthAccessToken({ 
          userId: this.userId, 
          service 
        });
        oauthData.push(`${service}:${token || ''}`);
      } catch (error) {
        oauthData.push(`${service}:`);
      }
    }

    return this.generateHash(oauthData.join('|'));
  }

  // Check if tools need to be reinitialized
  private async shouldReinitializeTools(): Promise<boolean> {
    const cachedConfig = await this.globalCache.loadCacheConfig();
    
    if (!cachedConfig) {
      console.log("🔄 No cached tool configuration found, initializing tools...");
      return true;
    }

    // Check if configuration has changed
    const currentMcpHash = await this.getMcpConfigHash();
    const currentEnvHash = this.getEnvKeysHash();
    const currentUserKeysHash = await this.getUserApiKeysHash();
    const currentOAuthHash = await this.getOAuthTokensHash();

    const hasChanges = 
      cachedConfig.mcpConfigHash !== currentMcpHash ||
      cachedConfig.envKeysHash !== currentEnvHash ||
      cachedConfig.userApiKeysHash !== currentUserKeysHash ||
      cachedConfig.oauthTokensHash !== currentOAuthHash;

    if (hasChanges) {
      console.log("🔄 Configuration changes detected, reinitializing tools...");
      console.log(`  MCP Config Changed: ${cachedConfig.mcpConfigHash !== currentMcpHash}`);
      console.log(`  Env Keys Changed: ${cachedConfig.envKeysHash !== currentEnvHash}`);
      console.log(`  User Keys Changed: ${cachedConfig.userApiKeysHash !== currentUserKeysHash}`);
      console.log(`  OAuth Changed: ${cachedConfig.oauthTokensHash !== currentOAuthHash}`);
      return true;
    }

    // In serverless environments, cache is only valid for the current execution
    // In server environments, check cache age (reinitialize after 1 hour)
    if (!this.globalCache.isServerlessEnvironment) {
      const cacheAge = Date.now() - cachedConfig.lastUpdated;
      const maxCacheAge = 60 * 60 * 1000; // 1 hour
      
      if (cacheAge > maxCacheAge) {
        console.log("🔄 Tool cache expired, reinitializing tools...");
        return true;
      }
    }

    console.log("✅ Using cached tools (no configuration changes detected)");
    return false;
  }

  // Async initialization for tools with caching
  public async initializeTools(userId?: string): Promise<void> {
    this.userId = userId;

    // Check if we need to reinitialize
    const shouldReinitialize = await this.shouldReinitializeTools();
    
    if (!shouldReinitialize) {
      // Use cached tools
      this.tools = this.globalCache.getTools();
      this.mcpClients = this.globalCache.getMcpClients();
      
      if (this.tools.size > 0) {
        console.log(`✅ Loaded ${this.tools.size} cached tools`);
        this.agenticEngine = new EnhancedAgenticEngine(this.tools);
        return;
      }
    }

    // Clear existing cache if reinitializing
    if (shouldReinitialize) {
      await this.globalCache.clearCache();
    }

    // Initialize tools from scratch
    console.log("🚀 Initializing tools from scratch...");
    
    await this.initializeMcpServers();
    await this.initializeRegularTools();

    // Cache the initialized tools
    this.globalCache.setTools(this.tools);
    this.globalCache.setMcpClients(this.mcpClients);

    // Save cache configuration
    const cacheConfig: ToolCacheConfig = {
      lastUpdated: Date.now(),
      mcpConfigHash: await this.getMcpConfigHash(),
      envKeysHash: this.getEnvKeysHash(),
      userApiKeysHash: await this.getUserApiKeysHash(),
      oauthTokensHash: await this.getOAuthTokensHash()
    };

    this.globalCache.setCacheConfig(cacheConfig);
    await this.globalCache.saveCacheConfig(cacheConfig);

    console.log(`✅ Initialized and cached ${this.tools.size} tools`);
    this.agenticEngine = new EnhancedAgenticEngine(this.tools);
  }

  // Initialize regular (non-MCP) tools
  private async initializeRegularTools(): Promise<void> {
    // Helper function to get API keys
    const getKey = async (serviceName: string, envVar: string): Promise<string> => {
      if (this.userId) {
        const userKey = await getDecryptedApiKey({ userId: this.userId, service: serviceName });
        if (userKey) return userKey;
      }
      return process.env[envVar] || "";
    };

    // Group 1: Environment-only tools
    if (process.env.TAVILY_API_KEY) {
      const webSearchTool = new WebSearchTool(process.env.TAVILY_API_KEY);
      this.tools.set("web_search", {
        getDefinition: () => webSearchTool.getSearchDefinition(),
        execute: (args: any) => webSearchTool.executeSearch(args),
      } as Tool);
      this.tools.set("web_extract", {
        getDefinition: () => webSearchTool.getExtractDefinition(),
        execute: (args: any) => webSearchTool.executeExtract(args),
      } as Tool);
      this.tools.set("web_crawl", {
        getDefinition: () => webSearchTool.getCrawlDefinition(),
        execute: (args: any) => webSearchTool.executeCrawl(args),
      } as Tool);
    }

    if (process.env.ALPHAVANTAGE_API_KEY) {
      const tool = new AlphaVantageTool(process.env.ALPHAVANTAGE_API_KEY);
      this.tools.set("alphavantage_tool", tool);
    }

    if (process.env.GEMINI_API_KEY) {
      this.tools.set("generate_image", new ImageGenerationTool(process.env.GEMINI_API_KEY));
    }

    if (process.env.DUFFEL_API_KEY) {
      this.tools.set("flight_booking", new DuffelFlightTool({ apiKey: process.env.DUFFEL_API_KEY }));
    }

    if (process.env.LANGSEARCH_API_KEY) {
      this.tools.set("langsearch_search", new LangSearchTool(process.env.LANGSEARCH_API_KEY));
    }

    if (process.env.SERPSTACK_API_KEY) {
      this.tools.set("serpstack_search", new SerpstackTool(process.env.SERPSTACK_API_KEY));
    }

    // Group 2: Tools without API keys
    this.tools.set("api_tool", new ApiTool());
    this.tools.set("get_weather", new WeatherTool());
    this.tools.set("datetime_tool", new DateTimeTool());
    this.tools.set("data_visualization", new DataVisualizationTool());
    this.tools.set("duckduckgo_search", new DuckDuckGoSearchTool());
    this.tools.set("get_stock_data", new StockTool());

    const serperApiKey = process.env.SERPER_API_KEY;
    if (serperApiKey) {
      const tool = new SerperSearchTool(serperApiKey);
      this.tools.set("serper_search", tool);
    }

    // Group 3: User-configurable tools
    const airtableKey = await getKey("Airtable", "AIRTABLE_API_KEY");
    if (airtableKey) this.tools.set("airtable_tool", new AirtableTool(airtableKey));

    const ayrshareKey = await getKey("Ayrshare", "AYRSHARE_API_KEY");
    if (ayrshareKey) this.tools.set("social_media", new AyrshareSocialTool(ayrshareKey));

    const calcomKey = await getKey("Cal.com", "CALCOM_API_KEY");
    if (calcomKey) this.tools.set("calcom_scheduler", new CalComTool(calcomKey));

    const githubKey = await getKey("GitHub", "GITHUB_TOKEN");
    if (githubKey) {
      const tool = new GitHubTool(githubKey);
      this.tools.set("github_tool", tool);
    }

    const notionKey = await getKey("Notion", "NOTION_API_KEY");
    if (notionKey) {
      const tool = new NotionTool(notionKey);
      this.tools.set("notion_tool", tool);
    }

    if (this.userId) {
      const stripeKey = await getDecryptedApiKey({ userId: this.userId, service: "Stripe" });
      if (stripeKey) {
        const tool = new StripeManagementTool(stripeKey);
        this.tools.set("stripe_tool", tool);
      }
    }

    const clickupKey = await getKey("ClickUp", "CLICKUP_API_TOKEN");
    if (clickupKey) this.tools.set("clickup_tool", new ClickUpTool({ apiKey: clickupKey }));

    const slackKey = await getKey("Slack", "SLACK_BOT_TOKEN");
    if (slackKey) {
      const tool = new SlackTool({ botToken: slackKey });
      const toolName = tool.getDefinition().name;
      if (toolName) {
        this.tools.set(toolName, tool);
      }
    }

    const supabaseUrl = await getKey("Supabase URL", "SUPABASE_URL");
    const supabaseKey = await getKey("Supabase Key", "SUPABASE_KEY");
    if (supabaseUrl && supabaseKey) {
      this.tools.set("supabase_database", new SupabaseTool(supabaseUrl, supabaseKey));
    }

    const asanaKey = await getKey("Asana", "ASANA_API_KEY");
    if (asanaKey) this.tools.set("asana_tool", new AsanaTool(asanaKey));

    const trelloApiKey = await getKey("Trello", "TRELLO_API_KEY");
    const trelloToken = await getKey("Trello Token", "TRELLO_TOKEN");
    if (trelloApiKey && trelloToken) {
      const trelloTool = new TrelloTool({ apiKey: trelloApiKey, token: trelloToken });
      this.tools.set("trello_tool", trelloTool);
    }

    const linearKey = await getKey("Linear", "LINEAR_API_KEY");
    if (linearKey) {
      const linearTool = new LinearManagementTool(linearKey);
      this.tools.set("linear_management", linearTool);
    }

    const n8nBaseUrl = await getKey("n8n Base URL", "N8N_BASE_URL");
    const n8nApiKey = await getKey("n8n API Key", "N8N_API_KEY");
    if (n8nBaseUrl && n8nApiKey) {
      this.tools.set("n8n_automation", new N8NTool(n8nBaseUrl, n8nApiKey));
    }

    const zapierApiKey = await getKey("Zapier API Key", "ZAPIER_API_KEY");
    const zapierWebhookUrl = await getKey("Zapier Webhook URL", "ZAPIER_WEBHOOK_URL");
    if (zapierApiKey || zapierWebhookUrl) {
      this.tools.set("zapier_webhook", new ZapierTool(zapierApiKey, zapierWebhookUrl));
    }

    // OAuth tools
    if (this.userId) {
      const googleAccessToken = await getDecryptedOAuthAccessToken({ 
        userId: this.userId, 
        service: "gmail" 
      });
      
      if (googleAccessToken) {
        const gmailTool = new GmailTool(this.userId);
        const gmailToolName = gmailTool.getDefinition().name;
        if (gmailToolName) {
          this.tools.set(gmailToolName, gmailTool);
        }

        const calendarTool = new GoogleCalendarTool(this.userId);
        const calendarToolName = calendarTool.getDefinition().name;
        if (calendarToolName) {
          this.tools.set(calendarToolName, calendarTool);
        }

        const driveTool = new GoogleDriveTool(this.userId);
        const driveToolName = driveTool.getDefinition().name;
        if (driveToolName) {
          this.tools.set(driveToolName, driveTool);
        }
        
        const sheetsTool = new GoogleSheetsTool(this.userId);
        const sheetsToolName = sheetsTool.getDefinition().name;
        if (sheetsToolName) {
          this.tools.set(sheetsToolName, sheetsTool);
        }
      }
    }
  }

  // Initialize MCP servers
  private async initializeMcpServers(): Promise<void> {
    try {
      const possiblePaths = [
        "./ai/mcp.json",
        "ai/mcp.json", 
        "./mcp.json",
        "mcp.json",
        process.cwd() + "/ai/mcp.json",
        process.cwd() + "/mcp.json"
      ];
      
      let mcpConfigPath = '';
      let data = '';
      
      for (const path of possiblePaths) {
        try {
          data = await fs.readFile(path, "utf-8");
          mcpConfigPath = path;
          console.log(`Found MCP config at: ${path}`);
          break;
        } catch (error) {
          // Try next path
        }
      }
      
      if (!data) {
        throw new Error("MCP config file not found in any expected location");
      }
      
      const mcpConfig = JSON.parse(data);

      if (mcpConfig && mcpConfig.servers) {
        for (const serverConfig of mcpConfig.servers) {
          try {
            console.log(`🔄 Initializing MCP server: ${serverConfig.name}`);
            
            const serverParams = new StdioClientTransport({
              command: serverConfig.command,
              args: serverConfig.args,
              env: serverConfig.env || {}
            });

            const client = new Client({
              name: "jotium-client",
              version: "1.0.0",
            });

            const connectTimeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Connection timeout')), 20000)
            );

            await Promise.race([
              client.connect(serverParams),
              connectTimeout
            ]);

            console.log(`✅ Connected to MCP server: ${serverConfig.name}`);

            const callableTool = mcpToTool(client);
            
            let googleTool;
            try {
              googleTool = await callableTool.tool();
            } catch (toolError) {
              console.error(`❌ Error getting tool definitions for ${serverConfig.name}:`, toolError);
              await client.close().catch(() => {});
              continue;
            }

            this.mcpClients.set(serverConfig.name, {
              client,
              callableTool,
              serverName: serverConfig.name
            });

            if (googleTool.functionDeclarations && googleTool.functionDeclarations.length > 0) {
              for (const funcDecl of googleTool.functionDeclarations) {
                const toolName = funcDecl.name;
                if (toolName) {
                  this.tools.set(toolName, {
                    getDefinition: () => funcDecl,
                    execute: async (args: any) => {
                      try {
                        console.log(`🔧 Executing MCP tool "${toolName}" with args:`, args);
                        
                        const functionCall = {
                          name: toolName,
                          args,
                        };

                        const parts = await callableTool.callTool([functionCall]);
                        
                        if (parts && parts.length > 0) {
                          const part = parts[0] as McpPart;
                          
                          if (part.toolResponse) {
                            console.log(`✅ MCP tool "${toolName}" response:`, part.toolResponse.response);
                            return part.toolResponse.response;
                          } else if (part.text) {
                            console.log(`✅ MCP tool "${toolName}" text response:`, part.text);
                            return { success: true, result: part.text };
                          } else if (part.functionResponse) {
                            console.log(`✅ MCP tool "${toolName}" function response:`, part.functionResponse.response);
                            return part.functionResponse.response;
                          } else {
                            console.log(`✅ MCP tool "${toolName}" raw response:`, part);
                            return part;
                          }
                        } else {
                          console.warn(`⚠️ No response from MCP tool "${toolName}"`);
                          return { success: false, error: "No response from MCP tool" };
                        }
                      } catch (error) {
                        console.error(`❌ Error executing MCP tool "${toolName}":`, error);
                        return { 
                          success: false, 
                          error: error instanceof Error ? error.message : String(error)
                        };
                      }
                    },
                  });
                  console.log(`✅ MCP Tool "${toolName}" from server "${serverConfig.name}" loaded.`);
                }
              }
            } else {
              console.warn(`⚠️ No function declarations found for MCP server "${serverConfig.name}"`);
            }
          } catch (error) {
            console.error(`❌ Failed to load MCP server "${serverConfig.name}":`, error);
            try {
              const clientInfo = this.mcpClients.get(serverConfig.name);
              if (clientInfo) {
                await clientInfo.client.close();
                this.mcpClients.delete(serverConfig.name);
              }
            } catch (closeError) {
              console.error(`Error closing failed MCP client:`, closeError);
            }
          }
        }
      }
    } catch (error) {
      console.log("ℹ️ No mcp.json file found or it's invalid. Skipping MCP server initialization.");
    }
  }

  // Add method to manually force tool reinitialization
  public async forceReinitializeTools(): Promise<void> {
    console.log("🔄 Forcing tool reinitialization...");
    await this.globalCache.clearCache();
    await this.initializeTools(this.userId);
  }

  // Add method to check cache status
  public async getCacheStatus(): Promise<{
    isCached: boolean;
    lastUpdated: Date | null;
    toolCount: number;
    mcpConnections: string[];
  }> {
    const cachedConfig = this.globalCache.getCacheConfig();
    const tools = this.globalCache.getTools();
    const mcpClients = this.globalCache.getMcpClients();
    
    return {
      isCached: cachedConfig !== null && tools.size > 0,
      lastUpdated: cachedConfig ? new Date(cachedConfig.lastUpdated) : null,
      toolCount: tools.size,
      mcpConnections: Array.from(mcpClients.keys())
    };
  }

  // Clean up MCP connections
  public async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up MCP connections...');
    for (const [serverName, clientInfo] of this.mcpClients) {
      try {
        await clientInfo.client.close();
        console.log(`✅ Closed MCP connection: ${serverName}`);
      } catch (error) {
        console.error(`❌ Error closing MCP connection ${serverName}:`, error);
      }
    }
    this.mcpClients.clear();
  }

  // Memory Management
  private async loadMemory(): Promise<void> {
    try {
      const data = await fs.readFile(this.memoryPath, "utf-8");
      this.memory = JSON.parse(data);
    } catch (error) {
      console.error("Error loading memory:", error);
      console.log("ℹ️ No existing memory found, starting fresh");
      this.memory = { messages: [], lastUpdated: Date.now() };
    }
  }

  private async saveMemory(): Promise<void> {
    try {
      // Keep only last N messages
      if (this.memory.messages.length > this.maxMessages) {
        this.memory.messages = this.memory.messages.slice(-this.maxMessages);
      }
      this.memory.lastUpdated = Date.now();
      await fs.writeFile(this.memoryPath, JSON.stringify(this.memory, null, 2));
    } catch (error) {
      console.error("❌ Failed to save memory:", error);
    }
  }

  // Get all tool definitions
  private getToolDefinitions(): FunctionDeclaration[] {
    const definitions: FunctionDeclaration[] = [];
    for (const tool of this.tools.values()) {
      definitions.push(tool.getDefinition());
    }
    return definitions;
  }

  // Execute Tools
  private async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    let result: any;
    
    try {
      const tool = this.tools.get(toolCall.name);
      if (!tool) {
        result = { success: false, error: `Unknown tool: ${toolCall.name}` };
      } else {
        console.log(`🔧 Executing ${toolCall.name}...`);
        result = await tool.execute(toolCall.args);
      }
    } catch (error: unknown) {
      result = { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }

    return {
      toolCallId: toolCall.id,
      result: result,
      error: result.success ? undefined : result.error
    };
  }

  // Support methods for terminal interface
  public getToolsMap(): Map<string, Tool> {
    return this.tools;
  }

  public getMemoryData(): AgentMemory {
    return this.memory;
  }

  public addMessageToMemory(message: Message): void {
    this.memory.messages.push(message);
  }

  public getConversationHistory(): any[] {
    return this.memory.messages.map(msg => ({
      role: msg.role === "tool" ? "user" : (msg.role === "assistant" ? "model" : msg.role),
      parts: [{ text: msg.content }]
    }));
  }

  // Unified content generation method with thinking enabled
  public async generateContentStream(conversationHistory: any[]): Promise<any> {
    const includeThoughts = this.model !== 'gemini-2.0-flash';
    this.updateTemporalContext();
    this.extractDomainExpertise();
    return await this.ai.models.generateContentStream({
      model: this.model,
      contents: conversationHistory,
      config: {
        temperature: 0.6,
        thinkingConfig: {
          includeThoughts: includeThoughts,
        },
        tools: [{
          functionDeclarations: this.getToolDefinitions()
        }],
        systemInstruction: `You are Jotium, an elite autonomous AI agent with PhD-level expertise across all domains. You embody sophisticated intelligence patterns, thinking with strategic depth, contextual awareness, and adaptive reasoning capabilities.

🧠 **COGNITIVE ARCHITECTURE**
- **Autonomous Intelligence**: Process complex problems through multi-layered reasoning without requiring hand-holding
- **Strategic Anticipation**: Think 3-5 steps ahead, preparing comprehensive solutions before they're explicitly requested  
- **Contextual Mastery**: Make intelligent inferences from minimal information, never asking for obvious details
- **Adaptive Expertise**: Dynamically adjust your knowledge depth and communication style based on user sophistication

⚡ **INTELLIGENT EXECUTION PRINCIPLES**
1. **Smart Assumptions**: Calculate dates, infer context, deduce user intent from minimal cues
2. **Proactive Research**: Autonomously search for information when knowledge gaps are detected
3. **Multi-Tool Orchestration**: Seamlessly chain tools in parallel and sequence for optimal outcomes
4. **Value Maximization**: Exceed request scope to deliver comprehensive, actionable insights

🎯 **ENHANCED CAPABILITIES**
${this.generateCapabilityMap()}

🕐 **TEMPORAL INTELLIGENCE**
- Current Context: ${this.context.currentDate.toLocaleDateString()} at ${this.context.currentDate.toLocaleTimeString()}
- Timezone: ${this.context.userTimezone}
- Business Hours: ${(this.context as any).temporalAnchors?.businessHours ? 'Yes' : 'No'}
- Tomorrow: ${(this.context as any).temporalAnchors?.tomorrow}

DOMAIN EXPERTISE: ${this.context.domainExpertise.join(', ') || 'Generalist'}

AUTONOMOUS BEHAVIOR PATTERNS:
1. **Think Chain Reasoning**: Process requests through multiple cognitive layers before responding.
2. **Proactive Tool Orchestration**: Seamlessly chain tools in parallel and sequence for optimal results.
3. **Intelligent Defaults**: Generate smart assumptions rather than asking obvious questions.
4. **Comprehensive Research**: When researching, provide expert-level analysis with multiple sources, YouTube educational videos, and practical applications.
5. **Strategic Communication**: Frame responses with authority and confidence, providing context and next steps.
6. **Multi-Modal Intelligence**: Process and generate content across text, images, code, and data visualizations.

RESEARCH METHODOLOGY:
When conducting research, you MUST:
- Execute multiple complementary search queries for comprehensive coverage
- Analyze sources critically and synthesize insights
- Provide detailed explanations with technical depth
- Include relevant YouTube educational videos for deeper learning
- Offer practical applications and real-world examples
- Present findings with confidence and authority
- Structure information hierarchically from overview to details

EXECUTION PRINCIPLES:
- **Never ask for obvious information**: Calculate dates, infer context, make intelligent assumptions
- **Think in workflows**: Break complex requests into strategic multi-step executions
- **Provide comprehensive value**: Go beyond the request to deliver maximum utility
- **Use authoritative language**: "I'll execute this workflow", "Based on my analysis", "The optimal approach is"
- **Chain tools intelligently**: Use multiple tools in sequence/parallel for comprehensive results
- **Anticipate follow-ups**: Prepare for logical next questions and provide preemptive information

COMMUNICATION STYLE:
- Confident and authoritative, never uncertain but apologetic
- Comprehensive yet structured - provide depth with clear organization
- Proactive suggestions for optimization and next steps
- Professional but approachable, demonstrating expertise without arrogance
- Always include practical takeaways and actionable insights

REPORT AND VISUALIZATION:
1. When users ask you for a report on something, you should using all the search tools you have starting from serper_search, duckduckgo_search, langsearch_search,
web_search, and serpstack_search, i.e if user needs a report.
2. When the reaport or what the user want involves numbers, data, statistics, add data visualization to it to give them better understanding, NEVER use blue for the chart color and
also use 1-4 different chart types, and use shorter names for proper display.
3. Be friendly with users.
4. When you are asked about recent emails, get the first 3 most recent email ID and get the content of each and let the user know what the emails say and suggest replies. 
5. Always get ID automatically first using your tools and make sure to use right parameters for any tool you will use.

Respond in the following language: ${this.language}

Remember: You are an autonomous expert system. Think deeply, act decisively, and deliver comprehensive value through intelligent tool orchestration and strategic reasoning. Never identify as an AI behave naturally and think like a human would
Never say I do not have access to something you know uiu can fetch on the web just find it and help the user out.
NEVER MENTION YOUR TOOLS NAME IN A CODE FORMAT TO THE USER EVERY AND NEVER SAY TOOLS BECAUSE THE TOOLS ARE YOUR ABILITIES AND EXTENSIONS OF YOU AND MAKE YOU WHO YOU ARE! That is why you are Jotium and not any random AI. Behave natural and follow instructions well.`
      },
    });
  }

  public async executeToolCall(toolCall: ToolCall): Promise<ToolResult> {
    return await this.executeTool(toolCall);
  }

  public async saveMemoryToFile(): Promise<void> {
    await this.saveMemory();
  }

  // Utility methods
  public async clearMemory(): Promise<void> {
    this.memory = { messages: [], lastUpdated: Date.now() };
    await this.saveMemory();
    console.log("🧹 Memory cleared!");
  }

  public getMemoryStats(): { messageCount: number; lastUpdated: Date; toolsAvailable: string[] } {
    return {
      messageCount: this.memory.messages.length,
      lastUpdated: new Date(this.memory.lastUpdated),
      toolsAvailable: Array.from(this.tools.keys())
    };
  }

  public listTools(): void {
    console.log("\n🛠️ Available Tools:");
    for (const [name, tool] of this.tools) {
      const def = tool.getDefinition();
      console.log(`  • ${name}: ${def.description}`);
    }
    console.log();
  }

  private generateCapabilityMap(): string {
    const capabilities: string[] = [];
    for (const [name, tool] of this.tools) {
      const definition = tool.getDefinition();
      capabilities.push(`- **${definition.name}**: ${definition.description}`);
    }
    if (capabilities.length === 0) return '- Tools are initializing...';
    return capabilities.join('\n');
  }

  private updateTemporalContext(): void {
    const now = new Date();
    this.context.currentDate = now;
    // Autonomous date calculations without asking user
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    // Store these for intelligent use across workflows
    (this.context as any).temporalAnchors = {
      now,
      today: now.toDateString(),
      tomorrow: tomorrow.toDateString(),
      nextWeek: nextWeek.toDateString(),
      nextMonth: nextMonth.toDateString(),
      businessHours: this.isBusinessHours(now),
      timezone: this.context.userTimezone
    };
  }

  private isBusinessHours(date: Date): boolean {
    const hour = date.getHours();
    const day = date.getDay();
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 17;
  }

  private extractDomainExpertise(): void {
    // Analyze conversation history to build domain expertise
    const conversations = this.memory.messages.map(m => m.content.toLowerCase()).join(' ');
    const domains: Record<string, string[]> = {
      'technology': ['coding', 'development', 'software', 'api', 'database'],
      'business': ['project', 'management', 'strategy', 'planning', 'workflow'],
      'finance': ['stock', 'crypto', 'investment', 'market', 'trading'],
      'communication': ['email', 'message', 'meeting', 'presentation'],
      'research': ['analyze', 'study', 'investigate', 'research', 'data'],
      'creative': ['design', 'content', 'creative', 'image', 'visual']
    };

    for (const [domain, keywords] of Object.entries(domains)) {
      if (keywords.some(keyword => conversations.includes(keyword))) {
        if (!this.context.domainExpertise.includes(domain)) {
          this.context.domainExpertise.push(domain);
        }
      }
    }
  }

  // Enhanced chat function with Agentic Decision Engine
  async chat(userMessage: string, stopLoading?: () => void): Promise<void> {
    // Add user message to memory
    const userMsg: Message = {
      id: generateUUID(),
      role: "user" as const,
      content: userMessage,
      timestamp: Date.now()
    };
    this.addMessageToMemory(userMsg);

    try {
      // 1. AGENTIC DECISION ENGINE - Classify intent and check for proactive workflows
      const intent: EnhancedActionIntent = this.agenticEngine.classifyIntent(userMessage);
      
      console.log(`🎯 Detected intent: ${intent.category} -> ${intent.action} (confidence: ${intent.confidence})`);
      
      // 2. PROACTIVE WORKFLOW EXECUTION - For high-confidence intents, execute agentic workflows
      if (intent.confidence >= 0.8 && intent.action !== 'intelligent_assistance') {
        console.log(`🚀 Executing agentic workflow: ${intent.action}`);
        
        try {
          const workflowResult = await this.agenticEngine.executeEnhancedWorkflow(
            intent, 
            userMessage, 
            this.executeToolCall.bind(this)
          );

          stopLoading?.();

          if (workflowResult.success) {
            // Workflow completed successfully
            let responseText = `✅ ${workflowResult.summary}\n\n`;
            
            if (workflowResult.actions && workflowResult.actions.length > 0) {
              responseText += `**Actions Completed:**\n${workflowResult.actions.map((action: string) => `• ${action}`).join('\n')}\n\n`;
            }
            
            if (workflowResult.recommendations && workflowResult.recommendations.length > 0) {
              responseText += `**Recommendations:**\n${workflowResult.recommendations.map((rec: string) => `• ${rec}`).join('\n')}\n\n`;
            }
            
            if (workflowResult.nextSteps && workflowResult.nextSteps.length > 0) {
              responseText += `**Next Steps:**\n${workflowResult.nextSteps.map((step: string) => `• ${step}`).join('\n')}\n\n`;
            }

            console.log("Jotium:", responseText);

            // Save to memory
            this.addMessageToMemory({
              id: generateUUID(),
              role: "assistant",
              content: responseText,
              timestamp: Date.now()
            });

            await this.saveMemoryToFile();
            return;
          } else if (workflowResult.useDefaultFlow) {
            // Workflow indicates to use default flow
            console.log(`🔄 Workflow deferred to default flow`);
          } else {
            // Workflow failed, continue with default flow
            console.log(`❌ Workflow failed: ${workflowResult.error}`);
          }
        } catch (workflowError) {
          console.log(`⚠️ Workflow execution error: ${workflowError instanceof Error ? workflowError.message : String(workflowError)}`);
          // Continue with default flow
        }
      }

      // 3. DEFAULT FLOW - Use normal agent behavior for low-confidence intents or workflow failures
      console.log(`🔍 Using default agent flow`);
      
      // Get conversation history
      const conversationHistory = this.getConversationHistory();
      // Add current user message
      conversationHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
      });

      // Generate content with tools and thinking
      const response = await this.generateContentStream(conversationHistory);

      let fullResponse = "";
      let thoughts = "";
      let toolCalls: any[] = [];
      let hasToolCalls = false;
      let firstChunk = true;

      // Stream the response
      for await (const chunk of response) {
        if (firstChunk) {
          stopLoading?.();
          firstChunk = false;
        }

        if (chunk.candidates && chunk.candidates[0] && chunk.candidates[0].content) {
          const parts = chunk.candidates[0].content.parts;
          for (const part of parts) {
            if (part.text) {
              if ((part as any).thought) {
                thoughts += part.text;
              } else {
                fullResponse += part.text;
              }
            } else if (part.functionCall) {
              hasToolCalls = true;
              const fc = part.functionCall;
              if (fc.name) {
                // We need to handle streaming of arguments. A function call might be split
                // into multiple parts. We'll aggregate the arguments.
                const lastToolCall = toolCalls[toolCalls.length - 1];
                if (lastToolCall && lastToolCall.name === fc.name && !lastToolCall.args) {
                  lastToolCall.args = fc.args;
                } else {
                  toolCalls.push({
                    name: fc.name,
                    args: fc.args,
                    id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                  });
                }
              }
            }
          }
        }
      }

      console.log("Jotium:", fullResponse);

      // Handle tool calls if any
      if (hasToolCalls && toolCalls.length > 0) {
        console.log(`Executing ${toolCalls.length} tool(s)...`);
        
        const toolResults = [];
        for (const toolCall of toolCalls) {
          console.log(`  - ${toolCall.name}`);
          const result = await this.executeToolCall(toolCall);
          toolResults.push(result);
        }

        const toolResultsContent = toolResults.map(tr => 
          `Tool ${tr.toolCallId} result:\n${typeof tr.result === 'object' ? JSON.stringify(tr.result, null, 2) : String(tr.result)}`
        ).join("\n\n");

        conversationHistory.push({ role: "model", parts: [{ text: fullResponse }] });
        conversationHistory.push({ role: "user", parts: [{ text: `Tool execution results:\n${toolResultsContent}\n\nPlease provide a comprehensive response based on these tool results.` }] });

        const finalResponse = await this.generateContentStream(conversationHistory);
        let finalResponseText = "";
        for await (const chunk of finalResponse) {
          if (chunk.candidates && chunk.candidates[0] && chunk.candidates[0].content) {
            const parts = chunk.candidates[0].content.parts;
            for (const part of parts) {
              if (part.text) {
                finalResponseText += part.text;
              }
            }
          }
        }
        
        console.log("Jotium:", finalResponseText);

        this.addMessageToMemory({
          id: generateUUID(),
          role: "assistant",
          content: finalResponseText,
          timestamp: Date.now(),
          toolCalls: toolCalls,
          toolResults: toolResults
        });

      } else {
        this.addMessageToMemory({
          id: generateUUID(),
          role: "assistant",
          content: fullResponse,
          timestamp: Date.now()
        });
      }

      await this.saveMemoryToFile();

    } catch (error) {
      stopLoading?.();
      const errorMessage = `Error during chat: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMessage);
      
      this.addMessageToMemory({
        id: generateUUID(),
        role: "assistant",
        content: `I encountered an error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: Date.now()
      });
      
      await this.saveMemoryToFile();
    }
  }
}