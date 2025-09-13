import { FunctionDeclaration, Type } from "@google/genai";
import { getValidOAuthAccessToken } from "@/lib/oauth-refresh";

export interface ZoomConfig {
  apiKey: string;
  apiSecret: string;
}

export class ZoomTool {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string = "https://api.zoom.us/v2";
  private tokenCache: { token: string; expiresAt: number } | null = null;
  private userId: string;
  private oauthToken: string | null;

  constructor(config: ZoomConfig, userId: string, oauthToken: string | null = null) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.userId = userId;
    this.oauthToken = oauthToken;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "zoom_api",
      description: "Comprehensive Zoom video conferencing and meeting management tool powered by Zoom API v2. Create and manage meetings, webinars, users, and accounts programmatically. Supports meeting scheduling, participant management, recording access, analytics, and automation. Perfect for enterprise meeting management, automated scheduling, user provisioning, event management, and integration with business workflows. Handles authentication, real-time updates, and comprehensive meeting lifecycle management.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "Zoom operation to perform. Choose 'create_meeting' for scheduling meetings, 'update_meeting' for modifying meetings, 'delete_meeting' for canceling meetings, 'list_meetings' for viewing scheduled meetings, 'get_meeting' for meeting details, 'list_participants' for attendee info, 'create_user' for user management, 'update_user' for user modifications, 'delete_user' for user removal, 'list_users' for user listing, 'get_user' for user details, 'create_webinar' for webinar creation, 'list_webinars' for webinar management, 'get_recordings' for recording access, 'get_analytics' for usage reports, or 'get_account' for account information."
          },
          meetingId: {
            type: Type.STRING,
            description: "Unique meeting identifier for meeting-specific operations (required for update_meeting, delete_meeting, get_meeting, list_participants actions). Format: numeric meeting ID from Zoom. Use this to manage existing meetings, retrieve details, or access participant information. Obtained from meeting creation or list operations."
          },
          userId: {
            type: Type.STRING,
            description: "User identifier for user-specific operations (required for user management actions). Can be user ID, email address, or 'me' for current user. Examples: 'user@company.com', '1234567890', 'me'. Used for creating meetings under specific users, managing user accounts, or retrieving user-specific data and settings."
          },
          webinarId: {
            type: Type.STRING,
            description: "Unique webinar identifier for webinar-specific operations (required for webinar management actions). Format: numeric webinar ID from Zoom. Use this to manage existing webinars, retrieve details, or access webinar-specific features and settings. Obtained from webinar creation or list operations."
          },
          topic: {
            type: Type.STRING,
            description: "Meeting or webinar title/topic (required for create_meeting, create_webinar actions). Examples: 'Weekly Team Standup', 'Q4 Planning Session', 'Product Demo Webinar'. This appears in meeting invitations, calendar entries, and participant interfaces. Keep concise but descriptive for easy identification."
          },
          type: {
            type: Type.NUMBER,
            description: "Meeting type specification (default: 2 for scheduled meeting). Options: 1 (instant meeting), 2 (scheduled meeting), 3 (recurring meeting with no fixed time), 8 (recurring meeting with fixed time). Choose based on meeting pattern - use 2 for most standard scheduled meetings, 3/8 for recurring series."
          },
          startTime: {
            type: Type.STRING,
            description: "Meeting start date and time in ISO 8601 format (required for scheduled meetings). Format: 'YYYY-MM-DDTHH:mm:ss' or 'YYYY-MM-DDTHH:mm:ssZ'. Examples: '2024-09-15T14:30:00Z', '2024-09-15T10:00:00'. Time zone handling is crucial for international meetings - use UTC or specify timezone offset."
          },
          duration: {
            type: Type.NUMBER,
            description: "Meeting duration in minutes (default: 60). Examples: 30, 60, 90, 120. This is for planning purposes and calendar blocking - meetings don't automatically end at this time. Consider buffer time for overruns and setup when scheduling back-to-back meetings."
          },
          timezone: {
            type: Type.STRING,
            description: "Meeting timezone identifier (default: user's timezone). Examples: 'America/New_York', 'Europe/London', 'Asia/Tokyo'. Use IANA timezone names for accurate scheduling across regions. Critical for recurring meetings and international participants. Affects meeting start time interpretation."
          },
          password: {
            type: Type.STRING,
            description: "Meeting password for security (optional but recommended). Must be 1-10 characters, alphanumeric. Examples: 'Meet2024', '123456'. Provides additional security layer for sensitive meetings. Required for some enterprise security policies. Share securely with intended participants only."
          },
          agenda: {
            type: Type.STRING,
            description: "Meeting agenda or description (optional). Examples: 'Review quarterly results and plan next quarter', 'Product demo and Q&A session'. Helps participants prepare and provides context. Appears in meeting invitations and can include meeting objectives, preparation items, or discussion topics."
          },
          settings: {
            type: Type.OBJECT,
            description: "Meeting configuration settings object. Include properties like: {'host_video': true, 'participant_video': true, 'join_before_host': false, 'mute_upon_entry': true, 'waiting_room': true, 'audio': 'voip', 'auto_recording': 'none', 'alternative_hosts': 'email@domain.com'}. Controls meeting behavior, security, and participant experience."
          },
          recurrence: {
            type: Type.OBJECT,
            description: "Recurring meeting configuration (required for recurring meetings). Include properties like: {'type': 1, 'repeat_interval': 1, 'weekly_days': '2,4', 'monthly_day': 15, 'end_times': 10, 'end_date_time': '2024-12-31T23:59:59Z'}. Type: 1(daily), 2(weekly), 3(monthly). Configure pattern based on meeting frequency needs."
          },
          templateId: {
            type: Type.STRING,
            description: "Meeting template identifier for standardized meeting creation (optional). Use predefined templates with consistent settings across organization. Obtained from Zoom admin console or template management. Streamlines meeting creation with pre-configured security, recording, and participant settings."
          },
          alternativeHosts: {
            type: Type.STRING,
            description: "Comma-separated list of alternative host email addresses (optional). Examples: 'backup@company.com,manager@company.com'. These users can start the meeting if the primary host is unavailable. Must be licensed Zoom users in the same account. Provides meeting continuity and backup hosting capability."
          },
          registrationType: {
            type: Type.NUMBER,
            description: "Registration requirement for webinars (default: 1). Options: 1 (attendees register once for all occurrences), 2 (attendees need to register for each occurrence), 3 (attendees register once and pick occurrences to attend). Controls registration workflow and attendee management for webinar series."
          },
          pageSize: {
            type: Type.NUMBER,
            description: "Number of results per page for list operations (default: 30, max: 300). Use for pagination control when fetching meetings, users, or other large datasets. Higher values reduce API calls but may impact response time. Consider client processing capabilities when setting this value."
          },
          pageNumber: {
            type: Type.NUMBER,
            description: "Page number for paginated results (default: 1). Use with pageSize for navigating through large result sets. Start from 1 for first page. Essential for accessing all data when total results exceed pageSize limit. Implement proper pagination logic for comprehensive data retrieval."
          },
          nextPageToken: {
            type: Type.STRING,
            description: "Next page token for cursor-based pagination (alternative to pageNumber). Some endpoints use token-based pagination for better performance with large datasets. Use the token returned in previous response to get next page. More efficient than offset-based pagination for frequently changing data."
          },
          status: {
            type: Type.STRING,
            description: "Filter meetings by status (optional). Options: 'scheduled', 'live', 'upcoming'. Use to filter meeting lists by current state. 'scheduled' shows all future meetings, 'live' shows currently active meetings, 'upcoming' shows meetings starting soon. Useful for dashboard views and status monitoring."
          },
          from: {
            type: Type.STRING,
            description: "Start date for date range filtering in YYYY-MM-DD format (optional). Examples: '2024-09-01', '2024-10-15'. Use with 'to' parameter to filter meetings, recordings, or analytics within specific date ranges. Essential for reporting and historical data analysis."
          },
          to: {
            type: Type.STRING,
            description: "End date for date range filtering in YYYY-MM-DD format (optional). Examples: '2024-09-30', '2024-10-31'. Must be used with 'from' parameter. Maximum date range varies by endpoint (typically 30-180 days). Use for generating reports and analyzing trends over specific periods."
          },
          type_filter: {
            type: Type.STRING,
            description: "Filter recordings by type (optional). Options: 'shared_screen_with_speaker_view', 'shared_screen_with_gallery_view', 'speaker_view', 'gallery_view', 'shared_screen', 'audio_only', 'audio_transcript', 'chat_file', 'summary'. Use to retrieve specific recording formats for different use cases and storage requirements."
          },
          loginType: {
            type: Type.NUMBER,
            description: "User login type for user creation (optional, default: 100). Options: 100 (Basic), 101 (Pro), 102 (Corp). Determines user feature access and licensing. Basic users have limited features, Pro/Corp users get full meeting functionality. Must align with account licensing and user needs."
          },
          userType: {
            type: Type.NUMBER,
            description: "User type for user management (default: 1). Options: 1 (Basic), 2 (Licensed), 3 (On-prem). Licensed users can host meetings, Basic users can only join. On-prem is for hybrid deployments. Choose based on user role and meeting hosting requirements within organization."
          },
          action_type: {
            type: Type.STRING,
            description: "User action type for user operations (optional). Options: 'create', 'autoCreate', 'custCreate', 'ssoCreate'. 'create' requires email confirmation, 'autoCreate' activates immediately, 'custCreate' for custom attributes, 'ssoCreate' for SSO users. Choose based on user provisioning workflow and authentication method."
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const action = args.action;
      console.log(`🔗 Zoom ${action}: ${args.meetingId || args.userId || args.webinarId || 'operation'}`);

      // Ensure we have a valid access token
      await this.ensureAccessToken();

      switch (action) {
        case 'create_meeting':
          return await this.createMeeting(args);
        case 'update_meeting':
          return await this.updateMeeting(args);
        case 'delete_meeting':
          return await this.deleteMeeting(args);
        case 'list_meetings':
          return await this.listMeetings(args);
        case 'get_meeting':
          return await this.getMeeting(args);
        case 'list_participants':
          return await this.listParticipants(args);
        case 'create_user':
          return await this.createUser(args);
        case 'update_user':
          return await this.updateUser(args);
        case 'delete_user':
          return await this.deleteUser(args);
        case 'list_users':
          return await this.listUsers(args);
        case 'get_user':
          return await this.getUser(args);
        case 'create_webinar':
          return await this.createWebinar(args);
        case 'list_webinars':
          return await this.listWebinars(args);
        case 'get_recordings':
          return await this.getRecordings(args);
        case 'get_analytics':
          return await this.getAnalytics(args);
        case 'get_account':
          return await this.getAccount(args);
        case 'register_webinar':
          return await this.registerWebinar(args);
        case 'list_webinar_registrants':
          return await this.listWebinarRegistrants(args);
        case 'approve_registrants':
          return await this.approveRegistrants(args);
        case 'send_invitation':
          return await this.sendInvitation(args);
        case 'update_meeting_status':
          return await this.updateMeetingStatus(args);
        case 'create_breakout_rooms':
          return await this.createBreakoutRooms(args);
        case 'update_live_stream':
          return await this.updateLiveStream(args);
        case 'get_cloud_recording':
          return await this.getCloudRecording(args);
        case 'create_poll':
          return await this.createPoll(args);
        case 'get_qa_sessions':
          return await this.getQASessions(args);
        default:
          throw new Error(`Unknown action: ${action}`);
      }

    } catch (error: unknown) {
      console.error("❌ Zoom operation failed:", error);
      return {
        success: false,
        error: `Zoom operation failed: ${error instanceof Error ? error.message : String(error)}`,
        action: args.action
      };
    }
  }

  private async ensureAccessToken(): Promise<void> {
    const now = Date.now();
    
    if (this.tokenCache && this.tokenCache.expiresAt > now + 60000) {
      return; // Token is still valid (with 1-minute buffer)
    }

    let accessToken: string | null = this.oauthToken;
    if (!accessToken) {
      accessToken = await getValidOAuthAccessToken(this.userId, "zoom");
    }

    if (accessToken) {
      // Use OAuth token
      this.tokenCache = {
        token: accessToken,
        expiresAt: now + 3600000 // Assume 1 hour validity for OAuth tokens
      };
    } else {
      // Fall back to API key/secret authentication
      const response = await fetch('https://zoom.us/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const tokenData = await response.json();
      this.tokenCache = {
        token: tokenData.access_token,
        expiresAt: now + (tokenData.expires_in * 1000)
      };
    }
  }

  private async apiRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    const headers: any = {
      'Authorization': `Bearer ${this.tokenCache!.token}`,
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      method,
      headers
    };

    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  }

  private async createMeeting(args: any): Promise<any> {
    if (!args.userId) {
      throw new Error("userId is required for create_meeting action");
    }

    if (!args.topic) {
      throw new Error("topic is required for create_meeting action");
    }

    const meetingData: any = {
      topic: args.topic,
      type: args.type || 2,
      duration: args.duration || 60
    };

    if (args.startTime) meetingData.start_time = args.startTime;
    if (args.timezone) meetingData.timezone = args.timezone;
    if (args.password) meetingData.password = args.password;
    if (args.agenda) meetingData.agenda = args.agenda;
    if (args.recurrence) meetingData.recurrence = args.recurrence;
    if (args.settings) meetingData.settings = args.settings;
    if (args.templateId) meetingData.template_id = args.templateId;
    if (args.alternativeHosts) meetingData.settings = { ...meetingData.settings, alternative_hosts: args.alternativeHosts };

    const result = await this.apiRequest(`/users/${args.userId}/meetings`, 'POST', meetingData);
    
    return {
      success: true,
      action: 'create_meeting',
      meetingId: result.id,
      meeting: result,
      joinUrl: result.join_url,
      startUrl: result.start_url,
      timestamp: new Date().toISOString()
    };
  }

  private async updateMeeting(args: any): Promise<any> {
    if (!args.meetingId) {
      throw new Error("meetingId is required for update_meeting action");
    }

    const updateData: any = {};

    if (args.topic) updateData.topic = args.topic;
    if (args.type) updateData.type = args.type;
    if (args.startTime) updateData.start_time = args.startTime;
    if (args.duration) updateData.duration = args.duration;
    if (args.timezone) updateData.timezone = args.timezone;
    if (args.password) updateData.password = args.password;
    if (args.agenda) updateData.agenda = args.agenda;
    if (args.recurrence) updateData.recurrence = args.recurrence;
    if (args.settings) updateData.settings = args.settings;

    await this.apiRequest(`/meetings/${args.meetingId}`, 'PATCH', updateData);
    
    return {
      success: true,
      action: 'update_meeting',
      meetingId: args.meetingId,
      timestamp: new Date().toISOString()
    };
  }

  private async deleteMeeting(args: any): Promise<any> {
    if (!args.meetingId) {
      throw new Error("meetingId is required for delete_meeting action");
    }

    await this.apiRequest(`/meetings/${args.meetingId}`, 'DELETE');
    
    return {
      success: true,
      action: 'delete_meeting',
      meetingId: args.meetingId,
      timestamp: new Date().toISOString()
    };
  }

  private async listMeetings(args: any): Promise<any> {
    if (!args.userId) {
      throw new Error("userId is required for list_meetings action");
    }

    const params = new URLSearchParams();
    if (args.status) params.append('type', args.status);
    if (args.pageSize) params.append('page_size', args.pageSize.toString());
    if (args.pageNumber) params.append('page_number', args.pageNumber.toString());
    if (args.nextPageToken) params.append('next_page_token', args.nextPageToken);

    const result = await this.apiRequest(`/users/${args.userId}/meetings?${params}`);
    
    return {
      success: true,
      action: 'list_meetings',
      userId: args.userId,
      meetings: result.meetings,
      pagination: {
        pageCount: result.page_count,
        pageNumber: result.page_number,
        pageSize: result.page_size,
        totalRecords: result.total_records,
        nextPageToken: result.next_page_token
      },
      timestamp: new Date().toISOString()
    };
  }

  private async getMeeting(args: any): Promise<any> {
    if (!args.meetingId) {
      throw new Error("meetingId is required for get_meeting action");
    }

    const result = await this.apiRequest(`/meetings/${args.meetingId}`);
    
    return {
      success: true,
      action: 'get_meeting',
      meetingId: args.meetingId,
      meeting: result,
      timestamp: new Date().toISOString()
    };
  }

  private async listParticipants(args: any): Promise<any> {
    if (!args.meetingId) {
      throw new Error("meetingId is required for list_participants action");
    }

    const params = new URLSearchParams();
    if (args.pageSize) params.append('page_size', args.pageSize.toString());
    if (args.nextPageToken) params.append('next_page_token', args.nextPageToken);

    const result = await this.apiRequest(`/report/meetings/${args.meetingId}/participants?${params}`);
    
    return {
      success: true,
      action: 'list_participants',
      meetingId: args.meetingId,
      participants: result.participants,
      pagination: {
        pageCount: result.page_count,
        pageSize: result.page_size,
        totalRecords: result.total_records,
        nextPageToken: result.next_page_token
      },
      timestamp: new Date().toISOString()
    };
  }

  private async createUser(args: any): Promise<any> {
    if (!args.userId) {
      throw new Error("userId (email) is required for create_user action");
    }

    const userData: any = {
      action: args.action_type || 'create',
      user_info: {
        email: args.userId,
        type: args.userType || 1
      }
    };

    if (args.loginType) userData.user_info.login_type = args.loginType;

    const result = await this.apiRequest('/users', 'POST', userData);
    
    return {
      success: true,
      action: 'create_user',
      userId: result.id,
      user: result,
      timestamp: new Date().toISOString()
    };
  }

  private async updateUser(args: any): Promise<any> {
    if (!args.userId) {
      throw new Error("userId is required for update_user action");
    }

    const updateData: any = {};
    if (args.loginType) updateData.login_type = args.loginType;
    if (args.userType) updateData.type = args.userType;

    await this.apiRequest(`/users/${args.userId}`, 'PATCH', updateData);
    
    return {
      success: true,
      action: 'update_user',
      userId: args.userId,
      timestamp: new Date().toISOString()
    };
  }

  private async deleteUser(args: any): Promise<any> {
    if (!args.userId) {
      throw new Error("userId is required for delete_user action");
    }

    await this.apiRequest(`/users/${args.userId}`, 'DELETE');
    
    return {
      success: true,
      action: 'delete_user',
      userId: args.userId,
      timestamp: new Date().toISOString()
    };
  }

  private async listUsers(args: any): Promise<any> {
    const params = new URLSearchParams();
    if (args.status) params.append('status', args.status);
    if (args.pageSize) params.append('page_size', args.pageSize.toString());
    if (args.pageNumber) params.append('page_number', args.pageNumber.toString());

    const result = await this.apiRequest(`/users?${params}`);
    
    return {
      success: true,
      action: 'list_users',
      users: result.users,
      pagination: {
        pageCount: result.page_count,
        pageNumber: result.page_number,
        pageSize: result.page_size,
        totalRecords: result.total_records
      },
      timestamp: new Date().toISOString()
    };
  }

  private async getUser(args: any): Promise<any> {
    if (!args.userId) {
      throw new Error("userId is required for get_user action");
    }

    const result = await this.apiRequest(`/users/${args.userId}`);
    
    return {
      success: true,
      action: 'get_user',
      userId: args.userId,
      user: result,
      timestamp: new Date().toISOString()
    };
  }

  private async createWebinar(args: any): Promise<any> {
    if (!args.userId) {
      throw new Error("userId is required for create_webinar action");
    }

    if (!args.topic) {
      throw new Error("topic is required for create_webinar action");
    }

    const webinarData: any = {
      topic: args.topic,
      type: args.type || 5,
      duration: args.duration || 60
    };

    if (args.startTime) webinarData.start_time = args.startTime;
    if (args.timezone) webinarData.timezone = args.timezone;
    if (args.password) webinarData.password = args.password;
    if (args.agenda) webinarData.agenda = args.agenda;
    if (args.recurrence) webinarData.recurrence = args.recurrence;
    if (args.settings) webinarData.settings = args.settings;
    if (args.registrationType) webinarData.settings = { ...webinarData.settings, registration_type: args.registrationType };

    const result = await this.apiRequest(`/users/${args.userId}/webinars`, 'POST', webinarData);
    
    return {
      success: true,
      action: 'create_webinar',
      webinarId: result.id,
      webinar: result,
      joinUrl: result.join_url,
      registrationUrl: result.registration_url,
      timestamp: new Date().toISOString()
    };
  }

  private async listWebinars(args: any): Promise<any> {
    if (!args.userId) {
      throw new Error("userId is required for list_webinars action");
    }

    const params = new URLSearchParams();
    if (args.pageSize) params.append('page_size', args.pageSize.toString());
    if (args.pageNumber) params.append('page_number', args.pageNumber.toString());

    const result = await this.apiRequest(`/users/${args.userId}/webinars?${params}`);
    
    return {
      success: true,
      action: 'list_webinars',
      userId: args.userId,
      webinars: result.webinars,
      pagination: {
        pageCount: result.page_count,
        pageNumber: result.page_number,
        pageSize: result.page_size,
        totalRecords: result.total_records
      },
      timestamp: new Date().toISOString()
    };
  }

  private async getRecordings(args: any): Promise<any> {
    if (!args.userId) {
      throw new Error("userId is required for get_recordings action");
    }

    const params = new URLSearchParams();
    if (args.from) params.append('from', args.from);
    if (args.to) params.append('to', args.to);
    if (args.pageSize) params.append('page_size', args.pageSize.toString());
    if (args.nextPageToken) params.append('next_page_token', args.nextPageToken);
    if (args.type_filter) params.append('mc', args.type_filter);

    const result = await this.apiRequest(`/users/${args.userId}/recordings?${params}`);
    
    return {
      success: true,
      action: 'get_recordings',
      userId: args.userId,
      recordings: result.meetings,
      pagination: {
        pageSize: result.page_size,
        totalRecords: result.total_records,
        nextPageToken: result.next_page_token
      },
      timestamp: new Date().toISOString()
    };
  }

  private async getAnalytics(args: any): Promise<any> {
    const params = new URLSearchParams();
    if (args.from) params.append('from', args.from);
    if (args.to) params.append('to', args.to);
    if (args.pageSize) params.append('page_size', args.pageSize.toString());
    if (args.nextPageToken) params.append('next_page_token', args.nextPageToken);

    const result = await this.apiRequest(`/report/daily?${params}`);
    
    return {
      success: true,
      action: 'get_analytics',
      analytics: result,
      timestamp: new Date().toISOString()
    };
  }

  private async getAccount(args: any): Promise<any> {
    const result = await this.apiRequest('/accounts/me');
    
    return {
      success: true,
      action: 'get_account',
      account: result,
      timestamp: new Date().toISOString()
    };
  }

  private async registerWebinar(args: any): Promise<any> {
    if (!args.webinarId) {
      throw new Error("webinarId is required for register_webinar action");
    }

    if (!args.registrantEmail || !args.registrantName) {
      throw new Error("registrantEmail and registrantName are required for register_webinar action");
    }

    const registrationData: any = {
      email: args.registrantEmail,
      first_name: args.registrantName.split(' ')[0],
      last_name: args.registrantName.split(' ').slice(1).join(' ') || ''
    };

    const result = await this.apiRequest(`/webinars/${args.webinarId}/registrants`, 'POST', registrationData);
    
    return {
      success: true,
      action: 'register_webinar',
      webinarId: args.webinarId,
      registrantId: result.id,
      joinUrl: result.join_url,
      registrant: result,
      timestamp: new Date().toISOString()
    };
  }

  private async listWebinarRegistrants(args: any): Promise<any> {
    if (!args.webinarId) {
      throw new Error("webinarId is required for list_webinar_registrants action");
    }

    const params = new URLSearchParams();
    if (args.status) params.append('status', args.status);
    if (args.pageSize) params.append('page_size', args.pageSize.toString());
    if (args.pageNumber) params.append('page_number', args.pageNumber.toString());

    const result = await this.apiRequest(`/webinars/${args.webinarId}/registrants?${params}`);
    
    return {
      success: true,
      action: 'list_webinar_registrants',
      webinarId: args.webinarId,
      registrants: result.registrants,
      pagination: {
        pageCount: result.page_count,
        pageNumber: result.page_number,
        pageSize: result.page_size,
        totalRecords: result.total_records
      },
      timestamp: new Date().toISOString()
    };
  }

  private async approveRegistrants(args: any): Promise<any> {
    if (!args.webinarId) {
      throw new Error("webinarId is required for approve_registrants action");
    }

    if (!args.registrantIds || !args.approvalType) {
      throw new Error("registrantIds and approvalType are required for approve_registrants action");
    }

    const approvalData = {
      action: args.approvalType,
      registrants: args.registrantIds.map((id: string) => ({ id }))
    };

    await this.apiRequest(`/webinars/${args.webinarId}/registrants/status`, 'PUT', approvalData);
    
    return {
      success: true,
      action: 'approve_registrants',
      webinarId: args.webinarId,
      approvalType: args.approvalType,
      processedCount: args.registrantIds.length,
      timestamp: new Date().toISOString()
    };
  }

  private async sendInvitation(args: any): Promise<any> {
    if (!args.meetingId) {
      throw new Error("meetingId is required for send_invitation action");
    }

    if (!args.inviteEmails || args.inviteEmails.length === 0) {
      throw new Error("inviteEmails is required for send_invitation action");
    }

    const invitationData = {
      attendees: args.inviteEmails.map((email: string) => ({ email }))
    };

    const result = await this.apiRequest(`/meetings/${args.meetingId}/invitation`, 'PATCH', invitationData);
    
    return {
      success: true,
      action: 'send_invitation',
      meetingId: args.meetingId,
      invitedCount: args.inviteEmails.length,
      invitation: result.invitation,
      timestamp: new Date().toISOString()
    };
  }

  private async updateMeetingStatus(args: any): Promise<any> {
    if (!args.meetingId) {
      throw new Error("meetingId is required for update_meeting_status action");
    }

    if (!args.meetingStatus) {
      throw new Error("meetingStatus is required for update_meeting_status action");
    }

    const statusData = {
      action: args.meetingStatus
    };

    await this.apiRequest(`/meetings/${args.meetingId}/status`, 'PATCH', statusData);
    
    return {
      success: true,
      action: 'update_meeting_status',
      meetingId: args.meetingId,
      status: args.meetingStatus,
      timestamp: new Date().toISOString()
    };
  }

  private async createBreakoutRooms(args: any): Promise<any> {
    if (!args.meetingId) {
      throw new Error("meetingId is required for create_breakout_rooms action");
    }

    if (!args.breakoutRooms || args.breakoutRooms.length === 0) {
      throw new Error("breakoutRooms configuration is required for create_breakout_rooms action");
    }

    const breakoutData = {
      breakout_rooms: args.breakoutRooms.map((room: any) => ({
        name: room.name,
        participants: room.participants
      }))
    };

    const result = await this.apiRequest(`/meetings/${args.meetingId}/breakout_rooms`, 'POST', breakoutData);
    
    return {
      success: true,
      action: 'create_breakout_rooms',
      meetingId: args.meetingId,
      roomsCreated: args.breakoutRooms.length,
      breakoutRooms: result.breakout_rooms,
      timestamp: new Date().toISOString()
    };
  }

  private async updateLiveStream(args: any): Promise<any> {
    if (!args.meetingId) {
      throw new Error("meetingId is required for update_live_stream action");
    }

    if (!args.streamUrl || !args.streamKey) {
      throw new Error("streamUrl and streamKey are required for update_live_stream action");
    }

    const streamData = {
      stream_url: args.streamUrl,
      stream_key: args.streamKey,
      page_url: args.pageUrl || ''
    };

    const result = await this.apiRequest(`/meetings/${args.meetingId}/livestream`, 'PATCH', streamData);
    
    return {
      success: true,
      action: 'update_live_stream',
      meetingId: args.meetingId,
      streamUrl: args.streamUrl,
      streamStatus: result.stream_url ? 'configured' : 'updated',
      timestamp: new Date().toISOString()
    };
  }

  private async getCloudRecording(args: any): Promise<any> {
    if (!args.recordingId) {
      throw new Error("recordingId is required for get_cloud_recording action");
    }

    const result = await this.apiRequest(`/recordings/${args.recordingId}`);
    
    return {
      success: true,
      action: 'get_cloud_recording',
      recordingId: args.recordingId,
      recording: result,
      downloadUrls: result.recording_files?.map((file: any) => ({
        id: file.id,
        file_type: file.file_type,
        download_url: file.download_url,
        file_size: file.file_size
      })) || [],
      timestamp: new Date().toISOString()
    };
  }

  private async createPoll(args: any): Promise<any> {
    if (!args.meetingId) {
      throw new Error("meetingId is required for create_poll action");
    }

    if (!args.pollTitle || !args.pollQuestions) {
      throw new Error("pollTitle and pollQuestions are required for create_poll action");
    }

    const pollData = {
      title: args.pollTitle,
      questions: args.pollQuestions.map((q: any) => ({
        name: q.name,
        type: q.type,
        answers: q.answers
      }))
    };

    const result = await this.apiRequest(`/meetings/${args.meetingId}/polls`, 'POST', pollData);
    
    return {
      success: true,
      action: 'create_poll',
      meetingId: args.meetingId,
      pollId: result.id,
      poll: result,
      questionsCount: args.pollQuestions.length,
      timestamp: new Date().toISOString()
    };
  }

  private async getQASessions(args: any): Promise<any> {
    if (!args.meetingId) {
      throw new Error("meetingId is required for get_qa_sessions action");
    }

    const result = await this.apiRequest(`/report/meetings/${args.meetingId}/qa`);
    
    return {
      success: true,
      action: 'get_qa_sessions',
      meetingId: args.meetingId,
      qaData: result,
      questions: result.questions || [],
      questionsCount: result.questions?.length || 0,
      timestamp: new Date().toISOString()
    };
  }
}
