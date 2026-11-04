#!/usr/bin/env node

/**
 * Exports ready-to-use Postman Collection v2.1 with dynamic CryptoJS HMAC-SHA256 signature scripts
 */

import fs from 'fs';
import path from 'path';

const preRequestScript = [
  '// Dynamic DOKU Jokul v2 HMAC-SHA256 Signature Generator',
  'const clientId = pm.environment.get("DOKU_CLIENT_ID") || "MCH-MOCK-ID";',
  'const secretKey = pm.environment.get("DOKU_SECRET_KEY") || "SK-MOCK-KEY";',
  'const requestId = CryptoJS.lib.WordArray.random(16).toString();',
  'const timestamp = new Date().toISOString().replace(/\\.\\d{3}Z$/, "Z");',
  'const targetPath = pm.request.url.getPath();',
  '',
  'let digest = "";',
  'if (pm.request.body && pm.request.body.raw && ["POST", "PUT", "PATCH"].includes(pm.request.method)) {',
  '    const rawBody = pm.request.body.raw;',
  '    const hash = CryptoJS.SHA256(rawBody);',
  '    digest = CryptoJS.enc.Base64.stringify(hash);',
  '}',
  '',
  'let component = "Client-Id:" + clientId + "\\nRequest-Id:" + requestId + "\\nRequest-Timestamp:" + timestamp + "\\nRequest-Target:" + targetPath;',
  'if (digest) {',
  '    component += "\\nDigest:" + digest;',
  '}',
  '',
  'const hmac = CryptoJS.HmacSHA256(component, secretKey);',
  'const signature = "HMACSHA256=" + CryptoJS.enc.Base64.stringify(hmac);',
  '',
  'pm.request.headers.upsert({ key: "Client-Id", value: clientId });',
  'pm.request.headers.upsert({ key: "Request-Id", value: requestId });',
  'pm.request.headers.upsert({ key: "Request-Timestamp", value: timestamp });',
  'pm.request.headers.upsert({ key: "Signature", value: signature });',
  'pm.request.headers.upsert({ key: "Content-Type", value: "application/json" });',
].join('\n');

const collection = {
  info: {
    _postman_id: 'doku-jokul-mcp-collection-v2',
    name: 'DOKU Payment Gateway (Jokul API v2)',
    description: 'Postman Collection with automated HMAC-SHA256 signature pre-request scripts',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  event: [
    {
      listen: 'prerequest',
      script: {
        type: 'text/javascript',
        exec: preRequestScript.split('\n'),
      },
    },
  ],
  variable: [
    {
      key: 'BASE_URL',
      value: 'https://api-sandbox.doku.com',
      type: 'string',
    },
  ],
  item: [
    {
      name: 'Checkout',
      item: [
        {
          name: 'Generate Payment Link',
          request: {
            method: 'POST',
            url: {
              raw: '{{BASE_URL}}/checkout/v1/payment',
              host: ['{{BASE_URL}}'],
              path: ['checkout', 'v1', 'payment'],
            },
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                {
                  order: {
                    amount: 50000,
                    invoice_number: 'INV-TEST-001',
                    callback_url: 'https://merchant.com/orders/finish',
                  },
                  payment: {
                    payment_due_date: 60,
                  },
                  customer: {
                    name: 'Budi Santoso',
                    email: 'budi@example.com',
                  },
                },
                null,
                2
              ),
            },
          },
        },
        {
          name: 'Cancel Unpaid Checkout Order',
          request: {
            method: 'POST',
            url: {
              raw: '{{BASE_URL}}/checkout/v3/cancellations',
              host: ['{{BASE_URL}}'],
              path: ['checkout', 'v3', 'cancellations'],
            },
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                {
                  order: {
                    invoice_number: 'INV-TEST-001',
                  },
                  reason: 'Customer requested order cancellation',
                },
                null,
                2
              ),
            },
          },
        },
      ],
    },
    {
      name: 'Virtual Account',
      item: [
        {
          name: 'Create BCA Virtual Account',
          request: {
            method: 'POST',
            url: {
              raw: '{{BASE_URL}}/doku-virtual-account/v2/payment-code',
              host: ['{{BASE_URL}}'],
              path: ['doku-virtual-account', 'v2', 'payment-code'],
            },
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                {
                  order: {
                    invoice_number: 'INV-VA-BCA-001',
                    amount: 100000,
                  },
                  virtual_account_info: {
                    expired_time: 1440,
                    reusable_status: false,
                  },
                  customer: {
                    name: 'Ahmad Dahlan',
                    email: 'ahmad@example.com',
                  },
                },
                null,
                2
              ),
            },
          },
        },
      ],
    },
    {
      name: 'QRIS',
      item: [
        {
          name: 'Create Dynamic QRIS Code',
          request: {
            method: 'POST',
            url: {
              raw: '{{BASE_URL}}/qris/v1/payment-code',
              host: ['{{BASE_URL}}'],
              path: ['qris', 'v1', 'payment-code'],
            },
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                {
                  order: {
                    invoice_number: 'INV-QRIS-001',
                    amount: 25000,
                  },
                  qris_info: {
                    store_name: 'DOKU Coffee Shop',
                    expired_time: 30,
                  },
                },
                null,
                2
              ),
            },
          },
        },
      ],
    },
    {
      name: 'Status & Inquiry',
      item: [
        {
          name: 'Check Invoice Status',
          request: {
            method: 'GET',
            url: {
              raw: '{{BASE_URL}}/orders/v1/status/INV-TEST-001',
              host: ['{{BASE_URL}}'],
              path: ['orders', 'v1', 'status', 'INV-TEST-001'],
            },
          },
        },
      ],
    },
    {
      name: 'Refund',
      item: [
        {
          name: 'Process Online Refund',
          request: {
            method: 'POST',
            url: {
              raw: '{{BASE_URL}}/orders/v1/refund',
              host: ['{{BASE_URL}}'],
              path: ['orders', 'v1', 'refund'],
            },
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                {
                  order: {
                    invoice_number: 'INV-TEST-001',
                  },
                  refund: {
                    amount: 50000,
                    reason: 'Defective item returned',
                  },
                },
                null,
                2
              ),
            },
          },
        },
      ],
    },
  ],
};

const outputPath = path.resolve('doku-api-collection.json');
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2), 'utf8');

console.log(`✅ Postman Collection exported to: ${outputPath}`);

