import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Calendar, MapPin, Ticket } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { MOCK_TICKETS } from '@/data/mock'
import { formatCurrency, formatDate } from '@/lib/utils'

const CATEGORIES = ['All', 'Concert', 'Workshop', 'Festival', 'Sports', 'Other']
const PAGE_SIZE = 6

export function TicketBrowsePage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return MOCK_TICKETS.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
      if (category !== 'All' && t.category !== category) return false
      if (minPrice && t.price < Number(minPrice)) return false
      if (maxPrice && t.price > Number(maxPrice)) return false
      return true
    })
  }, [search, category, minPrice, maxPrice])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Events</h1>
          <p className="mt-1 text-muted-foreground">Find and book tickets for amazing events</p>
        </div>

        {/* Filter bar */}
        <div className="mb-6 flex flex-wrap gap-3 rounded-xl border bg-white p-4 shadow-sm">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1) }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Min price"
            type="number"
            className="w-28"
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); setPage(1) }}
          />
          <Input
            placeholder="Max price"
            type="number"
            className="w-28"
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setPage(1) }}
          />
        </div>

        {/* Grid */}
        {paged.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No tickets found"
            description="Try adjusting your search or filters"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((ticket) => {
              const isSoldOut = ticket.status === 'sold_out'
              return (
                <div
                  key={ticket._id}
                  className="relative rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Image placeholder */}
                  <div className="relative h-44 bg-gradient-to-br from-indigo-400 to-purple-500">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Ticket className="h-12 w-12 text-white/60" />
                    </div>
                    {isSoldOut && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60">
                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-700">
                          SOLD OUT
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={ticket.status} />
                    </div>
                    {ticket.category && (
                      <div className="absolute top-3 left-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {ticket.category}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{ticket.name}</h3>
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(ticket.eventDate)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Myanmar</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-indigo-600">
                        {formatCurrency(ticket.price)}
                      </span>
                      <span className={`text-xs font-medium ${isSoldOut ? 'text-red-500' : 'text-green-600'}`}>
                        {isSoldOut ? 'Sold Out' : `Available: ${ticket.quantity - ticket.sold}`}
                      </span>
                    </div>
                    <Button
                      className="mt-4 w-full"
                      variant={isSoldOut ? 'outline' : 'default'}
                      disabled={isSoldOut}
                      asChild={!isSoldOut}
                    >
                      {isSoldOut ? (
                        <span>Sold Out</span>
                      ) : (
                        <Link to={`/tickets/${ticket._id}`}>View Details</Link>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
