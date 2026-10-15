import axiosInstance from '@/lib/axios';
import type { Ticket, TicketStatus } from '@/types';

export interface QueryTicketsInput {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  q?: string;
  category?: string;
  status?: TicketStatus;
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateTicketInput {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  eventDate: string;
  quantity: number;
  category?: string;
  tags?: string[];
  images?: string[];
}

export interface UpdateTicketInput {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  eventDate?: string;
  quantity?: number;
  category?: string;
  tags?: string[];
  images?: string[];
}

export interface PaginatedTicketsResponse {
  tickets: Ticket[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function normalizeTicket(raw: any): Ticket {
  return {
    _id: raw._id || raw.id || '',
    name: raw.name || '',
    description: raw.description || '',
    price: Number(raw.price || 0),
    currency: raw.currency || 'MMK',
    eventDate: raw.eventDate || new Date().toISOString(),
    quantity: Number(raw.quantity || 0),
    sold: Number(raw.sold || 0),
    status: (raw.status as TicketStatus) || 'draft',
    category: raw.category || '',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    images: Array.isArray(raw.images) ? raw.images : [],
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export const ticketsApi = {
  /**
   * Public: List tickets with filter & pagination
   */
  async getTickets(query?: QueryTicketsInput): Promise<PaginatedTicketsResponse> {
    const res = await axiosInstance.get('/tickets', { params: query });
    const payload = res.data;
    const rawList = payload?.data ?? [];
    return {
      tickets: Array.isArray(rawList) ? rawList.map(normalizeTicket) : [],
      page: Number(payload?.page || 1),
      limit: Number(payload?.limit || rawList.length),
      total: Number(payload?.total || rawList.length),
      totalPages: Number(payload?.totalPages || 1),
      hasNext: Boolean(payload?.hasNext),
      hasPrev: Boolean(payload?.hasPrev),
    };
  },

  /**
   * Public: Get ticket details by ID
   */
  async getTicketById(id: string): Promise<Ticket> {
    const res = await axiosInstance.get(`/tickets/${id}`);
    const data = res.data?.data ?? res.data;
    return normalizeTicket(data);
  },

  /**
   * Public: Check real-time ticket availability
   */
  async checkAvailability(id: string, qty = 1): Promise<{ available: boolean; remaining: number }> {
    const res = await axiosInstance.get(`/tickets/${id}/availability`, { params: { qty } });
    return res.data?.data ?? res.data;
  },

  /**
   * Admin: Create a new ticket
   */
  async createTicket(dto: CreateTicketInput): Promise<Ticket> {
    const res = await axiosInstance.post('/tickets', dto);
    const data = res.data?.data ?? res.data;
    return normalizeTicket(data);
  },

  /**
   * Admin: Update ticket details
   */
  async updateTicket(id: string, dto: UpdateTicketInput): Promise<Ticket> {
    const res = await axiosInstance.patch(`/tickets/${id}`, dto);
    const data = res.data?.data ?? res.data;
    return normalizeTicket(data);
  },

  /**
   * Admin: Update price
   */
  async updatePrice(id: string, price: number): Promise<Ticket> {
    const res = await axiosInstance.patch(`/tickets/${id}/price`, { price });
    const data = res.data?.data ?? res.data;
    return normalizeTicket(data);
  },

  /**
   * Admin: Publish ticket
   */
  async publishTicket(id: string): Promise<Ticket> {
    const res = await axiosInstance.patch(`/tickets/${id}/publish`);
    const data = res.data?.data ?? res.data;
    return normalizeTicket(data);
  },

  /**
   * Admin: Unpublish ticket (back to draft)
   */
  async unpublishTicket(id: string): Promise<Ticket> {
    const res = await axiosInstance.patch(`/tickets/${id}/unpublish`);
    const data = res.data?.data ?? res.data;
    return normalizeTicket(data);
  },

  /**
   * Admin: Cancel ticket
   */
  async cancelTicket(id: string): Promise<Ticket> {
    const res = await axiosInstance.patch(`/tickets/${id}/cancel`);
    const data = res.data?.data ?? res.data;
    return normalizeTicket(data);
  },

  /**
   * Admin: Delete ticket (only if sold === 0)
   */
  async deleteTicket(id: string): Promise<{ message: string }> {
    const res = await axiosInstance.delete(`/tickets/${id}`);
    return res.data?.data ?? res.data;
  },
};
