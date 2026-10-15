import { useState, useMemo, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronRight, Search, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'
import { ordersApi } from '../services/orders.api'
import { toast } from 'sonner'

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await ordersApi.getAdminOrders({
        limit: 100,
        status: statusFilter !== 'all' ? (statusFilter as OrderStatus) : undefined,
      })
      setOrders(res.orders)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to load platform orders')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Orders Management"
          subtitle="Monitor platform purchases, fulfillment statuses, and detailed line items"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          disabled={loading}
          className="gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

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
        {loading ? (
          <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin text-indigo-600" />
            Loading platform orders from database...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Order Code</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items Count</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                    No orders found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => {
                  const isExpanded = expandedOrders.includes(order._id)
                  const totalItems = order.items.reduce((acc, i) => acc + i.qty, 0)

                  return (
                    <tbody key={order._id}>
                      <TableRow
                        className="cursor-pointer hover:bg-gray-50/80"
                        onClick={() => toggleExpand(order._id)}
                      >
                        <TableCell>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-gray-900">
                          {order.orderCode}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono text-muted-foreground">
                            {typeof order.userId === 'string' ? order.userId.slice(-6) : 'User'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {totalItems} {totalItems === 1 ? 'ticket' : 'tickets'}
                        </TableCell>
                        <TableCell className="font-bold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDateTime(order.createdAt)}
                        </TableCell>
                      </TableRow>

                      {/* Expanded Line Items */}
                      {isExpanded && (
                        <TableRow className="bg-gray-50/50">
                          <TableCell colSpan={7} className="p-4">
                            <div className="rounded-lg border bg-white p-3 space-y-2">
                              <span className="text-xs font-bold text-gray-700 tracking-wider uppercase block">
                                Line Items
                              </span>
                              <div className="divide-y text-xs">
                                {order.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between py-2"
                                  >
                                    <div>
                                      <span className="font-medium text-gray-900">
                                        {item.name}
                                      </span>
                                      <span className="text-muted-foreground ml-2">
                                        ({formatCurrency(item.price)} × {item.qty})
                                      </span>
                                    </div>
                                    <span className="font-semibold text-gray-900">
                                      {formatCurrency(item.subtotal)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </tbody>
                  )
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
