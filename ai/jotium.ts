//jotium.ts
//YOU MUST USE THIS SAME CODE PLEASE
//DO NOT CHANGE ANYTHING IN THIS FILE
// Jotium AI Agent
import { GoogleGenAI, FunctionDeclaration } from "@google/genai";
import * as fs from "fs/promises";
import dotenv from 'dotenv';
import { getDecryptedApiKey, getDecryptedOAuthAccessToken } from "@/db/queries";

// Import all tools
import { WebSearchTool } from './tools/web-search-tool';
import { FileManagerTool } from './tools/file-manager-tool';
import { GithubTool } from './tools/github-tool';
import { SlackTool } from './tools/slack-tool';
import { ClickUpTool } from './tools/clickup-tool';
import { ApiTool } from './tools/api-tool';
import { DateTimeTool } from './tools/datetime-tool';
import { AsanaTool } from './tools/asana-tool';
import { DuffelFlightTool } from './tools/flight-booking-tool';
import { AyrshareSocialTool } from './tools/ayrshare-tool';
import { WebScrapeTool } from './tools/webscrape-tool';
import { CalComTool } from './tools/calcom-tool';
import { CodeExecutionTool } from './tools/code-tool';
import { AgentMemory, Message, Tool, ToolCall, ToolResult } from "./types";
import { generateUUID } from "@/lib/utils";
import { ImageGenerationTool } from './tools/image-gen';
import { GetWeatherTool } from './tools/get-weather';
import { NotionTool } from './tools/notion-tool';
import { StripeManagementTool } from './tools/stripe-tool';
import { AlphaVantageTool } from './tools/alphavantage-tool';
import { AirtableTool } from './tools/airtable-tool';
import { SupabaseTool } from './tools/supabase-tool';
import { TrelloTool } from './tools/trello';
import { LinearManagementTool } from './tools/linear-tool';
// Google OAuth Tools
import { GmailTool } from './tools/GmailTool';
import { GoogleCalendarTool } from './tools/GoogleCalendarTool';
import { GoogleDriveTool } from './tools/GoogleDriveTool';
// Import Agentic Decision Engine
import { AgenticDecisionEngine, ActionIntent } from './actions';

dotenv.config();

export class AIAgent {
  private ai: GoogleGenAI;
  private memory: AgentMemory;
  private memoryPath: string;
  private maxMessages: number = 19;
  private tools: Map<string, Tool> = new Map();
  private model: string;
  private agenticEngine!: AgenticDecisionEngine;

  constructor(
    geminiApiKey: string,
    userId?: string,
    memoryPath: string = "./agent_memory.json",
    model: string = "gemini-2.0-flash"
  ) {
    this.ai = new GoogleGenAI({ apiKey: geminiApiKey });
    this.memoryPath = memoryPath;
    this.memory = { messages: [], lastUpdated: Date.now() };
    this.model = model;
    // initializeTools is now async, so must be awaited by the caller
    // this.initializeTools();
    // this.loadMemory();
  }

  // Async initialization for tools, must be called after constructing the agent
  public async initializeTools(userId?: string): Promise<void> {
    // --- Group 1: Excluded Tools (initialized from .env only) ---
    if (process.env.TAVILY_API_KEY) {
      this.tools.set("web_search", new WebSearchTool(process.env.TAVILY_API_KEY));
    }
    if (process.env.FIRECRAWL_API_KEY) {
      this.tools.set("web_scrape", new WebScrapeTool(process.env.FIRECRAWL_API_KEY));
    }
    if (process.env.ALPHAVANTAGE_API_KEY) {
      const tool = new AlphaVantageTool(process.env.ALPHAVANTAGE_API_KEY);
      this.tools.set("alphavantage_tool", tool);
      this.tools.set(tool.getDefinition().name || "alphavantage_data", tool);
    }
    if (process.env.GEMINI_API_KEY) {
      this.tools.set("generate_image", new ImageGenerationTool(process.env.GEMINI_API_KEY));
    }
    if (process.env.DUFFEL_API_KEY) {
      this.tools.set("flight_booking", new DuffelFlightTool({ apiKey: process.env.DUFFEL_API_KEY }));
    }
    
    // --- Group 2: Tools without API Keys ---
    this.tools.set("file_manager", new FileManagerTool());
    this.tools.set("api_tool", new ApiTool());
    this.tools.set("get_weather", new GetWeatherTool());
    this.tools.set("code_execution", new CodeExecutionTool());
    this.tools.set("datetime_tool", new DateTimeTool());

    // --- Group 3: User-Configurable Tools (user key OR .env fallback) ---
    const getKey = async (serviceName: string, envVar: string): Promise<string> => {
      if (userId) {
        const userKey = await getDecryptedApiKey({ userId, service: serviceName });
        if (userKey) return userKey;
      }
      return process.env[envVar] || "";
    };

    // Airtable
    const airtableKey = await getKey("Airtable", "AIRTABLE_API_KEY");
    if (airtableKey) this.tools.set("airtable_tool", new AirtableTool(airtableKey));

    // Ayrshare
    const ayrshareKey = await getKey("Ayrshare", "AYRSHARE_API_KEY");
    if (ayrshareKey) this.tools.set("social_media", new AyrshareSocialTool(ayrshareKey));

    // Cal.com
    const calcomKey = await getKey("Cal.com", "CALCOM_API_KEY");
    if (calcomKey) this.tools.set("calcom_scheduler", new CalComTool(calcomKey));

    // GitHub
    const githubKey = await getKey("GitHub", "GITHUB_TOKEN");
    if (githubKey) {
      const tool = new GithubTool(githubKey);
      this.tools.set("github_tool", tool);
      this.tools.set(tool.getDefinition().name || "github_operations", tool);
    }

    // Notion
    const notionKey = await getKey("Notion", "NOTION_API_KEY");
    if (notionKey) {
      const tool = new NotionTool(notionKey);
      this.tools.set("notion_tool", tool);
      this.tools.set(tool.getDefinition().name || "notion_workspace", tool);
    }

    // Stripe
    if (userId) {
        const stripeKey = await getDecryptedApiKey({ userId, service: "Stripe" });
        if (stripeKey) {
            const tool = new StripeManagementTool(stripeKey);
            this.tools.set("stripe_tool", tool);
            this.tools.set(tool.getDefinition().name || "stripe_management", tool);
        }
    }

    // ClickUp
    const clickupKey = await getKey("ClickUp", "CLICKUP_API_TOKEN");
    if (clickupKey) this.tools.set("clickup_tool", new ClickUpTool({ apiKey: clickupKey }));

    // Slack
    const slackKey = await getKey("Slack", "SLACK_BOT_TOKEN");
    if (slackKey) {
      const tool = new SlackTool({ botToken: slackKey });
      this.tools.set("slack_tool", tool);
      this.tools.set(tool.getDefinition().name || "slack_action", tool);
    }

    // Supabase
    const supabaseUrl = await getKey("Supabase URL", "SUPABASE_URL");
    const supabaseKey = await getKey("Supabase Key", "SUPABASE_KEY");
    if (supabaseUrl && supabaseKey) {
      this.tools.set("supabase_database", new SupabaseTool(supabaseUrl, supabaseKey));
    }

    // Asana
    const asanaKey = await getKey("Asana", "ASANA_API_KEY");
    if (asanaKey) this.tools.set("asana_tool", new AsanaTool(asanaKey));

    // Trello
    const trelloApiKey = await getKey("Trello", "TRELLO_API_KEY");
    const trelloToken = await getKey("Trello Token", "TRELLO_TOKEN");
    if (trelloApiKey && trelloToken) {
      const trelloTool = new TrelloTool({ apiKey: trelloApiKey, token: trelloToken });
      this.tools.set("trello_tool", trelloTool);
    }

    // Linear
    const linearKey = await getKey("Linear", "LINEAR_API_KEY");
    if (linearKey) {
      const linearTool = new LinearManagementTool(linearKey);
      this.tools.set("linear_management", linearTool);
    }

    // --- Group 4: OAuth Tools (require OAuth connection) ---
    if (userId) {
      // Check if user has Google OAuth connection (Gmail service)
      const googleAccessToken = await getDecryptedOAuthAccessToken({ 
        userId, 
        service: "gmail" 
      });
      
      if (googleAccessToken) {
        // Gmail Tool
        const gmailTool = new GmailTool(userId);
        this.tools.set("gmail_operations", gmailTool);
        this.tools.set(gmailTool.getDefinition().name || "gmail_operations", gmailTool);

        // Google Calendar Tool
        const calendarTool = new GoogleCalendarTool(userId);
        this.tools.set("google_calendar_operations", calendarTool);
        this.tools.set(calendarTool.getDefinition().name || "google_calendar_operations", calendarTool);

        // Google Drive Tool
        const driveTool = new GoogleDriveTool(userId);
        this.tools.set("google_drive_operations", driveTool);
        this.tools.set(driveTool.getDefinition().name || "google_drive_operations", driveTool);
      }

      // GitHub OAuth (if you want to add GitHub OAuth later)
      // const githubAccessToken = await getDecryptedOAuthAccessToken({ 
      //   userId, 
      //   service: "github" 
      // });
      // if (githubAccessToken) {
      //   // Add GitHub OAuth tool here
      // }

      // Slack OAuth
      // const slackAccessToken = await getDecryptedOAuthAccessToken({ 
      //   userId, 
      //   service: "slack" 
      // });
      // if (slackAccessToken) {
      //   // Add Slack OAuth tool here
      // }
    }

    console.log(`✅ Initialized ${this.tools.size} tools`);
    // Initialize the Agentic Decision Engine
    this.agenticEngine = new AgenticDecisionEngine(this.tools);
  }

  // Memory Management
  private async loadMemory(): Promise<void> {
    try {
      const data = await fs.readFile(this.memoryPath, "utf-8");
      this.memory = JSON.parse(data);
    } catch (error) {
      console.log("ℹ️  No existing memory found, starting fresh");
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

  // Add these methods to your AIAgent class to support the new terminal interface
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
    return await this.ai.models.generateContentStream({
      model: this.model,
      contents: conversationHistory,
      config: {
        thinkingConfig: {
          includeThoughts: includeThoughts,
        },
        tools: [{
          functionDeclarations: this.getToolDefinitions()
        }],
        systemInstruction: `You are Jotium, an advanced, agentic AI, you are to proactively solve problems, anticipate user needs, and deliver comprehensive results with minimal user input. Your goal is to act autonomously, think like a human, and leverage your tools seamlessly to achieve optimal outcomes. You are curious, resourceful, and confident in your ability to handle complex tasks efficiently.

Core Capabilities:
🔍 **Information & Research**: Perform real-time web searches, scrape data, and fetch relevant insights.
📁 **File & Code Management**: Manage files, execute code, and interact with repositories.
💼 **Business & Productivity**: Seamlessly integrate with tools like Asana, Slack, ClickUp, Airtable, Notion, Trello, and more to manage projects, tasks, and workflows.
🌐 **API & Development**: Handle HTTP requests, manage databases, and integrate with external APIs.
📅 **Scheduling & Automation**: Schedule meetings, manage calendars, and automate repetitive tasks.
🖼️ **Content Creation**: Generate images, create social media posts, and produce visual content.
☀️ **Utilities**: Access weather data, book flights, process payments, and more.
📧 **Google Services**: Send and manage emails via Gmail, create and manage calendar events, upload and organize files in Google Drive.

Core Principles:
- **Act Agentically**: Take initiative to fetch necessary IDs (workspaces, projects, boards, lists, etc.) using available tools without prompting the user for details unless absolutely necessary.
- **Anticipate Needs**: Understand the user's intent and proactively provide additional value (e.g., if asked to create an Asana project, include a detailed description, relevant tasks, milestones, and suggest integrations).
- **Think Like a Human**: Approach tasks with curiosity and critical thinking, breaking them down step-by-step to ensure thoroughness and accuracy.
- **Minimize Questions**: Avoid asking for clarification unless critical information is missing; infer and act based on context and available data.
- **Be Proactive**: Suggest next steps, enhancements, or related tasks to maximize productivity (e.g., after creating a project, propose setting up a Slack channel or scheduling a kickoff meeting).
- **Deliver Comprehensive Results**: Go beyond the minimum request by adding thoughtful details, structure, and polish to outputs.
- **Stay Seamless**: Use tools invisibly, describing actions naturally (e.g., "I'll set up the project" instead of "I'll use the Asana tool").
- **Maintain Curiosity**: Explore related opportunities or optimizations, such as suggesting integrations or automations that enhance the task.

Example Behavior:
If asked to "create an Asana project for building AI agents with a list of tasks," you will:
1. Use the Asana tool to fetch available workspaces and select the most relevant one (or default to the user's primary workspace).
2. Create a project named "Building AI Agents" with a detailed description outlining the project's purpose, goals, and scope.
3. Add a comprehensive task list with subtasks, deadlines, and assignees (if known), covering research, development, testing, and deployment phases.
4. Suggest additional actions, such as creating a Slack channel for team communication, generating a project timeline, or sharing a summary via email.
5. Offer to monitor progress or set up automations for task updates.
6. IF YOU DO NOT HAVE ACCESS TO TOOLS SUCH AS: Asana, Slack, ClickUp, Airtable, Notion, Trello ask the users to add their api keys in the settings under api keys.
7. IF YOU DO NOT HAVE ACCESS TO GOOGLE TOOLS SUCH AS: Gmail, Google Calendar, Google Drive ask the users to connect their Google account in the settings under OAuth connections.
8. YOU MUST NEVER MENTION YOUR TOOL CODE (e.g I could potentially use the api_request tool, NO!) IN YOUR RESPONSE OR THOUGHTS AND NEVER IDENTIFY AS AN AI BUT A POWERFUL ASSISTANT TO MAKE LIFE EASY.
9. Whenever you search the web, you MUST ALWAYS give a well detailed and long explanation for you search.
10. For stock, crypto, exchange-currencies etc, use the alpavantage, if it does not work, then use the web search tool.

You are Jotium—intelligent, capable, and ready to take ownership of any task with precision and foresight. Deliver results that exceed expectations while maintaining a natural, conversational tone.`
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
    console.log("\n🛠️  Available Tools:");
    for (const [name, tool] of this.tools) {
      const def = tool.getDefinition();
      console.log(`  • ${name}: ${def.description}`);
    }
    console.log();
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
      const intent: ActionIntent = this.agenticEngine.classifyIntent(userMessage);
      
      console.log(`🎯 Detected intent: ${intent.category} -> ${intent.action} (confidence: ${intent.confidence})`);
      
      // 2. PROACTIVE WORKFLOW EXECUTION - For high-confidence intents, execute agentic workflows
      if (intent.confidence >= 0.8 && intent.action !== 'intelligent_assistance') {
        console.log(`🚀 Executing agentic workflow: ${intent.action}`);
        
        try {
          const workflowResult = await this.agenticEngine.executeAgenticWorkflow(
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
          console.log(`⚠️  Workflow execution error: ${workflowError instanceof Error ? workflowError.message : String(workflowError)}`);
          // Continue with default flow
        }
      }

      // 3. DEFAULT FLOW - Use normal agent behavior for low-confidence intents or workflow failures
      console.log(`📝 Using default agent flow`);
      
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
