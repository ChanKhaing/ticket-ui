import axiosInstance from '@/lib/axios'

export interface AuditLogItem {
  timestamp: string
  actor_id?: string
  actor_email?: string
  actor_role?: string
  action: string
  target?: string
  target_id?: string
  method?: string
  path?: string
  ip?: string
  user_agent?: string
  status_code?: number
}

export interface ActivityLogItem {
  timestamp: string
  user_id?: string
  user?: string
  event_type?: string
  eventType?: string
  entity?: string
  entity_id?: string
  payload?: any
}

export interface QueryAuditLogsParams {
  actorId?: string
  action?: string
  target?: string
  from?: string
  to?: string
  limit?: number
  offset?: number
}

export interface QueryActivityLogsParams {
  userId?: string
  eventType?: string
  entity?: string
  from?: string
  to?: string
  limit?: number
  offset?: number
}

export const logsApi = {
  /**
   * Query ClickHouse audit logs
   */
  async getAuditLogs(params?: QueryAuditLogsParams): Promise<{ data: AuditLogItem[]; total: number }> {
    const res = await axiosInstance.get('/admin/logs/audit', { params })
    const payload = res.data
    const data: AuditLogItem[] = payload?.data ?? []
    const total = payload?.meta?.total ?? data.length
    return { data, total }
  },

  /**
   * Query ClickHouse activity logs
   */
  async getActivityLogs(params?: QueryActivityLogsParams): Promise<{ data: ActivityLogItem[]; total: number }> {
    const res = await axiosInstance.get('/admin/logs/activity', { params })
    const payload = res.data
    const data: ActivityLogItem[] = payload?.data ?? []
    const total = payload?.meta?.total ?? data.length
    return { data, total }
  },
}
