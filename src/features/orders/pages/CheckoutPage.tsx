import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, ArrowLeft, ShieldCheck, Ticket as TicketIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { MOCK_ORDERS } from '@/data/mock'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

export function CheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const order = MOCK_ORDERS.find((o) => o._id === orderId) || MOCK_ORDERS[0]

  const handleConfirmPayment = async () => {
    setLoading(true)
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setIsSuccess(true)
    toast.success('Payment completed successfully!')
  }

  const handleCancelPayment = () => {
    toast.info('Payment cancelled')
    navigate('/user/orders')
  }

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
          <p className="mt-2 text-muted-foreground">
            Your tickets are ready. An email confirmation and QR code have been issued.
          </p>

          <div className="my-6 rounded-xl bg-gray-50 p-4 text-left border">
            <div className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">Order Code</span>
              <span className="font-mono font-medium">{order.orderCode}</span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-bold text-indigo-600">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg" asChild>
              <Link to="/user/tickets">
                <TicketIcon className="mr-2 h-4 w-4" />
                View My Tickets
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/user/orders">Back to Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/user/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
      </Button>

      <PageHeader
        title="Checkout & Payment"
        subtitle={`Order: ${order.orderCode}`}
      />

      <div className="space-y-6">
        {/* Order Summary Card */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 border-b pb-3">Order Summary</h3>
          <div className="divide-y">
            {order.items.map((item) => (
              <div key={item.ticketId} className="flex justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.qty} × {formatCurrency(item.price)}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t pt-4 text-lg font-bold">
            <span>Total Amount</span>
            <span className="text-indigo-600">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Payment Action Section */}
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground pb-2 border-b">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <span>Secure Mock Payment System</span>
          </div>

          <h3 className="font-semibold text-gray-900">Confirm Payment</h3>
          <p className="text-sm text-muted-foreground">
            Click confirm below to complete the transaction and instantly generate your digital event tickets.
          </p>

          <div className="pt-2 space-y-3">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-base"
              onClick={handleConfirmPayment}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing payment...
                </span>
              ) : (
                '✅ Confirm Payment'
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleCancelPayment}
              disabled={loading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
