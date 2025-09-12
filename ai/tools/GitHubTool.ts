import { FunctionDeclaration, Type } from "@google/genai";
import { Octokit } from "@octokit/rest";
import { getValidOAuthAccessToken } from "@/lib/oauth-refresh";

export interface GitHubConfig {
  token: string;
}

export class GitHubTool {
  private octokit: Octokit;
  private token: string;
  private userId: string;
  private oauthToken: string | null;

  constructor(config: GitHubConfig, userId: string, oauthToken: string | null = null) {
    this.token = config.token;
    this.userId = userId;
    this.oauthToken = oauthToken;
    this.octokit = new Octokit({
      auth: this.token,
    });
  }

  // Single comprehensive GitHub function definition
  getDefinition(): FunctionDeclaration {
    return {
      name: "github_tool",
      description: "Access GitHub's complete development platform through a unified API interface. Manage repositories, track issues and pull requests, analyze code, monitor development activity, and research users and organizations. Handle everything from repository creation and file management to advanced search, collaboration workflows, webhook automation, and code sharing through gists. Perfect for development teams, open source maintainers, code analysis, project management, and automated CI/CD workflows.",
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
              "delete_webhook",
              "create_gist",
              "get_gist",
              "update_gist",
              "delete_gist",
              "list_gists",
              "star_gist",
              "unstar_gist",
              "fork_gist"
            ]
          },
          // Repository creation/update parameters
          name: {
            type: Type.STRING,
            description: "Repository name (required for create_repository and update_repository actions). Must be unique within the owner's account. Use lowercase with hyphens for best compatibility (e.g., 'my-awesome-project', 'data-analysis-tool'). Avoid spaces and special characters."
          },
          description: {
            type: Type.STRING,
            description: "Repository description for create_repository and update_repository actions. Provide a clear, concise summary of your project's purpose. This appears on the repository homepage and in search results. Maximum 350 characters recommended for optimal display."
          },
          private: {
            type: Type.STRING,
            description: "Repository visibility setting. 'true' creates a private repository visible only to you and collaborators. 'false' creates a public repository visible to everyone. Consider privacy needs, licensing requirements, and collaboration scope when choosing."
          },
          hasIssues: {
            type: Type.STRING,
            description: "Enable GitHub Issues for bug tracking and feature requests (default: true). Issues provide a structured way to manage project tasks, bugs, and enhancements. Disable only for repositories that don't need issue tracking."
          },
          hasProjects: {
            type: Type.STRING,
            description: "Enable GitHub Projects for project management (default: true). Projects provide Kanban-style boards for organizing work, tracking progress, and managing workflows. Useful for complex projects with multiple work streams."
          },
          hasWiki: {
            type: Type.STRING,
            description: "Enable GitHub Wiki for documentation (default: true). Wikis provide collaborative documentation editing. Good for extensive documentation needs, but consider README files for simpler projects."
          },
          hasDownloads: {
            type: Type.STRING,
            description: "Enable downloads section for release artifacts (default: true). Allows users to download release files, binaries, and other artifacts. Useful for distributing compiled applications or data files."
          },
          allowSquashMerge: {
            type: Type.STRING,
            description: "Allow squash merging of pull requests (default: true). Combines all commits from a PR into a single commit when merging. Keeps main branch history clean but loses individual commit details."
          },
          allowMergeCommit: {
            type: Type.STRING,
            description: "Allow merge commits for pull requests (default: true). Preserves all commits from a PR when merging. Maintains complete history but can create complex branch structures."
          },
          allowRebaseMerge: {
            type: Type.STRING,
            description: "Allow rebase merging of pull requests (default: true). Replays PR commits on top of main branch. Creates linear history but rewrites commit hashes and timestamps."
          },
          autoInit: {
            type: Type.STRING,
            description: "Create initial commit with README file (default: false). Automatically creates a README.md file with your repository description. Useful for starting with a clean repository structure."
          },
          gitignoreTemplate: {
            type: Type.STRING,
            description: "Apply a .gitignore template for your programming language or platform (e.g., 'Node', 'Python', 'Java', 'VisualStudio'). Automatically excludes common build artifacts, dependencies, and system files from version control."
          },
          licenseTemplate: {
            type: Type.STRING,
            description: "Add an open source license template (e.g., 'mit', 'apache-2.0', 'gpl-3.0', 'bsd-3-clause'). Defines how others can use, modify, and distribute your code. Choose based on your project's needs and legal requirements."
          },
          // File operations parameters
          content: {
            type: Type.STRING,
            description: "File content as a string for create_file and update_file actions. Supports any text content including code, markdown, JSON, XML, etc. Will be automatically base64 encoded for GitHub API compatibility."
          },
          message: {
            type: Type.STRING,
            description: "Commit message for file operations (create_file, update_file, delete_file). Required for all file operations. Write clear, descriptive messages following conventional commit format: 'feat: add user authentication' or 'fix: resolve login validation error'."
          },
          branch: {
            type: Type.STRING,
            description: "Target branch for file operations (default: repository's default branch, usually 'main' or 'master'). Use for working on feature branches or specific releases. Format: 'feature/new-feature', 'release/v1.0', or full SHA for specific commits."
          },
          committerName: {
            type: Type.STRING,
            description: "Name of the committer for file operations (defaults to authenticated user). Override when committing on behalf of someone else or for automation. Format: 'John Doe', 'Jane Smith'."
          },
          committerEmail: {
            type: Type.STRING,
            description: "Email of the committer for file operations (defaults to authenticated user's email). Must be valid email format. Used for commit attribution and contact information."
          },
          authorName: {
            type: Type.STRING,
            description: "Name of the author for file operations (defaults to committer name). Override when the author differs from the committer, such as when applying someone else's changes or for pair programming scenarios."
          },
          authorEmail: {
            type: Type.STRING,
            description: "Email of the author for file operations (defaults to committer email). Must be valid email format. Used for proper attribution when author and committer are different people."
          },
          query: {
            type: Type.STRING,
            description: "Search query for repositories or users. For repositories: combine keywords, languages, topics, or advanced syntax like 'language:python stars:>1000 created:>2023-01-01'. For users: use usernames, real names, or advanced syntax like 'location:\"San Francisco\" language:python followers:>100'."
          },
          sort: {
            type: Type.STRING,
            description: "Sort results by relevance criteria. For repositories: 'stars' (popularity), 'forks' (collaboration), 'updated' (recent activity), 'help-wanted-issues' (contribution opportunities). For users: 'followers' (popularity), 'repositories' (activity), 'joined' (newest)."
          },
          order: {
            type: Type.STRING,
            description: "Sort order direction: 'desc' for descending (most popular/recent first) or 'asc' for ascending (oldest/least popular first). Default is 'desc' for most use cases."
          },
          perPage: {
            type: Type.NUMBER,
            description: "Number of results to return per page (default: 30, max: 100). Higher values reduce API calls but may impact performance. Use with pagination for large result sets."
          },
          language: {
            type: Type.STRING,
            description: "Filter repositories by primary programming language (e.g., 'javascript', 'python', 'go', 'rust', 'typescript', 'java'). Use lowercase language names. Combine with other search terms for more specific results."
          },
          // Repository identification
          owner: {
            type: Type.STRING,
            description: "Repository owner username or organization name (required for repository-specific actions). Case-sensitive. Found in repository URLs: github.com/owner/repo-name. Can be personal account or organization name."
          },
          repo: {
            type: Type.STRING,
            description: "Repository name (required for repository-specific actions). Case-sensitive short name without owner prefix. Found in repository URLs after the owner: github.com/owner/this-value. Use hyphens for multi-word names."
          },
          username: {
            type: Type.STRING,
            description: "GitHub username or organization name to lookup (required for user actions). Case-sensitive. Can be personal account, organization, or bot account. Found in profile URLs: github.com/username."
          },
          // File/content parameters
          path: {
            type: Type.STRING,
            description: "Path to specific file or directory within repository. Leave empty for root directory listing. Format: 'src/main.js', 'docs/README.md', 'package.json'. Use forward slashes regardless of operating system."
          },
          ref: {
            type: Type.STRING,
            description: "Git reference (branch, tag, or commit SHA) to browse or get file from. Default uses repository's default branch. Examples: 'main', 'v1.0.0', 'feature/new-feature', full 40-character SHA for specific commits."
          },
          decode: {
            type: Type.STRING,
            description: "Automatically decode base64 content to readable text for get_file action (default: true). Disable when you need raw base64 content for binary files or specific processing requirements."
          },
          recursive: {
            type: Type.STRING,
            description: "Recursively list all files in subdirectories for get_contents action (default: false). When true, returns complete directory tree. When false, returns only top-level items."
          },
          // Repository info options
          includeReadme: {
            type: Type.STRING,
            description: "Include the repository's README content for get_repository action (default: true). Provides full README text content, useful for documentation analysis and project understanding."
          },
          includeLanguages: {
            type: Type.STRING,
            description: "Include programming language statistics for get_repository action (default: true). Shows percentage breakdown of languages used in the repository, helpful for technology stack analysis."
          },
          includeContributors: {
            type: Type.STRING,
            description: "Include top contributors information for get_repository action (default: true). Lists users with most contributions, useful for understanding project maintainership and community engagement."
          },
          // Issues/PR parameters
          state: {
            type: Type.STRING,
            description: "Filter by issue/PR state: 'open' for active items, 'closed' for resolved items, 'all' for both (default: open). Use 'open' for current work, 'closed' for completed items, 'all' for comprehensive analysis."
          },
          labels: {
            type: Type.STRING,
            description: "Filter issues by labels using comma-separated list (e.g., 'bug,enhancement,good first issue'). Common labels include 'bug', 'enhancement', 'documentation', 'help wanted', 'question'. Combine multiple labels for precise filtering."
          },
          direction: {
            type: Type.STRING,
            description: "Sort direction: 'asc' for ascending (oldest first) or 'desc' for descending (newest first). Default is 'desc' for showing most recent activity first."
          },
          // PR-specific parameters  
          head: {
            type: Type.STRING,
            description: "Filter pull requests by head branch in format 'user:ref-name' or 'organization:ref-name'. Example: 'feature-branch' or 'username:feature-branch'. Useful for finding PRs from specific forks or branches."
          },
          base: {
            type: Type.STRING,
            description: "Filter pull requests by base branch (default: repository's default branch). Common values: 'main', 'master', 'develop', 'release/v1.0'. Useful for release management and branch-specific analysis."
          },
          // User parameters
          includeRepositories: {
            type: Type.STRING,
            description: "Include user's public repositories for get_user action (default: true). Provides repository list with key metrics like stars, language, and update dates. Disable for faster response when only user profile needed."
          },
          includeOrganizations: {
            type: Type.STRING,
            description: "Include user's organization memberships for get_user action (default: true). Shows organizations user belongs to, useful for understanding professional affiliations and open source involvement."
          },
          repoSort: {
            type: Type.STRING,
            description: "Sort user repositories by activity criteria: 'created' (newest first), 'updated' (recently modified), 'pushed' (recent commits), 'full_name' (alphabetical). Default is 'updated' for showing most active projects."
          },
          repoType: {
            type: Type.STRING,
            description: "Repository type filter for get_user: 'all' (everything), 'owner' (user's own repos), 'member' (repos where user is collaborator). Default is 'owner' for showing user's primary projects."
          },
           // Webhook parameters
          webhookUrl: {
            type: Type.STRING,
            description: "The URL endpoint where webhook payloads will be delivered (required for create_webhook). Must be publicly accessible HTTPS URL that can receive POST requests. Example: 'https://api.example.com/webhooks/github'."
          },
          webhookEvents: {
            type: Type.STRING,
            description: "Comma-separated list of events to subscribe to (e.g., 'push,pull_request,issues'). Common events: 'push', 'pull_request', 'issues', 'release', 'deployment'. Choose events based on your automation needs."
          },
          webhookSecret: {
            type: Type.STRING,
            description: "Secret token for securing webhook payloads. Used to validate that requests come from GitHub. Should be a random string at least 20 characters long. Store securely and use for payload verification."
          },
          webhookActive: {
            type: Type.STRING,
            description: "Whether the webhook is active and receiving events (default: true). When false, webhook is disabled but configuration is preserved. Useful for temporarily pausing webhook delivery."
          },
          webhookId: {
            type: Type.NUMBER,
            description: "The numeric ID of the webhook to update or delete. Get this ID from list_webhooks response or webhook configuration page. Required for update_webhook and delete_webhook actions."
          },
          // Gist parameters
          gistId: {
            type: Type.STRING,
            description: "The unique ID of the gist to get, update, delete, star, unstar, or fork. Found in gist URLs: gist.github.com/username/this-value. Format: alphanumeric string like 'a1b2c3d4e5f6'."
          },
          gistDescription: {
            type: Type.STRING,
            description: "Description for the gist. Appears at the top of the gist page. Useful for explaining the purpose of code snippets, configuration examples, or data files. Maximum practical length is about 200 characters."
          },
          gistFiles: {
            type: Type.STRING,
            description: "JSON string representing files in the gist, where keys are filenames and values are file content. Example: '{\"config.json\": \"{\\\\\"key\\\\\": \\\\\"value\\\\\"}\", \"script.js\": \"console.log(\\\\\"hello\\\\\");\"}'. Supports multiple files with different extensions."
          },
          gistPublic: {
            type: Type.STRING,
            description: "Whether the gist is publicly visible (default: false). Public gists appear in search results and user profiles. Private gists are only accessible via direct link. Choose based on sharing requirements and content sensitivity."
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    let accessToken: string | null = this.oauthToken;
    if (!accessToken) {
      accessToken = await getValidOAuthAccessToken(this.userId, "github");
    }

    const token = accessToken || this.token;
    this.octokit = new Octokit({ auth: token });

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
      case "create_gist":
        return this.executeCreateGist(args);
      case "get_gist":
        return this.executeGetGist(args);
      case "update_gist":
        return this.executeUpdateGist(args);
      case "delete_gist":
        return this.executeDeleteGist(args);
      case "list_gists":
        return this.executeListGists(args);
      case "star_gist":
        return this.executeStarGist(args);
      case "unstar_gist":
        return this.executeUnstarGist(args);
      case "fork_gist":
        return this.executeForkGist(args);
      default:
        return {
          success: false,
          error: `Unknown action: ${args.action}. Available actions: get_authenticated_user, create_repository, update_repository, create_file, update_file, delete_file, search_repositories, get_repository, get_contents, get_file, get_issues, get_pull_requests, get_commits, get_releases, get_user, search_users, create_issue, update_issue, close_issue, add_comment_to_issue, create_pull_request, merge_pull_request, close_pull_request, add_reviewer_to_pull_request, add_comment_to_pull_request, get_organization, list_organization_members, search_code, search_issues_advanced, search_pull_requests_advanced, create_webhook, list_webhooks, update_webhook, delete_webhook, create_gist, get_gist, update_gist, delete_gist, list_gists, star_gist, unstar_gist, fork_gist`
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
        body: args.body || ''
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
        base: args.base,
        body: args.body || ''
      };

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

      const requestParams = {
        owner: args.owner,
        repo: args.repo,
        pull_number: args.pullRequestNumber,
        reviewers: args.reviewers.split(',')
      };

      const response = await this.octokit.rest.pulls.requestReviewers(requestParams);

      return {
        success: true,
        action: "add_reviewer_to_pull_request",
        ...response.data
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

      const commentParams = {
        owner: args.owner,
        repo: args.repo,
        issue_number: args.pullRequestNumber,
        body: args.commentBody,
      };

      const response = await this.octokit.rest.issues.createComment(commentParams);

      return {
        success: true,
        action: "add_comment_to_pull_request",
        ...response.data
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

      const response = await this.octokit.rest.orgs.get({ org: args.organization });

      return {
        success: true,
        action: "get_organization",
        ...response.data
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

      console.log(`🏢 Listing members of: ${args.organization}`);

      const response = await this.octokit.rest.orgs.listMembers({ org: args.organization });

      return {
        success: true,
        action: "list_organization_members",
        members: response.data
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

      console.log(`🔍 Searching code: "${args.query}"`);

      const response = await this.octokit.rest.search.code({ q: args.query });

      return {
        success: true,
        action: "search_code",
        ...response.data
      };
    } catch (error: unknown) {
      console.error("❌ Code search failed:", error);
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

      console.log(`🔍 Advanced issue search: "${args.query}"`);

      const response = await this.octokit.rest.search.issuesAndPullRequests({ q: args.query });

      return {
        success: true,
        action: "search_issues_advanced",
        ...response.data
      };
    } catch (error: unknown) {
      console.error("❌ Advanced issue search failed:", error);
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

      console.log(`🔍 Advanced PR search: "${args.query}"`);

      const response = await this.octokit.rest.search.issuesAndPullRequests({ q: `${args.query} is:pr` });

      return {
        success: true,
        action: "search_pull_requests_advanced",
        ...response.data
      };
    } catch (error: unknown) {
      console.error("❌ Advanced PR search failed:", error);
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

      console.log(`🎣 Creating webhook for: ${args.owner}/${args.repo}`);

      const webhookParams: any = {
        owner: args.owner,
        repo: args.repo,
        config: {
          url: args.webhookUrl,
          content_type: 'json',
          secret: args.webhookSecret
        },
        events: args.webhookEvents ? args.webhookEvents.split(',') : ['push'],
        active: args.webhookActive !== false
      };

      const response = await this.octokit.rest.repos.createWebhook(webhookParams);

      return {
        success: true,
        action: "create_webhook",
        ...response.data
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

      console.log(`🎣 Listing webhooks for: ${args.owner}/${args.repo}`);

      const response = await this.octokit.rest.repos.listWebhooks({
        owner: args.owner,
        repo: args.repo,
      });

      return {
        success: true,
        action: "list_webhooks",
        webhooks: response.data
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

      console.log(`🎣 Updating webhook ${args.webhookId} for: ${args.owner}/${args.repo}`);

      const webhookParams: any = {
        owner: args.owner,
        repo: args.repo,
        hook_id: args.webhookId,
      };

      if (args.webhookUrl) webhookParams.config.url = args.webhookUrl;
      if (args.webhookSecret) webhookParams.config.secret = args.webhookSecret;
      if (args.webhookEvents) webhookParams.events = args.webhookEvents.split(',');
      if (args.webhookActive !== undefined) webhookParams.active = args.webhookActive;

      const response = await this.octokit.rest.repos.updateWebhook(webhookParams);

      return {
        success: true,
        action: "update_webhook",
        ...response.data
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

      console.log(`🗑️ Deleting webhook ${args.webhookId} from: ${args.owner}/${args.repo}`);

      await this.octokit.rest.repos.deleteWebhook({
        owner: args.owner,
        repo: args.repo,
        hook_id: args.webhookId,
      });

      return {
        success: true,
        action: "delete_webhook",
        message: `Webhook ${args.webhookId} deleted successfully.`
      };
    } catch (error: unknown) {
      console.error("❌ Delete webhook failed:", error);
      return {
        success: false,
        action: "delete_webhook",
        error: `Delete webhook failed: ${error instanceof Error ? error.message : String(error)}`,
        owner: args.owner,
        repo: args.repo,
        webhookId: args.webhookId
      };
    }
  }

  private async executeCreateGist(args: any): Promise<any> {
    try {
      if (!args.gistFiles) {
        return { success: false, error: "gistFiles parameter is required for create_gist action" };
      }

      console.log(`📝 Creating a new gist`);

      const files = JSON.parse(args.gistFiles);

      const response = await this.octokit.rest.gists.create({
        files,
        description: args.gistDescription || '',
        public: args.gistPublic || false,
      });

      return {
        success: true,
        action: "create_gist",
        ...response.data
      };
    } catch (error: unknown) {
      console.error("❌ Create gist failed:", error);
      return {
        success: false,
        action: "create_gist",
        error: `Create gist failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async executeGetGist(args: any): Promise<any> {
    try {
      if (!args.gistId) {
        return { success: false, error: "gistId parameter is required for get_gist action" };
      }

      console.log(`📝 Getting gist: ${args.gistId}`);

      const response = await this.octokit.rest.gists.get({ gist_id: args.gistId });

      return {
        success: true,
        action: "get_gist",
        ...response.data
      };
    } catch (error: unknown) {
      console.error("❌ Get gist failed:", error);
      return {
        success: false,
        action: "get_gist",
        error: `Get gist failed: ${error instanceof Error ? error.message : String(error)}`,
        gistId: args.gistId
      };
    }
  }

  private async executeUpdateGist(args: any): Promise<any> {
    try {
      if (!args.gistId || !args.gistFiles) {
        return { success: false, error: "gistId and gistFiles parameters are required for update_gist action" };
      }

      console.log(`📝 Updating gist: ${args.gistId}`);

      const files = JSON.parse(args.gistFiles);

      const response = await this.octokit.rest.gists.update({
        gist_id: args.gistId,
        files,
        description: args.gistDescription,
      });

      return {
        success: true,
        action: "update_gist",
        ...response.data
      };
    } catch (error: unknown) {
      console.error("❌ Update gist failed:", error);
      return {
        success: false,
        action: "update_gist",
        error: `Update gist failed: ${error instanceof Error ? error.message : String(error)}`,
        gistId: args.gistId
      };
    }
  }

  private async executeDeleteGist(args: any): Promise<any> {
    try {
      if (!args.gistId) {
        return { success: false, error: "gistId parameter is required for delete_gist action" };
      }

      console.log(`🗑️ Deleting gist: ${args.gistId}`);

      await this.octokit.rest.gists.delete({ gist_id: args.gistId });

      return {
        success: true,
        action: "delete_gist",
        message: `Gist ${args.gistId} deleted successfully.`
      };
    } catch (error: unknown) {
      console.error("❌ Delete gist failed:", error);
      return {
        success: false,
        action: "delete_gist",
        error: `Delete gist failed: ${error instanceof Error ? error.message : String(error)}`,
        gistId: args.gistId
      };
    }
  }

  private async executeListGists(args: any): Promise<any> {
    try {
      console.log(`📝 Listing gists`);

      const response = await this.octokit.rest.gists.list();

      return {
        success: true,
        action: "list_gists",
        gists: response.data
      };
    } catch (error: unknown) {
      console.error("❌ List gists failed:", error);
      return {
        success: false,
        action: "list_gists",
        error: `List gists failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async executeStarGist(args: any): Promise<any> {
    try {
      if (!args.gistId) {
        return { success: false, error: "gistId parameter is required for star_gist action" };
      }

      console.log(`⭐ Starring gist: ${args.gistId}`);

      await this.octokit.rest.gists.star({ gist_id: args.gistId });

      return {
        success: true,
        action: "star_gist",
        message: `Gist ${args.gistId} starred successfully.`
      };
    } catch (error: unknown) {
      console.error("❌ Star gist failed:", error);
      return {
        success: false,
        action: "star_gist",
        error: `Star gist failed: ${error instanceof Error ? error.message : String(error)}`,
        gistId: args.gistId
      };
    }
  }

  private async executeUnstarGist(args: any): Promise<any> {
    try {
      if (!args.gistId) {
        return { success: false, error: "gistId parameter is required for unstar_gist action" };
      }

      console.log(`🌟 Unstarring gist: ${args.gistId}`);

      await this.octokit.rest.gists.unstar({ gist_id: args.gistId });

      return {
        success: true,
        action: "unstar_gist",
        message: `Gist ${args.gistId} unstarred successfully.`
      };
    } catch (error: unknown) {
      console.error("❌ Unstar gist failed:", error);
      return {
        success: false,
        action: "unstar_gist",
        error: `Unstar gist failed: ${error instanceof Error ? error.message : String(error)}`,
        gistId: args.gistId
      };
    }
  }

  private async executeForkGist(args: any): Promise<any> {
    try {
      if (!args.gistId) {
        return { success: false, error: "gistId parameter is required for fork_gist action" };
      }

      console.log(`🍴 Forking gist: ${args.gistId}`);

      const response = await this.octokit.rest.gists.fork({ gist_id: args.gistId });

      return {
        success: true,
        action: "fork_gist",
        ...response.data
      };
    } catch (error: unknown) {
      console.error("❌ Fork gist failed:", error);
      return {
        success: false,
        action: "fork_gist",
        error: `Fork gist failed: ${error instanceof Error ? error.message : String(error)}`,
        gistId: args.gistId
      };
    }
  }
}
