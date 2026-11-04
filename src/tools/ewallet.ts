import { DokuClient } from '../core/client.js';
import { SUPPORTED_EWALLETS, SupportedEwallet } from '../core/constants.js';

export const ewalletTools = [
  {
    name: 'create_ewallet_payment',
    description:
      'Initiate an Indonesian E-Wallet charge (OVO, ShopeePay, DANA, or LinkAja). Returns push notification trigger or mobile payment URL.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          enum: [...SUPPORTED_EWALLETS],
          description: 'E-Wallet provider: OVO, SHOPEEPAY, DANA, or LINKAJA.',
        },
        amount: {
          type: 'integer',
          description: 'Payment amount in Indonesian Rupiah (IDR). Integer without decimals.',
        },
        invoice_number: {
          type: 'string',
          description: 'Unique invoice identifier.',
        },
        phone_number: {
          type: 'string',
          description: 'Customer mobile phone number. Required for OVO push payment (e.g. 081234567890).',
        },
        callback_url: {
          type: 'string',
          description: 'Optional callback URL post payment.',
        },
      },
      required: ['channel', 'amount', 'invoice_number'],
    },
  },
];

export async function handleEwalletTool(
  name: string,
  args: Record<string, unknown>,
  client: DokuClient
): Promise<unknown> {
  if (name === 'create_ewallet_payment') {
    const channel = String(args.channel).toUpperCase() as SupportedEwallet;
    const amount = Number(args.amount);
    const invoice_number = String(args.invoice_number);
    const phone_number = args.phone_number ? String(args.phone_number) : undefined;
    const callback_url = args.callback_url ? String(args.callback_url) : undefined;

    if (channel === 'OVO' && !phone_number) {
      throw new Error('Customer phone_number is strictly required for OVO payments.');
    }

    return client.createEwalletPayment({
      channel,
      amount,
      invoice_number,
      phone_number,
      callback_url,
    });
  }

  throw new Error(`Unknown E-Wallet tool: ${name}`);
}

