import { describe, it, expect } from 'vitest';
import { checkoutTools } from '../src/tools/checkout.js';
import { virtualAccountTools } from '../src/tools/virtual-account.js';
import { qrisTools } from '../src/tools/qris.js';
import { ewalletTools } from '../src/tools/ewallet.js';
import { statusTools } from '../src/tools/status.js';
import { refundTools } from '../src/tools/refund.js';
import { snapTools } from '../src/tools/snap.js';
import { DokuClient } from '../src/core/client.js';

describe('MCP Tools Schema & Sandbox Defaulting', () => {
  const allTools = [
    ...checkoutTools,
    ...virtualAccountTools,
    ...qrisTools,
    ...ewalletTools,
    ...statusTools,
    ...refundTools,
    ...snapTools,
  ];

  it('exposes exactly 9 core MCP tools with valid names and schemas', () => {
    expect(allTools.length).toBe(9);

    const toolNames = allTools.map((t) => t.name);
    // Jokul v2 Tools
    expect(toolNames).toContain('create_checkout_payment');
    expect(toolNames).toContain('cancel_checkout_order');
    expect(toolNames).toContain('create_virtual_account');
    expect(toolNames).toContain('create_qris_payment');
    expect(toolNames).toContain('create_ewallet_payment');
    expect(toolNames).toContain('check_transaction_status');
    expect(toolNames).toContain('process_refund');

    // BI-SNAP Standards Tools
    expect(toolNames).toContain('get_snap_b2b_token');
    expect(toolNames).toContain('create_snap_qris_payment');

    for (const tool of allTools) {
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema.type).toBe('object');
      expect(tool.inputSchema.properties).toBeTruthy();
    }
  });

  it('defaults DokuClient to Sandbox environment for safety', () => {
    const client = new DokuClient({
      clientId: 'TEST-CLIENT-ID',
      secretKey: 'TEST-SECRET-KEY',
    });

    const env = client.getEnvironment();
    expect(env.isProduction).toBe(false);
    expect(env.baseUrl).toBe('https://api-sandbox.doku.com');
  });

  it('throws descriptive error when API request is initiated without credentials', async () => {
    const client = new DokuClient({
      clientId: '',
      secretKey: '',
    });

    await expect(
      client.checkTransactionStatus('INV-MOCK-001')
    ).rejects.toThrow('Missing DOKU credentials');
  });
});
