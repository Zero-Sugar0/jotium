import { FunctionDeclaration, Type } from "@google/genai";

// AWS S3 SDK v3 imports
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListMultipartUploadsCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  ListBucketsCommand,
  HeadBucketCommand,
  GetBucketLocationCommand,
  PutBucketTaggingCommand,
  GetBucketTaggingCommand,
  PutBucketVersioningCommand,
  GetBucketVersioningCommand,
  PutBucketEncryptionCommand,
  GetBucketEncryptionCommand,
  PutBucketAclCommand,
  GetBucketAclCommand,
  GetObjectTaggingCommand,
  PutObjectTaggingCommand,
  DeleteObjectTaggingCommand,
  PutBucketCorsCommand,
  GetBucketCorsCommand,
  DeleteBucketCorsCommand,
  PutBucketWebsiteCommand,
  GetBucketWebsiteCommand,
  DeleteBucketWebsiteCommand,
  RestoreObjectCommand,
  SelectObjectContentCommand,
  GetObjectAttributesCommand,
  ListObjectVersionsCommand,
  GetBucketPolicyCommand,
  PutBucketPolicyCommand,
  DeleteBucketPolicyCommand,
  GetBucketNotificationConfigurationCommand,
  PutBucketNotificationConfigurationCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  sessionToken?: string;
  endpoint?: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface S3Object {
  Key?: string;
  LastModified?: Date;
  Size?: number;
  StorageClass?: string;
  Owner?: {
    DisplayName?: string;
    ID?: string;
  };
  ETag?: string;
}

interface BucketInfo {
  Name?: string;
  CreationDate?: Date;
  Region?: string;
}

export class S3Tool {
  private client: S3Client | null = null;
  private config: S3Config | null = null;
  private defaultRegion: string = "us-east-1";
  private maxRetries: number = 3;
  private timeout: number = 30000;

  constructor(config?: S3Config) {
    if (config) {
      this.setConfig(config);
    }
  }

  setConfig(config: S3Config): void {
    this.config = config;
    this.client = new S3Client({
      region: config.region || this.defaultRegion,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        sessionToken: config.sessionToken,
      },
      endpoint: config.endpoint,
      maxAttempts: this.maxRetries,
      requestHandler: {
        requestTimeout: this.timeout,
      },
    });
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "s3_storage",
      description: "Comprehensive Amazon S3 cloud storage tool for file management, bucket operations, and advanced S3 features. Supports upload, download, delete, copy, multipart uploads, versioning, encryption, access control, and more.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          operation: {
            type: Type.STRING,
            description: "S3 operation to perform",
            enum: [
              // Object operations
              "upload", "download", "delete", "copy", "move", "list_objects", "head_object",
              "get_object_tags", "put_object_tags", "delete_object_tags",
              "get_object_attributes", "restore_object", "select_object_content",
              
              // Bucket operations
              "create_bucket", "delete_bucket", "list_buckets", "head_bucket", 
              "get_bucket_location", "get_bucket_tags", "put_bucket_tags",
              "get_bucket_versioning", "put_bucket_versioning",
              "get_bucket_encryption", "put_bucket_encryption",
              "get_bucket_acl", "put_bucket_acl",
              "get_bucket_cors", "put_bucket_cors", "delete_bucket_cors",
              "get_bucket_website", "put_bucket_website", "delete_bucket_website",
              "get_bucket_policy", "put_bucket_policy", "delete_bucket_policy",
              "get_bucket_notification", "put_bucket_notification",
              
              // Advanced operations
              "multipart_upload", "abort_multipart", "list_multipart_uploads",
              "generate_presigned_url", "sync_folder", "batch_delete",
              "list_object_versions", "get_object_info"
            ]
          },
          config: {
            type: Type.OBJECT,
            description: "AWS credentials and configuration",
            properties: {
              accessKeyId: { type: Type.STRING, description: "AWS Access Key ID" },
              secretAccessKey: { type: Type.STRING, description: "AWS Secret Access Key" },
              region: { type: Type.STRING, description: "AWS region (default: us-east-1)" },
              sessionToken: { type: Type.STRING, description: "AWS session token (optional)" },
              endpoint: { type: Type.STRING, description: "Custom S3 endpoint (for S3-compatible services)" }
            }
          },
          bucket: {
            type: Type.STRING,
            description: "S3 bucket name"
          },
          key: {
            type: Type.STRING,
            description: "Object key/path in S3"
          },
          sourceKey: {
            type: Type.STRING,
            description: "Source object key for copy/move operations"
          },
          sourceBucket: {
            type: Type.STRING,
            description: "Source bucket for copy operations"
          },
          destinationBucket: {
            type: Type.STRING,
            description: "Destination bucket for copy operations"
          },
          content: {
            type: Type.STRING,
            description: "File content (for uploads) - can be base64 encoded binary data"
          },
          contentType: {
            type: Type.STRING,
            description: "MIME type of the content (e.g., image/jpeg, text/plain)"
          },
          metadata: {
            type: Type.OBJECT,
            description: "Object metadata as key-value pairs"
          },
          tags: {
            type: Type.OBJECT,
            description: "Object or bucket tags as key-value pairs"
          },
          storageClass: {
            type: Type.STRING,
            description: "S3 storage class",
            enum: ["STANDARD", "REDUCED_REDUNDANCY", "STANDARD_IA", "ONEZONE_IA", "INTELLIGENT_TIERING", "GLACIER", "DEEP_ARCHIVE", "GLACIER_IR"]
          },
          serverSideEncryption: {
            type: Type.STRING,
            description: "Server-side encryption method",
            enum: ["AES256", "aws:kms", "aws:kms:dsse"]
          },
          kmsKeyId: {
            type: Type.STRING,
            description: "KMS key ID for encryption"
          },
          acl: {
            type: Type.STRING,
            description: "Access control list",
            enum: ["private", "public-read", "public-read-write", "authenticated-read", "bucket-owner-read", "bucket-owner-full-control"]
          },
          prefix: {
            type: Type.STRING,
            description: "Prefix filter for listing objects"
          },
          maxKeys: {
            type: Type.NUMBER,
            description: "Maximum number of keys to return (default: 1000)"
          },
          delimiter: {
            type: Type.STRING,
            description: "Delimiter for grouping object names"
          },
          versionId: {
            type: Type.STRING,
            description: "Version ID for versioned objects"
          },
          corsConfiguration: {
            type: Type.OBJECT,
            description: "CORS configuration for bucket"
          },
          websiteConfiguration: {
            type: Type.OBJECT,
            description: "Website configuration for bucket"
          },
          policy: {
            type: Type.STRING,
            description: "Bucket policy JSON string"
          },
          versioning: {
            type: Type.STRING,
            description: "Versioning status",
            enum: ["Enabled", "Suspended"]
          },
          encryptionConfiguration: {
            type: Type.OBJECT,
            description: "Bucket encryption configuration"
          },
          expiresIn: {
            type: Type.NUMBER,
            description: "Expiration time in seconds for presigned URLs (default: 3600)"
          },
          restoreRequest: {
            type: Type.OBJECT,
            description: "Restore request configuration for archived objects"
          },
          selectExpression: {
            type: Type.STRING,
            description: "SQL expression for S3 Select"
          },
          inputSerialization: {
            type: Type.OBJECT,
            description: "Input serialization format for S3 Select"
          },
          outputSerialization: {
            type: Type.OBJECT,
            description: "Output serialization format for S3 Select"
          },
          notificationConfiguration: {
            type: Type.OBJECT,
            description: "Bucket notification configuration"
          },
          progressCallback: {
            type: Type.BOOLEAN,
            description: "Whether to return upload progress information"
          }
        },
        required: ["operation"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      // Set configuration if provided
      if (args.config) {
        this.setConfig(args.config);
      }

      if (!this.client) {
        throw new Error("S3 client not configured. Please provide AWS credentials.");
      }

      console.log(`🪣 Executing S3 operation: ${args.operation}`);

      const result = await this.executeOperation(args);

      return {
        success: true,
        operation: args.operation,
        result,
        timestamp: new Date().toISOString(),
        source: "Amazon S3"
      };

    } catch (error: unknown) {
      console.error("❌ S3 operation failed:", error);
      return {
        success: false,
        operation: args.operation,
        error: `S3 operation failed: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async executeOperation(args: any): Promise<any> {
    switch (args.operation) {
      // Object operations
      case "upload":
        return this.uploadObject(args);
      case "download":
        return this.downloadObject(args);
      case "delete":
        return this.deleteObject(args);
      case "copy":
        return this.copyObject(args);
      case "move":
        return this.moveObject(args);
      case "list_objects":
        return this.listObjects(args);
      case "head_object":
        return this.headObject(args);
      case "get_object_tags":
        return this.getObjectTags(args);
      case "put_object_tags":
        return this.putObjectTags(args);
      case "delete_object_tags":
        return this.deleteObjectTags(args);
      case "get_object_attributes":
        return this.getObjectAttributes(args);
      case "restore_object":
        return this.restoreObject(args);
      case "select_object_content":
        return this.selectObjectContent(args);

      // Bucket operations
      case "create_bucket":
        return this.createBucket(args);
      case "delete_bucket":
        return this.deleteBucket(args);
      case "list_buckets":
        return this.listBuckets();
      case "head_bucket":
        return this.headBucket(args);
      case "get_bucket_location":
        return this.getBucketLocation(args);
      case "get_bucket_tags":
        return this.getBucketTags(args);
      case "put_bucket_tags":
        return this.putBucketTags(args);
      case "get_bucket_versioning":
        return this.getBucketVersioning(args);
      case "put_bucket_versioning":
        return this.putBucketVersioning(args);
      case "get_bucket_encryption":
        return this.getBucketEncryption(args);
      case "put_bucket_encryption":
        return this.putBucketEncryption(args);
      case "get_bucket_acl":
        return this.getBucketAcl(args);
      case "put_bucket_acl":
        return this.putBucketAcl(args);
      case "get_bucket_cors":
        return this.getBucketCors(args);
      case "put_bucket_cors":
        return this.putBucketCors(args);
      case "delete_bucket_cors":
        return this.deleteBucketCors(args);
      case "get_bucket_website":
        return this.getBucketWebsite(args);
      case "put_bucket_website":
        return this.putBucketWebsite(args);
      case "delete_bucket_website":
        return this.deleteBucketWebsite(args);
      case "get_bucket_policy":
        return this.getBucketPolicy(args);
      case "put_bucket_policy":
        return this.putBucketPolicy(args);
      case "delete_bucket_policy":
        return this.deleteBucketPolicy(args);
      case "get_bucket_notification":
        return this.getBucketNotification(args);
      case "put_bucket_notification":
        return this.putBucketNotification(args);

      // Advanced operations
      case "multipart_upload":
        return this.multipartUpload(args);
      case "abort_multipart":
        return this.abortMultipartUpload(args);
      case "list_multipart_uploads":
        return this.listMultipartUploads(args);
      case "generate_presigned_url":
        return this.generatePresignedUrl(args);
      case "sync_folder":
        return this.syncFolder(args);
      case "batch_delete":
        return this.batchDelete(args);
      case "list_object_versions":
        return this.listObjectVersions(args);
      case "get_object_info":
        return this.getObjectInfo(args);

      default:
        throw new Error(`Unsupported operation: ${args.operation}`);
    }
  }

  // Object Operations
  private async uploadObject(args: any): Promise<any> {
    const { bucket, key, content, contentType, metadata, tags, storageClass, serverSideEncryption, kmsKeyId, acl, progressCallback } = args;

    if (!bucket || !key || !content) {
      throw new Error("Bucket, key, and content are required for upload");
    }

    let body: Buffer | string = content;
    
    // Handle base64 encoded content
    if (typeof content === 'string' && content.includes('base64,')) {
      const base64Data = content.split('base64,')[1];
      body = Buffer.from(base64Data, 'base64');
    } else if (typeof content === 'string') {
      body = Buffer.from(content, 'utf8');
    }

    const uploadParams: any = {
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
      StorageClass: storageClass,
      ServerSideEncryption: serverSideEncryption,
      SSEKMSKeyId: kmsKeyId,
      ACL: acl,
      Tagging: tags ? Object.entries(tags).map(([k, v]) => `${k}=${v}`).join('&') : undefined
    };

    if (progressCallback && body.length > 5 * 1024 * 1024) { // Use multipart for files > 5MB
      const upload = new Upload({
        client: this.client!,
        params: uploadParams
      });

      let progress: UploadProgress = { loaded: 0, total: body.length, percentage: 0 };

      upload.on("httpUploadProgress", (p) => {
        progress = {
          loaded: p.loaded || 0,
          total: p.total || body.length,
          percentage: ((p.loaded || 0) / (p.total || body.length)) * 100
        };
        console.log(`📤 Upload progress: ${progress.percentage.toFixed(2)}%`);
      });

      const result = await upload.done();
      return { ...result, uploadProgress: progress };
    } else {
      const command = new PutObjectCommand(uploadParams);
      return await this.client!.send(command);
    }
  }

  private async downloadObject(args: any): Promise<any> {
    const { bucket, key, versionId } = args;

    if (!bucket || !key) {
      throw new Error("Bucket and key are required for download");
    }

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      VersionId: versionId
    });

    const response = await this.client!.send(command);
    
    if (response.Body) {
      const chunks: Uint8Array[] = [];
      const reader = response.Body.transformToWebStream().getReader();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }

      const buffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        buffer.set(chunk, offset);
        offset += chunk.length;
      }

      return {
        ...response,
        Body: buffer,
        ContentBase64: Buffer.from(buffer).toString('base64'),
        BodyText: response.ContentType?.startsWith('text/') ? 
          Buffer.from(buffer).toString('utf8') : undefined
      };
    }

    return response;
  }

  private async deleteObject(args: any): Promise<any> {
    const { bucket, key, versionId } = args;

    if (!bucket || !key) {
      throw new Error("Bucket and key are required for delete");
    }

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
      VersionId: versionId
    });

    return await this.client!.send(command);
  }

  private async copyObject(args: any): Promise<any> {
    const { sourceBucket, sourceKey, bucket, key, metadata, tags, storageClass, serverSideEncryption, kmsKeyId, acl } = args;

    if (!sourceBucket || !sourceKey || !bucket || !key) {
      throw new Error("Source bucket, source key, destination bucket, and destination key are required for copy");
    }

    const command = new CopyObjectCommand({
      CopySource: `${sourceBucket}/${sourceKey}`,
      Bucket: bucket,
      Key: key,
      Metadata: metadata,
      MetadataDirective: metadata ? "REPLACE" : "COPY",
      StorageClass: storageClass,
      ServerSideEncryption: serverSideEncryption,
      SSEKMSKeyId: kmsKeyId,
      ACL: acl,
      Tagging: tags ? Object.entries(tags).map(([k, v]) => `${k}=${v}`).join('&') : undefined,
      TaggingDirective: tags ? "REPLACE" : "COPY"
    });

    return await this.client!.send(command);
  }

  private async moveObject(args: any): Promise<any> {
    // Move is copy + delete
    const copyResult = await this.copyObject(args);
    
    await this.deleteObject({
      bucket: args.sourceBucket,
      key: args.sourceKey
    });

    return {
      copyResult,
      deleteResult: { deleted: true },
      moved: true
    };
  }

  private async listObjects(args: any): Promise<any> {
    const { bucket, prefix, maxKeys = 1000, delimiter } = args;

    if (!bucket) {
      throw new Error("Bucket is required for list objects");
    }

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: maxKeys,
      Delimiter: delimiter
    });

    const response = await this.client!.send(command);
    
    return {
      ...response,
      ObjectCount: response.Contents?.length || 0,
      Objects: response.Contents?.map(obj => ({
        Key: obj.Key,
        LastModified: obj.LastModified,
        Size: obj.Size,
        StorageClass: obj.StorageClass,
        ETag: obj.ETag,
        Owner: obj.Owner
      }))
    };
  }

  private async headObject(args: any): Promise<any> {
    const { bucket, key, versionId } = args;

    if (!bucket || !key) {
      throw new Error("Bucket and key are required for head object");
    }

    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
      VersionId: versionId
    });

    return await this.client!.send(command);
  }

  // Bucket Operations
  private async createBucket(args: any): Promise<any> {
    const { bucket, region } = args;

    if (!bucket) {
      throw new Error("Bucket name is required for create bucket");
    }

    const command = new CreateBucketCommand({
      Bucket: bucket,
      CreateBucketConfiguration: region && region !== 'us-east-1' ? {
        LocationConstraint: region
      } : undefined
    });

    return await this.client!.send(command);
  }

  private async deleteBucket(args: any): Promise<any> {
    const { bucket } = args;

    if (!bucket) {
      throw new Error("Bucket name is required for delete bucket");
    }

    const command = new DeleteBucketCommand({
      Bucket: bucket
    });

    return await this.client!.send(command);
  }

  private async listBuckets(): Promise<any> {
    const command = new ListBucketsCommand({});
    const response = await this.client!.send(command);

    return {
      ...response,
      BucketCount: response.Buckets?.length || 0,
      BucketList: response.Buckets?.map(bucket => ({
        Name: bucket.Name,
        CreationDate: bucket.CreationDate
      }))
    };
  }

  private async headBucket(args: any): Promise<any> {
    const { bucket } = args;

    if (!bucket) {
      throw new Error("Bucket name is required for head bucket");
    }

    const command = new HeadBucketCommand({
      Bucket: bucket
    });

    return await this.client!.send(command);
  }

  private async getBucketLocation(args: any): Promise<any> {
    const { bucket } = args;

    if (!bucket) {
      throw new Error("Bucket name is required for get bucket location");
    }

    const command = new GetBucketLocationCommand({
      Bucket: bucket
    });

    return await this.client!.send(command);
  }

  // Tag Operations
  private async getObjectTags(args: any): Promise<any> {
    const { bucket, key, versionId } = args;

    if (!bucket || !key) {
      throw new Error("Bucket and key are required for get object tags");
    }

    const command = new GetObjectTaggingCommand({
      Bucket: bucket,
      Key: key,
      VersionId: versionId
    });

    const response = await this.client!.send(command);
    
    return {
      ...response,
      TagsObject: response.TagSet?.reduce((acc, tag) => {
        if (tag.Key && tag.Value) {
          acc[tag.Key] = tag.Value;
        }
        return acc;
      }, {} as Record<string, string>)
    };
  }

  private async putObjectTags(args: any): Promise<any> {
    const { bucket, key, tags, versionId } = args;

    if (!bucket || !key || !tags) {
      throw new Error("Bucket, key, and tags are required for put object tags");
    }

    const command = new PutObjectTaggingCommand({
      Bucket: bucket,
      Key: key,
      VersionId: versionId,
      Tagging: {
        TagSet: Object.entries(tags).map(([Key, Value]) => ({ Key, Value: String(Value) }))
      }
    });

    return await this.client!.send(command);
  }

  private async deleteObjectTags(args: any): Promise<any> {
    const { bucket, key, versionId } = args;

    if (!bucket || !key) {
      throw new Error("Bucket and key are required for delete object tags");
    }

    const command = new DeleteObjectTaggingCommand({
      Bucket: bucket,
      Key: key,
      VersionId: versionId
    });

    return await this.client!.send(command);
  }

  private async getBucketTags(args: any): Promise<any> {
    const { bucket } = args;

    if (!bucket) {
      throw new Error("Bucket name is required for get bucket tags");
    }

    const command = new GetBucketTaggingCommand({
      Bucket: bucket
    });

    const response = await this.client!.send(command);
    
    return {
      ...response,
      TagsObject: response.TagSet?.reduce((acc, tag) => {
        if (tag.Key && tag.Value) {
          acc[tag.Key] = tag.Value;
        }
        return acc;
      }, {} as Record<string, string>)
    };
  }

  private async putBucketTags(args: any): Promise<any> {
    const { bucket, tags } = args;

    if (!bucket || !tags) {
      throw new Error("Bucket and tags are required for put bucket tags");
    }

    const command = new PutBucketTaggingCommand({
      Bucket: bucket,
      Tagging: {
        TagSet: Object.entries(tags).map(([Key, Value]) => ({ Key, Value: String(Value) }))
      }
    });

    return await this.client!.send(command);
  }

  // Advanced Operations
  private async multipartUpload(args: any): Promise<any> {
    const { bucket, key, content, contentType, partSize = 5 * 1024 * 1024 } = args; // Default 5MB parts

    if (!bucket || !key || !content) {
      throw new Error("Bucket, key, and content are required for multipart upload");
    }

    let body: Buffer;
    if (typeof content === 'string' && content.includes('base64,')) {
      const base64Data = content.split('base64,')[1];
      body = Buffer.from(base64Data, 'base64');
    } else {
      body = Buffer.from(content, 'utf8');
    }

    // Initiate multipart upload
    const createCommand = new CreateMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType
    });

    const createResponse = await this.client!.send(createCommand);
    const uploadId = createResponse.UploadId!;

    try {
      const parts = [];
      const totalParts = Math.ceil(body.length / partSize);

      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const start = (partNumber - 1) * partSize;
        const end = Math.min(start + partSize, body.length);
        const partBody = body.slice(start, end);

        const uploadPartCommand = new UploadPartCommand({
          Bucket: bucket,
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
          Body: partBody
        });

        const partResponse = await this.client!.send(uploadPartCommand);
        parts.push({
          PartNumber: partNumber,
          ETag: partResponse.ETag
        });

        console.log(`📤 Uploaded part ${partNumber}/${totalParts}`);
      }

      // Complete multipart upload
      const completeCommand = new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts
        }
      });

      const completeResponse = await this.client!.send(completeCommand);
      
      return {
        ...completeResponse,
        PartsUploaded: parts.length,
        TotalSize: body.length
      };

    } catch (error) {
      // Abort multipart upload on error
      const abortCommand = new AbortMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId
      });

      await this.client!.send(abortCommand);
      throw error;
    }
  }

  private async generatePresignedUrl(args: any): Promise<any> {
    const { bucket, key, operation = 'getObject', expiresIn = 3600 } = args;

    if (!bucket || !key) {
      throw new Error("Bucket and key are required for presigned URL");
    }

    let command;
    switch (operation) {
      case 'getObject':
        command = new GetObjectCommand({ Bucket: bucket, Key: key });
        break;
      case 'putObject':
        command = new PutObjectCommand({ Bucket: bucket, Key: key });
        break;
      case 'deleteObject':
        command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
        break;
      default:
        throw new Error(`Unsupported operation for presigned URL: ${operation}`);
    }

    const url = await getSignedUrl(this.client!, command, { expiresIn });
    
    return {
      url,
      bucket,
      key,
      operation,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
    };
  }

  private async batchDelete(args: any): Promise<any> {
    const { bucket, keys } = args;

    if (!bucket || !keys || !Array.isArray(keys)) {
      throw new Error("Bucket and keys array are required for batch delete");
    }

    const objects = keys.map(key => ({ Key: typeof key === 'string' ? key : key.Key }));

    const command = new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: objects
      }
    });

    const response = await this.client!.send(command);
    
    return {
      ...response,
      DeletedCount: response.Deleted?.length || 0,
      ErrorCount: response.Errors?.length || 0
    };
  }

  private async listObjectVersions(args: any): Promise<any> {
    const { bucket, prefix, maxKeys = 1000 } = args;

    if (!bucket) {
      throw new Error("Bucket is required for list object versions");
    }

    const command = new ListObjectVersionsCommand({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: maxKeys
    });

    const response = await this.client!.send(command);
    
    return {
      ...response,
      VersionCount: response.Versions?.length || 0,
      DeleteMarkerCount: response.DeleteMarkers?.length || 0
    };
  }

  private async getObjectInfo(args: any): Promise<any> {
    const { bucket, key } = args;

    if (!bucket || !key) {
      throw new Error("Bucket and key are required for get object info");
    }

    try {
      const [headResponse, tagsResponse] = await Promise.allSettled([
        this.headObject({ bucket, key }),
        this.getObjectTags({ bucket, key }).catch(() => ({ TagsObject: {} }))
      ]);

      const objectInfo: any = {
        exists: headResponse.status === 'fulfilled',
        bucket,
        key
      };

      if (headResponse.status === 'fulfilled') {
        objectInfo.metadata = headResponse.value;
        objectInfo.size = headResponse.value.ContentLength;
        objectInfo.lastModified = headResponse.value.LastModified;
        objectInfo.contentType = headResponse.value.ContentType;
        objectInfo.etag = headResponse.value.ETag;
        objectInfo.storageClass = headResponse.value.StorageClass;
        objectInfo.serverSideEncryption = headResponse.value.ServerSideEncryption;
      }

      if (tagsResponse.status === 'fulfilled') {
        objectInfo.tags = tagsResponse.value.TagsObject || {};
      }

      return objectInfo;
    } catch (error) {
      return {
        exists: false,
        bucket,
        key,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async abortMultipartUpload(args: any): Promise<any> {
    const { bucket, key, uploadId } = args;

    if (!bucket || !key || !uploadId) {
      throw new Error("Bucket, key, and uploadId are required for abort multipart upload");
    }

    const command = new AbortMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId
    });

    return await this.client!.send(command);
  }

  private async listMultipartUploads(args: any): Promise<any> {
    const { bucket, prefix, maxUploads = 1000 } = args;

    if (!bucket) {
      throw new Error("Bucket is required for list multipart uploads");
    }

    const command = new ListMultipartUploadsCommand({
      Bucket: bucket,
      Prefix: prefix,
      MaxUploads: maxUploads
    });

    return await this.client!.send(command);
  }

  private async restoreObject(args: any): Promise<any> {
    const { bucket, key, restoreRequest } = args;

    if (!bucket || !key || !restoreRequest) {
      throw new Error("Bucket, key, and restoreRequest are required for restore object");
    }

    const command = new RestoreObjectCommand({
      Bucket: bucket,
      Key: key,
      RestoreRequest: restoreRequest
    });

    return await this.client!.send(command);
  }

  private async selectObjectContent(args: any): Promise<any> {
    const { bucket, key, selectExpression, inputSerialization, outputSerialization } = args;

    if (!bucket || !key || !selectExpression) {
      throw new Error("Bucket, key, and selectExpression are required for select object content");
    }

    const command = new SelectObjectContentCommand({
      Bucket: bucket,
      Key: key,
      Expression: selectExpression,
      ExpressionType: 'SQL',
      InputSerialization: inputSerialization || {
        JSON: { Type: 'DOCUMENT' },
        CompressionType: 'NONE'
      },
      OutputSerialization: outputSerialization || {
        JSON: { RecordDelimiter: '\n' }
      }
    });

    const response = await this.client!.send(command);
    
    // Process the streaming response
    const records: string[] = [];
    if (response.Payload) {
      for await (const event of response.Payload) {
        if (event.Records?.Payload) {
          const chunk = Buffer.from(event.Records.Payload).toString();
          records.push(chunk);
        }
      }
    }

    return {
      ...response,
      Records: records,
      ResultData: records.join('')
    };
  }

  private async getObjectAttributes(args: any): Promise<any> {
    const { bucket, key, objectAttributes = ['ETag', 'Checksum', 'ObjectParts', 'StorageClass', 'ObjectSize'] } = args;

    if (!bucket || !key) {
      throw new Error("Bucket and key are required for get object attributes");
    }

    const command = new GetObjectAttributesCommand({
      Bucket: bucket,
      Key: key,
      ObjectAttributes: objectAttributes
    });

    return await this.client!.send(command);
  }

  // Versioning Operations
  private async getBucketVersioning(args: any): Promise<any> {
    const { bucket } = args;

    if (!bucket) {
      throw new Error("Bucket name is required for get bucket versioning");
    }

    const command = new GetBucketVersioningCommand({
      Bucket: bucket
    });

    return await this.client!.send(command);
  }

  private async putBucketVersioning(args: any): Promise<any> {
    const { bucket, versioning } = args;

    if (!bucket || !versioning) {
      throw new Error("Bucket and versioning status are required for put bucket versioning");
    }

    const command = new PutBucketVersioningCommand({
      Bucket: bucket,
      VersioningConfiguration: {
        Status: versioning
      }
    });

    return await this.client!.send(command);
  }

  // Encryption Operations
  private async getBucketEncryption(args: any): Promise<any> {
    const { bucket } = args;

    if (!bucket) {
      throw new Error("Bucket name is required for get bucket encryption");
    }

    const command = new GetBucketEncryptionCommand({
      Bucket: bucket
    });

    return await this.client!.send(command);
  }

  private async putBucketEncryption(args: any): Promise<any> {
    const { bucket, encryptionConfiguration } = args;

    if (!bucket || !encryptionConfiguration) {
      throw new Error("Bucket and encryptionConfiguration are required for put bucket encryption");
    }

    const command = new PutBucketEncryptionCommand({
      Bucket: bucket,
      ServerSideEncryptionConfiguration: encryptionConfiguration
    });

    return await this.client!.send(command);
  }

  // ACL Operations
  private async getBucketAcl(args: any): Promise<any> {
    const { bucket } = args;

    if (!bucket) {
      throw new Error("Bucket name is required for get bucket ACL");
    }

    const command = new GetBucketAclCommand({
      Bucket: bucket
    });

    return await this.client!.send(command);
  }

  private async putBucketAcl(args: any): Promise<any> {
    const { bucket, acl } = args;

    if (!bucket || !acl) {
      throw new Error("Bucket and ACL are required for put bucket ACL");
    }

    const command = new PutBucketAclCommand({
      Bucket: bucket,
      ACL: acl
    });

    return await this.client!.send(command);
  }

  // CORS Operations
  private async getBucketCors(args: any): Promise<any> {
    const { bucket } = args;

    if (!bucket) {
      throw new Error("Bucket name is required for get bucket CORS");
    }

    const command = new GetBucketCorsCommand({
      Bucket: bucket
    });

    return await this.client!.send(command);
  }

  private async putBucketCors(args: any): Promise<any> {
    const { bucket, corsConfiguration } = args;

    if (!bucket || !corsConfiguration) {
      throw new Error("Bucket and CORS configuration are required for put bucket CORS");
    }

    const command = new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: corsConfiguration
    });

    return await this.client!.send(command);
  }

  private async deleteBucketCors(args: any): Promise<any> {
    const { bucket } = args;

    if (!bucket) {
      throw new Error("Bucket name is required for delete bucket CORS");
    }

    const command = new DeleteBucketCorsCommand({
      Bucket: bucket
    });

    return await this.client!.send(command);
  }

  // Website Operations
  private async getBucketWebsite(args: any): Promise<any> {
    const { bucket } = args;

    if (!bucket) {
      throw new Error("Bucket name is required for get bucket website");
    }

    const command = new GetBucketWebsiteCommand({
      Bucket: bucket
    });

    return await this.client!.send(command);
  }

  private async putBucketWebsite(args: any): Promise<any> {
    const { bucket, websiteConfiguration } = args;

    if (!bucket || !websiteConfiguration) {
      throw new Error("Bucket and website configuration are required for put bucket website");
    }

    const command = new PutBucketWebsiteCommand({
      Bucket: bucket,
      WebsiteConfiguration: websiteConfiguration
    });

    return await this.client!.send(command);
  }

  private async deleteBucketWebsite(args: any): Promise<any> {
    const { bucket } = args;

    if (!bucket) {
      throw new Error("Bucket name is required for delete bucket website");
    }

    const command = new DeleteBucketWebsiteCommand({
      Bucket: bucket
    });

    return await this.client!.send(command);
  }

  // Policy Operations
  private async getBucketPolicy(args: any): Promise<any> {
    const { bucket } = args;

    if (!bucket) {
      throw new Error("Bucket name is required for get bucket policy");
    }

    const command = new GetBucketPolicyCommand({
      Bucket: bucket
    });

    const response = await this.client!.send(command);
    
    return {
      ...response,
      PolicyObject: response.Policy ? JSON.parse(response.Policy) : null
    };
  }

  private async putBucketPolicy(args: any): Promise<any> {
    const { bucket, policy } = args;

    if (!bucket || !policy) {
      throw new Error("Bucket and policy are required for put bucket policy");
    }

    const policyString = typeof policy === 'string' ? policy : JSON.stringify(policy);

    const command = new PutBucketPolicyCommand({
      Bucket: bucket,
      Policy: policyString
    });

    return await this.client!.send(command);
  }

  private async deleteBucketPolicy(args: any): Promise<any> {
    const { bucket } = args;

    if (!bucket) {
      throw new Error("Bucket name is required for delete bucket policy");
    }

    const command = new DeleteBucketPolicyCommand({
      Bucket: bucket
    });

    return await this.client!.send(command);
  }

  // Notification Operations
  private async getBucketNotification(args: any): Promise<any> {
    const { bucket } = args;

    if (!bucket) {
      throw new Error("Bucket name is required for get bucket notification");
    }

    const command = new GetBucketNotificationConfigurationCommand({
      Bucket: bucket
    });

    return await this.client!.send(command);
  }

  private async putBucketNotification(args: any): Promise<any> {
    const { bucket, notificationConfiguration } = args;

    if (!bucket || !notificationConfiguration) {
      throw new Error("Bucket and notification configuration are required for put bucket notification");
    }

    const command = new PutBucketNotificationConfigurationCommand({
      Bucket: bucket,
      NotificationConfiguration: notificationConfiguration
    });

    return await this.client!.send(command);
  }

  private async syncFolder(args: any): Promise<any> {
    const { bucket, localPath, s3Prefix = '', deleteRemoved = false } = args;

    if (!bucket) {
      throw new Error("Bucket is required for sync folder");
    }

    // This is a placeholder for folder sync functionality
    // In a real implementation, you would:
    // 1. List local files
    // 2. List S3 objects with the prefix
    // 3. Compare and determine what needs to be uploaded/deleted
    // 4. Perform the sync operations

    console.log("⚠️ Folder sync is a placeholder - implement with your file system access");
    
    return {
      operation: "sync_folder",
      bucket,
      localPath,
      s3Prefix,
      deleteRemoved,
      message: "Folder sync requires file system access implementation"
    };
  }

  // Static utility methods
  static createStandardPayload(bucket: string, key: string, content: string, options?: {
    contentType?: string;
    metadata?: Record<string, string>;
    tags?: Record<string, string>;
    storageClass?: string;
  }): any {
    return {
      operation: "upload",
      bucket,
      key,
      content,
      contentType: options?.contentType || "application/octet-stream",
      metadata: options?.metadata,
      tags: options?.tags,
      storageClass: options?.storageClass || "STANDARD"
    };
  }

  static createImagePayload(bucket: string, key: string, base64Image: string, contentType: string): any {
    return {
      operation: "upload",
      bucket,
      key,
      content: base64Image,
      contentType,
      storageClass: "STANDARD"
    };
  }

  static createDocumentPayload(bucket: string, key: string, content: string, metadata?: Record<string, string>): any {
    return {
      operation: "upload",
      bucket,
      key,
      content,
      contentType: "application/pdf",
      metadata,
      storageClass: "STANDARD_IA"
    };
  }

  static createArchivePayload(bucket: string, key: string, content: string): any {
    return {
      operation: "upload",
      bucket,
      key,
      content,
      contentType: "application/zip",
      storageClass: "GLACIER"
    };
  }

  static createBackupPayload(bucket: string, key: string, content: string, metadata?: Record<string, string>): any {
    return {
      operation: "upload",
      bucket,
      key,
      content,
      contentType: "application/octet-stream",
      metadata: {
        purpose: "backup",
        timestamp: new Date().toISOString(),
        ...metadata
      },
      storageClass: "DEEP_ARCHIVE",
      serverSideEncryption: "AES256"
    };
  }

  static createWebsitePayload(indexDocument: string, errorDocument?: string): any {
    return {
      IndexDocument: {
        Suffix: indexDocument
      },
      ErrorDocument: errorDocument ? {
        Key: errorDocument
      } : undefined
    };
  }

  static createCorsPayload(allowedOrigins: string[], allowedMethods: string[], allowedHeaders?: string[]): any {
    return {
      CORSRules: [
        {
          AllowedOrigins: allowedOrigins,
          AllowedMethods: allowedMethods,
          AllowedHeaders: allowedHeaders || ["*"],
          MaxAgeSeconds: 3600
        }
      ]
    };
  }

  static createEncryptionPayload(algorithm: string = "AES256", kmsKeyId?: string): any {
    return {
      Rules: [
        {
          ApplyServerSideEncryptionByDefault: {
            SSEAlgorithm: algorithm,
            KMSMasterKeyID: kmsKeyId
          }
        }
      ]
    };
  }

  static createLifecyclePayload(rules: Array<{
    id: string;
    status: 'Enabled' | 'Disabled';
    transitions?: Array<{
      days: number;
      storageClass: string;
    }>;
    expiration?: {
      days: number;
    };
  }>): any {
    return {
      Rules: rules.map(rule => ({
        ID: rule.id,
        Status: rule.status,
        Transitions: rule.transitions,
        Expiration: rule.expiration
      }))
    };
  }

  // URL and identifier utilities
  static parseS3Url(s3Url: string): { bucket: string; key: string } | null {
    try {
      const url = new URL(s3Url);
      
      if (url.protocol === 's3:') {
        // s3://bucket/key format
        return {
          bucket: url.hostname,
          key: url.pathname.substring(1) // Remove leading slash
        };
      } else if (url.hostname.endsWith('.amazonaws.com')) {
        // https://bucket.s3.amazonaws.com/key format
        const bucketMatch = url.hostname.match(/^(.+)\.s3/);
        if (bucketMatch) {
          return {
            bucket: bucketMatch[1],
            key: url.pathname.substring(1)
          };
        }
      }
    } catch {
      // Invalid URL
    }
    
    return null;
  }

  static generateS3Url(bucket: string, key: string, region?: string): string {
    const regionPart = region && region !== 'us-east-1' ? `.${region}` : '';
    return `https://${bucket}.s3${regionPart}.amazonaws.com/${key}`;
  }

  static generateS3Uri(bucket: string, key: string): string {
    return `s3://${bucket}/${key}`;
  }

  static validateBucketName(bucketName: string): boolean {
    // S3 bucket naming rules
    if (bucketName.length < 3 || bucketName.length > 63) return false;
    if (!/^[a-z0-9.-]+$/.test(bucketName)) return false;
    if (bucketName.startsWith('.') || bucketName.endsWith('.')) return false;
    if (bucketName.includes('..')) return false;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(bucketName)) return false; // No IP addresses
    
    return true;
  }

  static validateObjectKey(objectKey: string): boolean {
    // S3 object key validation
    if (objectKey.length === 0 || objectKey.length > 1024) return false;
    // Keys should not start with '/' but can contain it
    return true; // S3 is quite permissive with object keys
  }

  static estimateStorageCost(sizeBytes: number, storageClass: string = 'STANDARD'): number {
    // Rough cost estimates per GB per month (as of 2024)
    const costs: Record<string, number> = {
      'STANDARD': 0.023,
      'STANDARD_IA': 0.0125,
      'ONEZONE_IA': 0.01,
      'GLACIER': 0.004,
      'DEEP_ARCHIVE': 0.00099,
      'INTELLIGENT_TIERING': 0.023
    };

    const sizeGB = sizeBytes / (1024 * 1024 * 1024);
    return sizeGB * (costs[storageClass] || costs['STANDARD']);
  }
}