/**
 * DOKU Payment Gateway API Constants
 * Conforming to Jokul API v2 & SNAP API v1.0 specifications
 */

export const DOKU_SANDBOX_BASE_URL = 'https://api-sandbox.doku.com';
export const DOKU_PRODUCTION_BASE_URL = 'https://api.doku.com';

export const DOKU_SIMULATOR_URL = 'https://sandbox.doku.com/gtw-config-v2/simulator';

export const DOKU_ENDPOINTS = {
  CHECKOUT_PAYMENT: '/checkout/v1/payment',
  CHECKOUT_CANCEL: '/checkout/v3/cancellations',
  VIRTUAL_ACCOUNT: '/doku-virtual-account/v2/payment-code',
  QRIS_JOKUL: '/qris/v1/payment-code',
  QRIS_SNAP: '/snap-adapter/b2b/v1.0/qr/qr-mpm-generate',
  E_WALLET: '/e-wallet/v1/payment',
  CREDIT_CARD: '/credit-card/v1/payment',
  STATUS: '/orders/v1/status',
  REFUND: '/orders/v1/refund',
} as const;

export const SUPPORTED_VA_BANKS = [
  'BCA',
  'MANDIRI',
  'BRI',
  'BNI',
  'PERMATA',
  'DANAMON',
  'CIMB',
] as const;

export type SupportedVaBank = (typeof SUPPORTED_VA_BANKS)[number];

export const SUPPORTED_EWALLETS = [
  'OVO',
  'SHOPEEPAY',
  'DANA',
  'LINKAJA',
] as const;

export type SupportedEwallet = (typeof SUPPORTED_EWALLETS)[number];

export const PAYMENT_METHOD_TYPES = [
  'VIRTUAL_ACCOUNT_BCA',
  'VIRTUAL_ACCOUNT_BANK_MANDIRI',
  'VIRTUAL_ACCOUNT_BRI',
  'VIRTUAL_ACCOUNT_BNI',
  'VIRTUAL_ACCOUNT_PERMATA',
  'VIRTUAL_ACCOUNT_BANK_DANAMON',
  'VIRTUAL_ACCOUNT_CIMB',
  'QRIS',
  'OVO',
  'SHOPEE_PAY',
  'DANA',
  'LINKAJA',
  'CREDIT_CARD',
  'DIRECT_DEBIT_BRI',
  'KREDIVO',
  'AKULAKU',
  'INDODANA',
  'ALFAMART',
  'INDOMARET',
] as const;

