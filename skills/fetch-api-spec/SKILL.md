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
   - Checkout API: `/checkout/v1/payment`
   - Virtual Account API: `/doku-virtual-account/v2/payment-code`
   - QRIS API (Jokul): `/qris/v1/payment-code`
   - QRIS API (SNAP): `/snap-adapter/b2b/v1.0/qr/qr-mpm-generate`
   - E-Wallet API: `/e-wallet/v1/payment`
   - Direct Card API: `/credit-card/v1/payment`
   - Status Inquiry API: `/orders/v1/status/:invoice_number`
   - Online Refund API: `/orders/v1/refund`

2. **Validate Mandatory Headers Standard**:
   - Jokul v2: `Client-Id`, `Request-Id`, `Request-Timestamp`, `Signature`. (Note: `Request-Target` and `Digest` are used for Signature string, NOT as headers).
   - SNAP v1.0: `X-TIMESTAMP`, `X-SIGNATURE`, `X-CLIENT-KEY`, `X-PARTNER-ID`, `X-EXTERNAL-ID`, `CHANNEL-ID`.

3. **Generate Local Spec Cache (`.doku-spec.json`)**:
   ```json
   {
     "apiVersion": "v2",
     "snapVersion": "v1.0",
     "lastUpdated": "2026-08-09T00:00:00Z",
     "endpoints": {
       "checkout": "/checkout/v1/payment",
       "virtualAccount": "/doku-virtual-account/v2/payment-code",
       "qrisJokul": "/qris/v1/payment-code",
       "qrisSnap": "/snap-adapter/b2b/v1.0/qr/qr-mpm-generate",
       "status": "/orders/v1/status",
       "refund": "/orders/v1/refund"
     },
     "signatureAlgorithm": "HMACSHA256"
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

