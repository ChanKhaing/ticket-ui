import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
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
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { MOCK_SUPPORT } from '@/data/mock'
import { timeAgo } from '@/lib/utils'
import type { SupportTicket, SupportPriority, SupportStatus } from '@/types'
import { toast } from 'sonner'

export function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_SUPPORT)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        t.ticketCode.toLowerCase().includes(search.toLowerCase()) ||
        t.subject.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || t.status === statusFilter
      const matchPriority =
        priorityFilter === 'all' || t.priority === priorityFilter
      return matchSearch && matchStatus && matchPriority
    })
  }, [tickets, search, statusFilter, priorityFilter])

  const handleAssignAgent = (ticketId: string, agentName: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t._id === ticketId
          ? { ...t, agentId: agentName, status: 'in_progress' }
          : t
      )
    )
    toast.success(`Agent assigned to ${ticketId}`)
  }

  const handleChangePriority = (ticketId: string, priority: SupportPriority) => {
    setTickets((prev) =>
      prev.map((t) => (t._id === ticketId ? { ...t, priority } : t))
    )
    toast.success(`Priority updated to ${priority}`)
  }

  const handleUpdateStatus = (ticketId: string, status: SupportStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t._id === ticketId ? { ...t, status } : t))
    )
    toast.success(`Ticket marked as ${status}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Management"
        subtitle="Customer inquiries, incident resolution workflows, and agent assignment"
      />

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Assigned Agent</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Message</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t._id}>
                <TableCell className="font-mono text-xs font-semibold text-gray-900">
                  {t.ticketCode}
                </TableCell>
                <TableCell>
                  <p className="font-medium text-gray-900 line-clamp-1">{t.subject}</p>
                  <span className="text-xs text-muted-foreground capitalize">
                    {t.category}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  Customer ({typeof t.customerId === 'string' ? t.customerId : t.customerId.fullName})
                </TableCell>
                <TableCell>
                  <Select
                    value={t.agentId ? String(t.agentId) : 'unassigned'}
                    onValueChange={(val) => handleAssignAgent(t._id, val)}
                  >
                    <SelectTrigger className="h-8 text-xs w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      <SelectItem value="Agent One">Agent One</SelectItem>
                      <SelectItem value="Admin User">Admin User</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={t.priority}
                    onValueChange={(val: any) => handleChangePriority(t._id, val)}
                  >
                    <SelectTrigger className="h-8 text-xs w-28 border-0 bg-transparent p-0">
                      <PriorityBadge priority={t.priority} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <StatusBadge status={t.status} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {t.lastMessageAt ? timeAgo(t.lastMessageAt) : 'Recently'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {t.status !== 'resolved' ? (
                      <button
                        onClick={() => handleUpdateStatus(t._id, 'resolved')}
                        className="rounded px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                      >
                        Resolve
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(t._id, 'open')}
                        className="rounded px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
