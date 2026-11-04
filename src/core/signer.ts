import crypto from 'crypto';
import {
  JokulSignatureParams,
  SnapSignatureParams,
  WebhookVerificationParams,
} from './types.js';

/**
 * Returns UTC ISO8601 timestamp string strictly without milliseconds (e.g. 2026-08-09T00:00:00Z)
 */
export function generateDokuTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Calculates Base64-encoded SHA-256 Digest of the payload
 */
export function calculateDigest(body?: object | string): string {
  if (!body) return '';

  const rawString =
    typeof body === 'string' ? body : JSON.stringify(body);

  if (!rawString || rawString.trim() === '' || rawString === '{}') {
    return '';
  }

  const hash = crypto.createHash('sha256').update(rawString, 'utf8').digest();
  return hash.toString('base64');
}

/**
 * Constructs Jokul API v2 Component String and computes HMAC-SHA256 Signature
 * Formula:
 * Client-Id:<CLIENT_ID>\nRequest-Id:<REQUEST_ID>\nRequest-Timestamp:<TIMESTAMP>\nRequest-Target:<TARGET_PATH>[\nDigest:<DIGEST>]
 */
export function calculateJokulSignature(params: JokulSignatureParams): {
  digest: string;
  componentString: string;
  signature: string;
} {
  const { clientId, secretKey, requestId, timestamp, targetPath, body } = params;

  const digest = calculateDigest(body);

  let componentString = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${targetPath}`;

  if (digest) {
    componentString += `\nDigest:${digest}`;
  }

  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(componentString, 'utf8');
  const signature = `HMACSHA256=${hmac.digest('base64')}`;

  return {
    digest,
    componentString,
    signature,
  };
}

/**
 * Constructs SNAP BI API v1.0 Symmetric String-to-Sign and computes HMAC-SHA512 Signature
 * Formula:
 * HTTPMethod + ":" + EndpointUrl + ":" + AccessToken + ":" + Lowercase(HexEncode(SHA-256(MinifiedRequestBody))) + ":" + Timestamp
 */
export function calculateSnapSignature(params: SnapSignatureParams): {
  minifiedBodyHash: string;
  stringToSign: string;
  signature: string;
} {
  const { httpMethod, endpointUrl, accessToken, secretKey, timestamp, body } =
    params;

  let minifiedBody = '';
  if (body) {
    minifiedBody = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const bodyHash = crypto
    .createHash('sha256')
    .update(minifiedBody, 'utf8')
    .digest('hex')
    .toLowerCase();

  const stringToSign = `${httpMethod.toUpperCase()}:${endpointUrl}:${accessToken}:${bodyHash}:${timestamp}`;

  const hmac = crypto.createHmac('sha512', secretKey);
  hmac.update(stringToSign, 'utf8');
  const signature = hmac.digest('base64');

  return {
    minifiedBodyHash: bodyHash,
    stringToSign,
    signature,
  };
}

/**
 * Validates incoming HTTP Webhook Signature with timing-safe comparison to prevent timing side-channel attacks
 */
export function verifyWebhookSignature(params: WebhookVerificationParams): boolean {
  const {
    clientId,
    requestId,
    timestamp,
    targetPath,
    signature,
    secretKey,
    rawBody,
  } = params;

  if (!clientId || !requestId || !timestamp || !targetPath || !signature) {
    return false;
  }

  const expected = calculateJokulSignature({
    clientId,
    secretKey,
    requestId,
    timestamp,
    targetPath,
    body: rawBody,
  });

  const expectedBuffer = Buffer.from(expected.signature, 'utf8');
  const receivedBuffer = Buffer.from(signature, 'utf8');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

