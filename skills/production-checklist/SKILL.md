---
name: production-checklist
description: "Run 8 mandatory production readiness checks before go-live deployment of DOKU Payment Gateway integration / Jalankan 8 pemeriksaan kesiapan produksi sebelum rilis integrasi DOKU."
author: "Roedy Rustam"
---

# Production Checklist / Checklist Kesiapan Produksi DOKU

[English](#english) | [Bahasa Indonesia](#bahasa-indonesia)

---

<a name="english"></a>
## English

### Description
Audits the codebase for 8 mandatory production security and reliability checks before switching from DOKU Sandbox (`api-sandbox.doku.com`) to Production (`api.doku.com`).

### Trigger Conditions
Activate this skill when the user says:
- `"production checklist"`
- `"check DOKU go-live readiness"`
- `"audit DOKU production setup"`

---

### The 8 Mandatory Production Readiness Checks

| # | Check Item | Rule / Standard | Status Audit Method |
|---|---|---|---|
| 1 | **Secrets Safety** | No hardcoded `CLIENT_ID` or `SECRET_KEY` in source files. | Scan codebase for string literals matching DOKU keys. |
| 2 | **Signature Strictness** | Exact component string format without trailing newline `\n`. | Inspect signature calculation assembly logic. |
| 3 | **Timestamp Format** | UTC ISO8601 string without milliseconds (ends in `Z`). | Check timestamp formatting function. |
| 4 | **Webhook Signature Verification** | Reject unverified callback requests with HTTP `401 Unauthorized`. | Verify HMAC-SHA256 callback validator implementation. |
| 5 | **Webhook Idempotency** | Prevent duplicate order fulfillment on repeated callback retries. | Check database atomic state checks before order update. |
| 6 | **Log Sanitization** | No customer PII or secret key leakage in application stdout/logs. | Check log statements in payment and webhook handlers. |
| 7 | **Production Gateway URL** | Dynamic switch between `api-sandbox.doku.com` and `api.doku.com`. | Inspect `DOKU_IS_PRODUCTION` environment flag check. |
| 8 | **Error Exception Safety** | Structured error responses without leaking node/stack traces to LLM context. | Check error handler try-catch wrappers. |

---

<a name="bahasa-indonesia"></a>
## Bahasa Indonesia

### Deskripsi
Melakukan audit kode terhadap 8 pemeriksaan keamanan dan keandalan wajib sebelum berpindah dari DOKU Sandbox (`api-sandbox.doku.com`) ke Production (`api.doku.com`).

### Kondisi Pemicu
Aktifkan skill ini ketika pengguna mengatakan:
- `"production checklist"`
- `"periksa kesiapan go-live DOKU"`
- `"audit konfigurasi produksi DOKU"`
