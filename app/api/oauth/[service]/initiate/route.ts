//app/api/oauth/[service]/initiate/route.ts
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { service: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { service } = params;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  // console.log("DEBUG: NEXTAUTH_URL in initiate route:", nextAuthUrl);
  if (!nextAuthUrl) {
    console.error("NEXTAUTH_URL environment variable is not set.");
    return new Response("Server configuration error", { status: 500 });
  }

  // Ensure NEXTAUTH_URL doesn't have trailing slash
  const baseUrl = nextAuthUrl.replace(/\/$/, '');
  const redirectUri = `${baseUrl}/api/oauth/${service}/callback`;
  
  // Generate secure state parameter
  const state = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  let authorizationUrl = "";
  let clientId: string | undefined;
  let scope: string | undefined;

  switch (service) {
    case "gmail":
      clientId = process.env.GOOGLE_CLIENT_ID;
      // Updated scopes for Google OAuth 2.0
      scope = [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/documents"
      ].join(" ");
      if (!clientId) {
        console.error("GOOGLE_CLIENT_ID environment variable is not set.");
        return new Response("Google OAuth configuration error", { status: 500 });
      }
      
      const googleParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: scope,
        access_type: "offline", // ENSURE: Always get refresh token
        prompt: "consent",    // ENSURE: Force consent to ensure refresh token
        state: state,
        include_granted_scopes: "true"
        // REMOVED: approval_prompt: "force" - conflicts with prompt parameter
      });
      
      authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?${googleParams.toString()}`;
      break;

    case "github":
      clientId = process.env.GITHUB_CLIENT_ID;
      // GitHub tokens don't expire by default
      scope = [
        "user:email",
        "repo",
        "repo:status",
        "repo_deployment",
        "public_repo",
        "admin:repo_hook",
        "admin:org",
        "admin:org_hook",
        "admin:public_key",
        "admin:ssh_signing_key",
        "admin:gpg_key",
        "write:packages",
        "read:packages",
        "delete:packages",
        "admin:packages",
        "gist",
        "notifications",
        "user",
        "write:org",
        "read:org",
        "admin:org",
        "codespace",
        "security_events",
        "actions:read",
        "actions:write",
        "actions:admin",
        "workflow",
        "admin:enterprise",
        "manage_runners:enterprise",
        "manage_billing:enterprise",
        "read:enterprise",
        "write:enterprise",
        "admin:enterprise",
        "manage_runners:org",
        "manage_billing:org",
        "read:org",
        "write:org",
        "admin:org",
        "manage_billing:user",
        "read:user",
        "write:user",
        "admin:user"
      ].join(" ");
      if (!clientId) {
        console.error("GITHUB_CLIENT_ID environment variable is not set.");
        return new Response("GitHub OAuth configuration error", { status: 500 });
      }
      
      const githubParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scope,
        state: state,
        allow_signup: "true"
      });
      
      authorizationUrl = `https://github.com/login/oauth/authorize?${githubParams.toString()}`;
      break;

    case "slack":
      clientId = process.env.SLACK_CLIENT_ID;
      // Comprehensive Slack scopes for full functionality
      scope = [
        // User management
        "users:read",
        "users:read.email",
        "users.profile:read",
        "users.profile:write",
        "users:write",
        
        // Channel management
        "channels:read",
        "channels:write",
        "channels:history",
        "channels:manage",
        "groups:read",
        "groups:write",
        "groups:history",
        "mpim:read",
        "mpim:write",
        "im:read",
        "im:write",
        "im:history",
        
        // Messaging
        "chat:write",
        "chat:write.public",
        "chat:write.customize",
        "chat:write.bot",
        
        // Reactions
        "reactions:read",
        "reactions:write",
        
        // Files
        "files:read",
        "files:write",
        "remote_files:read",
        "remote_files:write",
        
        // Search
        "search:read",
        
        // Team/Workspace
        "team:read",
        "team:write",
        
        // Apps & Integrations
        "apps:read",
        "apps:write",
        
        // Workflow & Automation
        "workflow.steps:execute",
        "workflow.steps:read",
        
        // Webhooks
        "incoming-webhook",
        
        // Analytics
        "analytics:read",
        
        // Bookmarks
        "bookmarks:read",
        "bookmarks:write",
        
        // Calls
        "calls:read",
        "calls:write",
        
        // Conversations
        "conversations:read",
        "conversations:write",
        
        // Emoji
        "emoji:read",
        
        // Links
        "links:read",
        "links:write",
        
        // Pins
        "pins:read",
        "pins:write",
        
        // Reminders
        "reminders:read",
        "reminders:write",
        
        // Stars
        "stars:read",
        "stars:write",
        
        // User groups
        "usergroups:read",
        "usergroups:write",
        
        // Admin (if needed)
        "admin",
        "admin.analytics:read",
        "admin.apps:read",
        "admin.apps:write",
        "admin.conversations:read",
        "admin.conversations:write",
        "admin.invites:read",
        "admin.invites:write",
        "admin.teams:read",
        "admin.teams:write",
        "admin.usergroups:read",
        "admin.usergroups:write",
        "admin.users:read",
        "admin.users:write"
      ].join(" ");
      if (!clientId) {
        console.error("SLACK_CLIENT_ID environment variable is not set.");
        return new Response("Slack OAuth configuration error", { status: 500 });
      }
      
      const slackParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scope,
        state: state,
        user_scope: "identity.basic,identity.email,users.profile:read,users.profile:write"
      });
      
      authorizationUrl = `https://slack.com/oauth/v2/authorize?${slackParams.toString()}`;
      break;
    
    case "x":
      clientId = process.env.X_CLIENT_ID;
      // IMPORTANT: Added offline.access scope for refresh tokens
      scope = [
        "tweet.read",
        "tweet.write",
        "users.read",
        "follows.read",
        "follows.write",
        "like.read",
        "like.write",
        "list.read",
        "space.read",
        "mute.read",
        "mute.write",
        "block.read",
        "block.write",
        "bookmark.read",
        "bookmark.write",
        "offline.access"        // IMPORTANT: This enables refresh tokens
      ].join(" ");

      if (!clientId) {
        console.error("X_CLIENT_ID environment variable is not set.");
        return new Response("X OAuth configuration error", { status: 500 });
      }

      const xParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: scope,
        state: state,
        code_challenge_method: "plain",
        code_challenge: "challenge"
      });

      authorizationUrl = `https://x.com/i/oauth2/authorize?${xParams.toString()}`;
      break;

    case "clickup":
      clientId = process.env.CLICKUP_CLIENT_ID;
      scope = "read:tasks write:tasks read:goals write:goals read:comments write:comments read:teams write:teams read:spaces write:spaces read:folders write:folders read:lists write:lists read:views write:views read:time_tracking write:time_tracking read:webhooks write:webhooks";
      if (!clientId) {
        console.error("CLICKUP_CLIENT_ID environment variable is not set.");
        return new Response("ClickUp OAuth configuration error", { status: 500 });
      }

      const clickupParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: scope,
        state: state,
      });

      authorizationUrl = `https://app.clickup.com/api?${clickupParams.toString()}`;
      break;

    case "calendly":
      clientId = process.env.CALENDLY_CLIENT_ID;
      scope = [
        "read:events",
        "write:events",
        "read:scheduling_links",
        "write:scheduling_links",
        "read:organizations",
        "write:organizations",
        "read:users",
        "write:users",
        "read:invitations",
        "write:invitations",
        "read:event_types",
        "write:event_types",
        "read:availability",
        "write:availability",
        "read:webhooks",
        "write:webhooks",
        "read:activity_log",
        "read:routing_forms",
        "write:routing_forms",
        "read:data_compliance",
        "write:data_compliance",
        "read:scheduled_events",
        "write:scheduled_events",
        "read:invitees",
        "write:invitees",
        "read:custom_questions",
        "write:custom_questions",
        "read:availability_schedules",
        "write:availability_schedules",
        "read:organization_memberships",
        "write:organization_memberships",
        "read:organization_invitations",
        "write:organization_invitations"
      ].join(" ");
      if (!clientId) {
        console.error("CALENDLY_CLIENT_ID environment variable is not set.");
        return new Response("Calendly OAuth configuration error", { status: 500 });
      }

      const calendlyParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: scope,
        state: state,
      });

      authorizationUrl = `https://calendly.com/oauth/authorize?${calendlyParams.toString()}`;
      break;

    case "asana":
      clientId = process.env.ASANA_CLIENT_ID;
      scope = [
        "default",
        "tasks:read",
        "tasks:write",
        "projects:read",
        "projects:write",
        "workspaces:read",
        "workspaces:write",
        "teams:read",
        "teams:write",
        "users:read",
        "users:write",
        "attachments:read",
        "attachments:write",
        "tags:read",
        "tags:write",
        "webhooks:read",
        "webhooks:write",
        "portfolios:read",
        "portfolios:write",
        "goals:read",
        "goals:write",
        "custom_fields:read",
        "custom_fields:write"
      ].join(" ");
      if (!clientId) {
        console.error("ASANA_CLIENT_ID environment variable is not set.");
        return new Response("Asana OAuth configuration error", { status: 500 });
      }

      const asanaParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: scope,
        state: state,
      });

      authorizationUrl = `https://app.asana.com/-/oauth_authorize?${asanaParams.toString()}`;
      break;

    case "discord":
      clientId = process.env.DISCORD_CLIENT_ID;
      // Official Discord OAuth 2.0 scopes from Discord Developer Portal
      scope = [
        // Core user information
        "identify",           // Basic user info (username, avatar, etc.)
        "email",              // User's email address
        "connections",        // View linked third-party accounts
        "guilds",             // View user's guilds (servers)
        "guilds.join",        // Add user to a guild
        
        // Bot & Command functionality
        "applications.commands",                    // Register slash commands
        "applications.commands.permissions.update", // Modify command permissions in guilds
        
        // Webhook functionality
        "webhook.incoming"    // Create incoming webhooks
      ].join(" ");
      if (!clientId) {
        console.error("DISCORD_CLIENT_ID environment variable is not set.");
        return new Response("Discord OAuth configuration error", { status: 500 });
      }

      const discordParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: scope,
        state: state,
        prompt: "consent"
      });

      authorizationUrl = `https://discord.com/api/oauth2/authorize?${discordParams.toString()}`;
      break;

    case "hubspot":
      clientId = process.env.HUBSPOT_CLIENT_ID;
      scope = [
        "cms.domains.read",
        "cms.domains.write",
        "cms.functions.read",
        "cms.functions.write",
        "cms.knowledge_base.articles.read",
        "cms.knowledge_base.articles.write",
        "cms.knowledge_base.articles.publish",
        "cms.knowledge_base.settings.read",
        "cms.knowledge_base.settings.write",
        "cms.membership.access_groups.read",
        "cms.membership.access_groups.write",
        "crm.dealsplits.read_write",
        "crm.lists.read",
        "crm.lists.write",
        "crm.objects.appointments.read",
        "crm.objects.appointments.sensitive.read",
        "crm.objects.appointments.sensitive.write",
        "crm.objects.appointments.write",
        "crm.objects.carts.read",
        "crm.objects.carts.write",
        "crm.objects.commercepayments.read",
        "crm.objects.companies.highly_sensitive.read",
        "crm.objects.companies.highly_sensitive.write",
        "crm.objects.companies.read",
        "crm.objects.companies.sensitive.read",
        "crm.objects.companies.sensitive.write",
        "crm.objects.companies.write",
        "crm.objects.contacts.highly_sensitive.read",
        "crm.objects.contacts.highly_sensitive.write",
        "crm.objects.contacts.read",
        "crm.objects.contacts.sensitive.read",
        "crm.objects.contacts.sensitive.write",
        "crm.objects.contacts.write",
        "crm.objects.courses.read",
        "crm.objects.courses.write",
        "crm.objects.custom.highly_sensitive.read",
        "crm.objects.custom.highly_sensitive.write",
        "crm.objects.custom.read",
        "crm.objects.custom.sensitive.read",
        "crm.objects.custom.sensitive.write",
        "crm.objects.custom.write",
        "crm.objects.deals.highly_sensitive.read",
        "crm.objects.deals.highly_sensitive.write",
        "crm.objects.deals.read",
        "crm.objects.deals.sensitive.read",
        "crm.objects.deals.sensitive.write",
        "crm.objects.deals.write",
        "crm.objects.feedback_submission.read",
        "crm.objects.goals.read",
        "crm.objects.invoices.read",
        "crm.objects.leads.read",
        "crm.objects.leads.write",
        "crm.objects.line_items.read",
        "crm.objects.line_items.write",
        "crm.objects.listings.read",
        "crm.objects.listings.write",
        "crm.objects.marketing_events.read",
        "crm.objects.marketing_events.write",
        "crm.objects.orders.read",
        "crm.objects.orders.write",
        "crm.objects.owners.read",
        "crm.objects.partner-clients.read",
        "crm.objects.partner-clients.write",
        "crm.objects.partner-services.read",
        "crm.objects.partner-services.write",
        "crm.objects.quotes.read",
        "crm.objects.quotes.write",
        "crm.objects.services.read",
        "crm.objects.services.write",
        "crm.objects.subscriptions.read",
        "crm.objects.subscriptions.write",
        "crm.objects.users.read",
        "crm.objects.users.write",
        "crm.pipelines.orders.read",
        "crm.pipelines.orders.write",
        "crm.schemas.appointments.read",
        "crm.schemas.appointments.write",
        "crm.schemas.carts.read",
        "crm.schemas.carts.write",
        "crm.schemas.courses.read",
        "crm.schemas.courses.write",
        "crm.schemas.commercepayments.read",
        "crm.schemas.companies.read",
        "crm.schemas.companies.write",
        "crm.schemas.contacts.read",
        "crm.schemas.contacts.write",
        "crm.schemas.custom.read",
        "crm.schemas.deals.read",
        "crm.schemas.deals.write",
        "crm.schemas.invoices.read",
        "crm.schemas.invoices.write",
        "crm.schemas.line_items.read",
        "crm.schemas.listings.read",
        "crm.schemas.listings.write",
        "crm.schemas.orders.read",
        "crm.schemas.orders.write",
        "crm.schemas.quotes.read",
        "crm.schemas.services.read",
        "crm.schemas.services.write",
        "crm.schemas.subscriptions.read",
        "crm.schemas.subscriptions.write",
        "settings.billing.write",
        "settings.currencies.read",
        "settings.currencies.write",
        "settings.users.read",
        "settings.users.write",
        "settings.users.teams.read",
        "settings.users.team.write",
        "account-info.security.read",
        "accounting",
        "actions",
        "analytics.behavioral_events.send",
        "automation",
        "automation.sequences.enrollments.write",
        "automation.sequences.read",
        "behavioral_events.event_definitions.read_write",
        "business_units.view.read",
        "business-intelligence",
        "collector.graphql_query.execute",
        "collector.graphql_schema.read",
        "communication_preferences.read",
        "communication_preferences.read_write",
        "communication_preferences.statuses.batch.read",
        "communication_preferences.statuses.batch.write",
        "communication_preferences.write",
        "content",
        "conversations.read",
        "conversations.visitor_identification.tokens.create",
        "conversations.write",
        "conversations.custom_channels.read",
        "conversations.custom_channels.write",
        "crm.export",
        "crm.import",
        "ctas.read",
        "e-commerce",
        "external_integrations.forms.access",
        "files",
        "files.ui_hidden.read",
        "forms",
        "forms-uploaded-files",
        "hubdb",
        "integration-sync",
        "marketing.campaigns.read",
        "marketing.campaigns.revenue.read",
        "marketing.campaigns.write",
        "marketing-email",
        "media_bridge.read",
        "media_bridge.write",
        "oauth",
        "sales-email-read",
        "social",
        "scheduler.meetings.meeting-link.read",
        "tax_rates.read",
        "tickets",
        "tickets.highly_sensitive",
        "tickets.sensitive",
        "timeline",
        "transactional-email"
      ].join(" ");
      if (!clientId) {
        console.error("HUBSPOT_CLIENT_ID environment variable is not set.");
        return new Response("HubSpot OAuth configuration error", { status: 500 });
      }

      const hubspotParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: scope,
        state: state,
      });

      authorizationUrl = `https://app.hubspot.com/oauth/authorize?${hubspotParams.toString()}`;
      break;

    case "linkedin":
      clientId = process.env.LINKEDIN_CLIENT_ID;
      // Use only the specified scopes for LinkedIn OAuth
      scope = [
        "openid",
        "profile", 
        "email",
        "w_member_social"
      ].join(" ");
      
      if (!clientId) {
        console.error("LINKEDIN_CLIENT_ID environment variable is not set.");
        return new Response("LinkedIn OAuth configuration error", { status: 500 });
      }

      const linkedinParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: scope,
        state: state,
        access_type: "offline"  // Add offline access for refresh tokens
      });

      authorizationUrl = `https://www.linkedin.com/oauth/v2/authorization?${linkedinParams.toString()}`;
      break;

    default:
      return new Response("Unsupported OAuth service", { status: 400 });
  }

  // console.log(`OAuth ${service} redirect URI:`, redirectUri);
  // console.log(`OAuth ${service} authorization URL:`, authorizationUrl);
  // console.log(`OAuth ${service} scopes requested:`, scope);

  const response = NextResponse.redirect(authorizationUrl);
  
  // Set state cookie with proper security settings
  response.cookies.set(`oauth_state_${service}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: `/api/oauth/${service}/callback`,
  });

  return response;
}
