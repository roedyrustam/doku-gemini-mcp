# Antigravity Rules for `doku-gemini-mcp` Plugin

This document specifies mandatory rules, security requirements, signature formulas, and MCP tool design standards for agents interacting with DOKU Payment Gateway integrations and DOKU MCP Servers based on official [developers.doku.com](https://developers.doku.com/) documentation.

---

## 1. Secrets & Credentials Safety
- **NEVER** hardcode `DOKU_CLIENT_ID` or `DOKU_SECRET_KEY` directly in source code, tests, or repository files.
- **ALWAYS** inject API keys via environment variables (`process.env.DOKU_CLIENT_ID`, `process.env.DOKU_SECRET_KEY`).
- Keep separate credentials for **Sandbox** (`https://api-sandbox.doku.com`) and **Production** (`https://api.doku.com`).

---

## 2. Signature Calculation Strictness
- Mandatory HTTP Request Headers:
  - `Client-Id`: Merchant Client ID from DOKU Back Office.
  - `Request-Id`: Unique UUID v4 per HTTP request.
  - `Request-Timestamp`: UTC ISO8601 string without milliseconds, e.g. `2026-08-09T00:00:00Z` (`new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')`).
  - `Request-Target`: Endpoint target path (e.g. `/checkout/v1/payment` or `/doku-virtual-account/v2/payment-code`).
  - `Digest`: Base64 encoded SHA-256 hash of JSON request body (Omitted for `GET` requests).
  - `Signature`: Format `HMACSHA256=<base64-signature>`.

- Component String Assembly **MUST** strictly follow:
  ```text
  Client-Id:<CLIENT_ID>\nRequest-Id:<REQUEST_ID>\nRequest-Timestamp:<TIMESTAMP>\nRequest-Target:<TARGET_PATH>\nDigest:<DIGEST_STRING>
  ```
- **NEVER** add a trailing newline (`\n`) at the end of the raw component string.
- For `GET` requests (e.g. Check Status API `/orders/v1/status/:invoice_number`), completely omit `\nDigest:<DIGEST_STRING>` from component assembly.

---

## 3. Webhook Signature Verification & Idempotency
- ALL incoming HTTP webhook notifications from DOKU **MUST** be cryptographically verified using HMAC-SHA256 before updating database or order status.
- Unverified requests **MUST** be immediately rejected with HTTP `401 Unauthorized`.
- Use timing-safe string comparison (`crypto.timingSafeEqual`) when validating incoming signature headers to prevent timing side-channel attacks.
- Prevent duplicate webhook processing by performing atomic database transaction checks before triggering order fulfillment.
- Sanitize payload logs to prevent sensitive customer PII or secret key leakage in application stdout/logs.

---

## 4. MCP Payment Tool & API Standards
- Every MCP Tool definition **MUST** include explicit JSON Schema types, clear parameter descriptions, and required fields.
- Monetary amount inputs **MUST** be specified as IDR integers without decimal places unless required by specific bank channel rules.
- MCP Tools **MUST** catch network and API authorization errors gracefully without leaking raw stack traces to the LLM context.
- DOKU MCP Servers **MUST** default to `DOKU_IS_PRODUCTION=false` (Sandbox) unless explicitly configured for production deployment.
