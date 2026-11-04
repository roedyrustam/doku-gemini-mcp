# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-11-05

### Added
- **Full-Stack Dual-Engine MCP Server Implementation (developers.doku.com standards)**:
  - Native Model Context Protocol (v1.x) server in TypeScript using `@modelcontextprotocol/sdk` and `StdioServerTransport`.
  - Single-file compiled executable `dist/index.js` (30.07 KB) and type declarations `dist/index.d.ts` bundled via `tsup`.
  - **9 Production MCP Tools**:
    - `create_checkout_payment`: Generate DOKU Checkout payment links (`/checkout/v1/payment`).
    - `cancel_checkout_order`: Void unpaid checkout orders (`/checkout/v3/cancellations`).
    - `create_virtual_account`: Direct VA generation (BCA, Mandiri, BRI, BNI, Permata, Danamon, CIMB).
    - `create_qris_payment`: Dynamic QRIS code and QR string generator (Jokul v2).
    - `create_ewallet_payment`: E-Wallet charges (OVO, ShopeePay, DANA, LinkAja).
    - `check_transaction_status`: Real-time order payment status inquiry (`/orders/v1/status/:invoice_number`).
    - `process_refund`: Online refund processing (`/orders/v1/refund`).
    - `get_snap_b2b_token`: Obtain SNAP BI OAuth 2.0 B2B token with Asymmetric RSA-2048 SHA256withRSA signature (`/authorization/v1/access-token/b2b`).
    - `create_snap_qris_payment`: Generate dynamic QRIS conforming to Bank Indonesia SNAP standard (`/snap-adapter/b2b/v1.0/qr/qr-mpm-generate`) with Symmetric HMAC-SHA512.
- **Cryptographic Signer Engine (`src/core/signer.ts`)**:
  - Strict ISO8601 UTC timestamp formatting without milliseconds (`.replace(/\.\d{3}Z$/, 'Z')`).
  - Base64 SHA-256 Digest generation.
  - Jokul v2 HMAC-SHA256 signature generator without trailing newlines.
  - SNAP BI Asymmetric Signature (SHA256withRSA) for Get Token B2B API (`X-CLIENT-KEY + "|" + X-TIMESTAMP`).
  - SNAP BI Symmetric HMAC-SHA512 generator (auto-stripping `Bearer ` prefix from Access Token).
  - Timing-attack-resistant webhook verification using `crypto.timingSafeEqual` for both Jokul and SNAP.
- **Executable Automation Scripts (`scripts/`)**:
  - `scripts/audit-doku.mjs`: Static security and AGENTS.md invariant compliance scanner (`pnpm run audit`).
  - `scripts/export-postman.mjs`: Postman Collection v2.1 exporter with automated CryptoJS pre-request HMAC scripts for Jokul and SNAP endpoints (`pnpm run export-postman`).
  - `scripts/test-sandbox.mjs`: Live Sandbox API connectivity runner (`pnpm run test-sandbox`).
  - `scripts/detect-stack.mjs`: Automatic project technology stack detector (`node scripts/detect-stack.mjs`).
- **Unit Testing Suite (`tests/`)**:
  - 15 comprehensive unit tests across cryptographic signatures (Jokul HMAC, SNAP HMAC, SNAP RSA), webhook tampering guards, and MCP tool schemas using Vitest (`pnpm test`).
- **CI/CD Pipeline**:
  - GitHub Actions workflow (`.github/workflows/ci.yml`) testing on Node.js 20.x and 22.x.
- **Formal PRD and Architecture Documentation**:
  - `PRD.md` (Product Requirements Document conforming to prd-architect standard).
  - `BLUEPRINT.md` (Design document and MADR Architectural Decision Records).

### Changed
- Bumped version to `1.3.0` across `package.json`, `plugin.json`, `gemini-extension.json`, and MCP server runtime.
- Updated `README.md` with complete documentation for all 9 MCP tools, dual-engine specifications, and executable automation scripts.
- Enhanced `docs/HMAC_SIGNATURE_GUIDE.md`, `docs/MCP_SERVER_GUIDE.md`, and `skills/fetch-api-spec/SKILL.md` to reflect latest official specifications from `https://developers.doku.com/`.

### Fixed
- Resolved the "Ghost MCP Server" bug where `mcp_config.json` pointed to a non-existent `dist/index.js`.
- Removed inadvertent Cygwin crash dump artifact `skills/grep.exe.stackdump`.
- Updated `.gitignore` to prevent future crash dumps (`*.stackdump`, `*.core`) and ephemeral test output.

## [1.2.0] - 2026-09-04
- Initial formal release with DOKU Checkout, Cancel Order API, and 12 agentic skill definitions.
