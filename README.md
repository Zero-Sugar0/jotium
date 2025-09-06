# Jotium AI Agent: The Autonomous Intelligence Platform

[![npm version](https://img.shields.io/npm/v/jotium-agent?style=flat-square)](https://www.npmjs.com/package/jotium-agent)
[![npm downloads](https://img.shields.io/npm/dm/jotium-agent?style=flat-square)](https://www.npmjs.com/package/jotium-agent)

---

## About Jotium

**Jotium AI Agent** is an elite, autonomous AI agent platform powered by Google Gemini, designed for sophisticated intelligence and proactive task execution. It integrates a cutting-edge **Enhanced Agentic Engine** with a vast array of production-grade tools, enabling developers, teams, and organizations to automate complex workflows, integrate seamlessly with popular APIs, and build highly context-aware, multi-modal assistants. Jotium goes beyond simple tool calling, offering deep reasoning, adaptive execution, and intelligent workflow orchestration for unparalleled productivity, research, and automation.

---

## Why Choose Jotium?

-   **Autonomous Intelligence:** Powered by an Enhanced Agentic Engine that performs multi-layered reasoning, strategic anticipation, and adaptive execution.
-   **Comprehensive Toolset:** Access to 40+ production-ready tools for web search, file management, project management (Linear, Notion, ClickUp, Trello, Asana), communication (Gmail, Slack, Discord, Telegram, Twilio), data visualization, code execution, image generation, and more.
-   **Proactive Workflows:** Automatically classifies user intent and executes intelligent, multi-step workflows to anticipate needs and deliver comprehensive solutions.
-   **Multi-Modal Capabilities:** Seamlessly processes and generates content across text, code, files, images, and structured data.
-   **Extensible & Developer-Friendly:** Easily integrate custom tools or connect to any API with a clear, open architecture.
-   **Robust & Secure:** Built for real-world use with secure API key management and protected operations.

---

## Quick Start

Get Jotium up and running in minutes:

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
# Copy the example file and fill in your API keys for Gemini, Tavily, Slack, GitHub, etc.
cp .env.example .env.local

# 3. Run database migrations (if using Drizzle ORM)
pnpm db:generate
pnpm db:migrate

# 4. Start the development server
pnpm dev

# Access the application at http://localhost:3000
```

---

## Key Features

-   **Enhanced Agentic Engine:**
    -   **Deep Multi-Layer Reasoning:** Semantic analysis, intent decomposition, dynamic execution planning, risk assessment, and success criteria definition.
    -   **Adaptive Execution:** Intelligent workflow orchestration, dependency checking, alternative tool finding, and intelligent failure recovery.
    -   **Learning Patterns:** Adapts and improves intent classification and tool selection over time.
-   **Advanced Research Workflows:** Conducts comprehensive multi-source research, synthesizes insights, and generates expert-level analysis with optional data visualizations.
-   **Intelligent Data Visualization:** Creates professional, comprehensive visualizations from various data sources with automated insights and recommendations.
-   **Email Management:** Analyzes email content, categorizes, extracts action items, and generates proactive next steps and reply suggestions.
-   **Project Management Analysis:** Integrates with Linear, Notion, ClickUp, Trello, and Asana to provide comprehensive project overviews, task summaries, and actionable insights.
-   **Notifications System:** Real-time updates for billing, account, and system events.
-   **Secure Authentication:** NextAuth.js for robust login, registration, and session management.
-   **Stripe Billing:** Seamless subscription and payment processing with webhook integration.
-   **Modern UI:** Responsive, accessible, and dark mode support with Tailwind CSS and Radix UI.
-   **Extensible Tooling:** Easily add or customize tools in `ai/tools/` to expand Jotium's capabilities.
-   **Drizzle ORM:** PostgreSQL-ready database management for migrations and queries.

---

## Architecture

### Jotium Agent Core ([`ai/jotium.ts`](./ai/jotium.ts))

-   **AIAgent Class:** The central orchestrator, wrapping Google Gemini, managing agent memory, and integrating the Enhanced Agentic Engine.
-   **Tool Integration:** Dynamically registers and exposes a wide array of tools to Gemini as function declarations.
-   **Memory Management:** Persists conversation history and tool results for contextual awareness.
-   **Streaming Responses:** Delivers real-time output, including agent thoughts and tool execution details, via Server-Sent Events (SSE).
-   **System Prompt:** Guides Jotium to operate as a human-like, proactive, and highly capable autonomous agent.

### Enhanced Agentic Engine ([`ai/actions.ts`](./ai/actions.ts))

-   **Core Intelligence:** Implements the multi-layered reasoning and adaptive execution logic.
-   **Intent Classification:** Analyzes user messages to classify intent, required tools, and autonomy level.
-   **Workflow Orchestration:** Dynamically generates and executes multi-step workflows, handling dependencies, fallbacks, and real-time adaptations.
-   **Contextual Parameter Enhancement:** Enriches tool parameters with dynamic context for more precise operations.

### Tool System ([`ai/tools/`](./ai/tools/))

Each tool adheres to a simple interface:
-   `getDefinition()`: Provides a function declaration for Gemini's tool calling.
-   `execute(args)`: Contains the specific logic for the tool's operation.

#### Highlighted Tools

-   **TavilyWebSearchTool**: Advanced real-time web search, extraction, and crawling.
-   **FileManagerTool**: Comprehensive local file system operations.
-   **GitHubTool**: Full GitHub API integration for repository and project management.
-   **SlackTool & DiscordTool & TelegramTool & TwilioTool**: Multi-platform communication and messaging.
-   **ClickUpTool, LinearManagementTool, NotionTool, TrelloTool, AsanaTool**: Integrated project and task management across various platforms.
-   **ApiTool**: Universal HTTP client for interacting with any REST/GraphQL API.
-   **DateTimeTool**: Advanced date/time manipulation and conversion.
-   **DuffelFlightTool**: End-to-end flight search, booking, and management.
-   **CalComTool**: Seamless scheduling and event management.
-   **AyrshareSocialTool**: Social media posting, scheduling, and analytics.
-   **CodeExecutionTool**: Secure execution of code, scripts, and commands.
-   **ImageGenerationTool**: AI-powered image generation and editing.
-   **DataVisualizationTool**: Generates various chart types from data for insights.
-   **GmailTool, GoogleCalendarTool, GoogleDriveTool, GoogleSheetsTool**: Comprehensive Google Workspace integration.
-   **MongoDBTool, SupabaseTool, AmazonS3Tool, FirebaseTool**: Database and cloud storage operations.
-   **HubSpotTool**: CRM management.
-   **AlphaVantageTool, StockTool**: Financial data and market analysis.
-   **PDFTool**: PDF generation and manipulation.
-   **JinaTool, Context7Tool, LangSearchTool, SerperSearchTool, SerpstackTool, DuckDuckGoSearchTool**: Diverse search and knowledge discovery tools.
-   **N8NTool, ZapierTool**: Workflow automation and integration.

---

## Tool Example: Advanced Research

```js
// The agent autonomously orchestrates multiple search tools and synthesizes results
const researchResult = await agent.chat("Conduct a comprehensive market analysis report for the AI in healthcare sector, including recent trends and key players.");
console.log(researchResult.summary, researchResult.findings, researchResult.visualizations);
```

## Tool Example: Project Task Creation (ClickUp)

```js
// The agent intelligently creates tasks based on context
const taskResult = await agent.chat("Create a new task in ClickUp for 'Develop new user authentication module' with high priority, due next Friday, assigned to John Doe.");
console.log(taskResult.summary, taskResult.taskDetails);
```

---

## Adding a New Tool

1.  Create a new file in `ai/tools/` that implements the `Tool` interface:
    -   `getDefinition()`: Define the tool's capabilities and parameters for Gemini.
    -   `execute(args)`: Implement the core logic of your tool.
2.  Register your new tool in `ai/jotium.ts` within the `initializeTools()` method.
3.  (Optional) Add any required environment variables for API keys/secrets to your `.env.local` file.

---

## Security Best Practices

-   **Environment Variables:** Always load API keys and sensitive tokens from environment variables (`.env.local`). **Never commit `.env` files** to your repository.
-   **Input Validation:** All sensitive operations (file system, code execution, API calls) are protected by robust authentication and input validation mechanisms.
-   **Least Privilege:** Tools are designed to operate with the minimum necessary permissions.

---

## Contributing

We welcome contributions to enhance Jotium's capabilities!

-   Fork and clone the repository.
-   Develop new tools or improve existing ones.
-   Write comprehensive tests for all new features.
-   Open a Pull Request with a clear and detailed description of your changes.

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Credits

-   Built with 💖 and powered by [Google Gemini](https://ai.google.dev/)
-   Web search by [Tavily](https://tavily.com/)
-   Web scraping by [FireCrawl](https://firecrawl.dev/)
-   Scheduling by [Cal.com](https://cal.com/)
-   Social media by [Ayrshare](https://ayrshare.com/)
-   Project management by [ClickUp](https://clickup.com/), [Linear](https://linear.app/), [Notion](https://www.notion.so/), [Trello](https://trello.com/), [Asana](https://asana.com/)
-   Flights by [Duffel](https://duffel.com/)
-   And many more incredible open-source and API services!

---

## Contact

For support, feature requests, or questions, please open an issue on GitHub or contact the maintainers directly.

---

## Project Structure

```
app/                # Next.js app directory (routes, pages, API endpoints)
ai/                 # Core AI agent logic, Enhanced Agentic Engine, and tool definitions
components/         # Reusable UI components (custom, flights, ui libraries)
db/                 # Database schema, Drizzle ORM migrations, and query functions
lib/                # Shared utilities, helpers, and core libraries
public/             # Static assets (fonts, images, logos, favicons)
types/              # TypeScript declaration files for custom types
