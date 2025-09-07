import { FunctionDeclaration, Type } from "@google/genai";
import { getValidOAuthAccessToken } from "@/lib/oauth-refresh";
import axios, { AxiosInstance } from 'axios';

export interface CalendlyConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

export interface CalendlyUser {
  uri: string;
  name: string;
  slug: string;
  email: string;
  scheduling_url: string;
  timezone: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  current_organization: string;
}

export interface CalendlyEvent {
  uri: string;
  name: string;
  meeting_notes_plain?: string;
  meeting_notes_html?: string;
  status: 'active' | 'canceled';
  start_time: string;
  end_time: string;
  event_type: string;
  location?: {
    type: string;
    location?: string;
    join_url?: string;
  };
  invitees_counter: {
    total: number;
    active: number;
    limit: number;
  };
  created_at: string;
  updated_at: string;
  event_memberships: Array<{
    user: string;
    user_email?: string;
    user_name?: string;
  }>;
  event_guests: Array<{
    email: string;
    created_at: string;
    updated_at: string;
  }>;
}

export interface CalendlyEventType {
  uri: string;
  name: string;
  active: boolean;
  slug: string;
  scheduling_url: string;
  duration: number;
  kind: 'solo' | 'group' | 'collective' | 'round_robin';
  pooling_type?: 'round_robin' | 'collective';
  type: 'StandardEventType' | 'AdhocEventType';
  color: string;
  created_at: string;
  updated_at: string;
  internal_note?: string;
  description_plain?: string;
  description_html?: string;
  profile: {
    type: string;
    name: string;
    owner: string;
  };
  secret: boolean;
  booking_method?: 'instant' | 'confirmation_required';
  custom_questions: Array<{
    name: string;
    type: 'string' | 'text' | 'phone_number' | 'boolean' | 'single_select' | 'multi_select';
    position: number;
    enabled: boolean;
    required: boolean;
    answer_choices?: string[];
    include_other?: boolean;
  }>;
}

export interface CalendlyInvitee {
  uri: string;
  name: string;
  email: string;
  status: 'active' | 'canceled';
  timezone: string;
  event: string;
  created_at: string;
  updated_at: string;
  cancel_url: string;
  reschedule_url: string;
  routing_form_submission?: string;
  questions_and_answers: Array<{
    question: string;
    answer: string;
    position: number;
  }>;
  tracking: {
    utm_campaign?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_content?: string;
    utm_term?: string;
    salesforce_uuid?: string;
  };
  text_reminder_number?: string;
  rescheduled: boolean;
  old_invitee?: string;
  new_invitee?: string;
  cancellation?: {
    canceled_by: string;
    reason?: string;
    canceler_type: 'invitee' | 'host';
  };
  payment?: {
    external_id: string;
    provider: string;
    amount: number;
    currency: string;
    terms: string;
    successful: boolean;
  };
}

export interface CalendlyWebhook {
  uri: string;
  callback_url: string;
  created_at: string;
  updated_at: string;
  retry_started_at?: string;
  state: 'active' | 'disabled';
  events: string[];
  scope: 'user' | 'organization';
  organization: string;
  user?: string;
  creator: string;
}

export interface CalendlyAvailabilitySchedule {
  uri: string;
  name: string;
  timezone: string;
  default: boolean;
  rules: Array<{
    type: 'wday' | 'date';
    wday?: string;
    date?: string;
    intervals: Array<{
      from: string;
      to: string;
    }>;
  }>;
  created_at: string;
  updated_at: string;
  user: string;
}

export class CalendlyTool {
  private client: AxiosInstance;
  private apiKey: string | null;
  private oauthToken: string | null;
  private userId: string;

  constructor(config: CalendlyConfig, userId: string, oauthToken: string | null = null) {
    this.apiKey = config.apiKey || null;
    this.oauthToken = oauthToken;
    this.userId = userId;
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.calendly.com',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "calendly_tool",
      description: "Comprehensive Calendly scheduling platform tool for managing users, events, event types, availability, webhooks, and scheduling workflows and many more. Supports both API key and OAuth authentication.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: [
              // User Management
              "get_current_user",
              "get_user",
              "get_organization_membership",
              "list_organization_memberships",
              
              // Event Management
              "get_event",
              "list_events",
              "cancel_event",
              
              // Event Types
              "get_event_type",
              "list_event_types",
              "create_event_type",
              "update_event_type",
              "delete_event_type",
              "get_event_type_available_times",
              
              // Invitees
              "get_invitee",
              "list_invitees",
              "create_invitee",
              "cancel_invitee",
              "list_event_invitees",
              
              // Availability
              "get_user_availability",
              "list_availability_schedules",
              "get_availability_schedule",
              "create_availability_schedule",
              "update_availability_schedule",
              "delete_availability_schedule",
              
              // Webhooks
              "create_webhook",
              "list_webhooks",
              "get_webhook",
              "delete_webhook",
              
              // Organizations
              "get_organization",
              "list_organization_invitations",
              "get_organization_invitation",
              "revoke_organization_invitation",
              "invite_user_to_organization",
              "remove_user_from_organization",
              
              // Activity Log
              "get_activity_log_entries",
              
              // Routing Forms (Enterprise)
              "list_routing_forms",
              "get_routing_form",
              "list_routing_form_submissions",
              "get_routing_form_submission",
              
              // Data Compliance
              "create_data_compliance_deletion_request",
              "get_data_compliance_deletion_request",
              "list_data_compliance_deletion_requests",
              
              // Scheduled Events (Bulk Operations)
              "bulk_cancel_events",
              "bulk_reschedule_events",
              
              // Analytics & Reporting
              "get_analytics_summary",
              "export_events_data",
              
              // Helper Actions
              "get_scheduling_links",
              "check_availability",
              "get_organization_users",
              "search_events",
              "get_upcoming_events",
              "get_past_events"
            ]
          },
          
          // User and Organization Parameters
          user_uri: {
            type: Type.STRING,
            description: "User URI (e.g., 'https://api.calendly.com/users/AAAAAAAAAAAAAAAA')"
          },
          organization_uri: {
            type: Type.STRING,
            description: "Organization URI"
          },
          email: {
            type: Type.STRING,
            description: "Email address for user operations"
          },
          
          // Event Parameters
          event_uri: {
            type: Type.STRING,
            description: "Event URI"
          },
          event_type_uri: {
            type: Type.STRING,
            description: "Event type URI"
          },
          start_time: {
            type: Type.STRING,
            description: "Start time in ISO 8601 format (e.g., '2024-01-15T10:00:00Z')"
          },
          end_time: {
            type: Type.STRING,
            description: "End time in ISO 8601 format"
          },
          status: {
            type: Type.STRING,
            description: "Event or invitee status",
            enum: ["active", "canceled"]
          },
          
          // Event Type Parameters
          name: {
            type: Type.STRING,
            description: "Name of the event type or resource"
          },
          duration: {
            type: Type.NUMBER,
            description: "Duration in minutes"
          },
          event_type_name: {
            type: Type.STRING,
            description: "Name of the event type"
          },
          description_plain: {
            type: Type.STRING,
            description: "Plain text description"
          },
          description_html: {
            type: Type.STRING,
            description: "HTML description"
          },
          location_type: {
            type: Type.STRING,
            description: "Location type",
            enum: ["physical", "inbound_call", "outbound_call", "zoom", "gotomeeting", "webex", "microsoft_teams", "custom"]
          },
          location_value: {
            type: Type.STRING,
            description: "Location value (address, phone number, meeting URL, etc.)"
          },
          color: {
            type: Type.STRING,
            description: "Event type color (hex code)"
          },
          active: {
            type: Type.BOOLEAN,
            description: "Whether the event type is active"
          },
          booking_method: {
            type: Type.STRING,
            description: "Booking method",
            enum: ["instant", "confirmation_required"]
          },
          
          // Invitee Parameters
          invitee_uri: {
            type: Type.STRING,
            description: "Invitee URI"
          },
          invitee_email: {
            type: Type.STRING,
            description: "Invitee email address"
          },
          invitee_name: {
            type: Type.STRING,
            description: "Invitee name"
          },
          timezone: {
            type: Type.STRING,
            description: "Timezone (e.g., 'America/New_York')"
          },
          
          // Webhook Parameters
          webhook_uri: {
            type: Type.STRING,
            description: "Webhook URI"
          },
          callback_url: {
            type: Type.STRING,
            description: "Webhook callback URL"
          },
          webhook_events: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of webhook events to subscribe to",
            enum: ["invitee.created", "invitee.canceled"]
          },
          webhook_scope: {
            type: Type.STRING,
            description: "Webhook scope",
            enum: ["user", "organization"]
          },
          signing_key: {
            type: Type.STRING,
            description: "Webhook signing key for verification"
          },
          
          // Availability Parameters
          schedule_uri: {
            type: Type.STRING,
            description: "Availability schedule URI"
          },
          schedule_name: {
            type: Type.STRING,
            description: "Availability schedule name"
          },
          is_default: {
            type: Type.BOOLEAN,
            description: "Whether this is the default schedule"
          },
          availability_rules: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT },
            description: "Array of availability rules"
          },
          
          // Filtering and Query Parameters
          count: {
            type: Type.NUMBER,
            description: "Number of results to return (max 100)"
          },
          page_token: {
            type: Type.STRING,
            description: "Page token for pagination"
          },
          sort: {
            type: Type.STRING,
            description: "Sort order",
            enum: ["start_time:asc", "start_time:desc", "created_at:asc", "created_at:desc"]
          },
          min_start_time: {
            type: Type.STRING,
            description: "Minimum start time filter (ISO 8601)"
          },
          max_start_time: {
            type: Type.STRING,
            description: "Maximum start time filter (ISO 8601)"
          },
          
          // Custom Questions
          custom_questions: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT },
            description: "Array of custom questions for event types"
          },
          
          // Cancellation Parameters
          reason: {
            type: Type.STRING,
            description: "Cancellation reason"
          },
          canceler_type: {
            type: Type.STRING,
            description: "Who canceled the event",
            enum: ["host", "invitee"]
          },
          
          // Search Parameters
          search_term: {
            type: Type.STRING,
            description: "Search term for filtering results"
          },
          
          // Bulk Operations
          event_uris: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of event URIs for bulk operations"
          },
          
          // Data Compliance
          compliance_request_uri: {
            type: Type.STRING,
            description: "Data compliance request URI"
          },
          
          // Analytics Parameters
          analytics_range: {
            type: Type.STRING,
            description: "Analytics date range",
            enum: ["last_30_days", "last_90_days", "last_year", "custom"]
          },
          
          // Routing Forms (Enterprise)
          routing_form_uri: {
            type: Type.STRING,
            description: "Routing form URI"
          },
          routing_form_submission_uri: {
            type: Type.STRING,
            description: "Routing form submission URI"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`📅 Calendly Action: ${args.action}`);

      // Setup authentication headers
      let headers: any = {
        'Content-Type': 'application/json'
      };

      // Check for OAuth token first, then fallback to API key
      let accessToken: string | null = this.oauthToken;
      if (!accessToken) {
        accessToken = await getValidOAuthAccessToken(this.userId, "calendly");
      }

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      } else if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      } else {
        throw new Error("No valid authentication method available. Provide either OAuth token or API key.");
      }
      
      this.client.defaults.headers.common['Authorization'] = headers['Authorization'];

      switch (args.action) {
        // User Management
        case "get_current_user":
          return await this.getCurrentUser();
        case "get_user":
          return await this.getUser(args);
        case "get_organization_membership":
          return await this.getOrganizationMembership(args);
        case "list_organization_memberships":
          return await this.listOrganizationMemberships(args);
        
        // Event Management
        case "get_event":
          return await this.getEvent(args);
        case "list_events":
          return await this.listEvents(args);
        case "cancel_event":
          return await this.cancelEvent(args);
        
        // Event Types
        case "get_event_type":
          return await this.getEventType(args);
        case "list_event_types":
          return await this.listEventTypes(args);
        case "create_event_type":
          return await this.createEventType(args);
        case "update_event_type":
          return await this.updateEventType(args);
        case "delete_event_type":
          return await this.deleteEventType(args);
        case "get_event_type_available_times":
          return await this.getEventTypeAvailableTimes(args);
        
        // Invitees
        case "get_invitee":
          return await this.getInvitee(args);
        case "list_invitees":
          return await this.listInvitees(args);
        case "create_invitee":
          return await this.createInvitee(args);
        case "cancel_invitee":
          return await this.cancelInvitee(args);
        case "list_event_invitees":
          return await this.listEventInvitees(args);
        
        // Availability
        case "get_user_availability":
          return await this.getUserAvailability(args);
        case "list_availability_schedules":
          return await this.listAvailabilitySchedules(args);
        case "get_availability_schedule":
          return await this.getAvailabilitySchedule(args);
        case "create_availability_schedule":
          return await this.createAvailabilitySchedule(args);
        case "update_availability_schedule":
          return await this.updateAvailabilitySchedule(args);
        case "delete_availability_schedule":
          return await this.deleteAvailabilitySchedule(args);
        
        // Webhooks
        case "create_webhook":
          return await this.createWebhook(args);
        case "list_webhooks":
          return await this.listWebhooks(args);
        case "get_webhook":
          return await this.getWebhook(args);
        case "delete_webhook":
          return await this.deleteWebhook(args);
        
        // Organizations
        case "get_organization":
          return await this.getOrganization(args);
        case "list_organization_invitations":
          return await this.listOrganizationInvitations(args);
        case "get_organization_invitation":
          return await this.getOrganizationInvitation(args);
        case "revoke_organization_invitation":
          return await this.revokeOrganizationInvitation(args);
        case "invite_user_to_organization":
          return await this.inviteUserToOrganization(args);
        case "remove_user_from_organization":
          return await this.removeUserFromOrganization(args);
        
        // Activity Log
        case "get_activity_log_entries":
          return await this.getActivityLogEntries(args);
        
        // Routing Forms
        case "list_routing_forms":
          return await this.listRoutingForms(args);
        case "get_routing_form":
          return await this.getRoutingForm(args);
        case "list_routing_form_submissions":
          return await this.listRoutingFormSubmissions(args);
        case "get_routing_form_submission":
          return await this.getRoutingFormSubmission(args);
        
        // Data Compliance
        case "create_data_compliance_deletion_request":
          return await this.createDataComplianceDeletionRequest(args);
        case "get_data_compliance_deletion_request":
          return await this.getDataComplianceDeletionRequest(args);
        case "list_data_compliance_deletion_requests":
          return await this.listDataComplianceDeletionRequests(args);
        
        // Helper Actions
        case "get_scheduling_links":
          return await this.getSchedulingLinks(args);
        case "check_availability":
          return await this.checkAvailability(args);
        case "get_organization_users":
          return await this.getOrganizationUsers(args);
        case "search_events":
          return await this.searchEvents(args);
        case "get_upcoming_events":
          return await this.getUpcomingEvents(args);
        case "get_past_events":
          return await this.getPastEvents(args);
        case "bulk_cancel_events":
          return await this.bulkCancelEvents(args);
        case "get_analytics_summary":
          return await this.getAnalyticsSummary(args);

        default:
          throw new Error(`Unknown action: ${args.action}`);
      }
    } catch (error: any) {
      console.error(`❌ Calendly operation failed:`, error.response?.data || error.message);
      return {
        success: false,
        error: `Calendly operation failed: ${error.response?.data?.message || error.message}`,
        action: args.action,
        timestamp: new Date().toISOString(),
        details: error.response?.data?.details || null
      };
    }
  }

  // ========================================
  // ==         USER MANAGEMENT            ==
  // ========================================

  private async getCurrentUser(): Promise<any> {
    const response = await this.client.get('/users/me');
    return {
      success: true,
      action: "get_current_user",
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  private async getUser(args: any): Promise<any> {
    this.validateRequired(args, ["user_uri"]);
    const userUuid = this.extractUuidFromUri(args.user_uri);
    const response = await this.client.get(`/users/${userUuid}`);
    return {
      success: true,
      action: "get_user",
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  private async getOrganizationMembership(args: any): Promise<any> {
    this.validateRequired(args, ["user_uri"]);
    const params: any = {};
    if (args.user_uri) params.user = args.user_uri;
    if (args.organization_uri) params.organization = args.organization_uri;

    const response = await this.client.get('/organization_memberships', { params });
    return {
      success: true,
      action: "get_organization_membership",
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  private async listOrganizationMemberships(args: any): Promise<any> {
    const params: any = this.buildPaginationParams(args);
    if (args.user_uri) params.user = args.user_uri;
    if (args.organization_uri) params.organization = args.organization_uri;
    if (args.email) params.email = args.email;

    const response = await this.client.get('/organization_memberships', { params });
    return {
      success: true,
      action: "list_organization_memberships",
      data: response.data,
      count: response.data.collection?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  // ========================================
  // ==        EVENT MANAGEMENT            ==
  // ========================================

  private async getEvent(args: any): Promise<any> {
    this.validateRequired(args, ["event_uri"]);
    const eventUuid = this.extractUuidFromUri(args.event_uri);
    const response = await this.client.get(`/scheduled_events/${eventUuid}`);
    return {
      success: true,
      action: "get_event",
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  private async listEvents(args: any): Promise<any> {
    const params: any = this.buildPaginationParams(args);
    if (args.user_uri) params.user = args.user_uri;
    if (args.organization_uri) params.organization = args.organization_uri;
    if (args.min_start_time) params.min_start_time = args.min_start_time;
    if (args.max_start_time) params.max_start_time = args.max_start_time;
    if (args.status) params.status = args.status;
    if (args.sort) params.sort = args.sort;

    const response = await this.client.get('/scheduled_events', { params });
    return {
      success: true,
      action: "list_events",
      data: response.data,
      count: response.data.collection?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async cancelEvent(args: any): Promise<any> {
    this.validateRequired(args, ["event_uri"]);
    const eventUuid = this.extractUuidFromUri(args.event_uri);
    const cancelData: any = {};
    if (args.reason) cancelData.reason = args.reason;

    const response = await this.client.post(`/scheduled_events/${eventUuid}/cancellation`, cancelData);
    return {
      success: true,
      action: "cancel_event",
      data: response.data,
      message: `Event ${args.event_uri} canceled successfully`,
      timestamp: new Date().toISOString()
    };
  }

  // ========================================
  // ==        EVENT TYPES                 ==
  // ========================================

  private async getEventTypeAvailableTimes(args: any): Promise<any> {
    this.validateRequired(args, ["event_type_uri", "start_time", "end_time"]);
    const eventTypeUuid = this.extractUuidFromUri(args.event_type_uri);
    
    const params: any = {
      start_time: args.start_time,
      end_time: args.end_time
    };
    
    const response = await this.client.get(`/event_types/${eventTypeUuid}/available_times`, { params });
    return {
      success: true,
      action: "get_event_type_available_times",
      data: response.data,
      count: response.data.collection?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  // ========================================
  // ==           INVITEES                 ==
  // ========================================

  private async getInvitee(args: any): Promise<any> {
    this.validateRequired(args, ["invitee_uri"]);
    const inviteeUuid = this.extractUuidFromUri(args.invitee_uri);
    const response = await this.client.get(`/scheduled_events/${inviteeUuid}/invitees`);
    return {
      success: true,
      action: "get_invitee",
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  private async listInvitees(args: any): Promise<any> {
    const params: any = this.buildPaginationParams(args);
    if (args.user_uri) params.user = args.user_uri;
    if (args.organization_uri) params.organization = args.organization_uri;
    if (args.status) params.status = args.status;
    if (args.sort) params.sort = args.sort;
    if (args.email) params.email = args.email;

    const response = await this.client.get('/scheduled_events/invitees', { params });
    return {
      success: true,
      action: "list_invitees",
      data: response.data,
      count: response.data.collection?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async createInvitee(args: any): Promise<any> {
    this.validateRequired(args, ["event_type_uri", "start_time", "invitee_email", "invitee_name"]);
    
    const inviteeData: any = {
      email: args.invitee_email,
      name: args.invitee_name,
      event_type: args.event_type_uri,
      start_time: args.start_time
    };

    if (args.timezone) inviteeData.timezone = args.timezone;
    if (args.custom_questions) inviteeData.questions_and_responses = args.custom_questions;

    const response = await this.client.post('/scheduled_events', inviteeData);
    return {
      success: true,
      action: "create_invitee",
      data: response.data,
      invitee_uri: response.data.resource.uri,
      message: `Event scheduled for ${args.invitee_name}`,
      timestamp: new Date().toISOString()
    };
  }

  private async cancelInvitee(args: any): Promise<any> {
    this.validateRequired(args, ["invitee_uri"]);
    const inviteeUuid = this.extractUuidFromUri(args.invitee_uri);
    
    const cancelData: any = {};
    if (args.reason) cancelData.reason = args.reason;

    const response = await this.client.post(`/invitee_no_shows/${inviteeUuid}/cancellation`, cancelData);
    return {
      success: true,
      action: "cancel_invitee",
      data: response.data,
      message: `Invitee ${args.invitee_uri} canceled successfully`,
      timestamp: new Date().toISOString()
    };
  }

  private async listEventInvitees(args: any): Promise<any> {
    this.validateRequired(args, ["event_uri"]);
    const eventUuid = this.extractUuidFromUri(args.event_uri);
    const params: any = this.buildPaginationParams(args);

    const response = await this.client.get(`/scheduled_events/${eventUuid}/invitees`, { params });
    return {
      success: true,
      action: "list_event_invitees",
      data: response.data,
      count: response.data.collection?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  // ========================================
  // ==         AVAILABILITY               ==
  // ========================================

  private async getUserAvailability(args: any): Promise<any> {
    this.validateRequired(args, ["user_uri", "start_time", "end_time"]);
    const userUuid = this.extractUuidFromUri(args.user_uri);
    
    const params: any = {
      start_time: args.start_time,
      end_time: args.end_time
    };

    const response = await this.client.get(`/users/${userUuid}/availability`, { params });
    return {
      success: true,
      action: "get_user_availability",
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  private async listAvailabilitySchedules(args: any): Promise<any> {
    this.validateRequired(args, ["user_uri"]);
    const userUuid = this.extractUuidFromUri(args.user_uri);
    const params: any = this.buildPaginationParams(args);

    const response = await this.client.get(`/users/${userUuid}/availability_schedules`, { params });
    return {
      success: true,
      action: "list_availability_schedules",
      data: response.data,
      count: response.data.collection?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async getAvailabilitySchedule(args: any): Promise<any> {
    this.validateRequired(args, ["schedule_uri"]);
    const scheduleUuid = this.extractUuidFromUri(args.schedule_uri);
    const response = await this.client.get(`/availability_schedules/${scheduleUuid}`);
    return {
      success: true,
      action: "get_availability_schedule",
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  private async createAvailabilitySchedule(args: any): Promise<any> {
    this.validateRequired(args, ["user_uri", "schedule_name", "timezone"]);
    const userUuid = this.extractUuidFromUri(args.user_uri);
    
    const scheduleData: any = {
      name: args.schedule_name,
      timezone: args.timezone,
      default: args.is_default || false
    };

    if (args.availability_rules) scheduleData.rules = args.availability_rules;

    const response = await this.client.post(`/users/${userUuid}/availability_schedules`, scheduleData);
    return {
      success: true,
      action: "create_availability_schedule",
      data: response.data,
      schedule_uri: response.data.resource.uri,
      message: `Availability schedule "${args.schedule_name}" created successfully`,
      timestamp: new Date().toISOString()
    };
  }

  private async updateAvailabilitySchedule(args: any): Promise<any> {
    this.validateRequired(args, ["schedule_uri"]);
    const scheduleUuid = this.extractUuidFromUri(args.schedule_uri);
    
    const updateData: any = {};
    if (args.schedule_name) updateData.name = args.schedule_name;
    if (args.timezone) updateData.timezone = args.timezone;
    if (args.is_default !== undefined) updateData.default = args.is_default;
    if (args.availability_rules) updateData.rules = args.availability_rules;

    const response = await this.client.patch(`/availability_schedules/${scheduleUuid}`, updateData);
    return {
      success: true,
      action: "update_availability_schedule",
      data: response.data,
      message: `Availability schedule ${args.schedule_uri} updated successfully`,
      timestamp: new Date().toISOString()
    };
  }

  private async deleteAvailabilitySchedule(args: any): Promise<any> {
    this.validateRequired(args, ["schedule_uri"]);
    const scheduleUuid = this.extractUuidFromUri(args.schedule_uri);
    
    await this.client.delete(`/availability_schedules/${scheduleUuid}`);
    return {
      success: true,
      action: "delete_availability_schedule",
      message: `Availability schedule ${args.schedule_uri} deleted successfully`,
      timestamp: new Date().toISOString()
    };
  }

  // ========================================
  // ==           WEBHOOKS                 ==
  // ========================================

  private async createWebhook(args: any): Promise<any> {
    this.validateRequired(args, ["callback_url", "webhook_events"]);
    
    const webhookData: any = {
      url: args.callback_url,
      events: args.webhook_events,
      organization: args.organization_uri,
      scope: args.webhook_scope || "organization"
    };

    if (args.user_uri && args.webhook_scope === "user") {
      webhookData.user = args.user_uri;
    }
    if (args.signing_key) webhookData.signing_key = args.signing_key;

    const response = await this.client.post('/webhook_subscriptions', webhookData);
    return {
      success: true,
      action: "create_webhook",
      data: response.data,
      webhook_uri: response.data.resource.uri,
      message: "Webhook created successfully",
      timestamp: new Date().toISOString()
    };
  }

  private async listWebhooks(args: any): Promise<any> {
    this.validateRequired(args, ["organization_uri"]);
    const params: any = this.buildPaginationParams(args);
    params.organization = args.organization_uri;
    if (args.user_uri && args.webhook_scope === "user") params.user = args.user_uri;

    const response = await this.client.get('/webhook_subscriptions', { params });
    return {
      success: true,
      action: "list_webhooks",
      data: response.data,
      count: response.data.collection?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async getWebhook(args: any): Promise<any> {
    this.validateRequired(args, ["webhook_uri"]);
    const webhookUuid = this.extractUuidFromUri(args.webhook_uri);
    const response = await this.client.get(`/webhook_subscriptions/${webhookUuid}`);
    return {
      success: true,
      action: "get_webhook",
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  private async deleteWebhook(args: any): Promise<any> {
    this.validateRequired(args, ["webhook_uri"]);
    const webhookUuid = this.extractUuidFromUri(args.webhook_uri);
    
    await this.client.delete(`/webhook_subscriptions/${webhookUuid}`);
    return {
      success: true,
      action: "delete_webhook",
      message: `Webhook ${args.webhook_uri} deleted successfully`,
      timestamp: new Date().toISOString()
    };
  }

  // ========================================
  // ==        ORGANIZATIONS               ==
  // ========================================

  private async getOrganization(args: any): Promise<any> {
    this.validateRequired(args, ["organization_uri"]);
    const orgUuid = this.extractUuidFromUri(args.organization_uri);
    const response = await this.client.get(`/organizations/${orgUuid}`);
    return {
      success: true,
      action: "get_organization",
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  private async listOrganizationInvitations(args: any): Promise<any> {
    this.validateRequired(args, ["organization_uri"]);
    const params: any = this.buildPaginationParams(args);
    params.organization = args.organization_uri;
    if (args.status) params.status = args.status;
    if (args.sort) params.sort = args.sort;

    const response = await this.client.get('/organization_invitations', { params });
    return {
      success: true,
      action: "list_organization_invitations",
      data: response.data,
      count: response.data.collection?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async getOrganizationInvitation(args: any): Promise<any> {
    this.validateRequired(args, ["organization_uri"]);
    const orgUuid = this.extractUuidFromUri(args.organization_uri);
    const response = await this.client.get(`/organizations/${orgUuid}/invitations`);
    return {
      success: true,
      action: "get_organization_invitation",
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  private async revokeOrganizationInvitation(args: any): Promise<any> {
    this.validateRequired(args, ["organization_uri", "email"]);
    const orgUuid = this.extractUuidFromUri(args.organization_uri);
    
    const response = await this.client.delete(`/organizations/${orgUuid}/invitations`, {
      data: { email: args.email }
    });
    return {
      success: true,
      action: "revoke_organization_invitation",
      data: response.data,
      message: `Invitation for ${args.email} revoked successfully`,
      timestamp: new Date().toISOString()
    };
  }

  private async inviteUserToOrganization(args: any): Promise<any> {
    this.validateRequired(args, ["organization_uri", "email"]);
    const orgUuid = this.extractUuidFromUri(args.organization_uri);
    
    const inviteData = {
      email: args.email
    };

    const response = await this.client.post(`/organizations/${orgUuid}/invitations`, inviteData);
    return {
      success: true,
      action: "invite_user_to_organization",
      data: response.data,
      message: `Invitation sent to ${args.email}`,
      timestamp: new Date().toISOString()
    };
  }

  private async removeUserFromOrganization(args: any): Promise<any> {
    this.validateRequired(args, ["organization_uri", "user_uri"]);
    const orgUuid = this.extractUuidFromUri(args.organization_uri);
    const userUuid = this.extractUuidFromUri(args.user_uri);
    
    await this.client.delete(`/organizations/${orgUuid}/memberships/${userUuid}`);
    return {
      success: true,
      action: "remove_user_from_organization",
      message: `User ${args.user_uri} removed from organization`,
      timestamp: new Date().toISOString()
    };
  }

  // ========================================
  // ==       ACTIVITY & ANALYTICS         ==
  // ========================================

  private async getActivityLogEntries(args: any): Promise<any> {
    const params: any = this.buildPaginationParams(args);
    if (args.organization_uri) params.organization = args.organization_uri;
    if (args.user_uri) params.actor = args.user_uri;
    if (args.min_start_time) params.occurred_at_min = args.min_start_time;
    if (args.max_start_time) params.occurred_at_max = args.max_start_time;

    const response = await this.client.get('/activity_log_entries', { params });
    return {
      success: true,
      action: "get_activity_log_entries",
      data: response.data,
      count: response.data.collection?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  // ========================================
  // ==       ROUTING FORMS                ==
  // ========================================

  private async listRoutingForms(args: any): Promise<any> {
    this.validateRequired(args, ["organization_uri"]);
    const params: any = this.buildPaginationParams(args);
    params.organization = args.organization_uri;

    const response = await this.client.get('/routing_forms', { params });
    return {
      success: true,
      action: "list_routing_forms",
      data: response.data,
      count: response.data.collection?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async getRoutingForm(args: any): Promise<any> {
    this.validateRequired(args, ["routing_form_uri"]);
    const formUuid = this.extractUuidFromUri(args.routing_form_uri);
    const response = await this.client.get(`/routing_forms/${formUuid}`);
    return {
      success: true,
      action: "get_routing_form",
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  private async listRoutingFormSubmissions(args: any): Promise<any> {
    this.validateRequired(args, ["routing_form_uri"]);
    const formUuid = this.extractUuidFromUri(args.routing_form_uri);
    const params: any = this.buildPaginationParams(args);

    const response = await this.client.get(`/routing_forms/${formUuid}/submissions`, { params });
    return {
      success: true,
      action: "list_routing_form_submissions",
      data: response.data,
      count: response.data.collection?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async getRoutingFormSubmission(args: any): Promise<any> {
    this.validateRequired(args, ["routing_form_submission_uri"]);
    const submissionUuid = this.extractUuidFromUri(args.routing_form_submission_uri);
    const response = await this.client.get(`/routing_form_submissions/${submissionUuid}`);
    return {
      success: true,
      action: "get_routing_form_submission",
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  // ========================================
  // ==      DATA COMPLIANCE               ==
  // ========================================

  private async createDataComplianceDeletionRequest(args: any): Promise<any> {
    this.validateRequired(args, ["email"]);
    
    const deletionData = {
      emails: [args.email]
    };

    const response = await this.client.post('/data_compliance/deletion/invitees', deletionData);
    return {
      success: true,
      action: "create_data_compliance_deletion_request",
      data: response.data,
      message: `Deletion request created for ${args.email}`,
      timestamp: new Date().toISOString()
    };
  }

  private async getDataComplianceDeletionRequest(args: any): Promise<any> {
    this.validateRequired(args, ["compliance_request_uri"]);
    const requestUuid = this.extractUuidFromUri(args.compliance_request_uri);
    const response = await this.client.get(`/data_compliance/deletion/invitees/${requestUuid}`);
    return {
      success: true,
      action: "get_data_compliance_deletion_request",
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  private async listDataComplianceDeletionRequests(args: any): Promise<any> {
    const params: any = this.buildPaginationParams(args);
    if (args.status) params.status = args.status;

    const response = await this.client.get('/data_compliance/deletion/invitees', { params });
    return {
      success: true,
      action: "list_data_compliance_deletion_requests",
      data: response.data,
      count: response.data.collection?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  // ========================================
  // ==         HELPER METHODS             ==
  // ========================================

  private async getSchedulingLinks(args: any): Promise<any> {
    this.validateRequired(args, ["user_uri"]);
    const eventTypesResponse = await this.listEventTypes({ user_uri: args.user_uri, active: true });
    
    const schedulingLinks = eventTypesResponse.data.collection?.map((eventType: any) => ({
      name: eventType.resource.name,
      scheduling_url: eventType.resource.scheduling_url,
      duration: eventType.resource.duration,
      event_type_uri: eventType.resource.uri
    })) || [];

    return {
      success: true,
      action: "get_scheduling_links",
      data: schedulingLinks,
      count: schedulingLinks.length,
      timestamp: new Date().toISOString()
    };
  }

  private async checkAvailability(args: any): Promise<any> {
    this.validateRequired(args, ["user_uri", "start_time", "end_time"]);
    return await this.getUserAvailability(args);
  }

  private async getOrganizationUsers(args: any): Promise<any> {
    this.validateRequired(args, ["organization_uri"]);
    return await this.listOrganizationMemberships({ organization_uri: args.organization_uri });
  }

  private async searchEvents(args: any): Promise<any> {
    const params: any = this.buildPaginationParams(args);
    if (args.user_uri) params.user = args.user_uri;
    if (args.organization_uri) params.organization = args.organization_uri;
    if (args.search_term) {
      // Note: Calendly API doesn't have built-in text search, so we filter after fetching
      const allEvents = await this.listEvents(args);
      const filteredEvents = allEvents.data.collection?.filter((event: any) => 
        event.resource.name.toLowerCase().includes(args.search_term.toLowerCase()) ||
        (event.resource.meeting_notes_plain && event.resource.meeting_notes_plain.toLowerCase().includes(args.search_term.toLowerCase()))
      ) || [];
      
      return {
        success: true,
        action: "search_events",
        data: { collection: filteredEvents },
        count: filteredEvents.length,
        search_term: args.search_term,
        timestamp: new Date().toISOString()
      };
    }
    
    return await this.listEvents(args);
  }

  private async getUpcomingEvents(args: any): Promise<any> {
    const now = new Date().toISOString();
    const params = {
      ...args,
      min_start_time: now,
      status: "active",
      sort: "start_time:asc"
    };
    
    const response = await this.listEvents(params);
    return {
      success: true,
      action: "get_upcoming_events",
      data: response.data,
      count: response.data.collection?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async getPastEvents(args: any): Promise<any> {
    const now = new Date().toISOString();
    const params = {
      ...args,
      max_start_time: now,
      sort: "start_time:desc"
    };
    
    const response = await this.listEvents(params);
    return {
      success: true,
      action: "get_past_events",
      data: response.data,
      count: response.data.collection?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async bulkCancelEvents(args: any): Promise<any> {
    this.validateRequired(args, ["event_uris"]);
    
    const cancelPromises = args.event_uris.map((eventUri: string) => 
      this.cancelEvent({ event_uri: eventUri, reason: args.reason })
    );

    const results = await Promise.allSettled(cancelPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      success: true,
      action: "bulk_cancel_events",
      total_attempted: args.event_uris.length,
      successful_cancellations: successful,
      failed_cancellations: failed,
      results: results,
      timestamp: new Date().toISOString()
    };
  }

  private async getAnalyticsSummary(args: any): Promise<any> {
    // Note: Calendly doesn't have a dedicated analytics endpoint in v2 API
    // This is a helper that aggregates data from multiple endpoints
    this.validateRequired(args, ["user_uri"]);
    
    const now = new Date();
    const startDate = args.analytics_range === 'last_90_days' ? 
      new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) :
      new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const eventsParams = {
      user_uri: args.user_uri,
      min_start_time: startDate.toISOString(),
      max_start_time: now.toISOString()
    };

    const [eventsResponse, eventTypesResponse] = await Promise.all([
      this.listEvents(eventsParams),
      this.listEventTypes({ user_uri: args.user_uri })
    ]);

    const events = eventsResponse.data.collection || [];
    const activeEvents = events.filter((e: any) => e.resource.status === 'active');
    const canceledEvents = events.filter((e: any) => e.resource.status === 'canceled');

    return {
      success: true,
      action: "get_analytics_summary",
      data: {
        date_range: {
          start: startDate.toISOString(),
          end: now.toISOString(),
          range_type: args.analytics_range || 'last_30_days'
        },
        summary: {
          total_events: events.length,
          active_events: activeEvents.length,
          canceled_events: canceledEvents.length,
          cancellation_rate: events.length > 0 ? (canceledEvents.length / events.length * 100).toFixed(1) + '%' : '0%',
          total_event_types: eventTypesResponse.data.collection?.length || 0
        },
        events: events,
        event_types: eventTypesResponse.data.collection || []
      },
      timestamp: new Date().toISOString()
    };
  }

  // ========================================
  // ==         UTILITY METHODS            ==
  // ========================================

  private buildPaginationParams(args: any): any {
    const params: any = {};
    if (args.count) params.count = Math.min(args.count, 100);
    if (args.page_token) params.page_token = args.page_token;
    return params;
  }

  private extractUuidFromUri(uri: string): string {
    // Extract UUID from Calendly URI format: https://api.calendly.com/users/AAAAAAAAAAAAAAAA
    const parts = uri.split('/');
    return parts[parts.length - 1];
  }

  private validateRequired(args: any, required: string[]): void {
    for (const field of required) {
      if (!args[field]) {
        throw new Error(`Missing required parameter: ${field}`);
      }
    }
  }

  private async getEventType(args: any): Promise<any> {
    this.validateRequired(args, ["event_type_uri"]);
    const eventTypeUuid = this.extractUuidFromUri(args.event_type_uri);
    const response = await this.client.get(`/event_types/${eventTypeUuid}`);
    return {
      success: true,
      action: "get_event_type",
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  private async listEventTypes(args: any): Promise<any> {
    const params: any = this.buildPaginationParams(args);
    if (args.user_uri) params.user = args.user_uri;
    if (args.organization_uri) params.organization = args.organization_uri;
    if (args.active !== undefined) params.active = args.active;
    if (args.sort) params.sort = args.sort;

    const response = await this.client.get('/event_types', { params });
    return {
      success: true,
      action: "list_event_types",
      data: response.data,
      count: response.data.collection?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async createEventType(args: any): Promise<any> {
    this.validateRequired(args, ["name", "duration"]);
    
    const eventTypeData: any = {
      name: args.name,
      duration: args.duration,
      type: "StandardEventType"
    };

    if (args.description_plain) eventTypeData.description_plain = args.description_plain;
    if (args.description_html) eventTypeData.description_html = args.description_html;
    if (args.color) eventTypeData.color = args.color;
    if (args.location_type && args.location_value) {
      eventTypeData.locations = [{
        type: args.location_type,
        location: args.location_value
      }];
    }
    if (args.booking_method) eventTypeData.booking_method = args.booking_method;
    if (args.custom_questions) eventTypeData.custom_questions = args.custom_questions;

    const response = await this.client.post('/event_types', eventTypeData);
    return {
      success: true,
      action: "create_event_type",
      data: response.data,
      event_type_uri: response.data.resource.uri,
      message: `Event type "${args.name}" created successfully`,
      timestamp: new Date().toISOString()
    };
  }

  private async updateEventType(args: any): Promise<any> {
    this.validateRequired(args, ["event_type_uri"]);
    const eventTypeUuid = this.extractUuidFromUri(args.event_type_uri);
    
    const updateData: any = {};
    if (args.name) updateData.name = args.name;
    if (args.duration) updateData.duration = args.duration;
    if (args.description_plain) updateData.description_plain = args.description_plain;
    if (args.description_html) updateData.description_html = args.description_html;
    if (args.color) updateData.color = args.color;
    if (args.active !== undefined) updateData.active = args.active;
    if (args.booking_method) updateData.booking_method = args.booking_method;
    if (args.custom_questions) updateData.custom_questions = args.custom_questions;

    const response = await this.client.patch(`/event_types/${eventTypeUuid}`, updateData);
    return {
      success: true,
      action: "update_event_type",
      data: response.data,
      message: `Event type ${args.event_type_uri} updated successfully`,
      timestamp: new Date().toISOString()
    };
  }

  private async deleteEventType(args: any): Promise<any> {
    this.validateRequired(args, ["event_type_uri"]);
    const eventTypeUuid = this.extractUuidFromUri(args.event_type_uri);
    
    await this.client.delete(`/event_types/${eventTypeUuid}`);
    return {
      success: true,
      action: "delete_event_type",
      message: `Event type ${args.event_type_uri} deleted successfully`,
      timestamp: new Date().toISOString()
    };
  }
}
