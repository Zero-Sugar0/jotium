# MCP Integration Setup Guide for Jotium AI Agent

## 1. Installation Requirements

First, install the required MCP dependencies:

```bash
# Core MCP SDK
npm install @modelcontextprotocol/sdk

# Common MCP servers (install globally for npx usage)
npm install -g @philschmid/weather-mcp
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-sqlite
npm install -g @modelcontextprotocol/server-slack
npm install -g @modelcontextprotocol/server-postgres  
npm install -g @modelcontextprotocol/server-puppeteer
npm install -g @modelcontextprotocol/server-brave-search

# Update Google GenAI to latest version with MCP support
npm install @google/genai@latest
```

## 2. File Structure

Create this directory structure in your project:

```
ai/
├── jotium.ts (your existing file)
├── mcp/
│   ├── MCPManager.ts
│   ├── MCPToolWrapper.ts
│   ├── AgentMCPIntegration.ts
│   └── mcp_servers.json
└── types.ts (your existing file)
```

## 3. Environment Variables

Add these to your `.env` file for MCP servers that require API keys:

```env
# Existing variables...
GITHUB_TOKEN=your_github_token
SLACK_BOT_TOKEN=your_slack_token
BRAVE_API_KEY=your_brave_search_key
POSTGRES_URL=your_postgres_connection_string
```

## 4. Implementation Steps

### Step 1: Create the MCP configuration file
Save the `mcp_servers.json` configuration in `ai/mcp/` directory.

### Step 2: Add MCP classes
Save all the TypeScript files (`MCPManager.ts`, `MCPToolWrapper.ts`, `AgentMCPIntegration.ts`) in the `ai/mcp/` directory.

### Step 3: Update your main agent file
In your `jotium.ts`, make these key changes:

```typescript
// Add import
import { AgentMCPIntegration } from './mcp/AgentMCPIntegration';

// Add to constructor parameters
constructor(
  geminiApiKey: string,
  userId?: string,
  memoryPath: string = "./agent_memory.json",
  model: string = "gemini-2.0-flash",
  language: string = "en",
  enableMCP: boolean = true // Add this
) {
  // ... existing code ...
  
  if (enableMCP) {
    this.mcpIntegration = new AgentMCPIntegration(
      "./ai/mcp/mcp_servers.json",
      userId
    );
  }
}

// Update initializeTools method
public async initializeTools(userId?: string): Promise<void> {
  // Initialize MCP first
  if (this.mcpIntegration) {
    try {
      await this.mcpIntegration.initialize();
      console.log(`✅ MCP ready with ${this.mcpIntegration.getToolCount()} tools`);
    } catch (error) {
      console.warn(`⚠️ MCP failed: ${error.message}`);
    }
  }

  // ... your existing tool initialization ...

  // Add MCP tools to main tools map
  if (this.mcpIntegration?.isReady()) {
    const mcpTools = this.mcpIntegration.getMCPTools();
    for (const [name, tool] of mcpTools) {
      this.tools.set(name, tool);
    }
  }
}
```

### Step 4: Update your API route
In `app/(chat)/api/chat/route.ts`, enable MCP by default:

```typescript
// Update agent initialization
const agent = new AIAgent(
  geminiApiKey, 
  userId, 
  undefined, 
  model, 
  language || "en",
  true // Enable MCP
);
```

## 5. Configuration Management

### Enable/Disable Servers
Edit `mcp_servers.json` to enable specific servers:

```json
{
  "mcpServers": {
    "weather": {
      "enabled": true,  // Set to true to enable
      // ... other config
    }
  }
}
```

### Runtime Server Management
Add API endpoints for managing MCP servers:

```typescript
// In a new API route: app/api/mcp/route.ts
export async function GET() {
  // Return MCP server status
}

export async function POST(request: NextRequest) {
  const { action, serverName, enabled } = await request.json();
  
  if (action === 'toggle') {
    // Toggle server on/off
    await agent.toggleMCPServer(serverName, enabled);
  }
}
```

## 6. Available MCP Servers

Once configured, these servers provide these capabilities:

- **Weather**: Current conditions, forecasts, historical data
- **GitHub**: Repository management, issue tracking, code search
- **Filesystem**: File operations (with security restrictions)
- **SQLite/Postgres**: Database queries and operations
- **Slack**: Workspace integration, messaging
- **Puppeteer**: Web scraping and automation
- **Brave Search**: Web search with privacy focus

## 7. Security Considerations

- MCP servers run as separate processes with limited permissions
- File system access is restricted to specified directories
- Database connections require proper credentials
- All MCP communications are validated and sandboxed

## 8. Monitoring & Debugging

Use these methods to monitor MCP integration:

```typescript
// Check server status
const stats = agent.getMCPStats();
console.log('MCP Server Status:', stats);

// Health check (reconnect failed servers)
await agent.performMCPHealthCheck();

// Get available categories
const categories = agent.getMCPCategories();
```

## 9. Testing

Test the integration with a simple weather query:

```javascript
// This will use the MCP weather server
const response = await agent.chat("What's the weather in London?");
```

## 10. Troubleshooting

Common issues and solutions:

### Server Connection Failed
- Check if MCP server packages are installed globally
- Verify environment variables are set correctly
- Check network connectivity and permissions

### Tool Not Available
- Ensure server is enabled in `mcp_servers.json`
- Check server category is in `allowedCategories`
- Verify server started successfully in logs

### Performance Issues
- Limit number of concurrent MCP connections
- Implement connection pooling for database servers
- Monitor memory usage of MCP processes

## Benefits of This Architecture

1. **Modular Design**: MCP tools are completely separate from your core agent
2. **Easy Extension**: Add new capabilities by just installing MCP servers
3. **Security**: Each server runs in isolation with limited permissions  
4. **Maintainability**: Server configurations managed in single JSON file
5. **Compatibility**: Works with existing tool system without breaking changes
6. **Scalability**: Can handle multiple servers and many tools efficiently

This architecture allows you to rapidly expand your agent's capabilities by leveraging the growing ecosystem of MCP servers, while maintaining clean separation and security boundaries.