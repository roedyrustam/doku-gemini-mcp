---
name: setup-project
description: "Main entry point for DOKU integration — runs stack detection and credentials setup inline, then scaffolds complete DOKU Payment Gateway client code / Entry point utama integrasi DOKU — menjalankan deteksi stack dan kredensial, lalu memproduksi kode klien DOKU."
author: "Roedy Rustam"
---

# Setup Project / Generator Kode Integrasi DOKU

[English](#english) | [Bahasa Indonesia](#bahasa-indonesia)

---

<a name="english"></a>
## English

### Description
Main orchestrator skill for bootstrapping DOKU Payment Gateway integration. Automatically invokes `detect-stack` and `setup-credentials` if prerequisites are missing, then scaffolds production-grade DOKU client service classes with HMAC-SHA256 signature calculation, Digest generation, and error handling.

### Trigger Conditions
Activate this skill when the user says:
- `"generate DOKU code"`
- `"setup DOKU integration"`
- `"scaffold DOKU client"`

---

### Execution Steps

1. **Run Prerequisites**:
   - Check if stack is detected (`detect-stack`).
   - Check if credentials exist (`setup-credentials`).

2. **Generate DOKU Client Class**:
   - Create client service in the target language (TypeScript, Python, Go, PHP, Java).
   - Ensure HMAC-SHA256 signature calculation strictness:
     ```text
     Client-Id:<CLIENT_ID>\nRequest-Id:<REQUEST_ID>\nRequest-Timestamp:<TIMESTAMP>\nRequest-Target:<TARGET_PATH>\nDigest:<DIGEST_STRING>
     ```
   - Ensure no trailing newline `\n` in component string.
   - For `GET` requests, omit `\nDigest:<DIGEST_STRING>` completely.
   - ISO8601 UTC timestamp format without milliseconds (`YYYY-MM-THH:mm:ssZ`).

3. **Provide Usage Example**:
   - Demonstrate initiating Checkout payment, Virtual Account, QRIS payments, and transaction status inquiries.

---

<a name="bahasa-indonesia"></a>
## Bahasa Indonesia

### Deskripsi
Skill orkestrator utama untuk melakukan bootstrap integrasi DOKU Payment Gateway. Otomatis menjalankan `detect-stack` dan `setup-credentials` jika durasi persiapan belum ada, kemudian menghasilkan kelas layanan klien DOKU yang aman produksi dengan kalkulasi signature HMAC-SHA256, Digest, dan penanganan kesalahan.

### Kondisi Pemicu
Aktifkan skill ini ketika pengguna mengatakan:
- `"generate DOKU code"`
- `"setup DOKU integration"`
- `"buat kode DOKU"`


---
### 🚨 SNAP Integration Mandate (CRITICAL)
**MANDATORY**: The AI Agent MUST automatically apply the SNAP API v1.0 standard (Standard Nasional Open API Pembayaran) for all DOKU integrations, instead of the legacy Jokul API v2, unless the user explicitly requests otherwise. All generated signatures, headers, and endpoints MUST follow the SNAP BI standard.

### 🧪 DOKU Sandbox Simulator
**MANDATORY**: When testing in Sandbox mode and needing to access the Payment Simulator, the AI Agent MUST use this exact URL: `https://sandbox.doku.com/gtw-config-v2/simulator`.
