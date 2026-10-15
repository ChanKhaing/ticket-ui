import axiosInstance from '@/lib/axios'
import type { Notification, NotificationType } from '@/types'

export interface QueryNotificationsParams {
  page?: number
  limit?: number
  type?: NotificationType
  isRead?: boolean
  sort?: string
}

export interface PaginatedNotificationsResponse {
  data: Notification[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext?: boolean
    hasPrev?: boolean
  }
}

export const notificationsApi = {
  /**
   * Get paginated notifications for current user
   */
  async getMine(params?: QueryNotificationsParams): Promise<PaginatedNotificationsResponse> {
    const query: Record<string, any> = {}
    if (params?.page) query.page = params.page
    if (params?.limit) query.limit = params.limit
    if (params?.type) query.type = params.type
    if (params?.isRead !== undefined) query.isRead = String(params.isRead)
    if (params?.sort) query.sort = params.sort

    const res = await axiosInstance.get('/notifications/me', { params: query })
    const payload = res.data
    const rawData: Notification[] = payload?.data ?? []
    const meta = payload?.meta ?? {
      page: 1,
      limit: rawData.length,
      total: rawData.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    }

    return { data: rawData, meta }
  },

  /**
   * Get unread notifications count for current user
   */
  async getUnreadCount(): Promise<number> {
    const res = await axiosInstance.get('/notifications/me/unread-count')
    const payload = res.data?.data ?? res.data
    return typeof payload?.unread === 'number' ? payload.unread : 0
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    const res = await axiosInstance.patch(`/notifications/me/${id}/read`)
    return res.data?.data ?? res.data
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ updated: number }> {
    const res = await axiosInstance.patch('/notifications/me/read-all')
    return res.data?.data ?? res.data
  },

  /**
   * Delete a notification
   */
  async delete(id: string): Promise<{ message: string }> {
    const res = await axiosInstance.delete(`/notifications/me/${id}`)
    return res.data?.data ?? res.data
  },
}
