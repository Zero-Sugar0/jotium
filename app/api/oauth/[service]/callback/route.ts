//app/api/oauth/[service]/callback/route.ts

import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { saveOAuthConnection } from "@/db/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: { service: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { service } = params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const storedState = request.cookies.get(`oauth_state_${service}`)?.value;

  // Handle OAuth errors
  if (error) {
    console.error(`OAuth ${service} error:`, error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_error=true`);
  }

  if (!code || !state || state !== storedState) {
    console.error(`OAuth ${service} state mismatch or missing code:`, { code: !!code, state, storedState });
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_error=true`);
  }

  // Ensure NEXTAUTH_URL doesn't have trailing slash
  const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, '');
  const redirectUri = `${baseUrl}/api/oauth/${service}/callback`;
  
  let tokenUrl = "";
  let clientId: string | undefined;
  let clientSecret: string | undefined;
  let userInfoUrl = "";
  let tokenRequestBody: URLSearchParams;
  let headers: HeadersInit = {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  };

  switch (service) {
    case "gmail":
      clientId = process.env.GOOGLE_CLIENT_ID;
      clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      tokenUrl = "https://oauth2.googleapis.com/token";
      userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
      tokenRequestBody = new URLSearchParams({
        code: code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });
      break;

    case "github":
      clientId = process.env.GITHUB_CLIENT_ID;
      clientSecret = process.env.GITHUB_CLIENT_SECRET;
      tokenUrl = "https://github.com/login/oauth/access_token";
      userInfoUrl = "https://api.github.com/user";
      tokenRequestBody = new URLSearchParams({
        client_id: clientId || "",
        client_secret: clientSecret || "",
        code: code,
        redirect_uri: redirectUri,
      });
      headers["Accept"] = "application/json";
      break;

    case "slack":
      clientId = process.env.SLACK_CLIENT_ID;
      clientSecret = process.env.SLACK_CLIENT_SECRET;
      tokenUrl = "https://slack.com/api/oauth.v2.access";
      userInfoUrl = "https://slack.com/api/users.identity";
      tokenRequestBody = new URLSearchParams({
        client_id: clientId || "",
        client_secret: clientSecret || "",
        code: code,
        redirect_uri: redirectUri,
      });
      break;

    case "x":
      clientId = process.env.X_CLIENT_ID;
      clientSecret = process.env.X_CLIENT_SECRET;
      tokenUrl = "https://api.x.com/2/oauth2/token";
      userInfoUrl = "https://api.x.com/2/users/me";
      tokenRequestBody = new URLSearchParams({
        code: code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code_verifier: "challenge",
      });
      headers["Authorization"] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
      break;

    case "clickup":
      clientId = process.env.CLICKUP_CLIENT_ID;
      clientSecret = process.env.CLICKUP_CLIENT_SECRET;
      tokenUrl = "https://api.clickup.com/api/v2/oauth/token";
      userInfoUrl = "https://api.clickup.com/api/v2/user"; // ClickUp user info endpoint
      tokenRequestBody = new URLSearchParams({
        client_id: clientId || "",
        client_secret: clientSecret || "",
        code: code,
        redirect_uri: redirectUri,
      });
      break;

    case "asana":
      clientId = process.env.ASANA_CLIENT_ID;
      clientSecret = process.env.ASANA_CLIENT_SECRET;
      tokenUrl = "https://app.asana.com/-/oauth_token";
      userInfoUrl = "https://app.asana.com/api/1.0/users/me";
      tokenRequestBody = new URLSearchParams({
        code: code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });
      break;

    case "discord":
      clientId = process.env.DISCORD_CLIENT_ID;
      clientSecret = process.env.DISCORD_CLIENT_SECRET;
      tokenUrl = "https://discord.com/api/v10/oauth2/token";
      userInfoUrl = "https://discord.com/api/v10/users/@me";
      tokenRequestBody = new URLSearchParams({
        code: code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });
      break;

    case "hubspot":
      clientId = process.env.HUBSPOT_CLIENT_ID;
      clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
      tokenUrl = "https://api.hubapi.com/oauth/v1/token";
      userInfoUrl = "https://api.hubapi.com/oauth/v1/me";
      tokenRequestBody = new URLSearchParams({
        code: code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });
      break;

    case "linkedin":
      clientId = process.env.LINKEDIN_CLIENT_ID;
      clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
      tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
      userInfoUrl = "https://api.linkedin.com/v2/userinfo";
      tokenRequestBody = new URLSearchParams({
        grant_type: "refresh_token",
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId || "",
        client_secret: clientSecret || "",
      });
      break;

    case "quickbooks":
      clientId = process.env.QUICKBOOKS_CLIENT_ID;
      clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
      tokenUrl = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
      userInfoUrl = "https://sandbox-quickbooks.api.intuit.com/v3/company/{companyId}/companyinfo/{companyId}";
      tokenRequestBody = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId || "",
        client_secret: clientSecret || "",
      });
      break;

    default:
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_error=true`);
  }

  if (!clientId || !clientSecret) {
    console.error(`Missing client ID or secret for ${service}`);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_error=true`);
  }

  try {
    console.log(`Exchanging code for tokens with ${service}...`);
    console.log(`Token URL: ${tokenUrl}`);
    // console.log(`Redirect URI: ${redirectUri}`);

    // Exchange code for tokens
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: headers,
      body: tokenRequestBody,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`Failed to get tokens for ${service}:`, {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        body: errorText,
      });
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_error=true`);
    }

    const tokenData = await tokenResponse.json();
    console.log(`Token exchange successful for ${service}`);

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in;
    
    // ENSURE: Never expire tokens - set expiresAt to null to prevent auto-expiration
    // This ensures credentials remain valid until user manually disconnects
    const expiresAt: Date | null = null;
    
    const scope = tokenData.scope;

    if (!accessToken) {
      console.error(`No access token received for ${service}`);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_error=true`);
    }

    // Fetch user info
    let externalUserId: string = "";
    let externalUserName: string | undefined = undefined;

    if (service === "gmail") {
      const userRes = await fetch(userInfoUrl, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json"
        },
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        externalUserId = userData.id;
        externalUserName = userData.email || userData.name;
      }
    } else if (service === "github") {
      const userRes = await fetch(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "OAuth-App",
          Accept: "application/vnd.github.v3+json"
        },
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        externalUserId = userData.id.toString();
        externalUserName = userData.email || userData.login;
      }
    } else if (service === "x") {
      const userRes = await fetch(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        externalUserId = userData.data.id;
        externalUserName = userData.data.username;
      }
    } else if (service === "slack") {
      const userRes = await fetch(userInfoUrl, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json"
        },
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.ok) {
          externalUserId = userData.user?.id || tokenData.authed_user?.id;
          externalUserName = userData.user?.email || userData.user?.name || tokenData.authed_user?.id;
        }
      }
      
      if (!externalUserId && tokenData.team?.id) {
        externalUserId = tokenData.team.id;
        externalUserName = tokenData.team.name;
      }
    } else if (service === "clickup") {
      const userRes = await fetch(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        externalUserId = userData.user.id.toString();
        externalUserName = userData.user.username;
      }
    } else if (service === "hubspot") {
      const userRes = await fetch(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        externalUserId = userData.user_id;
        externalUserName = userData.email;
      }
    } else if ((service as string) === "calendly") {
      const userRes = await fetch("https://api.calendly.com/users/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        externalUserId = userData.resource.uri; // Calendly uses URI as ID
        externalUserName = userData.resource.name;
      }
    } else if ((service as string) === "asana") {
      const userRes = await fetch("https://app.asana.com/api/1.0/users/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        externalUserId = userData.data.gid; // Asana uses gid as ID
        externalUserName = userData.data.name || userData.data.email;
      }
    } else if (service === "linkedin") {
      const userRes = await fetch(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        externalUserId = userData.sub; // LinkedIn uses 'sub' as the user ID
        externalUserName = userData.name || userData.email;
      }
    }

    if (!externalUserId) {
      console.error(`Could not retrieve external user ID for ${service}`);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_error=true`);
    }

    // Save connection with permanent credentials (never expires)
    await saveOAuthConnection({
      userId: session.user.id,
      service,
      accessToken,
      refreshToken,
      expiresAt: null, // ENSURE: Never expire tokens
      scope,
      externalUserId,
      externalUserName,
    });

    console.log(`Permanent OAuth connection saved for ${service} with ${refreshToken ? 'refresh token' : 'no refresh token'}`);

    // Clear the state cookie
    const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_success=true`);
    response.cookies.delete(`oauth_state_${service}`);
    
    // Revalidate the account page
    revalidatePath("/account");

    return response;
  } catch (error) {
    console.error(`OAuth callback error for ${service}:`, error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_error=true`);
  }
}
