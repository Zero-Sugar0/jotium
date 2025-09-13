import { FunctionDeclaration, Type } from "@google/genai";

export class MailchimpTool {
  private apiKey: string;
  private dataCenter: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Extract data center from API key (format: key-dc)
    const dcMatch = apiKey.match(/-([a-z0-9]+)$/);
    this.dataCenter = dcMatch ? dcMatch[1] : 'us1';
    this.baseUrl = `https://${this.dataCenter}.api.mailchimp.com/3.0`;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "mailchimp_marketing",
      description: "Comprehensive Mailchimp Marketing API tool for email marketing automation and audience management. Create and manage email campaigns, subscriber lists (audiences), automation workflows, templates, and detailed analytics. Supports subscriber management, segmentation, campaign creation and scheduling, automation flows, template management, and comprehensive reporting. Perfect for email marketing campaigns, subscriber engagement tracking, automated email sequences, audience segmentation, and marketing performance analysis. Handles campaign delivery, open/click tracking, unsubscribe management, and e-commerce integration.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "Mailchimp operation to perform. Choose from: 'ping' (health check), 'get_account' (account info), 'get_lists' (all audiences), 'create_list' (new audience), 'get_list' (specific audience), 'add_member' (subscriber), 'get_member' (subscriber info), 'update_member' (subscriber update), 'batch_subscribe' (bulk add), 'get_campaigns' (all campaigns), 'create_campaign' (new campaign), 'get_campaign' (campaign details), 'send_campaign' (send now), 'schedule_campaign' (schedule send), 'get_templates' (all templates), 'create_template' (new template), 'get_reports' (campaign reports), 'get_automations' (automation workflows), 'create_automation' (new automation), or 'get_segments' (audience segments)."
          },
          listId: {
            type: Type.STRING,
            description: "Audience/List ID for list-specific operations (required for member, segment, and some campaign actions). Format: alphanumeric string (e.g., 'a1b2c3d4e5'). Found in Mailchimp dashboard under Audience settings or via get_lists action. Used for subscriber management, segmentation, and audience-specific campaigns."
          },
          campaignId: {
            type: Type.STRING,
            description: "Campaign ID for campaign-specific operations (required for campaign updates, sending, reports). Format: alphanumeric string. Obtained from campaign creation or get_campaigns action. Used for managing, sending, and analyzing specific email campaigns."
          },
          automationId: {
            type: Type.STRING,
            description: "Automation workflow ID for automation-specific operations. Format: alphanumeric string. Used for managing automated email sequences and workflow automation. Obtained from get_automations or automation creation responses."
          },
          templateId: {
            type: Type.STRING,
            description: "Template ID for template operations. Format: alphanumeric string. Used for accessing, updating, or using specific email templates. Obtained from get_templates action or template creation responses."
          },
          subscriberHash: {
            type: Type.STRING,
            description: "Subscriber hash (MD5 of lowercase email) for member-specific operations. Either provide this OR email_address - the tool will generate the hash if email is provided. Used for retrieving, updating, or managing specific subscriber information."
          },
          email_address: {
            type: Type.STRING,
            description: "Subscriber email address for member operations. Required for adding new subscribers or when subscriberHash is not provided. Must be valid email format. The tool will automatically generate the required MD5 hash for API calls."
          },
          memberData: {
            type: Type.OBJECT,
            description: "Subscriber data for add/update member operations. Required fields: email_address, status ('subscribed', 'unsubscribed', 'cleaned', 'pending'). Optional: merge_fields (custom data like FNAME, LNAME), interests (interest group preferences), language, vip, location, marketing_permissions, ip_signup, timestamp_signup. Example: {email_address: 'user@example.com', status: 'subscribed', merge_fields: {FNAME: 'John', LNAME: 'Doe'}}"
          },
          campaignData: {
            type: Type.OBJECT,
            description: "Campaign configuration for create_campaign action. Required: type ('regular', 'plaintext', 'absplit', 'rss', 'variate'), recipients (list_id and optional segment_opts), settings (subject_line, from_name, reply_to). Optional: content (template or HTML), tracking, social_card, rss_opts. Example: {type: 'regular', recipients: {list_id: 'abc123'}, settings: {subject_line: 'Newsletter', from_name: 'Company', reply_to: 'info@company.com'}}"
          },
          listData: {
            type: Type.OBJECT,
            description: "List/Audience configuration for create_list action. Required: name, contact (company, address1, city, state, zip, country), permission_reminder, campaign_defaults (from_name, from_email, subject, language). Optional: use_archive_bar, notify_on_subscribe, notify_on_unsubscribe, email_type_option, double_optin, marketing_permissions. Creates new subscriber audience with specified settings."
          },
          templateData: {
            type: Type.OBJECT,
            description: "Template data for create_template action. Required: name, html. Optional: folder_id (organize in folders). Creates reusable email template. HTML should be valid email template markup with merge tags for personalization. Example: {name: 'Newsletter Template', html: '<html><body>Hello *|FNAME|*!</body></html>'}"
          },
          scheduleData: {
            type: Type.OBJECT,
            description: "Schedule data for schedule_campaign action. Required: schedule_time (ISO 8601 datetime string in UTC). Optional: timewarp (enable timezone-based sending), batch_delay (delay between batches). Example: {schedule_time: '2024-12-01T10:00:00Z'} schedules campaign for December 1st at 10 AM UTC."
          },
          batchData: {
            type: Type.OBJECT,
            description: "Batch operation data for batch_subscribe action. Required: members (array of member objects with email_address and status), update_existing (boolean). Optional: replace_interests. Example: {members: [{email_address: 'user1@example.com', status: 'subscribed'}, {email_address: 'user2@example.com', status: 'subscribed'}], update_existing: true}"
          },
          count: {
            type: Type.NUMBER,
            description: "Number of results to return for list operations (default: 10, max: 1000). Higher values provide more comprehensive data but may impact performance. Use for pagination control when retrieving lists of campaigns, subscribers, templates, etc."
          },
          offset: {
            type: Type.NUMBER,
            description: "Number of records to skip for pagination (default: 0). Used with count parameter to implement pagination for large datasets. Example: offset=20 with count=10 retrieves records 21-30. Essential for managing large subscriber lists or campaign histories."
          },
          fields: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Specific fields to return in response, reducing payload size and improving performance. Use dot notation for nested fields. Example: ['id', 'name', 'stats.member_count'] for lists. Helps optimize API responses when you only need specific data points."
          },
          status: {
            type: Type.STRING,
            description: "Filter members by subscription status for member operations. Options: 'subscribed' (active subscribers), 'unsubscribed' (opted out), 'cleaned' (bounced/invalid), 'pending' (awaiting confirmation), 'transactional' (transactional only). Use to target specific subscriber segments."
          },
          since_last_changed: {
            type: Type.STRING,
            description: "Retrieve members modified since specified date (ISO 8601 format). Example: '2024-01-01T00:00:00Z'. Useful for syncing changes, getting recent activity, or incremental updates. Helps manage large datasets by focusing on recent changes only."
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const action = args.action;
      console.log(`📧 Mailchimp ${action}: ${args.listId || args.campaignId || args.email_address || 'general'}`);

      switch (action) {
        // General API operations
        case 'ping':
          return await this.ping();
        case 'get_account':
          return await this.getAccount();

        // List/Audience operations
        case 'get_lists':
          return await this.getLists(args);
        case 'create_list':
          return await this.createList(args);
        case 'get_list':
          return await this.getList(args);

        // Member operations
        case 'add_member':
          return await this.addMember(args);
        case 'get_member':
          return await this.getMember(args);
        case 'update_member':
          return await this.updateMember(args);
        case 'batch_subscribe':
          return await this.batchSubscribe(args);

        // Campaign operations
        case 'get_campaigns':
          return await this.getCampaigns(args);
        case 'create_campaign':
          return await this.createCampaign(args);
        case 'get_campaign':
          return await this.getCampaign(args);
        case 'send_campaign':
          return await this.sendCampaign(args);
        case 'schedule_campaign':
          return await this.scheduleCampaign(args);

        // Template operations
        case 'get_templates':
          return await this.getTemplates(args);
        case 'create_template':
          return await this.createTemplate(args);

        // Reporting operations
        case 'get_reports':
          return await this.getReports(args);

        // Automation operations
        case 'get_automations':
          return await this.getAutomations(args);
        case 'create_automation':
          return await this.createAutomation(args);

        // Segment operations
        case 'get_segments':
          return await this.getSegments(args);

        default:
          throw new Error(`Unknown action: ${action}`);
      }

    } catch (error: unknown) {
      console.error("❌ Mailchimp operation failed:", error);
      return {
        success: false,
        error: `Mailchimp operation failed: ${error instanceof Error ? error.message : String(error)}`,
        action: args.action
      };
    }
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Basic ${Buffer.from(`anystring:${this.apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    };

    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
    }

    return await response.json();
  }

  private getSubscriberHash(email: string): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  }

  private buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(','));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    return searchParams.toString() ? `?${searchParams.toString()}` : '';
  }

  // API Health Check
  private async ping(): Promise<any> {
    const result = await this.makeRequest('/ping');
    return {
      success: true,
      action: 'ping',
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  // Account Information
  private async getAccount(): Promise<any> {
    const result = await this.makeRequest('/');
    return {
      success: true,
      action: 'get_account',
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  // List/Audience Operations
  private async getLists(args: any): Promise<any> {
    const queryParams = this.buildQueryParams({
      count: args.count,
      offset: args.offset,
      fields: args.fields
    });

    const result = await this.makeRequest(`/lists${queryParams}`);
    return {
      success: true,
      action: 'get_lists',
      data: result,
      total_items: result.total_items,
      count: result.lists?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async createList(args: any): Promise<any> {
    if (!args.listData) {
      throw new Error("listData is required for create_list action");
    }

    const result = await this.makeRequest('/lists', 'POST', args.listData);
    return {
      success: true,
      action: 'create_list',
      listId: result.id,
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  private async getList(args: any): Promise<any> {
    if (!args.listId) {
      throw new Error("listId is required for get_list action");
    }

    const queryParams = this.buildQueryParams({
      fields: args.fields
    });

    const result = await this.makeRequest(`/lists/${args.listId}${queryParams}`);
    return {
      success: true,
      action: 'get_list',
      listId: args.listId,
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  // Member Operations
  private async addMember(args: any): Promise<any> {
    if (!args.listId) {
      throw new Error("listId is required for add_member action");
    }
    if (!args.memberData) {
      throw new Error("memberData is required for add_member action");
    }

    const result = await this.makeRequest(`/lists/${args.listId}/members`, 'POST', args.memberData);
    return {
      success: true,
      action: 'add_member',
      listId: args.listId,
      email: args.memberData.email_address,
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  private async getMember(args: any): Promise<any> {
    if (!args.listId) {
      throw new Error("listId is required for get_member action");
    }

    let subscriberHash = args.subscriberHash;
    if (!subscriberHash && args.email_address) {
      subscriberHash = this.getSubscriberHash(args.email_address);
    }
    if (!subscriberHash) {
      throw new Error("Either subscriberHash or email_address is required for get_member action");
    }

    const queryParams = this.buildQueryParams({
      fields: args.fields
    });

    const result = await this.makeRequest(`/lists/${args.listId}/members/${subscriberHash}${queryParams}`);
    return {
      success: true,
      action: 'get_member',
      listId: args.listId,
      subscriberHash,
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  private async updateMember(args: any): Promise<any> {
    if (!args.listId) {
      throw new Error("listId is required for update_member action");
    }
    if (!args.memberData) {
      throw new Error("memberData is required for update_member action");
    }

    let subscriberHash = args.subscriberHash;
    if (!subscriberHash && args.email_address) {
      subscriberHash = this.getSubscriberHash(args.email_address);
    }
    if (!subscriberHash) {
      throw new Error("Either subscriberHash or email_address is required for update_member action");
    }

    const result = await this.makeRequest(`/lists/${args.listId}/members/${subscriberHash}`, 'PATCH', args.memberData);
    return {
      success: true,
      action: 'update_member',
      listId: args.listId,
      subscriberHash,
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  private async batchSubscribe(args: any): Promise<any> {
    if (!args.listId) {
      throw new Error("listId is required for batch_subscribe action");
    }
    if (!args.batchData) {
      throw new Error("batchData is required for batch_subscribe action");
    }

    const result = await this.makeRequest(`/lists/${args.listId}`, 'POST', args.batchData);
    return {
      success: true,
      action: 'batch_subscribe',
      listId: args.listId,
      new_members: result.new_members?.length || 0,
      updated_members: result.updated_members?.length || 0,
      errors: result.errors?.length || 0,
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  // Campaign Operations
  private async getCampaigns(args: any): Promise<any> {
    const queryParams = this.buildQueryParams({
      count: args.count,
      offset: args.offset,
      fields: args.fields,
      type: args.type,
      status: args.status,
      since_create_time: args.since_create_time,
      before_create_time: args.before_create_time
    });

    const result = await this.makeRequest(`/campaigns${queryParams}`);
    return {
      success: true,
      action: 'get_campaigns',
      data: result,
      total_items: result.total_items,
      count: result.campaigns?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async createCampaign(args: any): Promise<any> {
    if (!args.campaignData) {
      throw new Error("campaignData is required for create_campaign action");
    }

    const result = await this.makeRequest('/campaigns', 'POST', args.campaignData);
    return {
      success: true,
      action: 'create_campaign',
      campaignId: result.id,
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  private async getCampaign(args: any): Promise<any> {
    if (!args.campaignId) {
      throw new Error("campaignId is required for get_campaign action");
    }

    const queryParams = this.buildQueryParams({
      fields: args.fields
    });

    const result = await this.makeRequest(`/campaigns/${args.campaignId}${queryParams}`);
    return {
      success: true,
      action: 'get_campaign',
      campaignId: args.campaignId,
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  private async sendCampaign(args: any): Promise<any> {
    if (!args.campaignId) {
      throw new Error("campaignId is required for send_campaign action");
    }

    const result = await this.makeRequest(`/campaigns/${args.campaignId}/actions/send`, 'POST');
    return {
      success: true,
      action: 'send_campaign',
      campaignId: args.campaignId,
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  private async scheduleCampaign(args: any): Promise<any> {
    if (!args.campaignId) {
      throw new Error("campaignId is required for schedule_campaign action");
    }
    if (!args.scheduleData) {
      throw new Error("scheduleData is required for schedule_campaign action");
    }

    const result = await this.makeRequest(`/campaigns/${args.campaignId}/actions/schedule`, 'POST', args.scheduleData);
    return {
      success: true,
      action: 'schedule_campaign',
      campaignId: args.campaignId,
      scheduled_time: args.scheduleData.schedule_time,
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  // Template Operations
  private async getTemplates(args: any): Promise<any> {
    const queryParams = this.buildQueryParams({
      count: args.count,
      offset: args.offset,
      fields: args.fields,
      created_by: args.created_by,
      since_created_at: args.since_created_at,
      before_created_at: args.before_created_at,
      type: args.type
    });

    const result = await this.makeRequest(`/templates${queryParams}`);
    return {
      success: true,
      action: 'get_templates',
      data: result,
      total_items: result.total_items,
      count: result.templates?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async createTemplate(args: any): Promise<any> {
    if (!args.templateData) {
      throw new Error("templateData is required for create_template action");
    }

    const result = await this.makeRequest('/templates', 'POST', args.templateData);
    return {
      success: true,
      action: 'create_template',
      templateId: result.id,
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  // Reporting Operations
  private async getReports(args: any): Promise<any> {
    const queryParams = this.buildQueryParams({
      count: args.count,
      offset: args.offset,
      fields: args.fields,
      type: args.type,
      since_send_time: args.since_send_time,
      before_send_time: args.before_send_time
    });

    const result = await this.makeRequest(`/reports${queryParams}`);
    return {
      success: true,
      action: 'get_reports',
      data: result,
      total_items: result.total_items,
      count: result.reports?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  // Automation Operations
  private async getAutomations(args: any): Promise<any> {
    const queryParams = this.buildQueryParams({
      count: args.count,
      offset: args.offset,
      fields: args.fields,
      before_create_time: args.before_create_time,
      since_create_time: args.since_create_time,
      before_start_time: args.before_start_time,
      since_start_time: args.since_start_time,
      status: args.status
    });

    const result = await this.makeRequest(`/automations${queryParams}`);
    return {
      success: true,
      action: 'get_automations',
      data: result,
      total_items: result.total_items,
      count: result.automations?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async createAutomation(args: any): Promise<any> {
    if (!args.automationData) {
      throw new Error("automationData is required for create_automation action");
    }

    const result = await this.makeRequest('/automations', 'POST', args.automationData);
    return {
      success: true,
      action: 'create_automation',
      automationId: result.id,
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  // Segment Operations
  private async getSegments(args: any): Promise<any> {
    if (!args.listId) {
      throw new Error("listId is required for get_segments action");
    }

    const queryParams = this.buildQueryParams({
      count: args.count,
      offset: args.offset,
      fields: args.fields,
      type: args.type,
      since_created_at: args.since_created_at,
      before_created_at: args.before_created_at,
      include_cleaned: args.include_cleaned,
      include_transactional: args.include_transactional,
      include_unsubscribed: args.include_unsubscribed
    });

    const result = await this.makeRequest(`/lists/${args.listId}/segments${queryParams}`);
    return {
      success: true,
      action: 'get_segments',
      listId: args.listId,
      data: result,
      total_items: result.total_items,
      count: result.segments?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async createSegment(args: any): Promise<any> {
    if (!args.listId) {
      throw new Error("listId is required for create_segment action");
    }
    if (!args.segmentData) {
      throw new Error("segmentData is required for create_segment action");
    }

    const result = await this.makeRequest(`/lists/${args.listId}/segments`, 'POST', args.segmentData);
    return {
      success: true,
      action: 'create_segment',
      listId: args.listId,
      segmentId: result.id,
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  // Test Email Operations
  private async sendTestEmail(args: any): Promise<any> {
    if (!args.campaignId) {
      throw new Error("campaignId is required for send_test_email action");
    }
    if (!args.testEmailData) {
      throw new Error("testEmailData is required for send_test_email action");
    }

    const result = await this.makeRequest(`/campaigns/${args.campaignId}/actions/test`, 'POST', args.testEmailData);
    return {
      success: true,
      action: 'send_test_email',
      campaignId: args.campaignId,
      test_emails: args.testEmailData.test_emails,
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  // Member Activity Operations
  private async getMemberActivity(args: any): Promise<any> {
    if (!args.listId) {
      throw new Error("listId is required for get_member_activity action");
    }

    let subscriberHash = args.subscriberHash;
    if (!subscriberHash && args.email_address) {
      subscriberHash = this.getSubscriberHash(args.email_address);
    }
    if (!subscriberHash) {
      throw new Error("Either subscriberHash or email_address is required for get_member_activity action");
    }

    const queryParams = this.buildQueryParams({
      fields: args.fields,
      exclude_fields: args.exclude_fields
    });

    const result = await this.makeRequest(`/lists/${args.listId}/members/${subscriberHash}/activity-feed${queryParams}`);
    return {
      success: true,
      action: 'get_member_activity',
      listId: args.listId,
      subscriberHash,
      data: result,
      total_items: result.total_items,
      activities: result.activity?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  // Member Deletion Operations
  private async deleteMember(args: any): Promise<any> {
    if (!args.listId) {
      throw new Error("listId is required for delete_member action");
    }

    let subscriberHash = args.subscriberHash;
    if (!subscriberHash && args.email_address) {
      subscriberHash = this.getSubscriberHash(args.email_address);
    }
    if (!subscriberHash) {
      throw new Error("Either subscriberHash or email_address is required for delete_member action");
    }

    const result = await this.makeRequest(`/lists/${args.listId}/members/${subscriberHash}/actions/delete-permanent`, 'POST');
    return {
      success: true,
      action: 'delete_member',
      listId: args.listId,
      subscriberHash,
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  private async unsubscribeMember(args: any): Promise<any> {
    if (!args.listId) {
      throw new Error("listId is required for unsubscribe_member action");
    }

    let subscriberHash = args.subscriberHash;
    if (!subscriberHash && args.email_address) {
      subscriberHash = this.getSubscriberHash(args.email_address);
    }
    if (!subscriberHash) {
      throw new Error("Either subscriberHash or email_address is required for unsubscribe_member action");
    }

    const unsubscribeData = {
      status: 'unsubscribed'
    };

    const result = await this.makeRequest(`/lists/${args.listId}/members/${subscriberHash}`, 'PATCH', unsubscribeData);
    return {
      success: true,
      action: 'unsubscribe_member',
      listId: args.listId,
      subscriberHash,
      data: result,
      timestamp: new Date().toISOString()
    };
  }
}