import axiosInstance from '@/lib/axios';

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  tickets: {
    total: number;
    published: number;
    draft: number;
  };
  orders: {
    total: number;
    pending: number;
    paid: number;
  };
  payments: {
    total: number;
    successful: number;
    failed: number;
    totalRevenue: number;
    currency: string;
  };
  purchasedTickets: {
    total: number;
    used: number;
    unused: number;
  };
  support: {
    total: number;
    open: number;
    closed: number;
  };
}

export interface ActivityLogItem {
  id: string;
  eventType: string;
  user: string;
  entity: string;
  timestamp: string;
}

export const dashboardApi = {
  /**
   * Get live platform metrics and aggregated revenue
   */
  async getStats(): Promise<DashboardStats> {
    const res = await axiosInstance.get('/admin/dashboard/stats');
    return res.data?.data ?? res.data;
  },

  /**
   * Get recent activity logs
   */
  async getRecentActivity(limit = 10): Promise<ActivityLogItem[]> {
    try {
      const res = await axiosInstance.get('/admin/dashboard/recent-activity', { params: { limit } });
      const rows = res.data?.data ?? [];
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((r: any, idx: number) => ({
          id: String(idx + 1),
          eventType: r.event_type || 'ACTIVITY',
          user: r.user_id ? `User ...${r.user_id.slice(-6)}` : 'System',
          entity: r.entity || 'General',
          timestamp: r.timestamp || new Date().toISOString(),
        }));
      }
      return [];
    } catch {
      return [];
    }
  },
};
