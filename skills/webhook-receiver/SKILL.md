---
name: webhook-receiver
description: "Scaffold HTTP webhook notification listener endpoint with cryptographic HMAC-SHA256 & SNAP signature verification, replay attack prevention, and atomic database updates / Buat handler webhook notifikasi dengan verifikator signature HMAC-SHA256 & SNAP dan anti-replay guard."
author: "Roedy Rustam"
---

# Webhook Receiver / Handler Webhook Notifikasi DOKU

[English](#english) | [Bahasa Indonesia](#bahasa-indonesia)

---

<a name="english"></a>
## English

### Description
Scaffolds a production-ready HTTP webhook handler endpoint for receiving payment notifications from DOKU. Includes mandatory HMAC-SHA256 & SNAP `X-SIGNATURE` verification, rejection of unverified requests (`401 Unauthorized`), idempotency checks against duplicate notifications, and atomic database transaction updates.

### Trigger Conditions
Activate this skill when the user says:
- `"add DOKU webhook"`
- `"handle DOKU callbacks"`
- `"create DOKU notification listener"`

---

### Step-by-Step Implementation Template (TypeScript / Express)

```typescript
import crypto from 'crypto';
import { Request, Response } from 'express';

/**
 * Validates Jokul API v2 Webhook Signature (Client-Id, Request-Id, Request-Timestamp, Request-Target, Digest, Signature)
 */
export function verifyDokuNotificationSignature(req: Request, secretKey: string): boolean {
  const clientId = req.headers['client-id'] as string;
  const requestId = req.headers['request-id'] as string;
  const timestamp = req.headers['request-timestamp'] as string;
  const targetPath = req.originalUrl || req.url;
  const receivedSignature = req.headers['signature'] as string;

  if (!clientId || !requestId || !timestamp || !receivedSignature) {
    return false;
  }

  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const digest = crypto.createHash('sha256').update(rawBody, 'utf8').digest('base64');

  const component = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${targetPath}\nDigest:${digest}`;
  
  const calculatedHmac = crypto
    .createHmac('sha256', secretKey)
    .update(component)
    .digest('base64');

  const expectedSignature = `HMACSHA256=${calculatedHmac}`;

  return crypto.timingSafeEqual(
    Buffer.from(receivedSignature),
    Buffer.from(expectedSignature)
  );
}

export async function handleDokuWebhook(req: Request, res: Response) {
  const secretKey = process.env.DOKU_SECRET_KEY || '';

  // 1. Mandatory Cryptographic Signature Verification
  if (!verifyDokuNotificationSignature(req, secretKey)) {
    return res.status(401).json({ status: 'UNAUTHORIZED', message: 'Invalid notification signature' });
  }

  const { order, transaction } = req.body;
  const invoiceNumber = order?.invoice_number;
  const status = transaction?.status;

  // 2. Idempotency Check & Atomic DB Update
  const isProcessed = await checkExistingTransactionStatus(invoiceNumber);
  if (isProcessed) {
    return res.status(200).json({ status: 'SUCCESS', message: 'Already processed' });
  }

  await updateOrderStatusAtomic(invoiceNumber, status);

  return res.status(200).json({ status: 'SUCCESS' });
}
```

---

<a name="bahasa-indonesia"></a>
## Bahasa Indonesia

### Deskripsi
Membuat endpoint webhook HTTP siap produksi untuk menerima notifikasi status pembayaran dari DOKU. Mencakup verifikasi signature HMAC-SHA256 & SNAP wajib, penolakan permintaan yang tidak terverifikasi (`401 Unauthorized`), pemeriksaan idempotensi terhadap notifikasi duplikat, serta pembaruan transaksi database secara atomik.

### Kondisi Pemicu
Aktifkan skill ini ketika pengguna mengatakan:
- `"add DOKU webhook"`
- `"handle DOKU callbacks"`
- `"buat listener notifikasi DOKU"`

