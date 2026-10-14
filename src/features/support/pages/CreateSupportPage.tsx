import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
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
import { toast } from 'sonner'

export function CreateSupportPage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState<'payment' | 'ticket' | 'account' | 'other'>('payment')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !description) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setLoading(false)
    toast.success('Support ticket created successfully!')
    navigate('/user/support')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/user/support">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Support
        </Link>
      </Button>

      <PageHeader
        title="Create Support Ticket"
        subtitle="Submit a request and our support team will reply promptly"
      />

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Subject <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Brief summary of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Category <span className="text-red-500">*</span>
            </label>
            <Select value={category} onValueChange={(v: any) => setCategory(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment">Payment Issue</SelectItem>
                <SelectItem value="ticket">Ticket & QR Code</SelectItem>
                <SelectItem value="account">Account & Security</SelectItem>
                <SelectItem value="other">Other Inquiry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Describe your issue in detail so we can help faster..."
              className="min-h-[140px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="outline" asChild>
              <Link to="/user/support">Cancel</Link>
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 gap-2"
              disabled={loading}
            >
              <Send className="h-4 w-4" />
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
