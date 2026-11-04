/**
 * DOKU Payment Gateway API Constants
 * Strictly updated based on official specifications at https://developers.doku.com/
 */
declare const DOKU_SANDBOX_BASE_URL = "https://api-sandbox.doku.com";
declare const DOKU_PRODUCTION_BASE_URL = "https://api.doku.com";
declare const DOKU_SIMULATOR_URL = "https://sandbox.doku.com/gtw-config-v2/simulator";
declare const DOKU_ENDPOINTS: {
    readonly CHECKOUT_PAYMENT: "/checkout/v1/payment";
    readonly CHECKOUT_CANCEL: "/checkout/v3/cancellations";
    readonly VIRTUAL_ACCOUNT: "/doku-virtual-account/v2/payment-code";
    readonly QRIS_JOKUL: "/qris/v1/payment-code";
    readonly E_WALLET: "/e-wallet/v1/payment";
    readonly CREDIT_CARD: "/credit-card/v1/payment";
    readonly STATUS: "/orders/v1/status";
    readonly REFUND: "/orders/v1/refund";
    readonly SNAP_B2B_TOKEN: "/authorization/v1/access-token/b2b";
    readonly SNAP_QRIS_MPM: "/snap-adapter/b2b/v1.0/qr/qr-mpm-generate";
    readonly SNAP_VA_CREATE: "/virtual-accounts/bi-snap-va/v1.1/transfer-va/create-va";
};
declare const SUPPORTED_VA_BANKS: readonly ["BCA", "MANDIRI", "BRI", "BNI", "PERMATA", "DANAMON", "CIMB"];
type SupportedVaBank = (typeof SUPPORTED_VA_BANKS)[number];
declare const SUPPORTED_EWALLETS: readonly ["OVO", "SHOPEEPAY", "DANA", "LINKAJA"];
type SupportedEwallet = (typeof SUPPORTED_EWALLETS)[number];
declare const PAYMENT_METHOD_TYPES: readonly ["VIRTUAL_ACCOUNT_BCA", "VIRTUAL_ACCOUNT_BANK_MANDIRI", "VIRTUAL_ACCOUNT_BRI", "VIRTUAL_ACCOUNT_BNI", "VIRTUAL_ACCOUNT_PERMATA", "VIRTUAL_ACCOUNT_BANK_DANAMON", "VIRTUAL_ACCOUNT_CIMB", "QRIS", "OVO", "SHOPEE_PAY", "DANA", "LINKAJA", "CREDIT_CARD", "DIRECT_DEBIT_BRI", "KREDIVO", "AKULAKU", "INDODANA", "ALFAMART", "INDOMARET"];

interface DokuConfig {
    clientId: string;
    secretKey: string;
    privateKeyPem?: string;
    isProduction?: boolean;
}
interface JokulSignatureParams {
    clientId: string;
    secretKey: string;
    requestId: string;
    timestamp: string;
    targetPath: string;
    body?: object | string;
}
interface SnapAsymmetricSignatureParams {
    clientKey: string;
    timestamp: string;
    privateKeyPem: string;
}
interface SnapSignatureParams {
    httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
    endpointUrl: string;
    accessToken: string;
    secretKey: string;
    timestamp: string;
    body?: object | string;
}
interface WebhookVerificationParams {
    clientId: string;
    requestId: string;
    timestamp: string;
    targetPath: string;
    signature: string;
    secretKey: string;
    rawBody: string | object;
}
interface SnapWebhookVerificationParams {
    httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
    endpointUrl: string;
    accessToken?: string;
    timestamp: string;
    signature: string;
    secretKey: string;
    rawBody?: string | object;
}
interface CheckoutPaymentRequest {
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
interface CheckoutCancelRequest {
    invoice_number: string;
    original_request_id?: string;
    reason?: string;
}
interface VirtualAccountRequest {
    bank_code: SupportedVaBank;
    amount: number;
    invoice_number: string;
    customer_name: string;
    customer_email?: string;
    expired_time?: number;
    reusable_status?: boolean;
    info1?: string;
    info2?: string;
    info3?: string;
}
interface QrisPaymentRequest {
    amount: number;
    invoice_number: string;
    store_name?: string;
    expired_time?: number;
    callback_url?: string;
}
interface SnapQrisPaymentRequest {
    partnerReferenceNo: string;
    amount: {
        value: string;
        currency: string;
    };
    merchantId?: string;
    terminalId?: string;
    validityPeriod?: string;
    additionalInfo?: Record<string, unknown>;
}
interface EwalletPaymentRequest {
    channel: SupportedEwallet;
    amount: number;
    invoice_number: string;
    phone_number?: string;
    callback_url?: string;
    return_url?: string;
}
interface StatusInquiryRequest {
    invoice_number: string;
}
interface RefundRequest {
    invoice_number: string;
    amount: number;
    reason: string;
    refund_id?: string;
}
interface SnapB2bTokenResponse {
    responseCode: string;
    responseMessage: string;
    accessToken: string;
    tokenType: string;
    expiresIn: string | number;
}

/**
 * Returns UTC ISO8601 timestamp string strictly without milliseconds (e.g. 2026-08-09T00:00:00Z)
 */
declare function generateDokuTimestamp(date?: Date): string;
/**
 * Calculates Base64-encoded SHA-256 Digest of the payload for Jokul API v2
 */
declare function calculateDigest(body?: object | string): string;
/**
 * Constructs Jokul API v2 Component String and computes HMAC-SHA256 Signature
 * Formula:
 * Client-Id:<CLIENT_ID>\nRequest-Id:<REQUEST_ID>\nRequest-Timestamp:<TIMESTAMP>\nRequest-Target:<TARGET_PATH>[\nDigest:<DIGEST>]
 */
declare function calculateJokulSignature(params: JokulSignatureParams): {
    digest: string;
    componentString: string;
    signature: string;
};
/**
 * Generates SNAP BI Asymmetric Signature (SHA256withRSA) for Get Token B2B API
 * Endpoint: POST /authorization/v1/access-token/b2b
 * Formula: stringToSign = X-CLIENT-KEY + "|" + X-TIMESTAMP
 * Signed with Merchant RSA Private Key (PKCS#8 / PKCS#1 PEM)
 */
declare function calculateSnapAsymmetricSignature(params: SnapAsymmetricSignatureParams): {
    stringToSign: string;
    signature: string;
};
/**
 * Constructs SNAP BI API v1.0 Symmetric String-to-Sign and computes HMAC-SHA512 Signature
 * Formula:
 * HTTPMethod + ":" + EndpointUrl + ":" + AccessToken + ":" + Lowercase(HexEncode(SHA-256(minify(RequestBody)))) + ":" + Timestamp
 * Note: AccessToken is strictly WITHOUT the 'Bearer ' prefix
 */
declare function calculateSnapSignature(params: SnapSignatureParams): {
    minifiedBodyHash: string;
    stringToSign: string;
    signature: string;
};
/**
 * Validates incoming HTTP Webhook Signature with timing-safe comparison (Jokul v2)
 */
declare function verifyWebhookSignature(params: WebhookVerificationParams): boolean;
/**
 * Validates incoming SNAP BI Symmetric Webhook / Notification Signature with timingSafeEqual
 */
declare function verifySnapWebhookSignature(params: SnapWebhookVerificationParams): boolean;

declare class DokuClient {
    private clientId;
    private secretKey;
    private privateKeyPem?;
    private baseUrl;
    private isProduction;
    private http;
    constructor(config?: Partial<DokuConfig>);
    getEnvironment(): {
        isProduction: boolean;
        baseUrl: string;
        hasCredentials: boolean;
        hasPrivateKey: boolean;
    };
    /**
     * Internal helper to execute authenticated Jokul API v2 requests
     */
    private request;
    /**
     * Requests a SNAP BI B2B Access Token using Asymmetric RSA-SHA256 signature
     * Endpoint: POST /authorization/v1/access-token/b2b
     */
    getSnapB2bToken(customPrivateKeyPem?: string): Promise<SnapB2bTokenResponse>;
    /**
     * Generates a dynamic QRIS code conforming to SNAP BI Standard
     * Endpoint: POST /snap-adapter/b2b/v1.0/qr/qr-mpm-generate
     */
    createSnapQrisPayment(payload: SnapQrisPaymentRequest, accessToken: string): Promise<unknown>;
    /**
     * Generates a DOKU Checkout Payment Link
     * POST /checkout/v1/payment
     */
    createCheckoutPayment(payload: CheckoutPaymentRequest): Promise<unknown>;
    /**
     * Cancels an unpaid DOKU Checkout order
     * POST /checkout/v3/cancellations
     */
    cancelCheckoutOrder(payload: CheckoutCancelRequest): Promise<unknown>;
    /**
     * Issues a direct Bank Virtual Account
     * POST /doku-virtual-account/v2/payment-code
     */
    createVirtualAccount(payload: VirtualAccountRequest): Promise<unknown>;
    /**
     * Generates a dynamic QRIS payment code (Jokul v2 Standard)
     * POST /qris/v1/payment-code
     */
    createQrisPayment(payload: QrisPaymentRequest): Promise<unknown>;
    /**
     * Initiates an E-Wallet payment (OVO, ShopeePay, DANA, LinkAja)
     * POST /e-wallet/v1/payment
     */
    createEwalletPayment(payload: EwalletPaymentRequest): Promise<unknown>;
    /**
     * Queries payment status for a specific invoice number
     * GET /orders/v1/status/:invoice_number
     */
    checkTransactionStatus(invoiceNumber: string): Promise<unknown>;
    /**
     * Initiates an online refund for an existing transaction
     * POST /orders/v1/refund
     */
    processRefund(payload: RefundRequest): Promise<unknown>;
}

declare const allTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            invoice_number: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            private_key_pem: {
                type: string;
                description: string;
            };
            partner_reference_no?: undefined;
            amount_value?: undefined;
            access_token?: undefined;
            merchant_id?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            partner_reference_no: {
                type: string;
                description: string;
            };
            amount_value: {
                type: string;
                description: string;
            };
            access_token: {
                type: string;
                description: string;
            };
            merchant_id: {
                type: string;
                description: string;
            };
            private_key_pem?: undefined;
        };
        required: string[];
    };
})[];

export { type CheckoutCancelRequest, type CheckoutPaymentRequest, DOKU_ENDPOINTS, DOKU_PRODUCTION_BASE_URL, DOKU_SANDBOX_BASE_URL, DOKU_SIMULATOR_URL, DokuClient, type DokuConfig, type EwalletPaymentRequest, type JokulSignatureParams, PAYMENT_METHOD_TYPES, type QrisPaymentRequest, type RefundRequest, SUPPORTED_EWALLETS, SUPPORTED_VA_BANKS, type SnapAsymmetricSignatureParams, type SnapB2bTokenResponse, type SnapQrisPaymentRequest, type SnapSignatureParams, type SnapWebhookVerificationParams, type StatusInquiryRequest, type SupportedEwallet, type SupportedVaBank, type VirtualAccountRequest, type WebhookVerificationParams, allTools, calculateDigest, calculateJokulSignature, calculateSnapAsymmetricSignature, calculateSnapSignature, generateDokuTimestamp, verifySnapWebhookSignature, verifyWebhookSignature };
