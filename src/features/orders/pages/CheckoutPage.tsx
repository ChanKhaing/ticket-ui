import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, ArrowLeft, ShieldCheck, Ticket as TicketIcon, RefreshCw, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { ordersApi } from '../services/orders.api'
import { paymentsApi } from '@/features/payments/services/payments.api'
import type { Order } from '@/types'

export function CheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'kpay' | 'wave' | 'card'>('kpay')

  // Load real order
  useEffect(() => {
    if (!orderId) return
    setLoading(true)
    ordersApi
      .getOrderById(orderId)
      .then((data) => {
        setOrder(data)
        if (data.status === 'paid' || data.status === 'completed') {
          setIsSuccess(true)
        }
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.error?.message || 'Failed to load order')
        setOrder(null)
      })
      .finally(() => setLoading(false))
  }, [orderId])

  // Confirm Payment with Backend Payment Engine
  const handleConfirmPayment = async () => {
    if (!order) return
    setProcessing(true)
    try {
      // Step 1: Initiate Payment Session in Backend
      const payment = await paymentsApi.initiatePayment(order._id)

      // Step 2: Confirm Payment (Mock Successful Transaction)
      await paymentsApi.confirmPayment(payment._id, 'success')

      // Step 3: Success state!
      setIsSuccess(true)
      toast.success('Payment completed! Your digital tickets have been issued.')
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Payment processing failed')
    } finally {
      setProcessing(false)
    }
  }

  const handleCancelPayment = async () => {
    if (!order) return
    try {
      await ordersApi.cancelOrder(order._id, 'Customer cancelled during checkout')
      toast.info('Order cancelled and reserved tickets released')
      navigate('/user/orders')
    } catch {
      navigate('/user/orders')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <RefreshCw className="h-10 w-10 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm text-muted-foreground">Loading checkout order session...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="rounded-xl border bg-white p-8">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
          <h2 className="text-xl font-bold text-gray-900">Order not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This order may have expired or been removed.
          </p>
          <Button className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
            <Link to="/user/orders">Go to My Orders</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your tickets are ready. Digital QR passes have been generated in your account.
          </p>

          <div className="my-6 rounded-xl bg-gray-50 p-4 text-left border">
            <div className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">Order Code</span>
              <span className="font-mono font-medium">{order.orderCode}</span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-bold text-indigo-600">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">Fulfillment</span>
              <span className="text-green-700 font-medium">Instant Digital Delivery</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" size="lg" asChild>
              <Link to="/user/tickets">
                <TicketIcon className="mr-2 h-4 w-4" />
                View My Tickets & QR
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
    <div className="mx-auto max-w-2xl py-6">
      <Button variant="ghost" size="sm" className="mb-4 gap-1.5" asChild>
        <Link to="/user/orders">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
      </Button>

      <PageHeader
        title="Complete Checkout"
        subtitle={`Order ${order.orderCode} — Tickets reserved`}
      />

      <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm space-y-6">
        {/* Order Items */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
            Reserved Tickets
          </h3>
          <div className="divide-y rounded-lg border bg-gray-50/50">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 text-sm">
                <div>
                  <span className="font-medium text-gray-900 block">{item.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(item.price)} × {item.qty}
                  </span>
                </div>
                <div className="font-bold text-gray-900">
                  {formatCurrency(item.subtotal)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
            Select Payment Method
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('kpay')}
              className={`p-3 rounded-lg border text-center transition-all ${
                paymentMethod === 'kpay'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="font-bold text-xs text-blue-700">KBZPay</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Instant Pay</div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('wave')}
              className={`p-3 rounded-lg border text-center transition-all ${
                paymentMethod === 'wave'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="font-bold text-xs text-yellow-600">WavePay</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Fast Checkout</div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-3 rounded-lg border text-center transition-all ${
                paymentMethod === 'card'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="font-bold text-xs text-gray-800">Visa / MPU</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Debit Card</div>
            </button>
          </div>
        </div>

        {/* Total & Action */}
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between text-base font-bold text-gray-900">
            <span>Total Payable</span>
            <span className="text-2xl text-indigo-600">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleCancelPayment}
              disabled={processing}
              className="flex-1"
            >
              Cancel Order
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={processing}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11"
            >
              {processing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Pay {formatCurrency(order.totalAmount)}
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <span>256-bit encrypted checkout with instant QR fulfillment</span>
          </div>
        </div>
      </div>
    </div>
  )
}
