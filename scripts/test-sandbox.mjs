#!/usr/bin/env node

/**
 * Live Sandbox API Test Runner
 * Validates HMAC-SHA256 signature and network connectivity against DOKU Sandbox
 */

import { DokuClient } from '../dist/index.js';

console.log('🧪 Testing DOKU Sandbox Connectivity...\n');

const clientId = process.env.DOKU_CLIENT_ID;
const secretKey = process.env.DOKU_SECRET_KEY;

if (!clientId || !secretKey) {
  console.log('ℹ️  No DOKU Sandbox credentials found in environment.');
  console.log('👉 To run live test against Sandbox:');
  console.log('   $env:DOKU_CLIENT_ID = "YOUR_SANDBOX_CLIENT_ID"');
  console.log('   $env:DOKU_SECRET_KEY = "YOUR_SANDBOX_SECRET_KEY"');
  console.log('   node scripts/test-sandbox.mjs\n');
  console.log('🔗 Get free Sandbox credentials at: https://sandbox.doku.com/bo/login');
  process.exit(0);
}

const client = new DokuClient({
  clientId,
  secretKey,
  isProduction: false,
});

async function run() {
  const invoiceNumber = `INV-TEST-${Date.now()}`;
  console.log(`Sending sample Checkout Request for invoice: ${invoiceNumber}`);

  try {
    const result = await client.createCheckoutPayment({
      order: {
        amount: 10000,
        invoice_number: invoiceNumber,
        callback_url: 'https://example.com/finish',
      },
      customer: {
        name: 'Sandbox Tester',
        email: 'tester@example.com',
      },
    });

    console.log('\n🎉 SUCCESS! DOKU Sandbox responded:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n💳 To simulate customer payment, open DOKU Simulator:');
    console.log('👉 https://sandbox.doku.com/gtw-config-v2/simulator');
  } catch (err) {
    console.error('\n❌ Sandbox Test Failed:');
    console.error(err.message);
    process.exit(1);
  }
}

run();
