# DOKU Security & Authentication Coding Rules

## 1. Secrets & Credentials Safety
- NEVER hardcode `DOKU_CLIENT_ID` or `DOKU_SECRET_KEY` directly in source code or repository files.
- ALWAYS inject API keys via environment variables or secure vault managers.
- Keep separate credentials for **Sandbox** (`https://api-sandbox.doku.com`) and **Production** (`https://api.doku.com`).

## 2. Signature Calculation Strictness
- Component String Assembly MUST strictly follow:
  `Client-Id:<CLIENT_ID>\nRequest-Id:<REQUEST_ID>\nRequest-Timestamp:<TIMESTAMP>\nRequest-Target:<TARGET_PATH>\nDigest:<DIGEST_STRING>`
- NEVER add a trailing newline (`\n`) at the end of the raw component string.
- Timestamp format MUST be UTC ISO8601 string without milliseconds, e.g., `2026-08-07T13:00:00Z` (`new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')`).
- For `GET` requests, completely omit the `\nDigest:...` portion of the signature component.

## 3. Mandatory Webhook Signature Verification
- ALL incoming HTTP webhook notifications from DOKU MUST be cryptographically verified using HMAC-SHA256 before updating database or transaction status.
- Unverified requests MUST be immediately rejected with HTTP `401 Unauthorized`.

## 4. Webhook Idempotency & Data Leakage Prevention
- Save transaction invoice status checks in an atomic database transaction.
- Prevent duplicate webhook processing by checking existing payment status before executing order fulfillment.
- Sanitize payload logs to prevent sensitive customer PII or API secret key leakage into stdout/application logs.
