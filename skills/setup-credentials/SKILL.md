---
name: setup-credentials
description: "Safely collect, configure, and store DOKU CLIENT_ID, SECRET_KEY, and environment mode in environment files / Konfigurasi dan simpan kredensial DOKU CLIENT_ID, SECRET_KEY, dan mode lingkungan secara aman."
author: "Roedy Rustam"
---

# Setup Credentials / Pengaturan Kredensial DOKU

[English](#english) | [Bahasa Indonesia](#bahasa-indonesia)

---

<a name="english"></a>
## English

### Description
Guides the developer in configuring DOKU Payment Gateway credentials for Sandbox or Production. Ensures `DOKU_CLIENT_ID` and `DOKU_SECRET_KEY` are safely injected via environment variables and never committed to source control.

### Trigger Conditions
Activate this skill when the user says:
- `"set up DOKU credentials"`
- `"configure DOKU keys"`
- `"add DOKU API keys"`

---

### Step-by-Step Execution Protocol

1. **Prompt for Required Credentials**:
   - `DOKU_CLIENT_ID` (Merchant Client ID from DOKU Back Office Sandbox: `https://sandbox.doku.com/bo/login` or Production: `https://dashboard.doku.com`).
   - `DOKU_SECRET_KEY` (Merchant Secret Key).
   - `DOKU_IS_PRODUCTION` (`false` for Sandbox `https://api-sandbox.doku.com`, `true` for Production `https://api.doku.com`).

2. **Update Environment Files (`.env` & `.env.example`)**:
   - Append to `.env`:
     ```env
     DOKU_CLIENT_ID=YOUR_CLIENT_ID
     DOKU_SECRET_KEY=YOUR_SECRET_KEY
     DOKU_IS_PRODUCTION=false
     ```
   - Update `.env.example` with sanitized placeholders.

3. **Verify `.gitignore`**:
   - Ensure `.env` is listed in `.gitignore` to prevent secret key leaks into git repositories.

---

<a name="bahasa-indonesia"></a>
## Bahasa Indonesia

### Deskripsi
Membimbing pengembang dalam mengonfigurasi kredensial DOKU Payment Gateway untuk Sandbox atau Production. Memastikan `DOKU_CLIENT_ID` dan `DOKU_SECRET_KEY` diinjeksikan secara aman via variabel lingkungan dan tidak pernah ter-commit ke repositori git.

### Kondisi Pemicu
Aktifkan skill ini ketika pengguna mengatakan:
- `"set up DOKU credentials"`
- `"konfigurasi kunci DOKU"`
- `"tambahkan API key DOKU"`

