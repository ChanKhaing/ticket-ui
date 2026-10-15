import axiosInstance from '@/lib/axios';
import type { PurchasedTicket } from '@/types';

export function normalizePurchasedTicket(raw: any): PurchasedTicket {
  return {
    _id: raw._id || raw.id || '',
    code: raw.code || '',
    qrPayload: raw.qrPayload || raw.code || '',
    ticketId: typeof raw.ticketId === 'object' && raw.ticketId !== null ? raw.ticketId._id : raw.ticketId || '',
    ticketName: raw.ticketName || 'Event Ticket',
    userId: typeof raw.userId === 'object' && raw.userId !== null ? raw.userId._id : raw.userId || '',
    orderId: typeof raw.orderId === 'object' && raw.orderId !== null ? raw.orderId._id : raw.orderId || '',
    price: Number(raw.price || 0),
    currency: raw.currency || 'MMK',
    status: raw.status || 'issued',
    issuedAt: raw.issuedAt || raw.createdAt || new Date().toISOString(),
    usedAt: raw.usedAt,
    cancelledAt: raw.cancelledAt,
    createdAt: raw.createdAt || raw.issuedAt || new Date().toISOString(),
  };
}

export const purchasedTicketsApi = {
  /**
   * Get all digital entry passes for the logged-in customer
   */
  async getMyTickets(): Promise<PurchasedTicket[]> {
    const res = await axiosInstance.get('/purchased-tickets/me');
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data.map(normalizePurchasedTicket) : [];
  },

  /**
   * Get a single digital entry pass with QR code data
   */
  async getTicketById(id: string): Promise<PurchasedTicket> {
    const res = await axiosInstance.get(`/purchased-tickets/${id}`);
    const data = res.data?.data ?? res.data;
    return normalizePurchasedTicket(data);
  },

  /**
   * Cancel an unredeemed purchased ticket
   */
  async cancelTicket(id: string, reason?: string): Promise<PurchasedTicket> {
    const res = await axiosInstance.patch(`/purchased-tickets/${id}/cancel`, { reason });
    const data = res.data?.data ?? res.data;
    return normalizePurchasedTicket(data);
  },

  /**
   * Staff/Agent: Validate ticket QR
   */
  async validateQr(code: string, qrPayload: string): Promise<{ valid: boolean; ticket: PurchasedTicket }> {
    const res = await axiosInstance.post('/purchased-tickets/validate', { code, qrPayload });
    const data = res.data?.data ?? res.data;
    return data;
  },

  /**
   * Staff/Agent: Redeem ticket at event entrance
   */
  async redeemTicket(code: string): Promise<{ message: string; ticket: PurchasedTicket }> {
    const res = await axiosInstance.post('/purchased-tickets/redeem', { code });
    const data = res.data?.data ?? res.data;
    return data;
  },
};
