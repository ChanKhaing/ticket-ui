import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Ticket as TicketIcon, QrCode, Calendar, MapPin, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatCurrency, formatDate } from '@/lib/utils'
import { purchasedTicketsApi } from '../services/purchased-tickets.api'
import type { PurchasedTicket } from '@/types'
import { toast } from 'sonner'

export function MyTicketsPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<PurchasedTicket[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const data = await purchasedTicketsApi.getMyTickets()
      setTickets(data)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to load purchased tickets')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="My Purchased Tickets"
          subtitle="View and download entry passes with digital QR codes for your events"
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
            onClick={() => navigate('/tickets')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Browse More Events
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-sm">Loading your digital tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No purchased tickets yet"
          description="You haven't bought any event tickets yet. Explore events and book your digital pass."
          action={{ label: 'Explore Events', onClick: () => navigate('/tickets') }}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((t) => (
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
                      <span>Myanmar</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-bold text-gray-900">{formatCurrency(t.price)}</p>
                </div>
                <Button size="sm" asChild className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Link to={`/user/tickets/${t._id}`}>
                    <QrCode className="h-4 w-4" />
                    View QR Pass
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
