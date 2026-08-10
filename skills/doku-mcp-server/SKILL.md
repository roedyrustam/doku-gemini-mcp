---
name: doku-mcp-server
description: "Expert guide for DOKU Model Context Protocol (MCP) Server integration. Enables AI Agentic Commerce with tools for payment links, Virtual Accounts, QRIS, E-Wallet, status checks, refunds, and client configuration (Claude Desktop, Cursor, AGY) / Panduan ahli DOKU MCP Server untuk AI Agentic Commerce."
author: "Roedy Rustam"
---

# DOKU MCP Server / Server Model Context Protocol DOKU

[English](#english) | [Bahasa Indonesia](#bahasa-indonesia)

---

<a name="english"></a>
## English

### Description
Expert guide for building and configuring Model Context Protocol (MCP) servers wrapping DOKU Payment Gateway APIs based on [DOKU Developers Portal](https://developers.doku.com/). Enables AI Agents (Claude Desktop, Antigravity, Cursor, n8n) to execute autonomous payment workflows (generating payment checkout links, issuing bank Virtual Accounts, generating QRIS codes, initiating E-Wallet charges, issuing online refunds, querying order payment status).

### Trigger Conditions
Activate this skill when the user is:
- Configuring DOKU MCP server for Claude Desktop, Antigravity (AGY), Cursor, or LLM agents.
- Implementing AI Agentic Commerce or autonomous checkout workflows.
- Building custom TypeScript/Python MCP server tools for DOKU APIs.

---

### Available MCP Tools & Schema

| MCP Tool Name | Description | Required Parameters |
|---|---|---|
| `create_checkout_payment` | Generates DOKU Checkout Payment Link | `amount`, `invoice_number`, `customer_name`, `customer_email` |
| `create_virtual_account` | Generates bank Virtual Account number | `bank_code`, `amount`, `invoice_number`, `customer_name` |
| `create_qris_payment` | Generates dynamic QRIS code | `amount`, `invoice_number`, `store_name` |
| `create_ewallet_payment` | Initiates E-Wallet payment | `channel`, `amount`, `invoice_number`, `phone_number` |
| `check_transaction_status` | Queries payment status of order | `invoice_number` |
| `process_refund` | Initiates an online refund for an order | `invoice_number`, `amount`, `reason` |

---

### Client Configuration (`mcp_config.json`)

```json
{
  "mcpServers": {
    "doku": {
      "command": "node",
      "args": ["/path/to/doku-mcp-server/dist/index.js"],
      "env": {
        "DOKU_CLIENT_ID": "YOUR_CLIENT_ID",
        "DOKU_SECRET_KEY": "YOUR_SECRET_KEY",
        "DOKU_IS_PRODUCTION": "false"
      }
    }
  }
}
```

---

<a name="bahasa-indonesia"></a>
## Bahasa Indonesia

### Deskripsi
Panduan ahli untuk membuat dan mengonfigurasi server Model Context Protocol (MCP) yang membungkus DOKU Payment Gateway API berdasarkan [DOKU Developers Portal](https://developers.doku.com/). Memungkinkan Agen AI (Claude Desktop, Antigravity, Cursor, n8n) menjalankan alur pembayaran otonom (membuat link checkout, menerbitkan nomor Virtual Account, membuat kode QRIS, menanyakan status pembayaran, dan memproses refund).

### Kondisi Pemicu
Aktifkan skill ini ketika pengguna sedang:
- Mengatur server DOKU MCP untuk Claude Desktop, Antigravity, Cursor, atau agen LLM.
- Mengimplementasikan alur checkout otonom (AI Agentic Commerce) dengan DOKU.

