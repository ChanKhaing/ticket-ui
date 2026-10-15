import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Calendar, MapPin, Tag, Ticket, Minus, Plus, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/context/AuthContext'
import { ticketsApi } from '@/features/tickets/services/tickets.api'
import type { Ticket as TicketType } from '@/types'

export function TicketDetailPublicPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [ticket, setTicket] = useState<TicketType | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    ticketsApi
      .getTicketById(id)
      .then((data) => setTicket(data))
      .catch((err: any) => {
        toast.error(err.response?.data?.error?.message || 'Failed to load ticket details')
        setTicket(null)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <RefreshCw className="h-10 w-10 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm text-muted-foreground">Loading event details from database...</p>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Ticket className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Ticket not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This event may have been cancelled, unlisted, or does not exist.
        </p>
        <Button className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
          <Link to="/tickets">Back to Events</Link>
        </Button>
      </div>
    )
  }

  const available = ticket.quantity - ticket.sold
  const isSoldOut = ticket.status === 'sold_out' || available <= 0
  const total = ticket.price * qty

  const handleBuy = () => {
    if (!user) {
      toast.error('Please login to purchase tickets')
      navigate('/login')
      return
    }
    // Navigate to order/checkout step with ticket and qty state
    toast.success(`Selected ${qty} ticket(s) for ${ticket.name}`)
    navigate('/user/orders', { state: { ticketId: ticket._id, quantity: qty } })
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Button variant="ghost" size="sm" className="mb-6 gap-1.5" asChild>
          <Link to="/tickets">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: Image + info */}
          <div className="lg:col-span-3">
            {/* Image banner */}
            <div className="relative h-72 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center overflow-hidden">
              {ticket.images && ticket.images.length > 0 ? (
                <img
                  src={ticket.images[0]}
                  alt={ticket.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Ticket className="h-24 w-24 text-white/50" />
              )}
              {isSoldOut && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-bold text-xl tracking-wider border-2 border-white px-6 py-2 rounded-lg">
                    SOLD OUT
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={isSoldOut ? 'sold_out' : ticket.status} />
                {ticket.category && (
                  <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-semibold text-indigo-700">
                    {ticket.category}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900">{ticket.name}</h1>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  <span>{formatDate(ticket.eventDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-500" />
                  <span>Myanmar</span>
                </div>
              </div>

              {ticket.description && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1.5">About this event</h3>
                  <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                    {ticket.description}
                  </p>
                </div>
              )}

              {ticket.tags && ticket.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  {ticket.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border bg-gray-50 px-2.5 py-0.5 text-xs text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Sticky Booking Card */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Ticket Reservation</h2>

              <div className="mt-4 flex items-baseline justify-between border-b pb-4">
                <span className="text-sm text-muted-foreground">Price per ticket</span>
                <span className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(ticket.price)}
                </span>
              </div>

              {/* Quantity selector */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Quantity</span>
                  <span className="text-xs text-muted-foreground">
                    {available} available
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-2">
                  <span className="text-xs text-muted-foreground pl-2">Select tickets</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={qty <= 1 || isSoldOut}
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-8 text-center font-bold text-base">{qty}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={qty >= available || isSoldOut}
                      onClick={() => setQty((q) => Math.min(available, q + 1))}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-5 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Subtotal ({qty} × {formatCurrency(ticket.price)})</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-gray-900 pt-1">
                  <span>Total Due</span>
                  <span className="text-indigo-600">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* CTA */}
              <Button
                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11"
                disabled={isSoldOut}
                onClick={handleBuy}
              >
                {isSoldOut ? 'Sold Out' : 'Proceed to Checkout'}
              </Button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                <span>Instant confirmation & digital QR pass</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
