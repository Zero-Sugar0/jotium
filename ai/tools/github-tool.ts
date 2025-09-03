import { FunctionDeclaration, Type } from "@google/genai";
import { Octokit } from "@octokit/rest";

export class GitHubTool {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  // Single comprehensive GitHub function definition
  getDefinition(): FunctionDeclaration {
    return {
      name: "github_tool",
      description: "Comprehensive GitHub API tool for searching repositories, analyzing code, tracking development activity, and researching users/organizations. This single tool provides access to all GitHub functionality including repository exploration, issue tracking, pull request analysis, commit history, releases, and user information.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The GitHub action to perform",
            enum: [
              "get_authenticated_user",
              "create_repository",
              "update_repository",
              "create_file",
              "update_file",
              "delete_file",
              "search_repositories",
              "get_repository", 
              "get_contents",
              "get_file",
              "get_issues",
              "get_pull_requests", 
              "get_commits",
              "get_releases",
              "get_user",
              "search_users",
              "create_issue",
              "update_issue",
              "close_issue",
              "add_comment_to_issue",
              "create_pull_request",
              "merge_pull_request",
              "close_pull_request",
              "add_reviewer_to_pull_request",
              "add_comment_to_pull_request",
              "get_organization",
              "list_organization_members",
              "search_code",
              "search_issues_advanced",
              "search_pull_requests_advanced",
              "create_webhook",
              "list_webhooks",
              "update_webhook",
              "delete_webhook"
            ]
          },
          // Repository creation/update parameters
          name: {
            type: Type.STRING,
            description: "Repository name (required for create_repository and update_repository actions). Must be unique within the owner's account."
          },
          description: {
            type: Type.STRING,
            description: "Repository description for create_repository and update_repository actions"
          },
          private: {
            type: Type.BOOLEAN,
            description: "Whether the repository should be private (default: false). Used with create_repository and update_repository actions"
          },
          hasIssues: {
            type: Type.BOOLEAN,
            description: "Whether to enable issues for the repository (default: true). Used with create_repository and update_repository actions"
          },
          hasProjects: {
            type: Type.BOOLEAN,
            description: "Whether to enable projects for the repository (default: true). Used with create_repository and update_repository actions"
          },
          hasWiki: {
            type: Type.BOOLEAN,
            description: "Whether to enable wiki for the repository (default: true). Used with create_repository and update_repository actions"
          },
          hasDownloads: {
            type: Type.BOOLEAN,
            description: "Whether to enable downloads for the repository (default: true). Used with create_repository and update_repository actions"
          },
          allowSquashMerge: {
            type: Type.BOOLEAN,
            description: "Whether to allow squash merges (default: true). Used with create_repository and update_repository actions"
          },
          allowMergeCommit: {
            type: Type.BOOLEAN,
            description: "Whether to allow merge commits (default: true). Used with create_repository and update_repository actions"
          },
          allowRebaseMerge: {
            type: Type.BOOLEAN,
            description: "Whether to allow rebase merges (default: true). Used with create_repository and update_repository actions"
          },
          autoInit: {
            type: Type.BOOLEAN,
            description: "Whether to create an initial commit with empty README (default: false). Used with create_repository action"
          },
          gitignoreTemplate: {
            type: Type.STRING,
            description: "Desired language or platform .gitignore template to apply (e.g., 'Node', 'Python', 'Java'). Used with create_repository action"
          },
          licenseTemplate: {
            type: Type.STRING,
            description: "Choose an open source license template (e.g., 'mit', 'apache-2.0', 'gpl-3.0'). Used with create_repository action"
          },
          // File operations parameters
          content: {
            type: Type.STRING,
            description: "File content as a string. For create_file and update_file actions. Will be automatically base64 encoded."
          },
          message: {
            type: Type.STRING,
            description: "Commit message for file operations (create_file, update_file, delete_file). Required for file operations."
          },
          branch: {
            type: Type.STRING,
            description: "Branch to commit to (default: repository's default branch). Used with file operations."
          },
          committerName: {
            type: Type.STRING,
            description: "The name of the committer for file operations (defaults to authenticated user)"
          },
          committerEmail: {
            type: Type.STRING,
            description: "The email of the committer for file operations (defaults to authenticated user's email)"
          },
          authorName: {
            type: Type.STRING,
            description: "The name of the author for file operations (defaults to committer name)"
          },
          authorEmail: {
            type: Type.STRING,
            description: "The email of the author for file operations (defaults to committer email)"
          },
          query: {
            type: Type.STRING,
            description: "Search query for repositories or users. For repositories: can include keywords, programming languages, topics, or advanced search syntax like 'language:python stars:>1000'. For users: can include usernames, real names, email domains, or advanced syntax like 'location:\"San Francisco\" language:python'"
          },
          sort: {
            type: Type.STRING,
            description: "Sort results by: For repositories: 'stars', 'forks', 'help-wanted-issues', 'updated'. For users: 'followers', 'repositories', 'joined'. For issues/PRs: 'created', 'updated', 'comments'. For commits: 'author-date', 'committer-date' (default varies by action)"
          },
          order: {
            type: Type.STRING,
            description: "Sort order: 'desc' for descending or 'asc' for ascending (default: desc)"
          },
          perPage: {
            type: Type.NUMBER,
            description: "Number of results to return (default: 30, max: 100)"
          },
          language: {
            type: Type.STRING,
            description: "Filter repositories by programming language (e.g., 'javascript', 'python', 'go')"
          },
          // Repository identification
          owner: {
            type: Type.STRING,
            description: "Repository owner username or organization name (required for repository-specific actions)"
          },
          repo: {
            type: Type.STRING,
            description: "Repository name (required for repository-specific actions)"
          },
          username: {
            type: Type.STRING,
            description: "GitHub username or organization name to lookup (required for user actions)"
          },
          // File/content parameters
          path: {
            type: Type.STRING,
            description: "Path to specific file or directory. Leave empty for root directory. Used with get_contents and get_file actions"
          },
          ref: {
            type: Type.STRING,
            description: "Git reference (branch, tag, or commit SHA) to browse or get file from (default: default branch)"
          },
          decode: {
            type: Type.BOOLEAN,
            description: "Whether to decode base64 content to readable text for get_file action (default: true)"
          },
          recursive: {
            type: Type.BOOLEAN,
            description: "Whether to recursively list all files in subdirectories for get_contents action (default: false)"
          },
          // Repository info options
          includeReadme: {
            type: Type.BOOLEAN,
            description: "Whether to include the repository's README content for get_repository action (default: true)"
          },
          includeLanguages: {
            type: Type.BOOLEAN,
            description: "Whether to include programming language statistics for get_repository action (default: true)"
          },
          includeContributors: {
            type: Type.BOOLEAN,
            description: "Whether to include top contributors information for get_repository action (default: true)"
          },
          // Issues/PR parameters
          state: {
            type: Type.STRING,
            description: "Filter by state: 'open' for active items, 'closed' for resolved items, 'all' for both (default: open). Used with get_issues and get_pull_requests"
          },
          labels: {
            type: Type.STRING,
            description: "Filter issues by labels (comma-separated list, e.g., 'bug,enhancement'). Used with get_issues action"
          },
          direction: {
            type: Type.STRING,
            description: "Sort direction: 'asc' or 'desc' (default: desc). Used with get_issues, get_pull_requests, get_commits"
          },
          // PR-specific parameters  
          head: {
            type: Type.STRING,
            description: "Filter pull requests by head branch (format: user:ref-name or organization:ref-name). Used with get_pull_requests"
          },
          base: {
            type: Type.STRING,
            description: "Filter pull requests by base branch (default: repository's default branch). Used with get_pull_requests"
          },
          // User parameters
          includeRepositories: {
            type: Type.BOOLEAN,
            description: "Whether to include user's public repositories for get_user action (default: true)"
          },
          includeOrganizations: {
            type: Type.BOOLEAN,
            description: "Whether to include user's organization memberships for get_user action (default: true)"
          },
          repoSort: {
            type: Type.STRING,
            description: "Sort user repositories by: 'created', 'updated', 'pushed', 'full_name' for get_user action (default: updated)"
          },
          repoType: {
            type: Type.STRING,
            description: "Repository type filter for get_user: 'all', 'owner', 'member' (default: owner)"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    switch (args.action) {
      case "get_authenticated_user":
        return this.executeGetAuthenticatedUser(args);
      case "create_repository":
        return this.executeCreateRepository(args);
      case "update_repository":
        return this.executeUpdateRepository(args);
      case "create_file":
        return this.executeCreateFile(args);
      case "update_file":
        return this.executeUpdateFile(args);
      case "delete_file":
        return this.executeDeleteFile(args);
      case "search_repositories":
        return this.executeSearchRepositories(args);
      case "get_repository":
        return this.executeGetRepository(args);
      case "get_contents":
        return this.executeGetContents(args);
      case "get_file":
        return this.executeGetFile(args);
      case "get_issues":
        return this.executeGetIssues(args);
      case "get_pull_requests":
        return this.executeGetPullRequests(args);
      case "get_commits":
        return this.executeGetCommits(args);
      case "get_releases":
        return this.executeGetReleases(args);
      case "get_user":
        return this.executeGetUser(args);
      case "search_users":
        return this.executeSearchUsers(args);
      case "create_issue":
        return this.executeCreateIssue(args);
      case "update_issue":
        return this.executeUpdateIssue(args);
      case "close_issue":
        return this.executeCloseIssue(args);
      case "add_comment_to_issue":
        return this.executeAddCommentToIssue(args);
      case "create_pull_request":
        return this.executeCreatePullRequest(args);
      case "merge_pull_request":
        return this.executeMergePullRequest(args);
      case "close_pull_request":
        return this.executeClosePullRequest(args);
      case "add_reviewer_to_pull_request":
        return this.executeAddReviewerToPullRequest(args);
      case "add_comment_to_pull_request":
        return this.executeAddCommentToPullRequest(args);
      case "get_organization":
        return this.executeGetOrganization(args);
      case "list_organization_members":
        return this.executeListOrganizationMembers(args);
      case "search_code":
        return this.executeSearchCode(args);
      case "search_issues_advanced":
        return this.executeSearchIssuesAdvanced(args);
      case "search_pull_requests_advanced":
        return this.executeSearchPullRequestsAdvanced(args);
      case "create_webhook":
        return this.executeCreateWebhook(args);
      case "list_webhooks":
        return this.executeListWebhooks(args);
      case "update_webhook":
        return this.executeUpdateWebhook(args);
      case "delete_webhook":
        return this.executeDeleteWebhook(args);
      default:
        return {
          success: false,
          error: `Unknown action: ${args.action}. Available actions: get_authenticated_user, create_repository, update_repository, create_file, update_file, delete_file, search_repositories, get_repository, get_contents, get_file, get_issues, get_pull_requests, get_commits, get_releases, get_user, search_users, create_issue, update_issue, close_issue, add_comment_to_issue, create_pull_request, merge_pull_request, close_pull_request, add_reviewer_to_pull_request, add_comment_to_pull_request, get_organization, list_organization_members, search_code, search_issues_advanced, search_pull_requests_advanced, create_webhook, list_webhooks, update_webhook, delete_webhook`
        };
    }
  }

  private async executeGetAuthenticatedUser(args: any): Promise<any> {
    try {
      console.log(`👤 Getting authenticated user information`);
      
      const response = await this.octokit.rest.users.getAuthenticated();
      const user = response.data;

      return {
        success: true,
        action: "get_authenticated_user",
        login: user.login,
        name: user.name,
        email: user.email,
        bio: user.bio,
        company: user.company,
        location: user.location,
        blog: user.blog,
        twitterUsername: user.twitter_username,
        publicRepos: user.public_repos,
        publicGists: user.public_gists,
        followers: user.followers,
        following: user.following,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        avatarUrl: user.avatar_url,
        profileUrl: user.html_url,
        type: user.type,
        siteAdmin: user.site_admin,
        retrievedAt: new Date().toISOString()
      };

    } catch (error: unknown) {
      console.error("❌ Get authenticated user failed:", error);
      return {
        success: false,
        action: "get_authenticated_user",
        error: `Get authenticated user failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async executeCreateRepository(args: any): Promise<any> {
    try {
      if (!args.name) {
        return { success: false, error: "Name parameter is required for create_repository action" };
      }

      console.log(`🔨 Creating repository: ${args.name}`);
      
      const createParams: any = {
        name: args.name,
        description: args.description || '',
        private: args.private || false,
        has_issues: args.hasIssues !== false,
        has_projects: args.hasProjects !== false,
        has_wiki: args.hasWiki !== false,
        has_downloads: args.hasDownloads !== false,
        allow_squash_merge: args.allowSquashMerge !== false,
        allow_merge_commit: args.allowMergeCommit !== false,
        allow_rebase_merge: args.allowRebaseMerge !== false,
        auto_init: args.autoInit || false
      };

      if (args.gitignoreTemplate) {
        createParams.gitignore_template = args.gitignoreTemplate;
      }

      if (args.licenseTemplate) {
        createParams.license_template = args.licenseTemplate;
      }

      const response = await this.octokit.rest.repos.createForAuthenticatedUser(createParams);
      const repo = response.data;

      return {
        success: true,
        action: "create_repository",
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        description: repo.description,
        url: repo.html_url,
        cloneUrl: repo.clone_url,
        sshUrl: repo.ssh_url,
        private: repo.private,
        createdAt: repo.created_at,
        defaultBranch: repo.default_branch,
        hasIssues: repo.has_issues,
        hasProjects: repo.has_projects,
        hasWiki: repo.has_wiki,
        hasDownloads: repo.has_downloads,
        allowSquashMerge: repo.allow_squash_merge,
        allowMergeCommit: repo.allow_merge_commit,
        allowRebaseMerge: repo.allow_rebase_merge
      };

    } catch (error: unknown) {
      console.error("❌ Create repository failed:", error);
      return {
        success: false,
        action: "create_repository",
        error: `Create repository failed: ${error instanceof Error ? error.message : String(error)}`,
        name: args.name
      };
    }
  }

  private async executeUpdateRepository(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo) {
        return { success: false, error: "Owner and repo parameters are required for update_repository action" };
      }

      console.log(`🔧 Updating repository: ${args.owner}/${args.repo}`);
      
      const updateParams: any = {
        owner: args.owner,
        repo: args.repo
      };

      // Only include parameters that are provided
      if (args.name) updateParams.name = args.name;
      if (args.description !== undefined) updateParams.description = args.description;
      if (args.private !== undefined) updateParams.private = args.private;
      if (args.hasIssues !== undefined) updateParams.has_issues = args.hasIssues;
      if (args.hasProjects !== undefined) updateParams.has_projects = args.hasProjects;
      if (args.hasWiki !== undefined) updateParams.has_wiki = args.hasWiki;
      if (args.hasDownloads !== undefined) updateParams.has_downloads = args.hasDownloads;
      if (args.allowSquashMerge !== undefined) updateParams.allow_squash_merge = args.allowSquashMerge;
      if (args.allowMergeCommit !== undefined) updateParams.allow_merge_commit = args.allowMergeCommit;
      if (args.allowRebaseMerge !== undefined) updateParams.allow_rebase_merge = args.allowRebaseMerge;

      const response = await this.octokit.rest.repos.update(updateParams);
      const repo = response.data;

      return {
        success: true,
        action: "update_repository",
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        description: repo.description,
        url: repo.html_url,
        private: repo.private,
        updatedAt: repo.updated_at,
        hasIssues: repo.has_issues,
        hasProjects: repo.has_projects,
        hasWiki: repo.has_wiki,
        hasDownloads: repo.has_downloads,
        allowSquashMerge: repo.allow_squash_merge,
        allowMergeCommit: repo.allow_merge_commit,
        allowRebaseMerge: repo.allow_rebase_merge
      };

    } catch (error: unknown) {
      console.error("❌ Update repository failed:", error);
      return {
        success: false,
        action: "update_repository",
        error: `Update repository failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo
      };
    }
  }

  private async executeCreateFile(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo || !args.path || !args.content || !args.message) {
        return { 
          success: false, 
          error: "Owner, repo, path, content, and message parameters are required for create_file action" 
        };
      }

      console.log(`📝 Creating file: ${args.owner}/${args.repo}/${args.path}`);
      
      const createParams: any = {
        owner: args.owner,
        repo: args.repo,
        path: args.path,
        message: args.message,
        content: Buffer.from(args.content, 'utf8').toString('base64')
      };

      if (args.branch) {
        createParams.branch = args.branch;
      }

      // Add committer info if provided
      if (args.committerName || args.committerEmail) {
        createParams.committer = {};
        if (args.committerName) createParams.committer.name = args.committerName;
        if (args.committerEmail) createParams.committer.email = args.committerEmail;
      }

      // Add author info if provided
      if (args.authorName || args.authorEmail) {
        createParams.author = {};
        if (args.authorName) createParams.author.name = args.authorName;
        if (args.authorEmail) createParams.author.email = args.authorEmail;
      }

      const response = await this.octokit.rest.repos.createOrUpdateFileContents(createParams);

      return {
        success: true,
        action: "create_file",
        owner: args.owner,
        repo: args.repo,
        path: args.path,
        sha: response.data.content?.sha || '',
        message: args.message,
        branch: args.branch || 'default',
        url: response.data.content?.html_url || '',
        downloadUrl: response.data.content?.download_url || '',
        commitSha: response.data.commit.sha,
        commitUrl: response.data.commit.html_url,
        createdAt: new Date().toISOString()
      };

    } catch (error: unknown) {
      console.error("❌ Create file failed:", error);
      return {
        success: false,
        action: "create_file",
        error: `Create file failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo,
        path: args.path
      };
    }
  }

  private async executeUpdateFile(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo || !args.path || !args.content || !args.message || !args.sha) {
        return { 
          success: false, 
          error: "Owner, repo, path, content, message, and sha parameters are required for update_file action" 
        };
      }

      console.log(`📝 Updating file: ${args.owner}/${args.repo}/${args.path}`);
      
      const updateParams: any = {
        owner: args.owner,
        repo: args.repo,
        path: args.path,
        message: args.message,
        content: Buffer.from(args.content, 'utf8').toString('base64'),
        sha: args.sha
      };

      if (args.branch) {
        updateParams.branch = args.branch;
      }

      // Add committer info if provided
      if (args.committerName || args.committerEmail) {
        updateParams.committer = {};
        if (args.committerName) updateParams.committer.name = args.committerName;
        if (args.committerEmail) updateParams.committer.email = args.committerEmail;
      }

      // Add author info if provided
      if (args.authorName || args.authorEmail) {
        updateParams.author = {};
        if (args.authorName) updateParams.author.name = args.authorName;
        if (args.authorEmail) updateParams.author.email = args.authorEmail;
      }

      const response = await this.octokit.rest.repos.createOrUpdateFileContents(updateParams);

      return {
        success: true,
        action: "update_file",
        owner: args.owner,
        repo: args.repo,
        path: args.path,
        sha: response.data.content?.sha || '',
        message: args.message,
        branch: args.branch || 'default',
        url: response.data.content?.html_url || '',
        downloadUrl: response.data.content?.download_url || '',
        commitSha: response.data.commit.sha,
        commitUrl: response.data.commit.html_url,
        updatedAt: new Date().toISOString()
      };

    } catch (error: unknown) {
      console.error("❌ Update file failed:", error);
      return {
        success: false,
        action: "update_file",
        error: `Update file failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo,
        path: args.path
      };
    }
  }

  private async executeDeleteFile(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo || !args.path || !args.message || !args.sha) {
        return { 
          success: false, 
          error: "Owner, repo, path, message, and sha parameters are required for delete_file action" 
        };
      }

      console.log(`🗑️ Deleting file: ${args.owner}/${args.repo}/${args.path}`);
      
      const deleteParams: any = {
        owner: args.owner,
        repo: args.repo,
        path: args.path,
        message: args.message,
        sha: args.sha
      };

      if (args.branch) {
        deleteParams.branch = args.branch;
      }

      // Add committer info if provided
      if (args.committerName || args.committerEmail) {
        deleteParams.committer = {};
        if (args.committerName) deleteParams.committer.name = args.committerName;
        if (args.committerEmail) deleteParams.committer.email = args.committerEmail;
      }

      // Add author info if provided
      if (args.authorName || args.authorEmail) {
        deleteParams.author = {};
        if (args.authorName) deleteParams.author.name = args.authorName;
        if (args.authorEmail) deleteParams.author.email = args.authorEmail;
      }

      const response = await this.octokit.rest.repos.deleteFile(deleteParams);

      return {
        success: true,
        action: "delete_file",
        owner: args.owner,
        repo: args.repo,
        path: args.path,
        message: args.message,
        branch: args.branch || 'default',
        commitSha: response.data.commit.sha,
        commitUrl: response.data.commit.html_url,
        deletedAt: new Date().toISOString()
      };

    } catch (error: unknown) {
      console.error("❌ Delete file failed:", error);
      return {
        success: false,
        action: "delete_file",
        error: `Delete file failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo,
        path: args.path
      };
    }
  }

  private async executeSearchRepositories(args: any): Promise<any> {
    try {
      if (!args.query) {
        return { success: false, error: "Query parameter is required for search_repositories action" };
      }

      console.log(`🔍 Searching repositories: "${args.query}"`);
      
      const searchParams: any = {
        q: args.query,
        sort: args.sort || "stars",
        order: args.order || "desc",
        per_page: Math.min(args.perPage || 10, 100)
      };

      if (args.language) {
        searchParams.q += ` language:${args.language}`;
      }

      const response = await this.octokit.rest.search.repos(searchParams);

      const processedResults = response.data.items.map((repo: any) => ({
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        language: repo.language,
        topics: repo.topics || [],
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        license: repo.license?.name || null,
        isPrivate: repo.private,
        hasIssues: repo.has_issues,
        hasWiki: repo.has_wiki,
        hasPages: repo.has_pages
      }));

      return {
        success: true,
        action: "search_repositories",
        query: args.query,
        totalCount: response.data.total_count,
        results: processedResults,
        searchTime: new Date().toISOString()
      };

    } catch (error: unknown) {
      console.error("❌ Repository search failed:", error);
      return {
        success: false,
        action: "search_repositories",
        error: `Repository search failed: ${error instanceof Error ? error.message : String(error)}`,
        query: args.query
      };
    }
  }

  private async executeGetRepository(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo) {
        return { success: false, error: "Owner and repo parameters are required for get_repository action" };
      }

      console.log(`📁 Getting repository: ${args.owner}/${args.repo}`);
      
      // Get repository info
      const repoResponse = await this.octokit.rest.repos.get({
        owner: args.owner,
        repo: args.repo
      });

      const repo = repoResponse.data;
      let result: any = {
        success: true,
        action: "get_repository",
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        description: repo.description,
        url: repo.html_url,
        cloneUrl: repo.clone_url,
        sshUrl: repo.ssh_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        openIssues: repo.open_issues_count,
        language: repo.language,
        topics: repo.topics || [],
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        pushedAt: repo.pushed_at,
        size: repo.size,
        defaultBranch: repo.default_branch,
        license: repo.license?.name || null,
        isPrivate: repo.private,
        isFork: repo.fork,
        hasIssues: repo.has_issues,
        hasProjects: repo.has_projects,
        hasWiki: repo.has_wiki,
        hasPages: repo.has_pages,
        hasDownloads: repo.has_downloads,
        archived: repo.archived,
        disabled: repo.disabled
      };

      // Get README if requested
      if (args.includeReadme !== false) {
        try {
          const readmeResponse = await this.octokit.rest.repos.getReadme({
            owner: args.owner,
            repo: args.repo
          });
          result.readme = {
            content: Buffer.from(readmeResponse.data.content, 'base64').toString('utf8'),
            name: readmeResponse.data.name,
            path: readmeResponse.data.path
          };
        } catch {
          result.readme = null;
        }
      }

      // Get languages if requested
      if (args.includeLanguages !== false) {
        try {
          const languagesResponse = await this.octokit.rest.repos.listLanguages({
            owner: args.owner,
            repo: args.repo
          });
          result.languages = languagesResponse.data;
        } catch {
          result.languages = {};
        }
      }

      // Get contributors if requested
      if (args.includeContributors !== false) {
        try {
          const contributorsResponse = await this.octokit.rest.repos.listContributors({
            owner: args.owner,
            repo: args.repo,
            per_page: 10
          });
          result.contributors = contributorsResponse.data.map((contributor: any) => ({
            login: contributor.login,
            contributions: contributor.contributions,
            avatarUrl: contributor.avatar_url,
            profileUrl: contributor.html_url
          }));
        } catch {
          result.contributors = [];
        }
      }

      result.retrievedAt = new Date().toISOString();
      return result;

    } catch (error: unknown) {
      console.error("❌ Get repository failed:", error);
      return {
        success: false,
        action: "get_repository",
        error: `Get repository failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo
      };
    }
  }

  private async executeGetContents(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo) {
        return { success: false, error: "Owner and repo parameters are required for get_contents action" };
      }

      console.log(`📂 Getting contents: ${args.owner}/${args.repo}${args.path ? `/${args.path}` : ''}`);
      
      const params: any = {
        owner: args.owner,
        repo: args.repo,
        path: args.path || ''
      };

      if (args.ref) {
        params.ref = args.ref;
      }

      const response = await this.octokit.rest.repos.getContent(params);
      
      let processedContents;
      
      if (Array.isArray(response.data)) {
        // Directory listing
        processedContents = response.data.map((item: any) => ({
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size,
          sha: item.sha,
          url: item.html_url,
          downloadUrl: item.download_url
        }));
      } else {
        // Single file
        const item = response.data as any;
        processedContents = {
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size,
          sha: item.sha,
          url: item.html_url,
          downloadUrl: item.download_url,
          content: (item.type === 'file' && item.content) ? Buffer.from(item.content, 'base64').toString('utf8') : null
        };
      }

      return {
        success: true,
        action: "get_contents",
        owner: args.owner,
        repo: args.repo,
        path: args.path || '',
        ref: args.ref || 'default',
        contents: processedContents,
        isDirectory: Array.isArray(response.data),
        retrievedAt: new Date().toISOString()
      };

    } catch (error: unknown) {
      console.error("❌ Get contents failed:", error);
      return {
        success: false,
        action: "get_contents",
        error: `Get contents failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo,
        path: args.path || ''
      };
    }
  }

  private async executeGetFile(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo || !args.path) {
        return { success: false, error: "Owner, repo, and path parameters are required for get_file action" };
      }

      console.log(`📄 Getting file: ${args.owner}/${args.repo}/${args.path}`);
      
      const params: any = {
        owner: args.owner,
        repo: args.repo,
        path: args.path
      };

      if (args.ref) {
        params.ref = args.ref;
      }

      const response = await this.octokit.rest.repos.getContent(params);
      const file = response.data as any;

      let content = null;
      if (file.type === 'file' && file.content && args.decode !== false) {
        content = Buffer.from(file.content, 'base64').toString('utf8');
      }

      return {
        success: true,
        action: "get_file",
        owner: args.owner,
        repo: args.repo,
        path: args.path,
        name: file.name,
        size: file.size,
        sha: file.sha,
        url: file.html_url,
        downloadUrl: file.download_url,
        content: content,
        encoding: file.encoding,
        ref: args.ref || 'default',
        retrievedAt: new Date().toISOString()
      };

    } catch (error: unknown) {
      console.error("❌ Get file failed:", error);
      return {
        success: false,
        action: "get_file",
        error: `Get file failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo,
        path: args.path
      };
    }
  }

  private async executeGetIssues(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo) {
        return { success: false, error: "Owner and repo parameters are required for get_issues action" };
      }

      console.log(`🐛 Getting issues: ${args.owner}/${args.repo}`);
      
      const params: any = {
        owner: args.owner,
        repo: args.repo,
        state: args.state || 'open',
        sort: args.sort || 'created',
        direction: args.direction || 'desc',
        per_page: Math.min(args.perPage || 30, 100)
      };

      if (args.labels) {
        params.labels = args.labels;
      }

      const response = await this.octokit.rest.issues.listForRepo(params);

      const processedIssues = response.data.map((issue: any) => ({
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        user: issue.user.login,
        assignees: issue.assignees?.map((a: any) => a.login) || [],
        labels: issue.labels?.map((l: any) => l.name) || [],
        comments: issue.comments,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        closedAt: issue.closed_at,
        url: issue.html_url,
        isPullRequest: !!issue.pull_request
      }));

      return {
        success: true,
        action: "get_issues",
        owner: args.owner,
        repo: args.repo,
        state: args.state || 'open',
        issues: processedIssues,
        totalCount: processedIssues.length,
        retrievedAt: new Date().toISOString()
      };

    } catch (error: unknown) {
      console.error("❌ Get issues failed:", error);
      return {
        success: false,
        action: "get_issues",
        error: `Get issues failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo
      };
    }
  }

  private async executeGetPullRequests(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo) {
        return { success: false, error: "Owner and repo parameters are required for get_pull_requests action" };
      }

      console.log(`🔀 Getting pull requests: ${args.owner}/${args.repo}`);
      
      const params: any = {
        owner: args.owner,
        repo: args.repo,
        state: args.state || 'open',
        sort: args.sort || 'created',
        direction: args.direction || 'desc',
        per_page: Math.min(args.perPage || 30, 100)
      };

      if (args.head) {
        params.head = args.head;
      }
      if (args.base) {
        params.base = args.base;
      }

      const response = await this.octokit.rest.pulls.list(params);

      const processedPRs = response.data.map((pr: any) => ({
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        user: pr.user.login,
        assignees: pr.assignees?.map((a: any) => a.login) || [],
        requestedReviewers: pr.requested_reviewers?.map((r: any) => r.login) || [],
        labels: pr.labels?.map((l: any) => l.name) || [],
        head: {
          ref: pr.head.ref,
          sha: pr.head.sha,
          repo: pr.head.repo?.full_name
        },
        base: {
          ref: pr.base.ref,
          sha: pr.base.sha,
          repo: pr.base.repo.full_name
        },
        merged: pr.merged,
        mergeable: pr.mergeable,
        comments: pr.comments,
        reviewComments: pr.review_comments,
        commits: pr.commits,
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changed_files,
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        closedAt: pr.closed_at,
        mergedAt: pr.merged_at,
        url: pr.html_url
      }));

      return {
        success: true,
        action: "get_pull_requests",
        owner: args.owner,
        repo: args.repo,
        state: args.state || 'open',
        pullRequests: processedPRs,
        totalCount: processedPRs.length,
        retrievedAt: new Date().toISOString()
      };

    } catch (error: unknown) {
      console.error("❌ Get pull requests failed:", error);
      return {
        success: false,
        action: "get_pull_requests",
        error: `Get pull requests failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo
      };
    }
  }

  private async executeGetCommits(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo) {
        return { success: false, error: "Owner and repo parameters are required for get_commits action" };
      }

      console.log(`📝 Getting commits: ${args.owner}/${args.repo}`);
      
      const params: any = {
        owner: args.owner,
        repo: args.repo,
        per_page: Math.min(args.perPage || 30, 100)
      };

      if (args.sha) params.sha = args.sha;
      if (args.path) params.path = args.path;
      if (args.author) params.author = args.author;
      if (args.since) params.since = args.since;
      if (args.until) params.until = args.until;

      const response = await this.octokit.rest.repos.listCommits(params);

      const processedCommits = response.data.map((commit: any) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date,
          username: commit.author?.login
        },
        committer: {
          name: commit.commit.committer.name,
          email: commit.commit.committer.email,
          date: commit.commit.committer.date,
          username: commit.committer?.login
        },
        url: commit.html_url,
        commentCount: commit.commit.comment_count,
        verification: commit.commit.verification
      }));

      return {
        success: true,
        action: "get_commits",
        owner: args.owner,
        repo: args.repo,
        commits: processedCommits,
        totalCount: processedCommits.length,
        filters: {
          sha: args.sha,
          path: args.path,
          author: args.author,
          since: args.since,
          until: args.until
        },
        retrievedAt: new Date().toISOString()
      };

    } catch (error: unknown) {
      console.error("❌ Get commits failed:", error);
      return {
        success: false,
        action: "get_commits",
        error: `Get commits failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo
      };
    }
  }

  private async executeGetReleases(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo) {
        return { success: false, error: "Owner and repo parameters are required for get_releases action" };
      }

      console.log(`🚀 Getting releases: ${args.owner}/${args.repo}`);
      
      const params: any = {
        owner: args.owner,
        repo: args.repo,
        per_page: Math.min(args.perPage || 30, 100)
      };

      const response = await this.octokit.rest.repos.listReleases(params);

      let processedReleases = response.data.map((release: any) => ({
        id: release.id,
        name: release.name,
        tagName: release.tag_name,
        targetCommitish: release.target_commitish,
        body: release.body,
        draft: release.draft,
        prerelease: release.prerelease,
        author: release.author?.login,
        createdAt: release.created_at,
        publishedAt: release.published_at,
        url: release.html_url,
        tarballUrl: release.tarball_url,
        zipballUrl: release.zipball_url,
        assets: release.assets?.map((asset: any) => ({
          name: asset.name,
          size: asset.size,
          downloadCount: asset.download_count,
          contentType: asset.content_type,
          downloadUrl: asset.browser_download_url,
          createdAt: asset.created_at,
          updatedAt: asset.updated_at
        })) || []
      }));

      // Filter based on preferences
      if (args.includePrereleases === false) {
        processedReleases = processedReleases.filter(release => !release.prerelease);
      }

      if (args.includeDrafts === false) {
        processedReleases = processedReleases.filter(release => !release.draft);
      }

      return {
        success: true,
        action: "get_releases",
        owner: args.owner,
        repo: args.repo,
        releases: processedReleases,
        totalCount: processedReleases.length,
        filters: {
          includePrereleases: args.includePrereleases !== false,
          includeDrafts: args.includeDrafts === true
        },
        retrievedAt: new Date().toISOString()
      };

    } catch (error: unknown) {
      console.error("❌ Get releases failed:", error);
      return {
        success: false,
        action: "get_releases",
        error: `Get releases failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo
      };
    }
  }

  private async executeGetUser(args: any): Promise<any> {
    try {
      if (!args.username) {
        return { success: false, error: "Username parameter is required for get_user action" };
      }

      console.log(`👤 Getting user: ${args.username}`);
      
      // Get user info
      const userResponse = await this.octokit.rest.users.getByUsername({
        username: args.username
      });

      const user = userResponse.data;
      let result: any = {
        success: true,
        action: "get_user",
        login: user.login,
        name: user.name,
        bio: user.bio,
        company: user.company,
        location: user.location,
        email: user.email,
        blog: user.blog,
        twitterUsername: user.twitter_username,
        publicRepos: user.public_repos,
        publicGists: user.public_gists,
        followers: user.followers,
        following: user.following,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        avatarUrl: user.avatar_url,
        profileUrl: user.html_url,
        type: user.type,
        siteAdmin: user.site_admin,
        hireable: user.hireable
      };

      // Get repositories if requested
      if (args.includeRepositories !== false) {
        try {
          const reposResponse = await this.octokit.rest.repos.listForUser({
            username: args.username,
            type: args.repoType || 'owner',
            sort: args.repoSort || 'updated',
            per_page: 30
          });

          result.repositories = reposResponse.data.map((repo: any) => ({
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            url: repo.html_url,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language,
            topics: repo.topics || [],
            createdAt: repo.created_at,
            updatedAt: repo.updated_at,
            isPrivate: repo.private,
            isFork: repo.fork
          }));
        } catch {
          result.repositories = [];
        }
      }

      // Get organizations if requested
      if (args.includeOrganizations !== false) {
        try {
          const orgsResponse = await this.octokit.rest.orgs.listForUser({
            username: args.username,
            per_page: 30
          });

          result.organizations = orgsResponse.data.map((org: any) => ({
            login: org.login,
            name: org.name,
            description: org.description,
            url: org.html_url,
            avatarUrl: org.avatar_url
          }));
        } catch {
          result.organizations = [];
        }
      }

      result.retrievedAt = new Date().toISOString();
      return result;

    } catch (error: unknown) {
      console.error("❌ Get user failed:", error);
      return {
        success: false,
        action: "get_user",
        error: `Get user failed: ${error instanceof Error ? error.message : String(error)}`,
        username: args.username
      };
    }
  }

  private async executeSearchUsers(args: any): Promise<any> {
    try {
      if (!args.query) {
        return { success: false, error: "Query parameter is required for search_users action" };
      }

      console.log(`🔍 Searching users: "${args.query}"`);
      
      const searchParams: any = {
        q: args.query,
        per_page: Math.min(args.perPage || 30, 100)
      };

      if (args.sort) {
        searchParams.sort = args.sort;
        searchParams.order = args.order || 'desc';
      }

      const response = await this.octokit.rest.search.users(searchParams);

      const processedResults = response.data.items.map((user: any) => ({
        login: user.login,
        name: user.name,
        bio: user.bio,
        company: user.company,
        location: user.location,
        email: user.email,
        blog: user.blog,
        publicRepos: user.public_repos,
        publicGists: user.public_gists,
        followers: user.followers,
        following: user.following,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        avatarUrl: user.avatar_url,
        profileUrl: user.html_url,
        type: user.type,
        score: user.score
      }));

      return {
        success: true,
        action: "search_users",
        query: args.query,
        totalCount: response.data.total_count,
        results: processedResults,
        searchTime: new Date().toISOString()
      };

    } catch (error: unknown) {
      console.error("❌ User search failed:", error);
      return {
        success: false,
        action: "search_users",
        error: `User search failed: ${error instanceof Error ? error.message : String(error)}`,
        query: args.query
      };
    }
  }

  // Convenience methods for direct access
  async getAuthenticatedUser(): Promise<any> {
    return this.execute({ action: "get_authenticated_user" });
  }

  async createRepository(name: string, options: any = {}): Promise<any> {
    return this.execute({ action: "create_repository", name, ...options });
  }

  async updateRepository(owner: string, repo: string, options: any = {}): Promise<any> {
    return this.execute({ action: "update_repository", owner, repo, ...options });
  }

  async createFile(owner: string, repo: string, path: string, content: string, message: string, options: any = {}): Promise<any> {
    return this.execute({ action: "create_file", owner, repo, path, content, message, ...options });
  }

  async updateFile(owner: string, repo: string, path: string, content: string, message: string, sha: string, options: any = {}): Promise<any> {
    return this.execute({ action: "update_file", owner, repo, path, content, message, sha, ...options });
  }

  async deleteFile(owner: string, repo: string, path: string, message: string, sha: string, options: any = {}): Promise<any> {
    return this.execute({ action: "delete_file", owner, repo, path, message, sha, ...options });
  }

  async searchRepositories(query: string, options: any = {}): Promise<any> {
    return this.execute({ action: "search_repositories", query, ...options });
  }

  async getRepository(owner: string, repo: string, options: any = {}): Promise<any> {
    return this.execute({ action: "get_repository", owner, repo, ...options });
  }

  async getContents(owner: string, repo: string, path: string = '', options: any = {}): Promise<any> {
    return this.execute({ action: "get_contents", owner, repo, path, ...options });
  }

  async getFile(owner: string, repo: string, path: string, options: any = {}): Promise<any> {
    return this.execute({ action: "get_file", owner, repo, path, ...options });
  }

  async getIssues(owner: string, repo: string, options: any = {}): Promise<any> {
    return this.execute({ action: "get_issues", owner, repo, ...options });
  }

  async getPullRequests(owner: string, repo: string, options: any = {}): Promise<any> {
    return this.execute({ action: "get_pull_requests", owner, repo, ...options });
  }

  async getCommits(owner: string, repo: string, options: any = {}): Promise<any> {
    return this.execute({ action: "get_commits", owner, repo, ...options });
  }

  async getReleases(owner: string, repo: string, options: any = {}): Promise<any> {
    return this.execute({ action: "get_releases", owner, repo, ...options });
  }

  async getUser(username: string, options: any = {}): Promise<any> {
    return this.execute({ action: "get_user", username, ...options });
  }

  async searchUsers(query: string, options: any = {}): Promise<any> {
    return this.execute({ action: "search_users", query, ...options });
  }

  private async executeCreateIssue(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo || !args.title || !args.body) {
        return { success: false, error: "Owner, repo, title, and body parameters are required for create_issue action" };
      }

      console.log(`🐛 Creating issue: ${args.owner}/${args.repo}`);

      const createParams: any = {
        owner: args.owner,
        repo: args.repo,
        title: args.title,
        body: args.body
      };

      if (args.assignees) {
        createParams.assignees = args.assignees.split(',');
      }

      if (args.labels) {
        createParams.labels = args.labels.split(',');
      }

      const response = await this.octokit.rest.issues.create(createParams);

      return {
        success: true,
        action: "create_issue",
        owner: args.owner,
        repo: args.repo,
        issueNumber: response.data.number,
        url: response.data.html_url,
        createdAt: new Date().toISOString()
      };
    } catch (error: unknown) {
      console.error("❌ Create issue failed:", error);
      return {
        success: false,
        action: "create_issue",
        error: `Create issue failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo
      };
    }
  }

  private async executeUpdateIssue(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo || !args.issueNumber) {
        return { success: false, error: "Owner, repo, and issueNumber parameters are required for update_issue action" };
      }

      console.log(`🐛 Updating issue: ${args.owner}/${args.repo}/${args.issueNumber}`);

      const updateParams: any = {
        owner: args.owner,
        repo: args.repo,
        issue_number: args.issueNumber
      };

      if (args.title) {
        updateParams.title = args.title;
      }

      if (args.body) {
        updateParams.body = args.body;
      }

      if (args.assignees) {
        updateParams.assignees = args.assignees.split(',');
      }

      if (args.issueState) {
        updateParams.state = args.issueState;
      }

      if (args.issueLabels) {
        updateParams.labels = args.issueLabels.split(',');
      }

      const response = await this.octokit.rest.issues.update(updateParams);

      return {
        success: true,
        action: "update_issue",
        owner: args.owner,
        repo: args.repo,
        issueNumber: response.data.number,
        url: response.data.html_url,
        updatedAt: new Date().toISOString()
      };
    } catch (error: unknown) {
      console.error("❌ Update issue failed:", error);
      return {
        success: false,
        action: "update_issue",
        error: `Update issue failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo,
        issueNumber: args.issueNumber
      };
    }
  }

  private async executeCloseIssue(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo || !args.issueNumber) {
        return { success: false, error: "Owner, repo, and issueNumber parameters are required for close_issue action" };
      }

      console.log(`🐛 Closing issue: ${args.owner}/${args.repo}/${args.issueNumber}`);

      const updateParams: any = {
        owner: args.owner,
        repo: args.repo,
        issue_number: args.issueNumber,
        state: 'closed'
      };

      const response = await this.octokit.rest.issues.update(updateParams);

      return {
        success: true,
        action: "close_issue",
        owner: args.owner,
        repo: args.repo,
        issueNumber: response.data.number,
        url: response.data.html_url,
        closedAt: new Date().toISOString()
      };
    } catch (error: unknown) {
      console.error("❌ Close issue failed:", error);
      return {
        success: false,
        action: "close_issue",
        error: `Close issue failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo,
        issueNumber: args.issueNumber
      };
    }
  }

  private async executeAddCommentToIssue(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo || !args.issueNumber || !args.commentBody) {
        return { success: false, error: "Owner, repo, issueNumber, and commentBody parameters are required for add_comment_to_issue action" };
      }

      console.log(`🐛 Adding comment to issue: ${args.owner}/${args.repo}/${args.issueNumber}`);

      const createParams: any = {
        owner: args.owner,
        repo: args.repo,
        issue_number: args.issueNumber,
        body: args.commentBody
      };

      const response = await this.octokit.rest.issues.createComment(createParams);

      return {
        success: true,
        action: "add_comment_to_issue",
        owner: args.owner,
        repo: args.repo,
        issueNumber: args.issueNumber,
        commentId: response.data.id,
        url: response.data.html_url,
        createdAt: new Date().toISOString()
      };
    } catch (error: unknown) {
      console.error("❌ Add comment to issue failed:", error);
      return {
        success: false,
        action: "add_comment_to_issue",
        error: `Add comment to issue failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo,
        issueNumber: args.issueNumber
      };
    }
  }

  private async executeCreatePullRequest(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo || !args.title || !args.head || !args.base) {
        return { success: false, error: "Owner, repo, title, head, and base parameters are required for create_pull_request action" };
      }

      console.log(`🔀 Creating pull request: ${args.owner}/${args.repo}`);

      const createParams: any = {
        owner: args.owner,
        repo: args.repo,
        title: args.title,
        head: args.head,
        base: args.base
      };

      if (args.body) {
        createParams.body = args.body;
      }

      const response = await this.octokit.rest.pulls.create(createParams);

      return {
        success: true,
        action: "create_pull_request",
        owner: args.owner,
        repo: args.repo,
        pullRequestNumber: response.data.number,
        url: response.data.html_url,
        createdAt: new Date().toISOString()
      };
    } catch (error: unknown) {
      console.error("❌ Create pull request failed:", error);
      return {
        success: false,
        action: "create_pull_request",
        error: `Create pull request failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo
      };
    }
  }

  private async executeMergePullRequest(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo || !args.pullRequestNumber) {
        return { success: false, error: "Owner, repo, and pullRequestNumber parameters are required for merge_pull_request action" };
      }

      console.log(`🔀 Merging pull request: ${args.owner}/${args.repo}/${args.pullRequestNumber}`);

      const mergeParams: any = {
        owner: args.owner,
        repo: args.repo,
        pull_number: args.pullRequestNumber
      };

      if (args.commitTitle) {
        mergeParams.commit_title = args.commitTitle;
      }

      if (args.commitMessage) {
        mergeParams.commit_message = args.commitMessage;
      }

      const response = await this.octokit.rest.pulls.merge(mergeParams);

      return {
        success: true,
        action: "merge_pull_request",
        owner: args.owner,
        repo: args.repo,
        pullRequestNumber: args.pullRequestNumber,
        merged: response.data?.merged,
        sha: response.data?.sha,
        message: response.data?.message,
        mergedAt: new Date().toISOString()
      };
    } catch (error: unknown) {
      console.error("❌ Merge pull request failed:", error);
      return {
        success: false,
        action: "merge_pull_request",
        error: `Merge pull request failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo,
        pullRequestNumber: args.pullRequestNumber
      };
    }
  }

  private async executeClosePullRequest(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo || !args.pullRequestNumber) {
        return { success: false, error: "Owner, repo, and pullRequestNumber parameters are required for close_pull_request action" };
      }

      console.log(`🔀 Closing pull request: ${args.owner}/${args.repo}/${args.pullRequestNumber}`);

      const updateParams: any = {
        owner: args.owner,
        repo: args.repo,
        pull_number: args.pullRequestNumber,
        state: 'closed'
      };

      const response = await this.octokit.rest.pulls.update(updateParams);

      return {
        success: true,
        action: "close_pull_request",
        owner: args.owner,
        repo: args.repo,
        pullRequestNumber: response.data.number,
        url: response.data.html_url,
        closedAt: new Date().toISOString()
      };
    } catch (error: unknown) {
      console.error("❌ Close pull request failed:", error);
      return {
        success: false,
        action: "close_pull_request",
        error: `Close pull request failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo,
        pullRequestNumber: args.pullRequestNumber
      };
    }
  }

  private async executeAddReviewerToPullRequest(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo || !args.pullRequestNumber || !args.reviewers) {
        return { success: false, error: "Owner, repo, pullRequestNumber, and reviewers parameters are required for add_reviewer_to_pull_request action" };
      }

      console.log(`🔀 Adding reviewer to pull request: ${args.owner}/${args.repo}/${args.pullRequestNumber}`);

      const createParams: any = {
        owner: args.owner,
        repo: args.repo,
        pull_number: args.pullRequestNumber,
        reviewers: args.reviewers.split(',')
      };

      const response = await this.octokit.rest.pulls.requestReviewers(createParams);

      return {
        success: true,
        action: "add_reviewer_to_pull_request",
        owner: args.owner,
        repo: args.repo,
        pullRequestNumber: args.pullRequestNumber,
        reviewers: response.data.requested_reviewers?.map((r: any) => r.login) || [],
        createdAt: new Date().toISOString()
      };
    } catch (error: unknown) {
      console.error("❌ Add reviewer to pull request failed:", error);
      return {
        success: false,
        action: "add_reviewer_to_pull_request",
        error: `Add reviewer to pull request failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo,
        pullRequestNumber: args.pullRequestNumber
      };
    }
  }

  private async executeAddCommentToPullRequest(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo || !args.pullRequestNumber || !args.commentBody) {
        return { success: false, error: "Owner, repo, pullRequestNumber, and commentBody parameters are required for add_comment_to_pull_request action" };
      }

      console.log(`🔀 Adding comment to pull request: ${args.owner}/${args.repo}/${args.pullRequestNumber}`);

      const createParams: any = {
        owner: args.owner,
        repo: args.repo,
        pull_number: args.pullRequestNumber,
        body: args.commentBody
      };

      const response = await this.octokit.rest.issues.createComment(createParams);

      return {
        success: true,
        action: "add_comment_to_pull_request",
        owner: args.owner,
        repo: args.repo,
        pullRequestNumber: args.pullRequestNumber,
        commentId: response.data.id,
        url: response.data.html_url,
        createdAt: new Date().toISOString()
      };
    } catch (error: unknown) {
      console.error("❌ Add comment to pull request failed:", error);
      return {
        success: false,
        action: "add_comment_to_pull_request",
        error: `Add comment to pull request failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo,
        pullRequestNumber: args.pullRequestNumber
      };
    }
  }

  private async executeGetOrganization(args: any): Promise<any> {
    try {
      if (!args.organization) {
        return { success: false, error: "Organization parameter is required for get_organization action" };
      }

      console.log(`🏢 Getting organization: ${args.organization}`);

      const response = await this.octokit.rest.orgs.get({
        org: args.organization
      });

      const organization = response.data;

      return {
        success: true,
        action: "get_organization",
        login: organization.login,
        name: organization.name,
        description: organization.description,
        url: organization.html_url,
        avatarUrl: organization.avatar_url,
        location: organization.location,
        email: organization.email,
        blog: organization.blog,
        publicRepos: organization.public_repos,
        privateRepos: organization.total_private_repos || 0,
        totalMembers: organization.total_private_repos || 0,
        createdAt: organization.created_at,
        updatedAt: organization.updated_at
      };
    } catch (error: unknown) {
      console.error("❌ Get organization failed:", error);
      return {
        success: false,
        action: "get_organization",
        error: `Get organization failed: ${error instanceof Error ? error.message : String(error)}`,
        organization: args.organization
      };
    }
  }

  private async executeListOrganizationMembers(args: any): Promise<any> {
    try {
      if (!args.organization) {
        return { success: false, error: "Organization parameter is required for list_organization_members action" };
      }

      console.log(`🏢 Listing organization members: ${args.organization}`);

      const params: any = {
        org: args.organization,
        per_page: Math.min(args.perPage || 30, 100)
      };

      const response = await this.octokit.rest.orgs.listMembers(params);

      const members = response.data.map((member: any) => ({
        login: member.login,
        avatarUrl: member.avatar_url,
        url: member.html_url
      }));

      return {
        success: true,
        action: "list_organization_members",
        organization: args.organization,
        members: members,
        totalCount: members.length
      };
    } catch (error: unknown) {
      console.error("❌ List organization members failed:", error);
      return {
        success: false,
        action: "list_organization_members",
        error: `List organization members failed: ${error instanceof Error ? error.message : String(error)}`,
        organization: args.organization
      };
    }
  }

  private async executeSearchCode(args: any): Promise<any> {
    try {
      if (!args.query) {
        return { success: false, error: "Query parameter is required for search_code action" };
      }

      console.log(`🔍 Searching code: ${args.query}`);

      const searchParams: any = {
        q: args.query,
        per_page: Math.min(args.perPage || 30, 100)
      };

      const response = await this.octokit.rest.search.code(searchParams);

      const results = response.data.items.map((item: any) => ({
        name: item.name,
        path: item.path,
        url: item.html_url,
        repository: item.repository.full_name
      }));

      return {
        success: true,
        action: "search_code",
        query: args.query,
        results: results,
        totalCount: response.data.total_count
      };
    } catch (error: unknown) {
      console.error("❌ Search code failed:", error);
      return {
        success: false,
        action: "search_code",
        error: `Search code failed: ${error instanceof Error ? error.message : String(error)}`,
        query: args.query
      };
    }
  }

  private async executeSearchIssuesAdvanced(args: any): Promise<any> {
    try {
      if (!args.query) {
        return { success: false, error: "Query parameter is required for search_issues_advanced action" };
      }

      console.log(`🔍 Searching issues (advanced): ${args.query}`);

      const searchParams: any = {
        q: args.query,
        per_page: Math.min(args.perPage || 30, 100)
      };

      const response = await this.octokit.rest.search.issuesAndPullRequests(searchParams);

      const results = response.data.items.map((item: any) => ({
        number: item.number,
        title: item.title,
        body: item.body,
        url: item.html_url,
        repository: item.repository.full_name
      }));

      return {
        success: true,
        action: "search_issues_advanced",
        query: args.query,
        results: results,
        totalCount: response.data.total_count
      };
    } catch (error: unknown) {
      console.error("❌ Search issues (advanced) failed:", error);
      return {
        success: false,
        action: "search_issues_advanced",
        error: `Search issues (advanced) failed: ${error instanceof Error ? error.message : String(error)}`,
        query: args.query
      };
    }
  }

  private async executeSearchPullRequestsAdvanced(args: any): Promise<any> {
    try {
      if (!args.query) {
        return { success: false, error: "Query parameter is required for search_pull_requests_advanced action" };
      }

      console.log(`🔍 Searching pull requests (advanced): ${args.query}`);

      const searchParams: any = {
        q: args.query,
        per_page: Math.min(args.perPage || 30, 100)
      };

      const response = await this.octokit.rest.search.issuesAndPullRequests(searchParams);

      const results = response.data.items.map((item: any) => ({
        number: item.number,
        title: item.title,
        body: item.body,
        url: item.html_url,
        repository: item.repository.full_name
      }));

      return {
        success: true,
        action: "search_pull_requests_advanced",
        query: args.query,
        results: results,
        totalCount: response.data.total_count
      };
    } catch (error: unknown) {
      console.error("❌ Search pull requests (advanced) failed:", error);
      return {
        success: false,
        action: "search_pull_requests_advanced",
        error: `Search pull requests (advanced) failed: ${error instanceof Error ? error.message : String(error)}`,
        query: args.query
      };
    }
  }

  private async executeCreateWebhook(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo || !args.webhookUrl || !args.webhookEvents || !args.webhookSecret) {
        return { success: false, error: "Owner, repo, webhookUrl, webhookEvents, and webhookSecret parameters are required for create_webhook action" };
      }

      console.log(`📡 Creating webhook: ${args.owner}/${args.repo}`);

      const createParams: any = {
        owner: args.owner,
        repo: args.repo,
        name: 'web',
        config: {
          url: args.webhookUrl,
          content_type: 'json',
          secret: args.webhookSecret
        },
        events: args.webhookEvents.split(','),
        active: true
      };

      const response = await this.octokit.rest.repos.createWebhook(createParams);

      return {
        success: true,
        action: "create_webhook",
        owner: args.owner,
        repo: args.repo,
        webhookId: response.data.id,
        url: response.data.url
      };
    } catch (error: unknown) {
      console.error("❌ Create webhook failed:", error);
      return {
        success: false,
        action: "create_webhook",
        error: `Create webhook failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo
      };
    }
  }

  private async executeListWebhooks(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo) {
        return { success: false, error: "Owner and repo parameters are required for list_webhooks action" };
      }

      console.log(`📡 Listing webhooks: ${args.owner}/${args.repo}`);

      const params: any = {
        owner: args.owner,
        repo: args.repo,
        per_page: Math.min(args.perPage || 30, 100)
      };

      const response = await this.octokit.rest.repos.listWebhooks(params);

      const webhooks = response.data.map((webhook: any) => ({
        id: webhook.id,
        name: webhook.name,
        url: webhook.config.url,
        events: webhook.events
      }));

      return {
        success: true,
        action: "list_webhooks",
        owner: args.owner,
        repo: args.repo,
        webhooks: webhooks,
        totalCount: webhooks.length
      };
    } catch (error: unknown) {
      console.error("❌ List webhooks failed:", error);
      return {
        success: false,
        action: "list_webhooks",
        error: `List webhooks failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo
      };
    }
  }

  private async executeUpdateWebhook(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo || !args.webhookId || !args.webhookUrl || !args.webhookEvents || !args.webhookSecret) {
        return { success: false, error: "Owner, repo, webhookId, webhookUrl, webhookEvents, and webhookSecret parameters are required for update_webhook action" };
      }

      console.log(`📡 Updating webhook: ${args.owner}/${args.repo}/${args.webhookId}`);

      const updateParams: any = {
        owner: args.owner,
        repo: args.repo,
        hook_id: args.webhookId,
        config: {
          url: args.webhookUrl,
          content_type: 'json',
          secret: args.webhookSecret
        },
        events: args.webhookEvents.split(','),
        active: true
      };

      const response = await this.octokit.rest.repos.updateWebhook(updateParams);

      return {
        success: true,
        action: "update_webhook",
        owner: args.owner,
        repo: args.repo,
        webhookId: response.data.id,
        url: response.data.url
      };
    } catch (error: unknown) {
      console.error("❌ Update webhook failed:", error);
      return {
        success: false,
        action: "update_webhook",
        error: `Update webhook failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo
      };
    }
  }

  private async executeDeleteWebhook(args: any): Promise<any> {
    try {
      if (!args.owner || !args.repo || !args.webhookId) {
        return { success: false, error: "Owner, repo, and webhookId parameters are required for delete_webhook action" };
      }

      console.log(`📡 Deleting webhook: ${args.owner}/${args.repo}/${args.webhookId}`);

      const deleteParams: any = {
        owner: args.owner,
        repo: args.repo,
        hook_id: args.webhookId
      };

      await this.octokit.rest.repos.deleteWebhook(deleteParams);

      return {
        success: true,
        action: "delete_webhook",
        owner: args.owner,
        repo: args.repo,
        webhookId: args.webhookId
      };
    } catch (error: unknown) {
      console.error("❌ Delete webhook failed:", error);
      return {
        success: false,
        action: "delete_webhook",
        error: `Delete webhook failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo
      };
    }
  }
}
