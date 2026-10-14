import { useState, useMemo } from 'react'
import { Webhook, Search } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { MOCK_PAYMENTS, MOCK_STATS } from '@/data/mock'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { Payment, PaymentStatus } from '@/types'
import { toast } from 'sonner'

export function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [webhookOpen, setWebhookOpen] = useState(false)
  const [webhookOrderCode, setWebhookOrderCode] = useState('ORD-20261015-001')
  const [webhookOutcome, setWebhookOutcome] = useState<PaymentStatus>('success')

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        p.paymentCode.toLowerCase().includes(search.toLowerCase()) ||
        p.orderId.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [payments, search, statusFilter])

  const handleTriggerWebhook = () => {
    const newPayment: Payment = {
      _id: `pay_${Date.now()}`,
      paymentCode: `PAY-${Date.now().toString().slice(-6)}`,
      orderId: webhookOrderCode,
      userId: 'u1',
      amount: 50000,
      currency: 'MMK',
      method: 'mock',
      status: webhookOutcome,
      paidAt: webhookOutcome === 'success' ? new Date().toISOString() : undefined,
      failedAt: webhookOutcome === 'failed' ? new Date().toISOString() : undefined,
      failureReason: webhookOutcome === 'failed' ? 'Simulated gateway decline' : undefined,
      createdAt: new Date().toISOString(),
    }
    setPayments((prev) => [newPayment, ...prev])
    setWebhookOpen(false)
    toast.success(`Mock Webhook processed: Payment ${webhookOutcome}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Payment Transactions"
          subtitle="Real-time payment gateway logs, success rates and revenue settlement"
        />
        <Button
          onClick={() => setWebhookOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 gap-2 self-start sm:self-auto"
        >
          <Webhook className="h-4 w-4" />
          Mock Webhook
        </Button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border bg-white p-4 shadow-xs">
        <div>
          <p className="text-xs text-muted-foreground font-medium">Total Revenue</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">
            {formatCurrency(MOCK_STATS.payments.revenue)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Successful</p>
          <p className="text-lg font-bold text-emerald-600 mt-0.5">
            {MOCK_STATS.payments.success}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Pending</p>
          <p className="text-lg font-bold text-amber-600 mt-0.5">
            {MOCK_STATS.orders.pending}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Failed</p>
          <p className="text-lg font-bold text-red-600 mt-0.5">1</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 rounded-xl border bg-white p-4 shadow-xs">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search payment or order code..."
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
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment Code</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((pay) => (
              <TableRow key={pay._id}>
                <TableCell className="font-mono text-xs font-semibold text-gray-900">
                  {pay.paymentCode}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {pay.orderId}
                </TableCell>
                <TableCell className="font-bold text-gray-900">
                  {formatCurrency(pay.amount)}
                </TableCell>
                <TableCell>
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 capitalize">
                    {pay.method}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={pay.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(pay.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mock Webhook Dialog */}
      <Dialog open={webhookOpen} onOpenChange={setWebhookOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Simulate Webhook Notification</DialogTitle>
            <DialogDescription>
              Trigger an incoming payment gateway webhook for test orders
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Order ID</label>
              <Input
                value={webhookOrderCode}
                onChange={(e) => setWebhookOrderCode(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Outcome</label>
              <Select
                value={webhookOutcome}
                onValueChange={(v: any) => setWebhookOutcome(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Payment Success</SelectItem>
                  <SelectItem value="failed">Payment Failed</SelectItem>
                  <SelectItem value="refunded">Payment Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWebhookOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleTriggerWebhook}
            >
              Simulate Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
