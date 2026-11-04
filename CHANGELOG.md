# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-11-05

### Added
- **Full-Stack MCP Server Implementation**:
  - Native Model Context Protocol (v1.x) server in TypeScript using `@modelcontextprotocol/sdk` and `StdioServerTransport`.
  - Single-file compiled executable `dist/index.js` bundled via `tsup`.
  - 7 Core MCP Tools:
    - `create_checkout_payment`: Generate DOKU Checkout payment links.
    - `cancel_checkout_order`: Void unpaid checkout orders (`/checkout/v3/cancellations`).
    - `create_virtual_account`: Direct VA generation (BCA, Mandiri, BRI, BNI, Permata, Danamon, CIMB).
    - `create_qris_payment`: Dynamic QRIS code and QR string generator.
    - `create_ewallet_payment`: E-Wallet charges (OVO, ShopeePay, DANA, LinkAja).
    - `check_transaction_status`: Real-time order payment status inquiry.
    - `process_refund`: Online refund processing.
- **Cryptographic Signer Engine (`src/core/signer.ts`)**:
  - Strict ISO8601 UTC timestamp formatting without milliseconds (`.replace(/\.\d{3}Z$/, 'Z')`).
  - Base64 SHA-256 Digest generation.
  - Jokul v2 HMAC-SHA256 signature generator without trailing newlines.
  - SNAP BI v1.0 Symmetric HMAC-SHA512 signature generator.
  - Timing-attack-resistant webhook verification using `crypto.timingSafeEqual`.
- **Executable Automation Scripts (`scripts/`)**:
  - `scripts/audit-doku.mjs`: Static security and AGENTS.md invariant compliance scanner.
  - `scripts/export-postman.mjs`: Postman Collection v2.1 exporter with automated CryptoJS pre-request HMAC scripts.
  - `scripts/test-sandbox.mjs`: Live Sandbox API connectivity runner.
  - `scripts/detect-stack.mjs`: Automatic project technology stack detector.
- **Unit Testing Suite (`tests/`)**:
  - 13 comprehensive unit tests across cryptographic signatures, webhook tampering guards, and MCP tool schemas using Vitest.
- **CI/CD Pipeline**:
  - GitHub Actions workflow (`.github/workflows/ci.yml`) testing on Node.js 20.x and 22.x.
- **Formal PRD and Architecture Documentation**:
  - `PRD.md` (Product Requirements Document conforming to prd-architect standard).
  - `BLUEPRINT.md` (Design document and MADR Architectural Decision Records).

### Changed
- Aligned versioning to `1.2.0` across `package.json`, `plugin.json`, and `gemini-extension.json`.
- Updated `README.md` to accurately document all 12 specialized agentic skills.

### Fixed
- Resolved the "Ghost MCP Server" bug where `mcp_config.json` pointed to a non-existent `dist/index.js`.
- Removed inadvertent Cygwin crash dump artifact `skills/grep.exe.stackdump`.
- Updated `.gitignore` to prevent future crash dumps (`*.stackdump`, `*.core`) and ephemeral test output.

