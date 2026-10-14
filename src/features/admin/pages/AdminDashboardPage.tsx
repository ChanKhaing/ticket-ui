import {
  Users,
  Ticket,
  DollarSign,
  AlertCircle,
  ShoppingCart,
  QrCode,
  Activity,
  ArrowUpRight,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { RevenueChart } from '@/components/shared/RevenueChart'
import {
  MOCK_STATS,
  MOCK_REVENUE_CHART,
  MOCK_ACTIVITY_LOGS,
} from '@/data/mock'
import { formatCurrency, timeAgo } from '@/lib/utils'

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Overview"
        subtitle="Platform metrics, ticket sales, revenue and real-time activity"
      />

      {/* Stats Row 1 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="rounded-xl border bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Users</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-gray-900">{MOCK_STATS.users.total.toLocaleString()}</h3>
            <p className="mt-1 text-xs text-green-600 flex items-center font-medium">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              {MOCK_STATS.users.active} active now
            </p>
          </div>
        </div>

        {/* Published Tickets */}
        <div className="rounded-xl border bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Published Tickets</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <Ticket className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-gray-900">{MOCK_STATS.tickets.published}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Across {MOCK_STATS.tickets.total} total events
            </p>
          </div>
        </div>

        {/* Revenue */}
        <div className="rounded-xl border bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Today's Revenue</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatCurrency(MOCK_STATS.payments.revenue)}
            </h3>
            <p className="mt-1 text-xs text-emerald-600 font-medium">
              {MOCK_STATS.payments.success} completed transactions
            </p>
          </div>
        </div>

        {/* Open Support */}
        <div className="rounded-xl border bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Open Support</span>
            <div
              className={`rounded-lg p-2 ${
                MOCK_STATS.support.open > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'
              }`}
            >
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-bold ${MOCK_STATS.support.open > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {MOCK_STATS.support.open}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Out of {MOCK_STATS.support.total} total tickets
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row 2 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Total Orders</span>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{MOCK_STATS.orders.total}</h3>
            <p className="text-xs text-yellow-600 font-medium mt-1">
              {MOCK_STATS.orders.pending} pending checkout
            </p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
            <ShoppingCart className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Issued Tickets</span>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{MOCK_STATS.purchasedTickets.total}</h3>
            <p className="text-xs text-indigo-600 font-medium mt-1">
              {MOCK_STATS.purchasedTickets.used} redeemed at venue
            </p>
          </div>
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
            <QrCode className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="rounded-xl border bg-white p-6 shadow-xs">
        <RevenueChart data={MOCK_REVENUE_CHART} />
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-4 border-b">
          <Activity className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Recent Activity Timeline</h3>
        </div>

        <div className="mt-4 divide-y">
          {MOCK_ACTIVITY_LOGS.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mr-2">
                      {item.eventType}
                    </span>
                    {item.user}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Entity: {item.entity}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {timeAgo(item.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
