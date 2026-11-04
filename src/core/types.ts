import { SupportedVaBank, SupportedEwallet } from './constants.js';

export interface DokuConfig {
  clientId: string;
  secretKey: string;
  isProduction?: boolean;
}

export interface JokulSignatureParams {
  clientId: string;
  secretKey: string;
  requestId: string;
  timestamp: string; // ISO8601 without ms: YYYY-MM-DDTHH:mm:ssZ
  targetPath: string; // e.g. /checkout/v1/payment
  body?: object | string;
}

export interface SnapSignatureParams {
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpointUrl: string;
  accessToken: string;
  secretKey: string;
  timestamp: string;
  body?: object | string;
}

export interface WebhookVerificationParams {
  clientId: string;
  requestId: string;
  timestamp: string;
  targetPath: string;
  signature: string;
  secretKey: string;
  rawBody: string | object;
}

export interface CheckoutPaymentRequest {
  order: {
    amount: number;
    invoice_number: string;
    currency?: string;
    callback_url?: string;
    callback_url_result?: string;
    callback_url_cancel?: string;
    language?: 'ID' | 'EN';
    auto_redirect?: boolean;
    disable_retry_payment?: boolean;
    recover_abandoned_cart?: boolean;
    expired_recovered_cart?: number;
    line_items?: Array<{
      id?: string;
      name: string;
      price: number;
      quantity: number;
      sku?: string;
      category?: string;
      url?: string;
      image_url?: string;
      type?: string;
    }>;
  };
  payment?: {
    payment_due_date?: number;
    payment_method_types?: string[];
  };
  customer?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    country?: string;
  };
}

export interface CheckoutCancelRequest {
  invoice_number: string;
  original_request_id?: string;
  reason?: string;
}

export interface VirtualAccountRequest {
  bank_code: SupportedVaBank;
  amount: number;
  invoice_number: string;
  customer_name: string;
  customer_email?: string;
  expired_time?: number; // Minutes
  reusable_status?: boolean;
  info1?: string;
  info2?: string;
  info3?: string;
}

export interface QrisPaymentRequest {
  amount: number;
  invoice_number: string;
  store_name?: string;
  expired_time?: number; // Minutes
  callback_url?: string;
}

export interface EwalletPaymentRequest {
  channel: SupportedEwallet;
  amount: number;
  invoice_number: string;
  phone_number?: string;
  callback_url?: string;
  return_url?: string;
}

export interface StatusInquiryRequest {
  invoice_number: string;
}

export interface RefundRequest {
  invoice_number: string;
  amount: number;
  reason: string;
  refund_id?: string;
}

export interface DokuErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

