import { FunctionDeclaration, Type } from "@google/genai";

export class VercelTool {
  private apiKey: string;
  private baseUrl: string = "https://api.vercel.com";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "vercel_deploy",
      description: "Comprehensive serverless deployment and hosting management tool powered by Vercel. Deploy applications, manage projects, configure domains, monitor deployments, and handle team collaboration. Supports Next.js, React, Vue, Angular, static sites, and serverless functions. Perfect for CI/CD pipelines, automated deployments, project management, domain configuration, and performance monitoring. Handles git integration, environment variables, build optimization, and global edge network deployment.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "Vercel operation to perform. Choose 'deploy' for deploying applications, 'list_deployments' for viewing deployment history, 'get_deployment' for deployment details, 'cancel_deployment' for stopping deployments, 'list_projects' for project management, 'create_project' for new projects, 'update_project' for project configuration, 'delete_project' for project removal, 'list_domains' for domain management, 'add_domain' for domain configuration, 'remove_domain' for domain removal, 'get_logs' for deployment logs, or 'list_teams' for team management."
          },
          projectName: {
            type: Type.STRING,
            description: "Name of the Vercel project for deployment or management operations (required for most actions). Must be unique within your account/team. Examples: 'my-nextjs-app', 'company-website', 'api-service'. Used for project creation, updates, deployments, and domain configuration. Should follow naming conventions (lowercase, hyphens allowed)."
          },
          deploymentId: {
            type: Type.STRING,
            description: "Unique deployment identifier for specific deployment operations (required for get_deployment, cancel_deployment, get_logs actions). Format: unique string identifier from Vercel. Use this to monitor, cancel, or retrieve details about specific deployments. Obtained from deployment responses or list operations."
          },
          gitUrl: {
            type: Type.STRING,
            description: "Git repository URL for deployment (required for deploy action). Supports GitHub, GitLab, and Bitbucket repositories. Examples: 'https://github.com/user/repo.git', 'git@github.com:user/repo.git'. The repository should contain a deployable application with proper configuration files (package.json, etc.)."
          },
          branch: {
            type: Type.STRING,
            description: "Git branch to deploy from (default: 'main' or 'master'). Specify different branches for staging/production deployments. Examples: 'main', 'develop', 'feature/new-ui'. Useful for managing different environments and deployment strategies. Branch must exist in the specified repository."
          },
          domain: {
            type: Type.STRING,
            description: "Custom domain name for domain management operations (required for add_domain, remove_domain actions). Examples: 'example.com', 'api.company.com', 'staging.myapp.io'. Must be a valid domain name that you own. Used for configuring custom domains for your deployments instead of Vercel's default URLs."
          },
          environment: {
            type: Type.OBJECT,
            description: "Environment variables for the deployment as key-value pairs. Examples: {'NODE_ENV': 'production', 'API_KEY': 'secret', 'DATABASE_URL': 'connection_string'}. These variables will be available to your application during build and runtime. Sensitive values should be marked as encrypted in Vercel dashboard."
          },
          buildCommand: {
            type: Type.STRING,
            description: "Custom build command override for the deployment (optional). Examples: 'npm run build', 'yarn build:prod', 'pnpm build'. If not specified, Vercel will auto-detect based on your framework. Use for custom build processes or monorepo configurations."
          },
          outputDirectory: {
            type: Type.STRING,
            description: "Build output directory for static sites (optional, default: auto-detected). Examples: 'dist', 'build', 'out', '.next'. Specifies where your built assets are located after the build process. Vercel will serve files from this directory for static deployments."
          },
          nodeVersion: {
            type: Type.STRING,
            description: "Node.js runtime version for the deployment (optional, default: latest LTS). Examples: '18.x', '20.x', '16.x'. Choose based on your application's compatibility requirements. Affects both build-time and runtime environment for serverless functions."
          },
          regions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Deployment regions for edge optimization (optional). Examples: ['sfo1', 'iad1', 'fra1'], ['all']. Controls where your serverless functions are deployed globally. Use specific regions for latency optimization or 'all' for maximum global distribution. Affects performance and costs."
          },
          teamId: {
            type: Type.STRING,
            description: "Vercel team identifier for team-scoped operations (optional). Required when working with team accounts instead of personal accounts. Obtained from team settings or list_teams action. Use for managing projects and deployments within specific teams or organizations."
          },
          public: {
            type: Type.BOOLEAN,
            description: "Make deployment publicly accessible (default: true). When false, deployment requires authentication to access. Useful for staging environments, internal tools, or private applications. Public deployments are accessible to anyone with the URL."
          },
          framework: {
            type: Type.STRING,
            description: "Framework preset for optimized deployment configuration (optional, auto-detected). Examples: 'nextjs', 'react', 'vue', 'angular', 'svelte', 'gatsby', 'nuxtjs'. Vercel applies framework-specific optimizations for build process, routing, and serverless functions when specified."
          },
          limit: {
            type: Type.NUMBER,
            description: "Maximum number of results to return for list operations (default: 20, max: 100). Use for pagination control when fetching deployments, projects, or domains. Higher values provide more comprehensive data but may impact response time."
          },
          since: {
            type: Type.NUMBER,
            description: "Unix timestamp to filter results from a specific time (optional). Use for fetching recent deployments, logs, or changes since a particular date. Helpful for monitoring recent activity or implementing incremental updates in automation workflows."
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const action = args.action;
      console.log(`🚀 Vercel ${action}: ${args.projectName || args.deploymentId || args.domain || 'operation'}`);

      switch (action) {
        case 'deploy':
          return await this.deployProject(args);
        case 'list_deployments':
          return await this.listDeployments(args);
        case 'get_deployment':
          return await this.getDeployment(args);
        case 'cancel_deployment':
          return await this.cancelDeployment(args);
        case 'list_projects':
          return await this.listProjects(args);
        case 'create_project':
          return await this.createProject(args);
        case 'update_project':
          return await this.updateProject(args);
        case 'delete_project':
          return await this.deleteProject(args);
        case 'list_domains':
          return await this.listDomains(args);
        case 'add_domain':
          return await this.addDomain(args);
        case 'remove_domain':
          return await this.removeDomain(args);
        case 'get_logs':
          return await this.getDeploymentLogs(args);
        case 'list_teams':
          return await this.listTeams(args);
        default:
          throw new Error(`Unknown action: ${action}`);
      }

    } catch (error: unknown) {
      console.error("❌ Vercel operation failed:", error);
      return {
        success: false,
        error: `Vercel operation failed: ${error instanceof Error ? error.message : String(error)}`,
        action: args.action
      };
    }
  }

  private async deployProject(args: any): Promise<any> {
    if (!args.projectName) {
      throw new Error("projectName is required for deploy action");
    }

    if (!args.gitUrl) {
      throw new Error("gitUrl is required for deploy action");
    }

    const deploymentData: any = {
      name: args.projectName,
      gitSource: {
        type: 'github', // Could be enhanced to detect from URL
        repoId: this.extractRepoFromUrl(args.gitUrl),
        ref: args.branch || 'main'
      }
    };

    if (args.environment) deploymentData.env = args.environment;
    if (args.buildCommand) deploymentData.buildCommand = args.buildCommand;
    if (args.outputDirectory) deploymentData.outputDirectory = args.outputDirectory;
    if (args.nodeVersion) deploymentData.nodeVersion = args.nodeVersion;
    if (args.regions) deploymentData.regions = args.regions;
    if (args.public !== undefined) deploymentData.public = args.public;
    if (args.framework) deploymentData.framework = args.framework;

    const headers: any = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    if (args.teamId) headers['X-Vercel-Team-Id'] = args.teamId;

    const response = await fetch(`${this.baseUrl}/v13/deployments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(deploymentData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      action: 'deploy',
      projectName: args.projectName,
      deploymentId: result.id,
      deploymentUrl: result.url,
      status: result.readyState || result.state,
      gitUrl: args.gitUrl,
      branch: args.branch || 'main',
      timestamp: new Date().toISOString()
    };
  }

  private async listDeployments(args: any): Promise<any> {
    const params = new URLSearchParams();
    
    if (args.projectName) params.append('projectId', args.projectName);
    if (args.limit) params.append('limit', args.limit.toString());
    if (args.since) params.append('since', args.since.toString());

    const headers: any = {
      'Authorization': `Bearer ${this.apiKey}`,
    };

    if (args.teamId) headers['X-Vercel-Team-Id'] = args.teamId;

    const response = await fetch(`${this.baseUrl}/v6/deployments?${params}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      action: 'list_deployments',
      deployments: result.deployments || result,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    };
  }

  private async getDeployment(args: any): Promise<any> {
    if (!args.deploymentId) {
      throw new Error("deploymentId is required for get_deployment action");
    }

    const headers: any = {
      'Authorization': `Bearer ${this.apiKey}`,
    };

    if (args.teamId) headers['X-Vercel-Team-Id'] = args.teamId;

    const response = await fetch(`${this.baseUrl}/v13/deployments/${args.deploymentId}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      action: 'get_deployment',
      deploymentId: args.deploymentId,
      deployment: result,
      timestamp: new Date().toISOString()
    };
  }

  private async cancelDeployment(args: any): Promise<any> {
    if (!args.deploymentId) {
      throw new Error("deploymentId is required for cancel_deployment action");
    }

    const headers: any = {
      'Authorization': `Bearer ${this.apiKey}`,
    };

    if (args.teamId) headers['X-Vercel-Team-Id'] = args.teamId;

    const response = await fetch(`${this.baseUrl}/v12/deployments/${args.deploymentId}/cancel`, {
      method: 'PATCH',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      action: 'cancel_deployment',
      deploymentId: args.deploymentId,
      status: result.state || 'cancelled',
      timestamp: new Date().toISOString()
    };
  }

  private async listProjects(args: any): Promise<any> {
    const params = new URLSearchParams();
    
    if (args.limit) params.append('limit', args.limit.toString());
    if (args.since) params.append('since', args.since.toString());

    const headers: any = {
      'Authorization': `Bearer ${this.apiKey}`,
    };

    if (args.teamId) headers['X-Vercel-Team-Id'] = args.teamId;

    const response = await fetch(`${this.baseUrl}/v9/projects?${params}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      action: 'list_projects',
      projects: result.projects || result,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    };
  }

  private async createProject(args: any): Promise<any> {
    if (!args.projectName) {
      throw new Error("projectName is required for create_project action");
    }

    const projectData: any = {
      name: args.projectName
    };

    if (args.framework) projectData.framework = args.framework;
    if (args.gitUrl) {
      projectData.gitRepository = {
        repo: this.extractRepoFromUrl(args.gitUrl),
        type: 'github' // Could be enhanced to detect from URL
      };
    }
    if (args.buildCommand) projectData.buildCommand = args.buildCommand;
    if (args.outputDirectory) projectData.outputDirectory = args.outputDirectory;
    if (args.nodeVersion) projectData.nodeVersion = args.nodeVersion;
    if (args.environment) projectData.environmentVariables = Object.entries(args.environment).map(([key, value]) => ({ key, value }));

    const headers: any = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    if (args.teamId) headers['X-Vercel-Team-Id'] = args.teamId;

    const response = await fetch(`${this.baseUrl}/v10/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify(projectData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      action: 'create_project',
      projectName: args.projectName,
      projectId: result.id,
      project: result,
      timestamp: new Date().toISOString()
    };
  }

  private async updateProject(args: any): Promise<any> {
    if (!args.projectName) {
      throw new Error("projectName is required for update_project action");
    }

    const updateData: any = {};

    if (args.framework) updateData.framework = args.framework;
    if (args.buildCommand) updateData.buildCommand = args.buildCommand;
    if (args.outputDirectory) updateData.outputDirectory = args.outputDirectory;
    if (args.nodeVersion) updateData.nodeVersion = args.nodeVersion;
    if (args.environment) updateData.environmentVariables = Object.entries(args.environment).map(([key, value]) => ({ key, value }));

    const headers: any = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    if (args.teamId) headers['X-Vercel-Team-Id'] = args.teamId;

    const response = await fetch(`${this.baseUrl}/v10/projects/${args.projectName}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      action: 'update_project',
      projectName: args.projectName,
      project: result,
      timestamp: new Date().toISOString()
    };
  }

  private async deleteProject(args: any): Promise<any> {
    if (!args.projectName) {
      throw new Error("projectName is required for delete_project action");
    }

    const headers: any = {
      'Authorization': `Bearer ${this.apiKey}`,
    };

    if (args.teamId) headers['X-Vercel-Team-Id'] = args.teamId;

    const response = await fetch(`${this.baseUrl}/v10/projects/${args.projectName}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      success: true,
      action: 'delete_project',
      projectName: args.projectName,
      timestamp: new Date().toISOString()
    };
  }

  private async listDomains(args: any): Promise<any> {
    const params = new URLSearchParams();
    
    if (args.limit) params.append('limit', args.limit.toString());
    if (args.since) params.append('since', args.since.toString());

    const headers: any = {
      'Authorization': `Bearer ${this.apiKey}`,
    };

    if (args.teamId) headers['X-Vercel-Team-Id'] = args.teamId;

    const response = await fetch(`${this.baseUrl}/v5/domains?${params}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      action: 'list_domains',
      domains: result.domains || result,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    };
  }

  private async addDomain(args: any): Promise<any> {
    if (!args.domain) {
      throw new Error("domain is required for add_domain action");
    }

    if (!args.projectName) {
      throw new Error("projectName is required for add_domain action");
    }

    const domainData = {
      name: args.domain,
      projectId: args.projectName
    };

    const headers: any = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    if (args.teamId) headers['X-Vercel-Team-Id'] = args.teamId;

    const response = await fetch(`${this.baseUrl}/v10/projects/${args.projectName}/domains`, {
      method: 'POST',
      headers,
      body: JSON.stringify(domainData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      action: 'add_domain',
      domain: args.domain,
      projectName: args.projectName,
      domainConfig: result,
      timestamp: new Date().toISOString()
    };
  }

  private async removeDomain(args: any): Promise<any> {
    if (!args.domain) {
      throw new Error("domain is required for remove_domain action");
    }

    if (!args.projectName) {
      throw new Error("projectName is required for remove_domain action");
    }

    const headers: any = {
      'Authorization': `Bearer ${this.apiKey}`,
    };

    if (args.teamId) headers['X-Vercel-Team-Id'] = args.teamId;

    const response = await fetch(`${this.baseUrl}/v9/projects/${args.projectName}/domains/${args.domain}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      success: true,
      action: 'remove_domain',
      domain: args.domain,
      projectName: args.projectName,
      timestamp: new Date().toISOString()
    };
  }

  private async getDeploymentLogs(args: any): Promise<any> {
    if (!args.deploymentId) {
      throw new Error("deploymentId is required for get_logs action");
    }

    const params = new URLSearchParams();
    if (args.limit) params.append('limit', args.limit.toString());
    if (args.since) params.append('since', args.since.toString());

    const headers: any = {
      'Authorization': `Bearer ${this.apiKey}`,
    };

    if (args.teamId) headers['X-Vercel-Team-Id'] = args.teamId;

    const response = await fetch(`${this.baseUrl}/v3/deployments/${args.deploymentId}/events?${params}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      action: 'get_logs',
      deploymentId: args.deploymentId,
      logs: result.events || result,
      timestamp: new Date().toISOString()
    };
  }

  private async listTeams(args: any): Promise<any> {
    const params = new URLSearchParams();
    if (args.limit) params.append('limit', args.limit.toString());

    const response = await fetch(`${this.baseUrl}/v2/teams?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      action: 'list_teams',
      teams: result.teams || result,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    };
  }

  private extractRepoFromUrl(gitUrl: string): string {
    // Extract repository identifier from git URL
    // Example: https://github.com/user/repo.git -> user/repo
    const match = gitUrl.match(/github\.com[\/:]([^\/]+\/[^\/]+?)(?:\.git)?$/);
    return match ? match[1] : gitUrl;
  }
}