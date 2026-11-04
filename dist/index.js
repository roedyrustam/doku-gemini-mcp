#!/usr/bin/env node

// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

// src/core/client.ts
import axios from "axios";
import crypto2 from "crypto";

// src/core/constants.ts
var DOKU_SANDBOX_BASE_URL = "https://api-sandbox.doku.com";
var DOKU_PRODUCTION_BASE_URL = "https://api.doku.com";
var DOKU_SIMULATOR_URL = "https://sandbox.doku.com/gtw-config-v2/simulator";
var DOKU_ENDPOINTS = {
  CHECKOUT_PAYMENT: "/checkout/v1/payment",
  CHECKOUT_CANCEL: "/checkout/v3/cancellations",
  VIRTUAL_ACCOUNT: "/doku-virtual-account/v2/payment-code",
  QRIS_JOKUL: "/qris/v1/payment-code",
  QRIS_SNAP: "/snap-adapter/b2b/v1.0/qr/qr-mpm-generate",
  E_WALLET: "/e-wallet/v1/payment",
  CREDIT_CARD: "/credit-card/v1/payment",
  STATUS: "/orders/v1/status",
  REFUND: "/orders/v1/refund"
};
var SUPPORTED_VA_BANKS = [
  "BCA",
  "MANDIRI",
  "BRI",
  "BNI",
  "PERMATA",
  "DANAMON",
  "CIMB"
];
var SUPPORTED_EWALLETS = [
  "OVO",
  "SHOPEEPAY",
  "DANA",
  "LINKAJA"
];
var PAYMENT_METHOD_TYPES = [
  "VIRTUAL_ACCOUNT_BCA",
  "VIRTUAL_ACCOUNT_BANK_MANDIRI",
  "VIRTUAL_ACCOUNT_BRI",
  "VIRTUAL_ACCOUNT_BNI",
  "VIRTUAL_ACCOUNT_PERMATA",
  "VIRTUAL_ACCOUNT_BANK_DANAMON",
  "VIRTUAL_ACCOUNT_CIMB",
  "QRIS",
  "OVO",
  "SHOPEE_PAY",
  "DANA",
  "LINKAJA",
  "CREDIT_CARD",
  "DIRECT_DEBIT_BRI",
  "KREDIVO",
  "AKULAKU",
  "INDODANA",
  "ALFAMART",
  "INDOMARET"
];

// src/core/signer.ts
import crypto from "crypto";
function generateDokuTimestamp(date = /* @__PURE__ */ new Date()) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}
function calculateDigest(body) {
  if (!body) return "";
  const rawString = typeof body === "string" ? body : JSON.stringify(body);
  if (!rawString || rawString.trim() === "" || rawString === "{}") {
    return "";
  }
  const hash = crypto.createHash("sha256").update(rawString, "utf8").digest();
  return hash.toString("base64");
}
function calculateJokulSignature(params) {
  const { clientId, secretKey, requestId, timestamp, targetPath, body } = params;
  const digest = calculateDigest(body);
  let componentString = `Client-Id:${clientId}
Request-Id:${requestId}
Request-Timestamp:${timestamp}
Request-Target:${targetPath}`;
  if (digest) {
    componentString += `
Digest:${digest}`;
  }
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(componentString, "utf8");
  const signature = `HMACSHA256=${hmac.digest("base64")}`;
  return {
    digest,
    componentString,
    signature
  };
}
function calculateSnapSignature(params) {
  const { httpMethod, endpointUrl, accessToken, secretKey, timestamp, body } = params;
  let minifiedBody = "";
  if (body) {
    minifiedBody = typeof body === "string" ? body : JSON.stringify(body);
  }
  const bodyHash = crypto.createHash("sha256").update(minifiedBody, "utf8").digest("hex").toLowerCase();
  const stringToSign = `${httpMethod.toUpperCase()}:${endpointUrl}:${accessToken}:${bodyHash}:${timestamp}`;
  const hmac = crypto.createHmac("sha512", secretKey);
  hmac.update(stringToSign, "utf8");
  const signature = hmac.digest("base64");
  return {
    minifiedBodyHash: bodyHash,
    stringToSign,
    signature
  };
}
function verifyWebhookSignature(params) {
  const {
    clientId,
    requestId,
    timestamp,
    targetPath,
    signature,
    secretKey,
    rawBody
  } = params;
  if (!clientId || !requestId || !timestamp || !targetPath || !signature) {
    return false;
  }
  const expected = calculateJokulSignature({
    clientId,
    secretKey,
    requestId,
    timestamp,
    targetPath,
    body: rawBody
  });
  const expectedBuffer = Buffer.from(expected.signature, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");
  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

// src/core/client.ts
var DokuClient = class {
  clientId;
  secretKey;
  baseUrl;
  isProduction;
  http;
  constructor(config) {
    this.clientId = config?.clientId || process.env.DOKU_CLIENT_ID || "";
    this.secretKey = config?.secretKey || process.env.DOKU_SECRET_KEY || "";
    this.isProduction = config?.isProduction ?? (process.env.DOKU_IS_PRODUCTION === "true" || process.env.NODE_ENV === "production");
    this.baseUrl = this.isProduction ? DOKU_PRODUCTION_BASE_URL : DOKU_SANDBOX_BASE_URL;
    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 3e4,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  getEnvironment() {
    return {
      isProduction: this.isProduction,
      baseUrl: this.baseUrl,
      hasCredentials: Boolean(this.clientId && this.secretKey)
    };
  }
  /**
   * Internal helper to execute authenticated Jokul API v2 requests
   */
  async request(method, targetPath, body) {
    if (!this.clientId || !this.secretKey) {
      throw new Error(
        "Missing DOKU credentials. Please set DOKU_CLIENT_ID and DOKU_SECRET_KEY environment variables."
      );
    }
    const requestId = crypto2.randomUUID();
    const timestamp = generateDokuTimestamp();
    const { signature } = calculateJokulSignature({
      clientId: this.clientId,
      secretKey: this.secretKey,
      requestId,
      timestamp,
      targetPath,
      body: method !== "GET" ? body : void 0
    });
    const headers = {
      "Client-Id": this.clientId,
      "Request-Id": requestId,
      "Request-Timestamp": timestamp,
      Signature: signature
    };
    try {
      const response = await this.http.request({
        method,
        url: targetPath,
        headers,
        data: method !== "GET" ? body : void 0
      });
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosErr = err;
        const status = axiosErr.response?.status;
        const responseData = axiosErr.response?.data;
        const errorMessage = responseData?.error?.message || responseData?.message || axiosErr.message || "DOKU API Request Failed";
        throw new Error(
          `DOKU API Error [HTTP ${status || "Network"}]: ${errorMessage} (Target: ${targetPath})`
        );
      }
      throw err;
    }
  }
  /**
   * Generates a DOKU Checkout Payment Link
   * POST /checkout/v1/payment
   */
  async createCheckoutPayment(payload) {
    return this.request("POST", DOKU_ENDPOINTS.CHECKOUT_PAYMENT, payload);
  }
  /**
   * Cancels an unpaid DOKU Checkout order
   * POST /checkout/v3/cancellations
   */
  async cancelCheckoutOrder(payload) {
    const body = {
      order: {
        invoice_number: payload.invoice_number
      },
      reason: payload.reason || "Requested by customer or merchant cancellation"
    };
    return this.request("POST", DOKU_ENDPOINTS.CHECKOUT_CANCEL, body);
  }
  /**
   * Issues a direct Bank Virtual Account
   * POST /doku-virtual-account/v2/payment-code
   */
  async createVirtualAccount(payload) {
    const body = {
      order: {
        invoice_number: payload.invoice_number,
        amount: payload.amount
      },
      virtual_account_info: {
        expired_time: payload.expired_time || 1440,
        reusable_status: payload.reusable_status || false,
        info1: payload.info1,
        info2: payload.info2,
        info3: payload.info3
      },
      customer: {
        name: payload.customer_name,
        email: payload.customer_email
      }
    };
    return this.request("POST", DOKU_ENDPOINTS.VIRTUAL_ACCOUNT, body);
  }
  /**
   * Generates a dynamic QRIS payment code
   * POST /qris/v1/payment-code
   */
  async createQrisPayment(payload) {
    const body = {
      order: {
        invoice_number: payload.invoice_number,
        amount: payload.amount,
        callback_url: payload.callback_url
      },
      qris_info: {
        store_name: payload.store_name || "DOKU Merchant",
        expired_time: payload.expired_time || 30
        // Minutes
      }
    };
    return this.request("POST", DOKU_ENDPOINTS.QRIS_JOKUL, body);
  }
  /**
   * Initiates an E-Wallet payment (OVO, ShopeePay, DANA, LinkAja)
   * POST /e-wallet/v1/payment
   */
  async createEwalletPayment(payload) {
    const body = {
      order: {
        invoice_number: payload.invoice_number,
        amount: payload.amount,
        callback_url: payload.callback_url
      },
      e_wallet_info: {
        channel: payload.channel,
        phone_number: payload.phone_number
      }
    };
    return this.request("POST", DOKU_ENDPOINTS.E_WALLET, body);
  }
  /**
   * Queries payment status for a specific invoice number
   * GET /orders/v1/status/:invoice_number
   */
  async checkTransactionStatus(invoiceNumber) {
    const targetPath = `${DOKU_ENDPOINTS.STATUS}/${encodeURIComponent(invoiceNumber)}`;
    return this.request("GET", targetPath);
  }
  /**
   * Initiates an online refund for an existing transaction
   * POST /orders/v1/refund
   */
  async processRefund(payload) {
    const body = {
      order: {
        invoice_number: payload.invoice_number
      },
      refund: {
        amount: payload.amount,
        reason: payload.reason
      }
    };
    return this.request("POST", DOKU_ENDPOINTS.REFUND, body);
  }
};

// src/tools/checkout.ts
var checkoutTools = [
  {
    name: "create_checkout_payment",
    description: "Generate a DOKU Checkout Payment Link (URL) for hosted/popup payment pages. Supports Virtual Account, QRIS, E-Wallet, Credit Card, Direct Debit, and PayLater.",
    inputSchema: {
      type: "object",
      properties: {
        amount: {
          type: "integer",
          description: "Payment amount in Indonesian Rupiah (IDR). Integer without decimals (e.g. 50000)."
        },
        invoice_number: {
          type: "string",
          description: "Unique invoice identifier for this order (e.g. INV-20261105-001)."
        },
        customer_name: {
          type: "string",
          description: "Customer full name."
        },
        customer_email: {
          type: "string",
          description: "Customer email address."
        },
        callback_url: {
          type: "string",
          description: "Optional merchant redirect URL post-payment."
        },
        payment_due_date: {
          type: "integer",
          description: "Payment expiry duration in minutes (default: 60)."
        },
        payment_method_types: {
          type: "array",
          items: { type: "string" },
          description: 'Optional array of allowed payment method codes (e.g. ["VIRTUAL_ACCOUNT_BCA", "QRIS"]).'
        }
      },
      required: ["amount", "invoice_number", "customer_name", "customer_email"]
    }
  },
  {
    name: "cancel_checkout_order",
    description: "Cancel an unpaid DOKU Checkout order before expiry (POST /checkout/v3/cancellations).",
    inputSchema: {
      type: "object",
      properties: {
        invoice_number: {
          type: "string",
          description: "Target invoice number to cancel."
        },
        reason: {
          type: "string",
          description: "Reason for cancelling the order (e.g. Customer cancelled order)."
        }
      },
      required: ["invoice_number"]
    }
  }
];
async function handleCheckoutTool(name, args, client) {
  if (name === "create_checkout_payment") {
    const amount = Number(args.amount);
    const invoice_number = String(args.invoice_number);
    const customer_name = String(args.customer_name);
    const customer_email = String(args.customer_email);
    const callback_url = args.callback_url ? String(args.callback_url) : void 0;
    const payment_due_date = args.payment_due_date ? Number(args.payment_due_date) : 60;
    const payment_method_types = Array.isArray(args.payment_method_types) ? args.payment_method_types : void 0;
    return client.createCheckoutPayment({
      order: {
        amount,
        invoice_number,
        callback_url
      },
      payment: {
        payment_due_date,
        payment_method_types
      },
      customer: {
        name: customer_name,
        email: customer_email
      }
    });
  }
  if (name === "cancel_checkout_order") {
    const invoice_number = String(args.invoice_number);
    const reason = args.reason ? String(args.reason) : void 0;
    return client.cancelCheckoutOrder({
      invoice_number,
      reason
    });
  }
  throw new Error(`Unknown checkout tool: ${name}`);
}

// src/tools/virtual-account.ts
var virtualAccountTools = [
  {
    name: "create_virtual_account",
    description: "Generate a bank Virtual Account (VA) number directly via DOKU Jokul API v2 for immediate customer transfer.",
    inputSchema: {
      type: "object",
      properties: {
        bank_code: {
          type: "string",
          enum: [...SUPPORTED_VA_BANKS],
          description: "Target Indonesian bank code: BCA, MANDIRI, BRI, BNI, PERMATA, DANAMON, or CIMB."
        },
        amount: {
          type: "integer",
          description: "Payment amount in Indonesian Rupiah (IDR). Integer without decimals."
        },
        invoice_number: {
          type: "string",
          description: "Unique invoice identifier for this transaction."
        },
        customer_name: {
          type: "string",
          description: "Customer full name displayed on ATM / m-Banking screen."
        },
        customer_email: {
          type: "string",
          description: "Optional customer email address for receipt delivery."
        },
        expired_time: {
          type: "integer",
          description: "VA validity duration in minutes (default: 1440 = 24 hours)."
        },
        reusable_status: {
          type: "boolean",
          description: "Whether this VA number can be paid multiple times (default: false = single use)."
        }
      },
      required: ["bank_code", "amount", "invoice_number", "customer_name"]
    }
  }
];
async function handleVirtualAccountTool(name, args, client) {
  if (name === "create_virtual_account") {
    const bank_code = String(args.bank_code).toUpperCase();
    const amount = Number(args.amount);
    const invoice_number = String(args.invoice_number);
    const customer_name = String(args.customer_name);
    const customer_email = args.customer_email ? String(args.customer_email) : void 0;
    const expired_time = args.expired_time ? Number(args.expired_time) : 1440;
    const reusable_status = Boolean(args.reusable_status);
    return client.createVirtualAccount({
      bank_code,
      amount,
      invoice_number,
      customer_name,
      customer_email,
      expired_time,
      reusable_status
    });
  }
  throw new Error(`Unknown virtual account tool: ${name}`);
}

// src/tools/qris.ts
var qrisTools = [
  {
    name: "create_qris_payment",
    description: "Generate a dynamic QRIS payment code and QR image string compatible with all Indonesian e-wallets (GoPay, OVO, ShopeePay, DANA) and mobile banking apps.",
    inputSchema: {
      type: "object",
      properties: {
        amount: {
          type: "integer",
          description: "Payment amount in Indonesian Rupiah (IDR). Integer without decimals."
        },
        invoice_number: {
          type: "string",
          description: "Unique invoice identifier."
        },
        store_name: {
          type: "string",
          description: "Merchant or store display name shown on customer QR scan screen (default: DOKU Merchant)."
        },
        expired_time: {
          type: "integer",
          description: "QRIS expiry time in minutes (default: 30 minutes)."
        },
        callback_url: {
          type: "string",
          description: "Optional callback URL."
        }
      },
      required: ["amount", "invoice_number"]
    }
  }
];
async function handleQrisTool(name, args, client) {
  if (name === "create_qris_payment") {
    const amount = Number(args.amount);
    const invoice_number = String(args.invoice_number);
    const store_name = args.store_name ? String(args.store_name) : void 0;
    const expired_time = args.expired_time ? Number(args.expired_time) : 30;
    const callback_url = args.callback_url ? String(args.callback_url) : void 0;
    return client.createQrisPayment({
      amount,
      invoice_number,
      store_name,
      expired_time,
      callback_url
    });
  }
  throw new Error(`Unknown QRIS tool: ${name}`);
}

// src/tools/ewallet.ts
var ewalletTools = [
  {
    name: "create_ewallet_payment",
    description: "Initiate an Indonesian E-Wallet charge (OVO, ShopeePay, DANA, or LinkAja). Returns push notification trigger or mobile payment URL.",
    inputSchema: {
      type: "object",
      properties: {
        channel: {
          type: "string",
          enum: [...SUPPORTED_EWALLETS],
          description: "E-Wallet provider: OVO, SHOPEEPAY, DANA, or LINKAJA."
        },
        amount: {
          type: "integer",
          description: "Payment amount in Indonesian Rupiah (IDR). Integer without decimals."
        },
        invoice_number: {
          type: "string",
          description: "Unique invoice identifier."
        },
        phone_number: {
          type: "string",
          description: "Customer mobile phone number. Required for OVO push payment (e.g. 081234567890)."
        },
        callback_url: {
          type: "string",
          description: "Optional callback URL post payment."
        }
      },
      required: ["channel", "amount", "invoice_number"]
    }
  }
];
async function handleEwalletTool(name, args, client) {
  if (name === "create_ewallet_payment") {
    const channel = String(args.channel).toUpperCase();
    const amount = Number(args.amount);
    const invoice_number = String(args.invoice_number);
    const phone_number = args.phone_number ? String(args.phone_number) : void 0;
    const callback_url = args.callback_url ? String(args.callback_url) : void 0;
    if (channel === "OVO" && !phone_number) {
      throw new Error("Customer phone_number is strictly required for OVO payments.");
    }
    return client.createEwalletPayment({
      channel,
      amount,
      invoice_number,
      phone_number,
      callback_url
    });
  }
  throw new Error(`Unknown E-Wallet tool: ${name}`);
}

// src/tools/status.ts
var statusTools = [
  {
    name: "check_transaction_status",
    description: "Check real-time payment status of an invoice from DOKU Payment Gateway (GET /orders/v1/status/:invoice_number).",
    inputSchema: {
      type: "object",
      properties: {
        invoice_number: {
          type: "string",
          description: "The unique invoice number to query (e.g. INV-1720752332)."
        }
      },
      required: ["invoice_number"]
    }
  }
];
async function handleStatusTool(name, args, client) {
  if (name === "check_transaction_status") {
    const invoice_number = String(args.invoice_number);
    return client.checkTransactionStatus(invoice_number);
  }
  throw new Error(`Unknown status tool: ${name}`);
}

// src/tools/refund.ts
var refundTools = [
  {
    name: "process_refund",
    description: "Initiate an online refund for an existing settled transaction (POST /orders/v1/refund).",
    inputSchema: {
      type: "object",
      properties: {
        invoice_number: {
          type: "string",
          description: "The invoice number of the original paid transaction to refund."
        },
        amount: {
          type: "integer",
          description: "The refund amount in IDR (integer without decimals). Supports partial or full refund."
        },
        reason: {
          type: "string",
          description: "Reason for processing the refund (e.g. Customer cancelled order / defective product)."
        }
      },
      required: ["invoice_number", "amount", "reason"]
    }
  }
];
async function handleRefundTool(name, args, client) {
  if (name === "process_refund") {
    const invoice_number = String(args.invoice_number);
    const amount = Number(args.amount);
    const reason = String(args.reason);
    return client.processRefund({
      invoice_number,
      amount,
      reason
    });
  }
  throw new Error(`Unknown refund tool: ${name}`);
}

// src/index.ts
var allTools = [
  ...checkoutTools,
  ...virtualAccountTools,
  ...qrisTools,
  ...ewalletTools,
  ...statusTools,
  ...refundTools
];
async function main() {
  const client = new DokuClient();
  const env = client.getEnvironment();
  console.error("[doku-gemini-mcp] Starting DOKU MCP Server v1.2.0");
  console.error(
    `[doku-gemini-mcp] Mode: ${env.isProduction ? "PRODUCTION (LIVE)" : "SANDBOX"}`
  );
  console.error(`[doku-gemini-mcp] Base URL: ${env.baseUrl}`);
  console.error(
    `[doku-gemini-mcp] Credentials configured: ${env.hasCredentials ? "YES" : "NO (Set DOKU_CLIENT_ID & DOKU_SECRET_KEY)"}`
  );
  const server = new Server(
    {
      name: "doku-gemini-mcp",
      version: "1.2.0"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools
    };
  });
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;
    try {
      let result;
      if (name === "create_checkout_payment" || name === "cancel_checkout_order") {
        result = await handleCheckoutTool(name, args, client);
      } else if (name === "create_virtual_account") {
        result = await handleVirtualAccountTool(name, args, client);
      } else if (name === "create_qris_payment") {
        result = await handleQrisTool(name, args, client);
      } else if (name === "create_ewallet_payment") {
        result = await handleEwalletTool(name, args, client);
      } else if (name === "check_transaction_status") {
        result = await handleStatusTool(name, args, client);
      } else if (name === "process_refund") {
        result = await handleRefundTool(name, args, client);
      } else {
        throw new Error(`Unknown MCP Tool: ${name}`);
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[doku-gemini-mcp] Tool execution error (${name}):`, errorMessage);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "ERROR",
                tool: name,
                error: errorMessage,
                recommendation: "Check DOKU credentials, invoice_number uniqueness, and IDR amount format."
              },
              null,
              2
            )
          }
        ],
        isError: true
      };
    }
  });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[doku-gemini-mcp] MCP Server connected via Stdio transport.");
}
if (process.argv[1] && process.argv[1].endsWith("index.js")) {
  main().catch((err) => {
    console.error("[doku-gemini-mcp] Fatal server startup error:", err);
    process.exit(1);
  });
}
export {
  DOKU_ENDPOINTS,
  DOKU_PRODUCTION_BASE_URL,
  DOKU_SANDBOX_BASE_URL,
  DOKU_SIMULATOR_URL,
  DokuClient,
  PAYMENT_METHOD_TYPES,
  SUPPORTED_EWALLETS,
  SUPPORTED_VA_BANKS,
  allTools,
  calculateDigest,
  calculateJokulSignature,
  calculateSnapSignature,
  generateDokuTimestamp,
  verifyWebhookSignature
};
//# sourceMappingURL=index.js.map