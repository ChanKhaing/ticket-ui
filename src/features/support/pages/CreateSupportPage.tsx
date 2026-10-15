import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Send, RefreshCw } from 'lucide-react'
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
import { PageHeader } from '@/components/shared/PageHeader'
import { supportApi } from '../services/support.api'
import type { SupportCategory, SupportPriority } from '@/types'
import { toast } from 'sonner'

export function CreateSupportPage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState<SupportCategory>('payment')
  const [priority, setPriority] = useState<SupportPriority>('medium')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (description.trim().length < 10) {
      toast.error('Description must be at least 10 characters')
      return
    }

    setLoading(true)
    try {
      const ticket = await supportApi.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
      })
      toast.success(`Support ticket ${ticket.ticketCode} created successfully!`)
      navigate(`/user/support/${ticket._id}`)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit support ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-6">
      <Button variant="ghost" size="sm" className="mb-4 gap-1.5" asChild>
        <Link to="/user/support">
          <ArrowLeft className="h-4 w-4" />
          Back to Support
        </Link>
      </Button>

      <PageHeader
        title="Create Support Ticket"
        subtitle="Submit your issue or request and our team will assist you promptly"
      />

      <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Subject <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Payment deducted but order is pending"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Category</label>
              <Select value={category} onValueChange={(v) => setCategory(v as SupportCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment & Billing</SelectItem>
                  <SelectItem value="ticket">Event Ticket Issues</SelectItem>
                  <SelectItem value="account">Account & Profile</SelectItem>
                  <SelectItem value="other">General Inquiries</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Priority</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as SupportPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (General question)</SelectItem>
                  <SelectItem value="medium">Medium (Standard issue)</SelectItem>
                  <SelectItem value="high">High (Urgent attention)</SelectItem>
                  <SelectItem value="urgent">Urgent (Blocking event)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Please provide details about what happened, error messages, or order codes..."
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters. Include order or ticket codes if applicable.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/user/support')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Ticket
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
