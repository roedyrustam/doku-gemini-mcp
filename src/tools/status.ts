import { DokuClient } from '../core/client.js';

export const statusTools = [
  {
    name: 'check_transaction_status',
    description:
      'Check real-time payment status of an invoice from DOKU Payment Gateway (GET /orders/v1/status/:invoice_number).',
    inputSchema: {
      type: 'object',
      properties: {
        invoice_number: {
          type: 'string',
          description: 'The unique invoice number to query (e.g. INV-1720752332).',
        },
      },
      required: ['invoice_number'],
    },
  },
];

export async function handleStatusTool(
  name: string,
  args: Record<string, unknown>,
  client: DokuClient
): Promise<unknown> {
  if (name === 'check_transaction_status') {
    const invoice_number = String(args.invoice_number);
    return client.checkTransactionStatus(invoice_number);
  }

  throw new Error(`Unknown status tool: ${name}`);
}

