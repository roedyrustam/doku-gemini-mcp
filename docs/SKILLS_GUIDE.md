# DOKU Gemini MCP - Agentic Skills Guide

This guide provides an in-depth reference for all 12 specialized agentic skills included in the `doku-gemini-mcp` plugin.

---

## Skills Matrix Overview

| # | Skill Name | Primary Purpose | Key Output / Action |
|---|---|---|---|
| 1 | [`setup-project`](#1-setup-project) | Main entry point for DOKU integration | Scaffolds client code, credentials, and endpoints |
| 2 | [`detect-stack`](#2-detect-stack) | Codebase environment analyzer | Detects language, framework, ORM, and structure |
| 3 | [`setup-credentials`](#3-setup-credentials) | Environment credential manager | Configures `.env` with Client ID and Secret Key |
| 4 | [`doku-checkout`](#4-doku-checkout) | Dedicated DOKU Checkout guide | Payment URL creation, modal popup/redirect, Cancel Order API |
| 5 | [`doku-payment-gateway`](#5-doku-payment-gateway) | Core DOKU Jokul API v2 guide | Provides specifications for Direct VA, QRIS, etc. |
| 6 | [`webhook-receiver`](#6-webhook-receiver) | HTTP Webhook listener generator | Scaffolds signature verifier & idempotency guard |
| 7 | [`doku-mcp-server`](#7-doku-mcp-server) | MCP Agentic Commerce server guide | Configures MCP server tools & `mcp_config.json` |
| 8 | [`mock-test`](#8-mock-test) | Sandbox test runner | Executes live sandbox API call to verify signatures |
| 9 | [`generate-postman`](#9-generate-postman) | Postman Collection exporter | Exports Postman v2.1 with pre-request HMAC scripts |
| 10 | [`production-checklist`](#10-production-checklist) | Go-live security auditor | Runs 8 mandatory production readiness checks |
| 11 | [`fetch-api-spec`](#11-fetch-api-spec) | DOKU API spec fetcher | Downloads & stores official DOKU OpenAPI specs |
| 12 | [`upgrade`](#12-upgrade) | Spec diffing & patch manager | Diffs code against latest spec and applies patches |

---

## Detailed Skill Specifications

### 1. `setup-project`
- **Location**: `skills/setup-project/SKILL.md`
- **Description**: Main entry point for integrating DOKU Payment Gateway into a project.
- **Workflow**:
  1. Invokes `detect-stack` to analyze language/framework.
  2. Invokes `setup-credentials` to prompt or configure `DOKU_CLIENT_ID` and `DOKU_SECRET_KEY`.
  3. Scaffolds DOKU payment service class/module with HMAC signature calculation.
  4. Scaffolds example checkout route and webhook notification handler.

---

### 2. `detect-stack`
- **Location**: `skills/detect-stack/SKILL.md`
- **Description**: Analyzes project structure to determine tech stack.
- **Detection Capabilities**:
  - **Languages**: Node.js / TypeScript, Python, Go, PHP, Java, Rust.
  - **Frameworks**: Express, Next.js, Fastify, NestJS, FastAPI, Django, Flask, Gin, Echo, Fiber, Laravel, Spring Boot.
  - **Package Managers**: npm, pnpm, yarn, bun, uv, poetry, pip, go mod, composer, gradle, maven.

---

### 3. `setup-credentials`
- **Location**: `skills/setup-credentials/SKILL.md`
- **Description**: Safely collects and stores DOKU API keys into environment configuration.
- **Key Rules**:
  - Validates `DOKU_CLIENT_ID` and `DOKU_SECRET_KEY` format.
  - Generates `.env.example` template without exposing sensitive values.
  - Sets `DOKU_IS_PRODUCTION=false` by default for safety.

---

### 4. `doku-checkout`
- **Location**: `skills/doku-checkout/SKILL.md`
- **Description**: Dedicated reference guide for DOKU Checkout hosted & modal payment solutions.
- **Coverage**:
  - **Initiate Payment**: `/checkout/v1/payment` (Basic & Full payload schemas, line items, multi-callbacks, customer PII).
  - **Cancel Order API**: `/checkout/v3/cancellations` (void unpaid VA & QRIS orders).
  - **Order Status Lifecycle**: `ORDER_GENERATED`, `ORDER_EXPIRED`, `ORDER_RECOVERED`.
  - **Recover Abandoned Cart**: Resuming expired orders up to 3 times without new invoice.
  - **Frontend Integration**: Pop-up modal overlay (`loadJokulCheckout`) and Redirect modes.
  - **Channel Filtering**: `payment.payment_method_types` constant strings.

---

### 5. `doku-payment-gateway`
- **Location**: `skills/doku-payment-gateway/SKILL.md`
- **Description**: Technical reference guide for DOKU Jokul API v2 & SNAP API v1.0 integration.
- **Coverage**:
  - **DOKU Checkout**: Payment link creation `/checkout/v1/payment` and cancellation `/checkout/v3/cancellations`.
  - **Virtual Account (VA)**: Direct VA generation `/doku-virtual-account/v2/payment-code` (BCA, Mandiri, BRI, BNI, Permata, Danamon, CIMB).
  - **QRIS**: Dynamic QR code generation `/qris/v1/payment-code` (Jokul) & `/snap-adapter/b2b/v1.0/qr/qr-mpm-generate` (SNAP).
  - **E-Wallet**: Charge initiation `/e-wallet/v1/payment` (OVO, ShopeePay, DANA, LinkAja).
  - **Credit Card**: Tokenization & 3D Secure payment `/credit-card/v1/payment`.
  - **Check Status**: Transaction inquiry `/orders/v1/status/:invoice_number`.
  - **Online Refund**: Refund initiation `/orders/v1/refund`.

---

### 6. `webhook-receiver`
- **Location**: `skills/webhook-receiver/SKILL.md`
- **Description**: Scaffolds HTTP Webhook notification handler endpoints.
- **Key Features**:
  - Cryptographic signature verification (Jokul HMAC-SHA256 & SNAP `X-SIGNATURE`).
  - Uses `crypto.timingSafeEqual` to prevent timing attack vulnerabilities.
  - Implements atomic database check to ensure idempotent processing (prevents double fulfillment).

---

### 7. `doku-mcp-server`
- **Location**: `skills/doku-mcp-server/SKILL.md`
- **Description**: Guide for configuring DOKU Model Context Protocol (MCP) server for autonomous AI commerce.
- **Tools Included**:
  - `create_checkout_payment`
  - `cancel_checkout_order`
  - `create_virtual_account`
  - `create_qris_payment`
  - `create_ewallet_payment`
  - `check_transaction_status`
  - `process_refund`

---

### 8. `mock-test`
- **Location**: `skills/mock-test/SKILL.md`
- **Description**: Executes a live HTTP test request against the DOKU Sandbox API to verify HMAC signature math and connectivity.

---

### 9. `generate-postman`
- **Location**: `skills/generate-postman/SKILL.md`
- **Description**: Exports a Postman Collection v2.1 file pre-configured with JavaScript pre-request scripts that automatically compute `Digest` and `Signature` headers for all DOKU endpoints.

---

### 10. `production-checklist`
- **Location**: `skills/production-checklist/SKILL.md`
- **Description**: Audits the repository against 8 mandatory production readiness criteria before go-live deployment.

---

### 11. `fetch-api-spec`
- **Location**: `skills/fetch-api-spec/SKILL.md`
- **Description**: Fetches and structures official API specs from `developers.doku.com` for offline local reference, covering Jokul v2 and SNAP v1.0.

---

### 12. `upgrade`
- **Location**: `skills/upgrade/SKILL.md`
- **Description**: Diffs current implementation against latest DOKU API spec versions (Jokul v2 & SNAP v1.0) and safely applies non-breaking patches.


