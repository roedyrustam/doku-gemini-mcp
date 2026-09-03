# DOKU Checkout - Frontend Integration Guide

This guide explains how to present the DOKU Checkout payment page seamlessly within your web application frontend. Once you have generated the `payment.url` from your backend via `POST /checkout/v1/payment`, you can display it using two primary methods.

---

## Integration Methods

There are two approaches for integrating the DOKU Checkout page into your web/app interface:
1. **Pop-up Mode (Modal Overlay - Recommended)**: Presents the payment page as an iframe modal overlay on your website without redirecting away from your domain.
2. **Redirect Mode**: Redirects the customer to a new page using the `payment.url` value (no JS file import needed).

---

## 1. Implementing Pop-up Mode (Modal Overlay)

### Step 1: Viewport Configuration
The viewport meta tag in the `<head>` section is mandatory to ensure that the payment page scales correctly on mobile devices.

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### Step 2: Import the DOKU Checkout JS Library
Import `jokul-checkout-1.0.0.js` into your HTML or page layout:

| Environment | JS Source URL |
|---|---|
| **Sandbox** | `https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js` |
| **Production** | `https://jokul.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js` |

```html
<!-- For Sandbox -->
<script src="https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js"></script>

<!-- For Production -->
<script src="https://jokul.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js"></script>
```

### Step 3: Call `loadJokulCheckout(paymentUrl)`
Attach an event listener to your checkout button to call `loadJokulCheckout(payment_url)`. This function is globally injected onto `window` once the script loads.

#### Vanilla JavaScript Example
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DOKU Checkout Demo</title>
  <script src="https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js"></script>
</head>
<body>
  <button id="checkout-button">Pay with DOKU</button>

  <script type="text/javascript">
    document.getElementById('checkout-button').addEventListener('click', async function () {
      try {
        // Request checkout session from your backend
        const response = await fetch('/api/create-checkout', { method: 'POST' });
        const { paymentUrl } = await response.json();
        
        if (!paymentUrl) throw new Error('payment.url not returned');
        
        // Open DOKU Checkout Modal Overlay
        loadJokulCheckout(paymentUrl);
      } catch (err) {
        console.error('Checkout initialization failed:', err);
      }
    });
  </script>
</body>
</html>
```

#### React / Next.js Hook Pattern
```tsx
import { useEffect } from 'react';

declare global {
  interface Window {
    loadJokulCheckout?: (url: string) => void;
  }
}

export function useDokuCheckout(isProduction = false) {
  useEffect(() => {
    const scriptSrc = isProduction
      ? 'https://jokul.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js'
      : 'https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js';

    if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isProduction]);

  const openCheckout = (paymentUrl: string) => {
    if (typeof window.loadJokulCheckout === 'function') {
      window.loadJokulCheckout(paymentUrl);
    } else {
      // Fallback to redirect if script is not yet ready
      window.location.href = paymentUrl;
    }
  };

  return { openCheckout };
}
```

---

## 2. Implementing Redirect Mode

If your application prefers a dedicated full-page redirect rather than an iframe modal:
1. Hit your backend endpoint to call `POST /checkout/v1/payment`.
2. Retrieve `response.payment.url`.
3. Set `window.location.href = paymentUrl;`

```typescript
async function handleCheckoutRedirect() {
  const res = await fetch('/api/checkout/create', { method: 'POST' });
  const data = await res.json();
  if (data?.paymentUrl) {
    window.location.href = data.paymentUrl;
  }
}
```

---

## 3. Callback URLs & Navigation Behavior

Configure these parameters during the `POST /checkout/v1/payment` request to orchestrate user navigation after checkout:

| Parameter | Function | Notes |
|---|---|---|
| `order.callback_url` | URL for the "Back to Merchant" button on the main checkout page | Mandatory for **Jenius Pay** |
| `order.callback_url_result` | URL for the "Back to Merchant" button on the payment result page | Overrides `callback_url` for final status screen |
| `order.callback_url_cancel` | Redirection URL when the customer cancels the order | Supported on **Indodana** |
| `order.auto_redirect` | When set to `true`, automatically redirects customer upon payment completion | Removes need for customer to manually click "Back to Merchant" |

> [!IMPORTANT]
> The `paymentUrl` parameter passed to `loadJokulCheckout()` must strictly be the exact string returned as `response.payment.url` from the backend API call to `/checkout/v1/payment`. Never alter or tamper with the token or URL structure.

---

## References
- [DOKU Checkout Frontend Integration Guide (Official Docs)](https://developers.doku.com/accept-payments/doku-checkout/integration-guide/frontend-integration)
