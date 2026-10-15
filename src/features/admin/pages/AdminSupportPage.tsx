import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, RefreshCw, MessageCircle } from 'lucide-react'
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
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { timeAgo } from '@/lib/utils'
import { supportApi } from '@/features/support/services/support.api'
import type { SupportTicket, SupportPriority, SupportStatus } from '@/types'
import { toast } from 'sonner'

export function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await supportApi.getAdminTickets({
        status: statusFilter !== 'all' ? (statusFilter as SupportStatus) : undefined,
        priority: priorityFilter !== 'all' ? (priorityFilter as SupportPriority) : undefined,
        limit: 100,
      })
      setTickets(res.tickets)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to load support tickets')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, priorityFilter])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        t.ticketCode.toLowerCase().includes(search.toLowerCase()) ||
        t.subject.toLowerCase().includes(search.toLowerCase())
      return matchSearch
    })
  }, [tickets, search])

  const handleChangePriority = async (ticketId: string, priority: SupportPriority) => {
    try {
      const updated = await supportApi.updatePriority(ticketId, priority)
      setTickets((prev) => prev.map((t) => (t._id === ticketId ? updated : t)))
      toast.success(`Priority updated to ${priority}`)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to update priority')
    }
  }

  const handleUpdateStatus = async (ticketId: string, status: SupportStatus) => {
    try {
      const updated = await supportApi.updateStatus(ticketId, status)
      setTickets((prev) => prev.map((t) => (t._id === ticketId ? updated : t)))
      toast.success(`Ticket marked as ${status}`)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Support Management"
          subtitle="Customer inquiries, incident resolution workflows, and ticket response"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTickets}
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
            placeholder="Search tickets by subject or code..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin text-indigo-600" />
            Loading customer support tickets from database...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket Code</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                    No support tickets found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((ticket) => (
                  <TableRow key={ticket._id}>
                    <TableCell className="font-mono text-xs font-semibold text-indigo-600">
                      {ticket.ticketCode}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900 block max-w-xs truncate">
                        {ticket.subject}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize text-xs text-muted-foreground">
                      {ticket.category}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={ticket.status}
                        onValueChange={(val) =>
                          handleUpdateStatus(ticket._id, val as SupportStatus)
                        }
                      >
                        <SelectTrigger className="h-7 w-28 text-xs border-none shadow-none p-0 focus:ring-0">
                          <StatusBadge status={ticket.status} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={ticket.priority}
                        onValueChange={(val) =>
                          handleChangePriority(ticket._id, val as SupportPriority)
                        }
                      >
                        <SelectTrigger className="h-7 w-24 text-xs border-none shadow-none p-0 focus:ring-0">
                          <PriorityBadge priority={ticket.priority} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {timeAgo(ticket.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        asChild
                      >
                        <Link to={`/user/support/${ticket._id}`}>
                          <MessageCircle className="h-3.5 w-3.5" />
                          Open Chat
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
