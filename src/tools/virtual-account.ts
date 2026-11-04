import { DokuClient } from '../core/client.js';
import { SUPPORTED_VA_BANKS, SupportedVaBank } from '../core/constants.js';

export const virtualAccountTools = [
  {
    name: 'create_virtual_account',
    description:
      'Generate a bank Virtual Account (VA) number directly via DOKU Jokul API v2 for immediate customer transfer.',
    inputSchema: {
      type: 'object',
      properties: {
        bank_code: {
          type: 'string',
          enum: [...SUPPORTED_VA_BANKS],
          description: 'Target Indonesian bank code: BCA, MANDIRI, BRI, BNI, PERMATA, DANAMON, or CIMB.',
        },
        amount: {
          type: 'integer',
          description: 'Payment amount in Indonesian Rupiah (IDR). Integer without decimals.',
        },
        invoice_number: {
          type: 'string',
          description: 'Unique invoice identifier for this transaction.',
        },
        customer_name: {
          type: 'string',
          description: 'Customer full name displayed on ATM / m-Banking screen.',
        },
        customer_email: {
          type: 'string',
          description: 'Optional customer email address for receipt delivery.',
        },
        expired_time: {
          type: 'integer',
          description: 'VA validity duration in minutes (default: 1440 = 24 hours).',
        },
        reusable_status: {
          type: 'boolean',
          description: 'Whether this VA number can be paid multiple times (default: false = single use).',
        },
      },
      required: ['bank_code', 'amount', 'invoice_number', 'customer_name'],
    },
  },
];

export async function handleVirtualAccountTool(
  name: string,
  args: Record<string, unknown>,
  client: DokuClient
): Promise<unknown> {
  if (name === 'create_virtual_account') {
    const bank_code = String(args.bank_code).toUpperCase() as SupportedVaBank;
    const amount = Number(args.amount);
    const invoice_number = String(args.invoice_number);
    const customer_name = String(args.customer_name);
    const customer_email = args.customer_email ? String(args.customer_email) : undefined;
    const expired_time = args.expired_time ? Number(args.expired_time) : 1440;
    const reusable_status = Boolean(args.reusable_status);

    return client.createVirtualAccount({
      bank_code,
      amount,
      invoice_number,
      customer_name,
      customer_email,
      expired_time,
      reusable_status,
    });
  }

  throw new Error(`Unknown virtual account tool: ${name}`);
}

