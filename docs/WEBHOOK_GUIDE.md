# DOKU Webhook Notification & Anti-Replay Guard Guide

This guide details how to implement safe, cryptographic HTTP webhook notification listeners for DOKU Payment Gateway events.

---

## 1. Overview & Security Flowchart

When a customer completes a payment via Virtual Account, QRIS, E-Wallet, or Credit Card, DOKU's server sends an HTTP `POST` webhook notification to your configured notification URL.

> [!TIP]
> **Testing Webhooks in Sandbox**: You can simulate customer payment events and trigger live webhook notifications using the official [DOKU Integration Payment Simulator](https://sandbox.doku.com/gtw-config-v2/simulator).

```text
┌───────────────────────────┐                        HTTP POST Notification                        ┌───────────────────────────┐
│                           ├──────────────────────────────────────────────────────────────────────►│                           │
│  DOKU Notification Engine │   Headers: Client-Id, Request-Id, Request-Timestamp, Signature    │  Merchant Webhook Server  │
│                           │   Body: JSON Payload (Invoice, Amount, Status)                       │                           │
└───────────────────────────┘                                                                      └─────────────┬─────────────┘
                                                                                                                 │
                                                                                                                 ▼
                                                                                                    Verify HMAC-SHA256 Signature
                                                                                                  Using timingSafeEqual comparison
                                                                                                                 │
                                                                                    ┌────────────────────────────┴────────────────────────────┐
                                                                                    │                                                         │
                                                                         Signature Invalid                                        Signature Valid
                                                                                    │                                                         │
                                                                                    ▼                                                         ▼
                                                                           Return 401 Unauthorized                            Check Atomic Database Transaction
                                                                           Reject Request Immediately                         (Is Invoice Already Paid?)
                                                                                                                                      │
                                                                                                                   ┌──────────────────┴──────────────────┐
                                                                                                                   │                                     │
                                                                                                            Already Processed                    First Time Processing
                                                                                                                   │                                     │
                                                                                                                   ▼                                     ▼
                                                                                                           Return 200 OK                         Update Order Status &
                                                                                                           (Skip Duplicate Execution)            Fulfill Customer Order
                                                                                                                                                         │
                                                                                                                                                         ▼
                                                                                                                                                 Return 200 OK
```

---

## 2. Webhook Notification Headers & Signature Calculation

DOKU sends different headers depending on whether the notification is for the Jokul API v2 or SNAP API v1.0.

### Jokul API v2 Webhook Headers
- `Client-Id`: Merchant Client ID.
- `Request-Id`: Unique UUID string for this notification event.
- `Request-Timestamp`: UTC ISO8601 timestamp string.
- `Signature`: Notification signature string (`HMACSHA256=<base64-signature>`).

**Jokul Component String for Webhook Verification:**
```text
Client-Id:<CLIENT_ID>\nRequest-Id:<REQUEST_ID>\nRequest-Timestamp:<TIMESTAMP>\nRequest-Target:<TARGET_PATH>\nDigest:<DIGEST_STRING>
```

### SNAP API v1.0 Webhook Headers
- `X-TIMESTAMP`: UTC ISO8601 string with offset.
- `X-SIGNATURE`: Notification signature string.
- `X-CLIENT-KEY`: Merchant Client ID.
- `X-PARTNER-ID`: Merchant Client ID.
- `X-EXTERNAL-ID`: Unique trace ID per request.
- `CHANNEL-ID`: Channel identification.

**SNAP Component String for Webhook Verification (Symmetric):**
```text
HTTPMethod + ":" + EndpointUrl + ":" + AccessToken + ":" + Lowercase(HexEncode(SHA-256(MinifiedRequestBody))) + ":" + Timestamp
```

---

## 3. Node.js / Express Complete Webhook Receiver Implementation

```typescript
import express, { Request, Response } from 'express';
import crypto from 'crypto';

const app = express();

// IMPORTANT: Retain raw body bytes for accurate Digest computation
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));

const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID || '';
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY || '';

interface DokuNotificationPayload {
  order: {
    invoice_number: string;
    amount: number;
  };
  transaction: {
    status: 'SUCCESS' | 'FAILED';
    date: string;
  };
}

/**
 * Validates incoming webhook signature using timing-safe comparison
 */
function verifyDokuWebhookSignature(req: Request & { rawBody?: Buffer }): boolean {
  const clientId = req.headers['client-id'] as string;
  const requestId = req.headers['request-id'] as string;
  const timestamp = req.headers['request-timestamp'] as string;
  const incomingSignature = req.headers['signature'] as string;
  const targetPath = req.originalUrl || req.url;

  if (!clientId || !requestId || !timestamp || !incomingSignature || !req.rawBody) {
    return false;
  }

  // 1. Calculate Base64 SHA-256 Digest of raw body
  const bodyHash = crypto.createHash('sha256').update(req.rawBody).digest();
  const digestString = bodyHash.toString('base64');

  // 2. Assemble component string
  const componentStr = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${targetPath}\nDigest:${digestString}`;

  // 3. Compute HMAC-SHA256
  const hmac = crypto.createHmac('sha256', DOKU_SECRET_KEY);
  hmac.update(componentStr, 'utf8');
  const expectedSignature = `HMACSHA256=${hmac.digest('base64')}`;

  // 4. Timing-safe comparison to prevent timing side-channel attacks
  const expectedBuf = Buffer.from(expectedSignature, 'utf8');
  const incomingBuf = Buffer.from(incomingSignature, 'utf8');

  if (expectedBuf.length !== incomingBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, incomingBuf);
}

/**
 * Webhook Notification Handler Endpoint
 */
app.post('/api/doku/webhook', async (req: Request, res: Response) => {
  // Step 1: Verify Signature
  const isValid = verifyDokuWebhookSignature(req);
  if (!isValid) {
    console.warn(`[SECURITY WARNING] Unauthorized webhook attempt from IP ${req.ip}`);
    return res.status(401).json({ error: 'Unauthorized: Signature verification failed' });
  }

  const payload = req.body as DokuNotificationPayload;
  const invoiceNumber = payload.order?.invoice_number;

  if (!invoiceNumber) {
    return res.status(400).json({ error: 'Missing invoice number' });
  }

  try {
    // Step 2: Atomic Idempotency Check in Database
    // Replace with your ORM / Database transaction (Prisma, Drizzle, SQL)
    const isAlreadyPaid = await checkDatabaseInvoiceStatus(invoiceNumber);
    if (isAlreadyPaid) {
      console.log(`[WEBHOOK] Duplicate notification for invoice ${invoiceNumber}. Skipping processing.`);
      return res.status(200).json({ status: 'ACK' });
    }

    // Step 3: Update Order Status & Fulfill Order
    if (payload.transaction?.status === 'SUCCESS') {
      await updateOrderStatusAndFulfill(invoiceNumber, 'PAID', payload);
      console.log(`[WEBHOOK SUCCESS] Invoice ${invoiceNumber} marked as PAID.`);
    } else {
      await updateOrderStatusAndFulfill(invoiceNumber, 'FAILED', payload);
      console.log(`[WEBHOOK FAILED] Invoice ${invoiceNumber} marked as FAILED.`);
    }

    // Step 4: Respond HTTP 200 OK to DOKU
    return res.status(200).json({ status: 'SUCCESS' });
  } catch (error: any) {
    console.error(`[WEBHOOK ERROR] Error processing invoice ${invoiceNumber}:`, error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock database functions for demonstration
async function checkDatabaseInvoiceStatus(invoiceNumber: string): Promise<boolean> {
  // Query DB: return true if invoice is already marked PAID
  return false;
}

async function updateOrderStatusAndFulfill(invoiceNumber: string, status: string, payload: any): Promise<void> {
  // Perform atomic DB update & trigger order fulfillment logic
}
```

---

## 4. Key Security Rules

1. **Always Return HTTP 401 Unauthorized**: Never process unverified webhook payloads or return HTTP 200 for unauthenticated calls.
2. **Prevent Timing Side-Channel Attacks**: Always use `crypto.timingSafeEqual` (or language equivalent) to compare signature strings.
3. **Idempotency Guard**: Webhooks may be retried by DOKU if network hiccups occur. Always wrap status updates in an atomic database query/transaction to prevent double fulfillment.
4. **Log Sanitization**: Do NOT print customer PII or API secret keys into server application logs.
