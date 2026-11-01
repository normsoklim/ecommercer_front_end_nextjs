import { apiFetch } from './api';

/** The address the order is shipped to, it mirrors the API DTO. */
export type ShippingAddressInput = {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  phone: string;
};

/** A discount (coupon) of the customer, the amounts are in minor units. */
export type Discount = {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usageCount?: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/** The order that was created by the checkout, the amounts are in minor units. */
export type CheckoutOrder = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  createdAt: string;
};

export type PaymentState =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

/** A payment of the API, the amount is in minor units. */
export type Payment = {
  id: string;
  orderId: string;
  provider: string;
  status: PaymentState;
  amount: number;
  currency: string;
  qrString?: string | null;
  expiresAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
};

/**
 * The KHQR payment of the API. Beside the payment record it carries the
 * rendered QR code and the amount in major units (the value that is shown
 * inside the QR code).
 */
export type KhqrPayment = Payment & {
  qrCodeImage?: string | null;
  amountInMajorUnits?: number;
  originalAmount?: number;
  originalCurrency?: string;
};

/** The status of a KHQR payment, it also tells if the QR code is still valid. */
export type KhqrPaymentStatus = {
  payment: Payment;
  isExpired: boolean;
  canVerify: boolean;
};

/** The result of a verification attempt against the Bakong API. */
export type KhqrVerificationResult = {
  success: boolean;
  payment: Payment;
  message: string;
  verificationStatus?: string;
};

export type PaymentCurrency = 'USD' | 'KHR';

/** Converts an amount in minor units from one currency to another.
 * 1 USD = 4000 KHR, so 1 USD cent equals 40 KHR. KHR is not subdivided. */
export function convertAmount(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  if (fromCurrency === 'USD' && toCurrency === 'KHR') {
    return Math.round(amount * 40);
  }

  if (fromCurrency === 'KHR' && toCurrency === 'USD') {
    return Math.round(amount / 40);
  }

  throw new Error(`Unsupported currency conversion from ${fromCurrency} to ${toCurrency}`);
}

/**
 * Reads a single discount by its code, the customer can look it up while the
 * checkout is still open. Throws when the code is unknown or not usable.
 */
export function fetchDiscountByCode(code: string): Promise<Discount> {
  return apiFetch<Discount>(`/discounts/code/${encodeURIComponent(code)}`);
}

/**
 * Reads the list of available (active) discounts the customer can pick from
 * the checkout coupon select.
 */
export function fetchDiscounts(): Promise<Discount[]> {
  return apiFetch<Discount[]>(`/discounts/available`);
}

/**
 * Places the order of the current cart. The API answers with the created
 * order, the cart is emptied and the stock is reserved on the server.
 * The session cookie is sent automatically by the browser.
 */
export function createCheckout(
  input: {
    shippingAddress: ShippingAddressInput;
    couponCode?: string;
    idempotencyKey?: string;
  },
): Promise<CheckoutOrder> {
  return apiFetch<CheckoutOrder>('/checkout', {
    method: 'POST',
    body: JSON.stringify({
      shippingAddress: input.shippingAddress,
      couponCode: input.couponCode?.trim() ? input.couponCode.trim() : undefined,
      idempotencyKey: input.idempotencyKey,
    }),
  });
}

/**
 * Creates the KHQR payment of an order. The amount is calculated by the API
 * from the order, only the currency of the QR code is chosen by the customer.
 */
export function createKhqrPayment(
  input: {
    orderId: string;
    currency: PaymentCurrency;
    idempotencyKey?: string;
  },
): Promise<KhqrPayment> {
  return apiFetch<KhqrPayment>('/payments/khqr', {
    method: 'POST',
    body: JSON.stringify({
      orderId: input.orderId,
      provider: 'BAKONG_KHQR',
      currency: input.currency,
      idempotencyKey: input.idempotencyKey,
    }),
  });
}

/** Reads the current state of a KHQR payment. */
export function fetchKhqrPaymentStatus(
  paymentId: string,
): Promise<KhqrPaymentStatus> {
  return apiFetch<KhqrPaymentStatus>(
    `/payments/${paymentId}/khqr-status`,
  );
}

/** Asks the Bakong API whether the payment of the QR code was made. */
export function verifyKhqrPayment(
  paymentId: string,
  transactionHash?: string,
): Promise<KhqrVerificationResult> {
  return apiFetch<KhqrVerificationResult>(
    `/payments/${paymentId}/verify-khqr`,
    {
      method: 'POST',
      body: JSON.stringify({ transactionHash }),
    },
  );
}
