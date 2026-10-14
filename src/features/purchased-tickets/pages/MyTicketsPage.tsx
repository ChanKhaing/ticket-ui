import { Link, useNavigate } from 'react-router-dom'
import { Ticket as TicketIcon, QrCode, Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { MOCK_PURCHASED } from '@/data/mock'
import { formatCurrency, formatDate } from '@/lib/utils'

export function MyTicketsPage() {
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader
        title="My Purchased Tickets"
        subtitle="View and download entry passes for your upcoming events"
        action={{
          label: 'Browse More Events',
          onClick: () => navigate('/tickets'),
        }}
      />

      {MOCK_PURCHASED.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No purchased tickets"
          description="You haven't bought any event tickets yet"
          action={{ label: 'Explore Events', onClick: () => navigate('/tickets') }}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_PURCHASED.map((t) => (
            <div
              key={t._id}
              className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
                    {t.code}
                  </span>
                  <StatusBadge status={t.status} />
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{t.ticketName}</h3>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Issued: {formatDate(t.issuedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Yangon, Myanmar</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-bold text-gray-900">{formatCurrency(t.price)}</p>
                </div>
                <Button size="sm" asChild className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
                  <Link to={`/user/tickets/${t._id}`}>
                    <QrCode className="h-4 w-4" />
                    View QR
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
