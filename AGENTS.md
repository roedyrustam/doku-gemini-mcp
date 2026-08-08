# Antigravity Rules for `doku-gemini-mcp` Plugin

This document specifies mandatory rules, security requirements, signature formulas, and MCP tool design standards for agents interacting with DOKU Payment Gateway integrations and DOKU MCP Servers.

---

## 1. Secrets & Credentials Safety
- **NEVER** hardcode `DOKU_CLIENT_ID` or `DOKU_SECRET_KEY` directly in source code or repository files.
- **ALWAYS** inject API keys via environment variables (`process.env.DOKU_CLIENT_ID`, `process.env.DOKU_SECRET_KEY`).
- Keep separate credentials for **Sandbox** (`https://api-sandbox.doku.com`) and **Production** (`https://api.doku.com`).

---

## 2. Signature Calculation Strictness
- Component String Assembly **MUST** strictly follow:
  ```text
  Client-Id:<CLIENT_ID>\nRequest-Id:<REQUEST_ID>\nRequest-Timestamp:<TIMESTAMP>\nRequest-Target:<TARGET_PATH>\nDigest:<DIGEST_STRING>
  ```
- **NEVER** add a trailing newline (`\n`) at the end of the raw component string.
- Timestamp format **MUST** be UTC ISO8601 string without milliseconds, e.g., `2026-08-07T13:00:00Z` (`new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')`).
- For `GET` requests, completely omit the `\nDigest:...` portion of the signature component.

---

## 3. Mandatory Webhook Signature Verification
- ALL incoming HTTP webhook notifications from DOKU **MUST** be cryptographically verified using HMAC-SHA256 before updating database or transaction status.
- Unverified requests **MUST** be immediately rejected with HTTP `401 Unauthorized`.
- Save transaction invoice status checks in an atomic database transaction.
- Prevent duplicate webhook processing by checking existing payment status before executing order fulfillment.
- Sanitize payload logs to prevent sensitive customer PII or API secret key leakage into application logs.

---

## 4. MCP Payment Tool Design Rules
- Every MCP Tool definition **MUST** include explicit JSON Schema types, clear parameter descriptions, and required fields.
- Monetary amount inputs **MUST** be specified in IDR integer format without decimal points unless specified by bank channel rules.
- MCP Tools **MUST** catch network and API authorization errors gracefully.
- Do **NOT** leak raw process stack traces to the LLM context. Return structured, user-friendly JSON output explaining the error code and actionable suggestions.
- DOKU MCP Servers **MUST** default to `DOKU_IS_PRODUCTION=false` (Sandbox) unless explicitly configured for production deployment.
