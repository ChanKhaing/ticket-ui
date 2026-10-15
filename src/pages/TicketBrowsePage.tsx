import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Calendar, MapPin, Ticket, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ticketsApi } from '@/features/tickets/services/tickets.api'
import type { Ticket as TicketType } from '@/types'
import { toast } from 'sonner'

const CATEGORIES = ['All', 'Concert', 'Workshop', 'Festival', 'Sports', 'Other']
const PAGE_SIZE = 6

export function TicketBrowsePage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTickets, setTotalTickets] = useState(0)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await ticketsApi.getTickets({
        page,
        limit: PAGE_SIZE,
        q: search.trim() || undefined,
        category: category !== 'All' ? category : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      })
      setTickets(res.tickets)
      setTotalPages(res.totalPages || 1)
      setTotalTickets(res.total)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [page, search, category, minPrice, maxPrice])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets()
    }, 250)
    return () => clearTimeout(timer)
  }, [fetchTickets])

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Events</h1>
            <p className="mt-1 text-muted-foreground">
              Find and book tickets for live concerts, conferences, and workshops
            </p>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            {totalTickets} {totalTickets === 1 ? 'event' : 'events'} available
          </div>
        </div>

        {/* Filter bar */}
        <div className="mb-6 flex flex-wrap gap-3 rounded-xl border bg-white p-4 shadow-sm">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by event title or keyword..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Min price"
            type="number"
            className="w-28"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value)
              setPage(1)
            }}
          />
          <Input
            placeholder="Max price"
            type="number"
            className="w-28"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value)
              setPage(1)
            }}
          />
          {(search || category !== 'All' || minPrice || maxPrice) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('')
                setCategory('All')
                setMinPrice('')
                setMaxPrice('')
                setPage(1)
              }}
              className="text-xs text-muted-foreground hover:text-indigo-600"
            >
              Reset Filters
            </Button>
          )}
        </div>

        {/* Grid or Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-muted-foreground">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm">Loading events from database...</p>
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No tickets found"
            description="Try adjusting your search filters or check back later for new events."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket) => {
              const isSoldOut = ticket.status === 'sold_out' || ticket.quantity - ticket.sold <= 0
              return (
                <div
                  key={ticket._id}
                  onClick={() => navigate(`/tickets/${ticket._id}`)}
                  className="group cursor-pointer relative flex flex-col rounded-xl border bg-white shadow-sm hover:shadow-md hover:border-indigo-400 transition-all overflow-hidden"
                >
                  {/* Image placeholder or real image */}
                  <div className="relative h-44 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                    {ticket.images && ticket.images.length > 0 ? (
                      <img
                        src={ticket.images[0]}
                        alt={ticket.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Ticket className="h-12 w-12 text-white/50 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    )}
                    {ticket.category && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-xs">
                        {ticket.category}
                      </span>
                    )}
                    <div className="absolute right-3 top-3">
                      <StatusBadge status={isSoldOut ? 'sold_out' : ticket.status} />
                    </div>
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold text-lg tracking-wider border-2 border-white px-4 py-1.5 rounded-md">
                          SOLD OUT
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-5">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {ticket.name}
                    </h3>

                    <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                        <span>{formatDate(ticket.eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                        <span>Myanmar</span>
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-gray-600 line-clamp-2">
                      {ticket.description || 'Join this exciting live experience.'}
                    </p>

                    <div className="mt-auto pt-4 border-t flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground">From</span>
                        <div className="font-bold text-indigo-600 text-lg">
                          {formatCurrency(ticket.price)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-muted-foreground block">
                          {ticket.quantity - ticket.sold} left
                        </span>
                        <Button
                          asChild
                          size="sm"
                          disabled={isSoldOut}
                          className="mt-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          <Link to={`/tickets/${ticket._id}`}>
                            {isSoldOut ? 'Sold Out' : 'View Details'}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
