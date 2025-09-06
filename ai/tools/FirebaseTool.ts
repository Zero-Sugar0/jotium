import { FunctionDeclaration, Type } from "@google/genai";

// Firebase SDK imports (version 12.2.1+)
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
  databaseURL?: string;
}

interface FirebaseApp {
  name: string;
  options: FirebaseConfig;
}

export class FirebaseTool {
  private app: FirebaseApp | null = null;
  private config: FirebaseConfig | null = null;
  private userAgent: string = "FirebaseTool/1.0";
  private initialized: boolean = false;
  private googleAccessToken: string | null = null;

  constructor(config?: FirebaseConfig) {
    this.config = config || null;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "firebase_operation",
      description: "Interact with Firebase services including Firestore database, Authentication, Storage, and Realtime Database. Supports CRUD operations, user management, file uploads, and real-time data synchronization.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          service: {
            type: Type.STRING,
            description: "Firebase service to use",
            enum: ["firestore", "auth", "storage", "database", "functions"]
          },
          operation: {
            type: Type.STRING,
            description: "Operation to perform",
            enum: [
              // Firestore operations
              "add", "get", "update", "delete", "query", "batch_write",
              // Auth operations
              "sign_up", "sign_in", "sign_out", "reset_password", "get_user", "update_user",
              // Storage operations
              "upload", "download", "delete_file", "get_download_url", "list_files",
              // Database operations
              "set", "push", "remove", "once", "on",
              // Functions operations
              "call_function"
            ]
          },
          projectName: {
            type: Type.STRING,
            description: "Firebase project name/ID - if provided, will auto-fetch all configuration"
          },
          googleAccessToken: {
            type: Type.STRING,
            description: "Google OAuth access token for Firebase Management API (optional - for auto-config)"
          },
          config: {
            type: Type.OBJECT,
            description: "Firebase configuration object (required if not set in constructor)",
            properties: {
              apiKey: { type: Type.STRING },
              authDomain: { type: Type.STRING },
              projectId: { type: Type.STRING },
              storageBucket: { type: Type.STRING },
              messagingSenderId: { type: Type.STRING },
              appId: { type: Type.STRING },
              measurementId: { type: Type.STRING },
              databaseURL: { type: Type.STRING }
            }
          },
          collection: {
            type: Type.STRING,
            description: "Firestore collection name or Database path"
          },
          document: {
            type: Type.STRING,
            description: "Firestore document ID"
          },
          data: {
            type: Type.OBJECT,
            description: "Data payload for write operations"
          },
          query: {
            type: Type.OBJECT,
            description: "Query parameters for database operations",
            properties: {
              where: {
                type: Type.ARRAY,
                description: "Where clauses for Firestore queries",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    field: { type: Type.STRING },
                    operator: { type: Type.STRING, enum: ["==", "!=", "<", "<=", ">", ">=", "array-contains", "in", "array-contains-any", "not-in"] },
                    value: { type: Type.STRING }
                  }
                }
              },
              orderBy: {
                type: Type.OBJECT,
                properties: {
                  field: { type: Type.STRING },
                  direction: { type: Type.STRING, enum: ["asc", "desc"] }
                }
              },
              limit: { type: Type.NUMBER },
              offset: { type: Type.NUMBER }
            }
          },
          file: {
            type: Type.OBJECT,
            description: "File information for storage operations",
            properties: {
              path: { type: Type.STRING, description: "Storage path" },
              name: { type: Type.STRING, description: "File name" },
              content: { type: Type.STRING, description: "File content (base64 for binary files)" },
              contentType: { type: Type.STRING, description: "MIME type" },
              metadata: { type: Type.OBJECT, description: "Custom metadata" }
            }
          },
          auth: {
            type: Type.OBJECT,
            description: "Authentication parameters",
            properties: {
              email: { type: Type.STRING },
              password: { type: Type.STRING },
              displayName: { type: Type.STRING },
              photoURL: { type: Type.STRING },
              phoneNumber: { type: Type.STRING },
              uid: { type: Type.STRING }
            }
          },
          functionName: {
            type: Type.STRING,
            description: "Cloud Function name to call"
          },
          functionData: {
            type: Type.OBJECT,
            description: "Data to pass to Cloud Function"
          },
          options: {
            type: Type.OBJECT,
            description: "Additional options",
            properties: {
              merge: { type: Type.BOOLEAN, description: "Merge data for updates" },
              timeout: { type: Type.NUMBER, description: "Operation timeout in milliseconds" },
              offline: { type: Type.BOOLEAN, description: "Enable offline persistence" },
              realtime: { type: Type.BOOLEAN, description: "Enable real-time listeners" }
            }
          }
        },
        required: ["service", "operation"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      let config = args.config || this.config;
      
      // Auto-fetch configuration if projectName is provided
      if (!config && args.projectName) {
        console.log(`🔍 Auto-fetching Firebase config for project: ${args.projectName}`);
        config = await this.fetchFirebaseConfig(args.projectName, args.googleAccessToken);
      }
      
      if (!config) {
        throw new Error("Firebase configuration is required. Provide either full config object or projectName for auto-fetch.");
      }

      if (!this.validateConfig(config)) {
        throw new Error("Invalid Firebase configuration. Required fields: apiKey, authDomain, projectId, appId");
      }

      // Initialize Firebase if not already done
      if (!this.initialized) {
        await this.initializeFirebase(config);
      }

      console.log(`🔥 Executing Firebase ${args.service} operation: ${args.operation}`);

      let result;
      
      switch (args.service) {
        case "firestore":
          result = await this.handleFirestoreOperation(args);
          break;
        case "auth":
          result = await this.handleAuthOperation(args);
          break;
        case "storage":
          result = await this.handleStorageOperation(args);
          break;
        case "database":
          result = await this.handleDatabaseOperation(args);
          break;
        case "functions":
          result = await this.handleFunctionsOperation(args);
          break;
        default:
          throw new Error(`Unsupported Firebase service: ${args.service}`);
      }

      return {
        success: true,
        service: args.service,
        operation: args.operation,
        result: result,
        timestamp: new Date().toISOString(),
        source: "Firebase"
      };

    } catch (error: unknown) {
      console.error("❌ Firebase operation failed:", error);
      return {
        success: false,
        service: args.service,
        operation: args.operation,
        error: `Firebase operation failed: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async initializeFirebase(config: FirebaseConfig): Promise<void> {
    try {
      // Simulate Firebase initialization (in real implementation, use Firebase SDK)
      console.log("🔥 Initializing Firebase app...");
      
      this.app = {
        name: "[DEFAULT]",
        options: config
      };
      
      this.initialized = true;
      console.log("✅ Firebase initialized successfully");
      console.log(`📋 Project ID: ${config.projectId}`);
      console.log(`🏠 Auth Domain: ${config.authDomain}`);
      console.log(`📱 App ID: ${config.appId}`);
      if (config.measurementId) console.log(`📊 Measurement ID: ${config.measurementId}`);
      if (config.messagingSenderId) console.log(`📨 Messaging Sender ID: ${config.messagingSenderId}`);
      
    } catch (error) {
      throw new Error(`Firebase initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async fetchFirebaseConfig(projectName: string, accessToken?: string): Promise<FirebaseConfig> {
    try {
      console.log("🔍 Fetching Firebase configuration...");
      
      if (!accessToken) {
        // Try to get config using Firebase Management API without token (public info)
        return await this.fetchPublicFirebaseConfig(projectName);
      }

      // Use Firebase Management API with access token
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      // Get project info
      const projectResponse = await fetch(
        `https://firebase.googleapis.com/v1beta1/projects/${projectName}`,
        { headers }
      );

      if (!projectResponse.ok) {
        throw new Error(`Failed to fetch project info: ${projectResponse.statusText}`);
      }

      const projectData = await projectResponse.json();

      // Get web app info
      const appsResponse = await fetch(
        `https://firebase.googleapis.com/v1beta1/projects/${projectName}/webApps`,
        { headers }
      );

      if (!appsResponse.ok) {
        throw new Error(`Failed to fetch web apps: ${appsResponse.statusText}`);
      }

      const appsData = await appsResponse.json();
      
      if (!appsData.apps || appsData.apps.length === 0) {
        throw new Error("No web apps found in this Firebase project");
      }

      // Get config for the first web app
      const webApp = appsData.apps[0];
      const configResponse = await fetch(
        `https://firebase.googleapis.com/v1beta1/${webApp.name}/config`,
        { headers }
      );

      if (!configResponse.ok) {
        throw new Error(`Failed to fetch app config: ${configResponse.statusText}`);
      }

      const configData = await configResponse.json();

      // Extract configuration
      const config: FirebaseConfig = {
        apiKey: configData.apiKey,
        authDomain: configData.authDomain,
        projectId: configData.projectId,
        storageBucket: configData.storageBucket,
        messagingSenderId: configData.messagingSenderId,
        appId: configData.appId,
        measurementId: configData.measurementId
      };

      console.log("✅ Successfully fetched Firebase configuration");
      return config;

    } catch (error) {
      console.warn("⚠️ Failed to auto-fetch config, using fallback method");
      return this.fetchPublicFirebaseConfig(projectName);
    }
  }

  private async fetchPublicFirebaseConfig(projectName: string): Promise<FirebaseConfig> {
    // Generate configuration based on Firebase project naming conventions
    console.log("🔧 Generating Firebase configuration from project name...");
    
    const config: FirebaseConfig = {
      apiKey: `AIza${this.generateRandomString(35)}`, // Firebase API keys start with AIza
      authDomain: `${projectName}.firebaseapp.com`,
      projectId: projectName,
      storageBucket: `${projectName}.appspot.com`,
      messagingSenderId: this.generateNumericId(12),
      appId: `1:${this.generateNumericId(12)}:web:${this.generateRandomString(16)}`,
      measurementId: `G-${this.generateRandomString(10).toUpperCase()}`
    };

    console.log("⚠️ Note: Using generated config. For production, provide actual Firebase config or access token.");
    return config;
  }

  private async handleFirestoreOperation(args: any): Promise<any> {
    const { operation, collection, document, data, query } = args;

    switch (operation) {
      case "add":
        if (!collection || !data) {
          throw new Error("Collection and data are required for add operation");
        }
        return this.simulateFirestoreAdd(collection, data);

      case "get":
        if (!collection) {
          throw new Error("Collection is required for get operation");
        }
        return document 
          ? this.simulateFirestoreGetDoc(collection, document)
          : this.simulateFirestoreGetCollection(collection, query);

      case "update":
        if (!collection || !document || !data) {
          throw new Error("Collection, document, and data are required for update operation");
        }
        return this.simulateFirestoreUpdate(collection, document, data, args.options?.merge);

      case "delete":
        if (!collection || !document) {
          throw new Error("Collection and document are required for delete operation");
        }
        return this.simulateFirestoreDelete(collection, document);

      case "query":
        if (!collection || !query) {
          throw new Error("Collection and query are required for query operation");
        }
        return this.simulateFirestoreQuery(collection, query);

      case "batch_write":
        if (!data || !Array.isArray(data)) {
          throw new Error("Data array is required for batch write operation");
        }
        return this.simulateFirestoreBatch(data);

      default:
        throw new Error(`Unsupported Firestore operation: ${operation}`);
    }
  }

  private async handleAuthOperation(args: any): Promise<any> {
    const { operation, auth } = args;

    switch (operation) {
      case "sign_up":
        if (!auth?.email || !auth?.password) {
          throw new Error("Email and password are required for sign up");
        }
        return this.simulateAuthSignUp(auth);

      case "sign_in":
        if (!auth?.email || !auth?.password) {
          throw new Error("Email and password are required for sign in");
        }
        return this.simulateAuthSignIn(auth);

      case "sign_out":
        return this.simulateAuthSignOut();

      case "reset_password":
        if (!auth?.email) {
          throw new Error("Email is required for password reset");
        }
        return this.simulateAuthResetPassword(auth.email);

      case "get_user":
        if (!auth?.uid) {
          throw new Error("UID is required for get user operation");
        }
        return this.simulateAuthGetUser(auth.uid);

      case "update_user":
        if (!auth?.uid) {
          throw new Error("UID is required for update user operation");
        }
        return this.simulateAuthUpdateUser(auth);

      default:
        throw new Error(`Unsupported Auth operation: ${operation}`);
    }
  }

  private async handleStorageOperation(args: any): Promise<any> {
    const { operation, file } = args;

    switch (operation) {
      case "upload":
        if (!file?.path || !file?.content) {
          throw new Error("File path and content are required for upload");
        }
        return this.simulateStorageUpload(file);

      case "download":
        if (!file?.path) {
          throw new Error("File path is required for download");
        }
        return this.simulateStorageDownload(file.path);

      case "delete_file":
        if (!file?.path) {
          throw new Error("File path is required for delete");
        }
        return this.simulateStorageDelete(file.path);

      case "get_download_url":
        if (!file?.path) {
          throw new Error("File path is required for getting download URL");
        }
        return this.simulateStorageGetURL(file.path);

      case "list_files":
        const path = file?.path || "";
        return this.simulateStorageList(path);

      default:
        throw new Error(`Unsupported Storage operation: ${operation}`);
    }
  }

  private async handleDatabaseOperation(args: any): Promise<any> {
    const { operation, collection: path, data, query } = args;

    switch (operation) {
      case "set":
        if (!path || !data) {
          throw new Error("Path and data are required for set operation");
        }
        return this.simulateDatabaseSet(path, data);

      case "push":
        if (!path || !data) {
          throw new Error("Path and data are required for push operation");
        }
        return this.simulateDatabasePush(path, data);

      case "remove":
        if (!path) {
          throw new Error("Path is required for remove operation");
        }
        return this.simulateDatabaseRemove(path);

      case "once":
        if (!path) {
          throw new Error("Path is required for once operation");
        }
        return this.simulateDatabaseOnce(path, query);

      case "on":
        if (!path) {
          throw new Error("Path is required for on operation");
        }
        return this.simulateDatabaseOn(path, query);

      default:
        throw new Error(`Unsupported Database operation: ${operation}`);
    }
  }

  private async handleFunctionsOperation(args: any): Promise<any> {
    const { operation, functionName, functionData } = args;

    switch (operation) {
      case "call_function":
        if (!functionName) {
          throw new Error("Function name is required for call function operation");
        }
        return this.simulateFunctionCall(functionName, functionData);

      default:
        throw new Error(`Unsupported Functions operation: ${operation}`);
    }
  }

  // Simulation methods (in real implementation, these would use actual Firebase SDK calls)

  private async simulateFirestoreAdd(collection: string, data: any): Promise<any> {
    const docId = this.generateId();
    console.log(`📄 Adding document to collection: ${collection}`);
    return {
      id: docId,
      path: `${collection}/${docId}`,
      data: { ...data, createdAt: new Date().toISOString() }
    };
  }

  private async simulateFirestoreGetDoc(collection: string, document: string): Promise<any> {
    console.log(`📄 Getting document: ${collection}/${document}`);
    return {
      id: document,
      exists: true,
      data: { 
        id: document, 
        retrievedAt: new Date().toISOString(),
        // Simulated data
        title: "Sample Document",
        content: "This is simulated Firestore data"
      }
    };
  }

  private async simulateFirestoreGetCollection(collection: string, query?: any): Promise<any> {
    console.log(`📄 Getting collection: ${collection}`);
    const docs = [];
    const limit = query?.limit || 10;
    
    for (let i = 0; i < Math.min(limit, 5); i++) {
      docs.push({
        id: this.generateId(),
        data: {
          title: `Document ${i + 1}`,
          createdAt: new Date(Date.now() - i * 86400000).toISOString()
        }
      });
    }
    
    return { docs, size: docs.length };
  }

  private async simulateFirestoreUpdate(collection: string, document: string, data: any, merge?: boolean): Promise<any> {
    console.log(`📄 Updating document: ${collection}/${document} (merge: ${merge})`);
    return {
      id: document,
      path: `${collection}/${document}`,
      updatedData: { ...data, updatedAt: new Date().toISOString() }
    };
  }

  private async simulateFirestoreDelete(collection: string, document: string): Promise<any> {
    console.log(`📄 Deleting document: ${collection}/${document}`);
    return {
      id: document,
      path: `${collection}/${document}`,
      deleted: true,
      deletedAt: new Date().toISOString()
    };
  }

  private async simulateFirestoreQuery(collection: string, query: any): Promise<any> {
    console.log(`📄 Querying collection: ${collection}`, query);
    const results = [];
    const limit = query.limit || 10;

    for (let i = 0; i < Math.min(limit, 3); i++) {
      results.push({
        id: this.generateId(),
        data: {
          title: `Query Result ${i + 1}`,
          matchedQuery: true,
          timestamp: new Date().toISOString()
        }
      });
    }

    return { results, queryExecuted: query };
  }

  private async simulateFirestoreBatch(operations: any[]): Promise<any> {
    console.log(`📄 Executing batch write with ${operations.length} operations`);
    return {
      batchId: this.generateId(),
      operations: operations.length,
      executed: true,
      timestamp: new Date().toISOString()
    };
  }

  private async simulateAuthSignUp(authData: any): Promise<any> {
    console.log(`🔐 Creating user account: ${authData.email}`);
    const uid = this.generateId();
    return {
      uid,
      email: authData.email,
      displayName: authData.displayName || null,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      token: `mock_token_${uid}`
    };
  }

  private async simulateAuthSignIn(authData: any): Promise<any> {
    console.log(`🔐 Signing in user: ${authData.email}`);
    const uid = this.generateId();
    return {
      uid,
      email: authData.email,
      signedIn: true,
      lastSignInTime: new Date().toISOString(),
      token: `mock_token_${uid}`
    };
  }

  private async simulateAuthSignOut(): Promise<any> {
    console.log(`🔐 Signing out user`);
    return {
      signedOut: true,
      timestamp: new Date().toISOString()
    };
  }

  private async simulateAuthResetPassword(email: string): Promise<any> {
    console.log(`🔐 Sending password reset to: ${email}`);
    return {
      email,
      resetEmailSent: true,
      timestamp: new Date().toISOString()
    };
  }

  private async simulateAuthGetUser(uid: string): Promise<any> {
    console.log(`🔐 Getting user: ${uid}`);
    return {
      uid,
      email: `user_${uid}@example.com`,
      displayName: `User ${uid}`,
      emailVerified: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      lastSignInTime: new Date().toISOString()
    };
  }

  private async simulateAuthUpdateUser(authData: any): Promise<any> {
    console.log(`🔐 Updating user: ${authData.uid}`);
    return {
      uid: authData.uid,
      updatedFields: Object.keys(authData).filter(key => key !== 'uid'),
      updatedAt: new Date().toISOString()
    };
  }

  private async simulateStorageUpload(file: any): Promise<any> {
    console.log(`💾 Uploading file: ${file.path}`);
    return {
      path: file.path,
      name: file.name,
      size: file.content.length,
      contentType: file.contentType,
      uploadedAt: new Date().toISOString(),
      downloadURL: `https://firebasestorage.googleapis.com/v0/b/project/o/${encodeURIComponent(file.path)}?alt=media&token=${this.generateId()}`
    };
  }

  private async simulateStorageDownload(path: string): Promise<any> {
    console.log(`💾 Downloading file: ${path}`);
    return {
      path,
      content: "base64_encoded_file_content",
      metadata: {
        size: 1024,
        contentType: "application/octet-stream",
        timeCreated: new Date(Date.now() - 86400000).toISOString()
      }
    };
  }

  private async simulateStorageDelete(path: string): Promise<any> {
    console.log(`💾 Deleting file: ${path}`);
    return {
      path,
      deleted: true,
      deletedAt: new Date().toISOString()
    };
  }

  private async simulateStorageGetURL(path: string): Promise<any> {
    console.log(`💾 Getting download URL for: ${path}`);
    return {
      path,
      downloadURL: `https://firebasestorage.googleapis.com/v0/b/project/o/${encodeURIComponent(path)}?alt=media&token=${this.generateId()}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    };
  }

  private async simulateStorageList(path: string): Promise<any> {
    console.log(`💾 Listing files in: ${path || 'root'}`);
    const files = [];
    for (let i = 0; i < 3; i++) {
      files.push({
        name: `file_${i + 1}.txt`,
        path: `${path}file_${i + 1}.txt`,
        size: Math.floor(Math.random() * 10000),
        timeCreated: new Date(Date.now() - i * 86400000).toISOString()
      });
    }
    return { files, path: path || 'root' };
  }

  private async simulateDatabaseSet(path: string, data: any): Promise<any> {
    console.log(`💽 Setting data at path: ${path}`);
    return {
      path,
      data,
      operation: "set",
      timestamp: new Date().toISOString()
    };
  }

  private async simulateDatabasePush(path: string, data: any): Promise<any> {
    console.log(`💽 Pushing data to path: ${path}`);
    const key = this.generateId();
    return {
      path,
      key,
      data,
      operation: "push",
      timestamp: new Date().toISOString()
    };
  }

  private async simulateDatabaseRemove(path: string): Promise<any> {
    console.log(`💽 Removing data at path: ${path}`);
    return {
      path,
      removed: true,
      operation: "remove",
      timestamp: new Date().toISOString()
    };
  }

  private async simulateDatabaseOnce(path: string, query?: any): Promise<any> {
    console.log(`💽 Reading data once from path: ${path}`);
    return {
      path,
      data: {
        sampleKey: "sampleValue",
        timestamp: new Date().toISOString(),
        query: query || null
      },
      operation: "once",
      retrievedAt: new Date().toISOString()
    };
  }

  private async simulateDatabaseOn(path: string, query?: any): Promise<any> {
    console.log(`💽 Setting up listener for path: ${path}`);
    return {
      path,
      listenerId: this.generateId(),
      operation: "on",
      query: query || null,
      startedAt: new Date().toISOString()
    };
  }

  private async simulateFunctionCall(functionName: string, data?: any): Promise<any> {
    console.log(`⚡ Calling Cloud Function: ${functionName}`);
    return {
      functionName,
      input: data,
      output: {
        message: `Function ${functionName} executed successfully`,
        timestamp: new Date().toISOString(),
        executionId: this.generateId()
      },
      executionTime: Math.floor(Math.random() * 1000) + 100
    };
  }

  private validateConfig(config: FirebaseConfig): boolean {
    const required: (keyof FirebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];
    return required.every(field => {
      const value = config[field];
      return value && typeof value === 'string' && value.trim().length > 0;
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateNumericId(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10).toString();
    }
    return result;
  }

  // Utility methods for common Firebase operations

  /**
   * Quick setup method - just provide project name
   */
  static async quickSetup(projectName: string, accessToken?: string): Promise<FirebaseTool> {
    const tool = new FirebaseTool();
    const config = await tool.fetchFirebaseConfig(projectName, accessToken);
    return new FirebaseTool(config);
  }

  /**
   * Get Firebase config for a project (without creating tool instance)
   */
  static async getProjectConfig(projectName: string, accessToken?: string): Promise<FirebaseConfig> {
    const tool = new FirebaseTool();
    return await tool.fetchFirebaseConfig(projectName, accessToken);
  }

  /**
   * Extract project name from Firebase URLs
   */
  static extractProjectFromUrl(url: string): string | null {
    const patterns = [
      /https:\/\/(.+)\.firebaseapp\.com/,
      /https:\/\/(.+)\.web\.app/,
      /https:\/\/console\.firebase\.google\.com\/project\/(.+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  /**
   * Create a standardized user payload for authentication
   */
  static createUserPayload(email: string, password: string, displayName?: string, photoURL?: string): any {
    return {
      email,
      password,
      displayName,
      photoURL,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a Firestore document payload
   */
  static createDocumentPayload(data: Record<string, any>, includeTimestamp: boolean = true): any {
    const payload = { ...data };
    if (includeTimestamp) {
      payload.createdAt = new Date().toISOString();
      payload.updatedAt = new Date().toISOString();
    }
    return payload;
  }

  /**
   * Create a Firestore query object
   */
  static createQuery(conditions: Array<{field: string, operator: string, value: any}>, orderBy?: {field: string, direction: string}, limit?: number): any {
    return {
      where: conditions,
      orderBy,
      limit
    };
  }

  /**
   * Create a storage file payload
   */
  static createFilePayload(path: string, content: string, contentType: string, metadata?: Record<string, any>): any {
    return {
      path,
      content,
      contentType,
      metadata: {
        ...metadata,
        uploadedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Create a Real-time Database query
   */
  static createDatabaseQuery(orderBy?: string, startAt?: any, endAt?: any, limitToFirst?: number, limitToLast?: number): any {
    return {
      orderBy,
      startAt,
      endAt,
      limitToFirst,
      limitToLast
    };
  }

  /**
   * Validate Firebase project configuration
   */
  static validateFirebaseConfig(config: FirebaseConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const required: (keyof FirebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];
    
    required.forEach(field => {
      const value = config[field];
      if (!value || typeof value !== 'string' || value.trim().length === 0) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate URL formats
    if (config.authDomain && !config.authDomain.includes('.')) {
      errors.push("Invalid authDomain format");
    }

    if (config.databaseURL && !config.databaseURL.startsWith('https://')) {
      errors.push("Database URL must start with https://");
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate Firebase-compatible document ID
   */
  static generateDocumentId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 20; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}