---
name: doku-payment-gateway
description: "Expert guide for integrating DOKU Payment Gateway (Jokul API v2 & SNAP API v1.0). Covers HMAC-SHA256 & HMAC-SHA512 signature calculation, Checkout & Direct APIs (Virtual Account, QRIS, E-Wallet, Credit Card, Direct Debit, PayLater, Refund), status inquiry, webhook notification verification, and sandbox/production setup / Panduan ahli integrasi DOKU Payment Gateway."
author: "Roedy Rustam"
---

# DOKU Payment Gateway Integration / Integrasi Payment Gateway DOKU

[English](#english) | [Bahasa Indonesia](#bahasa-indonesia)

---

<a name="english"></a>
## English

### Description
Expert guide for implementing DOKU Payment Gateway (Jokul API v2 & SNAP API v1.0) integrations based on official [DOKU Developers Documentation](https://developers.doku.com/). Covers authentication headers, SHA-256 Digest generation, HMAC-SHA256 request signature construction, SNAP Symmetric/Asymmetric signatures, Webhook notification verification, Checkout Payment Links, Direct Payments (Virtual Account, QRIS, E-Wallet, Credit Card, Direct Debit, PayLater, Refund), Status Inquiry, error handling, and sandbox/production deployment.

### Trigger Conditions
Activate this skill when the user is:
- Building or refactoring DOKU Payment Gateway integration in Node.js, TypeScript, Python, Go, PHP, or Java.
- Implementing HMAC-SHA256 signature calculations or notification signature verification for DOKU API.
- Integrating DOKU Checkout JS library (`jokul-checkout.js`) on the frontend for pop-up or redirect modes.
- Setting up DOKU Checkout, Virtual Account (BCA, Mandiri, BRI, BNI, Permata, Danamon, CIMB), QRIS, E-Wallet (OVO, ShopeePay, DANA, LinkAja), Credit Card, Direct Debit, or PayLater (Kredivo, Indodana, Akulaku) APIs.
- Setting up Account Binding, Direct Debit recurring payments, or Online Refunds.
- Querying order status via `/orders/v1/status/:invoice_number` or SNAP query endpoints.
- Debugging DOKU API authorization errors (`Authorization Failed`, invalid signature, incorrect timestamp format).

---

### Core Architecture & Credentials

#### Environment Gateways & Testing Tools
| Environment | Base URL | Dashboard / Back Office | Payment Simulator |
|---|---|---|---|
| **Sandbox** | `https://api-sandbox.doku.com` | `https://sandbox.doku.com/bo/login` | `https://sandbox.doku.com/gtw-config-v2/simulator` |
| **Production** | `https://api.doku.com` | `https://dashboard.doku.com` | N/A |

#### Mandatory Headers (Jokul API v2 Standard)
- `Client-Id`: Merchant Client ID from DOKU Back Office.
- `Request-Id`: Unique UUID v4 per HTTP request.
- `Request-Timestamp`: UTC ISO8601 string without milliseconds (e.g. `2026-08-09T00:00:00Z`).
- `Signature`: Format `HMACSHA256=<base64-signature>`.

*Note: `Request-Target` and `Digest` are used only for Signature calculation component string, NOT as HTTP Request Headers.*

#### Mandatory Headers (SNAP BI / SNAP Adapter Standard)
- `X-TIMESTAMP`: UTC ISO8601 string with offset (e.g. `2026-08-09T00:00:00+07:00`).
- `X-SIGNATURE`: HMAC-SHA512 or RSA-SHA256 signature string.
- `X-CLIENT-KEY`: Merchant Client ID.
- `X-PARTNER-ID`: Merchant Client ID.
- `X-EXTERNAL-ID`: Unique trace ID per request.
- `CHANNEL-ID`: Channel identification header.

#### Frontend Integration (DOKU Checkout JS)
- **Viewport**: Requires `<meta name="viewport" content="width=device-width, initial-scale=1">`
- **JS Script (Sandbox)**: `<script src="https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js"></script>`
- **JS Script (Production)**: `<script src="https://jokul.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js"></script>`
- **Invokation**: `loadJokulCheckout(payment.url)`

---

### Signature Calculation Formulas

#### 1. Jokul API v2 Signature Standard
- **Digest Calculation** (`POST` / `PUT` / `PATCH`):
  ```text
  Raw Body JSON -> SHA-256 Hash -> Base64 Encode -> Digest String
  ```
- **Component String Assembly**:
  ```text
  Client-Id:<CLIENT_ID>\nRequest-Id:<REQUEST_ID>\nRequest-Timestamp:<TIMESTAMP>\nRequest-Target:<TARGET_PATH>\nDigest:<DIGEST_STRING>
  ```
  *Note: For GET requests, omit `\nDigest:<DIGEST_STRING>`.*
- **HMAC-SHA256 Signing**:
  ```text
  Raw String + Secret Key -> HMAC-SHA256 Hash -> Base64 Encode -> Prepend "HMACSHA256="
  ```

#### 2. SNAP Symmetric Signature Standard
- **String to Sign**:
  ```text
  HTTPMethod + ":" + EndpointUrl + ":" + AccessToken + ":" + Lowercase(HexEncode(SHA-256(MinifiedRequestBody))) + ":" + Timestamp
  ```
- **HMAC-SHA512 Signing**:
  ```text
  HMAC-SHA512(SecretKey, StringToSign) -> Base64 Encode -> Signature
  ```

---

### Endpoints Reference Summary

| Channel / Feature | Endpoint | Method | Key Parameters |
|---|---|---|---|
| **DOKU Checkout** | `/checkout/v1/payment` | POST | `order.amount`, `order.invoice_number`, `customer.name`, `customer.email` |
| **Cancel Checkout Order** | `/checkout/v3/cancellations` | POST | `order.invoice_number`, `payment.original_request_id`, `note` |
| **Virtual Account** | `/doku-virtual-account/v2/payment-code` | POST | `order.amount`, `order.invoice_number`, `virtual_account_info.billing_type` |
| **QRIS (Jokul)** | `/qris/v1/payment-code` | POST | `order.amount`, `order.invoice_number`, `qris_info.header_title` |
| **QRIS (SNAP)** | `/snap-adapter/b2b/v1.0/qr/qr-mpm-generate` | POST | `partnerReferenceNo`, `amount.value`, `merchantId` |
| **E-Wallet** | `/e-wallet/v1/payment` | POST | `order.amount`, `order.invoice_number`, `e_wallet_info.channel` |
| **Credit Card** | `/credit-card/v1/payment` | POST | `order.amount`, `card.token_id`, `card.three_ds` |
| **Check Status** | `/orders/v1/status/:invoice_number` | GET | `invoice_number` path param (returns `order.status` & `transaction.status`) |
| **Online Refund** | `/orders/v1/refund` | POST | `invoice_number`, `amount`, `reason` |

---

<a name="bahasa-indonesia"></a>
## Bahasa Indonesia

### Deskripsi
Panduan ahli untuk mengintegrasikan DOKU Payment Gateway (Jokul API v2 & SNAP API v1.0) sesuai standar dokumentasi resmi [DOKU Developers Portal](https://developers.doku.com/). Mencakup header autentikasi, pembuatan Digest SHA-256, pembuatan Signature HMAC-SHA256 & HMAC-SHA512, verifikasi Webhook, Checkout Payment Link, Direct Payment (Virtual Account, QRIS, E-Wallet, Kartu Kredit, Direct Debit, PayLater, Refund), Check Status API, penanganan error, dan deployment Sandbox ke Production.

### Kondisi Pemicu
Aktifkan skill ini ketika pengguna sedang:
- Membangun atau merefaktor integrasi DOKU Payment Gateway di Node.js, TypeScript, Python, Go, PHP, atau Java.
- Mengimplementasikan kalkulasi signature HMAC-SHA256/HMAC-SHA512 atau verifikasi signature notifikasi webhook.
- Mengatur API Checkout, Virtual Account, QRIS, E-Wallet, Kartu Kredit, Direct Debit, PayLater, atau Refund.
- Memeriksa status transaksi via `/orders/v1/status/:invoice_number` atau endpoint SNAP.


---
### 🚨 SNAP Integration Mandate (CRITICAL)
**MANDATORY**: The AI Agent MUST automatically apply the SNAP API v1.0 standard (Standard Nasional Open API Pembayaran) for all DOKU integrations, instead of the legacy Jokul API v2, unless the user explicitly requests otherwise. All generated signatures, headers, and endpoints MUST follow the SNAP BI standard.

### 🧪 DOKU Sandbox Simulator
**MANDATORY**: When testing in Sandbox mode and needing to access the Payment Simulator, the AI Agent MUST use this exact URL: `https://sandbox.doku.com/integration/simulator/`.
