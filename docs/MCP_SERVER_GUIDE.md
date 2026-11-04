# DOKU Model Context Protocol (MCP) Server Guide

This guide details the architecture, setup, and usage of the DOKU Model Context Protocol (MCP) Server for **AI Agentic Commerce**.

---

## 1. Overview & Architecture

The DOKU MCP Server exposes payment gateway functionalities as native MCP tools to LLM agents such as **Google Antigravity**, **Gemini**, **Claude Desktop**, and **Cursor**.

It allows AI agents to perform autonomous financial operations:
- Generating DOKU Checkout payment links.
- Issuing dynamic Virtual Accounts across major Indonesian banks.
- Creating dynamic QRIS payment codes.
- Initiating E-Wallet charges.
- Checking transaction status.

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         MCP Protocol        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         HTTP / REST        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                           â”‚  (JSON-RPC over Stdio)     â”‚                           â”‚    (HMAC-SHA256 Signed)   â”‚                           â”‚
â”‚  AI Agent (Antigravity /  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º  DOKU MCP Server             â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º  DOKU Payment Gateway     â”‚
â”‚  Claude / Cursor)         â”‚                            â”‚  (TypeScript / Node.js)   â”‚                           â”‚  (Sandbox / Production)   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                            â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                           â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 2. Available MCP Tools Reference

### 1. `create_checkout_payment`
Generates a DOKU Checkout Payment Link URL for hosted payment pages.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "amount": { "type": "integer", "description": "Payment amount in IDR (integer without decimals)" },
    "invoice_number": { "type": "string", "description": "Unique invoice identifier" },
    "customer_name": { "type": "string", "description": "Customer full name" },
    "customer_email": { "type": "string", "description": "Customer email address" },
    "callback_url": { "type": "string", "description": "Optional redirect URL post-payment" }
  },
  "required": ["amount", "invoice_number", "customer_name", "customer_email"]
}
```

---

### 2. `create_virtual_account`
Generates a bank Virtual Account number for direct payment.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "bank_code": { 
      "type": "string", 
      "enum": ["BCA", "MANDIRI", "BRI", "BNI", "PERMATA", "DANAMON", "CIMB"],
      "description": "Bank code for VA generation"
    },
    "amount": { "type": "integer", "description": "Payment amount in IDR" },
    "invoice_number": { "type": "string", "description": "Unique invoice identifier" },
    "customer_name": { "type": "string", "description": "Customer full name" },
    "reusable": { "type": "boolean", "default": false, "description": "Is VA reusable for multiple payments" }
  },
  "required": ["bank_code", "amount", "invoice_number", "customer_name"]
}
```

---

### 3. `create_qris_payment`
Generates a dynamic QRIS payment code and QR image URL.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "amount": { "type": "integer", "description": "Payment amount in IDR" },
    "invoice_number": { "type": "string", "description": "Unique invoice identifier" },
    "store_name": { "type": "string", "description": "Merchant/Store display name on QR screen" }
  },
  "required": ["amount", "invoice_number"]
}
```

---

### 4. `create_ewallet_payment`
Initiates an E-Wallet charge.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "channel": { 
      "type": "string", 
      "enum": ["OVO", "SHOPEEPAY", "DANA", "LINKAJA"],
      "description": "E-Wallet channel code"
    },
    "amount": { "type": "integer", "description": "Payment amount in IDR" },
    "invoice_number": { "type": "string", "description": "Unique invoice identifier" },
    "phone_number": { "type": "string", "description": "Customer phone number (Required for OVO)" }
  },
  "required": ["channel", "amount", "invoice_number"]
}
```

---

### 5. `check_transaction_status`
Queries real-time payment status of an invoice.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "invoice_number": { "type": "string", "description": "Target invoice number to query" }
  },
  "required": ["invoice_number"]
}
```

---

### 6. `process_refund`
Initiates an online refund for an existing order.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "invoice_number": { "type": "string", "description": "Target invoice number to refund" },
    "amount": { "type": "integer", "description": "Refund amount in IDR (integer without decimals)" },
    "reason": { "type": "string", "description": "Reason for processing the refund" }
  },
  "required": ["invoice_number", "amount", "reason"]
}
```

---

### 7. `cancel_checkout_order`
Cancels an unpaid DOKU Checkout order (`POST /checkout/v3/cancellations`).

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "invoice_number": { "type": "string", "description": "Target invoice number to cancel" },
    "reason": { "type": "string", "description": "Cancellation reason" }
  },
  "required": ["invoice_number"]
}
```

---

### 8. `get_snap_b2b_token`
Obtains a SNAP BI OAuth 2.0 B2B Access Token using Asymmetric RSA-2048 SHA256withRSA signature (`POST /authorization/v1/access-token/b2b`).

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "private_key_pem": { "type": "string", "description": "Optional RSA Private Key in PEM format" }
  }
}
```

---

### 9. `create_snap_qris_payment`
Generates a dynamic QRIS payment code strictly conforming to Bank Indonesia SNAP standard (`POST /snap-adapter/b2b/v1.0/qr/qr-mpm-generate`) with Symmetric HMAC-SHA512 signature.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "partner_reference_no": { "type": "string", "description": "Unique partner reference number" },
    "amount_value": { "type": "string", "description": "Amount in IDR formatted as decimal string (e.g. '25000.00')" },
    "access_token": { "type": "string", "description": "B2B Access Token obtained from get_snap_b2b_token" },
    "merchant_id": { "type": "string", "description": "Optional Sub-Merchant ID / Terminal ID" }
  },
  "required": ["partner_reference_no", "amount_value", "access_token"]
}
```

---

## 3. Configuration Setup (`mcp_config.json`)


To register the DOKU MCP Server in your client configuration:

### Antigravity / Gemini CLI Config
File location: `~/.gemini/antigravity-ide/mcp_config.json` or plugin `mcp_config.json`:
```json
{
  "mcpServers": {
    "doku": {
      "command": "node",
      "args": ["/path/to/doku-gemini-mcp/dist/index.js"],
      "env": {
        "DOKU_CLIENT_ID": "YOUR_SANDBOX_CLIENT_ID",
        "DOKU_SECRET_KEY": "YOUR_SANDBOX_SECRET_KEY",
        "DOKU_IS_PRODUCTION": "false"
      }
    }
  }
}
```

### Claude Desktop Config
File location: `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):
```json
{
  "mcpServers": {
    "doku": {
      "command": "node",
      "args": ["C:/path/to/doku-gemini-mcp/dist/index.js"],
      "env": {
        "DOKU_CLIENT_ID": "YOUR_SANDBOX_CLIENT_ID",
        "DOKU_SECRET_KEY": "YOUR_SANDBOX_SECRET_KEY",
        "DOKU_IS_PRODUCTION": "false"
      }
    }
  }
}
```

---

## 4. MCP Tool Security Rules

1. **Monetary Integer Representation**: All monetary values MUST be integer amounts in Indonesian Rupiah (IDR) without decimals.
2. **Graceful Error Recovery**: Tool implementations must catch API network failures and authorization errors gracefully without crashing the Node.js process or leaking raw stack traces to LLM context.
3. **Sandbox Defaulting**: Server must default `DOKU_IS_PRODUCTION=false` (pointing to `https://api-sandbox.doku.com`) unless explicitly overridden to prevent unintended financial charges.
