import { DokuClient } from '../core/client.js';

export const refundTools = [
  {
    name: 'process_refund',
    description:
      'Initiate an online refund for an existing settled transaction (POST /orders/v1/refund).',
    inputSchema: {
      type: 'object',
      properties: {
        invoice_number: {
          type: 'string',
          description: 'The invoice number of the original paid transaction to refund.',
        },
        amount: {
          type: 'integer',
          description: 'The refund amount in IDR (integer without decimals). Supports partial or full refund.',
        },
        reason: {
          type: 'string',
          description: 'Reason for processing the refund (e.g. Customer cancelled order / defective product).',
        },
      },
      required: ['invoice_number', 'amount', 'reason'],
    },
  },
];

export async function handleRefundTool(
  name: string,
  args: Record<string, unknown>,
  client: DokuClient
): Promise<unknown> {
  if (name === 'process_refund') {
    const invoice_number = String(args.invoice_number);
    const amount = Number(args.amount);
    const reason = String(args.reason);

    return client.processRefund({
      invoice_number,
      amount,
      reason,
    });
  }

  throw new Error(`Unknown refund tool: ${name}`);
}

