---
name: doku-payment-gateway
description: "Expert guide for integrating DOKU Payment Gateway (Jokul API v2). Covers HMAC-SHA256 header signature calculation, Checkout & Direct APIs (VA, QRIS, E-Wallet, Credit Card, Direct Debit, PayLater), status inquiry, webhook notification verification, and sandbox/production setup / Panduan ahli integrasi DOKU Payment Gateway."
author: "Roedy Rustam"
---

# DOKU Payment Gateway Integration / Integrasi Payment Gateway DOKU

[English](#english) | [Bahasa Indonesia](#bahasa-indonesia)

---

<a name="english"></a>
## English

### Description
Expert guide for implementing DOKU Payment Gateway (Jokul API v2) integrations based on official [DOKU Developers Documentation](https://developers.doku.com/). Covers authentication headers, SHA-256 Digest generation, HMAC-SHA256 request signature construction, Webhook notification verification, Checkout Payment Links, Direct Payments (Virtual Account, QRIS, E-Wallet, Credit Card, Direct Debit, PayLater), Status Inquiry, error handling, and sandbox/production deployment.

### Trigger Conditions
Activate this skill when the user is:
- Building or refactoring DOKU Payment Gateway integration in Node.js, TypeScript, Python, Go, PHP, or Java.
- Implementing HMAC-SHA256 signature calculations or notification signature verification for DOKU API.
- Setting up DOKU Checkout, Virtual Account (BCA, Mandiri, BRI, BNI, Permata, Danamon, CIMB), QRIS, E-Wallet (OVO, ShopeePay, DANA, LinkAja), Credit Card, Direct Debit, or PayLater (Kredivo, Indodana, Akulaku) APIs.
- Querying order status via `/orders/v1/status/:invoice_number`.
- Debugging DOKU API authorization errors (`Authorization Failed`, invalid signature, incorrect timestamp format).

---

### Core Architecture & Credentials

#### Environment Gateways & Testing Tools
| Environment | Base URL | Dashboard / Back Office | Payment Simulator |
|---|---|---|---|
| **Sandbox** | `https://api-sandbox.doku.com` | `https://sandbox.doku.com/bo/login` | `https://sandbox.doku.com/integration/simulator/` |
| **Production** | `https://api.doku.com` | `https://dashboard.doku.com` | N/A |

#### Mandatory Headers
- `Client-Id`: Merchant Client ID.
- `Request-Id`: Unique UUID string.
- `Request-Timestamp`: UTC ISO8601 string without milliseconds (e.g. `2026-08-09T00:00:00Z`).
- `Request-Target`: Endpoint target path (e.g. `/checkout/v1/payment` or `/doku-virtual-account/v2/payment-code`).
- `Digest`: Base64 encoded SHA-256 hash of JSON payload string (Omitted for `GET` requests).
- `Signature`: Format `HMACSHA256=<base64-signature>`.

---

### Signature Calculation Formula

#### 1. Digest Calculation (POST / PUT / PATCH)
```text
Raw Body JSON -> SHA-256 Hash -> Base64 Encode -> Digest String
```

#### 2. Signature Component Assembly
```text
Client-Id:<CLIENT_ID>\nRequest-Id:<REQUEST_ID>\nRequest-Timestamp:<TIMESTAMP>\nRequest-Target:<TARGET_PATH>\nDigest:<DIGEST_STRING>
```
*Note: For GET requests, omit `\nDigest:<DIGEST_STRING>`.*

#### 3. HMAC-SHA256 Signing
```text
Raw String + Secret Key -> HMAC-SHA256 Hash -> Base64 Encode -> Prepend "HMACSHA256="
```

---

### Endpoints Reference Summary

| Channel | Endpoint | Method | Key Parameters |
|---|---|---|---|
| **DOKU Checkout** | `/checkout/v1/payment` | POST | `order.amount`, `order.invoice_number`, `customer.name`, `customer.email` |
| **Virtual Account** | `/doku-virtual-account/v2/payment-code` | POST | `order.amount`, `order.invoice_number`, `virtual_account_info.billing_type` |
| **QRIS** | `/qris/v1/payment-code` | POST | `order.amount`, `order.invoice_number`, `qris_info.header_title` |
| **E-Wallet** | `/e-wallet/v1/payment` | POST | `order.amount`, `order.invoice_number`, `e_wallet_info.channel` |
| **Credit Card** | `/credit-card/v1/payment` | POST | `order.amount`, `card.token_id`, `card.three_ds` |
| **Check Status** | `/orders/v1/status/:invoice_number` | GET | `invoice_number` path param |

---

<a name="bahasa-indonesia"></a>
## Bahasa Indonesia

### Deskripsi
Panduan ahli untuk mengintegrasikan DOKU Payment Gateway (Jokul API v2) sesuai standar dokumentasi resmi [DOKU Developers Portal](https://developers.doku.com/). Mencakup header autentikasi, pembuatan Digest SHA-256, pembuatan Signature HMAC-SHA256, verifikasi Webhook, Checkout Payment Link, Direct Payment (Virtual Account, QRIS, E-Wallet, Kartu Kredit, Direct Debit, PayLater), Check Status API, penanganan error, dan deployment Sandbox ke Production.

### Kondisi Pemicu
Aktifkan skill ini ketika pengguna sedang:
- Membangun atau merefaktor integrasi DOKU Payment Gateway di Node.js, TypeScript, Python, Go, PHP, atau Java.
- Mengimplementasikan kalkulasi signature HMAC-SHA256 atau verifikasi signature notifikasi webhook.
- Mengatur API Checkout, Virtual Account, QRIS, E-Wallet, Kartu Kredit, Direct Debit, atau PayLater.
- Memeriksa status transaksi via `/orders/v1/status/:invoice_number`.
