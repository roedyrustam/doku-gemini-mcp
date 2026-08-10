---
name: generate-postman
description: "Export a ready-to-use Postman Collection v2.1 with pre-request JavaScript scripts for automatic DOKU HMAC-SHA256 signature generation / Ekspor koleksi Postman v2.1 lengkap dengan script pre-request untuk pembuatan signature DOKU HMAC-SHA256."
author: "Roedy Rustam"
---

# Generate Postman Collection / Ekspor Koleksi Postman DOKU

[English](#english) | [Bahasa Indonesia](#bahasa-indonesia)

---

<a name="english"></a>
## English

### Description
Generates a Postman Collection (`doku-api-collection.json`) containing API requests for DOKU Checkout, Virtual Accounts, QRIS, and Status Inquiry. Includes a Postman Pre-request Script written in JavaScript that dynamically computes SHA-256 Digest and HMAC-SHA256 `Signature` header before sending each request.

### Trigger Conditions
Activate this skill when the user says:
- `"generate Postman collection"`
- `"export DOKU Postman"`
- `"create Postman collection for DOKU"`

---

### Pre-request Script Logic Included in Collection

```javascript
const clientId = pm.environment.get("DOKU_CLIENT_ID");
const secretKey = pm.environment.get("DOKU_SECRET_KEY");
const requestId = CryptoJS.lib.WordArray.random(16).toString();
const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const targetPath = pm.request.url.getPath();

let digest = "";
if (pm.request.body && pm.request.body.raw && ["POST", "PUT", "PATCH"].includes(pm.request.method)) {
    const rawBody = pm.request.body.raw;
    const hash = CryptoJS.SHA256(rawBody);
    digest = CryptoJS.enc.Base64.stringify(hash);
}

let component = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${targetPath}`;
if (digest) {
    component += `\nDigest:${digest}`;
}

const hmac = CryptoJS.HmacSHA256(component, secretKey);
const signature = "HMACSHA256=" + CryptoJS.enc.Base64.stringify(hmac);

pm.request.headers.add({ key: "Client-Id", value: clientId });
pm.request.headers.add({ key: "Request-Id", value: requestId });
pm.request.headers.add({ key: "Request-Timestamp", value: timestamp });
pm.request.headers.add({ key: "Request-Target", value: targetPath });
if (digest) pm.request.headers.add({ key: "Digest", value: digest });
pm.request.headers.add({ key: "Signature", value: signature });
```

---

<a name="bahasa-indonesia"></a>
## Bahasa Indonesia

### Deskripsi
Menghasilkan Koleksi Postman (`doku-api-collection.json`) berisi permintaan API untuk DOKU Checkout, Virtual Account, QRIS, dan Status Inquiry. Dilengkapi dengan Pre-request Script JavaScript di Postman yang menghitung Digest SHA-256 dan `Signature` header HMAC-SHA256 secara dinamis sebelum setiap request dikirim.

### Kondisi Pemicu
Aktifkan skill ini ketika pengguna mengatakan:
- `"generate Postman collection"`
- `"ekspor Postman DOKU"`
- `"buat koleksi Postman untuk DOKU"`

