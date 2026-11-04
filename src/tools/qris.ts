import { DokuClient } from '../core/client.js';

export const qrisTools = [
  {
    name: 'create_qris_payment',
    description:
      'Generate a dynamic QRIS payment code and QR image string compatible with all Indonesian e-wallets (GoPay, OVO, ShopeePay, DANA) and mobile banking apps.',
    inputSchema: {
      type: 'object',
      properties: {
        amount: {
          type: 'integer',
          description: 'Payment amount in Indonesian Rupiah (IDR). Integer without decimals.',
        },
        invoice_number: {
          type: 'string',
          description: 'Unique invoice identifier.',
        },
        store_name: {
          type: 'string',
          description: 'Merchant or store display name shown on customer QR scan screen (default: DOKU Merchant).',
        },
        expired_time: {
          type: 'integer',
          description: 'QRIS expiry time in minutes (default: 30 minutes).',
        },
        callback_url: {
          type: 'string',
          description: 'Optional callback URL.',
        },
      },
      required: ['amount', 'invoice_number'],
    },
  },
];

export async function handleQrisTool(
  name: string,
  args: Record<string, unknown>,
  client: DokuClient
): Promise<unknown> {
  if (name === 'create_qris_payment') {
    const amount = Number(args.amount);
    const invoice_number = String(args.invoice_number);
    const store_name = args.store_name ? String(args.store_name) : undefined;
    const expired_time = args.expired_time ? Number(args.expired_time) : 30;
    const callback_url = args.callback_url ? String(args.callback_url) : undefined;

    return client.createQrisPayment({
      amount,
      invoice_number,
      store_name,
      expired_time,
      callback_url,
    });
  }

  throw new Error(`Unknown QRIS tool: ${name}`);
}

