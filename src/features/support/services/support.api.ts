import axiosInstance from '@/lib/axios';
import type { SupportTicket, SupportMessage, SupportStatus, SupportPriority, SupportCategory } from '@/types';

export interface CreateSupportInput {
  subject: string;
  description: string;
  category?: SupportCategory;
  priority?: SupportPriority;
  orderId?: string;
  purchasedTicketId?: string;
}

export interface QuerySupportInput {
  page?: number;
  limit?: number;
  status?: SupportStatus;
  priority?: SupportPriority;
  category?: SupportCategory;
}

export interface PaginatedSupportResponse {
  tickets: SupportTicket[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function normalizeSupportTicket(raw: any): SupportTicket {
  return {
    _id: raw._id || raw.id || '',
    ticketCode: raw.ticketCode || '',
    subject: raw.subject || '',
    description: raw.description || '',
    category: (raw.category as SupportCategory) || 'other',
    status: (raw.status as SupportStatus) || 'open',
    priority: (raw.priority as SupportPriority) || 'medium',
    customerId: typeof raw.customerId === 'object' && raw.customerId !== null ? raw.customerId._id : raw.customerId || '',
    agentId: typeof raw.agentId === 'object' && raw.agentId !== null ? raw.agentId._id : raw.agentId,
    messageCount: Number(raw.messageCount || 0),
    resolvedAt: raw.resolvedAt,
    closedAt: raw.closedAt,
    resolutionNote: raw.resolutionNote,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export function normalizeSupportMessage(raw: any): SupportMessage {
  return {
    _id: raw._id || raw.id || '',
    supportTicketId: raw.supportTicketId || raw.ticketId || '',
    senderId: typeof raw.senderId === 'object' && raw.senderId !== null ? raw.senderId._id : raw.senderId || '',
    senderRole: raw.senderRole || 'customer',
    body: raw.body || raw.message || '',
    isInternal: Boolean(raw.isInternal),
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export const supportApi = {
  /**
   * Customer: Create support ticket
   */
  async createTicket(dto: CreateSupportInput): Promise<SupportTicket> {
    const res = await axiosInstance.post('/support-tickets', dto);
    const data = res.data?.data ?? res.data;
    return normalizeSupportTicket(data);
  },

  /**
   * Customer: Get my support tickets
   */
  async getMyTickets(query?: QuerySupportInput): Promise<PaginatedSupportResponse> {
    const res = await axiosInstance.get('/support-tickets/me', { params: query });
    const payload = res.data;
    const rawList = payload?.data ?? [];
    return {
      tickets: Array.isArray(rawList) ? rawList.map(normalizeSupportTicket) : [],
      page: Number(payload?.page || 1),
      limit: Number(payload?.limit || rawList.length),
      total: Number(payload?.total || rawList.length),
      totalPages: Number(payload?.totalPages || 1),
      hasNext: Boolean(payload?.hasNext),
      hasPrev: Boolean(payload?.hasPrev),
    };
  },

  /**
   * Admin / Agent: Get all support tickets
   */
  async getAdminTickets(query?: QuerySupportInput): Promise<PaginatedSupportResponse> {
    const res = await axiosInstance.get('/support-tickets', { params: query });
    const payload = res.data;
    const rawList = payload?.data ?? [];
    return {
      tickets: Array.isArray(rawList) ? rawList.map(normalizeSupportTicket) : [],
      page: Number(payload?.page || 1),
      limit: Number(payload?.limit || rawList.length),
      total: Number(payload?.total || rawList.length),
      totalPages: Number(payload?.totalPages || 1),
      hasNext: Boolean(payload?.hasNext),
      hasPrev: Boolean(payload?.hasPrev),
    };
  },

  /**
   * Get single ticket detail
   */
  async getTicketById(id: string): Promise<SupportTicket> {
    const res = await axiosInstance.get(`/support-tickets/${id}`);
    const data = res.data?.data ?? res.data;
    return normalizeSupportTicket(data);
  },

  /**
   * Get messages for a ticket
   */
  async getMessages(id: string): Promise<SupportMessage[]> {
    const res = await axiosInstance.get(`/support-tickets/${id}/messages`, { params: { limit: 100 } });
    const payload = res.data;
    const rawList = payload?.data ?? [];
    return Array.isArray(rawList) ? rawList.map(normalizeSupportMessage) : [];
  },

  /**
   * Send a reply message
   */
  async addReply(id: string, body: string, isInternal = false): Promise<SupportMessage> {
    const res = await axiosInstance.post(`/support-tickets/${id}/replies`, {
      body,
      isInternal,
    });
    const data = res.data?.data ?? res.data;
    return normalizeSupportMessage(data);
  },

  /**
   * Update status (agent/admin)
   */
  async updateStatus(id: string, status: SupportStatus, resolutionNote?: string): Promise<SupportTicket> {
    const res = await axiosInstance.patch(`/support-tickets/${id}/status`, { status, resolutionNote });
    const data = res.data?.data ?? res.data;
    return normalizeSupportTicket(data);
  },

  /**
   * Update priority (agent/admin)
   */
  async updatePriority(id: string, priority: SupportPriority): Promise<SupportTicket> {
    const res = await axiosInstance.patch(`/support-tickets/${id}/priority`, { priority });
    const data = res.data?.data ?? res.data;
    return normalizeSupportTicket(data);
  },

  /**
   * Assign agent (agent/admin)
   */
  async assignAgent(id: string, agentId: string): Promise<SupportTicket> {
    const res = await axiosInstance.patch(`/support-tickets/${id}/assign`, { agentId });
    const data = res.data?.data ?? res.data;
    return normalizeSupportTicket(data);
  },

  /**
   * Resolve ticket
   */
  async resolveTicket(id: string, resolutionNote?: string): Promise<SupportTicket> {
    const res = await axiosInstance.post(`/support-tickets/${id}/resolve`, { resolutionNote });
    const data = res.data?.data ?? res.data;
    return normalizeSupportTicket(data);
  },

  /**
   * Close ticket
   */
  async closeTicket(id: string, resolutionNote?: string): Promise<SupportTicket> {
    const res = await axiosInstance.post(`/support-tickets/${id}/close`, { resolutionNote });
    const data = res.data?.data ?? res.data;
    return normalizeSupportTicket(data);
  },
};
