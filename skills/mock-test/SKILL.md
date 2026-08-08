---
name: mock-test
description: "Send test API request to DOKU Sandbox environment, validating HMAC-SHA256 signature calculations and HTTP response status / Kirim permintaan pengujian ke Sandbox DOKU, memvalidasi kalkulasi signature HMAC-SHA256 dan status respon."
author: "Roedy Rustam"
---

# Mock Test / Pengujian Integrasi DOKU

[English](#english) | [Bahasa Indonesia](#bahasa-indonesia)

---

<a name="english"></a>
## English

### Description
Executes an end-to-end test request against DOKU Sandbox API (`https://api-sandbox.doku.com`). Validates SHA-256 Digest generation, HMAC-SHA256 header signature calculation, UTC ISO8601 timestamp formatting, and inspects response payloads.

### Trigger Conditions
Activate this skill when the user says:
- `"test DOKU integration"`
- `"run DOKU sandbox test"`
- `"verify DOKU signature calculation"`

---

### Step-by-Step Execution Protocol

1. **Prepare Test Payload**:
   - Sample Checkout Payment Request to `/checkout/v1/payment`.
   - Amount: `10000` (IDR Integer).
   - Invoice: `INV-TEST-YYYYMMDDHHMMSS`.

2. **Compute Signature Components**:
   - `Digest` = Base64(SHA256(Raw JSON Body))
   - `Component` = `Client-Id:<ID>\nRequest-Id:<UUID>\nRequest-Timestamp:<TIMESTAMP>\nRequest-Target:/checkout/v1/payment\nDigest:<DIGEST>`
   - `Signature` = `HMACSHA256=` + Base64(HMAC-SHA256(Component, SECRET_KEY))

3. **Send Request to Sandbox**:
   - Endpoint: `https://api-sandbox.doku.com/checkout/v1/payment`
   - Log HTTP Status and DOKU Response Message.
   - If HTTP 401: Explain signature mismatch causes (trailing newline, timestamp milliseconds, unsorted JSON).
   - If HTTP 200/201: Report successful integration test.

---

<a name="bahasa-indonesia"></a>
## Bahasa Indonesia

### Deskripsi
Mengeksekusi pengujian end-to-end ke DOKU Sandbox API (`https://api-sandbox.doku.com`). Memvalidasi pembuatan Digest SHA-256, kalkulasi signature HMAC-SHA256 header, format timestamp UTC ISO8601, serta menganalisis respon dari server DOKU.

### Kondisi Pemicu
Aktifkan skill ini ketika pengguna mengatakan:
- `"test DOKU integration"`
- `"jalankan tes sandbox DOKU"`
- `"verifikasi kalkulasi signature DOKU"`
