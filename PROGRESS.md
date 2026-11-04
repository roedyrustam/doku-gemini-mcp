# Execution Progress & Task Tracking (`PROGRESS.md`)

**Project**: `doku-gemini-mcp`  
**Current Version**: 1.2.0  
**Phase**: Pre-Code Architecture Completed ➔ Phase 1 Initial Scaffolding  

---

## Roadmap & Checklist

### Phase 1: Repository Cleanup & Foundation
- [ ] Hapus file sampah `skills/grep.exe.stackdump`
- [ ] Perbarui `.gitignore` dengan aturan `*.stackdump` dan `*.core`
- [ ] Sinkronkan versi manifest menjadi `1.2.0`:
  - [ ] `gemini-extension.json` (dari 1.1.0 ke 1.2.0)
  - [ ] `README.md` (koreksi jumlah 12 specialized skills)
- [ ] Inisialisasi `package.json`, `tsconfig.json`, dan `tsup.config.ts`

### Phase 2: Core Cryptographic & HTTP Client Engine
- [ ] Buat `src/core/constants.ts` (Endpoint Jokul & SNAP, bank codes, channel enums)
- [ ] Buat `src/core/types.ts` (Interface request/response/config)
- [ ] Buat `src/core/signer.ts` (Digest Base64 SHA-256, HMAC-SHA256 Jokul v2, SNAP HMAC-SHA512, timingSafeEqual verifier)
- [ ] Buat `src/core/client.ts` (DOKU HTTP Client dengan auto-signing & error wrapper)

### Phase 3: Model Context Protocol Server & Tools
- [ ] Buat `src/tools/checkout.ts` (`create_checkout_payment`, `cancel_checkout_order`)
- [ ] Buat `src/tools/virtual-account.ts` (`create_virtual_account`)
- [ ] Buat `src/tools/qris.ts` (`create_qris_payment`)
- [ ] Buat `src/tools/ewallet.ts` (`create_ewallet_payment`)
- [ ] Buat `src/tools/status.ts` (`check_transaction_status`)
- [ ] Buat `src/tools/refund.ts` (`process_refund`)
- [ ] Buat `src/index.ts` (MCP Server via `StdioServerTransport`)

### Phase 4: Unit Test Suite & Validation
- [ ] Buat `tests/signer.test.ts` (Verifikasi matematis HMAC-SHA256 Jokul & SNAP)
- [ ] Buat `tests/webhook.test.ts` (Verifikasi timingSafeEqual & payload tampering)
- [ ] Buat `tests/tools.test.ts` (Verifikasi schema input & error handling)
- [ ] Jalankan `pnpm test` (Vitest) hingga 100% lulus

### Phase 5: Executable Automation Scripts
- [ ] Buat `scripts/audit-doku.mjs` (Pemindai keamanan kode & sanitasi keys)
- [ ] Buat `scripts/export-postman.mjs` (Generator koleksi Postman v2.1 dengan pre-request scripts)
- [ ] Buat `scripts/test-sandbox.mjs` (Runner live sandbox connectivity)
- [ ] Buat `scripts/detect-stack.mjs` (Stack scanner mandiri)

### Phase 6: Build & CI/CD Pipeline
- [ ] Jalankan kompilasi `pnpm build` (`tsup` ➔ `dist/index.js`)
- [ ] Buat `.github/workflows/ci.yml` untuk automated build & test di GitHub Actions
- [ ] Uji eksekusi langsung MCP server via node `dist/index.js`

