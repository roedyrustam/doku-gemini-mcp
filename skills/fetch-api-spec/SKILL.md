---
name: fetch-api-spec
description: "Fetch, extract, and structure official DOKU Payment Gateway API specs from developers.doku.com and persist locally / Mengambil dan menyusun spesifikasi API resmi DOKU dari developers.doku.com dan menyimpannya secara lokal."
author: "Roedy Rustam"
---

# Fetch DOKU API Spec / Ambil Spesifikasi API DOKU

[English](#english) | [Bahasa Indonesia](#bahasa-indonesia)

---

<a name="english"></a>
## English

### Description
Fetches and updates the latest DOKU Payment Gateway API endpoint definitions, request payload structures, header requirements, and status code references from [DOKU Developers Portal](https://developers.doku.com/). Saves structured specification metadata to `.doku-spec.json`.

### Trigger Conditions
Activate this skill when the user says:
- `"fetch DOKU API spec"`
- `"update DOKU endpoints"`
- `"download DOKU API documentation"`

---

### Step-by-Step Execution Protocol

1. **Verify Target Core Endpoints**:
   - Checkout Initiate API: `/checkout/v1/payment`
   - Checkout Cancellation API: `/checkout/v3/cancellations`
   - Virtual Account API (Jokul v2): `/doku-virtual-account/v2/payment-code`
   - Virtual Account API (BI-SNAP): `/virtual-accounts/bi-snap-va/v1.1/transfer-va/create-va`
   - QRIS API (Jokul v2): `/qris/v1/payment-code`
   - QRIS API (SNAP MPM): `/snap-adapter/b2b/v1.0/qr/qr-mpm-generate`
   - SNAP B2B Token API: `/authorization/v1/access-token/b2b`
   - E-Wallet API: `/e-wallet/v1/payment`
   - Direct Card API: `/credit-card/v1/payment`
   - Status Inquiry API: `/orders/v1/status/:invoice_number`
   - Online Refund API: `/orders/v1/refund`

2. **Validate Mandatory Headers Standard**:
   - Jokul v2: `Client-Id`, `Request-Id`, `Request-Timestamp`, `Signature`. (Note: `Request-Target` and `Digest` are used for Signature string, NOT as headers).
   - SNAP v1.0 Asymmetric: `Content-Type: application/json`, `X-CLIENT-KEY`, `X-TIMESTAMP`, `X-SIGNATURE` (SHA256withRSA).
   - SNAP v1.0 Symmetric: `Authorization: Bearer <token>`, `X-PARTNER-ID`, `X-EXTERNAL-ID`, `X-TIMESTAMP`, `X-SIGNATURE` (HMAC-SHA512), `CHANNEL-ID`.

3. **Generate Local Spec Cache (`.doku-spec.json`)**:
   ```json
   {
     "apiVersion": "v2",
     "snapVersion": "v1.0",
     "lastUpdated": "2026-11-05T00:00:00Z",
     "endpoints": {
       "checkout": "/checkout/v1/payment",
       "checkoutCancel": "/checkout/v3/cancellations",
       "virtualAccount": "/doku-virtual-account/v2/payment-code",
       "snapVirtualAccount": "/virtual-accounts/bi-snap-va/v1.1/transfer-va/create-va",
       "qrisJokul": "/qris/v1/payment-code",
       "qrisSnap": "/snap-adapter/b2b/v1.0/qr/qr-mpm-generate",
       "snapB2bToken": "/authorization/v1/access-token/b2b",
       "status": "/orders/v1/status",
       "refund": "/orders/v1/refund"
     },
     "signatureAlgorithms": {
       "jokul": "HMACSHA256",
       "snapAsymmetric": "SHA256withRSA",
       "snapSymmetric": "HMAC-SHA512"
     }
   }
   ```

---

<a name="bahasa-indonesia"></a>
## Bahasa Indonesia

### Deskripsi
Mengambil dan memperbarui definisi endpoint API DOKU Payment Gateway terbaru, struktur payload request, persyaratan header, dan referensi status code dari [DOKU Developers Portal](https://developers.doku.com/). Menyimpan metadata spesifikasi ke `.doku-spec.json`.

### Kondisi Pemicu
Aktifkan skill ini ketika pengguna mengatakan:
- `"fetch DOKU API spec"`
- `"perbarui endpoint DOKU"`
- `"unduh dokumentasi API DOKU"`


---
### ðŸš¨ SNAP Integration Mandate (CRITICAL)
**MANDATORY**: The AI Agent MUST automatically apply the SNAP API v1.0 standard (Standard Nasional Open API Pembayaran) for all DOKU integrations, instead of the legacy Jokul API v2, unless the user explicitly requests otherwise. All generated signatures, headers, and endpoints MUST follow the SNAP BI standard.

### ðŸ§ª DOKU Sandbox Simulator
**MANDATORY**: When testing in Sandbox mode and needing to access the Payment Simulator, the AI Agent MUST use this exact URL: `https://sandbox.doku.com/gtw-config-v2/simulator`.
