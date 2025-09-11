//ai/tools/ShopifyTool.ts
import { FunctionDeclaration, Type } from "@google/genai";
import { getValidOAuthAccessToken } from "@/lib/oauth-refresh";

export interface ShopifyConfig {
  storeDomain: string;
  accessToken: string;
}

export class ShopifyTool {
  private userId: string;
  private config: ShopifyConfig;
  private oauthToken: string | null;

  constructor(config: ShopifyConfig, userId: string, oauthToken: string | null = null) {
    this.config = config;
    this.userId = userId;
    this.oauthToken = oauthToken;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "shopify_operations",
      description: "Interact with Shopify stores to manage products, orders, customers, and store data. Supports both API key and OAuth authentication. Note: Shopify is migrating from REST to GraphQL API - this tool uses GraphQL for new integrations.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: ["list_products", "get_product", "create_product", "update_product", "delete_product", "list_orders", "get_order", "create_customer", "list_customers", "get_store_info", "create_webhook", "list_webhooks"]
          },
          // Product parameters
          productId: {
            type: Type.STRING,
            description: "Product ID for get_product, update_product, delete_product"
          },
          title: {
            type: Type.STRING,
            description: "Product title (required for create_product)"
          },
          description: {
            type: Type.STRING,
            description: "Product description (optional)"
          },
          price: {
            type: Type.NUMBER,
            description: "Product price (required for create_product)"
          },
          inventoryQuantity: {
            type: Type.NUMBER,
            description: "Inventory quantity (optional, default: 0)"
          },
          productType: {
            type: Type.STRING,
            description: "Product type (optional)"
          },
          vendor: {
            type: Type.STRING,
            description: "Product vendor (optional)"
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Product tags (optional)"
          },
          // Order parameters
          orderId: {
            type: Type.STRING,
            description: "Order ID for get_order"
          },
          maxResults: {
            type: Type.NUMBER,
            description: "Maximum number of results to return (default: 10, max: 100)"
          },
          // Customer parameters
          customerId: {
            type: Type.STRING,
            description: "Customer ID for specific customer operations"
          },
          email: {
            type: Type.STRING,
            description: "Customer email (required for create_customer)"
          },
          firstName: {
            type: Type.STRING,
            description: "Customer first name (required for create_customer)"
          },
          lastName: {
            type: Type.STRING,
            description: "Customer last name (required for create_customer)"
          },
          phone: {
            type: Type.STRING,
            description: "Customer phone (optional)"
          },
          // Webhook parameters
          webhookTopic: {
            type: Type.STRING,
            description: "Webhook topic for create_webhook (e.g., products/create, orders/create, customers/create)",
            enum: ["products/create", "products/update", "products/delete", "orders/create", "orders/updated", "orders/delete", "customers/create", "customers/update", "customers/delete"]
          },
          webhookUrl: {
            type: Type.STRING,
            description: "Webhook URL for create_webhook"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      let accessToken: string | null = this.oauthToken;
      let storeDomain: string | null = null;

      if (!accessToken) {
        // Try to get OAuth token
        accessToken = await getValidOAuthAccessToken(this.userId, "shopify");
        
        if (!accessToken && !this.config.accessToken) {
          return {
            success: false,
            error: "Shopify authentication not found. Please connect your Shopify account via OAuth or configure API credentials."
          };
        }
      }

      // Use config token if no OAuth token available
      if (!accessToken && this.config.accessToken) {
        accessToken = this.config.accessToken;
        storeDomain = this.config.storeDomain;
      } else if (accessToken) {
        // Get store domain from OAuth connection
        storeDomain = await this.getStoreDomain(accessToken);
      }

      if (!accessToken || !storeDomain) {
        return {
          success: false,
          error: "Could not authenticate with Shopify. Please check your credentials."
        };
      }

      const headers = {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      };

      switch (args.action) {
        case "list_products":
          return await this.listProducts(args, headers, storeDomain);
        case "get_product":
          return await this.getProduct(args, headers, storeDomain);
        case "create_product":
          return await this.createProduct(args, headers, storeDomain);
        case "update_product":
          return await this.updateProduct(args, headers, storeDomain);
        case "delete_product":
          return await this.deleteProduct(args, headers, storeDomain);
        case "list_orders":
          return await this.listOrders(args, headers, storeDomain);
        case "get_order":
          return await this.getOrder(args, headers, storeDomain);
        case "create_customer":
          return await this.createCustomer(args, headers, storeDomain);
        case "list_customers":
          return await this.listCustomers(args, headers, storeDomain);
        case "get_store_info":
          return await this.getStoreInfo(headers, storeDomain);
        case "create_webhook":
          return await this.createWebhook(args, headers, storeDomain);
        case "list_webhooks":
          return await this.listWebhooks(args, headers, storeDomain);
        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`
          };
      }
    } catch (error: unknown) {
      console.error("❌ Shopify operation failed:", error);
      return {
        success: false,
        error: `Shopify operation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async getStoreDomain(accessToken: string): Promise<string | null> {
    try {
      // Use the shop endpoint to get store information
      const response = await fetch('https://api.shopify.com/admin/api/2024-10/shop.json', {
        headers: {
          'X-Shopify-Access-Token': accessToken
        }
      });

      if (!response.ok) {
        console.error('Failed to get store domain:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      return data.shop.domain || data.shop.myshopify_domain;
    } catch (error) {
      console.error('Error getting store domain:', error);
      return null;
    }
  }

  private async listProducts(args: any, headers: any, storeDomain: string): Promise<any> {
    const maxResults = Math.min(args.maxResults || 10, 100);
    
    const query = `
      query {
        products(first: ${maxResults}) {
          edges {
            node {
              id
              title
              description
              vendor
              productType
              tags
              priceRangeV2 {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              totalInventory
              createdAt
              updatedAt
              status
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const response = await fetch(`https://${storeDomain}/admin/api/2024-10/graphql.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list products: ${error}` };
    }

    const result = await response.json();
    
    if (result.errors) {
      return { success: false, error: `GraphQL errors: ${JSON.stringify(result.errors)}` };
    }

    const products = result.data.products.edges.map((edge: any) => edge.node);
    
    return {
      success: true,
      products: products.map((product: any) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        vendor: product.vendor,
        productType: product.productType,
        tags: product.tags,
        price: product.priceRangeV2?.minVariantPrice?.amount,
        currency: product.priceRangeV2?.minVariantPrice?.currencyCode,
        inventoryQuantity: product.totalInventory,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        status: product.status
      })),
      pageInfo: result.data.products.pageInfo
    };
  }

  private async getProduct(args: any, headers: any, storeDomain: string): Promise<any> {
    if (!args.productId) {
      return { success: false, error: "Product ID is required" };
    }

    const query = `
      query {
        product(id: "${args.productId}") {
          id
          title
          description
          vendor
          productType
          tags
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          totalInventory
          createdAt
          updatedAt
          status
          variants(first: 10) {
            edges {
              node {
                id
                title
                price
                sku
                inventoryQuantity
              }
            }
          }
        }
      }
    `;

    const response = await fetch(`https://${storeDomain}/admin/api/2024-10/graphql.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get product: ${error}` };
    }

    const result = await response.json();
    
    if (result.errors) {
      return { success: false, error: `GraphQL errors: ${JSON.stringify(result.errors)}` };
    }

    if (!result.data.product) {
      return { success: false, error: "Product not found" };
    }

    const product = result.data.product;
    
    return {
      success: true,
      product: {
        id: product.id,
        title: product.title,
        description: product.description,
        vendor: product.vendor,
        productType: product.productType,
        tags: product.tags,
        price: product.priceRangeV2?.minVariantPrice?.amount,
        currency: product.priceRangeV2?.minVariantPrice?.currencyCode,
        inventoryQuantity: product.totalInventory,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        status: product.status,
        variants: product.variants?.edges?.map((edge: any) => ({
          id: edge.node.id,
          title: edge.node.title,
          price: edge.node.price,
          sku: edge.node.sku,
          inventoryQuantity: edge.node.inventoryQuantity
        })) || []
      }
    };
  }

  private async createProduct(args: any, headers: any, storeDomain: string): Promise<any> {
    if (!args.title || !args.price) {
      return { success: false, error: "Title and price are required for creating product" };
    }

    const mutation = `
      mutation {
        productCreate(input: {
          title: "${args.title}"
          descriptionHtml: "${args.description || ''}"
          productType: "${args.productType || ''}"
          vendor: "${args.vendor || ''}"
          tags: [${(args.tags || []).map((tag: string) => `"${tag}"`).join(', ')}]
        }) {
          product {
            id
            title
            description
            vendor
            productType
            tags
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await fetch(`https://${storeDomain}/admin/api/2024-10/graphql.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: mutation })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create product: ${error}` };
    }

    const result = await response.json();
    
    if (result.errors) {
      return { success: false, error: `GraphQL errors: ${JSON.stringify(result.errors)}` };
    }

    if (result.data.productCreate.userErrors?.length > 0) {
      return { success: false, error: `User errors: ${JSON.stringify(result.data.productCreate.userErrors)}` };
    }

    const product = result.data.productCreate.product;
    
    return {
      success: true,
      product: {
        id: product.id,
        title: product.title,
        description: product.description,
        vendor: product.vendor,
        productType: product.productType,
        tags: product.tags,
        status: product.status
      }
    };
  }

  private async updateProduct(args: any, headers: any, storeDomain: string): Promise<any> {
    if (!args.productId) {
      return { success: false, error: "Product ID is required for updating product" };
    }

    const inputFields = [];
    if (args.title) inputFields.push(`title: "${args.title}"`);
    if (args.description !== undefined) inputFields.push(`descriptionHtml: "${args.description}"`);
    if (args.productType) inputFields.push(`productType: "${args.productType}"`);
    if (args.vendor) inputFields.push(`vendor: "${args.vendor}"`);
    if (args.tags) inputFields.push(`tags: [${args.tags.map((tag: string) => `"${tag}"`).join(', ')}]`);

    if (inputFields.length === 0) {
      return { success: false, error: "At least one field to update is required" };
    }

    const mutation = `
      mutation {
        productUpdate(input: {
          id: "${args.productId}"
          ${inputFields.join('\n          ')}
        }) {
          product {
            id
            title
            description
            vendor
            productType
            tags
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await fetch(`https://${storeDomain}/admin/api/2024-10/graphql.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: mutation })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to update product: ${error}` };
    }

    const result = await response.json();
    
    if (result.errors) {
      return { success: false, error: `GraphQL errors: ${JSON.stringify(result.errors)}` };
    }

    if (result.data.productUpdate.userErrors?.length > 0) {
      return { success: false, error: `User errors: ${JSON.stringify(result.data.productUpdate.userErrors)}` };
    }

    const product = result.data.productUpdate.product;
    
    return {
      success: true,
      product: {
        id: product.id,
        title: product.title,
        description: product.description,
        vendor: product.vendor,
        productType: product.productType,
        tags: product.tags,
        status: product.status
      }
    };
  }

  private async deleteProduct(args: any, headers: any, storeDomain: string): Promise<any> {
    if (!args.productId) {
      return { success: false, error: "Product ID is required for deleting product" };
    }

    const mutation = `
      mutation {
        productDelete(input: {
          id: "${args.productId}"
        }) {
          deletedProductId
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await fetch(`https://${storeDomain}/admin/api/2024-10/graphql.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: mutation })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to delete product: ${error}` };
    }

    const result = await response.json();
    
    if (result.errors) {
      return { success: false, error: `GraphQL errors: ${JSON.stringify(result.errors)}` };
    }

    if (result.data.productDelete.userErrors?.length > 0) {
      return { success: false, error: `User errors: ${JSON.stringify(result.data.productDelete.userErrors)}` };
    }

    return {
      success: true,
      deletedProductId: result.data.productDelete.deletedProductId
    };
  }

  private async listOrders(args: any, headers: any, storeDomain: string): Promise<any> {
    const maxResults = Math.min(args.maxResults || 10, 100);
    
    const query = `
      query {
        orders(first: ${maxResults}) {
          edges {
            node {
              id
              name
              email
              financialStatus
              fulfillmentStatus
              currencyCode
              totalPrice
              createdAt
              updatedAt
              customer {
                id
                firstName
                lastName
                email
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const response = await fetch(`https://${storeDomain}/admin/api/2024-10/graphql.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list orders: ${error}` };
    }

    const result = await response.json();
    
    if (result.errors) {
      return { success: false, error: `GraphQL errors: ${JSON.stringify(result.errors)}` };
    }

    const orders = result.data.orders.edges.map((edge: any) => edge.node);
    
    return {
      success: true,
      orders: orders.map((order: any) => ({
        id: order.id,
        name: order.name,
        email: order.email,
        financialStatus: order.financialStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        currency: order.currencyCode,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        customer: order.customer ? {
          id: order.customer.id,
          firstName: order.customer.firstName,
          lastName: order.customer.lastName,
          email: order.customer.email
        } : null
      })),
      pageInfo: result.data.orders.pageInfo
    };
  }

  private async getOrder(args: any, headers: any, storeDomain: string): Promise<any> {
    if (!args.orderId) {
      return { success: false, error: "Order ID is required" };
    }

    const query = `
      query {
        order(id: "${args.orderId}") {
          id
          name
          email
          financialStatus
          fulfillmentStatus
          currencyCode
          totalPrice
          subtotalPrice
          totalTax
          createdAt
          updatedAt
          customer {
            id
            firstName
            lastName
            email
          }
          lineItems(first: 10) {
            edges {
              node {
                id
                title
                quantity
                price
                variant {
                  id
                  title
                  sku
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(`https://${storeDomain}/admin/api/2024-10/graphql.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get order: ${error}` };
    }

    const result = await response.json();
    
    if (result.errors) {
      return { success: false, error: `GraphQL errors: ${JSON.stringify(result.errors)}` };
    }

    if (!result.data.order) {
      return { success: false, error: "Order not found" };
    }

    const order = result.data.order;
    
    return {
      success: true,
      order: {
        id: order.id,
        name: order.name,
        email: order.email,
        financialStatus: order.financialStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        currency: order.currencyCode,
        totalPrice: order.totalPrice,
        subtotalPrice: order.subtotalPrice,
        totalTax: order.totalTax,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        customer: order.customer ? {
          id: order.customer.id,
          firstName: order.customer.firstName,
          lastName: order.customer.lastName,
          email: order.customer.email
        } : null,
        lineItems: order.lineItems?.edges?.map((edge: any) => ({
          id: edge.node.id,
          title: edge.node.title,
          quantity: edge.node.quantity,
          price: edge.node.price,
          variant: edge.node.variant ? {
            id: edge.node.variant.id,
            title: edge.node.variant.title,
            sku: edge.node.variant.sku
          } : null
        })) || []
      }
    };
  }

  private async createCustomer(args: any, headers: any, storeDomain: string): Promise<any> {
    if (!args.email || !args.firstName || !args.lastName) {
      return { success: false, error: "Email, firstName, and lastName are required for creating customer" };
    }

    const mutation = `
      mutation {
        customerCreate(input: {
          email: "${args.email}"
          firstName: "${args.firstName}"
          lastName: "${args.lastName}"
          phone: "${args.phone || ''}"
        }) {
          customer {
            id
            email
            firstName
            lastName
            phone
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await fetch(`https://${storeDomain}/admin/api/2024-10/graphql.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: mutation })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create customer: ${error}` };
    }

    const result = await response.json();
    
    if (result.errors) {
      return { success: false, error: `GraphQL errors: ${JSON.stringify(result.errors)}` };
    }

    if (result.data.customerCreate.userErrors?.length > 0) {
      return { success: false, error: `User errors: ${JSON.stringify(result.data.customerCreate.userErrors)}` };
    }

    const customer = result.data.customerCreate.customer;
    
    return {
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      }
    };
  }

  private async listCustomers(args: any, headers: any, storeDomain: string): Promise<any> {
    const maxResults = Math.min(args.maxResults || 10, 100);
    
    const query = `
      query {
        customers(first: ${maxResults}) {
          edges {
            node {
              id
              email
              firstName
              lastName
              phone
              createdAt
              updatedAt
              ordersCount
              totalSpent
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const response = await fetch(`https://${storeDomain}/admin/api/2024-10/graphql.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list customers: ${error}` };
    }

    const result = await response.json();
    
    if (result.errors) {
      return { success: false, error: `GraphQL errors: ${JSON.stringify(result.errors)}` };
    }

    const customers = result.data.customers.edges.map((edge: any) => edge.node);
    
    return {
      success: true,
      customers: customers.map((customer: any) => ({
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        ordersCount: customer.ordersCount,
        totalSpent: customer.totalSpent
      })),
      pageInfo: result.data.customers.pageInfo
    };
  }

  private async getStoreInfo(headers: any, storeDomain: string): Promise<any> {
    const query = `
      query {
        shop {
          id
          name
          email
          domain
          myshopifyDomain
          country
          currencyCode
          timezone
          plan {
            displayName
            partnerDevelopment
          }
          contactEmail
          customerEmail
          description
          moneyFormat
          moneyWithCurrencyFormat
          enabledPresentmentCurrencies
          primaryLocale
          unitSystem
          weightUnit
        }
      }
    `;

    const response = await fetch(`https://${storeDomain}/admin/api/2024-10/graphql.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get store info: ${error}` };
    }

    const result = await response.json();
    
    if (result.errors) {
      return { success: false, error: `GraphQL errors: ${JSON.stringify(result.errors)}` };
    }

    const shop = result.data.shop;
    
    return {
      success: true,
      store: {
        id: shop.id,
        name: shop.name,
        email: shop.email,
        domain: shop.domain,
        myshopifyDomain: shop.myshopifyDomain,
        country: shop.country,
        currency: shop.currencyCode,
        timezone: shop.timezone,
        plan: shop.plan ? {
          displayName: shop.plan.displayName,
          partnerDevelopment: shop.plan.partnerDevelopment
        } : null,
        contactEmail: shop.contactEmail,
        customerEmail: shop.customerEmail,
        description: shop.description,
        moneyFormat: shop.moneyFormat,
        moneyWithCurrencyFormat: shop.moneyWithCurrencyFormat,
        enabledPresentmentCurrencies: shop.enabledPresentmentCurrencies,
        primaryLocale: shop.primaryLocale,
        unitSystem: shop.unitSystem,
        weightUnit: shop.weightUnit
      }
    };
  }

  private async createWebhook(args: any, headers: any, storeDomain: string): Promise<any> {
    if (!args.webhookTopic || !args.webhookUrl) {
      return { success: false, error: "webhookTopic and webhookUrl are required for creating webhook" };
    }

    const mutation = `
      mutation {
        webhookSubscriptionCreate(topic: ${args.webhookTopic}, webhookSubscription: {
          callbackUrl: "${args.webhookUrl}"
          format: JSON
        }) {
          webhookSubscription {
            id
            topic
            callbackUrl
            format
            createdAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await fetch(`https://${storeDomain}/admin/api/2024-10/graphql.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: mutation })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create webhook: ${error}` };
    }

    const result = await response.json();
    
    if (result.errors) {
      return { success: false, error: `GraphQL errors: ${JSON.stringify(result.errors)}` };
    }

    if (result.data.webhookSubscriptionCreate.userErrors?.length > 0) {
      return { success: false, error: `User errors: ${JSON.stringify(result.data.webhookSubscriptionCreate.userErrors)}` };
    }

    const webhook = result.data.webhookSubscriptionCreate.webhookSubscription;
    
    return {
      success: true,
      webhook: {
        id: webhook.id,
        topic: webhook.topic,
        callbackUrl: webhook.callbackUrl,
        format: webhook.format,
        createdAt: webhook.createdAt
      }
    };
  }

  private async listWebhooks(args: any, headers: any, storeDomain: string): Promise<any> {
    const maxResults = Math.min(args.maxResults || 10, 100);
    
    const query = `
      query {
        webhookSubscriptions(first: ${maxResults}) {
          edges {
            node {
              id
              topic
              callbackUrl
              format
              createdAt
              updatedAt
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const response = await fetch(`https://${storeDomain}/admin/api/2024-10/graphql.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list webhooks: ${error}` };
    }

    const result = await response.json();
    
    if (result.errors) {
      return { success: false, error: `GraphQL errors: ${JSON.stringify(result.errors)}` };
    }

    const webhooks = result.data.webhookSubscriptions.edges.map((edge: any) => edge.node);
    
    return {
      success: true,
      webhooks: webhooks.map((webhook: any) => ({
        id: webhook.id,
        topic: webhook.topic,
        callbackUrl: webhook.callbackUrl,
        format: webhook.format,
        createdAt: webhook.createdAt,
        updatedAt: webhook.updatedAt
      })),
      pageInfo: result.data.webhookSubscriptions.pageInfo
    };
  }
}
