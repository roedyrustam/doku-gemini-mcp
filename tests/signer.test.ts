import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  generateDokuTimestamp,
  calculateDigest,
  calculateJokulSignature,
  calculateSnapSignature,
  calculateSnapAsymmetricSignature,
  verifySnapWebhookSignature,
} from '../src/core/signer.js';

describe('DOKU Cryptographic Signer Engine', () => {
  it('generates UTC ISO8601 timestamp strictly without milliseconds', () => {
    const timestamp = generateDokuTimestamp();
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(timestamp.includes('.')).toBe(false);
  });

  it('calculates Base64 SHA-256 Digest correctly', () => {
    const payload = {
      order: {
        amount: 50000,
        invoice_number: 'INV-TEST-001',
      },
    };

    const rawString = JSON.stringify(payload);
    const expectedHash = crypto
      .createHash('sha256')
      .update(rawString, 'utf8')
      .digest('base64');

    const digest = calculateDigest(payload);
    expect(digest).toBe(expectedHash);
  });

  it('returns empty string digest when body is empty or omitted', () => {
    expect(calculateDigest()).toBe('');
    expect(calculateDigest({})).toBe('');
    expect(calculateDigest('')).toBe('');
  });

  it('assembles Jokul v2 component string correctly without trailing newline', () => {
    const params = {
      clientId: 'MCH-12345678',
      secretKey: 'SK-SEC-TEST-KEY',
      requestId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      timestamp: '2026-08-09T02:00:00Z',
      targetPath: '/checkout/v1/payment',
      body: {
        order: { amount: 50000, invoice_number: 'INV-101' },
      },
    };

    const result = calculateJokulSignature(params);

    expect(result.componentString).not.toMatch(/\n$/);
    expect(result.componentString).toContain(`Client-Id:${params.clientId}`);
    expect(result.componentString).toContain(`Request-Id:${params.requestId}`);
    expect(result.componentString).toContain(`Request-Timestamp:${params.timestamp}`);
    expect(result.componentString).toContain(`Request-Target:${params.targetPath}`);
    expect(result.componentString).toContain(`Digest:${result.digest}`);

    expect(result.signature.startsWith('HMACSHA256=')).toBe(true);
  });

  it('omits Digest component string completely for GET requests without body', () => {
    const params = {
      clientId: 'MCH-12345678',
      secretKey: 'SK-SEC-TEST-KEY',
      requestId: 'uuid-12345',
      timestamp: '2026-08-09T02:00:00Z',
      targetPath: '/orders/v1/status/INV-101',
    };

    const result = calculateJokulSignature(params);

    expect(result.digest).toBe('');
    expect(result.componentString).not.toContain('Digest:');
    expect(result.componentString).toBe(
      'Client-Id:MCH-12345678\nRequest-Id:uuid-12345\nRequest-Timestamp:2026-08-09T02:00:00Z\nRequest-Target:/orders/v1/status/INV-101'
    );
    expect(result.componentString).not.toMatch(/\n$/);
  });

  it('calculates SNAP BI symmetric signature correctly with HMAC-SHA512 and auto-strips Bearer prefix', () => {
    const params = {
      httpMethod: 'POST' as const,
      endpointUrl: '/snap-adapter/b2b/v1.0/qr/qr-mpm-generate',
      accessToken: 'Bearer mock-token-123',
      secretKey: 'SK-SNAP-SECRET',
      timestamp: '2026-08-09T02:00:00+07:00',
      body: { partnerReferenceNo: 'REF-001' },
    };

    const result = calculateSnapSignature(params);

    // Must not contain "Bearer " inside stringToSign!
    expect(result.stringToSign).toContain('POST:/snap-adapter/b2b/v1.0/qr/qr-mpm-generate:mock-token-123:');
    expect(result.minifiedBodyHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.signature).toBeTruthy();
  });

  it('calculates SNAP Asymmetric Signature (SHA256withRSA) for Get Token B2B API', () => {
    // Generate temporary 2048-bit RSA keypair for testing
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
    const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();

    const clientKey = 'MCH-0008-1296507211683';
    const timestamp = '2026-11-05T01:18:39Z';

    const result = calculateSnapAsymmetricSignature({
      clientKey,
      timestamp,
      privateKeyPem,
    });

    expect(result.stringToSign).toBe(`${clientKey}|${timestamp}`);
    expect(result.signature).toBeTruthy();

    // Verify with public key
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(result.stringToSign, 'utf8');
    verifier.end();
    const isValid = verifier.verify(publicKeyPem, result.signature, 'base64');
    expect(isValid).toBe(true);
  });

  it('verifies incoming SNAP Symmetric webhook notification correctly', () => {
    const secretKey = 'SNAP-WEBHOOK-SECRET';
    const params = {
      httpMethod: 'POST' as const,
      endpointUrl: '/api/snap/notify',
      accessToken: 'token-abc',
      secretKey,
      timestamp: '2026-11-05T02:00:00Z',
      body: { status: 'PAID', amount: '50000.00' },
    };

    const { signature } = calculateSnapSignature(params);

    const isValid = verifySnapWebhookSignature({
      httpMethod: 'POST',
      endpointUrl: '/api/snap/notify',
      accessToken: 'token-abc',
      timestamp: '2026-11-05T02:00:00Z',
      signature,
      secretKey,
      rawBody: { status: 'PAID', amount: '50000.00' },
    });

    expect(isValid).toBe(true);
  });
});
