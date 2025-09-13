import { FunctionDeclaration, Type } from "@google/genai";

export class ZendeskTool {
  private subdomain: string;
  private email: string;
  private apiToken: string;
  private baseUrl: string;

  constructor(subdomain: string, email: string, apiToken: string) {
    this.subdomain = subdomain;
    this.email = email;
    this.apiToken = apiToken;
    this.baseUrl = `https://${subdomain}.zendesk.com/api/v2`;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "zendesk_management",
      description: "Comprehensive Zendesk help desk and customer support management tool. Handle tickets, users, organizations, and knowledge base operations with full CRUD capabilities. Perfect for customer service automation, support workflow management, ticket routing, SLA monitoring, and customer communication. Supports ticket lifecycle management from creation to resolution, user management, organization handling, knowledge base content management, and detailed reporting and analytics.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "Zendesk operation to perform. Options: 'create_ticket' (new support request), 'get_ticket' (retrieve ticket details), 'update_ticket' (modify existing ticket), 'list_tickets' (browse tickets with filters), 'add_comment' (reply to ticket), 'create_user' (new customer/agent), 'get_user' (user details), 'update_user' (modify user info), 'list_users' (browse users), 'create_organization' (new company), 'get_organization' (org details), 'list_organizations' (browse companies), 'search' (global search), 'get_ticket_metrics' (performance data), 'create_article' (knowledge base), 'get_satisfaction_ratings' (CSAT scores), 'setup_credentials' (configure authentication), 'get_current_user' (test connection), 'get_user_by_email' (find user by email), 'get_organization_by_name' (find org by name), 'list_ticket_fields' (get custom fields), 'get_assignable_agents' (list available agents), 'list_groups' (list support groups), 'bulk_create_tickets' (create multiple tickets), 'create_webhook' (setup webhooks), 'list_webhooks' (view webhooks), 'delete_webhook' (remove webhooks), 'list_sla_policies' (view SLA policies), 'get_sla_policy' (get SLA details), 'list_automations' (view automations), 'create_automation' (create automation), 'export_data' (export data)."
          },
          ticketId: {
            type: Type.NUMBER,
            description: "Unique ticket identifier for operations on specific tickets (required for get_ticket, update_ticket, add_comment, get_ticket_metrics). Example: 12345. Used to target specific support cases for updates, comments, or data retrieval."
          },
          userId: {
            type: Type.NUMBER,
            description: "Unique user identifier for user-specific operations (required for get_user, update_user). Example: 67890. Targets specific customers, agents, or admins for profile management and user operations."
          },
          organizationId: {
            type: Type.NUMBER,
            description: "Unique organization identifier for company-specific operations (required for get_organization). Example: 11223. Used to manage company accounts, organizational settings, and group operations."
          },
          subject: {
            type: Type.STRING,
            description: "Ticket subject line or title (required for create_ticket). Keep concise but descriptive. Examples: 'Login Issue - Account Locked', 'Billing Question - Invoice #12345', 'Feature Request - API Integration'. Helps with ticket routing and prioritization."
          },
          description: {
            type: Type.STRING,
            description: "Detailed ticket description or comment body (required for create_ticket, add_comment). Provide comprehensive information including steps to reproduce, error messages, user impact, and any relevant context. Supports markdown formatting for better readability."
          },
          priority: {
            type: Type.STRING,
            description: "Ticket priority level affecting SLA and routing. Options: 'low' (non-urgent issues), 'normal' (standard requests), 'high' (business impact), 'urgent' (critical system issues). Default: 'normal'. Choose based on business impact and customer tier."
          },
          status: {
            type: Type.STRING,
            description: "Ticket status for workflow management. Options: 'new' (unassigned), 'open' (assigned/in-progress), 'pending' (awaiting customer response), 'hold' (temporarily paused), 'solved' (resolved), 'closed' (final state). Use for ticket lifecycle management and reporting."
          },
          assigneeId: {
            type: Type.NUMBER,
            description: "Agent user ID for ticket assignment. Assigns responsibility for ticket resolution. Use for load balancing, specialization routing, or escalation workflows. Can be changed during ticket lifecycle for collaboration or escalation."
          },
          requesterId: {
            type: Type.NUMBER,
            description: "Customer user ID who submitted the request (for create_ticket). Links ticket to specific customer for history tracking, context, and communication. If not provided, will be inferred from requesterEmail if available."
          },
          requesterEmail: {
            type: Type.STRING,
            description: "Customer email address for ticket creation when user doesn't exist in Zendesk. Will create new user if needed. Format: 'customer@company.com'. Essential for customer communication and ticket attribution."
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Ticket tags for categorization and workflow automation. Examples: ['billing', 'urgent', 'api'], ['onboarding', 'enterprise'], ['bug', 'mobile-app']. Used for reporting, automation rules, and ticket organization. Keep tags consistent and meaningful."
          },
          customFields: {
            type: Type.OBJECT,
            description: "Custom field values for extended ticket data. Format: {'field_id': 'value'}. Examples: {'360000123456': 'iOS', '360000123457': '2.1.0'}. Used for product versions, categories, SLA tracking, and custom workflows. Field IDs are specific to your Zendesk instance."
          },
          name: {
            type: Type.STRING,
            description: "Full name for user creation (required for create_user). Examples: 'John Smith', 'Sarah Johnson'. Used for customer identification and professional communication in support interactions."
          },
          email: {
            type: Type.STRING,
            description: "Email address for user operations (required for create_user, user searches). Primary identifier and communication channel. Format: 'user@company.com'. Must be unique in Zendesk instance."
          },
          role: {
            type: Type.STRING,
            description: "User role defining permissions and access levels. Options: 'end-user' (customers), 'agent' (support staff), 'admin' (full access). Default: 'end-user'. Choose based on required access level and responsibilities."
          },
          organizationName: {
            type: Type.STRING,
            description: "Organization name for company creation (required for create_organization). Examples: 'Acme Corporation', 'TechStart Inc.'. Used for account management, user grouping, and business context in support interactions."
          },
          query: {
            type: Type.STRING,
            description: "Search query for global Zendesk search (required for search action). Supports advanced operators like 'status:open priority:high', 'type:ticket created>2024-01-01', 'requester:john@company.com'. Use for finding tickets, users, organizations across your instance."
          },
          limit: {
            type: Type.NUMBER,
            description: "Maximum number of results to return for list operations (default: 25, max: 100). Higher limits provide more comprehensive data but may impact performance. Use pagination for large datasets by combining with offset or cursor parameters."
          },
          sortBy: {
            type: Type.STRING,
            description: "Field to sort results by for list operations. Options vary by entity: tickets ('created_at', 'updated_at', 'priority', 'status'), users ('created_at', 'name', 'email'). Combine with sortOrder for precise result ordering."
          },
          sortOrder: {
            type: Type.STRING,
            description: "Sort direction for ordered results. Options: 'asc' (ascending/oldest first), 'desc' (descending/newest first). Default: 'desc'. Use 'asc' for chronological analysis, 'desc' for recent activity focus."
          },
          isPublic: {
            type: Type.BOOLEAN,
            description: "Comment visibility setting (for add_comment). When true, comment is visible to customers. When false, internal agent note only. Default: true. Use false for internal coordination, true for customer communication."
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const action = args.action;
      console.log(`🎫 Zendesk ${action}: ${args.ticketId || args.userId || args.organizationId || args.query || 'operation'}`);

      switch (action) {
        case 'create_ticket':
          return await this.createTicket(args);
        case 'get_ticket':
          return await this.getTicket(args);
        case 'update_ticket':
          return await this.updateTicket(args);
        case 'list_tickets':
          return await this.listTickets(args);
        case 'add_comment':
          return await this.addComment(args);
        case 'create_user':
          return await this.createUser(args);
        case 'get_user':
          return await this.getUser(args);
        case 'update_user':
          return await this.updateUser(args);
        case 'list_users':
          return await this.listUsers(args);
        case 'create_organization':
          return await this.createOrganization(args);
        case 'get_organization':
          return await this.getOrganization(args);
        case 'search':
          return await this.search(args);
        case 'get_ticket_metrics':
          return await this.getTicketMetrics(args);
        case 'create_article':
          return await this.createArticle(args);
        case 'get_satisfaction_ratings':
          return await this.getSatisfactionRatings(args);
        case 'list_organizations':
          return await this.listOrganizations(args);
        case 'setup_credentials':
          return await this.setupCredentials(args);
        case 'get_current_user':
          return await this.getCurrentUser(args);
        case 'get_user_by_email':
          return await this.getUserByEmail(args);
        case 'get_organization_by_name':
          return await this.getOrganizationByName(args);
        case 'list_ticket_fields':
          return await this.listTicketFields(args);
        case 'get_assignable_agents':
          return await this.getAssignableAgents(args);
        case 'list_groups':
          return await this.listGroups(args);
        case 'bulk_create_tickets':
          return await this.bulkCreateTickets(args);
        case 'create_webhook':
          return await this.createWebhook(args);
        case 'list_webhooks':
          return await this.listWebhooks(args);
        case 'delete_webhook':
          return await this.deleteWebhook(args);
        case 'list_sla_policies':
          return await this.listSlaPolicies(args);
        case 'get_sla_policy':
          return await this.getSlaPolicy(args);
        case 'list_automations':
          return await this.listAutomations(args);
        case 'create_automation':
          return await this.createAutomation(args);
        case 'export_data':
          return await this.exportData(args);
        default:
          throw new Error(`Unknown action: ${action}`);
      }

    } catch (error: unknown) {
      console.error("❌ Zendesk operation failed:", error);
      return {
        success: false,
        error: `Zendesk operation failed: ${error instanceof Error ? error.message : String(error)}`,
        action: args.action
      };
    }
  }

  private async createTicket(args: any): Promise<any> {
    if (!args.subject || !args.description) {
      throw new Error("Subject and description are required for create_ticket action");
    }

    const ticketData: any = {
      ticket: {
        subject: args.subject,
        comment: { body: args.description },
        priority: args.priority || 'normal',
        status: args.status || 'new'
      }
    };

    if (args.requesterId) ticketData.ticket.requester_id = args.requesterId;
    if (args.requesterEmail) ticketData.ticket.requester = { email: args.requesterEmail };
    if (args.assigneeId) ticketData.ticket.assignee_id = args.assigneeId;
    if (args.tags) ticketData.ticket.tags = args.tags;
    if (args.customFields) ticketData.ticket.custom_fields = Object.entries(args.customFields).map(([id, value]) => ({ id: parseInt(id), value }));

    const response = await this.makeRequest('POST', '/tickets.json', ticketData);
    
    return {
      success: true,
      action: 'create_ticket',
      ticket: response.ticket,
      ticketId: response.ticket.id,
      timestamp: new Date().toISOString()
    };
  }

  private async getTicket(args: any): Promise<any> {
    if (!args.ticketId) {
      throw new Error("ticketId is required for get_ticket action");
    }

    const response = await this.makeRequest('GET', `/tickets/${args.ticketId}.json`);
    
    return {
      success: true,
      action: 'get_ticket',
      ticket: response.ticket,
      timestamp: new Date().toISOString()
    };
  }

  private async updateTicket(args: any): Promise<any> {
    if (!args.ticketId) {
      throw new Error("ticketId is required for update_ticket action");
    }

    const updateData: any = { ticket: {} };

    if (args.subject) updateData.ticket.subject = args.subject;
    if (args.priority) updateData.ticket.priority = args.priority;
    if (args.status) updateData.ticket.status = args.status;
    if (args.assigneeId) updateData.ticket.assignee_id = args.assigneeId;
    if (args.tags) updateData.ticket.tags = args.tags;
    if (args.customFields) updateData.ticket.custom_fields = Object.entries(args.customFields).map(([id, value]) => ({ id: parseInt(id), value }));

    const response = await this.makeRequest('PUT', `/tickets/${args.ticketId}.json`, updateData);
    
    return {
      success: true,
      action: 'update_ticket',
      ticket: response.ticket,
      timestamp: new Date().toISOString()
    };
  }

  private async listTickets(args: any): Promise<any> {
    let url = '/tickets.json';
    const params = new URLSearchParams();

    if (args.limit) params.append('per_page', Math.min(args.limit, 100).toString());
    if (args.sortBy) params.append('sort_by', args.sortBy);
    if (args.sortOrder) params.append('sort_order', args.sortOrder);

    if (params.toString()) url += `?${params.toString()}`;

    const response = await this.makeRequest('GET', url);
    
    return {
      success: true,
      action: 'list_tickets',
      tickets: response.tickets,
      count: response.count,
      nextPage: response.next_page,
      timestamp: new Date().toISOString()
    };
  }

  private async addComment(args: any): Promise<any> {
    if (!args.ticketId || !args.description) {
      throw new Error("ticketId and description are required for add_comment action");
    }

    const commentData = {
      ticket: {
        comment: {
          body: args.description,
          public: args.isPublic !== undefined ? args.isPublic : true
        }
      }
    };

    const response = await this.makeRequest('PUT', `/tickets/${args.ticketId}.json`, commentData);
    
    return {
      success: true,
      action: 'add_comment',
      ticket: response.ticket,
      timestamp: new Date().toISOString()
    };
  }

  private async createUser(args: any): Promise<any> {
    if (!args.name || !args.email) {
      throw new Error("Name and email are required for create_user action");
    }

    const userData: any = {
      user: {
        name: args.name,
        email: args.email,
        role: args.role || 'end-user'
      }
    };

    if (args.organizationId) {
      userData.user.organization_id = args.organizationId;
    }

    const response = await this.makeRequest('POST', '/users.json', userData);
    
    return {
      success: true,
      action: 'create_user',
      user: response.user,
      userId: response.user.id,
      timestamp: new Date().toISOString()
    };
  }

  private async getUser(args: any): Promise<any> {
    if (!args.userId) {
      throw new Error("userId is required for get_user action");
    }

    const response = await this.makeRequest('GET', `/users/${args.userId}.json`);
    
    return {
      success: true,
      action: 'get_user',
      user: response.user,
      timestamp: new Date().toISOString()
    };
  }

  private async updateUser(args: any): Promise<any> {
    if (!args.userId) {
      throw new Error("userId is required for update_user action");
    }

    const updateData: any = { user: {} };

    if (args.name) updateData.user.name = args.name;
    if (args.email) updateData.user.email = args.email;
    if (args.role) updateData.user.role = args.role;
    if (args.organizationId) updateData.user.organization_id = args.organizationId;

    const response = await this.makeRequest('PUT', `/users/${args.userId}.json`, updateData);
    
    return {
      success: true,
      action: 'update_user',
      user: response.user,
      timestamp: new Date().toISOString()
    };
  }

  private async listUsers(args: any): Promise<any> {
    let url = '/users.json';
    const params = new URLSearchParams();

    if (args.limit) params.append('per_page', Math.min(args.limit, 100).toString());
    if (args.role) params.append('role', args.role);

    if (params.toString()) url += `?${params.toString()}`;

    const response = await this.makeRequest('GET', url);
    
    return {
      success: true,
      action: 'list_users',
      users: response.users,
      count: response.count,
      nextPage: response.next_page,
      timestamp: new Date().toISOString()
    };
  }

  private async createOrganization(args: any): Promise<any> {
    if (!args.organizationName) {
      throw new Error("organizationName is required for create_organization action");
    }

    const orgData = {
      organization: {
        name: args.organizationName
      }
    };

    const response = await this.makeRequest('POST', '/organizations.json', orgData);
    
    return {
      success: true,
      action: 'create_organization',
      organization: response.organization,
      organizationId: response.organization.id,
      timestamp: new Date().toISOString()
    };
  }

  private async getOrganization(args: any): Promise<any> {
    if (!args.organizationId) {
      throw new Error("organizationId is required for get_organization action");
    }

    const response = await this.makeRequest('GET', `/organizations/${args.organizationId}.json`);
    
    return {
      success: true,
      action: 'get_organization',
      organization: response.organization,
      timestamp: new Date().toISOString()
    };
  }

  private async search(args: any): Promise<any> {
    if (!args.query) {
      throw new Error("Query is required for search action");
    }

    const params = new URLSearchParams();
    params.append('query', args.query);
    if (args.limit) params.append('per_page', Math.min(args.limit, 100).toString());

    const response = await this.makeRequest('GET', `/search.json?${params.toString()}`);
    
    return {
      success: true,
      action: 'search',
      query: args.query,
      results: response.results,
      count: response.count,
      timestamp: new Date().toISOString()
    };
  }

  private async getTicketMetrics(args: any): Promise<any> {
    if (!args.ticketId) {
      throw new Error("ticketId is required for get_ticket_metrics action");
    }

    const response = await this.makeRequest('GET', `/tickets/${args.ticketId}/metrics.json`);
    
    return {
      success: true,
      action: 'get_ticket_metrics',
      ticketId: args.ticketId,
      metrics: response.ticket_metric,
      timestamp: new Date().toISOString()
    };
  }

  private async createArticle(args: any): Promise<any> {
    if (!args.title || !args.body) {
      throw new Error("Title and body are required for create_article action");
    }

    const articleData = {
      article: {
        title: args.title,
        body: args.body,
        locale: args.locale || 'en-us'
      }
    };

    // Note: This requires a section_id in real implementation
    const response = await this.makeRequest('POST', '/help_center/articles.json', articleData);
    
    return {
      success: true,
      action: 'create_article',
      article: response.article,
      timestamp: new Date().toISOString()
    };
  }

  private async getSatisfactionRatings(args: any): Promise<any> {
    let url = '/satisfaction_ratings.json';
    const params = new URLSearchParams();

    if (args.limit) params.append('per_page', Math.min(args.limit, 100).toString());
    if (params.toString()) url += `?${params.toString()}`;

    const response = await this.makeRequest('GET', url);
    
    return {
      success: true,
      action: 'get_satisfaction_ratings',
      satisfactionRatings: response.satisfaction_ratings,
      count: response.count,
      timestamp: new Date().toISOString()
    };
  }

  private async listOrganizations(args: any): Promise<any> {
    let url = '/organizations.json';
    const params = new URLSearchParams();

    if (args.limit) params.append('per_page', Math.min(args.limit, 100).toString());

    if (params.toString()) url += `?${params.toString()}`;

    const response = await this.makeRequest('GET', url);
    
    return {
      success: true,
      action: 'list_organizations',
      organizations: response.organizations,
      count: response.count,
      nextPage: response.next_page,
      timestamp: new Date().toISOString()
    };
  }

  // New advanced features based on latest Zendesk API capabilities

  private async bulkCreateTickets(args: any): Promise<any> {
    if (!args.bulkData || !Array.isArray(args.bulkData)) {
      throw new Error("bulkData array is required for bulk_create_tickets action");
    }

    const bulkTickets = {
      tickets: args.bulkData.map((ticketData: any) => ({
        subject: ticketData.subject,
        comment: { body: ticketData.description },
        priority: ticketData.priority || 'normal',
        status: ticketData.status || 'new',
        requester: ticketData.requesterEmail ? { email: ticketData.requesterEmail } : undefined,
        assignee_id: ticketData.assigneeId,
        tags: ticketData.tags,
        custom_fields: ticketData.customFields ? Object.entries(ticketData.customFields).map(([id, value]) => ({ id: parseInt(id), value })) : undefined
      }))
    };

    const response = await this.makeRequest('POST', '/tickets/create_many.json', bulkTickets);
    
    return {
      success: true,
      action: 'bulk_create_tickets',
      jobStatus: response.job_status,
      jobId: response.job_status?.id,
      ticketCount: args.bulkData.length,
      timestamp: new Date().toISOString()
    };
  }

  private async createWebhook(args: any): Promise<any> {
    if (!args.webhookUrl) {
      throw new Error("webhookUrl is required for create_webhook action");
    }

    const webhookData = {
      webhook: {
        name: args.name || `Webhook-${Date.now()}`,
        endpoint: args.webhookUrl,
        http_method: 'POST',
        request_format: 'json',
        status: 'active',
        subscriptions: args.triggers || ['conditional_ticket_events']
      }
    };

    const response = await this.makeRequest('POST', '/webhooks.json', webhookData);
    
    return {
      success: true,
      action: 'create_webhook',
      webhook: response.webhook,
      webhookId: response.webhook.id,
      timestamp: new Date().toISOString()
    };
  }

  private async listWebhooks(args: any): Promise<any> {
    const response = await this.makeRequest('GET', '/webhooks.json');
    
    return {
      success: true,
      action: 'list_webhooks',
      webhooks: response.webhooks,
      count: response.count,
      timestamp: new Date().toISOString()
    };
  }

  private async deleteWebhook(args: any): Promise<any> {
    if (!args.webhookId) {
      throw new Error("webhookId is required for delete_webhook action");
    }

    await this.makeRequest('DELETE', `/webhooks/${args.webhookId}.json`);
    
    return {
      success: true,
      action: 'delete_webhook',
      webhookId: args.webhookId,
      timestamp: new Date().toISOString()
    };
  }

  private async listSlaPolicies(args: any): Promise<any> {
    const response = await this.makeRequest('GET', '/slas/policies.json');
    
    return {
      success: true,
      action: 'list_sla_policies',
      slaPolicies: response.sla_policies,
      timestamp: new Date().toISOString()
    };
  }

  private async getSlaPolicy(args: any): Promise<any> {
    if (!args.slaId) {
      throw new Error("slaId is required for get_sla_policy action");
    }

    const response = await this.makeRequest('GET', `/slas/policies/${args.slaId}.json`);
    
    return {
      success: true,
      action: 'get_sla_policy',
      slaPolicy: response.sla_policy,
      timestamp: new Date().toISOString()
    };
  }

  private async listAutomations(args: any): Promise<any> {
    let url = '/automations.json';
    const params = new URLSearchParams();

    if (args.limit) params.append('per_page', Math.min(args.limit, 100).toString());
    if (params.toString()) url += `?${params.toString()}`;

    const response = await this.makeRequest('GET', url);
    
    return {
      success: true,
      action: 'list_automations',
      automations: response.automations,
      count: response.count,
      timestamp: new Date().toISOString()
    };
  }

  private async createAutomation(args: any): Promise<any> {
    if (!args.conditions || !args.actions) {
      throw new Error("conditions and actions are required for create_automation action");
    }

    const automationData = {
      automation: {
        title: args.name || `Automation-${Date.now()}`,
        conditions: {
          all: args.conditions
        },
        actions: args.actions,
        active: true
      }
    };

    const response = await this.makeRequest('POST', '/automations.json', automationData);
    
    return {
      success: true,
      action: 'create_automation',
      automation: response.automation,
      automationId: response.automation.id,
      timestamp: new Date().toISOString()
    };
  }

  private async exportData(args: any): Promise<any> {
    if (!args.exportType) {
      throw new Error("exportType is required for export_data action");
    }

    const exportData: any = {
      type: args.exportType
    };

    if (args.dateRange) {
      exportData.start_time = args.dateRange.start_date;
      exportData.end_time = args.dateRange.end_date;
    }

    const response = await this.makeRequest('POST', '/exports.json', exportData);
    
    return {
      success: true,
      action: 'export_data',
      export: response.export,
      exportId: response.export?.id,
      status: response.export?.status,
      timestamp: new Date().toISOString()
    };
  }

  private async getCurrentUser(args: any): Promise<any> {
    const response = await this.makeRequest('GET', '/users/me.json');
    
    return {
      success: true,
      action: 'get_current_user',
      user: response.user,
      subdomain: this.subdomain,
      email: response.user.email,
      timestamp: new Date().toISOString()
    };
  }

  private async setupCredentials(args: any): Promise<any> {
    if (!args.subdomain || !args.email || !args.apiToken) {
      throw new Error("subdomain, email, and apiToken are required for setup_credentials action");
    }

    this.subdomain = args.subdomain;
    this.email = args.email;
    this.apiToken = args.apiToken;
    this.baseUrl = `https://${args.subdomain}.zendesk.com/api/v2`;

    // Test the credentials
    try {
      const testResponse = await this.makeRequest('GET', '/users/me.json');
      return {
        success: true,
        action: 'setup_credentials',
        message: 'Credentials configured successfully',
        user: testResponse.user,
        subdomain: this.subdomain,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        action: 'setup_credentials',
        error: 'Invalid credentials provided',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    if (!this.baseUrl || !this.email || !this.apiToken) {
      throw new Error("Zendesk credentials not configured. Use setup_credentials action first.");
    }

    const url = `${this.baseUrl}${endpoint}`;
    const credentials = Buffer.from(`${this.email}/token:${this.apiToken}`).toString('base64');

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Handle DELETE requests that return no content
    if (method === 'DELETE' && response.status === 204) {
      return { success: true };
    }

    return await response.json();
  }

  // Helper methods to get IDs for time-saving operations
  private async getUserByEmail(args: any): Promise<any> {
    if (!args.email) {
      throw new Error("Email is required for get_user_by_email action");
    }

    const response = await this.makeRequest('GET', `/users/search.json?query=${encodeURIComponent(args.email)}`);
    
    return {
      success: true,
      action: 'get_user_by_email',
      email: args.email,
      users: response.users,
      userId: response.users.length > 0 ? response.users[0].id : null,
      timestamp: new Date().toISOString()
    };
  }

  private async getOrganizationByName(args: any): Promise<any> {
    if (!args.organizationName) {
      throw new Error("organizationName is required for get_organization_by_name action");
    }

    const response = await this.makeRequest('GET', `/organizations/search.json?name=${encodeURIComponent(args.organizationName)}`);
    
    return {
      success: true,
      action: 'get_organization_by_name',
      organizationName: args.organizationName,
      organizations: response.organizations,
      organizationId: response.organizations.length > 0 ? response.organizations[0].id : null,
      timestamp: new Date().toISOString()
    };
  }

  private async listTicketFields(args: any): Promise<any> {
    const response = await this.makeRequest('GET', '/ticket_fields.json');
    
    return {
      success: true,
      action: 'list_ticket_fields',
      ticketFields: response.ticket_fields,
      customFields: response.ticket_fields.filter((field: any) => field.type === 'custom'),
      timestamp: new Date().toISOString()
    };
  }

  private async getAssignableAgents(args: any): Promise<any> {
    const response = await this.makeRequest('GET', '/users.json?role=agent&permission_set=1');
    
    return {
      success: true,
      action: 'get_assignable_agents',
      agents: response.users,
      agentIds: response.users.map((agent: any) => ({ id: agent.id, name: agent.name, email: agent.email })),
      timestamp: new Date().toISOString()
    };
  }

  private async listGroups(args: any): Promise<any> {
    const response = await this.makeRequest('GET', '/groups.json');
    
    return {
      success: true,
      action: 'list_groups',
      groups: response.groups,
      groupIds: response.groups.map((group: any) => ({ id: group.id, name: group.name })),
      timestamp: new Date().toISOString()
    };
  }
}
