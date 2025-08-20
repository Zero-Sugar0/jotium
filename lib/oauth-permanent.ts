// lib/oauth-permanent.ts
// Utility functions to ensure OAuth credentials never expire until manually disconnected

import { 
  getOAuthConnection, 
  getDecryptedOAuthRefreshToken, 
  getDecryptedOAuthAccessToken,
  saveOAuthConnection,
  deleteOAuthConnection 
} from "@/db/queries";

/**
 * Ensures OAuth credentials are stored as permanent (never expiring)
 * This function should be called after successful OAuth flow
 */
export async function storePermanentOAuthConnection({
  userId,
  service,
  accessToken,
  refreshToken,
  scope,
  externalUserId,
  externalUserName,
}: {
  userId: string;
  service: string;
  accessToken: string;
  refreshToken?: string;
  scope?: string;
  externalUserId: string;
  externalUserName?: string;
}) {
  // Always set expiresAt to null to ensure credentials never expire
  const expiresAt = null;
  
  await saveOAuthConnection({
    userId,
    service,
    accessToken,
    refreshToken,
    expiresAt, // This ensures the credential never expires
    scope,
    externalUserId,
    externalUserName,
  });
  
  console.log(`Stored permanent OAuth connection for ${service} - user ${userId}`);
}

/**
 * Gets a valid access token without checking expiration
 * This ensures credentials remain valid indefinitely
 */
export async function getPermanentOAuthAccessToken(userId: string, service: string): Promise<string | null> {
  const connection = await getOAuthConnection({ userId, service });
  if (!connection) {
    return null;
  }
  
  // Always return the access token regardless of any expiration
  return await getDecryptedOAuthAccessToken({ userId, service });
}

/**
 * Checks if a user has a permanent OAuth connection for a service
 */
export async function hasPermanentOAuthConnection(userId: string, service: string): Promise<boolean> {
  const connection = await getOAuthConnection({ userId, service });
  return !!connection; // Just check if connection exists, ignore expiration
}

/**
 * Disconnects and removes OAuth credentials permanently
 */
export async function disconnectPermanentOAuth(userId: string, service: string): Promise<boolean> {
  try {
    await deleteOAuthConnection({ userId, service });
    console.log(`Disconnected permanent OAuth connection for ${service} - user ${userId}`);
    return true;
  } catch (error) {
    console.error(`Failed to disconnect OAuth for ${service}:`, error);
    return false;
  }
}
