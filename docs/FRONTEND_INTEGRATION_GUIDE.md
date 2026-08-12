# DOKU Checkout - Frontend Integration Guide

This guide explains how to present the DOKU Checkout payment page seamlessly within your web application frontend. Once you have generated the `payment.url` from your backend via the Jokul Checkout API, you can display it using two primary methods.

## Integration Methods

There are two approaches for integrating the DOKU Checkout page into your web/app interface:
1. **Redirect Mode**: Redirect the customer to a new page using the `payment.url` value (no JS file import needed).
2. **Pop-up Mode (Modal Overlay)**: Present the payment page as an iframe modal overlay on your website without redirecting away from your domain.

---

## Implementing Pop-up Mode

To integrate the payment page seamlessly as a pop-up, follow these steps to embed the DOKU Checkout JS library in your HTML file.

### 1. Viewport Configuration

The viewport in the `<head>` tag is important to ensure that the payment page scales correctly on mobile devices.

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### 2. Import the DOKU Checkout JS Library

Import the `jokul-checkout-1.0.0.js` library into your HTML file. Be sure to use the correct URL depending on your environment.

| Environment | JS Source URL |
|---|---|
| **Sandbox** | `https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js` |
| **Production** | `https://jokul.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js` |

```html
<!-- Example for Sandbox -->
<script src="https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js"></script>
```

### 3. Invoke `loadJokulCheckout`

Attach an event listener to your checkout button to call `loadJokulCheckout(payment_url)`. This function is globally available after importing the script.

#### HTML Example

```html
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- Load the DOKU Checkout Sandbox JS -->
    <script src="https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js"></script>
</head>
<body>
    <button id="checkout-button">Checkout Now</button>

    <script type="text/javascript">
        var checkoutButton = document.getElementById('checkout-button');
        
        // Example: the payment page will show when the button is clicked
        checkoutButton.addEventListener('click', function () {
            // Replace the URL with the actual response.payment.url retrieved from your backend API
            const paymentUrl = 'https://sandbox.doku.com/checkout/link/SU5WFDferd561dfasfasdfae123c20200510090550775';
            
            loadJokulCheckout(paymentUrl);
        });
    </script>
</body>
</html>
```

> [!IMPORTANT]
> The `paymentUrl` parameter passed to `loadJokulCheckout()` must strictly be the exact string returned as `response.payment.url` from your server-side API call to `/checkout/v1/payment`.

---

## References

- [DOKU Checkout Frontend Integration Guide (Official Docs)](https://developers.doku.com/accept-payments/doku-checkout/integration-guide/frontend-integration)
