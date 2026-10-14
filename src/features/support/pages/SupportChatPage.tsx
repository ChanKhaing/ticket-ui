import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { MOCK_SUPPORT, MOCK_MESSAGES } from '@/data/mock'
import { formatDateTime } from '@/lib/utils'
import type { SupportMessage } from '@/types'

export function SupportChatPage() {
  const { id } = useParams<{ id: string }>()
  const [messages, setMessages] = useState<SupportMessage[]>(
    MOCK_MESSAGES.filter((m) => m.supportTicketId === id && !m.isInternal)
  )
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const ticket = MOCK_SUPPORT.find((t) => t._id === id) || MOCK_SUPPORT[0]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMsg: SupportMessage = {
      _id: `m_${Date.now()}`,
      supportTicketId: ticket._id,
      senderId: 'u1',
      senderRole: 'customer',
      body: input.trim(),
      isInternal: false,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newMsg])
    setInput('')

    // Simulate Agent reply
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const agentReply: SupportMessage = {
        _id: `m_reply_${Date.now()}`,
        supportTicketId: ticket._id,
        senderId: 'u3',
        senderRole: 'agent',
        body: 'Thank you for your update. Our team has received your message and will respond shortly.',
        isInternal: false,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, agentReply])
    }, 1800)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/user/support">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tickets
        </Link>
      </Button>

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
          {messages.map((m) => {
            const isCustomer = m.senderRole === 'customer'
            return (
              <div
                key={m._id}
                className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[80%]">
                  {!isCustomer && (
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                      SP
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-xs ${
                      isCustomer
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-white border text-gray-900 rounded-bl-xs'
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {formatDateTime(m.createdAt)}
                </span>
              </div>
            )
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                SP
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl bg-white border px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="border-t p-3 sm:p-4 bg-white flex items-center gap-2">
          <Input
            placeholder="Type your reply here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-lg"
          />
          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-4"
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
