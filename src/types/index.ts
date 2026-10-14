// ── Enums ──────────────────────────────────────
export type TicketStatus = 'draft' | 'published' | 'sold_out' | 'cancelled'
export type OrderStatus = 'pending' | 'paid' | 'completed' | 'cancelled' | 'expired'
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded'
export type PaymentMethod = 'mock' | 'card' | 'wallet'
export type PurchasedTicketStatus = 'issued' | 'used' | 'cancelled' | 'refunded'
export type SupportStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type SupportPriority = 'low' | 'medium' | 'high' | 'urgent'
export type SupportCategory = 'payment' | 'ticket' | 'account' | 'other'
export type UserStatus = 'active' | 'inactive' | 'banned'
export type NotificationType =
  | 'payment_success'
  | 'payment_failed'
  | 'ticket_issued'
  | 'order_cancelled'
  | 'support_reply'
  | 'support_resolved'
  | 'support_assigned'
  | 'system'
export type SenderRole = 'customer' | 'agent' | 'admin' | 'system'

// ── Core Models ────────────────────────────────
export interface Role {
  _id: string
  name: string
  permissions: string[]
}

export interface User {
  _id: string
  email: string
  fullName: string
  phone?: string
  avatarUrl?: string
  role: Role
  status: UserStatus
  emailVerified: boolean
  lastLoginAt?: string
  createdAt: string
}

export interface Ticket {
  _id: string
  name: string
  description?: string
  price: number
  currency: string
  eventDate: string
  quantity: number
  sold: number
  status: TicketStatus
  category?: string
  tags: string[]
  images: string[]
  createdAt: string
}

export interface OrderItem {
  ticketId: string
  name: string
  price: number
  qty: number
  subtotal: number
}

export interface Order {
  _id: string
  orderCode: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  currency: string
  status: OrderStatus
  expiresAt: string
  paidAt?: string
  cancelledAt?: string
  note?: string
  cancelReason?: string
  createdAt: string
}

export interface Payment {
  _id: string
  paymentCode: string
  orderId: string
  userId: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  paidAt?: string
  failedAt?: string
  failureReason?: string
  createdAt: string
}

export interface PurchasedTicket {
  _id: string
  code: string
  qrPayload: string
  userId: string
  orderId: string
  ticketId: string
  ticketName: string
  price: number
  currency: string
  status: PurchasedTicketStatus
  issuedAt: string
  usedAt?: string
  cancelledAt?: string
  createdAt: string
}

export interface SupportTicket {
  _id: string
  ticketCode: string
  subject: string
  description: string
  category: SupportCategory
  status: SupportStatus
  priority: SupportPriority
  customerId: string | User
  agentId?: string | User | null
  messageCount: number
  lastMessageAt?: string
  resolvedAt?: string
  closedAt?: string
  resolutionNote?: string
  createdAt: string
}

export interface SupportMessage {
  _id: string
  supportTicketId: string
  senderId: string | User
  senderRole: SenderRole
  body: string
  isInternal: boolean
  readAt?: string
  createdAt: string
}

export interface Notification {
  _id: string
  userId: string
  type: NotificationType
  title: string
  body?: string
  payload?: Record<string, unknown>
  isRead: boolean
  readAt?: string
  createdAt: string
}

export interface AdminStats {
  users: { total: number; active: number }
  tickets: { total: number; published: number }
  orders: { total: number; pending: number; paid: number }
  payments: { total: number; success: number; revenue: number }
  purchasedTickets: { total: number; used: number }
  support: { total: number; open: number }
}

// ── Auth helpers ───────────────────────────────
export type AuthUser = User

export interface NormalizedError {
  code: string
  message: string
  details: string[]
  status: number
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

// ── API Response ───────────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
}