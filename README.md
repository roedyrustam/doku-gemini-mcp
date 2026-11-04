# DOKU Gemini MCP Plugin & Server (`doku-gemini-mcp`)

[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](https://github.com/roedyrustam/doku-gemini-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![DOKU Jokul & SNAP BI](https://img.shields.io/badge/DOKU-Jokul%20v2%20%26%20SNAP%20BI%20v1.0-red.svg)](https://developers.doku.com/)
[![MCP Spec](https://img.shields.io/badge/MCP-Model%20Context%20Protocol%20v1.x-green.svg)](https://modelcontextprotocol.io/)
[![CI](https://github.com/roedyrustam/doku-gemini-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/roedyrustam/doku-gemini-mcp/actions)

> **Official Antigravity / Gemini Plugin & Model Context Protocol (MCP v1.x) Server for DOKU Payment Gateway (Jokul API v2 & Bank Indonesia SNAP BI v1.0)**  
> *Plugin & Server MCP AI Agentic Commerce untuk Integrasi DOKU Payment Gateway Resmi ([developers.doku.com](https://developers.doku.com/)).*

[English](#english) | [Bahasa Indonesia](#bahasa-indonesia) | [Documentation Index](#documentation-index)

---

## ⚡ 1-Command Agentic Workflow Architecture

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 1-COMMAND AGENTIC INTEGRATION WORKFLOW                                 │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                        │
│   USER PROMPT: "Setup DOKU integration for my app"                                                     │
│                                                                                                        │
│        │                                                                                               │
│        ▼                                                                                               │
│   ┌────────────────────────┐    Auto-detects language, framework, & package manager                    │
│   │ 1. detect-stack        ├─────────────────────────────────────────────────────────────┐             │
│   └───────────┬────────────┘                                                           │             │
│               │                                                                        │             │
│               ▼                                                                        ▼             │
│   ┌────────────────────────┐    Injects DOKU_CLIENT_ID & DOKU_SECRET_KEY               ┌──────────┐  │
│   │ 2. setup-credentials   ├──────────────────────────────────────────────────────────►│  .env    │  │
│   └───────────┬────────────┘                                                           └──────────┘  │
│               │                                                                                      │
│               ▼                                                                                      │
│   ┌────────────────────────┐    Scaffolds DokuService with Base64 SHA-256 Digest &                      │
│   │ 3. setup-project       ├─────────────────────────────────────────────────────────────┐             │
│   └───────────┬────────────┘    HMAC-SHA256 Signature calculation                      │             │
│               │                                                                        ▼             │
│               ▼                                                                 ┌─────────────┐      │
│   ┌────────────────────────┐    Scaffolds Webhook Listener with                 │ DokuService │      │
│   │ 4. webhook-receiver    ├───────────────────────────────────────────────►└──────┬──────┘      │
│   └───────────┬────────────┘    timingSafeEqual & Idempotency Guard                    │             │
│               │                                                                        ▼             │
│               ▼                                                                 ┌─────────────┐      │
│   ┌────────────────────────┐    Executes live test request against Sandbox API  │ Webhook Route│     │
│   │ 5. mock-test           ├───────────────────────────────────────────────────►└─────────────┘      │
│   └────────────────────────┘    Returns HTTP 200 OK & Verified Payment Link!                         │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

```mermaid
sequenceDiagram
    autonumber
    actor Developer as 🧑‍💻 Developer
    participant Agent as 🤖 Antigravity / Gemini AI Agent
    participant Plugin as 🔌 doku-gemini-mcp Plugin
    participant DOKU as 🏦 DOKU Payment Gateway (Sandbox)

    Developer->>Agent: "Setup DOKU Checkout integration"
    Agent->>Plugin: Activate setup-project skill
    Plugin->>Plugin: Auto-detect stack (Node.js/TS, Python, Go, PHP)
    Plugin->>Plugin: Inject DOKU credentials & update .env
    Plugin->>Agent: Scaffold DokuService with HMAC-SHA256 signature math
    Plugin->>Agent: Scaffold /api/webhook listener with timingSafeEqual
    Agent->>DOKU: Execute live test request via mock-test skill
    DOKU-->>Agent: HTTP 200 OK (Payment Link Created & Signature Verified)
    Agent-->>Developer: 🚀 Complete, production-ready DOKU integration generated!
```

---

<a name="english"></a>
## English

### Overview
`doku-gemini-mcp` is an advanced AI plugin and Model Context Protocol (MCP v1.x) server for **Google Antigravity**, **Gemini**, **Claude Desktop**, and **Cursor**. It equips AI coding assistants with end-to-end capabilities to scaffold, configure, test, sign, and maintain [DOKU Payment Gateway](https://developers.doku.com/) integrations.

Built with a **Dual-Engine Architecture**, it seamlessly bridges:
1. **Jokul API v2**: Hosted DOKU Checkout, Cancel Order API, Direct Virtual Accounts (BCA, Mandiri, BRI, BNI, Permata, Danamon, CIMB), Direct QRIS, E-Wallets (OVO, ShopeePay, DANA, LinkAja), Credit Card 3DS, and Online Refunds.
2. **Bank Indonesia SNAP BI v1.0**: Standard National Open API Payment protocols, Asymmetric RSA-2048 SHA256withRSA B2B Token generation (`POST /authorization/v1/access-token/b2b`), and Symmetric HMAC-SHA512 SNAP QRIS MPM (`POST /snap-adapter/b2b/v1.0/qr/qr-mpm-generate`).

### Key Capabilities
- **9 Production MCP Tools**: Autonomous AI tools for Checkout, Virtual Accounts, QRIS, E-Wallets, Order Inquiry, Refunds, and SNAP BI Token/QRIS.
- **12 Specialized Agentic Skills**: Automated stack detection, project setup, credential configuration, Postman collection generation, live sandbox testing, and production audits.
- **Executable Automation CLI**: Ready-to-run scripts for static security audits, Postman collection exports, and live sandbox connectivity.
- **Cryptographic Strictness**: Built-in HMAC-SHA256, SNAP RSA-2048 SHA256withRSA, SNAP HMAC-SHA512, and `crypto.timingSafeEqual` webhook validation.
- **Zero-Friction Stdio Server**: Packaged into a fast, single-file bundle (`dist/index.js`, 30 KB) that runs out-of-the-box in Claude Desktop, Cursor, and Antigravity.
- **100% Tested**: Vitest unit test suite with 15 passing tests and 6/6 security invariant checks.

---

<a name="bahasa-indonesia"></a>
## Bahasa Indonesia

### Ringkasan
`doku-gemini-mcp` adalah plugin AI dan server Model Context Protocol (MCP v1.x) resmi untuk **Google Antigravity**, **Gemini**, **Claude Desktop**, dan **Cursor**. Plugin ini membekali asisten AI dengan kemampuan end-to-end untuk membuat, mengonfigurasi, menguji, menandatangani, dan memelihara integrasi [DOKU Payment Gateway](https://developers.doku.com/).

Didukung oleh **Arsitektur Dual-Engine**, plugin ini mengintegrasikan dua pilar resmi DOKU:
1. **Jokul API v2**: DOKU Checkout (Popup Modal & Redirect), Cancel Order API, Virtual Account Langsung (BCA, Mandiri, BRI, BNI, Permata, Danamon, CIMB), QRIS Dinamis, E-Wallet (OVO, ShopeePay, DANA, LinkAja), Kartu Kredit 3DS, dan Online Refund.
2. **Bank Indonesia SNAP BI v1.0**: Standar Nasional Open API Pembayaran, signature asimetris RSA-2048 SHA256withRSA untuk token B2B OAuth 2.0 (`POST /authorization/v1/access-token/b2b`), dan signature simetris HMAC-SHA512 untuk SNAP QRIS MPM (`POST /snap-adapter/b2b/v1.0/qr/qr-mpm-generate`).

### Fitur Utama
- **9 Production MCP Tools**: Tool otonom untuk membuat link checkout, membatalkan pesanan, menerbitkan Virtual Account, membuat QRIS, inisiasi e-wallet, cek status invoice, refund online, dan SNAP BI token/QRIS.
- **12 Skill Agen Terpesialisasi**: Deteksi stack otomatis, setup proyek, konfigurasi kredensial, pembuat koleksi Postman, penguji sandbox langsung, dan audit produksi.
- **Rangkaian Skrip Otomasi CLI**: Skrip mandiri untuk audit keamanan statis, ekspor koleksi Postman v2.1, dan pengujian konektivitas sandbox.
- **Ketepatan Kriptografis**: Kalkulator signature HMAC-SHA256, SNAP RSA-SHA256, SNAP HMAC-SHA512, dan validator webhook timing-safe (`crypto.timingSafeEqual`).
- **Server Stdio Siap Pakai**: Terkompilasi ke dalam bundle tunggal super cepat (`dist/index.js`, 30 KB) yang langsung bekerja tanpa kompilasi tambahan.

---

## 🛠️ Model Context Protocol (MCP) Server — 9 Production Tools

The DOKU MCP Server exposes 9 native tools to LLMs for autonomous financial operations:

| # | MCP Tool Name | Target Endpoint | Description |
|---|---|---|---|
| 1 | `create_checkout_payment` | `POST /checkout/v1/payment` | Generates a DOKU Checkout Payment Link URL (Popup modal / redirect). |
| 2 | `cancel_checkout_order` | `POST /checkout/v3/cancellations` | Voids an unpaid checkout order before expiry. |
| 3 | `create_virtual_account` | `POST /doku-virtual-account/v2/payment-code` | Generates a bank Virtual Account number (BCA, Mandiri, BRI, BNI, Permata, Danamon, CIMB). |
| 4 | `create_qris_payment` | `POST /qris/v1/payment-code` | Generates dynamic QRIS payment code and QR image string (Jokul v2). |
| 5 | `create_ewallet_payment` | `POST /e-wallet/v1/payment` | Initiates an E-Wallet charge (OVO, ShopeePay, DANA, LinkAja). |
| 6 | `check_transaction_status` | `GET /orders/v1/status/:invoice_number` | Queries real-time invoice payment status from DOKU. |
| 7 | `process_refund` | `POST /orders/v1/refund` | Initiates an online refund for an existing settled transaction. |
| 8 | `get_snap_b2b_token` | `POST /authorization/v1/access-token/b2b` | Obtains a SNAP BI OAuth 2.0 B2B Access Token via Asymmetric RSA-SHA256. |
| 9 | `create_snap_qris_payment` | `POST /snap-adapter/b2b/v1.0/qr/qr-mpm-generate` | Generates dynamic QRIS adhering to Bank Indonesia SNAP standard via HMAC-SHA512. |

---

## 🚀 Installation & Quick Start

### 1. Global Installation for Antigravity IDE & Gemini CLI
Clone globally so that Antigravity automatically detects all 12 skills, security rules, and the MCP server:

```powershell
# Windows (PowerShell)
git clone https://github.com/roedyrustam/doku-gemini-mcp.git "$env:USERPROFILE\.gemini\config\plugins\doku-gemini-mcp"
```

```bash
# macOS / Linux / WSL
git clone https://github.com/roedyrustam/doku-gemini-mcp.git ~/.gemini/config/plugins/doku-gemini-mcp
```

### 2. Client Configuration (`mcp_config.json`)

To enable AI Agentic Commerce in **Antigravity IDE**, **Gemini CLI**, **Claude Desktop**, or **Cursor**:

#### Antigravity / Gemini Configuration
Place in `~/.gemini/antigravity-ide/mcp_config.json`:
```json
{
  "mcpServers": {
    "doku": {
      "command": "node",
      "args": ["C:/Users/YOUR_USER/.gemini/config/plugins/doku-gemini-mcp/dist/index.js"],
      "env": {
        "DOKU_CLIENT_ID": "YOUR_SANDBOX_CLIENT_ID",
        "DOKU_SECRET_KEY": "YOUR_SANDBOX_SECRET_KEY",
        "DOKU_IS_PRODUCTION": "false"
      }
    }
  }
}
```

#### Claude Desktop Configuration
Place in `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):
```json
{
  "mcpServers": {
    "doku": {
      "command": "node",
      "args": ["/path/to/doku-gemini-mcp/dist/index.js"],
      "env": {
        "DOKU_CLIENT_ID": "YOUR_SANDBOX_CLIENT_ID",
        "DOKU_SECRET_KEY": "YOUR_SANDBOX_SECRET_KEY",
        "DOKU_PRIVATE_KEY_PEM": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
        "DOKU_IS_PRODUCTION": "false"
      }
    }
  }
}
```

> [!TIP]
> - Get free Sandbox credentials at [DOKU Sandbox Back Office](https://sandbox.doku.com/bo/login).
> - Test customer payments and webhooks using the [DOKU Integration Payment Simulator](https://sandbox.doku.com/gtw-config-v2/simulator).

---

## 💻 Executable Automation Scripts

The repository includes a ready-to-use suite of CLI scripts:

```bash
# 1. Run security and signature compliance audit
pnpm run audit

# 2. Export Postman Collection v2.1 with dynamic CryptoJS HMAC scripts
pnpm run export-postman

# 3. Test live connectivity against DOKU Sandbox
pnpm run test-sandbox

# 4. Auto-detect project tech stack and save .doku-config.json
node scripts/detect-stack.mjs

# 5. Run Vitest unit test suite
pnpm test
```

---

## 📖 12 Specialized Agentic Skills Reference

| Skill Name | Purpose / Deskripsi | Target Stack |
|---|---|---|
| [`setup-project`](file:///c:/dokugemini/doku-gemini-mcp/skills/setup-project/SKILL.md) | Main orchestrator — scaffolds complete DOKU Payment Gateway integration | Node, Python, Go, PHP, Java |
| [`detect-stack`](file:///c:/dokugemini/doku-gemini-mcp/skills/detect-stack/SKILL.md) | Detects language, framework, ORM, and environment structure | All Stacks |
| [`setup-credentials`](file:///c:/dokugemini/doku-gemini-mcp/skills/setup-credentials/SKILL.md) | Safely configures DOKU Client ID, Secret Key, and Environment | `.env`, Config Files |
| [`doku-checkout`](file:///c:/dokugemini/doku-gemini-mcp/skills/doku-checkout/SKILL.md) | Dedicated guide for DOKU Checkout, popup/redirect UI, and Cancel Order API | All APIs & Frontends |
| [`doku-payment-gateway`](file:///c:/dokugemini/doku-gemini-mcp/skills/doku-payment-gateway/SKILL.md) | Primary reference for Jokul API v2, endpoints, and HMAC signatures | All APIs |
| [`webhook-receiver`](file:///c:/dokugemini/doku-gemini-mcp/skills/webhook-receiver/SKILL.md) | Scaffolds webhook endpoint with signature verification & idempotency guard | Express, Fastify, FastAPI, Gin |
| [`doku-mcp-server`](file:///c:/dokugemini/doku-gemini-mcp/skills/doku-mcp-server/SKILL.md) | Configures DOKU MCP server for AI Agentic Commerce | TypeScript, Node.js |
| [`mock-test`](file:///c:/dokugemini/doku-gemini-mcp/skills/mock-test/SKILL.md) | Validates HMAC-SHA256 signature calculations against DOKU Sandbox | Sandbox APIs |
| [`generate-postman`](file:///c:/dokugemini/doku-gemini-mcp/skills/generate-postman/SKILL.md) | Exports Postman Collection v2.1 with automatic pre-request signature scripts | Postman v2.1 |
| [`production-checklist`](file:///c:/dokugemini/doku-gemini-mcp/skills/production-checklist/SKILL.md) | Runs 8 mandatory security and stability checks before deployment | Production Deployment |
| [`fetch-api-spec`](file:///c:/dokugemini/doku-gemini-mcp/skills/fetch-api-spec/SKILL.md) | Scrapes and stores official DOKU API specs locally | OpenAPI / JSON Spec |
| [`upgrade`](file:///c:/dokugemini/doku-gemini-mcp/skills/upgrade/SKILL.md) | Diffs existing code against latest spec and applies non-breaking patches | Upgrades |

---

## 🔒 Cryptographic Strictness & Security Policies (`AGENTS.md`)

1. **Jokul API v2 Component String Formula**:
   ```text
   Client-Id:<CLIENT_ID>\nRequest-Id:<REQUEST_ID>\nRequest-Timestamp:<TIMESTAMP>\nRequest-Target:<TARGET_PATH>\nDigest:<DIGEST_STRING>
   ```
   - **No trailing newline (`\n`)** allowed at the end of the component string.
   - For `GET` requests, completely omit `\nDigest:<DIGEST_STRING>`.
   - `Request-Timestamp` must be UTC ISO8601 strictly without milliseconds (e.g. `2026-08-09T00:00:00Z`).

2. **Bank Indonesia SNAP BI v1.0 Standard**:
   - **Asymmetric Signature**: `SHA256withRSA` over `X-CLIENT-KEY + "|" + X-TIMESTAMP` using merchant's Private Key.
   - **Symmetric Signature**: `HMAC-SHA512` over `HTTPMethod + ":" + EndpointUrl + ":" + AccessToken + ":" + Lowercase(HexEncode(SHA-256(minify(RequestBody)))) + ":" + TimeStamp`.
   - `AccessToken` inside the string to sign must **not** include the `Bearer ` prefix.

3. **Mandatory Webhook Verification**:
   - Inbound webhooks must be verified using `crypto.timingSafeEqual` to prevent timing attacks.
   - Unverified requests must be immediately rejected with HTTP `401 Unauthorized`.

---

## 📚 Documentation Index

1. 📖 [**Skills Comprehensive Guide (`docs/SKILLS_GUIDE.md`)**](file:///c:/dokugemini/doku-gemini-mcp/docs/SKILLS_GUIDE.md)  
2. 🔑 [**HMAC & SNAP Signature Guide (`docs/HMAC_SIGNATURE_GUIDE.md`)**](file:///c:/dokugemini/doku-gemini-mcp/docs/HMAC_SIGNATURE_GUIDE.md)  
3. 🤖 [**MCP Server Guide (`docs/MCP_SERVER_GUIDE.md`)**](file:///c:/dokugemini/doku-gemini-mcp/docs/MCP_SERVER_GUIDE.md)  
4. 🔔 [**Webhook & Anti-Replay Guide (`docs/WEBHOOK_GUIDE.md`)**](file:///c:/dokugemini/doku-gemini-mcp/docs/WEBHOOK_GUIDE.md)  
5. 🚀 [**Production Readiness Checklist (`docs/PRODUCTION_CHECKLIST.md`)**](file:///c:/dokugemini/doku-gemini-mcp/docs/PRODUCTION_CHECKLIST.md)  
6. 🌐 [**Frontend Integration Guide (`docs/FRONTEND_INTEGRATION_GUIDE.md`)**](file:///c:/dokugemini/doku-gemini-mcp/docs/FRONTEND_INTEGRATION_GUIDE.md)  
7. 💳 [**DOKU Checkout Comprehensive Guide (`docs/DOKU_CHECKOUT_GUIDE.md`)**](file:///c:/dokugemini/doku-gemini-mcp/docs/DOKU_CHECKOUT_GUIDE.md)  

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).  
Authored by [Roedy Rustam](https://github.com/roedyrustam).
