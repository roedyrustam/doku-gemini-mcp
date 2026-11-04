import { DokuClient } from '../core/client.js';

export const checkoutTools = [
  {
    name: 'create_checkout_payment',
    description:
      'Generate a DOKU Checkout Payment Link (URL) for hosted/popup payment pages. Supports Virtual Account, QRIS, E-Wallet, Credit Card, Direct Debit, and PayLater.',
    inputSchema: {
      type: 'object',
      properties: {
        amount: {
          type: 'integer',
          description: 'Payment amount in Indonesian Rupiah (IDR). Integer without decimals (e.g. 50000).',
        },
        invoice_number: {
          type: 'string',
          description: 'Unique invoice identifier for this order (e.g. INV-20261105-001).',
        },
        customer_name: {
          type: 'string',
          description: 'Customer full name.',
        },
        customer_email: {
          type: 'string',
          description: 'Customer email address.',
        },
        callback_url: {
          type: 'string',
          description: 'Optional merchant redirect URL post-payment.',
        },
        payment_due_date: {
          type: 'integer',
          description: 'Payment expiry duration in minutes (default: 60).',
        },
        payment_method_types: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional array of allowed payment method codes (e.g. ["VIRTUAL_ACCOUNT_BCA", "QRIS"]).',
        },
      },
      required: ['amount', 'invoice_number', 'customer_name', 'customer_email'],
    },
  },
  {
    name: 'cancel_checkout_order',
    description:
      'Cancel an unpaid DOKU Checkout order before expiry (POST /checkout/v3/cancellations).',
    inputSchema: {
      type: 'object',
      properties: {
        invoice_number: {
          type: 'string',
          description: 'Target invoice number to cancel.',
        },
        reason: {
          type: 'string',
          description: 'Reason for cancelling the order (e.g. Customer cancelled order).',
        },
      },
      required: ['invoice_number'],
    },
  },
];

export async function handleCheckoutTool(
  name: string,
  args: Record<string, unknown>,
  client: DokuClient
): Promise<unknown> {
  if (name === 'create_checkout_payment') {
    const amount = Number(args.amount);
    const invoice_number = String(args.invoice_number);
    const customer_name = String(args.customer_name);
    const customer_email = String(args.customer_email);
    const callback_url = args.callback_url ? String(args.callback_url) : undefined;
    const payment_due_date = args.payment_due_date ? Number(args.payment_due_date) : 60;
    const payment_method_types = Array.isArray(args.payment_method_types)
      ? (args.payment_method_types as string[])
      : undefined;

    return client.createCheckoutPayment({
      order: {
        amount,
        invoice_number,
        callback_url,
      },
      payment: {
        payment_due_date,
        payment_method_types,
      },
      customer: {
        name: customer_name,
        email: customer_email,
      },
    });
  }

  if (name === 'cancel_checkout_order') {
    const invoice_number = String(args.invoice_number);
    const reason = args.reason ? String(args.reason) : undefined;

    return client.cancelCheckoutOrder({
      invoice_number,
      reason,
    });
  }

  throw new Error(`Unknown checkout tool: ${name}`);
}

