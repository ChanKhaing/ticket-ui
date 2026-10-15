import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Eye, CreditCard, RefreshCw, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Order } from '@/types'
import { ordersApi } from '../services/orders.api'
import { toast } from 'sonner'

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const update = () => {
      const ms = new Date(expiresAt).getTime() - Date.now()
      if (ms <= 0) {
        setRemaining('Expired')
        setIsExpired(true)
        return
      }
      const m = Math.floor(ms / 60000)
      const s = Math.floor((ms % 60000) / 1000)
      setRemaining(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  return (
    <span
      className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
        isExpired
          ? 'text-gray-500 bg-gray-100'
          : 'text-orange-600 bg-orange-50 animate-pulse'
      }`}
    >
      ⏱ {remaining}
    </span>
  )
}

export function OrderListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null)
  const [creatingFromState, setCreatingFromState] = useState(false)

  // Fetch orders from backend
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await ordersApi.getMyOrders({ limit: 50 })
      setOrders(res.orders)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to load your orders')
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-create order if redirected from TicketDetail
  useEffect(() => {
    const state = location.state as { ticketId?: string; quantity?: number } | undefined
    if (state?.ticketId && state?.quantity && !creatingFromState) {
      setCreatingFromState(true)
      toast.loading('Creating order reservation...')
      ordersApi
        .createOrder({
          items: [{ ticketId: state.ticketId, qty: state.quantity }],
        })
        .then((newOrder) => {
          toast.dismiss()
          toast.success('Order created! Please complete payment within 15 minutes.')
          // Clear history state to avoid loop
          navigate(`/checkout/${newOrder._id}`, { replace: true })
        })
        .catch((err: any) => {
          toast.dismiss()
          toast.error(err.response?.data?.error?.message || 'Failed to reserve tickets')
          fetchOrders()
        })
    } else {
      fetchOrders()
    }
  }, [location.state, navigate, fetchOrders, creatingFromState])

  // Cancel order
  const handleCancelOrder = async () => {
    if (!cancellingOrder) return
    try {
      const cancelled = await ordersApi.cancelOrder(
        cancellingOrder._id,
        'Cancelled by customer',
      )
      setOrders((prev) =>
        prev.map((o) => (o._id === cancellingOrder._id ? cancelled : o)),
      )
      toast.success(`Order ${cancelled.orderCode} cancelled and tickets released`)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to cancel order')
    } finally {
      setCancellingOrder(null)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="My Orders"
          subtitle="Track, pay, and review your event ticket orders"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
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
            Browse Tickets
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-sm">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders found"
          description="Browse events and book your first tickets now."
          action={{ label: 'Browse Tickets', onClick: () => navigate('/tickets') }}
        />
      ) : (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Code</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Timer / Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const isPending = order.status === 'pending'
                const isPaid = order.status === 'paid'

                return (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono text-xs font-semibold text-gray-900">
                      {order.orderCode}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        {order.items.map((i, idx) => (
                          <div key={idx} className="text-xs text-gray-700">
                            {i.name} <span className="text-muted-foreground">× {i.qty}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      {isPending ? (
                        <Countdown expiresAt={order.expiresAt} />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(order.paidAt || order.createdAt)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isPending && (
                          <>
                            <Button
                              size="sm"
                              className="h-8 gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                              asChild
                            >
                              <Link to={`/checkout/${order._id}`}>
                                <CreditCard className="h-3.5 w-3.5" />
                                Pay Now
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setCancellingOrder(order)}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        {isPaid && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1 border-green-200 text-green-700 bg-green-50/50 hover:bg-green-100"
                            asChild
                          >
                            <Link to="/user/tickets">
                              <Eye className="h-3.5 w-3.5" />
                              View Tickets
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Cancel Confirm Dialog */}
      <ConfirmDialog
        open={!!cancellingOrder}
        onOpenChange={(o) => !o && setCancellingOrder(null)}
        title="Cancel Order"
        description={`Are you sure you want to cancel order ${cancellingOrder?.orderCode}? Reserved tickets will be released.`}
        confirmLabel="Cancel Order"
        danger
        onConfirm={handleCancelOrder}
      />
    </div>
  )
}
