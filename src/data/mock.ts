import type {
  Ticket,
  User,
  Order,
  PurchasedTicket,
  SupportTicket,
  SupportMessage,
  Notification,
  AdminStats,
  Payment,
  Role,
} from '@/types'

// ── Roles ───────────────────────────────────────
export const MOCK_ROLES: Role[] = [
  {
    _id: 'r1',
    name: 'customer',
    permissions: [
      'ticket:view-my',
      'order:create',
      'order:cancel',
      'payment:create',
      'support:create',
      'support:reply',
      'notification:read',
    ],
  },
  {
    _id: 'r2',
    name: 'admin',
    permissions: ['*'],
  },
  {
    _id: 'r3',
    name: 'agent',
    permissions: [
      'support:read',
      'support:reply',
      'support:resolve',
      'ticket:read',
      'order:read',
    ],
  },
]

// ── Users ───────────────────────────────────────
export const MOCK_USER: User = {
  _id: 'u1',
  email: 'demo@example.com',
  fullName: 'Ko Mg Mg',
  role: MOCK_ROLES[0],
  status: 'active',
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00Z',
}

export const MOCK_ADMIN: User = {
  _id: 'u2',
  email: 'admin@pja.com',
  fullName: 'Admin User',
  role: MOCK_ROLES[1],
  status: 'active',
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00Z',
}

export const MOCK_USERS: User[] = [
  MOCK_USER,
  MOCK_ADMIN,
  {
    _id: 'u3',
    email: 'agent@pja.com',
    fullName: 'Agent One',
    role: MOCK_ROLES[2],
    status: 'active',
    emailVerified: true,
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    _id: 'u4',
    email: 'banned@example.com',
    fullName: 'Banned User',
    role: MOCK_ROLES[0],
    status: 'banned',
    emailVerified: false,
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    _id: 'u5',
    email: 'inactive@example.com',
    fullName: 'Inactive User',
    role: MOCK_ROLES[0],
    status: 'inactive',
    emailVerified: true,
    createdAt: '2026-04-01T00:00:00Z',
  },
]

// ── Tickets ─────────────────────────────────────
export const MOCK_TICKETS: Ticket[] = [
  {
    _id: '1',
    name: 'Myanmar Music Festival 2026',
    description:
      'The biggest music event of the year featuring top Myanmar artists. Enjoy live performances, food stalls, and more.',
    price: 25000,
    currency: 'MMK',
    eventDate: '2026-12-15T18:00:00Z',
    quantity: 500,
    sold: 320,
    status: 'published',
    category: 'Concert',
    tags: ['music', 'festival'],
    images: [],
    createdAt: '2026-10-01T00:00:00Z',
  },
  {
    _id: '2',
    name: 'Tech Conference Yangon',
    description:
      'Annual technology conference for developers and entrepreneurs. Keynotes, workshops, and networking.',
    price: 50000,
    currency: 'MMK',
    eventDate: '2026-11-20T09:00:00Z',
    quantity: 200,
    sold: 180,
    status: 'published',
    category: 'Workshop',
    tags: ['tech', 'dev'],
    images: [],
    createdAt: '2026-10-01T00:00:00Z',
  },
  {
    _id: '3',
    name: 'Mandalay Food Expo',
    description: 'Discover the best cuisines from all over Myanmar.',
    price: 5000,
    currency: 'MMK',
    eventDate: '2026-11-05T10:00:00Z',
    quantity: 1000,
    sold: 1000,
    status: 'sold_out',
    category: 'Festival',
    tags: ['food'],
    images: [],
    createdAt: '2026-10-01T00:00:00Z',
  },
  {
    _id: '4',
    name: 'Startup Pitch Night',
    description: 'Watch emerging startups pitch to investors.',
    price: 15000,
    currency: 'MMK',
    eventDate: '2026-12-01T19:00:00Z',
    quantity: 150,
    sold: 45,
    status: 'published',
    category: 'Workshop',
    tags: ['startup', 'business'],
    images: [],
    createdAt: '2026-10-01T00:00:00Z',
  },
  {
    _id: '5',
    name: 'Yangon Jazz Night',
    description: 'An intimate jazz evening at Strand Hotel.',
    price: 35000,
    currency: 'MMK',
    eventDate: '2026-11-30T20:00:00Z',
    quantity: 80,
    sold: 10,
    status: 'draft',
    category: 'Concert',
    tags: ['jazz', 'music'],
    images: [],
    createdAt: '2026-10-01T00:00:00Z',
  },
  {
    _id: '6',
    name: 'Photography Workshop',
    description:
      'Learn portrait and landscape photography from professionals.',
    price: 45000,
    currency: 'MMK',
    eventDate: '2026-12-20T09:00:00Z',
    quantity: 30,
    sold: 12,
    status: 'published',
    category: 'Workshop',
    tags: ['photography', 'art'],
    images: [],
    createdAt: '2026-10-01T00:00:00Z',
  },
]

// ── Orders ───────────────────────────────────────
export const MOCK_ORDERS: Order[] = [
  {
    _id: 'o1',
    orderCode: 'ORD-20261015-001',
    userId: 'u1',
    items: [
      {
        ticketId: '1',
        name: 'Myanmar Music Festival 2026',
        price: 25000,
        qty: 2,
        subtotal: 50000,
      },
    ],
    totalAmount: 50000,
    currency: 'MMK',
    status: 'pending',
    expiresAt: new Date(Date.now() + 600000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'o2',
    orderCode: 'ORD-20261010-002',
    userId: 'u1',
    items: [
      {
        ticketId: '2',
        name: 'Tech Conference Yangon',
        price: 50000,
        qty: 1,
        subtotal: 50000,
      },
    ],
    totalAmount: 50000,
    currency: 'MMK',
    status: 'paid',
    expiresAt: '2026-10-10T10:15:00Z',
    paidAt: '2026-10-10T09:20:00Z',
    createdAt: '2026-10-10T09:00:00Z',
  },
  {
    _id: 'o3',
    orderCode: 'ORD-20261005-003',
    userId: 'u1',
    items: [
      {
        ticketId: '4',
        name: 'Startup Pitch Night',
        price: 15000,
        qty: 1,
        subtotal: 15000,
      },
    ],
    totalAmount: 15000,
    currency: 'MMK',
    status: 'cancelled',
    expiresAt: '2026-10-05T10:00:00Z',
    cancelledAt: '2026-10-05T09:30:00Z',
    cancelReason: 'Changed mind',
    createdAt: '2026-10-05T09:00:00Z',
  },
]

// ── Payments ─────────────────────────────────────
export const MOCK_PAYMENTS: Payment[] = [
  {
    _id: 'pay1',
    paymentCode: 'PAY-20261010-001',
    orderId: 'o2',
    userId: 'u1',
    amount: 50000,
    currency: 'MMK',
    method: 'mock',
    status: 'success',
    paidAt: '2026-10-10T09:20:00Z',
    createdAt: '2026-10-10T09:18:00Z',
  },
  {
    _id: 'pay2',
    paymentCode: 'PAY-20261008-002',
    orderId: 'o3',
    userId: 'u1',
    amount: 15000,
    currency: 'MMK',
    method: 'mock',
    status: 'failed',
    failedAt: '2026-10-08T10:00:00Z',
    failureReason: 'Insufficient balance',
    createdAt: '2026-10-08T09:58:00Z',
  },
]

// ── Purchased Tickets ────────────────────────────
export const MOCK_PURCHASED: PurchasedTicket[] = [
  {
    _id: 'pt1',
    code: 'TKT-A1B2C3',
    qrPayload: 'QR-PAYLOAD-SECURE-001',
    userId: 'u1',
    orderId: 'o2',
    ticketId: '2',
    ticketName: 'Tech Conference Yangon',
    price: 50000,
    currency: 'MMK',
    status: 'issued',
    issuedAt: '2026-10-10T09:21:00Z',
    createdAt: '2026-10-10T09:21:00Z',
  },
]

// ── Support Tickets ──────────────────────────────
export const MOCK_SUPPORT: SupportTicket[] = [
  {
    _id: 's1',
    ticketCode: 'SUP-20261015-001',
    subject: 'Payment not reflecting',
    description: 'I paid but order still shows pending',
    category: 'payment',
    status: 'open',
    priority: 'high',
    customerId: 'u1',
    agentId: null,
    messageCount: 2,
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: 's2',
    ticketCode: 'SUP-20261012-002',
    subject: 'Cannot download ticket',
    description: 'QR code not loading on my device',
    category: 'ticket',
    status: 'resolved',
    priority: 'medium',
    customerId: 'u1',
    agentId: 'u3',
    messageCount: 5,
    resolvedAt: '2026-10-13T10:00:00Z',
    createdAt: '2026-10-12T09:00:00Z',
  },
]

// ── Support Messages ─────────────────────────────
export const MOCK_MESSAGES: SupportMessage[] = [
  {
    _id: 'm1',
    supportTicketId: 's1',
    senderId: 'u1',
    senderRole: 'customer',
    body: 'Hi, I paid for order ORD-20261015-001 but it still shows pending.',
    isInternal: false,
    createdAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    _id: 'm2',
    supportTicketId: 's1',
    senderId: 'u3',
    senderRole: 'agent',
    body: 'Thank you for reaching out! I\'m looking into this right now.',
    isInternal: false,
    createdAt: new Date(Date.now() - 120000).toISOString(),
  },
  {
    _id: 'm3',
    supportTicketId: 's2',
    senderId: 'u1',
    senderRole: 'customer',
    body: 'The QR code shows a blank screen on iOS Safari.',
    isInternal: false,
    createdAt: '2026-10-12T09:05:00Z',
  },
  {
    _id: 'm4',
    supportTicketId: 's2',
    senderId: 'u3',
    senderRole: 'agent',
    body: 'This is a known issue with iOS Safari. Please try Chrome.',
    isInternal: false,
    createdAt: '2026-10-12T10:00:00Z',
  },
  {
    _id: 'm5',
    supportTicketId: 's2',
    senderId: 'u1',
    senderRole: 'customer',
    body: 'Works on Chrome, thank you!',
    isInternal: false,
    createdAt: '2026-10-13T09:00:00Z',
  },
]

// ── Notifications ────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    _id: 'n1',
    userId: 'u1',
    type: 'ticket_issued',
    title: 'Tickets Issued!',
    body: 'Your tickets for Tech Conference Yangon are ready.',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'n2',
    userId: 'u1',
    type: 'payment_success',
    title: 'Payment Successful',
    body: 'Payment of 50,000 MMK confirmed.',
    isRead: true,
    readAt: '2026-10-10T09:25:00Z',
    createdAt: '2026-10-10T09:21:00Z',
  },
  {
    _id: 'n3',
    userId: 'u1',
    type: 'support_reply',
    title: 'New Reply on Your Support Ticket',
    body: 'An agent replied to SUP-20261015-001.',
    isRead: false,
    createdAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    _id: 'n4',
    userId: 'u1',
    type: 'order_cancelled',
    title: 'Order Cancelled',
    body: 'Your order ORD-20261005-003 has been cancelled.',
    isRead: true,
    readAt: '2026-10-05T09:35:00Z',
    createdAt: '2026-10-05T09:30:00Z',
  },
]

// ── Admin Stats ──────────────────────────────────
export const MOCK_STATS: AdminStats = {
  users: { total: 1247, active: 1198 },
  tickets: { total: 24, published: 18 },
  orders: { total: 856, pending: 43, paid: 781 },
  payments: { total: 856, success: 781, revenue: 28450000 },
  purchasedTickets: { total: 1562, used: 423 },
  support: { total: 67, open: 12 },
}

// ── Revenue chart data (last 7 days) ─────────────
export const MOCK_REVENUE_CHART = [
  { day: 'Mon', revenue: 3200000 },
  { day: 'Tue', revenue: 5100000 },
  { day: 'Wed', revenue: 4700000 },
  { day: 'Thu', revenue: 6800000 },
  { day: 'Fri', revenue: 7900000 },
  { day: 'Sat', revenue: 2300000 },
  { day: 'Sun', revenue: 4500000 },
]

// ── Audit Logs ───────────────────────────────────
export const MOCK_AUDIT_LOGS = [
  {
    id: 'al1',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    actor: 'admin@pja.com',
    action: 'user.ban',
    target: 'banned@example.com',
    ip: '192.168.1.100',
  },
  {
    id: 'al2',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    actor: 'admin@pja.com',
    action: 'ticket.publish',
    target: 'Myanmar Music Festival 2026',
    ip: '192.168.1.100',
  },
  {
    id: 'al3',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    actor: 'agent@pja.com',
    action: 'support.resolve',
    target: 'SUP-20261012-002',
    ip: '10.0.0.55',
  },
]

export const MOCK_ACTIVITY_LOGS = [
  {
    id: 'act1',
    timestamp: new Date(Date.now() - 30000).toISOString(),
    user: 'demo@example.com',
    eventType: 'order.created',
    entity: 'ORD-20261015-001',
  },
  {
    id: 'act2',
    timestamp: new Date(Date.now() - 90000).toISOString(),
    user: 'demo@example.com',
    eventType: 'payment.success',
    entity: 'PAY-20261010-001',
  },
  {
    id: 'act3',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    user: 'admin@pja.com',
    eventType: 'user.login',
    entity: 'u2',
  },
]
