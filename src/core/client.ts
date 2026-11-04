import axios, { AxiosInstance, AxiosError } from 'axios';
import crypto from 'crypto';
import {
  DokuConfig,
  CheckoutPaymentRequest,
  CheckoutCancelRequest,
  VirtualAccountRequest,
  QrisPaymentRequest,
  EwalletPaymentRequest,
  RefundRequest,
} from './types.js';
import {
  DOKU_SANDBOX_BASE_URL,
  DOKU_PRODUCTION_BASE_URL,
  DOKU_ENDPOINTS,
} from './constants.js';
import { generateDokuTimestamp, calculateJokulSignature } from './signer.js';

export class DokuClient {
  private clientId: string;
  private secretKey: string;
  private baseUrl: string;
  private isProduction: boolean;
  private http: AxiosInstance;

  constructor(config?: Partial<DokuConfig>) {
    this.clientId =
      config?.clientId || process.env.DOKU_CLIENT_ID || '';
    this.secretKey =
      config?.secretKey || process.env.DOKU_SECRET_KEY || '';

    // Default to Sandbox for absolute safety
    this.isProduction =
      config?.isProduction ??
      (process.env.DOKU_IS_PRODUCTION === 'true' ||
        process.env.NODE_ENV === 'production');

    this.baseUrl = this.isProduction
      ? DOKU_PRODUCTION_BASE_URL
      : DOKU_SANDBOX_BASE_URL;

    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public getEnvironment(): { isProduction: boolean; baseUrl: string; hasCredentials: boolean } {
    return {
      isProduction: this.isProduction,
      baseUrl: this.baseUrl,
      hasCredentials: Boolean(this.clientId && this.secretKey),
    };
  }

  /**
   * Internal helper to execute authenticated Jokul API v2 requests
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    targetPath: string,
    body?: object
  ): Promise<T> {
    if (!this.clientId || !this.secretKey) {
      throw new Error(
        'Missing DOKU credentials. Please set DOKU_CLIENT_ID and DOKU_SECRET_KEY environment variables.'
      );
    }

    const requestId = crypto.randomUUID();
    const timestamp = generateDokuTimestamp();

    const { signature } = calculateJokulSignature({
      clientId: this.clientId,
      secretKey: this.secretKey,
      requestId,
      timestamp,
      targetPath,
      body: method !== 'GET' ? body : undefined,
    });

    const headers: Record<string, string> = {
      'Client-Id': this.clientId,
      'Request-Id': requestId,
      'Request-Timestamp': timestamp,
      Signature: signature,
    };

    try {
      const response = await this.http.request<T>({
        method,
        url: targetPath,
        headers,
        data: method !== 'GET' ? body : undefined,
      });

      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<{ error?: { message?: string; code?: string }; message?: string }>;
        const status = axiosErr.response?.status;
        const responseData = axiosErr.response?.data;
        const errorMessage =
          responseData?.error?.message ||
          responseData?.message ||
          axiosErr.message ||
          'DOKU API Request Failed';

        throw new Error(
          `DOKU API Error [HTTP ${status || 'Network'}]: ${errorMessage} (Target: ${targetPath})`
        );
      }

      throw err;
    }
  }

  /**
   * Generates a DOKU Checkout Payment Link
   * POST /checkout/v1/payment
   */
  public async createCheckoutPayment(payload: CheckoutPaymentRequest): Promise<unknown> {
    return this.request('POST', DOKU_ENDPOINTS.CHECKOUT_PAYMENT, payload);
  }

  /**
   * Cancels an unpaid DOKU Checkout order
   * POST /checkout/v3/cancellations
   */
  public async cancelCheckoutOrder(payload: CheckoutCancelRequest): Promise<unknown> {
    const body = {
      order: {
        invoice_number: payload.invoice_number,
      },
      reason: payload.reason || 'Requested by customer or merchant cancellation',
    };
    return this.request('POST', DOKU_ENDPOINTS.CHECKOUT_CANCEL, body);
  }

  /**
   * Issues a direct Bank Virtual Account
   * POST /doku-virtual-account/v2/payment-code
   */
  public async createVirtualAccount(payload: VirtualAccountRequest): Promise<unknown> {
    const body = {
      order: {
        invoice_number: payload.invoice_number,
        amount: payload.amount,
      },
      virtual_account_info: {
        expired_time: payload.expired_time || 1440,
        reusable_status: payload.reusable_status || false,
        info1: payload.info1,
        info2: payload.info2,
        info3: payload.info3,
      },
      customer: {
        name: payload.customer_name,
        email: payload.customer_email,
      },
    };

    // Bank specific path or generic Jokul VA
    return this.request('POST', DOKU_ENDPOINTS.VIRTUAL_ACCOUNT, body);
  }

  /**
   * Generates a dynamic QRIS payment code
   * POST /qris/v1/payment-code
   */
  public async createQrisPayment(payload: QrisPaymentRequest): Promise<unknown> {
    const body = {
      order: {
        invoice_number: payload.invoice_number,
        amount: payload.amount,
        callback_url: payload.callback_url,
      },
      qris_info: {
        store_name: payload.store_name || 'DOKU Merchant',
        expired_time: payload.expired_time || 30, // Minutes
      },
    };

    return this.request('POST', DOKU_ENDPOINTS.QRIS_JOKUL, body);
  }

  /**
   * Initiates an E-Wallet payment (OVO, ShopeePay, DANA, LinkAja)
   * POST /e-wallet/v1/payment
   */
  public async createEwalletPayment(payload: EwalletPaymentRequest): Promise<unknown> {
    const body = {
      order: {
        invoice_number: payload.invoice_number,
        amount: payload.amount,
        callback_url: payload.callback_url,
      },
      e_wallet_info: {
        channel: payload.channel,
        phone_number: payload.phone_number,
      },
    };

    return this.request('POST', DOKU_ENDPOINTS.E_WALLET, body);
  }

  /**
   * Queries payment status for a specific invoice number
   * GET /orders/v1/status/:invoice_number
   */
  public async checkTransactionStatus(invoiceNumber: string): Promise<unknown> {
    const targetPath = `${DOKU_ENDPOINTS.STATUS}/${encodeURIComponent(invoiceNumber)}`;
    return this.request('GET', targetPath);
  }

  /**
   * Initiates an online refund for an existing transaction
   * POST /orders/v1/refund
   */
  public async processRefund(payload: RefundRequest): Promise<unknown> {
    const body = {
      order: {
        invoice_number: payload.invoice_number,
      },
      refund: {
        amount: payload.amount,
        reason: payload.reason,
      },
    };

    return this.request('POST', DOKU_ENDPOINTS.REFUND, body);
  }
}

