import { FunctionDeclaration, Type } from "@google/genai";
import { Octokit } from "@octokit/rest";

export class GithubTool {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  /**
   * Returns the function declaration schema for GitHub operations.
   * @returns FunctionDeclaration defining supported actions and parameters.
   */
  getDefinition(): FunctionDeclaration {
    return {
      name: "github_operations",
      description: "Comprehensive GitHub tool for repository management, file operations, commits, issues, pull requests, and more. Supports 20+ GitHub operations.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The GitHub operation to perform",
            enum: [
              // Repository operations
              "create_repo",
              "delete_repo",
              "get_repo",
              "list_repos",
              "update_repo",
              "fork_repo",
              "star_repo",
              "unstar_repo",
              
              // File operations
              "create_file",
              "update_file",
              "delete_file",
              "get_file",
              "list_files",
              "rename_file",
              
              // Commit operations
              "create_commit",
              "get_commit",
              "list_commits",
              "compare_commits",
              
              // Branch operations
              "create_branch",
              "delete_branch",
              "list_branches",
              "get_branch",
              "merge_branch",
              
              // Issue operations
              "create_issue",
              "update_issue",
              "close_issue",
              "list_issues",
              "get_issue",
              "add_issue_comment",
              
              // Pull Request operations
              "create_pull_request",
              "update_pull_request",
              "merge_pull_request",
              "close_pull_request",
              "list_pull_requests",
              "get_pull_request",
              
              // Release operations
              "create_release",
              "update_release",
              "delete_release",
              "list_releases",
              "get_release",
              
              // User/Organization operations
              "get_user",
              "list_user_repos",
              "get_organization",
              "list_org_repos",
              
              // Collaboration operations
              "add_collaborator",
              "remove_collaborator",
              "list_collaborators",
              
              // Webhook operations
              "create_webhook",
              "delete_webhook",
              "list_webhooks"
            ]
          },
          owner: {
            type: Type.STRING,
            description: "Repository owner (username or organization)"
          },
          repo: {
            type: Type.STRING,
            description: "Repository name"
          },
          path: {
            type: Type.STRING,
            description: "File path (for file operations)"
          },
          content: {
            type: Type.STRING,
            description: "File content (base64-encoded for binary) or commit message"
          },
          message: {
            type: Type.STRING,
            description: "Commit message or description"
          },
          branch: {
            type: Type.STRING,
            description: "Branch name (default: main)"
          },
          title: {
            type: Type.STRING,
            description: "Title for issues, pull requests, or releases"
          },
          body: {
            type: Type.STRING,
            description: "Body content for issues, pull requests, or releases"
          },
          base: {
            type: Type.STRING,
            description: "Base branch for pull requests or comparisons"
          },
          head: {
            type: Type.STRING,
            description: "Head branch for pull requests or comparisons"
          },
          commit_sha: {
            type: Type.STRING,
            description: "Commit SHA for commit or branch operations"
          },
          tree_sha: {
            type: Type.STRING,
            description: "Tree SHA for advanced commit operations"
          },
          parents: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Parent commit SHAs for create_commit"
          },
          tag: {
            type: Type.STRING,
            description: "Tag name for releases"
          },
          username: {
            type: Type.STRING,
            description: "Username for user operations or collaborator management"
          },
          permission: {
            type: Type.STRING,
            description: "Permission level for collaborators",
            enum: ["pull", "push", "admin", "maintain", "triage"]
          },
          private: {
            type: Type.BOOLEAN,
            description: "Whether repository should be private (default: false)"
          },
          description: {
            type: Type.STRING,
            description: "Repository or release description"
          },
          homepage: {
            type: Type.STRING,
            description: "Repository homepage URL"
          },
          hasIssues: {
            type: Type.BOOLEAN,
            description: "Enable issues for repository"
          },
          hasWiki: {
            type: Type.BOOLEAN,
            description: "Enable wiki for repository"
          },
          autoInit: {
            type: Type.BOOLEAN,
            description: "Initialize repository with README"
          },
          gitignoreTemplate: {
            type: Type.STRING,
            description: "Gitignore template to use"
          },
          licenseTemplate: {
            type: Type.STRING,
            description: "License template to use"
          },
          state: {
            type: Type.STRING,
            description: "State for issues/PRs",
            enum: ["open", "closed", "all"]
          },
          labels: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Labels for issues or pull requests"
          },
          assignees: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Assignees for issues or pull requests"
          },
          draft: {
            type: Type.BOOLEAN,
            description: "Create pull request as draft"
          },
          prerelease: {
            type: Type.BOOLEAN,
            description: "Mark release as prerelease"
          },
          generateReleaseNotes: {
            type: Type.BOOLEAN,
            description: "Auto-generate release notes"
          },
          webhookUrl: {
            type: Type.STRING,
            description: "Webhook URL for webhook operations"
          },
          webhookEvents: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Events to trigger webhook"
          },
          page: {
            type: Type.NUMBER,
            description: "Page number for paginated results (default: 1)"
          },
          perPage: {
            type: Type.NUMBER,
            description: "Items per page (default: 30, max: 100)"
          },
          issue_number: {
            type: Type.NUMBER,
            description: "Issue number for issue operations"
          },
          pull_number: {
            type: Type.NUMBER,
            description: "Pull request number for PR operations"
          },
          release_id: {
            type: Type.NUMBER,
            description: "Release ID for release operations"
          },
          hook_id: {
            type: Type.NUMBER,
            description: "Webhook ID for webhook operations"
          }
        },
        required: ["action"]
      }
    };
  }

  /**
   * Executes the specified GitHub operation.
   * @param args - Parameters for the GitHub operation.
   * @returns Operation result or error details.
   * @throws Error if the action is unsupported or API call fails.
   */
  async execute(args: any): Promise<any> {
    try {
      console.log(`🐙 GitHub operation: ${args.action}`);
      
      // Default values
      args.branch = args.branch || 'main';
      args.perPage = Math.min(args.perPage || 30, 100);
      args.page = args.page || 1;

      switch (args.action) {
        // Repository operations
        case "create_repo":
          return await this.createRepository(args);
        case "delete_repo":
          return await this.deleteRepository(args);
        case "get_repo":
          return await this.getRepository(args);
        case "list_repos":
          return await this.listRepositories(args);
        case "update_repo":
          return await this.updateRepository(args);
        case "fork_repo":
          return await this.forkRepository(args);
        case "star_repo":
          return await this.starRepository(args);
        case "unstar_repo":
          return await this.unstarRepository(args);

        // File operations
        case "create_file":
          return await this.createFile(args);
        case "update_file":
          return await this.updateFile(args);
        case "delete_file":
          return await this.deleteFile(args);
        case "get_file":
          return await this.getFile(args);
        case "list_files":
          return await this.listFiles(args);
        case "rename_file":
          return await this.renameFile(args);

        // Commit operations
        case "create_commit":
          return await this.createCommit(args);
        case "get_commit":
          return await this.getCommit(args);
        case "list_commits":
          return await this.listCommits(args);
        case "compare_commits":
          return await this.compareCommits(args);

        // Branch operations
        case "create_branch":
          return await this.createBranch(args);
        case "delete_branch":
          return await this.deleteBranch(args);
        case "list_branches":
          return await this.listBranches(args);
        case "get_branch":
          return await this.getBranch(args);
        case "merge_branch":
          return await this.mergeBranch(args);

        // Issue operations
        case "create_issue":
          return await this.createIssue(args);
        case "update_issue":
          return await this.updateIssue(args);
        case "close_issue":
          return await this.closeIssue(args);
        case "list_issues":
          return await this.listIssues(args);
        case "get_issue":
          return await this.getIssue(args);
        case "add_issue_comment":
          return await this.addIssueComment(args);

        // Pull Request operations
        case "create_pull_request":
          return await this.createPullRequest(args);
        case "update_pull_request":
          return await this.updatePullRequest(args);
        case "merge_pull_request":
          return await this.mergePullRequest(args);
        case "close_pull_request":
          return await this.closePullRequest(args);
        case "list_pull_requests":
          return await this.listPullRequests(args);
        case "get_pull_request":
          return await this.getPullRequest(args);

        // Release operations
        case "create_release":
          return await this.createRelease(args);
        case "update_release":
          return await this.updateRelease(args);
        case "delete_release":
          return await this.deleteRelease(args);
        case "list_releases":
          return await this.listReleases(args);
        case "get_release":
          return await this.getRelease(args);

        // User/Organization operations
        case "get_user":
          return await this.getUser(args);
        case "list_user_repos":
          return await this.listUserRepositories(args);
        case "get_organization":
          return await this.getOrganization(args);
        case "list_org_repos":
          return await this.listOrganizationRepositories(args);

        // Collaboration operations
        case "add_collaborator":
          return await this.addCollaborator(args);
        case "remove_collaborator":
          return await this.removeCollaborator(args);
        case "list_collaborators":
          return await this.listCollaborators(args);

        // Webhook operations
        case "create_webhook":
          return await this.createWebhook(args);
        case "delete_webhook":
          return await this.deleteWebhook(args);
        case "list_webhooks":
          return await this.listWebhooks(args);

        default:
          throw new Error(`Unsupported action: ${args.action}`);
      }
    } catch (error: unknown) {
      console.error("❌ GitHub operation failed:", error);
      let errDetails: { message: string; stack?: string; apiResponse?: { status: number; data: any } } = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      if ((error as any).response) {
        errDetails.apiResponse = {
          status: (error as any).response.status,
          data: (error as any).response.data
        };
      }
      return {
        success: false,
        error: errDetails,
        action: args.action
      };
    }
  }

  /**
   * Creates a new repository for the authenticated user.
   * @param args - Parameters including repo name, description, etc.
   * @returns Success response with repository data.
   * @throws Error if token lacks 'repo' scope or name conflicts.
   * Required scopes: repo
   */
  private async createRepository(args: any) {
    const response = await this.octokit.repos.createForAuthenticatedUser({
      name: args.repo,
      description: args.description,
      homepage: args.homepage,
      private: args.private ?? false,
      has_issues: args.hasIssues ?? true,
      has_wiki: args.hasWiki ?? true,
      auto_init: args.autoInit ?? false,
      gitignore_template: args.gitignoreTemplate,
      license_template: args.licenseTemplate
    });
    return {
      success: true,
      action: "create_repo",
      repository: response.data,
      message: `Repository ${args.repo} created successfully`
    };
  }

  /**
   * Deletes a repository.
   * @param args - Owner and repo.
   * @returns Success message.
   * @throws Error on 404 if not found or insufficient scopes.
   * Required scopes: repo:delete
   */
  private async deleteRepository(args: any) {
    if (!args.owner || !args.repo) throw new Error("Owner and repo are required");
    await this.octokit.repos.delete({
      owner: args.owner,
      repo: args.repo
    });
    return {
      success: true,
      action: "delete_repo",
      message: `Repository ${args.owner}/${args.repo} deleted successfully`
    };
  }

  /**
   * Retrieves a repository's details.
   * @param args - Owner and repo.
   * @returns Repository data.
   * @throws Error on 404 if not found or 403 if unauthorized.
   * Required scopes: repo
   */
  private async getRepository(args: any) {
    if (!args.owner || !args.repo) throw new Error("Owner and repo are required");
    const response = await this.octokit.repos.get({
      owner: args.owner,
      repo: args.repo
    });
    return {
      success: true,
      action: "get_repo",
      repository: response.data
    };
  }

  /**
   * Lists repositories for the authenticated user.
   * @param args - Page and perPage for pagination.
   * @returns List of repositories.
   * @throws Error on 401 if unauthorized.
   * Required scopes: repo
   */
  private async listRepositories(args: any) {
    const response = await this.octokit.paginate(this.octokit.repos.listForAuthenticatedUser, {
      page: args.page,
      per_page: args.perPage,
      sort: 'updated',
      direction: 'desc'
    });
    return {
      success: true,
      action: "list_repos",
      repositories: response,
      count: response.length
    };
  }

  /**
   * Updates a repository's settings.
   * @param args - Owner, repo, and optional settings (title, description, etc.).
   * @returns Updated repository data.
   * @throws Error on 403 if unauthorized or 422 if invalid settings.
   * Required scopes: repo
   */
  private async updateRepository(args: any) {
    if (!args.owner || !args.repo) throw new Error("Owner and repo are required");
    const response = await this.octokit.repos.update({
      owner: args.owner,
      repo: args.repo,
      name: args.title || args.repo,
      description: args.description,
      homepage: args.homepage,
      private: args.private,
      has_issues: args.hasIssues,
      has_wiki: args.hasWiki
    });
    return {
      success: true,
      action: "update_repo",
      repository: response.data,
      message: `Repository ${args.owner}/${args.repo} updated successfully`
    };
  }

  /**
   * Forks a repository.
   * @param args - Owner and repo.
   * @returns Forked repository data.
   * @throws Error on 403 if unauthorized or 422 if already forked.
   * Required scopes: repo
   */
  private async forkRepository(args: any) {
    if (!args.owner || !args.repo) throw new Error("Owner and repo are required");
    const response = await this.octokit.repos.createFork({
      owner: args.owner,
      repo: args.repo
    });
    return {
      success: true,
      action: "fork_repo",
      repository: response.data,
      message: `Repository ${args.owner}/${args.repo} forked successfully`
    };
  }

  /**
   * Stars a repository.
   * @param args - Owner and repo.
   * @returns Success message.
   * @throws Error on 403 if unauthorized.
   * Required scopes: repo
   */
  private async starRepository(args: any) {
    if (!args.owner || !args.repo) throw new Error("Owner and repo are required");
    await this.octokit.activity.starRepoForAuthenticatedUser({
      owner: args.owner,
      repo: args.repo
    });
    return {
      success: true,
      action: "star_repo",
      message: `Repository ${args.owner}/${args.repo} starred successfully`
    };
  }

  /**
   * Unstars a repository.
   * @param args - Owner and repo.
   * @returns Success message.
   * @throws Error on 403 if unauthorized.
   * Required scopes: repo
   */
  private async unstarRepository(args: any) {
    if (!args.owner || !args.repo) throw new Error("Owner and repo are required");
    await this.octokit.activity.unstarRepoForAuthenticatedUser({
      owner: args.owner,
      repo: args.repo
    });
    return {
      success: true,
      action: "unstar_repo",
      message: `Repository ${args.owner}/${args.repo} unstarred successfully`
    };
  }

  /**
   * Creates a file in a repository.
   * @param args - Owner, repo, path, content, message, branch.
   * @returns File creation data.
   * @throws Error on 422 if file exists or 403 if unauthorized.
   * Required scopes: repo
   */
  private async createFile(args: any) {
    if (!args.owner || !args.repo || !args.path || !args.content) throw new Error("Owner, repo, path, and content are required");
    const response = await this.octokit.repos.createOrUpdateFileContents({
      owner: args.owner,
      repo: args.repo,
      path: args.path,
      message: args.message || `Create ${args.path}`,
      content: Buffer.from(args.content).toString('base64'),
      branch: args.branch
    });
    return {
      success: true,
      action: "create_file",
      file: response.data,
      message: `File ${args.path} created successfully`
    };
  }

  /**
   * Updates a file in a repository.
   * @param args - Owner, repo, path, content, message, branch.
   * @returns File update data.
   * @throws Error on 404 if file not found or 403 if unauthorized.
   * Required scopes: repo
   */
  private async updateFile(args: any) {
    if (!args.owner || !args.repo || !args.path || !args.content) throw new Error("Owner, repo, path, and content are required");
    const currentFile = await this.octokit.repos.getContent({
      owner: args.owner,
      repo: args.repo,
      path: args.path,
      ref: args.branch
    });
    const response = await this.octokit.repos.createOrUpdateFileContents({
      owner: args.owner,
      repo: args.repo,
      path: args.path,
      message: args.message || `Update ${args.path}`,
      content: Buffer.from(args.content).toString('base64'),
      sha: (currentFile.data as any).sha,
      branch: args.branch
    });
    return {
      success: true,
      action: "update_file",
      file: response.data,
      message: `File ${args.path} updated successfully`
    };
  }

  /**
   * Deletes a file in a repository.
   * @param args - Owner, repo, path, message, branch.
   * @returns Deletion data.
   * @throws Error on 404 if file not found or 403 if unauthorized.
   * Required scopes: repo
   */
  private async deleteFile(args: any) {
    if (!args.owner || !args.repo || !args.path) throw new Error("Owner, repo, and path are required");
    const currentFile = await this.octokit.repos.getContent({
      owner: args.owner,
      repo: args.repo,
      path: args.path,
      ref: args.branch
    });
    const response = await this.octokit.repos.deleteFile({
      owner: args.owner,
      repo: args.repo,
      path: args.path,
      message: args.message || `Delete ${args.path}`,
      sha: (currentFile.data as any).sha,
      branch: args.branch
    });
    return {
      success: true,
      action: "delete_file",
      commit: response.data,
      message: `File ${args.path} deleted successfully`
    };
  }

  /**
   * Retrieves a file's content.
   * @param args - Owner, repo, path, branch.
   * @returns File data with decoded content.
   * @throws Error on 404 if file not found.
   * Required scopes: repo
   */
  private async getFile(args: any) {
    if (!args.owner || !args.repo || !args.path) throw new Error("Owner, repo, and path are required");
    const response = await this.octokit.repos.getContent({
      owner: args.owner,
      repo: args.repo,
      path: args.path,
      ref: args.branch
    });
    const fileData = response.data as any;
    const content = fileData.encoding === 'base64' 
      ? Buffer.from(fileData.content, 'base64').toString('utf-8')
      : fileData.content;
    return {
      success: true,
      action: "get_file",
      file: {
        ...fileData,
        decodedContent: content
      }
    };
  }

  /**
   * Lists files in a repository path.
   * @param args - Owner, repo, path, branch, page, perPage.
   * @returns List of files.
   * @throws Error on 404 if path not found.
   * Required scopes: repo
   */
  private async listFiles(args: any) {
    if (!args.owner || !args.repo) throw new Error("Owner and repo are required");
    const response = await this.octokit.repos.getContent({
      owner: args.owner,
      repo: args.repo,
      path: args.path || '',
      ref: args.branch
    });
    return {
      success: true,
      action: "list_files",
      files: response.data,
      count: Array.isArray(response.data) ? response.data.length : 1
    };
  }

  /**
   * Renames a file using a tree update for atomicity.
   * @param args - Owner, repo, path, title (new path), message, branch.
   * @returns Success message.
   * @throws Error on 404 if file not found or 403 if unauthorized.
   * Required scopes: repo
   */
  private async renameFile(args: any) {
    if (!args.owner || !args.repo || !args.path || !args.title) throw new Error("Owner, repo, path, and title are required");
    const baseRef = await this.octokit.git.getRef({
      owner: args.owner,
      repo: args.repo,
      ref: `heads/${args.branch}`
    });
    const baseCommit = await this.octokit.git.getCommit({
      owner: args.owner,
      repo: args.repo,
      commit_sha: baseRef.data.object.sha
    });
    const currentFile = await this.octokit.repos.getContent({
      owner: args.owner,
      repo: args.repo,
      path: args.path,
      ref: args.branch
    });
    const tree = await this.octokit.git.createTree({
      owner: args.owner,
      repo: args.repo,
      base_tree: baseCommit.data.tree.sha,
      tree: [
        { path: args.path, mode: '100644', type: 'blob', sha: null }, // Delete old
        { path: args.title, mode: '100644', type: 'blob', sha: (currentFile.data as any).sha } // New path
      ]
    });
    const commit = await this.octokit.git.createCommit({
      owner: args.owner,
      repo: args.repo,
      message: args.message || `Rename ${args.path} to ${args.title}`,
      tree: tree.data.sha,
      parents: [baseRef.data.object.sha]
    });
    await this.octokit.git.updateRef({
      owner: args.owner,
      repo: args.repo,
      ref: `heads/${args.branch}`,
      sha: commit.data.sha
    });
    return {
      success: true,
      action: "rename_file",
      message: `File renamed from ${args.path} to ${args.title}`
    };
  }

  /**
   * Creates a commit by updating a file.
   * @param args - Owner, repo, path, content, message, branch, parents (optional).
   * @returns Commit data.
   * @throws Error if tree creation fails.
   * Required scopes: repo
   */
  private async createCommit(args: any) {
    if (!args.owner || !args.repo || !args.path || !args.content || !args.message) throw new Error("Owner, repo, path, content, and message are required");
    const baseRef = await this.octokit.git.getRef({
      owner: args.owner,
      repo: args.repo,
      ref: `heads/${args.branch}`
    });
    const baseCommit = await this.octokit.git.getCommit({
      owner: args.owner,
      repo: args.repo,
      commit_sha: baseRef.data.object.sha
    });
    const blob = await this.octokit.git.createBlob({
      owner: args.owner,
      repo: args.repo,
      content: args.content,
      encoding: 'utf-8'
    });
    const tree = await this.octokit.git.createTree({
      owner: args.owner,
      repo: args.repo,
      base_tree: baseCommit.data.tree.sha,
      tree: [{
        path: args.path,
        mode: '100644',
        type: 'blob',
        sha: blob.data.sha
      }]
    });
    const commit = await this.octokit.git.createCommit({
      owner: args.owner,
      repo: args.repo,
      message: args.message,
      tree: tree.data.sha,
      parents: args.parents || [baseRef.data.object.sha]
    });
    await this.octokit.git.updateRef({
      owner: args.owner,
      repo: args.repo,
      ref: `heads/${args.branch}`,
      sha: commit.data.sha
    });
    return {
      success: true,
      action: "create_commit",
      commit: commit.data,
      message: "Commit created successfully"
    };
  }

  /**
   * Retrieves a commit's details.
   * @param args - Owner, repo, commit_sha.
   * @returns Commit data.
   * @throws Error on 404 if commit not found.
   * Required scopes: repo
   */
  private async getCommit(args: any) {
    if (!args.owner || !args.repo || !args.commit_sha) throw new Error("Owner, repo, and commit_sha are required");
    const response = await this.octokit.repos.getCommit({
      owner: args.owner,
      repo: args.repo,
      ref: args.commit_sha
    });
    return {
      success: true,
      action: "get_commit",
      commit: response.data
    };
  }

  /**
   * Lists commits in a repository.
   * @param args - Owner, repo, branch, page, perPage.
   * @returns List of commits.
   * @throws Error on 403 if unauthorized.
   * Required scopes: repo
   */
  private async listCommits(args: any) {
    if (!args.owner || !args.repo) throw new Error("Owner and repo are required");
    const response = await this.octokit.paginate(this.octokit.repos.listCommits, {
      owner: args.owner,
      repo: args.repo,
      sha: args.branch,
      page: args.page,
      per_page: args.perPage
    });
    return {
      success: true,
      action: "list_commits",
      commits: response,
      count: response.length
    };
  }

  /**
   * Compares two commits.
   * @param args - Owner, repo, base, head.
   * @returns Comparison data.
   * @throws Error on 404 if commits not found.
   * Required scopes: repo
   */
  private async compareCommits(args: any) {
    if (!args.owner || !args.repo || !args.base || !args.head) throw new Error("Owner, repo, base, and head are required");
    const response = await this.octokit.repos.compareCommits({
      owner: args.owner,
      repo: args.repo,
      base: args.base,
      head: args.head
    });
    return {
      success: true,
      action: "compare_commits",
      comparison: response.data
    };
  }

  /**
   * Creates a new branch.
   * @param args - Owner, repo, branch, base.
   * @returns Branch data.
   * @throws Error on 422 if branch exists.
   * Required scopes: repo
   */
  private async createBranch(args: any) {
    if (!args.owner || !args.repo || !args.branch) throw new Error("Owner, repo, and branch are required");
    const baseRef = await this.octokit.git.getRef({
      owner: args.owner,
      repo: args.repo,
      ref: `heads/${args.base || 'main'}`
    });
    const response = await this.octokit.git.createRef({
      owner: args.owner,
      repo: args.repo,
      ref: `refs/heads/${args.branch}`,
      sha: baseRef.data.object.sha
    });
    return {
      success: true,
      action: "create_branch",
      branch: response.data,
      message: `Branch ${args.branch} created successfully`
    };
  }

  /**
   * Deletes a branch.
   * @param args - Owner, repo, branch.
   * @returns Success message.
   * @throws Error on 404 if branch not found.
   * Required scopes: repo
   */
  private async deleteBranch(args: any) {
    if (!args.owner || !args.repo || !args.branch) throw new Error("Owner, repo, and branch are required");
    await this.octokit.git.deleteRef({
      owner: args.owner,
      repo: args.repo,
      ref: `heads/${args.branch}`
    });
    return {
      success: true,
      action: "delete_branch",
      message: `Branch ${args.branch} deleted successfully`
    };
  }

  /**
   * Lists branches in a repository.
   * @param args - Owner, repo, page, perPage.
   * @returns List of branches.
   * @throws Error on 403 if unauthorized.
   * Required scopes: repo
   */
  private async listBranches(args: any) {
    if (!args.owner || !args.repo) throw new Error("Owner and repo are required");
    const response = await this.octokit.paginate(this.octokit.repos.listBranches, {
      owner: args.owner,
      repo: args.repo,
      page: args.page,
      per_page: args.perPage
    });
    return {
      success: true,
      action: "list_branches",
      branches: response,
      count: response.length
    };
  }

  /**
   * Retrieves a branch's details.
   * @param args - Owner, repo, branch.
   * @returns Branch data.
   * @throws Error on 404 if branch not found.
   * Required scopes: repo
   */
  private async getBranch(args: any) {
    if (!args.owner || !args.repo || !args.branch) throw new Error("Owner, repo, and branch are required");
    const response = await this.octokit.repos.getBranch({
      owner: args.owner,
      repo: args.repo,
      branch: args.branch
    });
    return {
      success: true,
      action: "get_branch",
      branch: response.data
    };
  }

  /**
   * Merges a branch into another.
   * @param args - Owner, repo, base, head, message.
   * @returns Merge data.
   * @throws Error on 409 if merge conflicts.
   * Required scopes: repo
   */
  private async mergeBranch(args: any) {
    if (!args.owner || !args.repo || !args.base || !args.head) throw new Error("Owner, repo, base, and head are required");
    const response = await this.octokit.repos.merge({
      owner: args.owner,
      repo: args.repo,
      base: args.base,
      head: args.head,
      commit_message: args.message
    });
    return {
      success: true,
      action: "merge_branch",
      merge: response.data,
      message: `Branch ${args.head} merged into ${args.base}`
    };
  }

  /**
   * Creates a new issue.
   * @param args - Owner, repo, title, body, labels, assignees.
   * @returns Issue data.
   * @throws Error on 403 if issues disabled or 422 if invalid.
   * Required scopes: repo
   */
  private async createIssue(args: any) {
    if (!args.owner || !args.repo || !args.title) throw new Error("Owner, repo, and title are required");
    const response = await this.octokit.issues.create({
      owner: args.owner,
      repo: args.repo,
      title: args.title,
      body: args.body,
      labels: args.labels,
      assignees: args.assignees
    });
    return {
      success: true,
      action: "create_issue",
      issue: response.data,
      message: `Issue #${response.data.number} created successfully`
    };
  }

  /**
   * Updates an issue.
   * @param args - Owner, repo, issue_number, title, body, state, labels, assignees.
   * @returns Updated issue data.
   * @throws Error on 404 if issue not found.
   * Required scopes: repo
   */
  private async updateIssue(args: any) {
    if (!args.owner || !args.repo || !args.issue_number) throw new Error("Owner, repo, and issue_number are required");
    const response = await this.octokit.issues.update({
      owner: args.owner,
      repo: args.repo,
      issue_number: args.issue_number,
      title: args.title,
      body: args.body,
      state: args.state,
      labels: args.labels,
      assignees: args.assignees
    });
    return {
      success: true,
      action: "update_issue",
      issue: response.data,
      message: `Issue #${args.issue_number} updated successfully`
    };
  }

  /**
   * Closes an issue.
   * @param args - Owner, repo, issue_number.
   * @returns Closed issue data.
   * @throws Error on 404 if issue not found.
   * Required scopes: repo
   */
  private async closeIssue(args: any) {
    if (!args.owner || !args.repo || !args.issue_number) throw new Error("Owner, repo, and issue_number are required");
    const response = await this.octokit.issues.update({
      owner: args.owner,
      repo: args.repo,
      issue_number: args.issue_number,
      state: 'closed'
    });
    return {
      success: true,
      action: "close_issue",
      issue: response.data,
      message: `Issue #${args.issue_number} closed successfully`
    };
  }

  /**
   * Lists issues in a repository.
   * @param args - Owner, repo, state, page, perPage.
   * @returns List of issues.
   * @throws Error on 403 if unauthorized.
   * Required scopes: repo
   */
  private async listIssues(args: any) {
    if (!args.owner || !args.repo) throw new Error("Owner and repo are required");
    const response = await this.octokit.paginate(this.octokit.issues.listForRepo, {
      owner: args.owner,
      repo: args.repo,
      state: args.state || 'open',
      page: args.page,
      per_page: args.perPage
    });
    return {
      success: true,
      action: "list_issues",
      issues: response,
      count: response.length
    };
  }

  /**
   * Retrieves an issue's details.
   * @param args - Owner, repo, issue_number.
   * @returns Issue data.
   * @throws Error on 404 if issue not found.
   * Required scopes: repo
   */
  private async getIssue(args: any) {
    if (!args.owner || !args.repo || !args.issue_number) throw new Error("Owner, repo, and issue_number are required");
    const response = await this.octokit.issues.get({
      owner: args.owner,
      repo: args.repo,
      issue_number: args.issue_number
    });
    return {
      success: true,
      action: "get_issue",
      issue: response.data
    };
  }

  /**
   * Adds a comment to an issue.
   * @param args - Owner, repo, issue_number, body.
   * @returns Comment data.
   * @throws Error on 404 if issue not found.
   * Required scopes: repo
   */
  private async addIssueComment(args: any) {
    if (!args.owner || !args.repo || !args.issue_number || !args.body) throw new Error("Owner, repo, issue_number, and body are required");
    const response = await this.octokit.issues.createComment({
      owner: args.owner,
      repo: args.repo,
      issue_number: args.issue_number,
      body: args.body
    });
    return {
      success: true,
      action: "add_issue_comment",
      comment: response.data,
      message: `Comment added to issue #${args.issue_number}`
    };
  }

  /**
   * Creates a pull request.
   * @param args - Owner, repo, title, body, head, base, draft.
   * @returns Pull request data.
   * @throws Error on 422 if branches invalid.
   * Required scopes: repo
   */
  private async createPullRequest(args: any) {
    if (!args.owner || !args.repo || !args.title || !args.head || !args.base) throw new Error("Owner, repo, title, head, and base are required");
    const response = await this.octokit.pulls.create({
      owner: args.owner,
      repo: args.repo,
      title: args.title,
      body: args.body,
      head: args.head,
      base: args.base,
      draft: args.draft ?? false
    });
    return {
      success: true,
      action: "create_pull_request",
      pullRequest: response.data,
      message: `Pull request #${response.data.number} created successfully`
    };
  }

  /**
   * Updates a pull request.
   * @param args - Owner, repo, pull_number, title, body, state.
   * @returns Updated pull request data.
   * @throws Error on 404 if PR not found.
   * Required scopes: repo
   */
  private async updatePullRequest(args: any) {
    if (!args.owner || !args.repo || !args.pull_number) throw new Error("Owner, repo, and pull_number are required");
    const response = await this.octokit.pulls.update({
      owner: args.owner,
      repo: args.repo,
      pull_number: args.pull_number,
      title: args.title,
      body: args.body,
      state: args.state
    });
    return {
      success: true,
      action: "update_pull_request",
      pullRequest: response.data,
      message: `Pull request #${args.pull_number} updated successfully`
    };
  }

  /**
   * Merges a pull request.
   * @param args - Owner, repo, pull_number, title, message.
   * @returns Merge data.
   * @throws Error on 409 if merge conflicts.
   * Required scopes: repo
   */
  private async mergePullRequest(args: any) {
    if (!args.owner || !args.repo || !args.pull_number) throw new Error("Owner, repo, and pull_number are required");
    const response = await this.octokit.pulls.merge({
      owner: args.owner,
      repo: args.repo,
      pull_number: args.pull_number,
      commit_title: args.title,
      commit_message: args.message
    });
    return {
      success: true,
      action: "merge_pull_request",
      merge: response.data,
      message: `Pull request #${args.pull_number} merged successfully`
    };
  }

  /**
   * Closes a pull request.
   * @param args - Owner, repo, pull_number.
   * @returns Closed pull request data.
   * @throws Error on 404 if PR not found.
   * Required scopes: repo
   */
  private async closePullRequest(args: any) {
    if (!args.owner || !args.repo || !args.pull_number) throw new Error("Owner, repo, and pull_number are required");
    const response = await this.octokit.pulls.update({
      owner: args.owner,
      repo: args.repo,
      pull_number: args.pull_number,
      state: 'closed'
    });
    return {
      success: true,
      action: "close_pull_request",
      pullRequest: response.data,
      message: `Pull request #${args.pull_number} closed successfully`
    };
  }

  /**
   * Lists pull requests in a repository.
   * @param args - Owner, repo, state, page, perPage.
   * @returns List of pull requests.
   * @throws Error on 403 if unauthorized.
   * Required scopes: repo
   */
  private async listPullRequests(args: any) {
    if (!args.owner || !args.repo) throw new Error("Owner and repo are required");
    const response = await this.octokit.paginate(this.octokit.pulls.list, {
      owner: args.owner,
      repo: args.repo,
      state: args.state || 'open',
      page: args.page,
      per_page: args.perPage
    });
    return {
      success: true,
      action: "list_pull_requests",
      pullRequests: response,
      count: response.length
    };
  }

  /**
   * Retrieves a pull request's details.
   * @param args - Owner, repo, pull_number.
   * @returns Pull request data.
   * @throws Error on 404 if PR not found.
   * Required scopes: repo
   */
  private async getPullRequest(args: any) {
    if (!args.owner || !args.repo || !args.pull_number) throw new Error("Owner, repo, and pull_number are required");
    const response = await this.octokit.pulls.get({
      owner: args.owner,
      repo: args.repo,
      pull_number: args.pull_number
    });
    return {
      success: true,
      action: "get_pull_request",
      pullRequest: response.data
    };
  }

  /**
   * Creates a release.
   * @param args - Owner, repo, tag, title, body, draft, prerelease, generateReleaseNotes.
   * @returns Release data.
   * @throws Error on 422 if tag invalid.
   * Required scopes: repo
   */
  private async createRelease(args: any) {
    if (!args.owner || !args.repo || !args.tag) throw new Error("Owner, repo, and tag are required");
    const response = await this.octokit.repos.createRelease({
      owner: args.owner,
      repo: args.repo,
      tag_name: args.tag,
      name: args.title,
      body: args.body,
      draft: args.draft ?? false,
      prerelease: args.prerelease ?? false,
      generate_release_notes: args.generateReleaseNotes ?? false
    });
    return {
      success: true,
      action: "create_release",
      release: response.data,
      message: `Release ${args.tag} created successfully`
    };
  }

  /**
   * Updates a release.
   * @param args - Owner, repo, release_id, title, body, draft, prerelease.
   * @returns Updated release data.
   * @throws Error on 404 if release not found.
   * Required scopes: repo
   */
  private async updateRelease(args: any) {
    if (!args.owner || !args.repo || !args.release_id) throw new Error("Owner, repo, and release_id are required");
    const response = await this.octokit.repos.updateRelease({
      owner: args.owner,
      repo: args.repo,
      release_id: args.release_id,
      name: args.title,
      body: args.body,
      draft: args.draft,
      prerelease: args.prerelease
    });
    return {
      success: true,
      action: "update_release",
      release: response.data,
      message: `Release updated successfully`
    };
  }

  /**
   * Deletes a release.
   * @param args - Owner, repo, release_id.
   * @returns Success message.
   * @throws Error on 404 if release not found.
   * Required scopes: repo
   */
  private async deleteRelease(args: any) {
    if (!args.owner || !args.repo || !args.release_id) throw new Error("Owner, repo, and release_id are required");
    await this.octokit.repos.deleteRelease({
      owner: args.owner,
      repo: args.repo,
      release_id: args.release_id
    });
    return {
      success: true,
      action: "delete_release",
      message: `Release deleted successfully`
    };
  }

  /**
   * Lists releases in a repository.
   * @param args - Owner, repo, page, perPage.
   * @returns List of releases.
   * @throws Error on 403 if unauthorized.
   * Required scopes: repo
   */
  private async listReleases(args: any) {
    if (!args.owner || !args.repo) throw new Error("Owner and repo are required");
    const response = await this.octokit.paginate(this.octokit.repos.listReleases, {
      owner: args.owner,
      repo: args.repo,
      page: args.page,
      per_page: args.perPage
    });
    return {
      success: true,
      action: "list_releases",
      releases: response,
      count: response.length
    };
  }

  /**
   * Retrieves a release's details.
   * @param args - Owner, repo, release_id.
   * @returns Release data.
   * @throws Error on 404 if release not found.
   * Required scopes: repo
   */
  private async getRelease(args: any) {
    if (!args.owner || !args.repo || !args.release_id) throw new Error("Owner, repo, and release_id are required");
    const response = await this.octokit.repos.getRelease({
      owner: args.owner,
      repo: args.repo,
      release_id: args.release_id
    });
    return {
      success: true,
      action: "get_release",
      release: response.data
    };
  }

  /**
   * Retrieves user details.
   * @param args - Username (optional, defaults to authenticated user).
   * @returns User data.
   * @throws Error on 404 if user not found.
   * Required scopes: user (for authenticated user) or none (for public user data)
   */
  private async getUser(args: any) {
    const response = args.username 
      ? await this.octokit.users.getByUsername({ username: args.username })
      : await this.octokit.users.getAuthenticated();
    return {
      success: true,
      action: "get_user",
      user: response.data
    };
  }

  /**
   * Lists repositories for a user.
   * @param args - Username, page, perPage.
   * @returns List of repositories.
   * @throws Error on 403 if unauthorized.
   * Required scopes: repo
   */
  private async listUserRepositories(args: any) {
    if (!args.username) throw new Error("Username is required");
    const response = await this.octokit.paginate(this.octokit.repos.listForUser, {
      username: args.username,
      page: args.page,
      per_page: args.perPage,
      sort: 'updated',
      direction: 'desc'
    });
    return {
      success: true,
      action: "list_user_repos",
      repositories: response,
      count: response.length
    };
  }

  /**
   * Retrieves organization details.
   * @param args - Owner (organization name).
   * @returns Organization data.
   * @throws Error on 404 if organization not found.
   * Required scopes: admin:org
   */
  private async getOrganization(args: any) {
    if (!args.owner) throw new Error("Owner is required");
    const response = await this.octokit.orgs.get({
      org: args.owner
    });
    return {
      success: true,
      action: "get_organization",
      organization: response.data
    };
  }

  /**
   * Lists repositories for an organization.
   * @param args - Owner (organization), page, perPage.
   * @returns List of repositories.
   * @throws Error on 403 if unauthorized.
   * Required scopes: repo
   */
  private async listOrganizationRepositories(args: any) {
    if (!args.owner) throw new Error("Owner is required");
    const response = await this.octokit.paginate(this.octokit.repos.listForOrg, {
      org: args.owner,
      page: args.page,
      per_page: args.perPage,
      sort: 'updated',
      direction: 'desc'
    });
    return {
      success: true,
      action: "list_org_repos",
      repositories: response,
      count: response.length
    };
  }

  /**
   * Adds a collaborator to a repository.
   * @param args - Owner, repo, username, permission.
   * @returns Success message.
   * @throws Error on 403 if unauthorized or 422 if invalid.
   * Required scopes: repo
   */
  private async addCollaborator(args: any) {
    if (!args.owner || !args.repo || !args.username) throw new Error("Owner, repo, and username are required");
    await this.octokit.repos.addCollaborator({
      owner: args.owner,
      repo: args.repo,
      username: args.username,
      permission: args.permission || 'push'
    });
    return {
      success: true,
      action: "add_collaborator",
      message: `User ${args.username} added as collaborator with ${args.permission || 'push'} permission`
    };
  }

  /**
   * Removes a collaborator from a repository.
   * @param args - Owner, repo, username.
   * @returns Success message.
   * @throws Error on 403 if unauthorized.
   * Required scopes: repo
   */
  private async removeCollaborator(args: any) {
    if (!args.owner || !args.repo || !args.username) throw new Error("Owner, repo, and username are required");
    await this.octokit.repos.removeCollaborator({
      owner: args.owner,
      repo: args.repo,
      username: args.username
    });
    return {
      success: true,
      action: "remove_collaborator",
      message: `User ${args.username} removed as collaborator`
    };
  }

  /**
   * Lists collaborators in a repository.
   * @param args - Owner, repo, page, perPage.
   * @returns List of collaborators.
   * @throws Error on 403 if unauthorized.
   * Required scopes: repo
   */
  private async listCollaborators(args: any) {
    if (!args.owner || !args.repo) throw new Error("Owner and repo are required");
    const response = await this.octokit.paginate(this.octokit.repos.listCollaborators, {
      owner: args.owner,
      repo: args.repo,
      page: args.page,
      per_page: args.perPage
    });
    return {
      success: true,
      action: "list_collaborators",
      collaborators: response,
      count: response.length
    };
  }

  /**
   * Creates a webhook for a repository.
   * @param args - Owner, repo, webhookUrl, webhookEvents.
   * @returns Webhook data.
   * @throws Error on 422 if invalid URL or events.
   * Required scopes: repo:hook
   */
  private async createWebhook(args: any) {
    if (!args.owner || !args.repo || !args.webhookUrl) throw new Error("Owner, repo, and webhookUrl are required");
    const response = await this.octokit.repos.createWebhook({
      owner: args.owner,
      repo: args.repo,
      config: {
        url: args.webhookUrl,
        content_type: 'json'
      },
      events: args.webhookEvents || ['push']
    });
    return {
      success: true,
      action: "create_webhook",
      webhook: response.data,
      message: `Webhook created successfully with ID ${response.data.id}`
    };
  }

  /**
   * Deletes a webhook.
   * @param args - Owner, repo, hook_id.
   * @returns Success message.
   * @throws Error on 404 if webhook not found.
   * Required scopes: repo:hook
   */
  private async deleteWebhook(args: any) {
    if (!args.owner || !args.repo || !args.hook_id) throw new Error("Owner, repo, and hook_id are required");
    await this.octokit.repos.deleteWebhook({
      owner: args.owner,
      repo: args.repo,
      hook_id: args.hook_id
    });
    return {
      success: true,
      action: "delete_webhook",
      message: `Webhook ${args.hook_id} deleted successfully`
    };
  }

  /**
   * Lists webhooks in a repository.
   * @param args - Owner, repo, page, perPage.
   * @returns List of webhooks.
   * @throws Error on 403 if unauthorized.
   * Required scopes: repo:hook
   */
  private async listWebhooks(args: any) {
    if (!args.owner || !args.repo) throw new Error("Owner and repo are required");
    const response = await this.octokit.paginate(this.octokit.repos.listWebhooks, {
      owner: args.owner,
      repo: args.repo,
      page: args.page,
      per_page: args.perPage
    });
    return {
      success: true,
      action: "list_webhooks",
      webhooks: response,
      count: response.length
    };
  }
}