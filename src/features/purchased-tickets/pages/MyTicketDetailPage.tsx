import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, XCircle, RefreshCw, Ticket as TicketIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { QRCodeDisplay } from '@/components/shared/QRCodeDisplay'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatCurrency, formatDate } from '@/lib/utils'
import { purchasedTicketsApi } from '../services/purchased-tickets.api'
import type { PurchasedTicket } from '@/types'
import { toast } from 'sonner'

export function MyTicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [ticket, setTicket] = useState<PurchasedTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    purchasedTicketsApi
      .getTicketById(id)
      .then((data) => setTicket(data))
      .catch((err: any) => {
        toast.error(err.response?.data?.error?.message || 'Failed to load ticket details')
        setTicket(null)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleCancelTicket = async () => {
    if (!ticket) return
    setCancelling(true)
    try {
      const updated = await purchasedTicketsApi.cancelTicket(
        ticket._id,
        'Cancelled by ticket holder',
      )
      setTicket(updated)
      toast.success('Ticket has been cancelled successfully')
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to cancel ticket')
    } finally {
      setCancelling(false)
      setCancelOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <RefreshCw className="h-10 w-10 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm text-muted-foreground">Loading digital pass & QR code...</p>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="rounded-xl border bg-white p-8">
          <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <h2 className="text-xl font-bold text-gray-900">Ticket not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This ticket could not be found or you may not have access to it.
          </p>
          <Button className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
            <Link to="/user/tickets">Go to My Tickets</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl py-6">
      <Button variant="ghost" size="sm" className="mb-4 gap-1.5" asChild>
        <Link to="/user/tickets">
          <ArrowLeft className="h-4 w-4" />
          Back to My Tickets
        </Link>
      </Button>

      <div className="rounded-2xl border bg-white p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Digital Event Pass
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">{ticket.ticketName}</h1>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        {/* QR Code Section */}
        <div className="my-8 flex flex-col items-center justify-center">
          <div className="p-4 rounded-xl border bg-white shadow-xs">
            <QRCodeDisplay
              value={ticket.qrPayload || ticket.code}
              size={220}
              fileName={`${ticket.code}.png`}
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Entry Pass Code
            </p>
            <p className="font-mono text-xl font-bold tracking-widest text-indigo-600 mt-0.5">
              {ticket.code}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Present this QR code at the event gate for check-in scan
            </p>
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm border">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4 text-indigo-500" />
              Issued Date
            </span>
            <span className="font-medium text-gray-900">{formatDate(ticket.issuedAt)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4 text-indigo-500" />
              Venue
            </span>
            <span className="font-medium text-gray-900">Myanmar Event Ground</span>
          </div>

          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-bold text-indigo-600">{formatCurrency(ticket.price)}</span>
          </div>
        </div>

        {/* Action Button */}
        {ticket.status === 'issued' && (
          <div className="mt-6 pt-4 border-t">
            <Button
              variant="outline"
              disabled={cancelling}
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setCancelOpen(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              {cancelling ? 'Cancelling...' : 'Cancel Ticket'}
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel Ticket"
        description="Are you sure you want to cancel this ticket? Once cancelled, this digital QR pass cannot be used for event entry."
        confirmLabel="Yes, Cancel Ticket"
        danger
        onConfirm={handleCancelTicket}
      />
    </div>
  )
}
