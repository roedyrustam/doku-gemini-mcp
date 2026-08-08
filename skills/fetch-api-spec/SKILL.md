---
name: fetch-api-spec
description: "Fetch, extract, and structure official DOKU Payment Gateway API specs from developers.doku.com and persist locally / Mengambil dan menyusun spesifikasi API resmi DOKU dari developers.doku.com dan menyimpannya secara lokal."
author: "Roedy Rustam"
---

# Fetch DOKU API Spec / Ambill Spesifikasi API DOKU

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
   - QRIS API: `/qris/v1/payment-code`
   - E-Wallet API: `/e-wallet/v1/payment`
   - Direct Card API: `/credit-card/v1/payment`
   - Status Inquiry API: `/orders/v1/status/:invoice_number`

2. **Validate Mandatory Headers Standard**:
   - `Client-Id`, `Request-Id`, `Request-Timestamp`, `Request-Target`, `Digest`, `Signature`.

3. **Generate Local Spec Cache (`.doku-spec.json`)**:
   ```json
   {
     "apiVersion": "v2",
     "lastUpdated": "2026-08-09T00:00:00Z",
     "endpoints": {
       "checkout": "/checkout/v1/payment",
       "virtualAccount": "/doku-virtual-account/v2/payment-code",
       "qris": "/qris/v1/payment-code",
       "status": "/orders/v1/status"
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
