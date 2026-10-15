import axiosInstance from '@/lib/axios';
import type { Order, OrderStatus } from '@/types';

export interface OrderItemInput {
  ticketId: string;
  qty: number;
}

export interface CreateOrderInput {
  items: OrderItemInput[];
  note?: string;
}

export interface QueryOrdersInput {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  sort?: string;
}

export interface PaginatedOrdersResponse {
  orders: Order[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function normalizeOrder(raw: any): Order {
  return {
    _id: raw._id || raw.id || '',
    orderCode: raw.orderCode || '',
    userId: typeof raw.userId === 'object' && raw.userId !== null ? raw.userId._id : raw.userId || '',
    items: Array.isArray(raw.items)
      ? raw.items.map((item: any) => ({
          ticketId: typeof item.ticketId === 'object' && item.ticketId !== null ? item.ticketId._id : item.ticketId || '',
          name: item.name || '',
          price: Number(item.price || 0),
          qty: Number(item.qty || 1),
          subtotal: Number(item.subtotal || item.price * item.qty || 0),
        }))
      : [],
    totalAmount: Number(raw.totalAmount || 0),
    currency: raw.currency || 'MMK',
    status: (raw.status as OrderStatus) || 'pending',
    expiresAt: raw.expiresAt || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    paidAt: raw.paidAt,
    cancelledAt: raw.cancelledAt,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export const ordersApi = {
  /**
   * Create an order with reserved tickets
   */
  async createOrder(dto: CreateOrderInput): Promise<Order> {
    const res = await axiosInstance.post('/orders', dto);
    const data = res.data?.data ?? res.data;
    return normalizeOrder(data);
  },

  /**
   * Get logged-in user's orders
   */
  async getMyOrders(query?: QueryOrdersInput): Promise<PaginatedOrdersResponse> {
    const res = await axiosInstance.get('/orders/me', { params: query });
    const payload = res.data;
    const rawList = payload?.data ?? [];
    return {
      orders: Array.isArray(rawList) ? rawList.map(normalizeOrder) : [],
      page: Number(payload?.page || 1),
      limit: Number(payload?.limit || rawList.length),
      total: Number(payload?.total || rawList.length),
      totalPages: Number(payload?.totalPages || 1),
      hasNext: Boolean(payload?.hasNext),
      hasPrev: Boolean(payload?.hasPrev),
    };
  },

  /**
   * Get order by ID (self or admin)
   */
  async getOrderById(id: string): Promise<Order> {
    const res = await axiosInstance.get(`/orders/${id}`);
    const data = res.data?.data ?? res.data;
    return normalizeOrder(data);
  },

  /**
   * Cancel order
   */
  async cancelOrder(id: string, reason?: string): Promise<Order> {
    const res = await axiosInstance.patch(`/orders/${id}/cancel`, { reason });
    const data = res.data?.data ?? res.data;
    return normalizeOrder(data);
  },

  /**
   * Admin: List all orders across platform
   */
  async getAdminOrders(query?: QueryOrdersInput): Promise<PaginatedOrdersResponse> {
    const res = await axiosInstance.get('/orders', { params: query });
    const payload = res.data;
    const rawList = payload?.data ?? [];
    return {
      orders: Array.isArray(rawList) ? rawList.map(normalizeOrder) : [],
      page: Number(payload?.page || 1),
      limit: Number(payload?.limit || rawList.length),
      total: Number(payload?.total || rawList.length),
      totalPages: Number(payload?.totalPages || 1),
      hasNext: Boolean(payload?.hasNext),
      hasPrev: Boolean(payload?.hasPrev),
    };
  },
};
