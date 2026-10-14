import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Calendar, MapPin, Tag, Ticket, Minus, Plus, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { MOCK_TICKETS } from '@/data/mock'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/context/AuthContext'

export function TicketDetailPublicPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [qty, setQty] = useState(1)

  const ticket = MOCK_TICKETS.find((t) => t._id === id)

  if (!ticket) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Ticket className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Ticket not found</h2>
        <Button className="mt-4" asChild>
          <Link to="/tickets">Back to Browse</Link>
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
    toast.success(`Order placed for ${qty} ticket(s)! Redirecting to checkout...`)
    // In real app, create order then navigate to checkout
    setTimeout(() => navigate('/user/orders'), 1500)
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link to="/tickets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: Image + info */}
          <div className="lg:col-span-3">
            {/* Image placeholder */}
            <div className="h-72 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center">
              <Ticket className="h-20 w-20 text-white/60" />
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={ticket.status} />
                {ticket.category && (
                  <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-700">
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
                <p className="text-gray-700 leading-relaxed">{ticket.description}</p>
              )}

              {ticket.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {ticket.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Purchase card */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-4">
                <p className="text-3xl font-bold text-indigo-600">{formatCurrency(ticket.price)}</p>
                <p className="text-sm text-muted-foreground">per ticket</p>
              </div>

              <div className="mb-4 rounded-lg bg-gray-50 px-3 py-2 text-sm">
                {isSoldOut ? (
                  <span className="font-medium text-red-600">No tickets available</span>
                ) : (
                  <span className="text-green-600 font-medium">
                    {available} tickets remaining
                  </span>
                )}
              </div>

              {!isSoldOut && (
                <>
                  {/* Qty selector */}
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-medium">Quantity</p>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={qty <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold text-lg">{qty}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQty((q) => Math.min(available, q + 1))}
                        disabled={qty >= available}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="mb-6 flex items-center justify-between border-t pt-4">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-bold text-indigo-600">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </>
              )}

              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                size="lg"
                disabled={isSoldOut}
                onClick={handleBuy}
              >
                {isSoldOut ? 'Sold Out' : 'Buy Now'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
