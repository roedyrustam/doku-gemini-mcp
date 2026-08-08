---
name: detect-stack
description: "Detect project programming language, framework, package manager, and structure for DOKU Payment Gateway integration, then save configuration / Deteksi bahasa pemrograman, framework, dan konfigurasi proyek untuk integrasi DOKU."
author: "Roedy Rustam"
---

# Detect Stack / Deteksi Stack Proyek

[English](#english) | [Bahasa Indonesia](#bahasa-indonesia)

---

<a name="english"></a>
## English

### Description
Detects the active project's tech stack (language, runtime, framework, ORM, package manager) to prepare code generation and configuration for DOKU Payment Gateway integrations. Saves the detected environment settings to `.doku-config.json`.

### Trigger Conditions
Activate this skill when the user says:
- `"detect stack"`
- `"check project framework for DOKU"`
- `"identify tech stack"`

---

### Step-by-Step Execution Protocol

1. **Scan Workspace Root Files**:
   - `package.json` -> Node.js / TypeScript (Express, Fastify, Next.js, Hono, NestJS).
   - `requirements.txt` / `pyproject.toml` / `Pipfile` -> Python (FastAPI, Django, Flask).
   - `go.mod` -> Go (Gin, Echo, Fiber, Net/HTTP).
   - `composer.json` -> PHP (Laravel, Symfony).
   - `pom.xml` / `build.gradle` -> Java (Spring Boot).

2. **Extract Environment & Configuration Details**:
   - Package manager (`npm`, `pnpm`, `yarn`, `bun`, `pip`, `uv`, `go`).
   - Active TypeScript / JS target version.
   - Presence of `.env` or `.env.example`.

3. **Generate Configuration File (`.doku-config.json`)**:
   ```json
   {
     "stack": {
       "language": "typescript",
       "framework": "express",
       "packageManager": "pnpm",
       "hasEnv": true
     },
     "doku": {
       "isProduction": false,
       "apiVersion": "v2"
     }
   }
   ```

4. **Report Findings**: Summarize detected stack and confirm configuration saved.

---

<a name="bahasa-indonesia"></a>
## Bahasa Indonesia

### Deskripsi
Mendeteksi tech stack proyek (bahasa, runtime, framework, ORM, package manager) untuk menyiapkan pembuatan kode dan konfigurasi integrasi DOKU Payment Gateway. Hasil deteksi disimpan ke `.doku-config.json`.

### Kondisi Pemicu
Aktifkan skill ini ketika pengguna mengatakan:
- `"detect stack"`
- `"periksa framework proyek untuk DOKU"`
- `"identifikasi tech stack"`
