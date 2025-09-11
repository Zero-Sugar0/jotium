import { FunctionDeclaration, Type } from "@google/genai";
import { getValidOAuthAccessToken } from "@/lib/oauth-refresh";

export class QuickBooksTool {
  private userId: string;
  private baseUrl = 'https://sandbox-quickbooks.api.intuit.com/v3';
  private productionUrl = 'https://quickbooks.api.intuit.com/v3';

  constructor(userId: string) {
    this.userId = userId;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "quickbooks_operations",
      description: "Interact with QuickBooks Online API to manage customers, invoices, payments, accounts, and financial data. Requires QuickBooks OAuth connection.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: [
              "create_customer",
              "get_customer",
              "update_customer",
              "list_customers",
              "create_invoice",
              "get_invoice",
              "update_invoice",
              "list_invoices",
              "create_payment",
              "get_payment",
              "list_payments",
              "create_account",
              "get_account",
              "update_account",
              "list_accounts",
              "get_company_info",
              "create_item",
              "get_item",
              "update_item",
              "list_items",
              "create_vendor",
              "get_vendor",
              "update_vendor",
              "list_vendors",
              "get_reports",
              "create_bill",
              "get_bill",
              "update_bill",
              "list_bills"
            ]
          },
          // Common parameters
          companyId: {
            type: Type.STRING,
            description: "QuickBooks company/realm ID (required for most operations)"
          },
          entityId: {
            type: Type.STRING,
            description: "Entity ID for get/update operations"
          },
          // Customer parameters
          customerData: {
            type: Type.OBJECT,
            description: "Customer data for create/update operations",
            properties: {
              DisplayName: { type: Type.STRING },
              Title: { type: Type.STRING },
              GivenName: { type: Type.STRING },
              MiddleName: { type: Type.STRING },
              FamilyName: { type: Type.STRING },
              Suffix: { type: Type.STRING },
              CompanyName: { type: Type.STRING },
              PrimaryEmailAddr: {
                type: Type.OBJECT,
                properties: {
                  Address: { type: Type.STRING }
                }
              },
              PrimaryPhone: {
                type: Type.OBJECT,
                properties: {
                  FreeFormNumber: { type: Type.STRING }
                }
              },
              BillAddr: {
                type: Type.OBJECT,
                properties: {
                  Line1: { type: Type.STRING },
                  Line2: { type: Type.STRING },
                  City: { type: Type.STRING },
                  Country: { type: Type.STRING },
                  CountrySubDivisionCode: { type: Type.STRING },
                  PostalCode: { type: Type.STRING }
                }
              }
            }
          },
          // Invoice parameters
          invoiceData: {
            type: Type.OBJECT,
            description: "Invoice data for create/update operations",
            properties: {
              Line: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    Amount: { type: Type.NUMBER },
                    DetailType: { type: Type.STRING },
                    SalesItemLineDetail: {
                      type: Type.OBJECT,
                      properties: {
                        ItemRef: {
                          type: Type.OBJECT,
                          properties: {
                            value: { type: Type.STRING }
                          }
                        },
                        Qty: { type: Type.NUMBER },
                        UnitPrice: { type: Type.NUMBER }
                      }
                    }
                  }
                }
              },
              CustomerRef: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.STRING }
                }
              },
              DueDate: { type: Type.STRING },
              TxnDate: { type: Type.STRING }
            }
          },
          // Payment parameters
          paymentData: {
            type: Type.OBJECT,
            description: "Payment data for create operations",
            properties: {
              CustomerRef: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.STRING }
                }
              },
              TotalAmt: { type: Type.NUMBER },
              TxnDate: { type: Type.STRING },
              Line: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    Amount: { type: Type.NUMBER },
                    LinkedTxn: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          TxnId: { type: Type.STRING },
                          TxnType: { type: Type.STRING }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          // Account parameters
          accountData: {
            type: Type.OBJECT,
            description: "Account data for create/update operations",
            properties: {
              Name: { type: Type.STRING },
              AccountType: { type: Type.STRING },
              AccountSubType: { type: Type.STRING },
              Description: { type: Type.STRING },
              Classification: { type: Type.STRING },
              CurrencyRef: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.STRING }
                }
              }
            }
          },
          // Item parameters
          itemData: {
            type: Type.OBJECT,
            description: "Item data for create/update operations",
            properties: {
              Name: { type: Type.STRING },
              Description: { type: Type.STRING },
              Type: { type: Type.STRING },
              IncomeAccountRef: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.STRING }
                }
              },
              ExpenseAccountRef: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.STRING }
                }
              },
              UnitPrice: { type: Type.NUMBER },
              PurchaseCost: { type: Type.NUMBER }
            }
          },
          // Vendor parameters
          vendorData: {
            type: Type.OBJECT,
            description: "Vendor data for create/update operations",
            properties: {
              DisplayName: { type: Type.STRING },
              CompanyName: { type: Type.STRING },
              PrimaryEmailAddr: {
                type: Type.OBJECT,
                properties: {
                  Address: { type: Type.STRING }
                }
              },
              PrimaryPhone: {
                type: Type.OBJECT,
                properties: {
                  FreeFormNumber: { type: Type.STRING }
                }
              }
            }
          },
          // Bill parameters
          billData: {
            type: Type.OBJECT,
            description: "Bill data for create/update operations",
            properties: {
              VendorRef: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.STRING }
                }
              },
              APAccountRef: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.STRING }
                }
              },
              TxnDate: { type: Type.STRING },
              DueDate: { type: Type.STRING },
              TotalAmt: { type: Type.NUMBER },
              Line: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    Amount: { type: Type.NUMBER },
                    DetailType: { type: Type.STRING },
                    AccountBasedExpenseLineDetail: {
                      type: Type.OBJECT,
                      properties: {
                        AccountRef: {
                          type: Type.OBJECT,
                          properties: {
                            value: { type: Type.STRING }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          // Report parameters
          reportType: {
            type: Type.STRING,
            description: "Type of report to generate",
            enum: ["BalanceSheet", "ProfitAndLoss", "CashFlow", "TrialBalance", "AgedReceivables", "AgedPayables"]
          },
          startDate: {
            type: Type.STRING,
            description: "Start date for reports (YYYY-MM-DD)"
          },
          endDate: {
            type: Type.STRING,
            description: "End date for reports (YYYY-MM-DD)"
          },
          // Query parameters
          query: {
            type: Type.STRING,
            description: "Query string for filtering results"
          },
          limit: {
            type: Type.NUMBER,
            description: "Maximum number of results to return (default: 10, max: 1000)"
          },
          offset: {
            type: Type.NUMBER,
            description: "Number of results to skip for pagination"
          },
          fetchAll: {
            type: Type.BOOLEAN,
            description: "Fetch all results regardless of limit"
          },
          // Environment
          sandbox: {
            type: Type.BOOLEAN,
            description: "Use sandbox environment (default: true)"
          }
        },
        required: ["action", "companyId"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const accessToken = await getValidOAuthAccessToken(this.userId, "quickbooks");

      if (!accessToken) {
        return {
          success: false,
          error: "QuickBooks OAuth connection not found. Please connect your QuickBooks account first."
        };
      }

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const baseUrl = args.sandbox !== false ? this.baseUrl : this.productionUrl;

      switch (args.action) {
        // Customer operations
        case "create_customer":
          return await this.createCustomer(args, headers, baseUrl);
        case "get_customer":
          return await this.getCustomer(args, headers, baseUrl);
        case "update_customer":
          return await this.updateCustomer(args, headers, baseUrl);
        case "list_customers":
          return await this.listCustomers(args, headers, baseUrl);
        
        // Invoice operations
        case "create_invoice":
          return await this.createInvoice(args, headers, baseUrl);
        case "get_invoice":
          return await this.getInvoice(args, headers, baseUrl);
        case "update_invoice":
          return await this.updateInvoice(args, headers, baseUrl);
        case "list_invoices":
          return await this.listInvoices(args, headers, baseUrl);
        
        // Payment operations
        case "create_payment":
          return await this.createPayment(args, headers, baseUrl);
        case "get_payment":
          return await this.getPayment(args, headers, baseUrl);
        case "list_payments":
          return await this.listPayments(args, headers, baseUrl);
        
        // Account operations
        case "create_account":
          return await this.createAccount(args, headers, baseUrl);
        case "get_account":
          return await this.getAccount(args, headers, baseUrl);
        case "update_account":
          return await this.updateAccount(args, headers, baseUrl);
        case "list_accounts":
          return await this.listAccounts(args, headers, baseUrl);
        
        // Company info
        case "get_company_info":
          return await this.getCompanyInfo(args, headers, baseUrl);
        
        // Item operations
        case "create_item":
          return await this.createItem(args, headers, baseUrl);
        case "get_item":
          return await this.getItem(args, headers, baseUrl);
        case "update_item":
          return await this.updateItem(args, headers, baseUrl);
        case "list_items":
          return await this.listItems(args, headers, baseUrl);
        
        // Vendor operations
        case "create_vendor":
          return await this.createVendor(args, headers, baseUrl);
        case "get_vendor":
          return await this.getVendor(args, headers, baseUrl);
        case "update_vendor":
          return await this.updateVendor(args, headers, baseUrl);
        case "list_vendors":
          return await this.listVendors(args, headers, baseUrl);
        
        // Report operations
        case "get_reports":
          return await this.getReports(args, headers, baseUrl);
        
        // Bill operations
        case "create_bill":
          return await this.createBill(args, headers, baseUrl);
        case "get_bill":
          return await this.getBill(args, headers, baseUrl);
        case "update_bill":
          return await this.updateBill(args, headers, baseUrl);
        case "list_bills":
          return await this.listBills(args, headers, baseUrl);
        
        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`
          };
      }
    } catch (error: unknown) {
      console.error("❌ QuickBooks operation failed:", error);
      return {
        success: false,
        error: `QuickBooks operation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Customer operations
  private async createCustomer(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.customerData) {
      return { success: false, error: "Customer data is required" };
    }

    const response = await fetch(`${baseUrl}/company/${args.companyId}/customer`, {
      method: 'POST',
      headers,
      body: JSON.stringify(args.customerData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create customer: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      customer: result.Customer
    };
  }

  private async getCustomer(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.entityId) {
      return { success: false, error: "Customer ID is required" };
    }

    const response = await fetch(`${baseUrl}/company/${args.companyId}/customer/${args.entityId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get customer: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      customer: result.Customer
    };
  }

  private async updateCustomer(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.entityId || !args.customerData) {
      return { success: false, error: "Customer ID and data are required" };
    }

    const customerData = {
      ...args.customerData,
      Id: args.entityId,
      sparse: true
    };

    const response = await fetch(`${baseUrl}/company/${args.companyId}/customer`, {
      method: 'POST',
      headers,
      body: JSON.stringify(customerData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to update customer: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      customer: result.Customer
    };
  }

  private async listCustomers(args: any, headers: any, baseUrl: string): Promise<any> {
    const params = new URLSearchParams();
    if (args.query) params.append('query', args.query);
    if (args.limit) params.append('limit', String(Math.min(args.limit, 1000)));
    if (args.offset) params.append('offset', String(args.offset));

    const response = await fetch(`${baseUrl}/company/${args.companyId}/query?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list customers: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      customers: result.QueryResponse.Customer || [],
      totalCount: result.QueryResponse.totalCount
    };
  }

  // Invoice operations
  private async createInvoice(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.invoiceData) {
      return { success: false, error: "Invoice data is required" };
    }

    const response = await fetch(`${baseUrl}/company/${args.companyId}/invoice`, {
      method: 'POST',
      headers,
      body: JSON.stringify(args.invoiceData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create invoice: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      invoice: result.Invoice
    };
  }

  private async getInvoice(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.entityId) {
      return { success: false, error: "Invoice ID is required" };
    }

    const response = await fetch(`${baseUrl}/company/${args.companyId}/invoice/${args.entityId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get invoice: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      invoice: result.Invoice
    };
  }

  private async updateInvoice(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.entityId || !args.invoiceData) {
      return { success: false, error: "Invoice ID and data are required" };
    }

    const invoiceData = {
      ...args.invoiceData,
      Id: args.entityId,
      sparse: true
    };

    const response = await fetch(`${baseUrl}/company/${args.companyId}/invoice`, {
      method: 'POST',
      headers,
      body: JSON.stringify(invoiceData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to update invoice: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      invoice: result.Invoice
    };
  }

  private async listInvoices(args: any, headers: any, baseUrl: string): Promise<any> {
    const params = new URLSearchParams();
    if (args.query) params.append('query', args.query);
    if (args.limit) params.append('limit', String(Math.min(args.limit, 1000)));
    if (args.offset) params.append('offset', String(args.offset));

    const response = await fetch(`${baseUrl}/company/${args.companyId}/query?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list invoices: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      invoices: result.QueryResponse.Invoice || [],
      totalCount: result.QueryResponse.totalCount
    };
  }

  // Payment operations
  private async createPayment(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.paymentData) {
      return { success: false, error: "Payment data is required" };
    }

    const response = await fetch(`${baseUrl}/company/${args.companyId}/payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify(args.paymentData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create payment: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      payment: result.Payment
    };
  }

  private async getPayment(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.entityId) {
      return { success: false, error: "Payment ID is required" };
    }

    const response = await fetch(`${baseUrl}/company/${args.companyId}/payment/${args.entityId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get payment: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      payment: result.Payment
    };
  }

  private async listPayments(args: any, headers: any, baseUrl: string): Promise<any> {
    const params = new URLSearchParams();
    if (args.query) params.append('query', args.query);
    if (args.limit) params.append('limit', String(Math.min(args.limit, 1000)));
    if (args.offset) params.append('offset', String(args.offset));

    const response = await fetch(`${baseUrl}/company/${args.companyId}/query?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list payments: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      payments: result.QueryResponse.Payment || [],
      totalCount: result.QueryResponse.totalCount
    };
  }

  // Account operations
  private async createAccount(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.accountData) {
      return { success: false, error: "Account data is required" };
    }

    const response = await fetch(`${baseUrl}/company/${args.companyId}/account`, {
      method: 'POST',
      headers,
      body: JSON.stringify(args.accountData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create account: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      account: result.Account
    };
  }

  private async getAccount(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.entityId) {
      return { success: false, error: "Account ID is required" };
    }

    const response = await fetch(`${baseUrl}/company/${args.companyId}/account/${args.entityId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get account: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      account: result.Account
    };
  }

  private async updateAccount(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.entityId || !args.accountData) {
      return { success: false, error: "Account ID and data are required" };
    }

    const accountData = {
      ...args.accountData,
      Id: args.entityId,
      sparse: true
    };

    const response = await fetch(`${baseUrl}/company/${args.companyId}/account`, {
      method: 'POST',
      headers,
      body: JSON.stringify(accountData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to update account: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      account: result.Account
    };
  }

  private async listAccounts(args: any, headers: any, baseUrl: string): Promise<any> {
    const params = new URLSearchParams();
    if (args.query) params.append('query', args.query);
    if (args.limit) params.append('limit', String(Math.min(args.limit, 1000)));
    if (args.offset) params.append('offset', String(args.offset));

    const response = await fetch(`${baseUrl}/company/${args.companyId}/query?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list accounts: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      accounts: result.QueryResponse.Account || [],
      totalCount: result.QueryResponse.totalCount
    };
  }

  // Company info
  private async getCompanyInfo(args: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/company/${args.companyId}/companyinfo/${args.companyId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get company info: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      companyInfo: result.CompanyInfo
    };
  }

  // Item operations
  private async createItem(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.itemData) {
      return { success: false, error: "Item data is required" };
    }

    const response = await fetch(`${baseUrl}/company/${args.companyId}/item`, {
      method: 'POST',
      headers,
      body: JSON.stringify(args.itemData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create item: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      item: result.Item
    };
  }

  private async getItem(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.entityId) {
      return { success: false, error: "Item ID is required" };
    }

    const response = await fetch(`${baseUrl}/company/${args.companyId}/item/${args.entityId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get item: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      item: result.Item
    };
  }

  private async updateItem(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.entityId || !args.itemData) {
      return { success: false, error: "Item ID and data are required" };
    }

    const itemData = {
      ...args.itemData,
      Id: args.entityId,
      sparse: true
    };

    const response = await fetch(`${baseUrl}/company/${args.companyId}/item`, {
      method: 'POST',
      headers,
      body: JSON.stringify(itemData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to update item: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      item: result.Item
    };
  }

  private async listItems(args: any, headers: any, baseUrl: string): Promise<any> {
    const params = new URLSearchParams();
    if (args.query) params.append('query', args.query);
    if (args.limit) params.append('limit', String(Math.min(args.limit, 1000)));
    if (args.offset) params.append('offset', String(args.offset));

    const response = await fetch(`${baseUrl}/company/${args.companyId}/query?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list items: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      items: result.QueryResponse.Item || [],
      totalCount: result.QueryResponse.totalCount
    };
  }

  // Vendor operations
  private async createVendor(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.vendorData) {
      return { success: false, error: "Vendor data is required" };
    }

    const response = await fetch(`${baseUrl}/company/${args.companyId}/vendor`, {
      method: 'POST',
      headers,
      body: JSON.stringify(args.vendorData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create vendor: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      vendor: result.Vendor
    };
  }

  private async getVendor(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.entityId) {
      return { success: false, error: "Vendor ID is required" };
    }

    const response = await fetch(`${baseUrl}/company/${args.companyId}/vendor/${args.entityId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get vendor: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      vendor: result.Vendor
    };
  }

  private async updateVendor(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.entityId || !args.vendorData) {
      return { success: false, error: "Vendor ID and data are required" };
    }

    const vendorData = {
      ...args.vendorData,
      Id: args.entityId,
      sparse: true
    };

    const response = await fetch(`${baseUrl}/company/${args.companyId}/vendor`, {
      method: 'POST',
      headers,
      body: JSON.stringify(vendorData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to update vendor: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      vendor: result.Vendor
    };
  }

  private async listVendors(args: any, headers: any, baseUrl: string): Promise<any> {
    const params = new URLSearchParams();
    if (args.query) params.append('query', args.query);
    if (args.limit) params.append('limit', String(Math.min(args.limit, 1000)));
    if (args.offset) params.append('offset', String(args.offset));

    const response = await fetch(`${baseUrl}/company/${args.companyId}/query?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list vendors: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      vendors: result.QueryResponse.Vendor || [],
      totalCount: result.QueryResponse.totalCount
    };
  }

  // Report operations
  private async getReports(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.reportType) {
      return { success: false, error: "Report type is required" };
    }

    const params = new URLSearchParams();
    params.append('reportType', args.reportType);
    if (args.startDate) params.append('start_date', args.startDate);
    if (args.endDate) params.append('end_date', args.endDate);

    const response = await fetch(`${baseUrl}/company/${args.companyId}/reports?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get reports: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      reports: result
    };
  }

  // Bill operations
  private async createBill(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.billData) {
      return { success: false, error: "Bill data is required" };
    }

    const response = await fetch(`${baseUrl}/company/${args.companyId}/bill`, {
      method: 'POST',
      headers,
      body: JSON.stringify(args.billData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create bill: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      bill: result.Bill
    };
  }

  private async getBill(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.entityId) {
      return { success: false, error: "Bill ID is required" };
    }

    const response = await fetch(`${baseUrl}/company/${args.companyId}/bill/${args.entityId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get bill: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      bill: result.Bill
    };
  }

  private async updateBill(args: any, headers: any, baseUrl: string): Promise<any> {
    if (!args.entityId || !args.billData) {
      return { success: false, error: "Bill ID and data are required" };
    }

    const billData = {
      ...args.billData,
      Id: args.entityId,
      sparse: true
    };

    const response = await fetch(`${baseUrl}/company/${args.companyId}/bill`, {
      method: 'POST',
      headers,
      body: JSON.stringify(billData)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to update bill: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      bill: result.Bill
    };
  }

  private async listBills(args: any, headers: any, baseUrl: string): Promise<any> {
    const params = new URLSearchParams();
    if (args.query) params.append('query', args.query);
    if (args.limit) params.append('limit', String(Math.min(args.limit, 1000)));
    if (args.offset) params.append('offset', String(args.offset));

    const response = await fetch(`${baseUrl}/company/${args.companyId}/query?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list bills: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      bills: result.QueryResponse.Bill || [],
      totalCount: result.QueryResponse.totalCount
    };
  }
}
