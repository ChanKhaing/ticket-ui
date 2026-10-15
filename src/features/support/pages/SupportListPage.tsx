import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Headphones, MessageSquarePlus, Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { timeAgo } from '@/lib/utils'
import { supportApi } from '../services/support.api'
import type { SupportTicket, SupportStatus } from '@/types'
import { toast } from 'sonner'

export function SupportListPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await supportApi.getMyTickets({
        status: filter !== 'all' ? (filter as SupportStatus) : undefined,
      })
      setTickets(res.tickets)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to load support tickets')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="My Support Tickets"
          subtitle="Get help with payments, tickets, or your account"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTickets}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => navigate('/user/support/new')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-sm">Loading support tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={Headphones}
          title="No support tickets"
          description="You don't have any support requests in this status."
          action={{
            label: 'Submit a Support Ticket',
            onClick: () => navigate('/user/support/new'),
          }}
        />
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Link
              key={t._id}
              to={`/user/support/${t._id}`}
              className="block rounded-xl border bg-white p-5 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {t.ticketCode}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-muted-foreground capitalize">
                      {t.category}
                    </span>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate text-base">{t.subject}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {t.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <StatusBadge status={t.status} />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{timeAgo(t.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
