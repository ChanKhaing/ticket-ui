import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Send,
  RefreshCw,
  Headphones,
  User as UserIcon,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { formatDateTime } from '@/lib/utils'
import { supportApi } from '../services/support.api'
import type { SupportTicket, SupportMessage } from '@/types'
import { toast } from 'sonner'

export function SupportChatPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const isAdminMode = location.pathname.startsWith('/admin')

  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChat = useCallback(
    async (silent = false) => {
      if (!id) return
      if (!silent) setLoading(true)
      try {
        const [tData, mData] = await Promise.all([
          supportApi.getTicketById(id),
          supportApi.getMessages(id),
        ])
        setTicket(tData)
        setMessages(mData)
      } catch (err: any) {
        if (!silent) {
          toast.error(err.response?.data?.error?.message || 'Failed to load support chat')
        }
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [id],
  )

  useEffect(() => {
    fetchChat()
    // Poll for new replies every 6 seconds
    const interval = setInterval(() => {
      fetchChat(true)
    }, 6000)
    return () => clearInterval(interval)
  }, [fetchChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !id) return

    setSending(true)
    const text = input.trim()
    try {
      const newMsg = await supportApi.addReply(id, text)
      setMessages((prev) => [...prev, newMsg])
      setInput('')
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleQuickResolve = async () => {
    if (!ticket) return
    setResolving(true)
    try {
      const updated = await supportApi.resolveTicket(ticket._id, 'Resolved by staff')
      setTicket(updated)
      toast.success(`Ticket ${ticket.ticketCode} marked as Resolved`)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to resolve ticket')
    } finally {
      setResolving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <RefreshCw className="h-10 w-10 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm text-muted-foreground">Loading support ticket thread...</p>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="rounded-xl border bg-white p-8">
          <Headphones className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <h2 className="text-xl font-bold text-gray-900">Ticket not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This support ticket could not be found or you do not have permission to view it.
          </p>
          <Button className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
            <Link to={isAdminMode ? '/admin/support' : '/user/support'}>
              {isAdminMode ? 'Back to Support Management' : 'Back to My Tickets'}
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved'

  return (
    <div className="mx-auto max-w-4xl py-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" className="gap-1.5" asChild>
          <Link to={isAdminMode ? '/admin/support' : '/user/support'}>
            <ArrowLeft className="h-4 w-4" />
            {isAdminMode ? 'Back to Support Management' : 'Back to My Tickets'}
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {isAdminMode && !isClosed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleQuickResolve}
              disabled={resolving}
              className="gap-1.5 text-green-700 border-green-200 hover:bg-green-50"
            >
              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
              {resolving ? 'Resolving...' : 'Mark as Resolved'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchChat(false)}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col h-[650px]">
        {/* Ticket Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b px-6 py-4 bg-gray-50/70 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {ticket.ticketCode}
              </span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                {ticket.category}
              </span>
              {isAdminMode && (
                <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.2 text-[10px] font-bold">
                  Admin View
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-gray-900 mt-1">{ticket.subject}</h2>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        {/* Issue Details Box */}
        <div className="border-b bg-indigo-50/30 px-6 py-3 text-xs text-gray-700 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-gray-900 block mb-0.5">Customer Issue Details:</span>
            <p className="text-gray-600 whitespace-pre-line leading-relaxed">{ticket.description}</p>
          </div>
        </div>

        {/* Message Area with distinct Left/Right Sides */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/20">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <p>No replies yet in this thread.</p>
              <p className="text-xs mt-1">
                {isAdminMode
                  ? 'Send a reply below to help the customer resolve their issue.'
                  : 'Our support team will respond to your request shortly.'}
              </p>
            </div>
          ) : (
            messages.map((m) => {
              // Decide if message is from the CURRENT logged-in viewer ("Me" on Right)
              // or from the other party (on Left)
              const isSenderAdmin = m.senderRole === 'admin' || m.senderRole === 'agent'
              const isSenderCustomer = m.senderRole === 'customer'

              // If current viewer is Admin:
              //   - Admin messages -> Right (Me)
              //   - Customer messages -> Left (Customer)
              // If current viewer is Customer:
              //   - Customer messages -> Right (Me)
              //   - Admin messages -> Left (Support Agent)
              const isMe = isAdminMode ? isSenderAdmin : isSenderCustomer

              return (
                <div
                  key={m._id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-2 max-w-[80%]">
                    {/* Left-side Avatar for the other party */}
                    {!isMe && (
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white shadow-xs ${
                          isSenderAdmin ? 'bg-indigo-600' : 'bg-blue-600'
                        }`}
                      >
                        {isSenderAdmin ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          <UserIcon className="h-4 w-4" />
                        )}
                      </div>
                    )}

                    {/* Bubble Content */}
                    <div>
                      {/* Name label */}
                      <span
                        className={`text-[11px] font-semibold block mb-1 ${
                          isMe
                            ? 'text-right text-indigo-600'
                            : isSenderAdmin
                            ? 'text-indigo-700'
                            : 'text-blue-700'
                        }`}
                      >
                        {isMe
                          ? isAdminMode
                            ? 'You (Support Agent)'
                            : 'You (Customer)'
                          : isSenderAdmin
                          ? 'Support Agent'
                          : 'Customer'}
                      </span>

                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-xs ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : isSenderAdmin
                            ? 'bg-indigo-50 border border-indigo-100 text-gray-900 rounded-bl-xs'
                            : 'bg-white border text-gray-900 rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-line">{m.body}</p>
                      </div>
                    </div>

                    {/* Right-side Avatar for Me */}
                    {isMe && (
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white shadow-xs ${
                          isAdminMode ? 'bg-indigo-700' : 'bg-indigo-600'
                        }`}
                      >
                        {isAdminMode ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          <UserIcon className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {formatDateTime(m.createdAt)}
                  </span>
                </div>
              )
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        {isClosed ? (
          <div className="border-t p-4 bg-gray-50 text-center text-xs text-muted-foreground">
            This support ticket has been marked as <strong>{ticket.status}</strong>.
            {isAdminMode ? ' (Ticket closed)' : ' If you still need help, please submit a new ticket.'}
          </div>
        ) : (
          <form onSubmit={handleSend} className="border-t p-3 sm:p-4 bg-white flex items-center gap-2">
            <Input
              placeholder={
                isAdminMode
                  ? 'Reply to customer as Support Agent...'
                  : 'Type your message to support...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-lg"
              disabled={sending}
            />
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 px-4 text-white"
              disabled={!input.trim() || sending}
            >
              {sending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
