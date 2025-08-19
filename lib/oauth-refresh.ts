//lib/oauth-refresh.ts

import { 
  getOAuthConnection, 
  getDecryptedOAuthRefreshToken, 
  getDecryptedOAuthAccessToken,
  saveOAuthConnection,
  deleteOAuthConnection 
} from "@/db/queries";

interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
}

export async function refreshOAuthToken(userId: string, service: string): Promise<string | null> {
  try {
    const connection = await getOAuthConnection({ userId, service });
    if (!connection) {
      console.log(`No OAuth connection found for user ${userId}, service ${service}`);
      return null;
    }

    const refreshToken = await getDecryptedOAuthRefreshToken({ userId, service });
    if (!refreshToken) {
      console.log(`No refresh token available for user ${userId}, service ${service}`);
      return null;
    }

    console.log(`Attempting to refresh token for ${service}`);

    let tokenUrl = "";
    let clientId: string | undefined;
    let clientSecret: string | undefined;
    let tokenRequestBody: URLSearchParams;
    let headers: HeadersInit = {
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, '');
    const redirectUri = `${baseUrl}/api/oauth/${service}/callback`;

    switch (service) {
      case "gmail":
        clientId = process.env.GOOGLE_CLIENT_ID;
        clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        tokenUrl = "https://oauth2.googleapis.com/token";
        tokenRequestBody = new URLSearchParams({
          client_id: clientId || "",
          client_secret: clientSecret || "",
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        });
        break;

      case "github":
        // GitHub tokens don't expire and don't have refresh tokens
        console.log("GitHub tokens don't expire, returning existing token");
        return await getDecryptedOAuthAccessToken({ userId, service });

      case "slack":
        // Slack tokens typically don't expire, but if they do:
        clientId = process.env.SLACK_CLIENT_ID;
        clientSecret = process.env.SLACK_CLIENT_SECRET;
        tokenUrl = "https://slack.com/api/oauth.v2.access";
        tokenRequestBody = new URLSearchParams({
          client_id: clientId || "",
          client_secret: clientSecret || "",
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        });
        break;

      case "x":
        clientId = process.env.X_CLIENT_ID;
        clientSecret = process.env.X_CLIENT_SECRET;
        tokenUrl = "https://api.x.com/2/oauth2/token";
        tokenRequestBody = new URLSearchParams({
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        });
        headers["Authorization"] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
        break;

      default:
        console.error(`Unsupported service for token refresh: ${service}`);
        return null;
    }

    if (!clientId || !clientSecret) {
      console.error(`Missing client credentials for ${service} refresh`);
      return null;
    }

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: headers,
      body: tokenRequestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to refresh token for ${service}:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      
      // If refresh fails, the token might be permanently invalid
      // Consider whether to delete the connection or just log the error
      if (response.status === 400 || response.status === 401) {
        console.log(`Refresh token invalid for ${service}, may need re-authentication`);
        // Optionally delete the connection:
        // await deleteOAuthConnection({ userId, service });
      }
      
      return null;
    }

    const tokenData: RefreshTokenResponse = await response.json();
    console.log(`Token refresh successful for ${service}`);

    const newAccessToken = tokenData.access_token;
    const newRefreshToken = tokenData.refresh_token || refreshToken; // Use new refresh token or keep the old one
    const expiresIn = tokenData.expires_in;
    
    // Set far future expiration or null
    let expiresAt: Date | null = null;
    if (expiresIn) {
      // Set expiration far in the future to avoid frequent refreshes
      expiresAt = null; // or new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)); // 1 year
    }

    // Update the connection with new tokens
    await saveOAuthConnection({
      userId,
      service,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt,
      scope: tokenData.scope || connection.scope || undefined,
      externalUserId: connection.externalUserId,
      externalUserName: connection.externalUserName || undefined,
    });

    console.log(`Updated OAuth connection for ${service} with refreshed tokens`);
    return newAccessToken;

  } catch (error) {
    console.error(`Error refreshing OAuth token for ${service}:`, error);
    return null;
  }
}

// Helper function to get a valid access token (refresh if needed)
export async function getValidOAuthAccessToken(userId: string, service: string): Promise<string | null> {
  const connection = await getOAuthConnection({ userId, service });
  if (!connection) {
    return null;
  }

  // Check if token is expired (if expiration is set)
  const now = new Date();
  const needsRefresh = connection.expiresAt && connection.expiresAt <= now;

  if (needsRefresh) {
    console.log(`Token expired for ${service}, attempting refresh`);
    return await refreshOAuthToken(userId, service);
  }

  // Token is still valid, return it
  return await getDecryptedOAuthAccessToken({ userId, service });
}
