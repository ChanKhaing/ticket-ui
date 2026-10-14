import { useState } from 'react'
import {
  CreditCard,
  Ticket,
  MessageCircle,
  Bell,
  CheckCheck,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { MOCK_NOTIFICATIONS } from '@/data/mock'
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
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    )
  }

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    toast.success('All notifications marked as read')
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Categorize notifications
  const today = notifications.filter((n) => {
    const diffHours = (Date.now() - new Date(n.createdAt).getTime()) / (1000 * 3600)
    return diffHours < 24
  })

  const older = notifications.filter((n) => {
    const diffHours = (Date.now() - new Date(n.createdAt).getTime()) / (1000 * 3600)
    return diffHours >= 24
  })

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay updated with ticket sales, order payments and support messages
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="gap-1.5"
          >
            <CheckCheck className="h-4 w-4 text-indigo-600" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up with your updates"
        />
      ) : (
        <div className="space-y-6">
          {today.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
                Recent Updates
              </h3>
              <div className="space-y-2">
                {today.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleMarkAsRead(item._id)}
                    className={`flex items-start gap-3.5 rounded-xl border bg-white p-4 shadow-xs transition-all cursor-pointer hover:bg-gray-50/80 ${
                      !item.isRead ? 'border-l-4 border-l-indigo-600 bg-indigo-50/20' : ''
                    }`}
                  >
                    <div className="rounded-lg bg-gray-100 p-2.5 mt-0.5">
                      {getNotificationIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm ${!item.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                          {item.title}
                        </p>
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
              <div className="space-y-2">
                {older.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleMarkAsRead(item._id)}
                    className={`flex items-start gap-3.5 rounded-xl border bg-white p-4 shadow-xs transition-all cursor-pointer hover:bg-gray-50/80 ${
                      !item.isRead ? 'border-l-4 border-l-indigo-600' : ''
                    }`}
                  >
                    <div className="rounded-lg bg-gray-100 p-2.5 mt-0.5">
                      {getNotificationIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm ${!item.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                          {item.title}
                        </p>
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
