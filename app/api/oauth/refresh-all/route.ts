import { NextRequest, NextResponse } from "next/server";

import { listAllOAuthConnections } from "@/db/queries";
import { OAuthConnection } from "@/db/schema";
import { refreshOAuthToken } from "@/lib/oauth-refresh";

export async function GET(request: NextRequest) {
  // IMPORTANT: Implement authentication/authorization for this endpoint
  // This endpoint should only be accessible by your cron job or authorized internal services.
  // For example, you might check for a secret header or IP whitelist.
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    console.log("Starting proactive OAuth token refresh for all connections...");
    const allConnections = await listAllOAuthConnections();

    const refreshPromises = allConnections.map(async (connection: OAuthConnection) => {
      try {
        const newAccessToken = await refreshOAuthToken(connection.userId, connection.service);
        if (newAccessToken) {
          console.log(`Successfully refreshed token for user ${connection.userId}, service ${connection.service}`);
        } else {
          console.warn(`Failed to refresh token for user ${connection.userId}, service ${connection.service}. May require re-authentication.`);
        }
      } catch (error) {
        console.error(`Error refreshing token for user ${connection.userId}, service ${connection.service}:`, error);
      }
    });

    await Promise.allSettled(refreshPromises);

    console.log("Finished proactive OAuth token refresh.");
    return NextResponse.json({ message: "OAuth tokens refresh initiated successfully." });
  } catch (error) {
    console.error("Failed to initiate proactive OAuth token refresh:", error);
    return new Response("Failed to initiate OAuth token refresh", { status: 500 });
  }
}
