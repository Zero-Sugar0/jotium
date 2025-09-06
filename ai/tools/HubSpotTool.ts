import { FunctionDeclaration, Type } from "@google/genai";

export class HubSpotTool {
  private baseUrl: string = "https://api.hubapi.com";
  private userAgent: string = "HubSpotTool/1.0";
  private accessToken: string | null = null;
  private developerApiKey: string | null = null;
  private rateLimiter: RateLimiter;

  constructor(accessToken?: string, developerApiKey?: string) {
    this.accessToken = accessToken || null;
    this.developerApiKey = developerApiKey || null;
    this.rateLimiter = new RateLimiter();
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "hubspot_crm",
      description: "Comprehensive HubSpot CRM tool for managing contacts, companies, deals, tickets, communications, and workflows. Supports all major CRM operations, email sending, task management, and pipeline automation.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "Action to perform: 'create', 'update', 'get', 'search', 'delete', 'list', 'associate', 'batch_create', 'batch_update', 'send_email', 'create_task', 'log_call', 'add_note', 'manage_list', 'get_analytics', 'upload_file'",
            enum: ["create", "update", "get", "search", "delete", "list", "associate", "batch_create", "batch_update", "send_email", "create_task", "log_call", "add_note", "manage_list", "get_analytics", "upload_file"]
          },
          objectType: {
            type: Type.STRING,
            description: "HubSpot object type: 'contacts', 'companies', 'deals', 'tickets', 'products', 'line_items', 'quotes', 'calls', 'emails', 'meetings', 'tasks', 'notes'",
            enum: ["contacts", "companies", "deals", "tickets", "products", "line_items", "quotes", "calls", "emails", "meetings", "tasks", "notes"]
          },
          objectId: {
            type: Type.STRING,
            description: "Object ID for get, update, delete operations"
          },
          properties: {
            type: Type.OBJECT,
            description: "Object properties to create or update",
            properties: {
              // Contact properties
              firstname: { type: Type.STRING, description: "First name (contacts)" },
              lastname: { type: Type.STRING, description: "Last name (contacts)" },
              email: { type: Type.STRING, description: "Email address (contacts)" },
              phone: { type: Type.STRING, description: "Phone number (contacts)" },
              company: { type: Type.STRING, description: "Company name (contacts)" },
              jobtitle: { type: Type.STRING, description: "Job title (contacts)" },
              // Company properties
              name: { type: Type.STRING, description: "Company name (companies)" },
              domain: { type: Type.STRING, description: "Company domain (companies)" },
              city: { type: Type.STRING, description: "City (companies/contacts)" },
              state: { type: Type.STRING, description: "State (companies/contacts)" },
              country: { type: Type.STRING, description: "Country (companies/contacts)" },
              industry: { type: Type.STRING, description: "Industry (companies)" },
              numberofemployees: { type: Type.NUMBER, description: "Number of employees (companies)" },
              // Deal properties
              dealname: { type: Type.STRING, description: "Deal name (deals)" },
              amount: { type: Type.NUMBER, description: "Deal amount (deals)" },
              dealstage: { type: Type.STRING, description: "Deal stage (deals)" },
              pipeline: { type: Type.STRING, description: "Sales pipeline (deals)" },
              closedate: { type: Type.STRING, description: "Close date ISO format (deals)" },
              dealtype: { type: Type.STRING, description: "Deal type (deals)" },
              // Ticket properties
              subject: { type: Type.STRING, description: "Ticket subject (tickets)" },
              content: { type: Type.STRING, description: "Ticket content (tickets)" },
              hs_pipeline: { type: Type.STRING, description: "Ticket pipeline (tickets)" },
              hs_pipeline_stage: { type: Type.STRING, description: "Ticket stage (tickets)" },
              hs_ticket_priority: { type: Type.STRING, description: "Ticket priority (tickets)" },
              // Activity properties
              hs_timestamp: { type: Type.STRING, description: "Activity timestamp (activities)" },
              hs_activity_type: { type: Type.STRING, description: "Activity type (activities)" }
            }
          },
          searchRequest: {
            type: Type.OBJECT,
            description: "Search parameters for search operations",
            properties: {
              query: { type: Type.STRING, description: "Search query string" },
              filterGroups: {
                type: Type.ARRAY,
                description: "Filter groups (max 3)",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    filters: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          propertyName: { type: Type.STRING, description: "Property to filter on" },
                          operator: { 
                            type: Type.STRING, 
                            description: "Filter operator",
                            enum: ["EQ", "NEQ", "LT", "LTE", "GT", "GTE", "BETWEEN", "IN", "NOT_IN", "HAS_PROPERTY", "NOT_HAS_PROPERTY", "CONTAINS_TOKEN", "NOT_CONTAINS_TOKEN"]
                          },
                          value: { type: Type.STRING, description: "Filter value" },
                          values: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Multiple values for IN/NOT_IN operators" }
                        },
                        required: ["propertyName", "operator"]
                      }
                    }
                  }
                }
              },
              sorts: {
                type: Type.ARRAY,
                description: "Sort parameters",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    propertyName: { type: Type.STRING, description: "Property to sort by" },
                    direction: { type: Type.STRING, enum: ["ASC", "DESC"], description: "Sort direction" }
                  }
                }
              },
              properties: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Properties to retrieve"
              },
              limit: { type: Type.NUMBER, description: "Number of results (max 100)" },
              after: { type: Type.STRING, description: "Pagination cursor" }
            }
          },
          associations: {
            type: Type.OBJECT,
            description: "Association parameters for creating relationships between objects",
            properties: {
              toObjectType: { type: Type.STRING, description: "Target object type for association" },
              toObjectId: { type: Type.STRING, description: "Target object ID for association" },
              associationType: { type: Type.STRING, description: "Association type (e.g., 'contact_to_company', 'deal_to_contact')" }
            }
          },
          batchInputs: {
            type: Type.ARRAY,
            description: "Array of objects for batch operations",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Object ID (for updates)" },
                properties: { type: Type.OBJECT, description: "Object properties" }
              }
            }
          },
          emailData: {
            type: Type.OBJECT,
            description: "Email data for send_email action",
            properties: {
              to: { type: Type.STRING, description: "Recipient email address" },
              cc: { type: Type.ARRAY, items: { type: Type.STRING }, description: "CC recipients" },
              bcc: { type: Type.ARRAY, items: { type: Type.STRING }, description: "BCC recipients" },
              subject: { type: Type.STRING, description: "Email subject" },
              htmlBody: { type: Type.STRING, description: "HTML email body" },
              textBody: { type: Type.STRING, description: "Plain text email body" },
              templateId: { type: Type.STRING, description: "Email template ID to use" },
              contactId: { type: Type.STRING, description: "Contact ID to associate email with" },
              trackOpens: { type: Type.BOOLEAN, description: "Track email opens" },
              trackClicks: { type: Type.BOOLEAN, description: "Track link clicks" }
            }
          },
          taskData: {
            type: Type.OBJECT,
            description: "Task data for create_task action",
            properties: {
              title: { type: Type.STRING, description: "Task title/subject" },
              body: { type: Type.STRING, description: "Task description" },
              dueDate: { type: Type.STRING, description: "Due date in ISO format" },
              priority: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"], description: "Task priority" },
              taskType: { type: Type.STRING, description: "Task type (CALL, EMAIL, TODO, etc.)" },
              assignedTo: { type: Type.STRING, description: "User ID to assign task to" },
              associatedObjectType: { type: Type.STRING, description: "Object type to associate with" },
              associatedObjectId: { type: Type.STRING, description: "Object ID to associate with" },
              reminderDate: { type: Type.STRING, description: "Reminder date in ISO format" }
            }
          },
          callData: {
            type: Type.OBJECT,
            description: "Call data for log_call action",
            properties: {
              title: { type: Type.STRING, description: "Call title/subject" },
              body: { type: Type.STRING, description: "Call notes/description" },
              duration: { type: Type.NUMBER, description: "Call duration in milliseconds" },
              outcome: { type: Type.STRING, description: "Call outcome" },
              disposition: { type: Type.STRING, description: "Call disposition" },
              toNumber: { type: Type.STRING, description: "Phone number called" },
              fromNumber: { type: Type.STRING, description: "Phone number called from" },
              contactId: { type: Type.STRING, description: "Contact ID to associate call with" },
              companyId: { type: Type.STRING, description: "Company ID to associate call with" },
              dealId: { type: Type.STRING, description: "Deal ID to associate call with" },
              timestamp: { type: Type.STRING, description: "Call timestamp in ISO format" }
            }
          },
          noteData: {
            type: Type.OBJECT,
            description: "Note data for add_note action",
            properties: {
              body: { type: Type.STRING, description: "Note content" },
              contactId: { type: Type.STRING, description: "Contact ID to associate note with" },
              companyId: { type: Type.STRING, description: "Company ID to associate note with" },
              dealId: { type: Type.STRING, description: "Deal ID to associate note with" },
              ticketId: { type: Type.STRING, description: "Ticket ID to associate note with" },
              timestamp: { type: Type.STRING, description: "Note timestamp in ISO format" }
            }
          },
          listData: {
            type: Type.OBJECT,
            description: "List data for manage_list action",
            properties: {
              listId: { type: Type.STRING, description: "List ID for operations" },
              listName: { type: Type.STRING, description: "List name for creation" },
              listType: { type: Type.STRING, enum: ["STATIC", "DYNAMIC"], description: "List type" },
              contactIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Contact IDs to add/remove" },
              operation: { type: Type.STRING, enum: ["add", "remove", "create", "get"], description: "List operation" }
            }
          },
          analyticsData: {
            type: Type.OBJECT,
            description: "Analytics data for get_analytics action",
            properties: {
              reportType: { 
                type: Type.STRING, 
                enum: ["deals_pipeline", "contacts_lifecycle", "revenue", "activities", "conversion_funnel"],
                description: "Type of analytics report to generate" 
              },
              dateRange: { 
                type: Type.STRING, 
                enum: ["TODAY", "YESTERDAY", "LAST_7_DAYS", "LAST_30_DAYS", "LAST_90_DAYS", "CUSTOM"],
                description: "Date range for analytics" 
              },
              startDate: { type: Type.STRING, description: "Start date for custom range (ISO format)" },
              endDate: { type: Type.STRING, description: "End date for custom range (ISO format)" },
              groupBy: { type: Type.STRING, description: "Group results by property" },
              properties: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Properties to include in report" }
            }
          },
          fileData: {
            type: Type.OBJECT,
            description: "File data for upload_file action",
            properties: {
              fileName: { type: Type.STRING, description: "File name" },
              fileContent: { type: Type.STRING, description: "Base64 encoded file content or file path" },
              folder: { type: Type.STRING, description: "Folder path to upload to" },
              access: { type: Type.STRING, enum: ["PUBLIC_INDEXABLE", "PUBLIC_NOT_INDEXABLE", "PRIVATE"], description: "File access level" },
              overwrite: { type: Type.BOOLEAN, description: "Overwrite existing file" },
              associateWithObject: { type: Type.BOOLEAN, description: "Associate file with CRM object" },
              objectType: { type: Type.STRING, description: "Object type to associate file with" },
              objectId: { type: Type.STRING, description: "Object ID to associate file with" }
            }
          },
          options: {
            type: Type.OBJECT,
            description: "Additional options",
            properties: {
              includeAssociations: { type: Type.BOOLEAN, description: "Include associated objects" },
              propertiesWithHistory: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Properties to include with history" 
              },
              archived: { type: Type.BOOLEAN, description: "Include archived objects" },
              idProperty: { type: Type.STRING, description: "Property to use as unique identifier" }
            }
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      if (!this.accessToken && !this.developerApiKey) {
        throw new Error("Access token or developer API key is required. Set up a Private App in HubSpot to get an access token.");
      }

      console.log(`🚀 HubSpot ${args.action}${args.objectType ? ` ${args.objectType}` : ''}...`);

      // Rate limiting
      await this.rateLimiter.checkLimit();

      const result = await this.performAction(args);

      return {
        success: true,
        action: args.action,
        objectType: args.objectType,
        data: result,
        timestamp: new Date().toISOString(),
        source: "HubSpot"
      };

    } catch (error: unknown) {
      console.error("❌ HubSpot operation failed:", error);
      return {
        success: false,
        error: `HubSpot operation failed: ${error instanceof Error ? error.message : String(error)}`,
        action: args.action,
        objectType: args.objectType,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async performAction(args: any): Promise<any> {
    const { 
      action, objectType, objectId, properties, searchRequest, associations, 
      batchInputs, options, emailData, taskData, callData, noteData, 
      listData, analyticsData, fileData 
    } = args;

    switch (action) {
      case "create":
        return await this.createObject(objectType, properties, associations);
      
      case "update":
        if (!objectId) throw new Error("objectId is required for update operations");
        return await this.updateObject(objectType, objectId, properties);
      
      case "get":
        if (!objectId) throw new Error("objectId is required for get operations");
        return await this.getObject(objectType, objectId, options);
      
      case "search":
        return await this.searchObjects(objectType, searchRequest);
      
      case "delete":
        if (!objectId) throw new Error("objectId is required for delete operations");
        return await this.deleteObject(objectType, objectId);
      
      case "list":
        return await this.listObjects(objectType, options);
      
      case "associate":
        if (!objectId || !associations) {
          throw new Error("objectId and associations are required for associate operations");
        }
        return await this.createAssociation(objectType, objectId, associations);
      
      case "batch_create":
        if (!batchInputs) throw new Error("batchInputs is required for batch_create operations");
        return await this.batchCreate(objectType, batchInputs);
      
      case "batch_update":
        if (!batchInputs) throw new Error("batchInputs is required for batch_update operations");
        return await this.batchUpdate(objectType, batchInputs);
      
      case "send_email":
        if (!emailData) throw new Error("emailData is required for send_email operations");
        return await this.sendEmail(emailData);
      
      case "create_task":
        if (!taskData) throw new Error("taskData is required for create_task operations");
        return await this.createTask(taskData);
      
      case "log_call":
        if (!callData) throw new Error("callData is required for log_call operations");
        return await this.logCall(callData);
      
      case "add_note":
        if (!noteData) throw new Error("noteData is required for add_note operations");
        return await this.addNote(noteData);
      
      case "manage_list":
        if (!listData) throw new Error("listData is required for manage_list operations");
        return await this.manageList(listData);
      
      case "get_analytics":
        if (!analyticsData) throw new Error("analyticsData is required for get_analytics operations");
        return await this.getAnalytics(analyticsData);
      
      case "upload_file":
        if (!fileData) throw new Error("fileData is required for upload_file operations");
        return await this.uploadFile(fileData);
      
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  }

  // Core CRM operations
  private async createObject(objectType: string, properties: any, associations?: any): Promise<any> {
    const url = `${this.baseUrl}/crm/v3/objects/${objectType}`;
    
    const body: any = { properties };
    
    if (associations) {
      body.associations = [{
        to: { id: associations.toObjectId },
        types: [{
          associationCategory: "HUBSPOT_DEFINED",
          associationTypeId: this.getAssociationTypeId(associations.associationType)
        }]
      }];
    }

    return await this.makeRequest("POST", url, body);
  }

  private async updateObject(objectType: string, objectId: string, properties: any): Promise<any> {
    const url = `${this.baseUrl}/crm/v3/objects/${objectType}/${objectId}`;
    return await this.makeRequest("PATCH", url, { properties });
  }

  private async getObject(objectType: string, objectId: string, options?: any): Promise<any> {
    let url = `${this.baseUrl}/crm/v3/objects/${objectType}/${objectId}`;
    
    const queryParams = new URLSearchParams();
    
    if (options?.includeAssociations) {
      queryParams.append("associations", "contacts,companies,deals,tickets");
    }
    
    if (options?.propertiesWithHistory?.length > 0) {
      queryParams.append("propertiesWithHistory", options.propertiesWithHistory.join(","));
    }
    
    if (options?.archived) {
      queryParams.append("archived", "true");
    }

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    return await this.makeRequest("GET", url);
  }

  private async searchObjects(objectType: string, searchRequest: any): Promise<any> {
    const url = `${this.baseUrl}/crm/v3/objects/${objectType}/search`;
    
    const body = {
      filterGroups: searchRequest?.filterGroups || [],
      sorts: searchRequest?.sorts || [],
      query: searchRequest?.query || "",
      properties: searchRequest?.properties || [],
      limit: Math.min(searchRequest?.limit || 10, 100),
      after: searchRequest?.after || "0"
    };

    return await this.makeRequest("POST", url, body);
  }

  private async deleteObject(objectType: string, objectId: string): Promise<any> {
    const url = `${this.baseUrl}/crm/v3/objects/${objectType}/${objectId}`;
    await this.makeRequest("DELETE", url);
    return { deleted: true, objectId };
  }

  private async listObjects(objectType: string, options?: any): Promise<any> {
    let url = `${this.baseUrl}/crm/v3/objects/${objectType}`;
    
    const queryParams = new URLSearchParams();
    queryParams.append("limit", String(Math.min(options?.limit || 10, 100)));
    
    if (options?.after) {
      queryParams.append("after", options.after);
    }
    
    if (options?.properties?.length > 0) {
      queryParams.append("properties", options.properties.join(","));
    }
    
    if (options?.archived) {
      queryParams.append("archived", "true");
    }

    url += `?${queryParams.toString()}`;
    return await this.makeRequest("GET", url);
  }

  private async createAssociation(fromObjectType: string, fromObjectId: string, associations: any): Promise<any> {
    const url = `${this.baseUrl}/crm/v4/objects/${fromObjectType}/${fromObjectId}/associations/${associations.toObjectType}/${associations.toObjectId}`;
    
    const body = [{
      associationCategory: "HUBSPOT_DEFINED",
      associationTypeId: this.getAssociationTypeId(associations.associationType)
    }];

    return await this.makeRequest("PUT", url, body);
  }

  private async batchCreate(objectType: string, inputs: any[]): Promise<any> {
    const url = `${this.baseUrl}/crm/v3/objects/${objectType}/batch/create`;
    
    const body = {
      inputs: inputs.map(input => ({ properties: input.properties }))
    };

    return await this.makeRequest("POST", url, body);
  }

  private async batchUpdate(objectType: string, inputs: any[]): Promise<any> {
    const url = `${this.baseUrl}/crm/v3/objects/${objectType}/batch/update`;
    
    const body = {
      inputs: inputs.map(input => ({
        id: input.id,
        properties: input.properties
      }))
    };

    return await this.makeRequest("POST", url, body);
  }

  // Advanced features
  private async sendEmail(emailData: any): Promise<any> {
    const url = `${this.baseUrl}/marketing/v3/transactional/single-send`;
    
    const body: any = {
      message: {
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        htmlBody: emailData.htmlBody,
        textBody: emailData.textBody || emailData.htmlBody?.replace(/<[^>]*>/g, '')
      }
    };

    if (emailData.templateId) {
      body.emailId = emailData.templateId;
    }

    if (emailData.contactId) {
      body.contactProperties = { contactId: emailData.contactId };
    }

    return await this.makeRequest("POST", url, body);
  }

  private async createTask(taskData: any): Promise<any> {
    const url = `${this.baseUrl}/crm/v3/objects/tasks`;
    
    const properties: any = {
      hs_task_subject: taskData.title,
      hs_task_body: taskData.body,
      hs_task_priority: taskData.priority || 'MEDIUM',
      hs_task_status: 'NOT_STARTED',
      hs_task_type: taskData.taskType || 'TODO'
    };

    if (taskData.dueDate) {
      properties.hs_task_completion_date = new Date(taskData.dueDate).getTime().toString();
    }

    if (taskData.assignedTo) {
      properties.hubspot_owner_id = taskData.assignedTo;
    }

    const body: any = { properties };

    if (taskData.associatedObjectType && taskData.associatedObjectId) {
      body.associations = [{
        to: { id: taskData.associatedObjectId },
        types: [{
          associationCategory: "HUBSPOT_DEFINED",
          associationTypeId: this.getTaskAssociationTypeId(taskData.associatedObjectType)
        }]
      }];
    }

    return await this.makeRequest("POST", url, body);
  }

  private async logCall(callData: any): Promise<any> {
    const url = `${this.baseUrl}/crm/v3/objects/calls`;
    
    const properties: any = {
      hs_call_title: callData.title,
      hs_call_body: callData.body,
      hs_call_direction: 'OUTBOUND',
      hs_call_disposition: callData.disposition || 'Connected',
      hs_call_status: 'COMPLETED',
      hs_timestamp: callData.timestamp ? new Date(callData.timestamp).getTime().toString() : Date.now().toString()
    };

    if (callData.duration) {
      properties.hs_call_duration = callData.duration;
    }

    if (callData.toNumber) {
      properties.hs_call_to_number = callData.toNumber;
    }

    if (callData.outcome) {
      properties.hs_call_outcome = callData.outcome;
    }

    const body: any = { properties };

    // Add associations
    const associations = [];
    if (callData.contactId) {
      associations.push({
        to: { id: callData.contactId },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 194 }]
      });
    }
    if (callData.companyId) {
      associations.push({
        to: { id: callData.companyId },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 182 }]
      });
    }

    if (associations.length > 0) {
      body.associations = associations;
    }

    return await this.makeRequest("POST", url, body);
  }

  private async addNote(noteData: any): Promise<any> {
    const url = `${this.baseUrl}/crm/v3/objects/notes`;
    
    const properties: any = {
      hs_note_body: noteData.body,
      hs_timestamp: noteData.timestamp ? new Date(noteData.timestamp).getTime().toString() : Date.now().toString()
    };

    const body: any = { properties };

    // Add associations
    const associations = [];
    if (noteData.contactId) {
      associations.push({
        to: { id: noteData.contactId },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }]
      });
    }
    if (noteData.companyId) {
      associations.push({
        to: { id: noteData.companyId },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 190 }]
      });
    }

    if (associations.length > 0) {
      body.associations = associations;
    }

    return await this.makeRequest("POST", url, body);
  }

  private async manageList(listData: any): Promise<any> {
    const { operation, listId, listName, contactIds } = listData;

    switch (operation) {
      case "create":
        if (!listName) throw new Error("listName is required for list creation");
        return await this.createContactList(listName);
      
      case "get":
        if (!listId) throw new Error("listId is required for get operation");
        return await this.getContactList(listId);
      
      case "add":
        if (!listId || !contactIds) throw new Error("listId and contactIds are required for add operation");
        return await this.addContactsToList(listId, contactIds);
      
      default:
        throw new Error(`Unsupported list operation: ${operation}`);
    }
  }

  private async createContactList(name: string): Promise<any> {
    const url = `${this.baseUrl}/contacts/v1/lists`;
    const body = { name, dynamic: false };
    return await this.makeRequest("POST", url, body);
  }

  private async getContactList(listId: string): Promise<any> {
    const url = `${this.baseUrl}/contacts/v1/lists/${listId}`;
    return await this.makeRequest("GET", url);
  }

  private async addContactsToList(listId: string, contactIds: string[]): Promise<any> {
    const url = `${this.baseUrl}/contacts/v1/lists/${listId}/add`;
    const body = { vids: contactIds.map(id => parseInt(id)) };
    return await this.makeRequest("POST", url, body);
  }

  private async getAnalytics(analyticsData: any): Promise<any> {
    const { reportType, dateRange, startDate, endDate } = analyticsData;

    switch (reportType) {
      case "deals_pipeline":
        return await this.getDealsPipelineAnalytics(dateRange, startDate, endDate);
      case "contacts_lifecycle":
        return await this.getContactsLifecycleAnalytics(dateRange, startDate, endDate);
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }
  }

  private async getDealsPipelineAnalytics(dateRange: string, startDate?: string, endDate?: string): Promise<any> {
    const { start, end } = this.getDateRangeTimestamps(dateRange, startDate, endDate);
    
    const searchRequest = {
      filterGroups: [{
        filters: [{
          propertyName: 'createdate',
          operator: 'BETWEEN',
          value: start,
          highValue: end
        }]
      }],
      properties: ['dealname', 'amount', 'dealstage', 'pipeline'],
      limit: 100
    };

    const deals = await this.searchObjects('deals', searchRequest);
    const pipelineAnalytics = this.groupDealsByStage(deals.results || []);
    return { reportType: 'deals_pipeline', dateRange, data: pipelineAnalytics };
  }

  private async getContactsLifecycleAnalytics(dateRange: string, startDate?: string, endDate?: string): Promise<any> {
    const { start, end } = this.getDateRangeTimestamps(dateRange, startDate, endDate);
    
    const searchRequest = {
      filterGroups: [{
        filters: [{
          propertyName: 'createdate',
          operator: 'BETWEEN',
          value: start,
          highValue: end
        }]
      }],
      properties: ['lifecyclestage', 'createdate'],
      limit: 100
    };

    const contacts = await this.searchObjects('contacts', searchRequest);
    const lifecycleAnalytics = this.groupContactsByLifecycleStage(contacts.results || []);
    return { reportType: 'contacts_lifecycle', dateRange, data: lifecycleAnalytics };
  }

  private async uploadFile(fileData: any): Promise<any> {
    const url = `${this.baseUrl}/filemanager/api/v3/files/upload`;
    
    const formData = new FormData();
    const options = {
      access: fileData.access || 'PRIVATE',
      overwrite: fileData.overwrite || false
    };

    // Handle file content
    let fileBlob: Blob;
    if (fileData.fileContent.startsWith('data:')) {
      const response = await fetch(fileData.fileContent);
      fileBlob = await response.blob();
    } else {
      const byteCharacters = atob(fileData.fileContent);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      fileBlob = new Blob([byteArray]);
    }

    formData.append('file', fileBlob, fileData.fileName);
    formData.append('options', JSON.stringify(options));
    
    if (fileData.folder) {
      formData.append('folderPath', fileData.folder);
    }

    return await this.makeRequest("POST", url, formData, { isFormData: true });
  }

  // Utility methods
  private async makeRequest(method: string, url: string, body?: any, options?: any): Promise<any> {
    const headers: Record<string, string> = {
      'User-Agent': this.userAgent
    };

    if (!options?.isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    } else if (this.developerApiKey) {
      const urlObj = new URL(url);
      urlObj.searchParams.append('hapikey', this.developerApiKey);
      url = urlObj.toString();
    }

    const requestConfig: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        requestConfig.body = body;
      } else {
        requestConfig.body = JSON.stringify(body);
      }
    }

    console.log(`📡 ${method} ${this.maskUrl(url)}`);

    const response = await fetch(url, requestConfig);
    
    let responseData: any;
    const responseText = await response.text();
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    if (!response.ok) {
      const errorMessage = responseData?.message || responseData?.error || response.statusText;
      throw new Error(`HTTP ${response.status}: ${errorMessage}`);
    }

    return responseData;
  }

  private getAssociationTypeId(associationType: string): number {
    const associationTypes: Record<string, number> = {
      'contact_to_company': 1,
      'company_to_contact': 2,
      'deal_to_contact': 3,
      'contact_to_deal': 4,
      'deal_to_company': 5,
      'company_to_deal': 6,
      'contact_to_ticket': 15,
      'ticket_to_contact': 16
    };
    return associationTypes[associationType] || 1;
  }

  private getTaskAssociationTypeId(objectType: string): number {
    const taskAssociations: Record<string, number> = {
      'contacts': 204,
      'companies': 192,
      'deals': 216,
      'tickets': 228
    };
    return taskAssociations[objectType] || 204;
  }

  private getDateRangeTimestamps(dateRange: string, startDate?: string, endDate?: string): { start: string, end: string } {
    const now = new Date();
    let start: Date, end: Date = now;

    switch (dateRange) {
      case "TODAY":
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
        break;
      case "YESTERDAY":
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        start.setHours(0, 0, 0, 0);
        end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
        break;
      case "LAST_7_DAYS":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "LAST_30_DAYS":
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "LAST_90_DAYS":
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "CUSTOM":
        if (!startDate || !endDate) throw new Error("startDate and endDate are required for CUSTOM date range");
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return {
      start: start.getTime().toString(),
      end: end.getTime().toString()
    };
  }

  private groupDealsByStage(deals: any[]): any {
    const stageGroups: Record<string, any> = {};
    let totalValue = 0;

    deals.forEach(deal => {
      const stage = deal.properties?.dealstage || 'Unknown';
      const amount = parseFloat(deal.properties?.amount || '0');
      
      if (!stageGroups[stage]) {
        stageGroups[stage] = { count: 0, totalValue: 0 };
      }
      
      stageGroups[stage].count++;
      stageGroups[stage].totalValue += amount;
      totalValue += amount;
    });

    return {
      totalDeals: deals.length,
      totalValue,
      stageBreakdown: stageGroups
    };
  }

  private groupContactsByLifecycleStage(contacts: any[]): any {
    const stageGroups: Record<string, number> = {};
    
    contacts.forEach(contact => {
      const stage = contact.properties?.lifecyclestage || 'Unknown';
      stageGroups[stage] = (stageGroups[stage] || 0) + 1;
    });

    return {
      totalContacts: contacts.length,
      stageBreakdown: stageGroups
    };
  }

  private maskUrl(url: string): string {
    return url.replace(/hapikey=[^&]+/, 'hapikey=***');
  }

  // Static utility methods for easy payload creation
  
  /**
   * Create a contact payload
   */
  static createContactPayload(
    firstName: string,
    lastName: string,
    email: string,
    companyName?: string,
    jobTitle?: string,
    phone?: string
  ): any {
    return {
      firstname: firstName,
      lastname: lastName,
      email: email,
      company: companyName,
      jobtitle: jobTitle,
      phone: phone
    };
  }

  /**
   * Create a company payload
   */
  static createCompanyPayload(
    name: string,
    domain?: string,
    city?: string,
    state?: string,
    industry?: string,
    employees?: number
  ): any {
    return {
      name,
      domain,
      city,
      state,
      industry,
      numberofemployees: employees
    };
  }

  /**
   * Create a deal payload
   */
  static createDealPayload(
    dealName: string,
    amount: number,
    stage?: string,
    pipeline?: string,
    closeDate?: string
  ): any {
    return {
      dealname: dealName,
      amount,
      dealstage: stage,
      pipeline,
      closedate: closeDate
    };
  }

  /**
   * Create an email payload
   */
  static createEmailPayload(
    to: string,
    subject: string,
    htmlBody: string,
    contactId?: string,
    templateId?: string
  ): any {
    return {
      to,
      subject,
      htmlBody,
      textBody: htmlBody.replace(/<[^>]*>/g, ''),
      contactId,
      templateId,
      trackOpens: true,
      trackClicks: true
    };
  }

  /**
   * Create a task payload
   */
  static createTaskPayload(
    title: string,
    body: string,
    dueDate?: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM',
    assignedTo?: string
  ): any {
    return {
      title,
      body,
      dueDate,
      priority,
      assignedTo,
      taskType: 'TODO'
    };
  }

  /**
   * Create a search request for recent objects
   */
  static createRecentSearchRequest(days: number = 30, limit: number = 10): any {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    
    return {
      filterGroups: [{
        filters: [{
          propertyName: 'createdate',
          operator: 'GTE',
          value: daysAgo.getTime().toString()
        }]
      }],
      sorts: [{
        propertyName: 'createdate',
        direction: 'DESC'
      }],
      limit
    };
  }
}

class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 100;
  private readonly timeWindow = 10000; // 10 seconds

  async checkLimit(): Promise<void> {
    const now = Date.now();
    
    // Remove requests older than the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindow - (now - oldestRequest);
      
      if (waitTime > 0) {
        console.log(`⏳ Rate limit reached, waiting ${waitTime}ms...`);
        await this.sleep(waitTime);
      }
    }
    
    this.requests.push(now);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}