# DOKU Payment Gateway - Production Readiness Checklist

Before requesting live production credentials or deploying your DOKU Payment Gateway integration to production, perform this 8-step mandatory readiness audit.

---

## 8-Point Go-Live Audit Checklist

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          DOKU PRODUCTION READINESS AUDIT                               │
├────┬───────────────────────────────────┬───────────────────────────────────────────────┤
│ #  │ Audit Item                        │ Requirement Standard                          │
├────┼───────────────────────────────────┼───────────────────────────────────────────────┤
│ 1  │ Environment Isolation             │ Separate Sandbox and Production API Keys     │
│ 2  │ Domain & Callback Whitelist       │ Registered Webhook URLs in DOKU Back Office   │
│ 3  │ HTTPS & TLS Encryption            │ Mandatory TLS 1.2+ on Webhook Endpoints      │
│ 4  │ Webhook Signature Verification    │ HMAC-SHA256 & timingSafeEqual Validation      │
│ 5  │ Idempotency & Database Locks      │ Atomic Transactions (No Double Fulfillment)   │
│ 6  │ Log Sanitization & PII Safety     │ Zero Secret Key / Card Number Log Leakage     │
│ 7  │ Error Recovery & Graceful Fallback│ User-Friendly Errors (No Stack Trace Leaks)  │
│ 8  │ Automated Test Validation         │ 100% Passing Live Sandbox Signature Tests     │
└────┴───────────────────────────────────┴───────────────────────────────────────────────┘
```

---

### Step 1: Environment Isolation
- [ ] Confirm that `DOKU_CLIENT_ID` and `DOKU_SECRET_KEY` are stored strictly in environment variables (`process.env`).
- [ ] Ensure Production API keys are never used in local development or staging environments.
- [ ] Verify Base URL, Back Office, and Simulator configuration:
  - **Sandbox Base URL**: `https://api-sandbox.doku.com` | **Back Office**: `https://sandbox.doku.com/bo/login` | **Simulator**: `https://sandbox.doku.com/gtw-config-v2/simulator`
  - **Production Base URL**: `https://api.doku.com` | **Back Office**: `https://dashboard.doku.com`

---

### Step 2: Domain & Callback URL Whitelisting
- [ ] Log in to [DOKU Back Office Production Portal](https://dashboard.doku.com).
- [ ] Register your production Webhook Notification URL (e.g. `https://api.yourdomain.com/api/doku/webhook`).
- [ ] Register your production Redirect / Callback Return URL (e.g. `https://yourdomain.com/checkout/success`).

---

### Step 3: HTTPS & TLS 1.2+ Enforcement
- [ ] Ensure all API endpoints and notification webhook receivers communicate strictly over `https://`.
- [ ] Verify SSL/TLS certificates are valid and enforce TLS 1.2 or higher.

---

### Step 4: Mandatory Webhook Signature Verification
- [ ] Verify that ALL incoming webhook HTTP requests calculate `HMAC-SHA256` signature over raw body bytes.
- [ ] Confirm `crypto.timingSafeEqual` is used for signature comparison to mitigate timing attacks.
- [ ] Confirm that unverified webhooks return HTTP `401 Unauthorized` immediately.

---

### Step 5: Idempotency & Atomic Database Locks
- [ ] Ensure webhook handler checks existing invoice payment status in an atomic database transaction.
- [ ] Verify that receiving duplicate webhook notifications for an already processed invoice returns HTTP `200 OK` without triggering duplicate fulfillment or email delivery.

---

### Step 6: Log Sanitization & PII Protection
- [ ] Audit application logs (stdout/stderr) to ensure `DOKU_SECRET_KEY` is NEVER logged.
- [ ] Ensure customer credit card numbers, CVVs, or sensitive PII are sanitized before writing to log sinks.

---

### Step 7: Graceful Error Handling & Fallbacks
- [ ] Verify API failure cases (network timeouts, authorization failures, bank channel maintenance) return structured, user-friendly error messages to customers.
- [ ] Ensure internal node stack traces or database errors are not exposed to client web frontends or LLM context windows.

---

### Step 8: Automated Test Validation
- [ ] Run the `mock-test` skill or unit test suite against the Sandbox environment.
- [ ] Confirm 100% pass rate for HMAC-SHA256 header generation, signature verification, and HTTP response parsing.
