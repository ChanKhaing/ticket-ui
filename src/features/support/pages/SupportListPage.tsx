import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Headphones, MessageSquarePlus, Clock, MessageCircle } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { MOCK_SUPPORT } from '@/data/mock'
import { timeAgo } from '@/lib/utils'

export function SupportListPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const filteredTickets = MOCK_SUPPORT.filter((t) => {
    if (filter === 'all') return true
    if (filter === 'open') return t.status === 'open'
    if (filter === 'in_progress') return t.status === 'in_progress'
    if (filter === 'resolved') return t.status === 'resolved'
    if (filter === 'closed') return t.status === 'closed'
    return true
  })

  return (
    <div>
      <PageHeader
        title="My Support Tickets"
        subtitle="Get help with payments, tickets, or your account"
        action={{
          label: 'New Ticket',
          onClick: () => navigate('/user/support/new'),
          icon: <MessageSquarePlus className="h-4 w-4" />,
        }}
      />

      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredTickets.length === 0 ? (
        <EmptyState
          icon={Headphones}
          title="No support tickets"
          description="You don't have any tickets in this status"
          action={{
            label: 'Submit a Support Ticket',
            onClick: () => navigate('/user/support/new'),
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((t) => (
            <Link
              key={t._id}
              to={`/user/support/${t._id}`}
              className="block rounded-xl border bg-white p-5 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {t.ticketCode}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 capitalize">
                    {t.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              </div>

              <div className="mt-3">
                <h3 className="font-semibold text-gray-900">{t.subject}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{t.description}</p>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground pt-2">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {t.lastMessageAt ? timeAgo(t.lastMessageAt) : 'Recently'}
                </span>
                <span className="flex items-center gap-1 font-medium text-gray-600">
                  <MessageCircle className="h-3.5 w-3.5 text-indigo-500" />
                  {t.messageCount} messages
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
