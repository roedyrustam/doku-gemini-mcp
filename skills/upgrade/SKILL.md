---
name: upgrade
description: "Diff existing DOKU client implementation against latest API spec version, patching only changed files and signature formats / Bandingkan dan perbarui implementasi DOKU ke versi spesifikasi API terbaru."
author: "Roedy Rustam"
---

# Upgrade / Pembaruan Klien DOKU

[English](#english) | [Bahasa Indonesia](#bahasa-indonesia)

---

<a name="english"></a>
## English

### Description
Analyzes existing project codebase for DOKU integration files, compares endpoint paths and signature generation code against the latest DOKU Jokul API v2 and SNAP API v1.0 specs, and applies minimal non-breaking code patches.

### Trigger Conditions
Activate this skill when the user says:
- `"upgrade DOKU client"`
- `"update DOKU API version"`
- `"patch DOKU integration"`

---

### Step-by-Step Execution Protocol

1. **Locate Existing DOKU Integration Files**:
   - Search workspace for `DokuService`, `dokuClient`, `/checkout/v1/payment`, `/doku-virtual-account/v2`, `/snap-adapter`.

2. **Diff Against `.doku-spec.json` / Standard Rules**:
   - Check endpoint path versions (`v1` vs `v2` vs `snap-adapter`).
   - Check signature assembly for missing header fields or trailing newlines.
   - Check webhook verification formula (`crypto.timingSafeEqual` usage).

3. **Apply Targeted Code Patches**:
   - Modify only changed functions or endpoints without breaking existing method signatures.

---

<a name="bahasa-indonesia"></a>
## Bahasa Indonesia

### Deskripsi
Menganalisis berkas integrasi DOKU pada codebase proyek, membandingkan path endpoint dan kode pembuatan signature terhadap spesifikasi DOKU API terbaru, dan menerapkan patch kode minimal tanpa merusak fungsi yang sudah ada.

### Kondisi Pemicu
Aktifkan skill ini ketika pengguna mengatakan:
- `"upgrade DOKU client"`
- `"perbarui versi DOKU API"`
- `"patch integrasi DOKU"`


---
### 🚨 SNAP Integration Mandate (CRITICAL)
**MANDATORY**: The AI Agent MUST automatically apply the SNAP API v1.0 standard (Standard Nasional Open API Pembayaran) for all DOKU integrations, instead of the legacy Jokul API v2, unless the user explicitly requests otherwise. All generated signatures, headers, and endpoints MUST follow the SNAP BI standard.

### 🧪 DOKU Sandbox Simulator
**MANDATORY**: When testing in Sandbox mode and needing to access the Payment Simulator, the AI Agent MUST use this exact URL: `https://sandbox.doku.com/gtw-config-v2/simulator`.
