import { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, Globe, EyeOff, Search, RefreshCw } from 'lucide-react'
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
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Ticket, TicketStatus } from '@/types'
import { toast } from 'sonner'
import { ticketsApi } from '../services/tickets.api'

export function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modals
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const [deleteTicket, setDeleteTicket] = useState<Ticket | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states for Create/Edit
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(25000)
  const [eventDate, setEventDate] = useState('2026-12-15')
  const [quantity, setQuantity] = useState(100)
  const [category, setCategory] = useState('Concert')
  const [tags, setTags] = useState('music, live')

  // Fetch Tickets from Backend
  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await ticketsApi.getTickets({
        limit: 100,
        status: statusFilter !== 'all' ? (statusFilter as TicketStatus) : undefined,
      })
      setTickets(res.tickets)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || t.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [tickets, search, statusFilter])

  // Toggle Publish / Unpublish
  const handleTogglePublish = async (ticket: Ticket) => {
    try {
      if (ticket.status === 'published') {
        const updated = await ticketsApi.unpublishTicket(ticket._id)
        setTickets((prev) => prev.map((t) => (t._id === ticket._id ? updated : t)))
        toast.success(`"${ticket.name}" unpublished to draft`)
      } else {
        const updated = await ticketsApi.publishTicket(ticket._id)
        setTickets((prev) => prev.map((t) => (t._id === ticket._id ? updated : t)))
        toast.success(`"${ticket.name}" published live`)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to toggle publish status')
    }
  }

  // Delete Ticket
  const handleDelete = async () => {
    if (!deleteTicket) return
    try {
      await ticketsApi.deleteTicket(deleteTicket._id)
      setTickets((prev) => prev.filter((t) => t._id !== deleteTicket._id))
      toast.success(`Ticket "${deleteTicket.name}" removed`)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete ticket')
    } finally {
      setDeleteTicket(null)
    }
  }

  // Open Edit Modal
  const handleOpenEdit = (ticket: Ticket) => {
    setEditingTicket(ticket)
    setName(ticket.name)
    setDescription(ticket.description || '')
    setPrice(ticket.price)
    setEventDate(ticket.eventDate ? ticket.eventDate.split('T')[0] : '2026-12-15')
    setQuantity(ticket.quantity)
    setCategory(ticket.category || 'Concert')
    setTags(ticket.tags?.join(', ') || '')
    setEditOpen(true)
  }

  // Save Edit Ticket
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTicket) return
    setSaving(true)
    try {
      const updated = await ticketsApi.updateTicket(editingTicket._id, {
        name,
        description,
        quantity: Number(quantity),
        eventDate: new Date(eventDate).toISOString(),
        category,
        tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
      })
      // If price changed, update price endpoint
      if (Number(price) !== editingTicket.price) {
        await ticketsApi.updatePrice(editingTicket._id, Number(price))
        updated.price = Number(price)
      }
      setTickets((prev) => prev.map((t) => (t._id === editingTicket._id ? updated : t)))
      toast.success(`"${updated.name}" updated successfully`)
      setEditOpen(false)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to update ticket')
    } finally {
      setSaving(false)
    }
  }

  // Create Ticket
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const created = await ticketsApi.createTicket({
        name,
        description,
        price: Number(price),
        currency: 'MMK',
        eventDate: new Date(eventDate).toISOString(),
        quantity: Number(quantity),
        category,
        tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
        images: [],
      })
      // Publish immediately so it appears on the public browse page
      try {
        const published = await ticketsApi.publishTicket(created._id)
        setTickets((prev) => [published, ...prev])
      } catch {
        setTickets((prev) => [created, ...prev])
      }
      toast.success(`"${created.name}" created and published!`)
      setCreateOpen(false)
      // Reset form
      setName('')
      setDescription('')
      setPrice(25000)
      setQuantity(100)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to create ticket')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Ticket Management"
          subtitle="Create, publish, and manage ticket products and allocations"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTickets}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => {
              setName('')
              setDescription('')
              setPrice(25000)
              setQuantity(100)
              setCreateOpen(true)
            }}
            className="bg-indigo-600 hover:bg-indigo-700 gap-2 text-white"
          >
            <Plus className="h-4 w-4" />
            Create Ticket
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 rounded-xl border bg-white p-4 shadow-xs">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by event title..."
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
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sold_out">Sold Out</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin text-indigo-600" />
            Loading ticket products from database...
          </div>
        ) : (
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
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                    No tickets found matching your filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((ticket) => {
                  const available = ticket.quantity - ticket.sold
                  const isPublished = ticket.status === 'published'

                  return (
                    <TableRow key={ticket._id}>
                      <TableCell>
                        <div>
                          <span className="font-semibold text-gray-900 block">{ticket.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {ticket.category || 'General'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {formatCurrency(ticket.price)}
                      </TableCell>
                      <TableCell>
                        <span className={available === 0 ? 'text-red-600 font-semibold' : ''}>
                          {available}
                        </span>{' '}
                        / {ticket.quantity}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{ticket.sold}</TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(ticket.eventDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTogglePublish(ticket)}
                            title={isPublished ? 'Unpublish to draft' : 'Publish live'}
                            className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          >
                            {isPublished ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Globe className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(ticket)}
                            title="Edit details"
                            className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTicket(ticket)}
                            title="Delete ticket"
                            disabled={ticket.sold > 0}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create Ticket Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Ticket Product</DialogTitle>
            <DialogDescription>
              Provide event details, pricing, and ticket allocation to publish
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Event Name *</label>
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
                <label className="text-sm font-medium">Price (MMK) *</label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  min={0}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Quantity Available *</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min={1}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Event Date *</label>
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
              <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {saving ? 'Creating...' : 'Create & Publish'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Ticket Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Ticket Product</DialogTitle>
            <DialogDescription>
              Update event details, pricing, or total ticket capacity
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Event Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Price (MMK) *</label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  min={0}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Total Quantity *</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min={editingTicket?.sold || 1}
                  required
                />
                {editingTicket && editingTicket.sold > 0 && (
                  <p className="text-[11px] text-amber-600">
                    Cannot be less than already sold tickets ({editingTicket.sold}).
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Event Date *</label>
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
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button variant="outline" type="button" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTicket}
        onOpenChange={(o) => !o && setDeleteTicket(null)}
        title="Delete Ticket"
        description={`Are you sure you want to delete ${deleteTicket?.name}? This action cannot be undone.`}
        confirmLabel="Delete Ticket"
        danger
        onConfirm={handleDelete}
      />
    </div>
  )
}
