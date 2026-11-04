import { DokuClient } from '../core/client.js';

export const snapTools = [
  {
    name: 'get_snap_b2b_token',
    description:
      'Obtain a SNAP BI OAuth 2.0 B2B Access Token using Asymmetric RSA-2048 SHA256withRSA signature (POST /authorization/v1/access-token/b2b). Requires DOKU_CLIENT_ID and Merchant Private Key.',
    inputSchema: {
      type: 'object',
      properties: {
        private_key_pem: {
          type: 'string',
          description:
            'Optional RSA Private Key in PEM format (defaults to DOKU_PRIVATE_KEY_PEM environment variable).',
        },
      },
    },
  },
  {
    name: 'create_snap_qris_payment',
    description:
      'Generate a dynamic QRIS payment code strictly conforming to Bank Indonesia SNAP standard (POST /snap-adapter/b2b/v1.0/qr/qr-mpm-generate) with Symmetric HMAC-SHA512 signature.',
    inputSchema: {
      type: 'object',
      properties: {
        partner_reference_no: {
          type: 'string',
          description: 'Unique partner transaction reference number / invoice ID.',
        },
        amount_value: {
          type: 'string',
          description: 'Amount in IDR formatted as decimal string (e.g. "25000.00").',
        },
        access_token: {
          type: 'string',
          description: 'B2B OAuth Access Token obtained via get_snap_b2b_token API.',
        },
        merchant_id: {
          type: 'string',
          description: 'Optional Sub-Merchant ID / Terminal ID.',
        },
      },
      required: ['partner_reference_no', 'amount_value', 'access_token'],
    },
  },
];

export async function handleSnapTool(
  name: string,
  args: Record<string, unknown>,
  client: DokuClient
): Promise<unknown> {
  if (name === 'get_snap_b2b_token') {
    const privateKey = args.private_key_pem ? String(args.private_key_pem) : undefined;
    return client.getSnapB2bToken(privateKey);
  }

  if (name === 'create_snap_qris_payment') {
    const partnerReferenceNo = String(args.partner_reference_no);
    const amountValue = String(args.amount_value);
    const accessToken = String(args.access_token);
    const merchantId = args.merchant_id ? String(args.merchant_id) : undefined;

    return client.createSnapQrisPayment(
      {
        partnerReferenceNo,
        amount: {
          value: amountValue,
          currency: 'IDR',
        },
        merchantId,
      },
      accessToken
    );
  }

  throw new Error(`Unknown SNAP tool: ${name}`);
}

