import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Eye, CreditCard } from 'lucide-react'
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
import { MOCK_ORDERS } from '@/data/mock'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Order } from '@/types'

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    const update = () => {
      const ms = new Date(expiresAt).getTime() - Date.now()
      if (ms <= 0) {
        setRemaining('Expired')
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
    <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
      ⏱ {remaining}
    </span>
  )
}

export function OrderListPage() {
  const navigate = useNavigate()
  const [orders] = useState<Order[]>(MOCK_ORDERS)

  return (
    <div>
      <PageHeader
        title="My Orders"
        subtitle="Track and manage your ticket orders"
        action={{ label: 'Browse Tickets', onClick: () => navigate('/tickets') }}
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders yet"
          description="Browse events and book your first tickets"
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
                <TableHead>Date / Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {order.orderCode}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.items.map((item) => (
                        <div key={item.ticketId} className="line-clamp-1">
                          {item.name} × {item.qty}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </div>
                    {order.status === 'pending' && (
                      <div className="mt-1">
                        <Countdown expiresAt={order.expiresAt} />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          asChild
                        >
                          <Link to={`/user/checkout/${order._id}`}>
                            <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                            Pay Now
                          </Link>
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
