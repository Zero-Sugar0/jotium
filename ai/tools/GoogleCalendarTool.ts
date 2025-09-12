//ai/tools/GoogleCalendarTool.ts
import { FunctionDeclaration, Type } from "@google/genai";
import { getValidOAuthAccessToken } from "@/lib/oauth-refresh";

export class GoogleCalendarTool {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "google_calendar_operations",
      description: "Comprehensive Google Calendar management tool for scheduling, event management, and calendar operations. Create and manage events with advanced features like recurring meetings, attendee management, conference links, and availability checking. Supports multiple calendars, sharing permissions, and time zone handling. Perfect for appointment scheduling, meeting coordination, calendar automation, and team collaboration. Requires Google OAuth connection for authentication.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "Calendar operation to perform. Choose from event management (create_event, list_events, update_event, delete_event), calendar management (list_calendars, create_calendar, share_calendar), or advanced features (check_availability, move_event). Each action requires specific parameters.",
            enum: [
              "create_event", "list_events", "get_event", "update_event", "delete_event", 
              "list_calendars", "create_calendar", "update_calendar", "delete_calendar", "clear_calendar",
              "share_calendar", "list_permissions", "remove_permission",
              "check_availability",
              "move_event"
            ]
          },
          // Calendar ID (defaults to 'primary')
          calendarId: {
            type: Type.STRING,
            description: "Calendar ID to work with (default: 'primary' for your main calendar). Use 'primary' for your default calendar, or get specific calendar IDs from list_calendars action. Examples: 'primary', 'en.usa#holiday@group.v.calendar.google.com', or a custom calendar ID"
          },
          // Event creation/update parameters
          summary: {
            type: Type.STRING,
            description: "Event title/summary - the main text that appears in the calendar (required for create_event and update_event). Examples: 'Team Meeting', 'Doctor Appointment', 'Project Deadline', 'Lunch with Sarah'"
          },
          description: {
            type: Type.STRING,
            description: "Event description - detailed information about the event. Can include agenda, notes, links, or any additional details. Supports plain text and basic formatting."
          },
          location: {
            type: Type.STRING,
            description: "Event location - physical address, room number, or virtual meeting link. Examples: 'Conference Room A', '123 Main St, New York', 'https://meet.google.com/abc-defg-hij', 'Zoom: https://zoom.us/j/123456789'"
          },
          startDateTime: {
            type: Type.STRING,
            description: "Event start date/time in ISO 8601 format. For timed events: '2024-03-15T10:00:00Z' (UTC) or '2024-03-15T10:00:00-05:00' (with timezone). For all-day events: '2024-03-15'. Always include timezone offset or use with timeZone parameter."
          },
          endDateTime: {
            type: Type.STRING,
            description: "Event end date/time in ISO 8601 format. For timed events: '2024-03-15T11:00:00Z' (UTC) or '2024-03-15T11:00:00-05:00' (with timezone). For all-day events: '2024-03-15'. Must be after startDateTime."
          },
          timeZone: {
            type: Type.STRING,
            description: "Time zone for the event. Examples: 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo', 'UTC'. Use IANA timezone identifiers. Default: UTC if not specified."
          },
          allDay: {
            type: Type.BOOLEAN,
            description: "Whether this is an all-day event (default: false). When true, event spans entire days without specific times. Useful for holidays, birthdays, or multi-day events."
          },
          attendees: {
            type: Type.ARRAY,
            items: { 
              type: Type.OBJECT,
              properties: {
                email: { type: Type.STRING },
                displayName: { type: Type.STRING },
                optional: { type: Type.BOOLEAN }
              }
            },
            description: "Event attendees - people invited to the meeting. Each attendee needs an email address. Optional attendees are not required to respond. Example: [{'email': 'john@example.com', 'displayName': 'John Smith', 'optional': false}]"
          },
          recurrence: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Recurrence rules for repeating events. Use RRULE format. Examples: ['RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR'] for weekly on Mon/Wed/Fri, ['RRULE:FREQ=DAILY;COUNT=5'] for 5 daily occurrences, ['RRULE:FREQ=MONTHLY;BYMONTHDAY=15'] for monthly on the 15th"
          },
          reminders: {
            type: Type.OBJECT,
            properties: {
              useDefault: { type: Type.BOOLEAN },
              overrides: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    method: { type: Type.STRING },
                    minutes: { type: Type.NUMBER }
                  }
                }
              }
            },
            description: "Event reminders configuration. Set useDefault: true for default reminders, or provide custom overrides. Example: {'useDefault': false, 'overrides': [{'method': 'email', 'minutes': 15}, {'method': 'popup', 'minutes': 5}]}"
          },
          conferenceData: {
            type: Type.OBJECT,
            properties: {
              createRequest: {
                type: Type.OBJECT,
                properties: {
                  requestId: { type: Type.STRING },
                  conferenceSolutionKey: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            description: "Conference/meeting link data for virtual meetings. Automatically creates Google Meet or other conference links. Set createRequest with type 'hangoutsMeet' for Google Meet links."
          },
          // Event ID for get, update, delete operations
          eventId: {
            type: Type.STRING,
            description: "Event ID - unique identifier for existing events (required for get_event, update_event, delete_event). Get event IDs from list_events or create_event operations."
          },
          // List events parameters
          timeMin: {
            type: Type.STRING,
            description: "Lower bound for event start time in ISO format. Use to filter events starting after this time. Example: '2024-03-01T00:00:00Z' to get events from March 1st onwards"
          },
          timeMax: {
            type: Type.STRING,
            description: "Upper bound for event start time in ISO format. Use to filter events starting before this time. Example: '2024-03-31T23:59:59Z' to get events until March 31st"
          },
          maxResults: {
            type: Type.NUMBER,
            description: "Maximum number of events to return (default: 10, max: 2500). Use for pagination and performance. Higher values return more results but may be slower. Use with nextPageToken for large result sets."
          },
          orderBy: {
            type: Type.STRING,
            description: "Order of events returned. 'startTime' sorts by event start time (chronological), 'updated' sorts by last modification time. Use 'startTime' for chronological viewing, 'updated' for recent changes.",
            enum: ["startTime", "updated"]
          },
          // Calendar creation parameters
          calendarSummary: {
            type: Type.STRING,
            description: "Calendar title/summary - the display name for the calendar (required for create_calendar). Examples: 'Work Schedule', 'Personal Appointments', 'Team Events', 'Project Deadlines'"
          },
          calendarDescription: {
            type: Type.STRING,
            description: "Calendar description - detailed information about the calendar's purpose. Useful for shared calendars to explain their use. Example: 'Team meeting schedule and deadlines for Project Alpha'"
          },
          // Permissions
          role: {
            type: Type.STRING,
            description: "The role to grant when sharing calendars. 'reader' for view-only access, 'writer' for full editing rights, 'owner' for complete control including sharing. Choose based on required access level.",
            enum: ["reader", "writer", "owner"]
          },
          scopeType: {
            type: Type.STRING,
            description: "The type of scope when sharing calendars. 'user' for individual email addresses, 'group' for Google Groups, 'domain' for entire organization, 'default' for public access. Use 'user' for specific people.",
            enum: ["user", "group", "domain", "default"]
          },
          scopeValue: {
            type: Type.STRING,
            description: "The email address, group address, or domain name for calendar sharing. For scopeType 'user': 'colleague@company.com', for 'group': 'team@company.com', for 'domain': 'company.com'"
          },
          ruleId: {
            type: Type.STRING,
            description: "The ID of the permission rule to remove when revoking calendar access. Get this ID from list_permissions action."
          },
          // Availability
          itemsToCheck: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING }
              }
            },
            description: "Array of calendar IDs to check for free/busy times when finding availability. Example: [{'id': 'primary'}, {'id': 'colleague@company.com'}] to check your calendar and a colleague's calendar"
          },
          // Move event
          destinationCalendarId: {
            type: Type.STRING,
            description: "The ID of the calendar to move the event to. Must be a calendar you have write access to. Get calendar IDs from list_calendars action."
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const accessToken = await getValidOAuthAccessToken(this.userId, "gmail");

      if (!accessToken) {
        return {
          success: false,
          error: "Google OAuth connection not found or token could not be refreshed. Please reconnect your Google account."
        };
      }

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      const calendarId = args.calendarId || 'primary';

      switch (args.action) {
        case "create_event":
          return await this.createEvent(args, headers, calendarId);
        case "list_events":
          return await this.listEvents(args, headers, calendarId);
        case "get_event":
          return await this.getEvent(args, headers, calendarId);
        case "update_event":
          return await this.updateEvent(args, headers, calendarId);
        case "delete_event":
          return await this.deleteEvent(args, headers, calendarId);
        case "list_calendars":
          return await this.listCalendars(headers);
        case "create_calendar":
          return await this.createCalendar(args, headers);
        case "update_calendar":
          return await this.updateCalendar(args, headers, calendarId);
        case "delete_calendar":
          return await this.deleteCalendar(args, headers, calendarId);
        case "clear_calendar":
          return await this.clearCalendar(args, headers, calendarId);
        case "share_calendar":
          return await this.shareCalendar(args, headers, calendarId);
        case "list_permissions":
          return await this.listPermissions(args, headers, calendarId);
        case "remove_permission":
          return await this.removePermission(args, headers, calendarId);
        case "check_availability":
          return await this.checkAvailability(args, headers);
        case "move_event":
          return await this.moveEvent(args, headers, calendarId);
        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`
          };
      }
    } catch (error: unknown) {
      console.error("❌ Google Calendar operation failed:", error);
      return {
        success: false,
        error: `Google Calendar operation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async createEvent(args: any, headers: any, calendarId: string): Promise<any> {
    if (!args.summary) {
      return { success: false, error: "Event summary is required" };
    }
    if (!args.startDateTime) {
      return { success: false, error: "Event start date/time is required" };
    }
    if (!args.endDateTime) {
      return { success: false, error: "Event end date/time is required" };
    }

    const event = this.buildEventObject(args);

    const url = args.conferenceData 
      ? `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?conferenceDataVersion=1`
      : `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create event: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      event: this.formatEvent(result)
    };
  }

  private async listEvents(args: any, headers: any, calendarId: string): Promise<any> {
    const params = new URLSearchParams();
    if (args.timeMin) params.append('timeMin', args.timeMin);
    if (args.timeMax) params.append('timeMax', args.timeMax);
    if (args.maxResults) params.append('maxResults', String(Math.min(args.maxResults, 2500)));
    if (args.orderBy) params.append('orderBy', args.orderBy);
    params.append('singleEvents', 'true'); // Expand recurring events

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list events: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      events: result.items?.map((event: any) => this.formatEvent(event)) || [],
      nextPageToken: result.nextPageToken,
      nextSyncToken: result.nextSyncToken
    };
  }

  private async getEvent(args: any, headers: any, calendarId: string): Promise<any> {
    if (!args.eventId) {
      return { success: false, error: "Event ID is required" };
    }

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${args.eventId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get event: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      event: this.formatEvent(result)
    };
  }

  private async updateEvent(args: any, headers: any, calendarId: string): Promise<any> {
    if (!args.eventId) {
      return { success: false, error: "Event ID is required" };
    }

    const event = this.buildEventObject(args);

    const url = args.conferenceData 
      ? `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${args.eventId}?conferenceDataVersion=1`
      : `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${args.eventId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to update event: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      event: this.formatEvent(result)
    };
  }

  private async deleteEvent(args: any, headers: any, calendarId: string): Promise<any> {
    if (!args.eventId) {
      return { success: false, error: "Event ID is required" };
    }

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${args.eventId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to delete event: ${error}` };
    }

    return {
      success: true,
      message: "Event deleted successfully"
    };
  }

  private async listCalendars(headers: any): Promise<any> {
    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list calendars: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      calendars: result.items?.map((calendar: any) => ({
        id: calendar.id,
        summary: calendar.summary,
        description: calendar.description,
        timeZone: calendar.timeZone,
        accessRole: calendar.accessRole,
        primary: calendar.primary || false,
        selected: calendar.selected || false,
        backgroundColor: calendar.backgroundColor,
        foregroundColor: calendar.foregroundColor
      })) || []
    };
  }

  private async createCalendar(args: any, headers: any): Promise<any> {
    if (!args.calendarSummary) {
      return { success: false, error: "Calendar summary is required" };
    }

    const calendar = {
      summary: args.calendarSummary,
      description: args.calendarDescription || '',
      timeZone: args.timeZone || 'UTC'
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
      method: 'POST',
      headers,
      body: JSON.stringify(calendar)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create calendar: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      calendar: {
        id: result.id,
        summary: result.summary,
        description: result.description,
        timeZone: result.timeZone
      }
    };
  }

  private async updateCalendar(args: any, headers: any, calendarId: string): Promise<any> {
    const body: any = {};
    if (args.calendarSummary) body.summary = args.calendarSummary;
    if (args.calendarDescription) body.description = args.calendarDescription;
    if (args.timeZone) body.timeZone = args.timeZone;

    if (Object.keys(body).length === 0) {
      return { success: false, error: "No fields provided to update the calendar." };
    }

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to update calendar: ${error}` };
    }

    const result = await response.json();
    return { success: true, calendar: result };
  }

  private async deleteCalendar(args: any, headers: any, calendarId: string): Promise<any> {
    if (calendarId === 'primary') {
      return { success: false, error: "Cannot delete the primary calendar. Use 'clear_calendar' instead." };
    }

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to delete calendar: ${error}` };
    }

    return { success: true, message: `Calendar ${calendarId} deleted successfully.` };
  }

  private async clearCalendar(args: any, headers: any, calendarId: string): Promise<any> {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/clear`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to clear calendar: ${error}` };
    }

    return { success: true, message: `Calendar ${calendarId} cleared successfully.` };
  }

  private async shareCalendar(args: any, headers: any, calendarId: string): Promise<any> {
    if (!args.role || !args.scopeType || !args.scopeValue) {
      return { success: false, error: "role, scopeType, and scopeValue are required to share a calendar." };
    }

    const body = {
      role: args.role,
      scope: {
        type: args.scopeType,
        value: args.scopeValue
      }
    };

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/acl`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to share calendar: ${error}` };
    }

    const result = await response.json();
    return { success: true, rule: result };
  }

  private async listPermissions(args: any, headers: any, calendarId: string): Promise<any> {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/acl`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list permissions: ${error}` };
    }

    const result = await response.json();
    return { success: true, permissions: result.items };
  }

  private async removePermission(args: any, headers: any, calendarId: string): Promise<any> {
    if (!args.ruleId) {
      return { success: false, error: "ruleId is required to remove a permission." };
    }

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/acl/${args.ruleId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to remove permission: ${error}` };
    }

    return { success: true, message: `Permission ${args.ruleId} removed successfully.` };
  }

  private async checkAvailability(args: any, headers: any): Promise<any> {
    if (!args.timeMin || !args.timeMax || !args.itemsToCheck) {
      return { success: false, error: "timeMin, timeMax, and itemsToCheck are required for availability checks." };
    }

    const body = {
      timeMin: args.timeMin,
      timeMax: args.timeMax,
      items: args.itemsToCheck
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to check availability: ${error}` };
    }

    const result = await response.json();
    return { success: true, calendars: result.calendars };
  }

  private async moveEvent(args: any, headers: any, calendarId: string): Promise<any> {
    if (!args.eventId || !args.destinationCalendarId) {
      return { success: false, error: "eventId and destinationCalendarId are required to move an event." };
    }

    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${args.eventId}/move?destination=${args.destinationCalendarId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to move event: ${error}` };
    }

    const result = await response.json();
    return { success: true, event: this.formatEvent(result) };
  }

  private buildEventObject(args: any): any {
    const event: any = {
      summary: args.summary
    };

    if (args.description) event.description = args.description;
    if (args.location) event.location = args.location;

    // Handle start and end times
    if (args.allDay) {
      event.start = { date: args.startDateTime.split('T')[0] };
      event.end = { date: args.endDateTime.split('T')[0] };
    } else {
      event.start = { 
        dateTime: args.startDateTime,
        timeZone: args.timeZone || 'UTC'
      };
      event.end = { 
        dateTime: args.endDateTime,
        timeZone: args.timeZone || 'UTC'
      };
    }

    if (args.attendees && Array.isArray(args.attendees)) {
      event.attendees = args.attendees.map((attendee: any) => ({
        email: attendee.email,
        displayName: attendee.displayName,
        optional: attendee.optional || false
      }));
    }

    if (args.recurrence && Array.isArray(args.recurrence)) {
      event.recurrence = args.recurrence;
    }

    if (args.reminders) {
      event.reminders = args.reminders;
    } else {
      event.reminders = { useDefault: true };
    }

    if (args.conferenceData) {
      event.conferenceData = args.conferenceData;
    }

    return event;
  }

  private formatEvent(event: any): any {
    return {
      id: event.id,
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: event.start,
      end: event.end,
      attendees: event.attendees || [],
      creator: event.creator,
      organizer: event.organizer,
      status: event.status,
      htmlLink: event.htmlLink,
      hangoutLink: event.hangoutLink,
      conferenceData: event.conferenceData,
      recurrence: event.recurrence,
      reminders: event.reminders,
      created: event.created,
      updated: event.updated
    };
  }
}
