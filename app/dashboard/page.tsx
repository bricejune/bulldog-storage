'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, Mail } from 'lucide-react'

type PlanId = 'individual' | 'essentials' | 'flex' | 'flexplus' | 'group'

type BookingState = {
  email: string
  step: number
  agreedToTerms: boolean
  plan: PlanId | null
  items: { tier1: number; tier2: number; tier3: number }
  individualItems: string[]
  boxesNeeded: number
  extraBoxes: number
  itemNotes: string
  pickupDate: string
  pickupDateUnsure: boolean
  pickupTime: 'morning' | 'afternoon'
  returnDate: string
  returnDateUnsure: boolean
  returnTime: 'morning' | 'afternoon'
  name: string
  phone: string
  dorm: string
  promoCode: string
  promoApplied: boolean
  additionalNotes: string
  conditionAcknowledged: boolean
  attendedPickup: boolean
  pickupInstructions: string
  bookingRef: string
  confirmed: boolean
}

const PLAN_LABELS: Record<PlanId, string> = {
  individual: 'Individual',
  essentials: 'Essentials',
  flex: 'Flex',
  flexplus: 'Flex Plus',
  group: 'Group',
}

const PLAN_FREE_BOXES: Record<PlanId, number> = {
  individual: 0,
  essentials: 3,
  flex: 7,
  flexplus: 12,
  group: 20,
}

export default function DashboardPage() {
  const [booking, setBooking] = useState<BookingState | null>(null)
  const [editItemsOpen, setEditItemsOpen] = useState(false)
  const [boxDeliveryDate, setBoxDeliveryDate] = useState('')
  const [boxDeliveryOption, setBoxDeliveryOption] = useState<'pickup-day' | 'early'>('pickup-day')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bulldog-booking')
      if (saved) {
        const parsed = JSON.parse(saved) as BookingState
        setBooking(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  const formatDate = (d: string) => {
    if (!d) return '—'
    const dt = new Date(d + 'T00:00:00')
    return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
  }

  if (!booking || !booking.confirmed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="text-center">
          <p className="text-gray-500 mb-4">No booking found.</p>
          <Link
            href="/book"
            className="inline-block px-6 py-3 rounded-xl text-white font-semibold text-sm"
            style={{ backgroundColor: '#1B2A4A' }}
          >
            Book Now →
          </Link>
        </div>
      </div>
    )
  }

  const planLabel = booking.plan ? PLAN_LABELS[booking.plan] : '—'
  const freeBoxes = booking.plan ? PLAN_FREE_BOXES[booking.plan] : 0
  const totalItems = booking.plan === 'individual'
    ? booking.individualItems?.length ?? 0
    : (booking.items.tier1 === -1 ? 0 : booking.items.tier1 + booking.items.tier2 + booking.items.tier3)

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-navy transition-colors">
            ← Back to home
          </Link>
          <span className="text-xl font-bold">
            <span style={{ color: '#1B2A4A' }}>Bulldog</span>
            <span style={{ color: '#F5A623' }}> Storage</span>
          </span>
        </div>

        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B2A4A' }}>My Booking</h1>
        <p className="text-sm text-gray-500 mb-8">Here&apos;s everything about your storage with us.</p>

        <div className="flex flex-col gap-5">

          {/* Booking Overview */}
          <Card title="Booking Overview">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Reference</p>
                <p className="text-lg font-bold tracking-wider" style={{ color: '#1B2A4A' }}>{booking.bookingRef}</p>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: '#1B2A4A' }}
              >
                Confirmed
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400 mb-0.5">Plan</p>
                <p className="font-semibold" style={{ color: '#1B2A4A' }}>{planLabel}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">Email</p>
                <p className="font-medium text-gray-700">{booking.email}</p>
              </div>
            </div>
          </Card>

          {/* Your Items */}
          <Card
            title="Your Items"
            action={
              <button
                onClick={() => setEditItemsOpen(!editItemsOpen)}
                className="text-xs font-semibold underline"
                style={{ color: '#F5A623' }}
              >
                {editItemsOpen ? 'Close' : 'Edit Items'}
              </button>
            }
          >
            {booking.plan === 'individual' ? (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  {booking.individualItems?.length ?? 0} items selected
                </p>
                <ul className="space-y-1.5">
                  {(booking.individualItems ?? []).map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={13} style={{ color: '#1B2A4A' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : booking.items.tier1 === -1 ? (
              <p className="text-sm text-gray-500 italic">
                You indicated you&apos;re still figuring out what you&apos;re bringing. Update your items before pickup day.
              </p>
            ) : (
              <div className="flex gap-4 text-sm">
                <span className="text-gray-600">Tier 1: <strong style={{ color: '#1B2A4A' }}>{booking.items.tier1}</strong></span>
                <span className="text-gray-600">Tier 2: <strong style={{ color: '#1B2A4A' }}>{booking.items.tier2}</strong></span>
                <span className="text-gray-600">Tier 3: <strong style={{ color: '#1B2A4A' }}>{booking.items.tier3}</strong></span>
              </div>
            )}

            {editItemsOpen && (
              <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: '#F5A62308', border: '1px solid #F5A62340' }}>
                <p className="text-sm text-gray-600 mb-2">
                  Need to update your items? Email us and we&apos;ll make adjustments before pickup.
                </p>
                <a
                  href={`mailto:help@bulldogstorage.us?subject=Item Update — ${booking.bookingRef}&body=Hi, I'd like to update my items for booking ${booking.bookingRef}.`}
                  className="inline-block text-sm font-semibold underline"
                  style={{ color: '#1B2A4A' }}
                >
                  Email help@bulldogstorage.us →
                </a>
              </div>
            )}
          </Card>

          {/* Pickup Date */}
          <Card title="Pickup Date">
            {booking.pickupDateUnsure || !booking.pickupDate ? (
              <div>
                <p className="text-sm text-gray-500 italic mb-3">
                  TBD — you haven&apos;t set a move-out date yet.
                </p>
                <a
                  href={`mailto:help@bulldogstorage.us?subject=Set Pickup Date — ${booking.bookingRef}`}
                  className="text-sm font-semibold underline"
                  style={{ color: '#1B2A4A' }}
                >
                  Contact us to set a date →
                </a>
              </div>
            ) : (
              <div>
                <p className="text-base font-semibold" style={{ color: '#1B2A4A' }}>{formatDate(booking.pickupDate)}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {booking.pickupTime === 'morning' ? 'Morning (8am–12pm)' : 'Afternoon (12pm–4pm)'}
                </p>
              </div>
            )}
          </Card>

          {/* Return Date */}
          <Card title="Return Date">
            {booking.returnDateUnsure || !booking.returnDate ? (
              <div>
                <p className="text-sm text-gray-500 italic mb-3">
                  TBD — you haven&apos;t set a return date yet.
                </p>
                <a
                  href={`mailto:help@bulldogstorage.us?subject=Set Return Date — ${booking.bookingRef}`}
                  className="text-sm font-semibold underline"
                  style={{ color: '#1B2A4A' }}
                >
                  Contact us to set a date →
                </a>
              </div>
            ) : (
              <div>
                <p className="text-base font-semibold" style={{ color: '#1B2A4A' }}>{formatDate(booking.returnDate)}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {booking.returnTime === 'morning' ? 'Morning (8am–12pm)' : 'Afternoon (12pm–4pm)'}
                </p>
              </div>
            )}
          </Card>

          {/* Shipping Materials */}
          {freeBoxes > 0 && (
            <Card title="Shipping Materials">
              <p className="text-sm text-gray-600 mb-4">
                Your {planLabel} plan includes <strong>{freeBoxes} free boxes</strong>. When would you like them delivered?
              </p>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: boxDeliveryOption === 'pickup-day' ? '#1B2A4A' : '#d1d5db',
                      backgroundColor: boxDeliveryOption === 'pickup-day' ? '#1B2A4A' : '#ffffff',
                    }}
                  >
                    {boxDeliveryOption === 'pickup-day' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <input type="radio" name="boxDelivery" value="pickup-day" checked={boxDeliveryOption === 'pickup-day'} onChange={() => setBoxDeliveryOption('pickup-day')} className="sr-only" />
                  <span className="text-sm text-gray-700">Boxes delivered on pickup day (default)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: boxDeliveryOption === 'early' ? '#1B2A4A' : '#d1d5db',
                      backgroundColor: boxDeliveryOption === 'early' ? '#1B2A4A' : '#ffffff',
                    }}
                  >
                    {boxDeliveryOption === 'early' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <input type="radio" name="boxDelivery" value="early" checked={boxDeliveryOption === 'early'} onChange={() => setBoxDeliveryOption('early')} className="sr-only" />
                  <span className="text-sm text-gray-700">I&apos;d like my boxes delivered earlier</span>
                </label>
              </div>
              {boxDeliveryOption === 'early' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred delivery date</label>
                  <input
                    type="date"
                    value={boxDeliveryDate}
                    onChange={(e) => setBoxDeliveryDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    Email us at{' '}
                    <a href="mailto:help@bulldogstorage.us" style={{ color: '#1B2A4A' }} className="underline">help@bulldogstorage.us</a>
                    {' '}to confirm your preferred date.
                  </p>
                </div>
              )}
              {boxDeliveryOption === 'pickup-day' && (
                <p className="text-xs text-gray-400 mt-3">
                  We&apos;ll bring your {freeBoxes} free boxes on pickup day unless you&apos;d like them earlier.
                </p>
              )}
            </Card>
          )}

          {/* Pickup Coordination */}
          <Card title="Pickup Coordination">
            {booking.attendedPickup ? (
              <p className="text-sm text-gray-700">You indicated you&apos;ll be present when we arrive.</p>
            ) : (
              <div>
                <p className="text-sm text-gray-700 mb-2">Unattended pickup — you&apos;ll leave items accessible.</p>
                {booking.pickupInstructions && (
                  <div className="rounded-xl p-3 text-sm italic text-gray-600" style={{ backgroundColor: '#1B2A4A08' }}>
                    &ldquo;{booking.pickupInstructions}&rdquo;
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Contact Support */}
          <Card title="Need Help?">
            <div className="flex items-center gap-3">
              <Mail size={18} style={{ color: '#1B2A4A' }} />
              <a
                href="mailto:help@bulldogstorage.us"
                className="text-sm font-medium underline"
                style={{ color: '#1B2A4A' }}
              >
                help@bulldogstorage.us
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-2">We typically respond within a few hours.</p>
          </Card>

        </div>

        <p className="text-center text-xs text-gray-400 mt-10">
          Booking {booking.bookingRef} · {totalItems} item{totalItems !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}

function Card({
  title,
  children,
  action,
}: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold" style={{ color: '#1B2A4A' }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}
