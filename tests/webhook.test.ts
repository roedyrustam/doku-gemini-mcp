import { describe, it, expect } from 'vitest';
import { calculateJokulSignature, verifyWebhookSignature } from '../src/core/signer.js';

describe('DOKU Webhook Notification Verifier & Timing Guard', () => {
  const secretKey = 'MY-SECRET-WEBHOOK-KEY';
  const clientId = 'MCH-TEST-888';
  const requestId = 'req-notification-123';
  const timestamp = '2026-11-05T01:30:00Z';
  const targetPath = '/api/doku/webhook';
  const payload = {
    order: {
      invoice_number: 'INV-PAID-001',
      amount: 150000,
    },
    transaction: {
      status: 'SUCCESS',
    },
  };

  it('verifies valid incoming webhook notification signature successfully', () => {
    const { signature } = calculateJokulSignature({
      clientId,
      secretKey,
      requestId,
      timestamp,
      targetPath,
      body: payload,
    });

    const isValid = verifyWebhookSignature({
      clientId,
      requestId,
      timestamp,
      targetPath,
      signature,
      secretKey,
      rawBody: payload,
    });

    expect(isValid).toBe(true);
  });

  it('rejects tampered webhook payload immediately', () => {
    const { signature } = calculateJokulSignature({
      clientId,
      secretKey,
      requestId,
      timestamp,
      targetPath,
      body: payload,
    });

    const tamperedPayload = {
      ...payload,
      order: {
        ...payload.order,
        amount: 1000, // Attacker altered amount
      },
    };

    const isValid = verifyWebhookSignature({
      clientId,
      requestId,
      timestamp,
      targetPath,
      signature,
      secretKey,
      rawBody: tamperedPayload,
    });

    expect(isValid).toBe(false);
  });

  it('rejects notification when signed with wrong secret key', () => {
    const { signature } = calculateJokulSignature({
      clientId,
      secretKey: 'WRONG-SECRET-KEY',
      requestId,
      timestamp,
      targetPath,
      body: payload,
    });

    const isValid = verifyWebhookSignature({
      clientId,
      requestId,
      timestamp,
      targetPath,
      signature,
      secretKey,
      rawBody: payload,
    });

    expect(isValid).toBe(false);
  });

  it('gracefully handles empty or missing header parameters', () => {
    const isValid = verifyWebhookSignature({
      clientId: '',
      requestId: '',
      timestamp: '',
      targetPath: '',
      signature: '',
      secretKey,
      rawBody: payload,
    });

    expect(isValid).toBe(false);
  });
});

