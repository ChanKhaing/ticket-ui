import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ShieldCheck,
  Ticket as TicketIcon,
  RefreshCw,
  Lock,
  Smartphone,
  CreditCard,
  QrCode,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { ordersApi } from '../services/orders.api'
import { paymentsApi } from '@/features/payments/services/payments.api'
import { useAuth } from '@/features/auth/context/AuthContext'
import type { Order } from '@/types'

export function CheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'kpay' | 'wave' | 'card'>('kpay')

  // Demo Payment Form States
  const [kpayPhone, setKpayPhone] = useState(user?.phone || '09798765432')
  const [kpayPin, setKpayPin] = useState('123456')

  const [wavePhone, setWavePhone] = useState(user?.phone || '09971234567')
  const [wavePin, setWavePin] = useState('9999')

  const [cardHolder, setCardHolder] = useState(user?.fullName || 'Demo Customer')
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444')
  const [cardExpiry, setCardExpiry] = useState('12/28')
  const [cardCvv, setCardCvv] = useState('888')

  // Load real order from backend
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
  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return

    // Demo validation
    if (paymentMethod === 'kpay' && (!kpayPhone || !kpayPin)) {
      toast.error('Please enter KBZPay phone and PIN')
      return
    }
    if (paymentMethod === 'wave' && (!wavePhone || !wavePin)) {
      toast.error('Please enter WavePay phone and PIN')
      return
    }
    if (paymentMethod === 'card' && (!cardNumber || !cardCvv)) {
      toast.error('Please complete card information')
      return
    }

    setProcessing(true)
    try {
      // Step 1: Initiate Payment Session in Backend
      const payment = await paymentsApi.initiatePayment(order._id)

      // Step 2: Confirm Payment (Mock Successful Transaction)
      await paymentsApi.confirmPayment(payment._id, 'success')

      // Step 3: Success state!
      setIsSuccess(true)
      toast.success('Payment completed! Your digital tickets and QR passes are ready.')
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
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium text-indigo-600 uppercase">
                {paymentMethod === 'kpay' ? 'KBZPay' : paymentMethod === 'wave' ? 'WavePay' : 'Visa / MPU'}
              </span>
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

      <form onSubmit={handleConfirmPayment} className="mt-6 rounded-xl border bg-white p-6 shadow-sm space-y-6">
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
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/30'
                  : 'hover:bg-gray-50'
              }`}
            >
              <Smartphone className="h-5 w-5 mx-auto text-blue-600 mb-1" />
              <div className="font-bold text-xs text-blue-800">KBZPay</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Mobile Wallet</div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('wave')}
              className={`p-3 rounded-lg border text-center transition-all ${
                paymentMethod === 'wave'
                  ? 'border-yellow-500 bg-yellow-50/60 ring-2 ring-yellow-500/30'
                  : 'hover:bg-gray-50'
              }`}
            >
              <Smartphone className="h-5 w-5 mx-auto text-yellow-600 mb-1" />
              <div className="font-bold text-xs text-yellow-800">WavePay</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Wave Money</div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-3 rounded-lg border text-center transition-all ${
                paymentMethod === 'card'
                  ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/30'
                  : 'hover:bg-gray-50'
              }`}
            >
              <CreditCard className="h-5 w-5 mx-auto text-indigo-600 mb-1" />
              <div className="font-bold text-xs text-indigo-900">Visa / MPU</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Debit Card</div>
            </button>
          </div>
        </div>

        {/* Demo Interactive Payment Inputs */}
        <div className="rounded-xl border p-4 bg-gray-50/70 space-y-3">
          {paymentMethod === 'kpay' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                  KBZPay Demo Checkout
                </span>
                <span className="text-[11px] text-blue-600 font-medium">Demo Simulator</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">KPay Mobile Number</label>
                  <Input
                    placeholder="09798765432"
                    value={kpayPhone}
                    onChange={(e) => setKpayPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">6-Digit PIN / OTP</label>
                  <Input
                    type="password"
                    maxLength={6}
                    placeholder="123456"
                    value={kpayPin}
                    onChange={(e) => setKpayPin(e.target.value)}
                    className="font-mono tracking-widest"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setKpayPhone('09798765432')
                    setKpayPin('123456')
                    toast.success('Auto-filled KBZPay demo credentials!')
                  }}
                  className="flex items-center gap-1 text-[11px] text-blue-700 hover:underline font-medium"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Auto-Fill Demo Credentials
                </button>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <QrCode className="h-3.5 w-3.5" />
                  QR Scan Supported
                </span>
              </div>
            </div>
          )}

          {paymentMethod === 'wave' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold text-yellow-800 flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-yellow-600" />
                  WavePay Demo Checkout
                </span>
                <span className="text-[11px] text-yellow-700 font-medium">Demo Simulator</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Wave Mobile Account</label>
                  <Input
                    placeholder="09971234567"
                    value={wavePhone}
                    onChange={(e) => setWavePhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">4-Digit Security PIN</label>
                  <Input
                    type="password"
                    maxLength={4}
                    placeholder="9999"
                    value={wavePin}
                    onChange={(e) => setWavePin(e.target.value)}
                    className="font-mono tracking-widest"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setWavePhone('09971234567')
                    setWavePin('9999')
                    toast.success('Auto-filled WavePay demo credentials!')
                  }}
                  className="flex items-center gap-1 text-[11px] text-yellow-800 hover:underline font-medium"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Auto-Fill Demo Credentials
                </button>
                <span className="text-[11px] text-muted-foreground">Wave Money Direct</span>
              </div>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-indigo-600" />
                  Visa / MPU Card Demo
                </span>
                <span className="text-[11px] text-indigo-600 font-medium">Demo Simulator</span>
              </div>
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Cardholder Name</label>
                  <Input
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Card Number</label>
                  <Input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="font-mono"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Expiry Date (MM/YY)</label>
                    <Input
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">CVV</label>
                    <Input
                      type="password"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="888"
                      className="font-mono tracking-widest"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCardHolder(user?.fullName || 'Demo Customer')
                    setCardNumber('4111 2222 3333 4444')
                    setCardExpiry('12/28')
                    setCardCvv('888')
                    toast.success('Auto-filled Test Card!')
                  }}
                  className="flex items-center gap-1 text-[11px] text-indigo-600 hover:underline font-medium"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Auto-Fill Test Visa Card
                </button>
              </div>
            </div>
          )}
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
              type="button"
              variant="outline"
              onClick={handleCancelPayment}
              disabled={processing}
              className="flex-1"
            >
              Cancel Order
            </Button>
            <Button
              type="submit"
              disabled={processing}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11"
            >
              {processing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Authorizing Payment...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Confirm & Pay {formatCurrency(order.totalAmount)}
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <span>256-bit encrypted checkout with instant QR fulfillment</span>
          </div>
        </div>
      </form>
    </div>
  )
}
