import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { MOCK_ORDERS } from '@/data/mock'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { Order } from '@/types'

export function AdminOrdersPage() {
  const [orders] = useState<Order[]>(MOCK_ORDERS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch = o.orderCode.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || o.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [orders, search, statusFilter])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders Management"
        subtitle="Monitor customer purchases, fulfillment statuses and detailed line items"
      />

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 rounded-xl border bg-white p-4 shadow-xs">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order code..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Order Code</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Summary Items</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((order) => {
              const isExpanded = expandedOrders.includes(order._id)
              return (
                <>
                  <TableRow
                    key={order._id}
                    className="cursor-pointer hover:bg-gray-50/80"
                    onClick={() => toggleExpand(order._id)}
                  >
                    <TableCell>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-indigo-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-gray-900">
                      {order.orderCode}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      User ({order.userId})
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.items.length} item(s)
                    </TableCell>
                    <TableCell className="font-bold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </TableCell>
                  </TableRow>

                  {/* Expanded Item Row */}
                  {isExpanded && (
                    <TableRow className="bg-indigo-50/30">
                      <TableCell colSpan={7} className="p-4 pl-14">
                        <div className="space-y-2 rounded-lg border bg-white p-3 shadow-xs">
                          <p className="text-xs font-semibold uppercase text-muted-foreground">
                            Order Items Breakdown
                          </p>
                          <div className="divide-y text-sm">
                            {order.items.map((item) => (
                              <div
                                key={item.ticketId}
                                className="flex items-center justify-between py-2"
                              >
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {item.name}
                                  </span>
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    × {item.qty}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-900">
                                  {formatCurrency(item.subtotal)}
                                </span>
                              </div>
                            ))}
                          </div>
                          {order.cancelReason && (
                            <p className="text-xs text-red-600 pt-1">
                              Reason: {order.cancelReason}
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
