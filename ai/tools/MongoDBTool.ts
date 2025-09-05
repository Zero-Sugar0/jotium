import { FunctionDeclaration, Type } from "@google/genai";
import { MongoClient, Db, ObjectId } from "mongodb";

export class MongoDBTool {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private connectionString: string;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
  }

  // Connection management
  async connect(): Promise<void> {
    if (!this.client) {
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  private async ensureConnection(): Promise<void> {
    if (!this.client) {
      await this.connect();
    }
  }

  private getDatabase(dbName: string): Db {
    if (!this.client) {
      throw new Error("Not connected to MongoDB. Call connect() first.");
    }
    return this.client.db(dbName);
  }

  // Database Operations
  getDatabaseOpsDefinition(): FunctionDeclaration {
    return {
      name: "mongodb_database_ops",
      description: "Perform database-level operations like listing databases, collections, creating/dropping databases and collections.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          operation: {
            type: Type.STRING,
            description: "Database operation to perform",
            enum: ["listDatabases", "listCollections", "createCollection", "dropCollection", "dropDatabase", "getDatabaseStats", "renameCollection"]
          },
          databaseName: {
            type: Type.STRING,
            description: "Name of the database to operate on"
          },
          collectionName: {
            type: Type.STRING,
            description: "Name of the collection (required for collection operations)"
          },
          newCollectionName: {
            type: Type.STRING,
            description: "New name for collection (for renameCollection operation)"
          },
          collectionOptions: {
            type: Type.OBJECT,
            description: "Options for collection creation (capped, size, max, etc.)"
          }
        },
        required: ["operation"]
      }
    };
  }

  // CRUD Operations
  getCRUDDefinition(): FunctionDeclaration {
    return {
      name: "mongodb_crud",
      description: "Perform CRUD (Create, Read, Update, Delete) operations on MongoDB collections. Supports single and bulk operations.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          operation: {
            type: Type.STRING,
            description: "CRUD operation to perform",
            enum: ["insertOne", "insertMany", "findOne", "findMany", "updateOne", "updateMany", "replaceOne", "deleteOne", "deleteMany", "countDocuments", "estimatedDocumentCount", "distinct"]
          },
          databaseName: {
            type: Type.STRING,
            description: "Name of the database"
          },
          collectionName: {
            type: Type.STRING,
            description: "Name of the collection"
          },
          document: {
            type: Type.OBJECT,
            description: "Document to insert (for insertOne, replaceOne)"
          },
          documents: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT },
            description: "Array of documents to insert (for insertMany)"
          },
          filter: {
            type: Type.OBJECT,
            description: "Query filter for find, update, delete operations"
          },
          update: {
            type: Type.OBJECT,
            description: "Update operations for updateOne/updateMany"
          },
          options: {
            type: Type.OBJECT,
            description: "Additional options (limit, skip, sort, projection, upsert, etc.)"
          },
          field: {
            type: Type.STRING,
            description: "Field name for distinct operation"
          }
        },
        required: ["operation", "databaseName", "collectionName"]
      }
    };
  }

  // Aggregation Operations
  getAggregationDefinition(): FunctionDeclaration {
    return {
      name: "mongodb_aggregation",
      description: "Perform complex aggregation operations using MongoDB's aggregation pipeline framework.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          databaseName: {
            type: Type.STRING,
            description: "Name of the database"
          },
          collectionName: {
            type: Type.STRING,
            description: "Name of the collection"
          },
          pipeline: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT },
            description: "Aggregation pipeline stages (e.g., $match, $group, $sort, $project, etc.)"
          },
          options: {
            type: Type.OBJECT,
            description: "Aggregation options (allowDiskUse, maxTimeMS, etc.)"
          }
        },
        required: ["databaseName", "collectionName", "pipeline"]
      }
    };
  }

  // Index Operations
  getIndexDefinition(): FunctionDeclaration {
    return {
      name: "mongodb_indexes",
      description: "Manage indexes on MongoDB collections for query optimization.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          operation: {
            type: Type.STRING,
            description: "Index operation to perform",
            enum: ["createIndex", "createIndexes", "dropIndex", "dropIndexes", "listIndexes", "reIndex"]
          },
          databaseName: {
            type: Type.STRING,
            description: "Name of the database"
          },
          collectionName: {
            type: Type.STRING,
            description: "Name of the collection"
          },
          indexSpec: {
            type: Type.OBJECT,
            description: "Index specification (field names and directions: 1 for ascending, -1 for descending)"
          },
          indexSpecs: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT },
            description: "Array of index specifications for createIndexes"
          },
          indexName: {
            type: Type.STRING,
            description: "Name of the index to drop"
          },
          indexOptions: {
            type: Type.OBJECT,
            description: "Index options (unique, sparse, background, name, etc.)"
          }
        },
        required: ["operation", "databaseName", "collectionName"]
      }
    };
  }

  // Get all tool definitions
  getAllDefinitions(): FunctionDeclaration[] {
    return [
      this.getDatabaseOpsDefinition(),
      this.getCRUDDefinition(),
      this.getAggregationDefinition(),
      this.getIndexDefinition()
    ];
  }

  // Database Operations Implementation
  async executeDatabaseOps(args: any): Promise<any> {
    try {
      await this.ensureConnection();
      const { operation, databaseName, collectionName, newCollectionName, collectionOptions } = args;

      switch (operation) {
        case "listDatabases":
          const adminDb = this.client!.db().admin();
          const databases = await adminDb.listDatabases();
          return {
            success: true,
            operation,
            databases: databases.databases.map(db => ({
              name: db.name,
              sizeOnDisk: db.sizeOnDisk,
              empty: db.empty
            })),
            totalSize: databases.totalSize
          };

        case "listCollections":
          if (!databaseName) throw new Error("databaseName is required");
          const db = this.getDatabase(databaseName);
          const collections = await db.listCollections().toArray();
          return {
            success: true,
            operation,
            databaseName,
            collections: collections.map(col => ({
              name: col.name,
              type: col.type,
              options: 'options' in col ? col.options : {}
            }))
          };

        case "createCollection":
          if (!databaseName || !collectionName) {
            throw new Error("databaseName and collectionName are required");
          }
          const createDb = this.getDatabase(databaseName);
          await createDb.createCollection(collectionName, collectionOptions || {});
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            created: true
          };

        case "dropCollection":
          if (!databaseName || !collectionName) {
            throw new Error("databaseName and collectionName are required");
          }
          const dropDb = this.getDatabase(databaseName);
          const dropped = await dropDb.collection(collectionName).drop();
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            dropped
          };

        case "dropDatabase":
          if (!databaseName) throw new Error("databaseName is required");
          const dropDbResult = await this.getDatabase(databaseName).dropDatabase();
          return {
            success: true,
            operation,
            databaseName,
            dropped: dropDbResult
          };

        case "getDatabaseStats":
          if (!databaseName) throw new Error("databaseName is required");
          const statsDb = this.getDatabase(databaseName);
          const stats = await statsDb.stats();
          return {
            success: true,
            operation,
            databaseName,
            stats: {
              collections: stats.collections,
              objects: stats.objects,
              dataSize: stats.dataSize,
              storageSize: stats.storageSize,
              indexes: stats.indexes,
              indexSize: stats.indexSize
            }
          };

        case "renameCollection":
          if (!databaseName || !collectionName || !newCollectionName) {
            throw new Error("databaseName, collectionName, and newCollectionName are required");
          }
          const renameDb = this.getDatabase(databaseName);
          await renameDb.collection(collectionName).rename(newCollectionName);
          return {
            success: true,
            operation,
            databaseName,
            oldName: collectionName,
            newName: newCollectionName,
            renamed: true
          };

        default:
          throw new Error(`Unknown database operation: ${operation}`);
      }
    } catch (error) {
      console.error("❌ Database operation failed:", error);
      return {
        success: false,
        error: `Database operation failed: ${error instanceof Error ? error.message : String(error)}`,
        operation: args.operation
      };
    }
  }

  // CRUD Operations Implementation
  async executeCRUD(args: any): Promise<any> {
    try {
      await this.ensureConnection();
      const { operation, databaseName, collectionName, document, documents, filter, update, options, field } = args;
      
      const db = this.getDatabase(databaseName);
      const collection = db.collection(collectionName);

      switch (operation) {
        case "insertOne":
          if (!document) throw new Error("document is required for insertOne");
          const insertResult = await collection.insertOne(document);
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            insertedId: insertResult.insertedId,
            acknowledged: insertResult.acknowledged
          };

        case "insertMany":
          if (!documents || !Array.isArray(documents)) {
            throw new Error("documents array is required for insertMany");
          }
          const insertManyResult = await collection.insertMany(documents, options);
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            insertedIds: insertManyResult.insertedIds,
            insertedCount: insertManyResult.insertedCount,
            acknowledged: insertManyResult.acknowledged
          };

        case "findOne":
          const foundDoc = await collection.findOne(filter || {}, options);
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            document: foundDoc,
            found: !!foundDoc
          };

        case "findMany":
          const cursor = collection.find(filter || {}, options);
          const docs = await cursor.toArray();
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            documents: docs,
            count: docs.length
          };

        case "updateOne":
          if (!update) throw new Error("update is required for updateOne");
          const updateResult = await collection.updateOne(filter || {}, update, options);
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            matchedCount: updateResult.matchedCount,
            modifiedCount: updateResult.modifiedCount,
            upsertedId: updateResult.upsertedId,
            acknowledged: updateResult.acknowledged
          };

        case "updateMany":
          if (!update) throw new Error("update is required for updateMany");
          const updateManyResult = await collection.updateMany(filter || {}, update, options);
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            matchedCount: updateManyResult.matchedCount,
            modifiedCount: updateManyResult.modifiedCount,
            upsertedId: updateManyResult.upsertedId,
            acknowledged: updateManyResult.acknowledged
          };

        case "replaceOne":
          if (!document) throw new Error("document is required for replaceOne");
          const replaceResult = await collection.replaceOne(filter || {}, document, options);
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            matchedCount: replaceResult.matchedCount,
            modifiedCount: replaceResult.modifiedCount,
            upsertedId: replaceResult.upsertedId,
            acknowledged: replaceResult.acknowledged
          };

        case "deleteOne":
          const deleteResult = await collection.deleteOne(filter || {}, options);
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            deletedCount: deleteResult.deletedCount,
            acknowledged: deleteResult.acknowledged
          };

        case "deleteMany":
          const deleteManyResult = await collection.deleteMany(filter || {}, options);
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            deletedCount: deleteManyResult.deletedCount,
            acknowledged: deleteManyResult.acknowledged
          };

        case "countDocuments":
          const count = await collection.countDocuments(filter || {}, options);
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            count
          };

        case "estimatedDocumentCount":
          const estimatedCount = await collection.estimatedDocumentCount(options);
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            estimatedCount
          };

        case "distinct":
          if (!field) throw new Error("field is required for distinct operation");
          const distinctValues = await collection.distinct(field, filter || {}, options);
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            field,
            values: distinctValues,
            count: distinctValues.length
          };

        default:
          throw new Error(`Unknown CRUD operation: ${operation}`);
      }
    } catch (error) {
      console.error("❌ CRUD operation failed:", error);
      return {
        success: false,
        error: `CRUD operation failed: ${error instanceof Error ? error.message : String(error)}`,
        operation: args.operation
      };
    }
  }

  // Aggregation Implementation
  async executeAggregation(args: any): Promise<any> {
    try {
      await this.ensureConnection();
      const { databaseName, collectionName, pipeline, options } = args;
      
      const db = this.getDatabase(databaseName);
      const collection = db.collection(collectionName);
      
      const cursor = collection.aggregate(pipeline, options);
      const results = await cursor.toArray();
      
      return {
        success: true,
        databaseName,
        collectionName,
        pipeline,
        results,
        resultCount: results.length,
        executedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("❌ Aggregation operation failed:", error);
      return {
        success: false,
        error: `Aggregation operation failed: ${error instanceof Error ? error.message : String(error)}`,
        databaseName: args.databaseName,
        collectionName: args.collectionName
      };
    }
  }

  // Index Operations Implementation
  async executeIndexOps(args: any): Promise<any> {
    try {
      await this.ensureConnection();
      const { operation, databaseName, collectionName, indexSpec, indexSpecs, indexName, indexOptions } = args;
      
      const db = this.getDatabase(databaseName);
      const collection = db.collection(collectionName);

      switch (operation) {
        case "createIndex":
          if (!indexSpec) throw new Error("indexSpec is required for createIndex");
          const indexResult = await collection.createIndex(indexSpec, indexOptions);
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            indexName: indexResult,
            indexSpec,
            created: true
          };

        case "createIndexes":
          if (!indexSpecs || !Array.isArray(indexSpecs)) {
            throw new Error("indexSpecs array is required for createIndexes");
          }
          const indexResults = await collection.createIndexes(indexSpecs);
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            indexNames: indexResults,
            indexSpecs,
            created: true
          };

        case "dropIndex":
          if (!indexName) throw new Error("indexName is required for dropIndex");
          await collection.dropIndex(indexName);
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            indexName,
            dropped: true
          };

        case "dropIndexes":
          await collection.dropIndexes();
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            allIndexesDropped: true
          };

        case "listIndexes":
          const indexes = await collection.listIndexes().toArray();
          return {
            success: true,
            operation,
            databaseName,
            collectionName,
            indexes: indexes.map((idx: any) => ({
              name: idx.name,
              key: idx.key,
              unique: idx.unique || false,
              sparse: idx.sparse || false,
              background: idx.background || false,
              v: idx.v || 1
            }))
          };

        default:
          throw new Error(`Unknown index operation: ${operation}`);
      }
    } catch (error) {
      console.error("❌ Index operation failed:", error);
      return {
        success: false,
        error: `Index operation failed: ${error instanceof Error ? error.message : String(error)}`,
        operation: args.operation
      };
    }
  }

  // Utility methods for common operations
  async getObjectId(id: string): Promise<ObjectId> {
    try {
      return new ObjectId(id);
    } catch {
      throw new Error(`Invalid ObjectId format: ${id}`);
    }
  }

  // Helper method to get project IDs (common use case)
  async getProjectIds(databaseName: string, collectionName: string = "projects", filter: any = {}): Promise<any> {
    const result = await this.executeCRUD({
      operation: "findMany",
      databaseName,
      collectionName,
      filter,
      options: { projection: { _id: 1, name: 1, title: 1 } }
    });
    
    return {
      success: result.success,
      projects: result.documents?.map((doc: any) => ({
        id: doc._id,
        name: doc.name || doc.title || 'Unnamed Project'
      })) || [],
      count: result.count || 0
    };
  }

  // Legacy methods for backward compatibility
  async find(databaseName: string, collectionName: string, filter: any = {}, options: any = {}): Promise<any> {
    return this.executeCRUD({ operation: "findMany", databaseName, collectionName, filter, options });
  }

  async findOne(databaseName: string, collectionName: string, filter: any = {}, options: any = {}): Promise<any> {
    return this.executeCRUD({ operation: "findOne", databaseName, collectionName, filter, options });
  }

  async insertOne(databaseName: string, collectionName: string, document: any): Promise<any> {
    return this.executeCRUD({ operation: "insertOne", databaseName, collectionName, document });
  }

  async insertMany(databaseName: string, collectionName: string, documents: any[]): Promise<any> {
    return this.executeCRUD({ operation: "insertMany", databaseName, collectionName, documents });
  }

  async updateOne(databaseName: string, collectionName: string, filter: any, update: any, options: any = {}): Promise<any> {
    return this.executeCRUD({ operation: "updateOne", databaseName, collectionName, filter, update, options });
  }

  async updateMany(databaseName: string, collectionName: string, filter: any, update: any, options: any = {}): Promise<any> {
    return this.executeCRUD({ operation: "updateMany", databaseName, collectionName, filter, update, options });
  }

  async deleteOne(databaseName: string, collectionName: string, filter: any, options: any = {}): Promise<any> {
    return this.executeCRUD({ operation: "deleteOne", databaseName, collectionName, filter, options });
  }

  async deleteMany(databaseName: string, collectionName: string, filter: any, options: any = {}): Promise<any> {
    return this.executeCRUD({ operation: "deleteMany", databaseName, collectionName, filter, options });
  }

  async aggregate(databaseName: string, collectionName: string, pipeline: any[], options: any = {}): Promise<any> {
    return this.executeAggregation({ databaseName, collectionName, pipeline, options });
  }

  async createIndex(databaseName: string, collectionName: string, indexSpec: any, options: any = {}): Promise<any> {
    return this.executeIndexOps({ 
      operation: "createIndex", 
      databaseName, 
      collectionName, 
      indexSpec, 
      indexOptions: options 
    });
  }

  async listCollections(databaseName: string): Promise<any> {
    return this.executeDatabaseOps({ operation: "listCollections", databaseName });
  }

  async listDatabases(): Promise<any> {
    return this.executeDatabaseOps({ operation: "listDatabases" });
  }

  // Query builder helper
  buildQuery(conditions: Array<{field: string, operator: string, value: any}>): any {
    const query: any = {};
    
    conditions.forEach(condition => {
      const { field, operator, value } = condition;
      
      switch (operator) {
        case 'equals':
          query[field] = value;
          break;
        case 'notEquals':
          query[field] = { $ne: value };
          break;
        case 'greaterThan':
          query[field] = { $gt: value };
          break;
        case 'greaterThanOrEqual':
          query[field] = { $gte: value };
          break;
        case 'lessThan':
          query[field] = { $lt: value };
          break;
        case 'lessThanOrEqual':
          query[field] = { $lte: value };
          break;
        case 'in':
          query[field] = { $in: Array.isArray(value) ? value : [value] };
          break;
        case 'notIn':
          query[field] = { $nin: Array.isArray(value) ? value : [value] };
          break;
        case 'exists':
          query[field] = { $exists: value };
          break;
        case 'regex':
          query[field] = { $regex: value, $options: 'i' };
          break;
        case 'contains':
          query[field] = { $regex: value, $options: 'i' };
          break;
        case 'startsWith':
          query[field] = { $regex: `^${value}`, $options: 'i' };
          break;
        case 'endsWith':
          query[field] = { $regex: `${value}$`, $options: 'i' };
          break;
        default:
          query[field] = value;
      }
    });
    
    return query;
  }

  // Connection health check
  async healthCheck(): Promise<any> {
    try {
      await this.ensureConnection();
      const adminDb = this.client!.db().admin();
      const result = await adminDb.ping();
      
      return {
        success: true,
        connected: true,
        ping: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        connected: false,
        error: `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}
