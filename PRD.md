# Product Requirements Document (PRD)

**Project**: DOKU Gemini MCP (`doku-gemini-mcp`)  
**Version**: 1.2.0  
**Status**: Approved  
**Author**: Roedy Rustam  
**Created**: 2026-11-05  
**Last Updated**: 2026-11-05  

---

## 1. Executive Summary
`doku-gemini-mcp` adalah plugin AI terintegrasi dan server Model Context Protocol (MCP v1.x) resmi untuk Antigravity IDE, Gemini CLI, Claude Desktop, dan Cursor. Proyek ini memfasilitasi transaksi pembayaran otonom (*AI Agentic Commerce*) serta menyediakan 12 agentic skills untuk mempercepat pembuatan, pengujian, audit keamanan, dan pemeliharaan integrasi DOKU Payment Gateway (Jokul API v2 & SNAP BI v1.0).

---

## 2. Problem Statement
- **Problem**: Pengembang dan AI coding assistant kesulitan mengimplementasikan integrasi DOKU Payment Gateway yang aman dan benar secara manual karena aturan kriptografis yang sangat ketat (Base64 SHA-256 Digest, HMAC-SHA256 tanpa *trailing newline*, timestamp UTC ISO8601 tanpa milidetik, SNAP HMAC-SHA512, dan verifikasi webhook anti-timing-attack).
- **Target Users**: AI Agents (Antigravity, Gemini, Claude, Cursor), Fullstack Developers, FinTech Engineers, E-Commerce Integrators.
- **Current Pain Points**:
  - Repositori sebelumnya mengarahkan konfigurasi MCP ke `./dist/index.js`, namun berkas dan kode sumber MCP belum diimplementasikan ("Ghost MCP Server").
  - Tingginya kegagalan signature (HTTP 401) akibat kesalahan sepele seperti karakter spasi atau newline ekstra.
  - Celah keamanan pada webhook listener jika tidak menggunakan `crypto.timingSafeEqual` dan pengecekan idempoten atomik.

---

## 3. Goals & Success Metrics
| Goal | Metric | Target |
|---|---|---|
| **Eksekusi MCP Fungsional** | Berhasil dipanggil oleh Claude/AGY/Cursor via Stdio JSON-RPC | 100% Tools pass schema validation |
| **Akurasi Signature Kriptografis** | Lolos verifikasi Sandbox DOKU tanpa HTTP 401 | 100% Success rate pada mock test |
| **Kecepatan Build & Bundle** | Waktu kompilasi TypeScript dengan `tsup` | < 1.0 detik |
| **Ukuran Bundle Executable** | Ukuran file `dist/index.js` mandiri | < 1.5 MB |
| **Cakupan Pengujian Unit** | Unit test coverage (Vitest) pada rumus signature & webhook | >= 95% line coverage |

---

## 4. User Personas
### Persona 1: AI Coding Assistant (Antigravity / Claude / Cursor)
- **Role**: Autonomous Agentic Commerce Operator.
- **Goals**: Memanggil tools MCP untuk membuat link checkout, cek status pembayaran, dan generate Virtual Account secara instan dalam percakapan.
- **Frustrations**: Mendapat error stack trace raw atau schema JSON yang tidak terstruktur ketika API gagal.

### Persona 2: Backend / FinTech Developer
- **Role**: Software Engineer yang mengintegrasikan payment gateway ke aplikasi web/mobile.
- **Goals**: Menggunakan 12 skills untuk men-scaffold kode DokuService dan webhook handler dalam hitungan detik.
- **Frustrations**: Membaca dokumentasi PDF panjang dan debugging kalkulasi HMAC manual.

---

## 5. Feature Requirements

### MVP Features (Must Have â€” v1.2.0)
- [x] **TypeScript MCP Server Core (`src/index.ts`)**: Server Model Context Protocol berbasis `@modelcontextprotocol/sdk` v1.x menggunakan `StdioServerTransport`.
- [x] **9 Core MCP Payment Tools (Jokul v2 & BI-SNAP)**:
  1. `create_checkout_payment`: Generate link DOKU Checkout (`POST /checkout/v1/payment`).
  2. `cancel_checkout_order`: Batalkan order checkout belum bayar (`POST /checkout/v3/cancellations`).
  3. `create_virtual_account`: Terbitkan nomor VA langsung BCA, Mandiri, BRI, BNI, Permata, Danamon, CIMB (`POST /doku-virtual-account/v2/payment-code`).
  4. `create_qris_payment`: Generate dynamic QRIS code & QR image (`POST /qris/v1/payment-code`).
  5. `create_ewallet_payment`: Inisiasi charge OVO, ShopeePay, DANA, LinkAja (`POST /e-wallet/v1/payment`).
  6. `check_transaction_status`: Cek real-time status pembayaran (`GET /orders/v1/status/:invoice_number`).
  7. `process_refund`: Inisiasi refund online (`POST /orders/v1/refund`).
  8. `get_snap_b2b_token`: Dapatkan B2B OAuth token via Asymmetric RSA-SHA256 (`POST /authorization/v1/access-token/b2b`).
  9. `create_snap_qris_payment`: Generate dynamic QRIS resmi standar Bank Indonesia SNAP (`POST /snap-adapter/b2b/v1.0/qr/qr-mpm-generate`).
- [x] **Cryptographic Engine (`src/core/signer.ts`)**:
  - SHA-256 Digest Base64 calculation.
  - Jokul v2 HMAC-SHA256 signature generator (tanpa trailing `\n`, timestamp ISO8601 tanpa ms).
  - SNAP BI Asymmetric Signature generator (SHA256withRSA) untuk endpoint OAuth token.
  - SNAP BI Symmetric HMAC-SHA512 generator (auto-strip `Bearer ` prefix).
  - Safe webhook verifier dengan `crypto.timingSafeEqual` untuk Jokul dan SNAP.
- [x] **Universal Build Pipeline**: `tsup` single-bundle CJS/ESM ke `dist/index.js` dengan shebang `#!/usr/bin/env node`.
- [x] **Executable Automation Scripts (`scripts/`)**:
  - `scripts/audit-doku.mjs`: Scanner keamanan statis.
  - `scripts/export-postman.mjs`: Generator Postman v2.1 dengan pre-request scripts CryptoJS.
  - `scripts/test-sandbox.mjs`: CLI runner pengujian ke DOKU Sandbox.
- [x] **Legal & Privacy Trio (Mandatory Standard)**:
  - Dokumentasi isolasi data dan kepatuhan UU PDP No. 27/2022 (sanitisasi PII customer di log).
  - Panduan penanganan retensi dan penghapusan data transaksi.

### Phase 2 Features (Should Have â€” v1.3.0)
- [ ] Dukungan SNAP BI Asymmetric RSA-SHA256 untuk B2B Access Token (`POST /v1.0/access-token/b2b`).
- [ ] Interactive Sandbox Simulator Webhook Tunnel via ngrok/localtunnel integration.

---

## 6. Technical Architecture

### Stack Decision
| Layer | Technology | Rationale |
|---|---|---|
| **Runtime** | Node.js 20+ (LTS) | Kompatibilitas universal di Windows, macOS, dan Linux. |
| **Language** | TypeScript 5.8+ | Strict type safety untuk validasi skema JSON Schema MCP. |
| **MCP Protocol** | `@modelcontextprotocol/sdk` v1.x | Standar industri Model Context Protocol resmi. |
| **Bundler** | `tsup` | Bundle super cepat, single-file distribution ke `dist/index.js`. |
| **Testing** | `vitest` | Runner tes unit instan dengan mock network & crypto assertion. |
| **HTTP Client** | `axios` / native `fetch` | Ringan, handal, dan mendukung interceptor timeout & header. |

---

## 7. Data Model & Tool Contracts (High-Level)

```
[MCP Client: Claude / AGY] 
       â”‚ (JSON-RPC 2.0 over Stdio)
       â–¼
[DOKU MCP Server (src/index.ts)]
       â”‚
       â”œâ”€â–º Tools Handler (create_checkout, create_va, create_qris, ...)
       â”‚        â”‚
       â”‚        â–¼
       â”œâ”€â–º Cryptographic Signer (src/core/signer.ts)
       â”‚        â”‚ (Digest SHA256 + Component String + HMAC-SHA256 / SHA512)
       â”‚        â–¼
       â””â”€â–º DOKU HTTP Client (src/core/client.ts)
                â”‚ (HTTPS POST/GET with Client-Id, Request-Id, Timestamp, Signature)
                â–¼
      [DOKU Gateway: Sandbox / Production]
```

---

## 8. Non-Functional Requirements (NFRs)
- **Security**:
  - Kredensial `DOKU_CLIENT_ID` dan `DOKU_SECRET_KEY` hanya dibaca dari `process.env`.
  - Default environment adalah Sandbox (`DOKU_IS_PRODUCTION=false`).
  - Webhook verifier menggunakan `crypto.timingSafeEqual` untuk mencegah serangan side-channel.
- **Performance**:
  - Response latency MCP tool lokal < 5ms (di luar waktu network request ke DOKU).
  - Waktu start server < 100ms.
- **Reliability & Error Handling**:
  - Semua error HTTP (400, 401, 404, 500) ditangkap secara graceful dan dikembalikan sebagai JSON terstruktur tanpa merusak proses Node.js.

---

## 9. Testing & Quality Gates
- `pnpm test` (Vitest):
  - `signature.test.ts`: Uji ketepatan rumus string assembly Jokul v2 dan SNAP BI.
  - `webhook.test.ts`: Uji timingSafeEqual dengan valid signature, invalid signature, dan payload tampering.
  - `tools.test.ts`: Uji validasi skema parameter input dan graceful error handling.

---

## 10. Deployment & Packaging
- Single executable entry point: `dist/index.js`.
- Manifest integrasi:
  - Antigravity & Gemini CLI: `plugin.json` & `gemini-extension.json`.
  - Claude Desktop & Cursor: `mcp_config.json`.

