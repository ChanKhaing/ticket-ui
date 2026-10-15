import { useState, useEffect, useCallback } from 'react'
import {
  CreditCard,
  Ticket,
  MessageCircle,
  Bell,
  CheckCheck,
  AlertCircle,
  Trash2,
  RefreshCw,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { notificationsApi } from '@/features/users/services/notifications.api'
import { timeAgo } from '@/lib/utils'
import type { Notification, NotificationType } from '@/types'
import { toast } from 'sonner'

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'payment_success':
    case 'payment_failed':
      return <CreditCard className="h-5 w-5 text-indigo-600" />
    case 'ticket_issued':
      return <Ticket className="h-5 w-5 text-purple-600" />
    case 'support_reply':
    case 'support_resolved':
    case 'support_assigned':
      return <MessageCircle className="h-5 w-5 text-blue-600" />
    default:
      return <AlertCircle className="h-5 w-5 text-gray-600" />
  }
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await notificationsApi.getMine({ limit: 50, sort: '-createdAt' })
      setNotifications(res.data)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return
    try {
      await notificationsApi.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      )
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to mark as read')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })))
      toast.success('All notifications marked as read')
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to mark all as read')
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await notificationsApi.delete(id)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
      toast.success('Notification removed')
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete notification')
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead
    return true
  })

  // Categorize notifications
  const today = filteredNotifications.filter((n) => {
    const diffHours = (Date.now() - new Date(n.createdAt).getTime()) / (1000 * 3600)
    return diffHours < 24
  })

  const older = filteredNotifications.filter((n) => {
    const diffHours = (Date.now() - new Date(n.createdAt).getTime()) / (1000 * 3600)
    return diffHours >= 24
  })

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay updated with ticket orders, payment receipts and support responses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={handleMarkAllRead}
              className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'unread'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500 text-white px-1.5 py-0.2 text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {loading && notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-muted-foreground">
          <RefreshCw className="h-7 w-7 animate-spin text-indigo-600 mb-2" />
          <p className="text-sm">Loading your notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
          description={
            activeTab === 'unread'
              ? 'You have caught up with all your new updates'
              : "You don't have any notifications at the moment"
          }
        />
      ) : (
        <div className="space-y-6">
          {today.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
                Recent Updates (Last 24 Hours)
              </h3>
              <div className="space-y-2.5">
                {today.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleMarkAsRead(item._id, item.isRead)}
                    className={`group flex items-start gap-3.5 rounded-xl border bg-white p-4 shadow-xs transition-all cursor-pointer hover:bg-gray-50/80 ${
                      !item.isRead ? 'border-l-4 border-l-indigo-600 bg-indigo-50/25' : ''
                    }`}
                  >
                    <div className="rounded-lg bg-gray-100 p-2.5 mt-0.5 flex-shrink-0">
                      {getNotificationIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm ${!item.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                            {item.title}
                          </p>
                          {!item.isRead && (
                            <span className="h-2 w-2 rounded-full bg-indigo-600" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>
                      {item.body && (
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {item.body}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!item.isRead && (
                        <button
                          type="button"
                          title="Mark as read"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(item._id, false)
                          }}
                          className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Delete notification"
                        onClick={(e) => handleDelete(e, item._id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {older.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
                Earlier
              </h3>
              <div className="space-y-2.5">
                {older.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleMarkAsRead(item._id, item.isRead)}
                    className={`group flex items-start gap-3.5 rounded-xl border bg-white p-4 shadow-xs transition-all cursor-pointer hover:bg-gray-50/80 ${
                      !item.isRead ? 'border-l-4 border-l-indigo-600' : ''
                    }`}
                  >
                    <div className="rounded-lg bg-gray-100 p-2.5 mt-0.5 flex-shrink-0">
                      {getNotificationIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm ${!item.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                            {item.title}
                          </p>
                          {!item.isRead && (
                            <span className="h-2 w-2 rounded-full bg-indigo-600" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>
                      {item.body && (
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {item.body}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!item.isRead && (
                        <button
                          type="button"
                          title="Mark as read"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(item._id, false)
                          }}
                          className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Delete notification"
                        onClick={(e) => handleDelete(e, item._id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
