import axiosInstance from '@/lib/axios';

export interface PaymentRecord {
  _id: string;
  paymentCode: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  paidAt?: string;
  failureReason?: string;
}

export const paymentsApi = {
  /**
   * Initiate payment session for an order
   */
  async initiatePayment(orderId: string, idempotencyKey?: string): Promise<PaymentRecord> {
    const res = await axiosInstance.post('/payments', { orderId, idempotencyKey });
    return res.data?.data ?? res.data;
  },

  /**
   * Confirm payment (mock success/fail)
   */
  async confirmPayment(
    paymentId: string,
    outcome: 'success' | 'fail',
    failureReason?: string,
  ): Promise<PaymentRecord> {
    const res = await axiosInstance.patch(`/payments/${paymentId}/confirm`, {
      outcome,
      failureReason,
    });
    return res.data?.data ?? res.data;
  },

  /**
   * Get user's payment records
   */
  async getMyPayments(): Promise<PaymentRecord[]> {
    const res = await axiosInstance.get('/payments/me');
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data : [];
  },
};
