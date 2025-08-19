import { FunctionDeclaration, Type } from "@google/genai";

export interface N8NCredential {
  id: string;
  name: string;
  type: string;
  data: Record<string, any>;
}

export interface N8NNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
  webhookId?: string;
  executeOnce?: boolean;
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
  notes?: string;
  notesInFlow?: boolean;
  color?: string;
  continueOnFail?: boolean;
  disabled?: boolean;
}

export interface N8NConnection {
  node: string;
  type: string;
  index: number;
}

export interface N8NWorkflow {
  id?: string;
  name: string;
  nodes: N8NNode[];
  connections: Record<string, Record<string, N8NConnection[][]>>;
  active?: boolean;
  settings?: Record<string, any>;
  staticData?: Record<string, any>;
  tags?: string[];
  meta?: Record<string, any>;
  pinData?: Record<string, any>;
  versionId?: string;
}

export interface N8NExecution {
  id: string;
  workflowId: string;
  mode: string;
  startedAt: string;
  stoppedAt?: string;
  status: 'new' | 'running' | 'success' | 'error' | 'canceled' | 'crashed' | 'waiting';
  data?: any;
  workflowData?: N8NWorkflow;
}

export class N8NTool {
  private baseUrl: string;
  private apiKey: string;
  private userAgent: string = "N8NTool/1.0";
  private timeout: number = 30000;

  constructor(baseUrl: string, apiKey: string, timeout?: number) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
    this.timeout = timeout || 30000;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "n8n_automation",
      description: "Comprehensive n8n workflow automation tool. Create, manage, execute workflows, handle credentials, monitor executions, and integrate with 400+ services including AI, databases, APIs, and more.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "Action to perform",
            enum: [
              "create_workflow", "update_workflow", "delete_workflow", "get_workflow", "list_workflows",
              "execute_workflow", "activate_workflow", "deactivate_workflow", "duplicate_workflow",
              "create_credential", "update_credential", "delete_credential", "get_credential", "list_credentials",
              "list_executions", "get_execution", "stop_execution", "delete_execution",
              "create_webhook", "delete_webhook", "test_webhook",
              "export_workflow", "import_workflow", "get_workflow_template",
              "health_check", "get_version", "get_metrics",
              "create_tag", "update_tag", "delete_tag", "list_tags",
              "backup_workflows", "restore_workflows",
              "create_multi_service_workflow", "create_conditional_workflow"
            ]
          },
          workflowId: {
            type: Type.STRING,
            description: "Workflow ID for workflow-specific operations"
          },
          services: {
            type: Type.ARRAY,
            description: "Array of service names for multi-service workflow creation",
            items: { type: Type.STRING }
          },
          conditions: {
            type: Type.ARRAY,
            description: "Array of condition objects for conditional workflow creation",
            items: {
              type: Type.OBJECT,
              properties: {
                operation: { type: Type.STRING, description: "Comparison operation (e.g., 'equal', 'notEqual')" },
                value1: { type: Type.STRING, description: "First value for comparison" },
                value2: { type: Type.STRING, description: "Second value for comparison" },
                nodeType: { type: Type.STRING, description: "Node type for the branch" },
                parameters: { type: Type.OBJECT, description: "Parameters for the branch node" }
              },
              required: ["value1", "value2"]
            }
          },
          workflow: {
            type: Type.OBJECT,
            description: "Workflow definition object containing nodes, connections, and settings"
          },
          workflowName: {
            type: Type.STRING,
            description: "Name of the workflow"
          },
          credentialId: {
            type: Type.STRING,
            description: "Credential ID for credential operations"
          },
          credential: {
            type: Type.OBJECT,
            description: "Credential object with type, name, and data"
          },
          executionId: {
            type: Type.STRING,
            description: "Execution ID for execution operations"
          },
          webhookPath: {
            type: Type.STRING,
            description: "Webhook path for webhook operations"
          },
          nodes: {
            type: Type.ARRAY,
            description: "Array of nodes to create workflow from template",
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "Node type (e.g., 'n8n-nodes-base.httpRequest')" },
                name: { type: Type.STRING, description: "Node name" },
                parameters: { type: Type.OBJECT, description: "Node parameters" },
                position: { 
                  type: Type.ARRAY, 
                  description: "Node position [x, y]",
                  items: { type: Type.NUMBER }
                }
              }
            }
          },
          connections: {
            type: Type.OBJECT,
            description: "Workflow connections between nodes"
          },
          active: {
            type: Type.BOOLEAN,
            description: "Whether to activate the workflow (default: false)"
          },
          tags: {
            type: Type.ARRAY,
            description: "Tags to assign to workflow",
            items: { type: Type.STRING }
          },
          limit: {
            type: Type.NUMBER,
            description: "Limit for list operations (default: 100)"
          },
          filter: {
            type: Type.OBJECT,
            description: "Filter criteria for list operations"
          },
          waitTillDone: {
            type: Type.BOOLEAN,
            description: "Wait for execution to complete (default: true)"
          },
          includeData: {
            type: Type.BOOLEAN,
            description: "Include execution data in response (default: false)"
          },
          workflowTemplate: {
            type: Type.STRING,
            description: "Predefined workflow template",
            enum: [
              "basic_webhook", "api_integration", "database_sync", "email_automation",
              "slack_notification", "data_transformation", "schedule_task", "form_handler",
              "ai_workflow", "file_processor", "social_media", "ecommerce_sync"
            ]
          },
          templateParams: {
            type: Type.OBJECT,
            description: "Parameters for workflow template"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`🔧 n8n ${args.action}: ${this.maskUrl()}`);

      switch (args.action) {
        // Workflow Operations
        case "create_workflow":
          return await this.createWorkflow(args);
        case "update_workflow":
          return await this.updateWorkflow(args);
        case "delete_workflow":
          return await this.deleteWorkflow(args.workflowId);
        case "get_workflow":
          return await this.getWorkflow(args.workflowId);
        case "list_workflows":
          return await this.listWorkflows(args.filter, args.limit);
        case "duplicate_workflow":
          return await this.duplicateWorkflow(args.workflowId, args.workflowName);
        case "export_workflow":
          return await this.exportWorkflow(args.workflowId);
        case "import_workflow":
          return await this.importWorkflow(args.workflow);

        // Workflow Execution
        case "execute_workflow":
          return await this.executeWorkflow(args.workflowId, args.waitTillDone, args.includeData);
        case "activate_workflow":
          return await this.activateWorkflow(args.workflowId);
        case "deactivate_workflow":
          return await this.deactivateWorkflow(args.workflowId);

        // Credential Operations
        case "create_credential":
          return await this.createCredential(args.credential);
        case "update_credential":
          return await this.updateCredential(args.credentialId, args.credential);
        case "delete_credential":
          return await this.deleteCredential(args.credentialId);
        case "get_credential":
          return await this.getCredential(args.credentialId);
        case "list_credentials":
          return await this.listCredentials(args.filter);

        // Execution Monitoring
        case "list_executions":
          return await this.listExecutions(args.workflowId, args.limit, args.filter);
        case "get_execution":
          return await this.getExecution(args.executionId, args.includeData);
        case "stop_execution":
          return await this.stopExecution(args.executionId);
        case "delete_execution":
          return await this.deleteExecution(args.executionId);

        // Webhook Operations
        case "create_webhook":
          return await this.createWebhook(args.webhookPath);
        case "delete_webhook":
          return await this.deleteWebhook(args.webhookPath);
        case "test_webhook":
          return await this.testWebhook(args.webhookPath);

        // Template Operations
        case "get_workflow_template":
          return await this.getWorkflowTemplate(args.workflowTemplate, args.templateParams);

        // System Operations
        case "health_check":
          return await this.healthCheck();
        case "get_version":
          return await this.getVersion();
        case "get_metrics":
          return await this.getMetrics();

        // Tag Operations
        case "create_tag":
          return await this.createTag(args.tag);
        case "list_tags":
          return await this.listTags();

        // Backup Operations
        case "backup_workflows":
          return await this.backupWorkflows();
        case "restore_workflows":
          return await this.restoreWorkflows(args.backup);
        case "create_multi_service_workflow":
          return N8NTool.createMultiServiceWorkflow(args.services, args.templateParams);
        case "create_conditional_workflow":
          return N8NTool.createConditionalWorkflow(args.conditions, args.templateParams);

        default:
          throw new Error(`Unknown action: ${args.action}`);
      }

    } catch (error: unknown) {
      console.error("❌ n8n operation failed:", error);
      return {
        success: false,
        error: `n8n operation failed: ${error instanceof Error ? error.message : String(error)}`,
        action: args.action,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Workflow Operations
  private async createWorkflow(args: any): Promise<any> {
    let workflow: N8NWorkflow;

    if (args.workflowTemplate) {
      workflow = this.generateWorkflowFromTemplate(args.workflowTemplate, args.templateParams);
    } else {
      workflow = {
        name: args.workflowName || "New Workflow",
        nodes: args.nodes || [],
        connections: args.connections || {},
        active: args.active || false,
        tags: args.tags || []
      };
    }

    const response = await this.makeRequest('POST', '/workflows', workflow);
    
    if (args.active) {
      await this.activateWorkflow(response.id);
    }

    return {
      success: true,
      workflow: response,
      action: "create_workflow",
      timestamp: new Date().toISOString()
    };
  }

  private async updateWorkflow(args: any): Promise<any> {
    const workflow = args.workflow;
    workflow.id = args.workflowId;

    const response = await this.makeRequest('PUT', `/workflows/${args.workflowId}`, workflow);

    return {
      success: true,
      workflow: response,
      action: "update_workflow",
      timestamp: new Date().toISOString()
    };
  }

  private async deleteWorkflow(workflowId: string): Promise<any> {
    await this.makeRequest('DELETE', `/workflows/${workflowId}`);

    return {
      success: true,
      workflowId,
      action: "delete_workflow",
      timestamp: new Date().toISOString()
    };
  }

  private async getWorkflow(workflowId: string): Promise<any> {
    const workflow = await this.makeRequest('GET', `/workflows/${workflowId}`);

    return {
      success: true,
      workflow,
      action: "get_workflow",
      timestamp: new Date().toISOString()
    };
  }

  private async listWorkflows(filter?: any, limit: number = 100): Promise<any> {
    let url = `/workflows?limit=${limit}`;
    
    if (filter) {
      const params = new URLSearchParams();
      Object.keys(filter).forEach(key => {
        params.append(key, filter[key]);
      });
      url += `&${params.toString()}`;
    }

    const response = await this.makeRequest('GET', url);

    return {
      success: true,
      workflows: response.data || response,
      count: response.data?.length || (Array.isArray(response) ? response.length : 0),
      action: "list_workflows",
      timestamp: new Date().toISOString()
    };
  }

  private async duplicateWorkflow(workflowId: string, newName?: string): Promise<any> {
    const originalWorkflow = await this.getWorkflow(workflowId);
    const workflow = originalWorkflow.workflow;
    
    delete workflow.id;
    workflow.name = newName || `${workflow.name} (Copy)`;
    workflow.active = false;

    return await this.createWorkflow({ workflow });
  }

  private async exportWorkflow(workflowId: string): Promise<any> {
    const workflowData = await this.getWorkflow(workflowId);

    return {
      success: true,
      export: workflowData.workflow,
      exportedAt: new Date().toISOString(),
      action: "export_workflow"
    };
  }

  private async importWorkflow(workflow: N8NWorkflow): Promise<any> {
    delete workflow.id;
    workflow.active = false;

    return await this.createWorkflow({ workflow });
  }

  // Execution Operations
  private async executeWorkflow(workflowId: string, waitTillDone: boolean = true, includeData: boolean = false): Promise<any> {
    const body = {
      workflowId,
      loadedRunData: undefined,
      loadedWorkflowData: undefined
    };

    let url = `/workflows/${workflowId}/execute`;
    if (waitTillDone) {
      url += '?waitTillDone=true';
    }

    const response = await this.makeRequest('POST', url, body);

    return {
      success: true,
      execution: response,
      workflowId,
      action: "execute_workflow",
      timestamp: new Date().toISOString()
    };
  }

  private async activateWorkflow(workflowId: string): Promise<any> {
    const response = await this.makeRequest('POST', `/workflows/${workflowId}/activate`);

    return {
      success: true,
      workflowId,
      active: true,
      action: "activate_workflow",
      timestamp: new Date().toISOString()
    };
  }

  private async deactivateWorkflow(workflowId: string): Promise<any> {
    const response = await this.makeRequest('POST', `/workflows/${workflowId}/deactivate`);

    return {
      success: true,
      workflowId,
      active: false,
      action: "deactivate_workflow",
      timestamp: new Date().toISOString()
    };
  }

  // Credential Operations
  private async createCredential(credential: Partial<N8NCredential>): Promise<any> {
    const response = await this.makeRequest('POST', '/credentials', credential);

    return {
      success: true,
      credential: response,
      action: "create_credential",
      timestamp: new Date().toISOString()
    };
  }

  private async updateCredential(credentialId: string, credential: Partial<N8NCredential>): Promise<any> {
    const response = await this.makeRequest('PUT', `/credentials/${credentialId}`, credential);

    return {
      success: true,
      credential: response,
      action: "update_credential",
      timestamp: new Date().toISOString()
    };
  }

  private async deleteCredential(credentialId: string): Promise<any> {
    await this.makeRequest('DELETE', `/credentials/${credentialId}`);

    return {
      success: true,
      credentialId,
      action: "delete_credential",
      timestamp: new Date().toISOString()
    };
  }

  private async getCredential(credentialId: string): Promise<any> {
    const credential = await this.makeRequest('GET', `/credentials/${credentialId}`);

    return {
      success: true,
      credential,
      action: "get_credential",
      timestamp: new Date().toISOString()
    };
  }

  private async listCredentials(filter?: any): Promise<any> {
    let url = '/credentials';
    
    if (filter) {
      const params = new URLSearchParams();
      Object.keys(filter).forEach(key => {
        params.append(key, filter[key]);
      });
      url += `?${params.toString()}`;
    }

    const credentials = await this.makeRequest('GET', url);

    return {
      success: true,
      credentials,
      count: credentials.length,
      action: "list_credentials",
      timestamp: new Date().toISOString()
    };
  }

  // Execution Monitoring
  private async listExecutions(workflowId?: string, limit: number = 100, filter?: any): Promise<any> {
    let url = `/executions?limit=${limit}`;
    
    if (workflowId) {
      url += `&workflowId=${workflowId}`;
    }

    if (filter) {
      const params = new URLSearchParams();
      Object.keys(filter).forEach(key => {
        url += `&${key}=${filter[key]}`;
      });
    }

    const response = await this.makeRequest('GET', url);

    return {
      success: true,
      executions: response.data || response,
      count: response.data?.length || (Array.isArray(response) ? response.length : 0),
      action: "list_executions",
      timestamp: new Date().toISOString()
    };
  }

  private async getExecution(executionId: string, includeData: boolean = false): Promise<any> {
    let url = `/executions/${executionId}`;
    if (includeData) {
      url += '?includeData=true';
    }

    const execution = await this.makeRequest('GET', url);

    return {
      success: true,
      execution,
      action: "get_execution",
      timestamp: new Date().toISOString()
    };
  }

  private async stopExecution(executionId: string): Promise<any> {
    const response = await this.makeRequest('POST', `/executions/${executionId}/stop`);

    return {
      success: true,
      executionId,
      action: "stop_execution",
      timestamp: new Date().toISOString()
    };
  }

  private async deleteExecution(executionId: string): Promise<any> {
    await this.makeRequest('DELETE', `/executions/${executionId}`);

    return {
      success: true,
      executionId,
      action: "delete_execution",
      timestamp: new Date().toISOString()
    };
  }

  // System Operations
  private async healthCheck(): Promise<any> {
    const response = await this.makeRequest('GET', '/healthz');

    return {
      success: true,
      health: response,
      action: "health_check",
      timestamp: new Date().toISOString()
    };
  }

  private async getVersion(): Promise<any> {
    const response = await this.makeRequest('GET', '/version');

    return {
      success: true,
      version: response,
      action: "get_version",
      timestamp: new Date().toISOString()
    };
  }

  private async getMetrics(): Promise<any> {
    try {
      const response = await this.makeRequest('GET', '/metrics');
      return {
        success: true,
        metrics: response,
        action: "get_metrics",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: "Metrics endpoint may not be available",
        action: "get_metrics",
        timestamp: new Date().toISOString()
      };
    }
  }

  // Webhook Operations
  private async createWebhook(webhookPath: string): Promise<any> {
    const webhookUrl = `${this.baseUrl}/webhook/${webhookPath}`;

    return {
      success: true,
      webhookUrl,
      webhookPath,
      action: "create_webhook",
      timestamp: new Date().toISOString(),
      note: "Webhook created. Add a Webhook node to your workflow with this path."
    };
  }

  private async deleteWebhook(webhookPath: string): Promise<any> {
    return {
      success: true,
      webhookPath,
      action: "delete_webhook",
      timestamp: new Date().toISOString(),
      note: "Remove the Webhook node from your workflow to delete the webhook."
    };
  }

  private async testWebhook(webhookPath: string): Promise<any> {
    try {
      const webhookUrl = `${this.baseUrl}/webhook-test/${webhookPath}`;
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: true, timestamp: new Date().toISOString() })
      });

      const result = await response.json();

      return {
        success: true,
        webhookUrl,
        response: result,
        status: response.status,
        action: "test_webhook",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: `Webhook test failed: ${error}`,
        webhookPath,
        action: "test_webhook",
        timestamp: new Date().toISOString()
      };
    }
  }

  // Template Operations
  private generateWorkflowFromTemplate(template: string, params?: any): N8NWorkflow {
    const templates = this.getWorkflowTemplates();
    const templateDef = templates[template];

    if (!templateDef) {
      throw new Error(`Unknown workflow template: ${template}`);
    }

    return templateDef(params || {});
  }

  private getWorkflowTemplate(template: string, params?: any): any {
    const workflow = this.generateWorkflowFromTemplate(template, params);

    return {
      success: true,
      template,
      workflow,
      action: "get_workflow_template",
      timestamp: new Date().toISOString()
    };
  }

  // Tag Operations
  private async createTag(tag: { name: string; color?: string }): Promise<any> {
    const response = await this.makeRequest('POST', '/tags', tag);

    return {
      success: true,
      tag: response,
      action: "create_tag",
      timestamp: new Date().toISOString()
    };
  }

  private async listTags(): Promise<any> {
    const tags = await this.makeRequest('GET', '/tags');

    return {
      success: true,
      tags,
      count: tags.length,
      action: "list_tags",
      timestamp: new Date().toISOString()
    };
  }

  // Backup Operations
  private async backupWorkflows(): Promise<any> {
    const workflows = await this.listWorkflows();
    const credentials = await this.listCredentials();

    const backup = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      workflows: workflows.workflows,
      credentials: credentials.credentials.map((cred: any) => ({
        ...cred,
        data: "*** ENCRYPTED ***" // Don't include actual credential data
      }))
    };

    return {
      success: true,
      backup,
      workflowCount: workflows.count,
      credentialCount: credentials.count,
      action: "backup_workflows",
      timestamp: new Date().toISOString()
    };
  }

  private async restoreWorkflows(backup: any): Promise<any> {
    const results = {
      workflows: { imported: 0, failed: 0 },
      credentials: { imported: 0, failed: 0 }
    };

    // Restore workflows
    for (const workflow of backup.workflows || []) {
      try {
        delete workflow.id;
        workflow.active = false;
        await this.createWorkflow({ workflow });
        results.workflows.imported++;
      } catch (error) {
        results.workflows.failed++;
        console.warn(`Failed to restore workflow ${workflow.name}:`, error);
      }
    }

    return {
      success: true,
      results,
      action: "restore_workflows",
      timestamp: new Date().toISOString()
    };
  }

  // Utility Methods
  private async makeRequest(method: string, endpoint: string, body?: any): Promise<any> {
    const url = `${this.baseUrl}/api/v1${endpoint}`;
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': this.apiKey,
        'User-Agent': this.userAgent
      }
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(body);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const responseText = await response.text();
      
      if (!responseText) {
        return {};
      }

      try {
        return JSON.parse(responseText);
      } catch {
        return responseText;
      }

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private maskUrl(): string {
    return this.baseUrl.replace(/\/\/(.+?)@/, '//***@');
  }

  // Workflow Templates
  private getWorkflowTemplates(): Record<string, (params: any) => N8NWorkflow> {
    return {
      basic_webhook: (params) => ({
        name: params.name || "Basic Webhook Handler",
        nodes: [
          {
            id: "webhook",
            name: "Webhook",
            type: "n8n-nodes-base.webhook",
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              path: params.path || "webhook",
              httpMethod: params.method || "POST",
              responseMode: "respondWithBinary",
              options: {}
            },
            webhookId: "webhook"
          },
          {
            id: "response",
            name: "Respond to Webhook",
            type: "n8n-nodes-base.respondToWebhook",
            typeVersion: 1,
            position: [450, 300],
            parameters: {
              statusCode: 200,
              body: params.response || '{"status": "success", "message": "Webhook received"}'
            }
          }
        ],
        connections: {
          "Webhook": {
            "main": [[{ node: "Respond to Webhook", type: "main", index: 0 }]]
          }
        }
      }),

      api_integration: (params) => ({
        name: params.name || "API Integration",
        nodes: [
          {
            id: "trigger",
            name: "Manual Trigger",
            type: "n8n-nodes-base.manualTrigger",
            typeVersion: 1,
            position: [250, 300],
            parameters: {}
          },
          {
            id: "http_request",
            name: "HTTP Request",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4,
            position: [450, 300],
            parameters: {
              url: params.url || "https://api.example.com/data",
              method: params.method || "GET",
              options: {
                headers: params.headers || {}
              }
            }
          }
        ],
        connections: {
          "Manual Trigger": {
            "main": [[{ node: "HTTP Request", type: "main", index: 0 }]]
          }
        }
      }),

      email_automation: (params) => ({
        name: params.name || "Email Automation",
        nodes: [
          {
            id: "trigger",
            name: "Schedule Trigger",
            type: "n8n-nodes-base.scheduleTrigger",
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              rule: {
                interval: [{
                  field: params.interval || "hours",
                  intervalValue: params.intervalValue || 24
                }]
              }
            }
          },
          {
            id: "email",
            name: "Gmail",
            type: "n8n-nodes-base.gmail",
            typeVersion: 2,
            position: [450, 300],
            parameters: {
              operation: "send",
              resource: "message",
              to: params.to || "recipient@example.com",
              subject: params.subject || "Automated Email",
              message: params.message || "This is an automated message from n8n."
            }
          }
        ],
        connections: {
          "Schedule Trigger": {
            "main": [[{ node: "Gmail", type: "main", index: 0 }]]
          }
        }
      }),

      data_transformation: (params) => ({
        name: params.name || "Data Transformation",
        nodes: [
          {
            id: "webhook",
            name: "Webhook",
            type: "n8n-nodes-base.webhook",
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              path: params.path || "data",
              httpMethod: "POST"
            }
          },
          {
            id: "function",
            name: "Function",
            type: "n8n-nodes-base.function",
            typeVersion: 1,
            position: [450, 300],
            parameters: {
              functionCode: params.transformCode || `
// Transform incoming data
const inputData = $input.all();
const transformedData = inputData.map(item => ({
  ...item.json,
  processed_at: new Date().toISOString(),
  status: 'processed'
}));
return transformedData;`
            }
          },
          {
            id: "response",
            name: "Respond to Webhook",
            type: "n8n-nodes-base.respondToWebhook",
            typeVersion: 1,
            position: [650, 300],
            parameters: {
              statusCode: 200,
              body: '{"status": "data processed successfully"}'
            }
          }
        ],
        connections: {
          "Webhook": {
            "main": [[{ node: "Function", type: "main", index: 0 }]]
          },
          "Function": {
            "main": [[{ node: "Respond to Webhook", type: "main", index: 0 }]]
          }
        }
      }),

      slack_notification: (params) => ({
        name: params.name || "Slack Notification",
        nodes: [
          {
            id: "webhook",
            name: "Webhook",
            type: "n8n-nodes-base.webhook",
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              path: params.path || "slack-notify",
              httpMethod: "POST"
            }
          },
          {
            id: "slack",
            name: "Slack",
            type: "n8n-nodes-base.slack",
            typeVersion: 2,
            position: [450, 300],
            parameters: {
              operation: "post",
              resource: "message",
              channel: params.channel || "#general",
              text: params.text || "Alert: {{$json.message}}",
              username: params.username || "n8n-bot"
            }
          }
        ],
        connections: {
          "Webhook": {
            "main": [[{ node: "Slack", type: "main", index: 0 }]]
          }
        }
      }),

      database_sync: (params) => ({
        name: params.name || "Database Sync",
        nodes: [
          {
            id: "schedule",
            name: "Schedule Trigger",
            type: "n8n-nodes-base.scheduleTrigger",
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              rule: {
                interval: [{
                  field: "minutes",
                  intervalValue: params.intervalMinutes || 15
                }]
              }
            }
          },
          {
            id: "postgres_read",
            name: "Postgres Source",
            type: "n8n-nodes-base.postgres",
            typeVersion: 2,
            position: [450, 300],
            parameters: {
              operation: "executeQuery",
              query: params.sourceQuery || "SELECT * FROM source_table WHERE updated_at > NOW() - INTERVAL '15 minutes'"
            }
          },
          {
            id: "postgres_write",
            name: "Postgres Target",
            type: "n8n-nodes-base.postgres",
            typeVersion: 2,
            position: [650, 300],
            parameters: {
              operation: "insert",
              table: params.targetTable || "target_table",
              columns: params.columns || "id,name,data,synced_at"
            }
          }
        ],
        connections: {
          "Schedule Trigger": {
            "main": [[{ node: "Postgres Source", type: "main", index: 0 }]]
          },
          "Postgres Source": {
            "main": [[{ node: "Postgres Target", type: "main", index: 0 }]]
          }
        }
      }),

      ai_workflow: (params) => ({
        name: params.name || "AI Processing Workflow",
        nodes: [
          {
            id: "webhook",
            name: "Webhook",
            type: "n8n-nodes-base.webhook",
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              path: params.path || "ai-process",
              httpMethod: "POST"
            }
          },
          {
            id: "openai",
            name: "OpenAI",
            type: "@n8n/n8n-nodes-langchain.openAi",
            typeVersion: 1,
            position: [450, 300],
            parameters: {
              operation: "text",
              model: params.model || "gpt-3.5-turbo",
              prompt: params.prompt || "Analyze the following data and provide insights: {{$json.data}}",
              maxTokens: params.maxTokens || 1000
            }
          },
          {
            id: "response",
            name: "Respond to Webhook",
            type: "n8n-nodes-base.respondToWebhook",
            typeVersion: 1,
            position: [650, 300],
            parameters: {
              statusCode: 200,
              body: '{"analysis": "{{$json.text}}", "processed_at": "{{new Date().toISOString()}}"}'
            }
          }
        ],
        connections: {
          "Webhook": {
            "main": [[{ node: "OpenAI", type: "main", index: 0 }]]
          },
          "OpenAI": {
            "main": [[{ node: "Respond to Webhook", type: "main", index: 0 }]]
          }
        }
      }),

      file_processor: (params) => ({
        name: params.name || "File Processing Workflow",
        nodes: [
          {
            id: "webhook",
            name: "File Upload Webhook",
            type: "n8n-nodes-base.webhook",
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              path: params.path || "file-upload",
              httpMethod: "POST",
              options: {
                binaryData: true
              }
            }
          },
          {
            id: "read_file",
            name: "Read Binary File",
            type: "n8n-nodes-base.readBinaryFile",
            typeVersion: 1,
            position: [450, 200],
            parameters: {
              filePath: "={{$json.filePath}}"
            }
          },
          {
            id: "process_csv",
            name: "Spreadsheet File",
            type: "n8n-nodes-base.spreadsheetFile",
            typeVersion: 2,
            position: [450, 400],
            parameters: {
              operation: "read",
              binaryPropertyName: "data",
              options: {
                headerRow: true
              }
            }
          },
          {
            id: "function",
            name: "Process Data",
            type: "n8n-nodes-base.function",
            typeVersion: 1,
            position: [650, 300],
            parameters: {
              functionCode: params.processCode || `
// Process file data
const items = $input.all();
return items.map(item => ({
  ...item.json,
  processed: true,
  processed_at: new Date().toISOString()
}));`
            }
          }
        ],
        connections: {
          "File Upload Webhook": {
            "main": [
              [{ node: "Read Binary File", type: "main", index: 0 }],
              [{ node: "Spreadsheet File", type: "main", index: 0 }]
            ]
          },
          "Read Binary File": {
            "main": [[{ node: "Process Data", type: "main", index: 0 }]]
          },
          "Spreadsheet File": {
            "main": [[{ node: "Process Data", type: "main", index: 0 }]]
          }
        }
      }),

      ecommerce_sync: (params) => ({
        name: params.name || "E-commerce Sync",
        nodes: [
          {
            id: "schedule",
            name: "Schedule Trigger",
            type: "n8n-nodes-base.scheduleTrigger",
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              rule: {
                interval: [{
                  field: "hours",
                  intervalValue: params.syncHours || 1
                }]
              }
            }
          },
          {
            id: "shopify",
            name: "Shopify",
            type: "n8n-nodes-base.shopify",
            typeVersion: 1,
            position: [450, 300],
            parameters: {
              operation: "getAll",
              resource: params.resource || "product",
              limit: params.limit || 100
            }
          },
          {
            id: "sheets",
            name: "Google Sheets",
            type: "n8n-nodes-base.googleSheets",
            typeVersion: 4,
            position: [650, 300],
            parameters: {
              operation: "appendOrUpdate",
              documentId: params.spreadsheetId || "",
              sheetName: params.sheetName || "Products",
              columns: {
                mappingMode: "defineBelow",
                values: {
                  "Product ID": "={{$json.id}}",
                  "Title": "={{$json.title}}",
                  "Price": "={{$json.variants[0].price}}",
                  "Inventory": "={{$json.variants[0].inventory_quantity}}",
                  "Updated": "={{new Date().toISOString()}}"
                }
              }
            }
          }
        ],
        connections: {
          "Schedule Trigger": {
            "main": [[{ node: "Shopify", type: "main", index: 0 }]]
          },
          "Shopify": {
            "main": [[{ node: "Google Sheets", type: "main", index: 0 }]]
          }
        }
      }),

      form_handler: (params) => ({
        name: params.name || "Form Handler",
        nodes: [
          {
            id: "webhook",
            name: "Form Webhook",
            type: "n8n-nodes-base.webhook",
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              path: params.path || "form-submit",
              httpMethod: "POST"
            }
          },
          {
            id: "validate",
            name: "Validate Data",
            type: "n8n-nodes-base.function",
            typeVersion: 1,
            position: [450, 200],
            parameters: {
              functionCode: `
// Validate form data
const data = $json;
const errors = [];

if (!data.email || !data.email.includes('@')) {
  errors.push('Invalid email address');
}

if (!data.name || data.name.length < 2) {
  errors.push('Name must be at least 2 characters');
}

if (errors.length > 0) {
  throw new Error('Validation failed: ' + errors.join(', '));
}

return [{ json: { ...data, validated: true } }];`
            }
          },
          {
            id: "email_notification",
            name: "Send Notification",
            type: "n8n-nodes-base.emailSend",
            typeVersion: 2,
            position: [650, 200],
            parameters: {
              to: params.notificationEmail || "admin@example.com",
              subject: "New Form Submission",
              message: "New form submission from {{$json.name}} ({{$json.email}})",
              options: {}
            }
          },
          {
            id: "save_data",
            name: "Save to Database",
            type: "n8n-nodes-base.postgres",
            typeVersion: 2,
            position: [650, 400],
            parameters: {
              operation: "insert",
              table: params.table || "form_submissions",
              columns: "name,email,message,submitted_at"
            }
          },
          {
            id: "response",
            name: "Form Response",
            type: "n8n-nodes-base.respondToWebhook",
            typeVersion: 1,
            position: [850, 300],
            parameters: {
              statusCode: 200,
              body: '{"status": "success", "message": "Form submitted successfully"}'
            }
          }
        ],
        connections: {
          "Form Webhook": {
            "main": [[{ node: "Validate Data", type: "main", index: 0 }]]
          },
          "Validate Data": {
            "main": [
              [{ node: "Send Notification", type: "main", index: 0 }],
              [{ node: "Save to Database", type: "main", index: 0 }]
            ]
          },
          "Send Notification": {
            "main": [[{ node: "Form Response", type: "main", index: 0 }]]
          },
          "Save to Database": {
            "main": [[{ node: "Form Response", type: "main", index: 0 }]]
          }
        }
      }),

      social_media: (params) => ({
        name: params.name || "Social Media Automation",
        nodes: [
          {
            id: "schedule",
            name: "Schedule Trigger",
            type: "n8n-nodes-base.scheduleTrigger",
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              rule: {
                interval: [{
                  field: "hours",
                  intervalValue: params.postHours || 4
                }]
              }
            }
          },
          {
            id: "content_source",
            name: "Content Source",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4,
            position: [450, 300],
            parameters: {
              url: params.contentUrl || "https://api.example.com/content",
              method: "GET",
              options: {}
            }
          },
          {
            id: "twitter",
            name: "Twitter",
            type: "n8n-nodes-base.twitter",
            typeVersion: 2,
            position: [650, 200],
            parameters: {
              operation: "tweet",
              resource: "tweet",
              text: params.tweetText || "{{$json.content}} #automation"
            }
          },
          {
            id: "linkedin",
            name: "LinkedIn",
            type: "n8n-nodes-base.linkedIn",
            typeVersion: 1,
            position: [650, 400],
            parameters: {
              operation: "create",
              resource: "post",
              text: params.linkedinText || "{{$json.content}}"
            }
          }
        ],
        connections: {
          "Schedule Trigger": {
            "main": [[{ node: "Content Source", type: "main", index: 0 }]]
          },
          "Content Source": {
            "main": [
              [{ node: "Twitter", type: "main", index: 0 }],
              [{ node: "LinkedIn", type: "main", index: 0 }]
            ]
          }
        }
      }),

      schedule_task: (params) => ({
        name: params.name || "Scheduled Task",
        nodes: [
          {
            id: "cron",
            name: "Cron Trigger",
            type: "n8n-nodes-base.cron",
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              cronExpression: params.cronExpression || "0 9 * * 1-5" // 9 AM weekdays
            }
          },
          {
            id: "task",
            name: "Execute Task",
            type: "n8n-nodes-base.function",
            typeVersion: 1,
            position: [450, 300],
            parameters: {
              functionCode: params.taskCode || `
// Your scheduled task logic here
const now = new Date();
console.log('Task executed at:', now.toISOString());

return [{
  json: {
    executed_at: now.toISOString(),
    status: 'completed',
    task_name: '${params.taskName || 'scheduled_task'}'
  }
}];`
            }
          },
          {
            id: "notification",
            name: "Task Notification",
            type: "n8n-nodes-base.emailSend",
            typeVersion: 2,
            position: [650, 300],
            parameters: {
              to: params.notifyEmail || "admin@example.com",
              subject: "Scheduled Task Completed",
              message: "Task '{{$json.task_name}}' completed at {{$json.executed_at}}"
            }
          }
        ],
        connections: {
          "Cron Trigger": {
            "main": [[{ node: "Execute Task", type: "main", index: 0 }]]
          },
          "Execute Task": {
            "main": [[{ node: "Task Notification", type: "main", index: 0 }]]
          }
        }
      })
    };
  }

  // Advanced Utility Methods
  
  /**
   * Create a complex multi-service workflow
   */
  static createMultiServiceWorkflow(services: string[], params: any = {}): N8NWorkflow {
    const nodes: N8NNode[] = [];
    const connections: Record<string, Record<string, N8NConnection[][]>> = {};

    // Add webhook trigger
    nodes.push({
      id: "webhook_trigger",
      name: "Webhook Trigger",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [250, 300],
      parameters: {
        path: params.webhookPath || "multi-service",
        httpMethod: "POST"
      }
    });

    // Add service nodes
    services.forEach((service, index) => {
      const yPos = 300 + (index * 100);
      const nodeId = `${service.toLowerCase()}_${index}`;
      
      nodes.push({
        id: nodeId,
        name: service,
        type: `n8n-nodes-base.${service.toLowerCase()}`,
        typeVersion: 1,
        position: [450 + (index * 200), yPos],
        parameters: params[service.toLowerCase()] || {}
      });

      // Connect previous node to current node
      const prevNodeName = index === 0 ? "Webhook Trigger" : services[index - 1];
      connections[prevNodeName] = {
        main: [[{ node: service, type: "main", index: 0 }]]
      };
    });

    return {
      name: params.name || "Multi-Service Workflow",
      nodes,
      connections,
      active: params.active || false,
      tags: params.tags || ["multi-service", "automation"]
    };
  }

  /**
   * Create conditional workflow with branching logic
   */
  static createConditionalWorkflow(conditions: any[], params: any = {}): N8NWorkflow {
    const nodes: N8NNode[] = [
      {
        id: "trigger",
        name: "Manual Trigger",
        type: "n8n-nodes-base.manualTrigger",
        typeVersion: 1,
        position: [250, 300],
        parameters: {}
      },
      {
        id: "switch",
        name: "Switch",
        type: "n8n-nodes-base.switch",
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          rules: {
            rules: conditions.map((condition, index) => ({
              operation: condition.operation || "equal",
              value1: condition.value1,
              value2: condition.value2,
              output: index
            }))
          }
        }
      }
    ];

    const connections: Record<string, Record<string, N8NConnection[][]>> = {
      "Manual Trigger": {
        main: [[{ node: "Switch", type: "main", index: 0 }]]
      },
      "Switch": {
        main: []
      }
    };

    // Add condition branches
    conditions.forEach((condition, index) => {
      const nodeId = `branch_${index}`;
      nodes.push({
        id: nodeId,
        name: `Branch ${index + 1}`,
        type: condition.nodeType || "n8n-nodes-base.function",
        typeVersion: 1,
        position: [650, 200 + (index * 150)],
        parameters: condition.parameters || {}
      });

      connections.Switch.main[index] = [{ node: `Branch ${index + 1}`, type: "main", index: 0 }];
    });

    return {
      name: params.name || "Conditional Workflow",
      nodes,
      connections,
      active: params.active || false,
      tags: params.tags || ["conditional", "branching"]
    };
  }

  /**
   * Monitor workflow performance and health
   */
  async monitorWorkflows(workflowIds?: string[]): Promise<any> {
    const results: {
      healthy: { workflowId: string; name: string; status: string; }[];
      issues: { workflowId: string; name: string; issue: string; }[];
      metrics: {
        totalWorkflows: number;
        activeWorkflows: number;
        failedExecutions: number;
        averageExecutionTime: number;
      };
    } = {
      healthy: [],
      issues: [],
      metrics: {
        totalWorkflows: 0,
        activeWorkflows: 0,
        failedExecutions: 0,
        averageExecutionTime: 0
      }
    };

    try {
      const workflows = workflowIds
        ? await Promise.all(workflowIds.map(id => this.getWorkflow(id)))
        : await this.listWorkflows();

      const workflowList: N8NWorkflow[] = workflowIds ? workflows.map((w: any) => w.workflow) : workflows.workflows;
      results.metrics.totalWorkflows = workflowList.length;
      results.metrics.activeWorkflows = workflowList.filter((w: N8NWorkflow) => w.active).length;

      // Check each workflow's recent executions
      for (const workflow of workflowList) {
        try {
          const executions = await this.listExecutions(workflow.id, 10);
          const recentFailures = executions.executions.filter((e: N8NExecution) => e.status === 'error').length;
          
          if (recentFailures > 5) {
            results.issues.push({
              workflowId: workflow.id!,
              name: workflow.name,
              issue: `High failure rate: ${recentFailures}/10 recent executions failed`
            });
          } else {
            results.healthy.push({
              workflowId: workflow.id!,
              name: workflow.name,
              status: 'healthy'
            });
          }

          results.metrics.failedExecutions += recentFailures;
        } catch (error: unknown) {
          results.issues.push({
            workflowId: workflow.id!,
            name: workflow.name,
            issue: `Unable to fetch execution data: ${error instanceof Error ? error.message : String(error)}`
          });
        }
      }

      return {
        success: true,
        monitoring: results,
        action: "monitor_workflows",
        timestamp: new Date().toISOString()
      };

    } catch (error: unknown) {
      return {
        success: false,
        error: `Monitoring failed: ${error instanceof Error ? error.message : String(error)}`,
        action: "monitor_workflows",
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Batch operations for multiple workflows
   */
  async batchOperation(operation: string, workflowIds: string[], params: any = {}): Promise<any> {
    const results: {
      successful: { workflowId: string; result: any; }[];
      failed: { workflowId: string; error: string; }[];
    } = {
      successful: [],
      failed: []
    };

    for (const workflowId of workflowIds) {
      try {
        let result;
        
        switch (operation) {
          case "activate":
            result = await this.activateWorkflow(workflowId);
            break;
          case "deactivate":
            result = await this.deactivateWorkflow(workflowId);
            break;
          case "execute":
            result = await this.executeWorkflow(workflowId, params.waitTillDone, params.includeData);
            break;
          case "delete":
            result = await this.deleteWorkflow(workflowId);
            break;
          default:
            throw new Error(`Unknown batch operation: ${operation}`);
        }

        results.successful.push({ workflowId, result });
        
      } catch (error: unknown) {
        results.failed.push({ 
          workflowId, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }

    return {
      success: true,
      batchOperation: operation,
      results,
      successCount: results.successful.length,
      failureCount: results.failed.length,
      timestamp: new Date().toISOString()
    };
  }
}
