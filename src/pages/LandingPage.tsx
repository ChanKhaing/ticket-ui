import { Link, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, ArrowRight, Shield, Users, Zap, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { MOCK_TICKETS } from '@/data/mock'
import { formatCurrency, formatDate } from '@/lib/utils'

export function LandingPage() {
  const navigate = useNavigate()
  const featured = MOCK_TICKETS.filter((t) => t.status === 'published').slice(0, 3)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Book Your Perfect<br />
            <span className="text-indigo-200">Event Tickets</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-indigo-100">
            Discover concerts, workshops, festivals and more. Secure your spot for unforgettable experiences across Myanmar.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold px-8"
              onClick={() => navigate('/tickets')}
            >
              Browse Tickets
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8"
              onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { icon: Ticket, stat: '500+', label: 'Events' },
              { icon: Users, stat: '10,000+', label: 'Happy Customers' },
              { icon: Shield, stat: '100%', label: 'Secure' },
            ].map(({ icon: Icon, stat, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon className="h-8 w-8 text-indigo-600" />
                <span className="text-2xl font-bold text-gray-900">{stat}</span>
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Featured Events</h2>
            <p className="mt-2 text-muted-foreground">Don't miss out on these popular events</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((ticket) => (
              <div
                key={ticket._id}
                className="group rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Gradient image placeholder */}
                <div className="h-44 bg-gradient-to-br from-indigo-400 to-purple-500 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Ticket className="h-12 w-12 text-white/60" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={ticket.status} />
                  </div>
                  {ticket.category && (
                    <div className="absolute top-3 left-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {ticket.category}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{ticket.name}</h3>
                  <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(ticket.eventDate)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Myanmar</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-indigo-600">
                      {formatCurrency(ticket.price)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {ticket.quantity - ticket.sold} left
                    </span>
                  </div>
                  <Button
                    className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700"
                    asChild
                  >
                    <Link to={`/tickets/${ticket._id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/tickets">View All Events <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-2 text-muted-foreground">Get your tickets in 3 easy steps</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: '01',
                icon: '🔍',
                title: 'Browse Events',
                desc: 'Discover amazing concerts, workshops, and festivals happening near you.',
              },
              {
                step: '02',
                icon: '🎟️',
                title: 'Book Tickets',
                desc: 'Select your tickets, choose quantity, and complete secure payment instantly.',
              },
              {
                step: '03',
                icon: '🎉',
                title: 'Enjoy the Event',
                desc: 'Show your QR code at the entrance and enjoy an unforgettable experience.',
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-3xl">
                  {icon}
                </div>
                <span className="absolute -top-2 right-[calc(50%-2.5rem)] text-5xl font-black text-gray-100 select-none">
                  {step}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
