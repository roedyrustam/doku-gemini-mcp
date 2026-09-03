# DOKU Checkout - Comprehensive Integration Guide

Based on the official [DOKU Developers Documentation (developers.doku.com/accept-payments/doku-checkout)](https://developers.doku.com/accept-payments/doku-checkout).

---

## 1. Overview

**DOKU Checkout** is an all-in-one payment gateway solution that presents a hosted or modal pop-up payment page directly within your web application. With a single integration, merchants can accept payments across all major Indonesian payment channels:
- **Virtual Accounts (VA)**: BCA, Mandiri, BRI, BNI, Permata, CIMB Niaga, Danamon, BTN, BNC, BSS, BJB, Sinarmas, DOKU VA.
- **Credit Card & Wallets**: Visa, Mastercard, JCB, Google Pay.
- **QRIS**: Compatible with all Indonesian mobile banking and e-wallet apps.
- **E-Wallets**: OVO, ShopeePay, DANA, LinkAja, DOKU Wallet.
- **PayLater**: Kredivo, Akulaku, Indodana.
- **Direct Debit**: BRI Direct Debit.
- **Convenience Store (O2O)**: Alfamart Group, Indomaret.
- **Digital Banking**: Jenius Pay.
- **Government Cards**: Kartu Kredit Indonesia (KKI).

---

## 2. API Endpoints & Request Headers

### Endpoints
| Environment | Method | Endpoint URL | Purpose |
|---|---|---|---|
| **Sandbox** | POST | `https://api-sandbox.doku.com/checkout/v1/payment` | Generate checkout `payment.url` |
| **Production** | POST | `https://api.doku.com/checkout/v1/payment` | Generate checkout `payment.url` |
| **Sandbox** | POST | `https://api-sandbox.doku.com/checkout/v3/cancellations` | Cancel unpaid checkout order |
| **Production** | POST | `https://api.doku.com/checkout/v3/cancellations` | Cancel unpaid checkout order |

### Mandatory Headers (Jokul v2 Standard)
```http
Client-Id: <MERCHANT_CLIENT_ID>
Request-Id: <UNIQUE_UUID_V4>
Request-Timestamp: <ISO8601_UTC_NO_MS>
Signature: HMACSHA256=<BASE64_HMAC_SHA256>
```

#### Signature Construction:
1. **Digest**: `Base64(SHA256(RawBodyJSON))`
2. **Component String**:
   ```text
   Client-Id:<CLIENT_ID>\nRequest-Id:<REQUEST_ID>\nRequest-Timestamp:<TIMESTAMP>\nRequest-Target:<TARGET_PATH>\nDigest:<DIGEST_STRING>
   ```
3. **Signature**: `HMACSHA256=` + `Base64(HMAC_SHA256(SecretKey, ComponentString))`

---

## 3. Backend Integration (`POST /checkout/v1/payment`)

### Basic Request
```json
{
  "order": {
    "amount": 50000,
    "invoice_number": "INV-20260904-001"
  },
  "payment": {
    "payment_due_date": 60
  }
}
```

### Full Request with Multi-Callbacks & Line Items
```json
{
  "order": {
    "amount": 100000,
    "invoice_number": "INV-20260904-002",
    "currency": "IDR",
    "callback_url": "https://merchant.com/cart",
    "callback_url_result": "https://merchant.com/orders/success",
    "callback_url_cancel": "https://merchant.com/orders/cancelled",
    "language": "EN",
    "auto_redirect": true,
    "disable_retry_payment": true,
    "recover_abandoned_cart": true,
    "expired_recovered_cart": 1440,
    "line_items": [
      {
        "id": "SKU-01",
        "name": "Mechanical Keyboard",
        "quantity": 1,
        "price": 100000,
        "sku": "MK-BLUE",
        "category": "electronics-and-telecom",
        "url": "https://merchant.com/products/keyboard",
        "image_url": "https://merchant.com/images/keyboard.png",
        "type": "Physical"
      }
    ]
  },
  "payment": {
    "payment_due_date": 60,
    "type": "SALE",
    "payment_method_types": [
      "VIRTUAL_ACCOUNT_BCA",
      "VIRTUAL_ACCOUNT_BANK_MANDIRI",
      "QRIS",
      "CREDIT_CARD",
      "GOOGLE_PAY",
      "EMONEY_SHOPEE_PAY",
      "EMONEY_OVO"
    ]
  },
  "customer": {
    "id": "USER-12345",
    "name": "Aditya",
    "last_name": "Pratama",
    "phone": "6281122334455",
    "email": "aditya@example.com",
    "address": "Jl. Gatot Subroto No. 45",
    "city": "Jakarta Selatan",
    "state": "DKI Jakarta",
    "postcode": "12950",
    "country": "ID"
  },
  "shipping_address": {
    "first_name": "Aditya",
    "last_name": "Pratama",
    "address": "Jl. Gatot Subroto No. 45",
    "city": "Jakarta Selatan",
    "postal_code": "12950",
    "phone": "6281122334455",
    "country_code": "IDN"
  },
  "billing_address": {
    "first_name": "Aditya",
    "last_name": "Pratama",
    "address": "Jl. Gatot Subroto No. 45",
    "city": "Jakarta Selatan",
    "postal_code": "12950",
    "phone": "6281122334455",
    "country_code": "IDN"
  },
  "additional_info": {
    "allow_tenor": [0, 3, 6, 12],
    "override_notification_url": "https://merchant.com/api/webhooks/doku"
  }
}
```

### Key Parameter Rules:
1. **`order.amount`**: Integer without decimals. Line item prices `(price * quantity)` must match `order.amount`.
2. **`order.invoice_number`**: Max 64 characters (max **30** characters if Credit Card is active). No symbols allowed if KKI is used.
3. **`order.callback_url`**: Controls the "Back to Merchant" button. Mandatory for Jenius Pay.
4. **`order.callback_url_result`**: Overrides "Back to Merchant" destination specifically on the payment result page.
5. **`order.auto_redirect`**: When `true`, automatically redirects customer to the callback URL after payment completion.
6. **`payment.payment_method_types`**: Array of channel constant strings to display only specific channels and set their priority.

---

## 4. Frontend Integration Modes

### Mode A: Full-Page Redirect
Redirect the user directly to `response.payment.url`:
```javascript
window.location.href = checkoutResponse.response.payment.url;
```

### Mode B: Pop-up / Modal Mode (Recommended)
Embed the DOKU Checkout JS script and call `loadJokulCheckout()`:

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <!-- Mandatory for correct mobile rendering -->
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Store Checkout</title>
  <!-- Sandbox JS (Replace with https://jokul.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js for Production) -->
  <script src="https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js"></script>
</head>
<body>
  <button id="checkout-btn">Proceed to Payment</button>

  <script>
    document.getElementById('checkout-btn').addEventListener('click', async () => {
      const response = await fetch('/api/pay', { method: 'POST' });
      const { paymentUrl } = await response.json();
      if (paymentUrl) {
        loadJokulCheckout(paymentUrl);
      }
    });
  </script>
</body>
</html>
```

---

## 5. Cancel Order API (`POST /checkout/v3/cancellations`)

Merchants can proactively void an unpaid checkout session before it expires:
- **Supported Channels**: Virtual Account (except BTN, BNC, BPD, OCBC) and QRIS.
- **Activation**: Enable *Order Cancellation* in DOKU Back Office (*Settings > Checkout Appearance > System Settings > Order Settings*).
- **Restrictions**: Paid or already expired orders cannot be cancelled.

### Cancel Request Body
```json
{
  "order": {
    "invoice_number": "INV-20260904-002"
  },
  "payment": {
    "original_request_id": "fdb69f47-96da-499d-acec-7cdc318ab2fe"
  },
  "note": "Customer cancelled before payment"
}
```

---

## 6. Order Status Lifecycle

When querying `/orders/v1/status/:invoice_number`:
- **`order.status`**:
  - `ORDER_GENERATED`: Checkout session created and available. Returned immediately even before customer chooses a channel.
  - `ORDER_EXPIRED`: Order payment window lapsed without payment.
  - `ORDER_RECOVERED`: Customer resumed payment via abandoned cart recovery link.
- **`transaction.status`**:
  - `PENDING`: Payment channel created billing code / VA / QRIS.
  - `SUCCESS`: Customer completed payment.
  - `FAILED`: Transaction rejected or failed authentication.

---

## 7. Recover Abandoned Cart

1. **Dashboard Setup**:
   - Turn on *Expired Order* email notification (*Settings > Checkout Page Notification*).
   - Turn on *Activate Recover Abandoned Cart* (*Settings > Checkout Appearance > Expired Settings*) and set recovery duration.
2. **API Override**:
   - Pass `order.recover_abandoned_cart = true`.
   - Pass `order.expired_recovered_cart = <minutes>` (e.g. `1440` for 24 hours, max `44640` / 31 days).
3. **Customer Flow**: Customer receives an email with a direct link to resume payment on the original order up to 3 times without generating a new invoice.
