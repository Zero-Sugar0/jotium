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
  console.log("DEBUG: NEXTAUTH_URL in initiate route:", nextAuthUrl);
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
        "https://www.googleapis.com/auth/spreadsheets"
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
      // Slack tokens typically don't expire
      scope = "users:read users:read.email channels:read chat:write";
      if (!clientId) {
        console.error("SLACK_CLIENT_ID environment variable is not set.");
        return new Response("Slack OAuth configuration error", { status: 500 });
      }
      
      const slackParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scope,
        state: state,
        user_scope: "identity.basic,identity.email"
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

    default:
      return new Response("Unsupported OAuth service", { status: 400 });
  }

  console.log(`OAuth ${service} redirect URI:`, redirectUri);
  console.log(`OAuth ${service} authorization URL:`, authorizationUrl);
  console.log(`OAuth ${service} scopes requested:`, scope);

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
