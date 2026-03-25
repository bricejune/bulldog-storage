'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type PlanId = 'individual' | 'essentials' | 'flex' | 'flexplus' | 'group'

type BookingState = {
  email: string
  step: number
  agreedToTerms: boolean
  plan: PlanId | null
  items: { tier1: number; tier2: number; tier3: number }
  itemsUnsure: boolean
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

const PLAN_PRICES: Record<PlanId, string> = {
  individual: '$50/item ($100 min)',
  essentials: '$175',
  flex: '$250',
  flexplus: '$419.99',
  group: '$700',
}

const PLAN_FREE_BOXES: Record<PlanId, number> = {
  individual: 0,
  essentials: 3,
  flex: 7,
  flexplus: 12,
  group: 20,
}

const ALL_PLANS: PlanId[] = ['individual', 'essentials', 'flex', 'flexplus', 'group']

const DORMS = [
  'Bingham Hall', 'Branford College', 'Davenport College', 'Durfee Hall', 'Farnam Hall',
  'Grace Hopper College', 'Jonathan Edwards College', 'Lanman-Wright Hall', 'Lawrence Hall',
  'Lawrance Hall', 'Morse College', 'Old Campus', 'Pierson College', 'Saybrook College',
  'Silliman College', 'Stiles College', 'Timothy Dwight College', 'Trumbull College',
  'Vanderbilt Hall', 'Welch Hall', 'Other',
]

const INDIVIDUAL_ITEMS = [
  'Handbag', 'Moving Box', 'Tote Bin', 'Storage Tub', 'Duffel Bag', 'Suitcase', 'Hard-Shell Case', 'Basket',
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(d: string) {
  if (!d) return '—'
  const dt = new Date(d + 'T00:00:00')
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
}

// ---------------------------------------------------------------------------
// Card wrapper
// ---------------------------------------------------------------------------

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

function SavedBadge({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <span className="text-xs font-semibold ml-2" style={{ color: '#16a34a' }}>
      Saved ✓
    </span>
  )
}

function EditButton({ onClick, label = 'Edit' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-semibold underline"
      style={{ color: '#F5A623' }}
    >
      {label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const [booking, setBooking] = useState<BookingState | null>(null)

  // Per-card edit states
  const [planEdit, setPlanEdit] = useState(false)
  const [planDraft, setPlanDraft] = useState<PlanId | null>(null)
  const [planSaved, setPlanSaved] = useState(false)

  const [itemsEdit, setItemsEdit] = useState(false)
  const [itemsDraftUnsure, setItemsDraftUnsure] = useState(false)
  const [itemsDraftTier1, setItemsDraftTier1] = useState(0)
  const [itemsDraftTier2, setItemsDraftTier2] = useState(0)
  const [itemsDraftTier3, setItemsDraftTier3] = useState(0)
  const [itemsDraftIndividual, setItemsDraftIndividual] = useState<string[]>([])
  const [itemsSaved, setItemsSaved] = useState(false)

  const [pickupEdit, setPickupEdit] = useState(false)
  const [pickupDateDraft, setPickupDateDraft] = useState('')
  const [pickupTimeDraft, setPickupTimeDraft] = useState<'morning' | 'afternoon'>('morning')
  const [pickupUnsureDraft, setPickupUnsureDraft] = useState(false)
  const [pickupSaved, setPickupSaved] = useState(false)

  const [returnEdit, setReturnEdit] = useState(false)
  const [returnDateDraft, setReturnDateDraft] = useState('')
  const [returnTimeDraft, setReturnTimeDraft] = useState<'morning' | 'afternoon'>('morning')
  const [returnUnsureDraft, setReturnUnsureDraft] = useState(false)
  const [returnSaved, setReturnSaved] = useState(false)

  const [shippingEdit, setShippingEdit] = useState(false)
  const [boxDeliveryOption, setBoxDeliveryOption] = useState<'pickup-day' | 'early'>('pickup-day')
  const [boxDeliveryDate, setBoxDeliveryDate] = useState('')
  const [shippingSaved, setShippingSaved] = useState(false)

  const [pickupCoordEdit, setPickupCoordEdit] = useState(false)
  const [attendedDraft, setAttendedDraft] = useState(true)
  const [instructionsDraft, setInstructionsDraft] = useState('')
  const [pickupCoordSaved, setPickupCoordSaved] = useState(false)

  const [detailsEdit, setDetailsEdit] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [phoneDraft, setPhoneDraft] = useState('')
  const [dormDraft, setDormDraft] = useState('')
  const [detailsSaved, setDetailsSaved] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) return
    try {
      const saved = localStorage.getItem(`bulldog-booking-${user.id}`)
      if (saved) {
        const parsed = JSON.parse(saved) as BookingState
        setBooking(parsed)
      }
    } catch {
      // ignore
    }
  }, [user, authLoading])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="w-8 h-8 rounded-full border-4 border-gray-200 animate-spin" style={{ borderTopColor: '#1B2A4A' }} />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="text-center max-w-sm">
          <p className="text-gray-600 mb-4 text-base">Please sign in to view your dashboard.</p>
          <Link
            href="/auth?redirect=/dashboard"
            className="inline-block px-6 py-3 rounded-xl text-white font-semibold text-sm"
            style={{ backgroundColor: '#1B2A4A' }}
          >
            Sign In →
          </Link>
        </div>
      </div>
    )
  }

  if (!booking || !booking.confirmed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="text-center max-w-sm">
          <p className="text-gray-600 mb-2 text-base font-medium">No booking yet, {user.name.split(' ')[0]}.</p>
          <p className="text-gray-400 text-sm mb-6">Start a booking to see your details here.</p>
          <Link
            href="/book"
            className="inline-block px-6 py-3 rounded-xl text-white font-semibold text-sm"
            style={{ backgroundColor: '#F5A623' }}
          >
            Book Now →
          </Link>
        </div>
      </div>
    )
  }

  // Helpers
  const storageKey = `bulldog-booking-${user.id}`

  const saveBooking = (updated: BookingState) => {
    setBooking(updated)
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch {
      // ignore
    }
  }

  const planLabel = booking.plan ? PLAN_LABELS[booking.plan] : '—'
  const freeBoxes = booking.plan ? PLAN_FREE_BOXES[booking.plan] : 0
  const itemsUnsure = booking.itemsUnsure || booking.items.tier1 === -1
  const totalItems = booking.plan === 'individual'
    ? (booking.individualItems?.length ?? 0)
    : (itemsUnsure ? 0 : booking.items.tier1 + booking.items.tier2 + booking.items.tier3)

  const handleSignOut = () => {
    logout()
    router.push('/')
  }

  // Save handlers
  const handleSavePlan = () => {
    if (!planDraft) return
    const updated = { ...booking, plan: planDraft }
    saveBooking(updated)
    setPlanEdit(false)
    setPlanSaved(true)
    setTimeout(() => setPlanSaved(false), 2500)
  }

  const handleOpenItemsEdit = () => {
    setItemsDraftUnsure(itemsUnsure)
    setItemsDraftTier1(booking.items.tier1 === -1 ? 0 : booking.items.tier1)
    setItemsDraftTier2(booking.items.tier2)
    setItemsDraftTier3(booking.items.tier3)
    setItemsDraftIndividual(booking.individualItems ?? [])
    setItemsEdit(true)
  }

  const handleSaveItems = () => {
    let updated: BookingState
    if (itemsDraftUnsure) {
      updated = { ...booking, itemsUnsure: true, items: { tier1: -1, tier2: 0, tier3: 0 } }
    } else if (booking.plan === 'individual') {
      updated = { ...booking, itemsUnsure: false, individualItems: itemsDraftIndividual }
    } else {
      updated = { ...booking, itemsUnsure: false, items: { tier1: itemsDraftTier1, tier2: itemsDraftTier2, tier3: itemsDraftTier3 } }
    }
    saveBooking(updated)
    setItemsEdit(false)
    setItemsSaved(true)
    setTimeout(() => setItemsSaved(false), 2500)
  }

  const handleOpenPickupEdit = () => {
    setPickupDateDraft(booking.pickupDate)
    setPickupTimeDraft(booking.pickupTime)
    setPickupUnsureDraft(booking.pickupDateUnsure)
    setPickupEdit(true)
  }

  const handleSavePickup = () => {
    const updated = { ...booking, pickupDate: pickupUnsureDraft ? '' : pickupDateDraft, pickupTime: pickupTimeDraft, pickupDateUnsure: pickupUnsureDraft }
    saveBooking(updated)
    setPickupEdit(false)
    setPickupSaved(true)
    setTimeout(() => setPickupSaved(false), 2500)
  }

  const handleOpenReturnEdit = () => {
    setReturnDateDraft(booking.returnDate)
    setReturnTimeDraft(booking.returnTime)
    setReturnUnsureDraft(booking.returnDateUnsure)
    setReturnEdit(true)
  }

  const handleSaveReturn = () => {
    const updated = { ...booking, returnDate: returnUnsureDraft ? '' : returnDateDraft, returnTime: returnTimeDraft, returnDateUnsure: returnUnsureDraft }
    saveBooking(updated)
    setReturnEdit(false)
    setReturnSaved(true)
    setTimeout(() => setReturnSaved(false), 2500)
  }

  const handleSaveShipping = () => {
    setShippingEdit(false)
    setShippingSaved(true)
    setTimeout(() => setShippingSaved(false), 2500)
  }

  const handleOpenPickupCoordEdit = () => {
    setAttendedDraft(booking.attendedPickup)
    setInstructionsDraft(booking.pickupInstructions ?? '')
    setPickupCoordEdit(true)
  }

  const handleSavePickupCoord = () => {
    const updated = { ...booking, attendedPickup: attendedDraft, pickupInstructions: instructionsDraft }
    saveBooking(updated)
    setPickupCoordEdit(false)
    setPickupCoordSaved(true)
    setTimeout(() => setPickupCoordSaved(false), 2500)
  }

  const handleOpenDetailsEdit = () => {
    setNameDraft(booking.name)
    setPhoneDraft(booking.phone)
    setDormDraft(booking.dorm)
    setDetailsEdit(true)
  }

  const handleSaveDetails = () => {
    const updated = { ...booking, name: nameDraft, phone: phoneDraft, dorm: dormDraft }
    saveBooking(updated)
    setDetailsEdit(false)
    setDetailsSaved(true)
    setTimeout(() => setDetailsSaved(false), 2500)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Navy header */}
      <div className="px-4 py-6 sm:py-8" style={{ backgroundColor: '#1B2A4A' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/" className="text-white/60 text-xs hover:text-white/90 transition-colors mb-1 block">
              ← Back to home
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Hi, {user.name.split(' ')[0]}!
            </h1>
            <p className="text-white/60 text-sm mt-0.5">Your storage dashboard</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm font-semibold px-4 py-2 rounded-xl border-2 border-white/30 text-white hover:bg-white/10 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-5">

        {/* Booking Overview */}
        <Card title="Booking Overview">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Reference</p>
              <p className="text-lg font-bold tracking-wider" style={{ color: '#1B2A4A' }}>{booking.bookingRef}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-green-600">
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
              <p className="font-medium text-gray-700 truncate">{booking.email}</p>
            </div>
          </div>
        </Card>

        {/* Your Plan */}
        <Card
          title="Your Plan"
          action={
            <div className="flex items-center gap-2">
              <SavedBadge show={planSaved} />
              <EditButton onClick={() => { setPlanDraft(booking.plan); setPlanEdit(!planEdit) }} label={planEdit ? 'Close' : 'Edit'} />
            </div>
          }
        >
          {!planEdit ? (
            <div className="text-sm">
              <p className="font-semibold text-base" style={{ color: '#1B2A4A' }}>{planLabel}</p>
              <p className="text-gray-500 mt-0.5">{booking.plan ? PLAN_PRICES[booking.plan] : '—'}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {ALL_PLANS.map((p) => (
                <label
                  key={p}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all"
                  style={{
                    borderColor: planDraft === p ? '#F5A623' : '#e5e7eb',
                    backgroundColor: planDraft === p ? '#1B2A4A08' : '#ffffff',
                  }}
                >
                  <input
                    type="radio"
                    name="planSelect"
                    checked={planDraft === p}
                    onChange={() => setPlanDraft(p)}
                    className="sr-only"
                  />
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: planDraft === p ? '#F5A623' : '#d1d5db',
                      backgroundColor: planDraft === p ? '#F5A623' : '#ffffff',
                    }}
                  >
                    {planDraft === p && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm font-medium flex-1" style={{ color: '#1B2A4A' }}>{PLAN_LABELS[p]}</span>
                  <span className="text-xs text-gray-500">{PLAN_PRICES[p]}</span>
                </label>
              ))}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleSavePlan}
                  disabled={!planDraft}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-40"
                  style={{ backgroundColor: '#1B2A4A' }}
                >
                  Save
                </button>
                <button
                  onClick={() => setPlanEdit(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Your Items */}
        <Card
          title="Your Items"
          action={
            <div className="flex items-center gap-2">
              <SavedBadge show={itemsSaved} />
              <EditButton onClick={() => { if (itemsEdit) { setItemsEdit(false) } else { handleOpenItemsEdit() } }} label={itemsEdit ? 'Close' : 'Edit'} />
            </div>
          }
        >
          {!itemsEdit ? (
            itemsUnsure ? (
              <p className="text-sm italic text-gray-400">TBD — you&apos;ll confirm items at pickup</p>
            ) : booking.plan === 'individual' ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">{booking.individualItems?.length ?? 0} item(s) selected</p>
                <ul className="space-y-1.5">
                  {(booking.individualItems ?? []).map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={13} style={{ color: '#1B2A4A' }} />{item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex gap-4 text-sm">
                <span className="text-gray-600">Tier 1: <strong style={{ color: '#1B2A4A' }}>{booking.items.tier1}</strong></span>
                <span className="text-gray-600">Tier 2: <strong style={{ color: '#1B2A4A' }}>{booking.items.tier2}</strong></span>
                <span className="text-gray-600">Tier 3: <strong style={{ color: '#1B2A4A' }}>{booking.items.tier3}</strong></span>
              </div>
            )
          ) : (
            <div className="flex flex-col gap-4">
              {/* Unsure toggle */}
              <label
                className="flex items-start gap-3 cursor-pointer px-4 py-3 rounded-xl border-2 transition-all"
                style={{
                  borderColor: itemsDraftUnsure ? '#F5A623' : '#e5e7eb',
                  backgroundColor: itemsDraftUnsure ? '#F5A62308' : '#ffffff',
                }}
              >
                <input
                  type="checkbox"
                  checked={itemsDraftUnsure}
                  onChange={(e) => setItemsDraftUnsure(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                  style={{
                    borderColor: itemsDraftUnsure ? '#F5A623' : '#d1d5db',
                    backgroundColor: itemsDraftUnsure ? '#F5A623' : '#ffffff',
                  }}
                >
                  {itemsDraftUnsure && <Check size={11} color="white" strokeWidth={3} />}
                </div>
                <span className="text-sm text-gray-700">I&apos;m not sure yet</span>
              </label>

              {!itemsDraftUnsure && (
                booking.plan === 'individual' ? (
                  <div className="flex flex-col gap-2">
                    {INDIVIDUAL_ITEMS.map((item) => {
                      const checked = itemsDraftIndividual.includes(item)
                      const atMax = itemsDraftIndividual.length >= 3
                      return (
                        <label
                          key={item}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${checked ? 'border-gold bg-navy' : atMax && !checked ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-gray-200 bg-white hover:border-navy'}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={atMax && !checked}
                            onChange={(e) => {
                              if (e.target.checked && itemsDraftIndividual.length < 3) {
                                setItemsDraftIndividual([...itemsDraftIndividual, item])
                              } else if (!e.target.checked) {
                                setItemsDraftIndividual(itemsDraftIndividual.filter((i) => i !== item))
                              }
                            }}
                            className="sr-only"
                          />
                          <div
                            className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                            style={{ borderColor: checked ? '#F5A623' : '#d1d5db', backgroundColor: checked ? '#F5A623' : '#ffffff' }}
                          >
                            {checked && <Check size={9} color="white" strokeWidth={3} />}
                          </div>
                          <span className={`text-sm font-medium flex-1 ${checked ? 'text-white' : 'text-gray-800'}`}>{item}</span>
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {[
                      { label: 'Small items (Tier 1)', value: itemsDraftTier1, onChange: setItemsDraftTier1 },
                      { label: 'Medium/large items (Tier 2)', value: itemsDraftTier2, onChange: setItemsDraftTier2 },
                      { label: 'Heavy items (Tier 3)', value: itemsDraftTier3, onChange: setItemsDraftTier3 },
                    ].map(({ label, value, onChange }) => (
                      <div key={label} className="flex items-center justify-between py-3 px-4 rounded-xl border border-gray-200">
                        <span className="text-sm font-medium" style={{ color: '#1B2A4A' }}>{label}</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onChange(Math.max(0, value - 1))}
                            className="w-8 h-8 rounded-full border flex items-center justify-center text-lg font-bold disabled:opacity-30"
                            style={{ borderColor: '#1B2A4A', color: '#1B2A4A' }}
                            disabled={value <= 0}
                          >
                            −
                          </button>
                          <span className="w-6 text-center font-semibold text-base" style={{ color: '#1B2A4A' }}>{value}</span>
                          <button
                            onClick={() => onChange(value + 1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold text-white"
                            style={{ backgroundColor: '#1B2A4A' }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSaveItems}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors"
                  style={{ backgroundColor: '#1B2A4A' }}
                >
                  Save
                </button>
                <button
                  onClick={() => setItemsEdit(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Pickup Date */}
        <Card
          title="Pickup Date"
          action={
            <div className="flex items-center gap-2">
              <SavedBadge show={pickupSaved} />
              <EditButton onClick={() => { if (pickupEdit) { setPickupEdit(false) } else { handleOpenPickupEdit() } }} label={pickupEdit ? 'Close' : 'Edit'} />
            </div>
          }
        >
          {!pickupEdit ? (
            booking.pickupDateUnsure || !booking.pickupDate ? (
              <p className="text-sm italic text-gray-400">TBD — not set yet</p>
            ) : (
              <div>
                <p className="text-base font-semibold" style={{ color: '#1B2A4A' }}>{formatDate(booking.pickupDate)}</p>
                <p className="text-sm text-gray-500 mt-0.5">{booking.pickupTime === 'morning' ? 'Morning (8am–12pm)' : 'Afternoon (12pm–4pm)'}</p>
              </div>
            )
          ) : (
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pickupUnsureDraft}
                  onChange={(e) => setPickupUnsureDraft(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                  style={{ borderColor: pickupUnsureDraft ? '#F5A623' : '#d1d5db', backgroundColor: pickupUnsureDraft ? '#F5A623' : '#ffffff' }}
                >
                  {pickupUnsureDraft && <Check size={9} color="white" strokeWidth={3} />}
                </div>
                <span className="text-sm text-gray-600">Not sure yet</span>
              </label>
              {!pickupUnsureDraft && (
                <>
                  <input
                    type="date"
                    value={pickupDateDraft}
                    onChange={(e) => setPickupDateDraft(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    {(['morning', 'afternoon'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setPickupTimeDraft(t)}
                        className="py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all"
                        style={{
                          borderColor: pickupTimeDraft === t ? '#1B2A4A' : '#e5e7eb',
                          backgroundColor: pickupTimeDraft === t ? '#1B2A4A' : '#ffffff',
                          color: pickupTimeDraft === t ? '#ffffff' : '#374151',
                        }}
                      >
                        {t === 'morning' ? 'Morning (8am–12pm)' : 'Afternoon (12pm–4pm)'}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleSavePickup}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ backgroundColor: '#1B2A4A' }}
                >
                  Save
                </button>
                <button
                  onClick={() => setPickupEdit(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Return Date */}
        <Card
          title="Return Date"
          action={
            <div className="flex items-center gap-2">
              <SavedBadge show={returnSaved} />
              <EditButton onClick={() => { if (returnEdit) { setReturnEdit(false) } else { handleOpenReturnEdit() } }} label={returnEdit ? 'Close' : 'Edit'} />
            </div>
          }
        >
          {!returnEdit ? (
            booking.returnDateUnsure || !booking.returnDate ? (
              <p className="text-sm italic text-gray-400">TBD — not set yet</p>
            ) : (
              <div>
                <p className="text-base font-semibold" style={{ color: '#1B2A4A' }}>{formatDate(booking.returnDate)}</p>
                <p className="text-sm text-gray-500 mt-0.5">{booking.returnTime === 'morning' ? 'Morning (8am–12pm)' : 'Afternoon (12pm–4pm)'}</p>
              </div>
            )
          ) : (
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={returnUnsureDraft}
                  onChange={(e) => setReturnUnsureDraft(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                  style={{ borderColor: returnUnsureDraft ? '#F5A623' : '#d1d5db', backgroundColor: returnUnsureDraft ? '#F5A623' : '#ffffff' }}
                >
                  {returnUnsureDraft && <Check size={9} color="white" strokeWidth={3} />}
                </div>
                <span className="text-sm text-gray-600">Not sure yet</span>
              </label>
              {!returnUnsureDraft && (
                <>
                  <input
                    type="date"
                    value={returnDateDraft}
                    onChange={(e) => setReturnDateDraft(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    {(['morning', 'afternoon'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setReturnTimeDraft(t)}
                        className="py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all"
                        style={{
                          borderColor: returnTimeDraft === t ? '#1B2A4A' : '#e5e7eb',
                          backgroundColor: returnTimeDraft === t ? '#1B2A4A' : '#ffffff',
                          color: returnTimeDraft === t ? '#ffffff' : '#374151',
                        }}
                      >
                        {t === 'morning' ? 'Morning (8am–12pm)' : 'Afternoon (12pm–4pm)'}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveReturn}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ backgroundColor: '#1B2A4A' }}
                >
                  Save
                </button>
                <button
                  onClick={() => setReturnEdit(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Shipping Materials */}
        <Card
          title="Shipping Materials"
          action={
            <div className="flex items-center gap-2">
              <SavedBadge show={shippingSaved} />
              <EditButton onClick={() => setShippingEdit(!shippingEdit)} label={shippingEdit ? 'Close' : 'Edit'} />
            </div>
          }
        >
          <p className="text-sm font-medium mb-1" style={{ color: '#1B2A4A' }}>When would you like your packing supplies delivered?</p>
          <p className="text-xs text-gray-500 mb-4">We&apos;ll bring you boxes, labels, and tape before move-out day.</p>

          {!shippingEdit ? (
            <p className="text-sm text-gray-700">
              {boxDeliveryOption === 'pickup-day'
                ? freeBoxes > 0
                  ? `${freeBoxes} free box${freeBoxes !== 1 ? 'es' : ''} delivered on pickup day.`
                  : 'Delivered with pickup team on pickup day.'
                : `Early delivery requested${boxDeliveryDate ? `: ${formatDate(boxDeliveryDate)}` : '.'}`}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: boxDeliveryOption === 'pickup-day' ? '#1B2A4A' : '#d1d5db', backgroundColor: boxDeliveryOption === 'pickup-day' ? '#1B2A4A' : '#ffffff' }}
                >
                  {boxDeliveryOption === 'pickup-day' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <input type="radio" name="boxDelivery" value="pickup-day" checked={boxDeliveryOption === 'pickup-day'} onChange={() => setBoxDeliveryOption('pickup-day')} className="sr-only" />
                <span className="text-sm text-gray-700">Deliver with my pickup team on pickup day</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: boxDeliveryOption === 'early' ? '#1B2A4A' : '#d1d5db', backgroundColor: boxDeliveryOption === 'early' ? '#1B2A4A' : '#ffffff' }}
                >
                  {boxDeliveryOption === 'early' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <input type="radio" name="boxDelivery" value="early" checked={boxDeliveryOption === 'early'} onChange={() => setBoxDeliveryOption('early')} className="sr-only" />
                <span className="text-sm text-gray-700">I&apos;d like them delivered early</span>
              </label>
              {boxDeliveryOption === 'early' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred delivery date</label>
                  <input
                    type="date"
                    value={boxDeliveryDate}
                    onChange={(e) => setBoxDeliveryDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
              )}
              <div className="flex gap-3 mt-1">
                <button
                  onClick={handleSaveShipping}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ backgroundColor: '#1B2A4A' }}
                >
                  Save
                </button>
                <button
                  onClick={() => setShippingEdit(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Pickup Coordination */}
        <Card
          title="Pickup Coordination"
          action={
            <div className="flex items-center gap-2">
              <SavedBadge show={pickupCoordSaved} />
              <EditButton onClick={() => { if (pickupCoordEdit) { setPickupCoordEdit(false) } else { handleOpenPickupCoordEdit() } }} label={pickupCoordEdit ? 'Close' : 'Edit'} />
            </div>
          }
        >
          {!pickupCoordEdit ? (
            booking.attendedPickup ? (
              <p className="text-sm text-gray-700">You&apos;ll be present when we arrive.</p>
            ) : (
              <div>
                <p className="text-sm text-gray-700 mb-2">Unattended pickup — you&apos;ll leave items accessible.</p>
                {booking.pickupInstructions && (
                  <div className="rounded-xl p-3 text-sm italic text-gray-600" style={{ backgroundColor: '#1B2A4A08' }}>
                    &ldquo;{booking.pickupInstructions}&rdquo;
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                {[
                  { value: true, label: 'Yes, I\'ll be there (attended pickup)' },
                  { value: false, label: 'No — I\'ll leave my items accessible (unattended)' },
                ].map(({ value, label }) => (
                  <label key={String(value)} className="flex items-center gap-3 cursor-pointer">
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: attendedDraft === value ? '#1B2A4A' : '#d1d5db', backgroundColor: attendedDraft === value ? '#1B2A4A' : '#ffffff' }}
                    >
                      {attendedDraft === value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <input type="radio" checked={attendedDraft === value} onChange={() => setAttendedDraft(value)} className="sr-only" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
              {!attendedDraft && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Where should our team go?</label>
                  <textarea
                    rows={3}
                    value={instructionsDraft}
                    onChange={(e) => setInstructionsDraft(e.target.value)}
                    placeholder="e.g., 'Items in hallway outside room 214'"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
                  />
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleSavePickupCoord}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ backgroundColor: '#1B2A4A' }}
                >
                  Save
                </button>
                <button
                  onClick={() => setPickupCoordEdit(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Your Details */}
        <Card
          title="Your Details"
          action={
            <div className="flex items-center gap-2">
              <SavedBadge show={detailsSaved} />
              <EditButton onClick={() => { if (detailsEdit) { setDetailsEdit(false) } else { handleOpenDetailsEdit() } }} label={detailsEdit ? 'Close' : 'Edit'} />
            </div>
          }
        >
          {!detailsEdit ? (
            <div className="flex flex-col gap-2 text-sm text-gray-700">
              <div><span className="text-gray-400">Name: </span><span className="font-medium">{booking.name || '—'}</span></div>
              <div><span className="text-gray-400">Phone: </span><span className="font-medium">{booking.phone || '—'}</span></div>
              <div><span className="text-gray-400">Dorm: </span><span className="font-medium">{booking.dorm || '—'}</span></div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={phoneDraft}
                  onChange={(e) => setPhoneDraft(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Dorm / Building</label>
                <select
                  value={dormDraft}
                  onChange={(e) => setDormDraft(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 bg-white"
                >
                  <option value="">Select your dorm...</option>
                  {DORMS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveDetails}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ backgroundColor: '#1B2A4A' }}
                >
                  Save
                </button>
                <button
                  onClick={() => setDetailsEdit(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Contact & Support */}
        <Card title="Contact & Support">
          <p className="text-sm text-gray-700 mb-3">
            Questions? Email{' '}
            <a href="mailto:help@bulldogstorage.us" className="underline font-medium" style={{ color: '#1B2A4A' }}>
              help@bulldogstorage.us
            </a>{' '}
            or call{' '}
            <a href="tel:3016536369" className="underline font-medium" style={{ color: '#1B2A4A' }}>
              (301) 653-6369
            </a>
          </p>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link href="/terms" className="underline hover:text-gray-600 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="underline hover:text-gray-600 transition-colors">Privacy Policy</Link>
          </div>
        </Card>

      </div>

      <p className="text-center text-xs text-gray-400 pb-10">
        Booking {booking.bookingRef} · {totalItems > 0 ? `${totalItems} item${totalItems !== 1 ? 's' : ''}` : 'TBD items'}
      </p>
    </div>
  )
}
