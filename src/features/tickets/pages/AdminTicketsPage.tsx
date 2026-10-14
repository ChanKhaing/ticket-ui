import { useState, useMemo } from 'react'
import { Plus, Edit, Trash2, Globe, EyeOff, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { MOCK_TICKETS } from '@/data/mock'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Ticket, TicketStatus } from '@/types'
import { toast } from 'sonner'

export function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTicket, setDeleteTicket] = useState<Ticket | null>(null)

  // Form states for Create/Edit
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(25000)
  const [eventDate, setEventDate] = useState('2026-12-15')
  const [quantity, setQuantity] = useState(100)
  const [category, setCategory] = useState('Concert')
  const [tags, setTags] = useState('music, live')

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || t.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [tickets, search, statusFilter])

  const handleTogglePublish = (ticket: Ticket) => {
    const nextStatus: TicketStatus =
      ticket.status === 'published' ? 'draft' : 'published'
    setTickets((prev) =>
      prev.map((t) => (t._id === ticket._id ? { ...t, status: nextStatus } : t))
    )
    toast.success(`Ticket status set to ${nextStatus}`)
  }

  const handleDelete = () => {
    if (!deleteTicket) return
    setTickets((prev) => prev.filter((t) => t._id !== deleteTicket._id))
    setDeleteTicket(null)
    toast.success('Ticket product removed')
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const newTicket: Ticket = {
      _id: `t_${Date.now()}`,
      name,
      description,
      price: Number(price),
      currency: 'MMK',
      eventDate: new Date(eventDate).toISOString(),
      quantity: Number(quantity),
      sold: 0,
      status: 'published',
      category,
      tags: tags.split(',').map((s) => s.trim()),
      images: [],
      createdAt: new Date().toISOString(),
    }
    setTickets((prev) => [newTicket, ...prev])
    setCreateOpen(false)
    toast.success('Event ticket created and published')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Ticket Management"
          subtitle="Create, configure and manage event ticket inventories"
        />
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 rounded-xl border bg-white p-4 shadow-xs">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tickets by name..."
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
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sold_out">Sold Out</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Available / Qty</TableHead>
              <TableHead>Sold</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Event Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t._id}>
                <TableCell>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <span className="text-xs text-muted-foreground">{t.category}</span>
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  {formatCurrency(t.price)}
                </TableCell>
                <TableCell>{t.quantity}</TableCell>
                <TableCell>
                  <span className="font-semibold text-indigo-600">{t.sold}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={t.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(t.eventDate)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      title={t.status === 'published' ? 'Unpublish to draft' : 'Publish ticket'}
                      onClick={() => handleTogglePublish(t)}
                    >
                      {t.status === 'published' ? (
                        <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Globe className="h-3.5 w-3.5 text-green-600" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toast.info(`Edit ${t.name}`)}
                    >
                      <Edit className="h-3.5 w-3.5 text-indigo-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setDeleteTicket(t)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Ticket Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Ticket Product</DialogTitle>
            <DialogDescription>
              Provide event details, pricing, and ticket allocation
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Event Name</label>
              <Input
                placeholder="Myanmar Music Festival 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="About this event..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Price (MMK)</label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Quantity Available</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Event Date</label>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Concert">Concert</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Festival">Festival</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                placeholder="music, live, outdoor"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                Create & Publish
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTicket}
        onOpenChange={(o) => !o && setDeleteTicket(null)}
        title="Delete Ticket"
        description={`Are you sure you want to delete ${deleteTicket?.name}?`}
        confirmLabel="Delete Ticket"
        danger
        onConfirm={handleDelete}
      />
    </div>
  )
}
