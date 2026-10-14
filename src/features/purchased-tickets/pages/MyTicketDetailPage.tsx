import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { QRCodeDisplay } from '@/components/shared/QRCodeDisplay'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { MOCK_PURCHASED } from '@/data/mock'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export function MyTicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [ticketStatus, setTicketStatus] = useState<string | null>(null)

  const ticket = MOCK_PURCHASED.find((t) => t._id === id) || MOCK_PURCHASED[0]
  const currentStatus = ticketStatus || ticket.status

  const handleCancelTicket = () => {
    setTicketStatus('cancelled')
    setCancelOpen(false)
    toast.success('Ticket has been cancelled successfully')
  }

  return (
    <div className="mx-auto max-w-xl">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/user/tickets">
          <ArrowLeft className="mr-2 h-4 w-4" />
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
          <StatusBadge status={currentStatus} />
        </div>

        {/* QR Code Section */}
        <div className="my-8 flex flex-col items-center justify-center">
          <QRCodeDisplay
            value={ticket.qrPayload}
            size={200}
            fileName={`${ticket.code}.png`}
          />
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">Ticket Code</p>
            <p className="font-mono text-xl font-bold tracking-widest text-indigo-600">
              {ticket.code}
            </p>
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm border">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4 text-indigo-500" />
              Event Date
            </span>
            <span className="font-medium text-gray-900">{formatDate(ticket.issuedAt)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4 text-indigo-500" />
              Venue
            </span>
            <span className="font-medium text-gray-900">Grand Arena, Yangon</span>
          </div>

          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-bold text-gray-900">{formatCurrency(ticket.price)}</span>
          </div>
        </div>

        {/* Action Button */}
        {currentStatus === 'issued' && (
          <div className="mt-6 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setCancelOpen(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Ticket
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel Ticket"
        description="Are you sure you want to cancel this ticket? Once cancelled, it cannot be used for entry."
        confirmLabel="Yes, Cancel Ticket"
        danger
        onConfirm={handleCancelTicket}
      />
    </div>
  )
}
