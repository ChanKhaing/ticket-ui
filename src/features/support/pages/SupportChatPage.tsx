import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send, RefreshCw, Headphones, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { formatDateTime } from '@/lib/utils'
import { supportApi } from '../services/support.api'
import { useAuth } from '@/features/auth/context/AuthContext'
import type { SupportTicket, SupportMessage } from '@/types'
import { toast } from 'sonner'

export function SupportChatPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChat = useCallback(async (silent = false) => {
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
  }, [id])

  useEffect(() => {
    fetchChat()
    // Poll for new replies every 8 seconds
    const interval = setInterval(() => {
      fetchChat(true)
    }, 8000)
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
            <Link to="/user/support">Back to Support</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved'

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" className="gap-1.5" asChild>
          <Link to="/user/support">
            <ArrowLeft className="h-4 w-4" />
            Back to Tickets
          </Link>
        </Button>
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

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col h-[650px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b px-6 py-4 bg-gray-50/50 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {ticket.ticketCode}
              </span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                {ticket.category}
              </span>
            </div>
            <h2 className="text-base font-bold text-gray-900 mt-1">{ticket.subject}</h2>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/30">
          {/* Initial Ticket Description as first message */}
          <div className="flex flex-col items-start">
            <div className="flex items-start gap-2 max-w-[85%]">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-xs font-semibold">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs bg-white border text-gray-900 rounded-tl-xs">
                <p className="font-semibold text-xs text-indigo-600 mb-1">Issue Description</p>
                <p className="whitespace-pre-line">{ticket.description}</p>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 px-1 ml-9">
              {formatDateTime(ticket.createdAt)}
            </span>
          </div>

          {/* Messages list */}
          {messages.map((m) => {
            const isMe = m.senderRole === 'customer' || (user && m.senderId === user._id)
            const isAgent = m.senderRole === 'agent' || m.senderRole === 'admin'

            return (
              <div
                key={m._id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[80%]">
                  {!isMe && (
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                      {isAgent ? 'SP' : 'AG'}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-white border text-gray-900 rounded-bl-xs'
                    }`}
                  >
                    {!isMe && (
                      <span className="text-[10px] block font-semibold text-indigo-600 mb-1 uppercase tracking-wider">
                        Support Agent
                      </span>
                    )}
                    {m.body}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {formatDateTime(m.createdAt)}
                </span>
              </div>
            )
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        {isClosed ? (
          <div className="border-t p-4 bg-gray-50 text-center text-xs text-muted-foreground">
            This support ticket has been marked as <strong>{ticket.status}</strong>. If you still need help, please submit a new ticket.
          </div>
        ) : (
          <form onSubmit={handleSend} className="border-t p-3 sm:p-4 bg-white flex items-center gap-2">
            <Input
              placeholder="Type your reply message..."
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
