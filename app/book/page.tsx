'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Check, AlertTriangle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type PlanId = 'individual' | 'essentials' | 'flex' | 'flexplus' | 'group'

type BookingState = {
  email: string
  step: 0 | 1 | 2 | 3 | 4 | 5 | 6
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
  currentBuilding: string
  currentRoom: string
  currentDormOther: string
  returnBuilding: string
  returnRoom: string
  returnBuildingOther: string
  returnLocationUnsure: boolean
  attendedPickup: boolean
  pickupInstructions: string
  name: string
  phone: string
  dorm: string
  promoCode: string
  promoApplied: boolean
  additionalNotes: string
  conditionAcknowledged: boolean
  bookingRef: string
  confirmed: boolean
}

const DEFAULT_STATE: BookingState = {
  email: '',
  step: 1,
  agreedToTerms: false,
  plan: null,
  items: { tier1: 0, tier2: 0, tier3: 0 },
  itemsUnsure: false,
  individualItems: [],
  boxesNeeded: 0,
  extraBoxes: 0,
  itemNotes: '',
  pickupDate: '',
  pickupDateUnsure: false,
  pickupTime: 'morning',
  returnDate: '',
  returnDateUnsure: false,
  returnTime: 'morning',
  currentBuilding: '',
  currentRoom: '',
  currentDormOther: '',
  returnBuilding: '',
  returnRoom: '',
  returnBuildingOther: '',
  returnLocationUnsure: false,
  attendedPickup: true,
  pickupInstructions: '',
  name: '',
  phone: '',
  dorm: '',
  promoCode: '',
  promoApplied: false,
  additionalNotes: '',
  conditionAcknowledged: false,
  bookingRef: '',
  confirmed: false,
}

const PLAN_INFO: Record<PlanId, { label: string; early: number | null; regular: number | null; items: number; freeBoxes: number }> = {
  individual: { label: 'Individual', early: null, regular: null, items: 3, freeBoxes: 0 },
  essentials: { label: 'Essentials', early: 175, regular: 225, items: 5, freeBoxes: 3 },
  flex: { label: 'Flex', early: 250, regular: 300, items: 10, freeBoxes: 7 },
  flexplus: { label: 'Flex Plus', early: 419.99, regular: 500, items: 20, freeBoxes: 12 },
  group: { label: 'Group', early: 700, regular: 700, items: 30, freeBoxes: 20 },
}

const OVERAGE_RATES = { tier1: 25, tier2: 50, tier3: 75 }
const PREMIUM_DATE_FEE = 150
const STANDARD_PICKUP_START = '2026-05-04'
const STANDARD_PICKUP_END = '2026-05-08'
const STANDARD_RETURN_START = '2026-08-23'
const STANDARD_RETURN_END = '2026-08-27'

const DORMS = [
  'Bingham Hall', 'Branford College', 'Davenport College', 'Durfee Hall', 'Farnam Hall',
  'Grace Hopper College', 'Jonathan Edwards College', 'Lanman-Wright Hall', 'Lawrence Hall',
  'Lawrance Hall', 'Morse College', 'Old Campus', 'Pierson College', 'Saybrook College',
  'Silliman College', 'Stiles College', 'Timothy Dwight College', 'Trumbull College',
  'Vanderbilt Hall', 'Welch Hall', 'Other / Off Campus',
]

const INDIVIDUAL_ITEMS: { name: string; tier: string }[] = [
  { name: 'Handbag', tier: 'Tier 1' },
  { name: 'Moving Box', tier: 'Tier 2' },
  { name: 'Tote Bin', tier: 'Tier 2' },
  { name: 'Storage Tub', tier: 'Tier 2' },
  { name: 'Duffel Bag', tier: 'Tier 2' },
  { name: 'Suitcase', tier: 'Tier 2' },
  { name: 'Hard-Shell Case', tier: 'Tier 2' },
  { name: 'Basket', tier: 'Tier 2' },
]

// ---------------------------------------------------------------------------
// Pricing calculation
// ---------------------------------------------------------------------------

function isOutsideWindow(date: string, start: string, end: string): boolean {
  if (!date) return false
  return date < start || date > end
}

function calculateTotal(state: BookingState): {
  basePlan: number
  overages: number
  extraBoxCost: number
  premiumFee: number
  promoDiscount: number
  total: number
} {
  if (!state.plan) return { basePlan: 0, overages: 0, extraBoxCost: 0, premiumFee: 0, promoDiscount: 0, total: 0 }

  const info = PLAN_INFO[state.plan]
  const totalItems = state.items.tier1 + state.items.tier2 + state.items.tier3
  let basePlan = 0
  let overages = 0

  if (state.plan === 'individual') {
    // Individual: items are from the individualItems checklist, $50/item, min $100
    const usableItems = Math.min(state.individualItems.length, 3)
    basePlan = Math.max(100, usableItems * 50)
  } else {
    basePlan = info.early ?? 0
    // Overages: items beyond plan limit. Apply most expensive tiers first (tier3, tier2, tier1)
    const limit = info.items
    if (totalItems > limit) {
      let remaining = totalItems - limit
      // First consume tier3 overages
      const over3 = Math.min(state.items.tier3, remaining)
      overages += over3 * OVERAGE_RATES.tier3
      remaining -= over3
      // Then tier2
      const over2 = Math.min(state.items.tier2, remaining)
      overages += over2 * OVERAGE_RATES.tier2
      remaining -= over2
      // Then tier1
      const over1 = Math.min(state.items.tier1, remaining)
      overages += over1 * OVERAGE_RATES.tier1
    }
  }

  // Extra boxes: $5 each beyond the free boxes included
  const extraBoxCost = state.extraBoxes * 5

  // Premium date fee: $150 each if outside standard window
  let premiumFee = 0
  if (!state.pickupDateUnsure && isOutsideWindow(state.pickupDate, STANDARD_PICKUP_START, STANDARD_PICKUP_END)) premiumFee += PREMIUM_DATE_FEE
  if (!state.returnDateUnsure && isOutsideWindow(state.returnDate, STANDARD_RETURN_START, STANDARD_RETURN_END)) premiumFee += PREMIUM_DATE_FEE

  const subtotal = basePlan + overages + extraBoxCost + premiumFee
  const promoDiscount = state.promoApplied ? Math.round(subtotal * 0.1 * 100) / 100 : 0
  const total = subtotal - promoDiscount

  return { basePlan, overages, extraBoxCost, premiumFee, promoDiscount, total }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProgressBar({ step }: { step: number }) {
  const steps = ['Plan', 'Items', 'Dates', 'Pickup', 'Details', 'Review']
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((label, i) => {
        const num = i + 1
        const isActive = step === num
        const isDone = step > num
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  backgroundColor: isDone ? '#1B2A4A' : isActive ? '#F5A623' : '#e5e7eb',
                  color: isDone || isActive ? '#ffffff' : '#9ca3af',
                }}
              >
                {isDone ? <Check size={14} /> : num}
              </div>
              <span
                className="text-xs font-medium hidden sm:block"
                style={{ color: isActive ? '#F5A623' : isDone ? '#1B2A4A' : '#9ca3af' }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-1 sm:mx-2 transition-all"
                style={{ backgroundColor: isDone ? '#1B2A4A' : '#e5e7eb' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function PlanCard({
  planId,
  selected,
  onSelect,
}: {
  planId: PlanId
  selected: boolean
  onSelect: () => void
}) {
  const info = PLAN_INFO[planId]
  const isPopular = planId === 'flex'
  const hasEarlyDiscount = info.early !== null && info.regular !== null && info.early !== info.regular

  return (
    <button
      onClick={onSelect}
      className="relative w-full text-left rounded-2xl border-2 p-5 transition-all"
      style={{
        borderColor: selected ? '#F5A623' : '#e5e7eb',
        backgroundColor: selected ? '#1B2A4A' : '#ffffff',
      }}
    >
      {isPopular && (
        <span
          className="absolute -top-3 left-4 text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
          style={{ backgroundColor: '#F5A623' }}
        >
          MOST POPULAR
        </span>
      )}
      {/* Selected indicator — top-right corner */}
      <div
        className="absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
        style={{
          borderColor: selected ? '#F5A623' : '#d1d5db',
          backgroundColor: selected ? '#F5A623' : 'transparent',
        }}
      >
        {selected && <Check size={10} color="white" strokeWidth={3} />}
      </div>
      {/* Content — pr-8 so it never overlaps with the indicator */}
      <div className="pr-8">
        <h3
          className="font-bold text-base"
          style={{ color: selected ? '#F5A623' : '#1B2A4A' }}
        >
          {info.label}
        </h3>
        <p className="text-sm mt-0.5" style={{ color: selected ? '#e5e7eb' : '#6b7280' }}>
          {info.items} items · {info.freeBoxes > 0 ? `${info.freeBoxes} free boxes` : 'No free boxes'}
        </p>
        <div className="mt-2">
          {planId === 'individual' ? (
            <>
              <span className="font-bold text-xl" style={{ color: selected ? '#ffffff' : '#1B2A4A' }}>
                $50/item
              </span>
              <span className="text-xs ml-1.5" style={{ color: selected ? '#ffffff80' : '#9ca3af' }}>$100 min</span>
            </>
          ) : (
            <>
              <span className="font-bold text-xl" style={{ color: selected ? '#ffffff' : '#1B2A4A' }}>
                ${info.early}
              </span>
              {hasEarlyDiscount && (
                <span className="text-xs ml-1.5 line-through" style={{ color: selected ? '#ffffff60' : '#9ca3af' }}>
                  ${info.regular}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </button>
  )
}

function Counter({
  label,
  sublabel,
  value,
  onChange,
  min = 0,
  max,
  disabled = false,
}: {
  label: string
  sublabel?: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  disabled?: boolean
}) {
  return (
    <div
      className="flex items-center justify-between py-4 px-5 rounded-xl border transition-all"
      style={{ borderColor: disabled ? '#f3f4f6' : '#e5e7eb', backgroundColor: disabled ? '#f9fafb' : '#ffffff' }}
    >
      <div>
        <p className="text-sm font-semibold" style={{ color: disabled ? '#9ca3af' : '#1B2A4A' }}>{label}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={disabled || value <= min}
          className="w-8 h-8 rounded-full border flex items-center justify-center text-lg font-bold transition-all disabled:opacity-30"
          style={{ borderColor: '#1B2A4A', color: '#1B2A4A' }}
        >
          −
        </button>
        <span className="w-6 text-center font-semibold text-base" style={{ color: '#1B2A4A' }}>{value}</span>
        <button
          onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
          disabled={disabled || (max !== undefined && value >= max)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold text-white transition-all disabled:opacity-30"
          style={{ backgroundColor: '#1B2A4A' }}
        >
          +
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main booking page
// ---------------------------------------------------------------------------

export default function BookPage() {
  const { user, signup } = useAuth()
  const [state, setState] = useState<BookingState>(DEFAULT_STATE)
  const [tierGuideOpen, setTierGuideOpen] = useState(false)
  const [promoInput, setPromoInput] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [authMounted, setAuthMounted] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [createAccount, setCreateAccount] = useState(false)
  const [signupPassword, setSignupPassword] = useState('')
  const [signupError, setSignupError] = useState('')

  // Determine per-user storage key
  const storageKey = user ? `bulldog-booking-${user.id}` : 'bulldog-booking'

  // Load from localStorage on mount / when user changes
  useEffect(() => {
    setAuthMounted(true)
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved) as BookingState
        const step = parsed.step === 0 ? 1 : parsed.step
        setState({ ...parsed, step, email: user ? user.email : parsed.email })
        setPromoInput(parsed.promoCode || '')
      } else if (user) {
        setState((prev) => ({ ...prev, step: 1, email: user.email }))
      } else {
        setState((prev) => ({ ...prev, step: 1 }))
      }
    } catch {
      // ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Save to localStorage on every state change
  useEffect(() => {
    if (!authMounted) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      // ignore
    }
  }, [state, storageKey, authMounted])

  const update = (patch: Partial<BookingState>) =>
    setState((prev) => ({ ...prev, ...patch }))

  const totalItems = state.items.tier1 + state.items.tier2 + state.items.tier3
  const planLimit = state.plan ? PLAN_INFO[state.plan].items : 0
  const pricing = calculateTotal(state)

  // Upgrade suggestions
  const getUpgradeSuggestion = (): PlanId | null => {
    if (!state.plan) return null
    const total = pricing.basePlan + pricing.overages
    if (state.plan === 'essentials' && total > 250 && totalItems <= 10) return 'flex'
    if (state.plan === 'flex' && total > 419.99 && totalItems <= 20) return 'flexplus'
    if (state.plan === 'flexplus' && total > 700 && totalItems <= 30) return 'group'
    return null
  }

  const upgradeSuggestion = getUpgradeSuggestion()

  const handleApplyPromo = () => {
    if (promoInput.trim().length > 0) {
      update({ promoCode: promoInput, promoApplied: true })
    }
  }

  const handleConfirm = async () => {
    if (!state.plan) return
    setCheckoutLoading(true)
    setCheckoutError('')

    const ref = `BDS-${Math.floor(10000 + Math.random() * 90000)}`

    // Save draft with ref to localStorage so success page can confirm it
    try {
      const draft = { ...state, bookingRef: ref }
      localStorage.setItem('bulldog-booking-draft', JSON.stringify(draft))
      localStorage.setItem(storageKey, JSON.stringify(draft))
    } catch {
      // ignore
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: state.plan,
          total: pricing.total,
          bookingRef: ref,
          customerEmail: state.email,
          bookingData: {
            name: state.name,
            phone: state.phone,
            pickupDate: state.pickupDate,
            returnDate: state.returnDate,
          },
        }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setCheckoutError('Something went wrong. Please try again.')
        setCheckoutLoading(false)
      }
    } catch {
      setCheckoutError('Something went wrong. Please try again.')
      setCheckoutLoading(false)
    }
  }

  const formatDate = (d: string) => {
    if (!d) return '—'
    const dt = new Date(d + 'T00:00:00')
    return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
  }


  // Confirmed screen
  if (state.confirmed) {
    return (
      <div className="min-h-screen px-4 py-12" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
              style={{ backgroundColor: '#1B2A4A10' }}
            >
              🎉
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#1B2A4A' }}>You&apos;re Booked!</h1>
            <p className="text-gray-500 mb-6">
              We&apos;ll be in touch at{' '}
              <span className="font-semibold" style={{ color: '#1B2A4A' }}>{state.email}</span>{' '}
              to confirm your window.
            </p>

            <div
              className="rounded-xl py-3 px-6 inline-block mb-8"
              style={{ backgroundColor: '#1B2A4A' }}
            >
              <p className="text-xs text-white/60 mb-0.5">Booking Reference</p>
              <p className="text-xl font-bold text-white tracking-wider">{state.bookingRef}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 text-left mb-8">
              <h3 className="font-semibold text-sm mb-3" style={{ color: '#1B2A4A' }}>Booking Summary</h3>
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Plan</span>
                  <span className="font-medium" style={{ color: '#1B2A4A' }}>{state.plan ? PLAN_INFO[state.plan].label : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items</span>
                  <span className="font-medium" style={{ color: '#1B2A4A' }}>
                    T1: {state.items.tier1} · T2: {state.items.tier2} · T3: {state.items.tier3}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Move-Out</span>
                  <span className="font-medium" style={{ color: '#1B2A4A' }}>{formatDate(state.pickupDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Return</span>
                  <span className="font-medium" style={{ color: '#1B2A4A' }}>{formatDate(state.returnDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dorm</span>
                  <span className="font-medium" style={{ color: '#1B2A4A' }}>{state.dorm || '—'}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-1 flex justify-between font-bold">
                  <span style={{ color: '#1B2A4A' }}>Total</span>
                  <span style={{ color: '#1B2A4A' }}>${pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="block text-center py-3 px-6 rounded-xl font-semibold text-sm text-white transition-colors"
                style={{ backgroundColor: '#1B2A4A' }}
              >
                Go to My Dashboard →
              </Link>
              <a
                href="mailto:help@bulldogstorage.us"
                className="text-sm font-medium underline"
                style={{ color: '#1B2A4A' }}
              >
                Questions? Email help@bulldogstorage.us
              </a>
              <Link
                href="/"
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Steps 1–5
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen px-4 py-8 sm:py-12" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-navy transition-colors">
            <ArrowLeft size={15} />
            Back to home
          </Link>
          <img src="/logo-woodmark.png" alt="Bulldog Storage" className="h-16 w-auto object-contain mx-auto brightness-0 invert" />
        </div>

        <ProgressBar step={state.step} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {/* ---------------------------------------------------------------- */}
          {/* Step 1 — Choose Your Plan */}
          {/* ---------------------------------------------------------------- */}
          {state.step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: '#1B2A4A' }}>Choose Your Plan</h2>
              <p className="text-sm text-gray-500 mb-6">
                Not sure how many items you have? No worries — you can adjust your plan later.
              </p>
              <div className="flex flex-col gap-4">
                {(Object.keys(PLAN_INFO) as PlanId[]).map((planId) => (
                  <PlanCard
                    key={planId}
                    planId={planId}
                    selected={state.plan === planId}
                    onSelect={() => update({ plan: planId })}
                  />
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => update({ step: 2 })}
                  disabled={!state.plan}
                  className="px-8 py-3 rounded-xl text-white font-semibold text-sm transition-colors disabled:opacity-40"
                  style={{ backgroundColor: '#1B2A4A' }}
                >
                  Next: Log Your Items →
                </button>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Step 2 — Items */}
          {/* ---------------------------------------------------------------- */}
          {state.step === 2 && state.plan && (
            <div>
              {state.plan === 'individual' ? (
                /* Individual plan — item checklist */
                <div>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: '#1B2A4A' }}>Select Your Items</h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Individual plan: boxes, bins, and bags only. Up to 3 items. $50/item, $100 minimum.
                  </p>

                  {/* Individual items checklist */}
                  <div className="flex flex-col gap-2 mb-6">
                    {INDIVIDUAL_ITEMS.map((item) => {
                      const isChecked = state.individualItems.includes(item.name)
                      const atMax = state.individualItems.length >= 3
                      return (
                        <label
                          key={item.name}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                            isChecked ? 'border-gold bg-navy' : atMax && !isChecked ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-gray-200 bg-white hover:border-navy'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={atMax && !isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (state.individualItems.length < 3) {
                                  update({ individualItems: [...state.individualItems, item.name] })
                                }
                              } else {
                                update({ individualItems: state.individualItems.filter((i) => i !== item.name) })
                              }
                            }}
                            className="sr-only"
                          />
                          <div
                            className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                            style={{
                              borderColor: isChecked ? '#F5A623' : '#d1d5db',
                              backgroundColor: isChecked ? '#F5A623' : '#ffffff',
                            }}
                          >
                            {isChecked && <Check size={9} color="white" strokeWidth={3} />}
                          </div>
                          <span className={`text-sm font-medium flex-1 ${isChecked ? 'text-white' : 'text-gray-800'}`}>{item.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isChecked ? 'bg-gold/20 text-gold' : 'bg-gray-100 text-gray-500'}`}>
                            {item.tier}
                          </span>
                        </label>
                      )
                    })}
                  </div>

                  {/* Running total */}
                  <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: '#1B2A4A0D' }}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
                        {state.individualItems.length} item{state.individualItems.length !== 1 ? 's' : ''} × $50
                      </span>
                      <span className="text-base font-bold" style={{ color: '#1B2A4A' }}>
                        ${Math.max(100, state.individualItems.length * 50).toFixed(2)}
                      </span>
                    </div>
                    {state.individualItems.length < 2 && (
                      <p className="text-xs mt-2 font-medium" style={{ color: '#F5A623' }}>
                        Minimum booking is $100 (2 items). Please select at least 2 items to proceed.
                      </p>
                    )}
                  </div>

                  {/* Optional notes */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Item Notes (optional)</label>
                    <textarea
                      rows={2}
                      value={state.itemNotes}
                      onChange={(e) => update({ itemNotes: e.target.value })}
                      placeholder="Anything we should know about specific items..."
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
                    />
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => update({ step: 1 })}
                      className="px-6 py-3 rounded-xl text-sm font-semibold border-2 transition-colors"
                      style={{ borderColor: '#1B2A4A', color: '#1B2A4A' }}
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => update({ step: 3 })}
                      disabled={state.individualItems.length < 2}
                      className="px-8 py-3 rounded-xl text-white font-semibold text-sm transition-colors disabled:opacity-40"
                      style={{ backgroundColor: '#1B2A4A' }}
                    >
                      Next: Select Dates →
                    </button>
                  </div>
                </div>
              ) : (
                /* Non-individual plans — estimation mode */
                <div>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: '#1B2A4A' }}>Tell us roughly what you&apos;re bringing</h2>
                  <p className="text-sm text-gray-500 mb-6">
                    This is just an estimate — we&apos;ll confirm the exact count at pickup. No stress if things change.
                  </p>

                  {/* "Not sure yet" toggle */}
                  <label
                    className="flex items-start gap-3 cursor-pointer mb-6 px-4 py-4 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: state.itemsUnsure ? '#F5A623' : '#e5e7eb',
                      backgroundColor: state.itemsUnsure ? '#F5A62308' : '#ffffff',
                    }}
                  >
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={state.itemsUnsure}
                        onChange={(e) => {
                          if (e.target.checked) {
                            update({ itemsUnsure: true, items: { tier1: -1, tier2: 0, tier3: 0 }, boxesNeeded: 0, extraBoxes: 0 })
                          } else {
                            update({ itemsUnsure: false, items: { tier1: 0, tier2: 0, tier3: 0 } })
                          }
                        }}
                        className="sr-only"
                      />
                      <div
                        className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                        style={{
                          borderColor: state.itemsUnsure ? '#F5A623' : '#d1d5db',
                          backgroundColor: state.itemsUnsure ? '#F5A623' : '#ffffff',
                        }}
                      >
                        {state.itemsUnsure && <Check size={11} color="white" strokeWidth={3} />}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">I&apos;m not sure yet — I&apos;ll figure it out closer to move-out</p>
                      <p className="text-xs text-gray-500 mt-0.5">Just get me in the queue — I&apos;ll update my items from the dashboard later.</p>
                    </div>
                  </label>
                  {state.itemsUnsure && (
                    <div className="mb-4 rounded-xl p-4 text-sm" style={{ backgroundColor: '#1B2A4A0D', color: '#1B2A4A' }}>
                      You can add items from your dashboard after booking.
                    </div>
                  )}

                  {!state.itemsUnsure && state.items.tier1 !== -1 && (
                    <>
                      {/* Boxes/bins counter */}
                      <div className="mb-6">
                        <h3 className="text-base font-semibold mb-1" style={{ color: '#1B2A4A' }}>Boxes, bins, or bags</h3>
                        <p className="text-xs text-gray-500 mb-3">
                          Your {PLAN_INFO[state.plan].label} plan includes {PLAN_INFO[state.plan].freeBoxes} free boxes.
                          {state.extraBoxes > 0 && ` You have ${state.extraBoxes} extra (${state.extraBoxes} × $5 = $${(state.extraBoxes * 5).toFixed(2)}).`}
                        </p>
                        <Counter
                          label="How many boxes, bins, or bags?"
                          sublabel={`${PLAN_INFO[state.plan].freeBoxes} included free`}
                          value={state.boxesNeeded}
                          onChange={(v) => {
                            const extra = Math.max(0, v - PLAN_INFO[state.plan!].freeBoxes)
                            update({ boxesNeeded: v, extraBoxes: extra, items: { ...state.items, tier2: v } })
                          }}
                        />
                      </div>

                      {/* Small loose items */}
                      <div className="mb-4">
                        <h3 className="text-base font-semibold mb-1" style={{ color: '#1B2A4A' }}>Small loose items</h3>
                        <p className="text-xs text-gray-500 mb-3">Pillows, posters, handbags, umbrellas, etc.</p>
                        <Counter
                          label="Small items (Tier 1)"
                          value={state.items.tier1}
                          onChange={(v) => update({ items: { ...state.items, tier1: v } })}
                        />
                      </div>

                      {/* Medium/large items */}
                      <div className="mb-4">
                        <h3 className="text-base font-semibold mb-1" style={{ color: '#1B2A4A' }}>Medium &amp; large items</h3>
                        <p className="text-xs text-gray-500 mb-3">Mini fridge, microwave, fan, rug, desk chair, TV, lamp...</p>
                        <Counter
                          label="Medium/large items (Tier 2 non-box)"
                          value={Math.max(0, state.items.tier2 - state.boxesNeeded)}
                          onChange={(v) => update({ items: { ...state.items, tier2: state.boxesNeeded + v } })}
                        />
                      </div>

                      {/* Heavy items */}
                      <div className="mb-6">
                        <h3 className="text-base font-semibold mb-1" style={{ color: '#1B2A4A' }}>Heavy furniture</h3>
                        <p className="text-xs text-gray-500 mb-3">Couch, mattress, shelving, drawers, ottoman...</p>
                        <Counter
                          label="Heavy items (Tier 3)"
                          value={state.items.tier3}
                          onChange={(v) => update({ items: { ...state.items, tier3: v } })}
                        />
                      </div>

                      {/* Fridge reminder */}
                      {state.items.tier2 > 0 && (
                        <div className="mb-5 rounded-xl p-4 flex items-start gap-3 border" style={{ borderColor: '#F5A62340', backgroundColor: '#F5A62308' }}>
                          <AlertTriangle size={18} style={{ color: '#F5A623', flexShrink: 0, marginTop: 1 }} />
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Reminder:</span> Mini fridges must be emptied and defrosted before pickup day.
                          </p>
                        </div>
                      )}

                      {/* Optional notes */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Item Notes (optional)</label>
                        <textarea
                          rows={2}
                          value={state.itemNotes}
                          onChange={(e) => update({ itemNotes: e.target.value })}
                          placeholder="Anything we should know about specific items..."
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex justify-between">
                    <button
                      onClick={() => update({ step: 1 })}
                      className="px-6 py-3 rounded-xl text-sm font-semibold border-2 transition-colors"
                      style={{ borderColor: '#1B2A4A', color: '#1B2A4A' }}
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => update({ step: 3 })}
                      className="px-8 py-3 rounded-xl text-white font-semibold text-sm transition-colors"
                      style={{ backgroundColor: '#1B2A4A' }}
                    >
                      Next: Select Dates →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Step 3 — Select Your Dates */}
          {/* ---------------------------------------------------------------- */}
          {state.step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: '#1B2A4A' }}>Select Your Dates</h2>
              <p className="text-sm text-gray-500 mb-6">Choose your move-out and return dates. Not sure yet? No problem.</p>

              <div className="flex flex-col gap-6">
                {/* Pickup */}
                <div className="rounded-xl border border-gray-200 p-5">
                  <h3 className="text-base font-semibold mb-1" style={{ color: '#1B2A4A' }}>Move-Out Date</h3>
                  <p className="text-xs text-gray-400 mb-3">Standard window: May 4–8, 2026</p>

                  {!state.pickupDateUnsure && (
                    <>
                      <input
                        type="date"
                        value={state.pickupDate}
                        onChange={(e) => update({ pickupDate: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 mb-4"
                      />
                      {isOutsideWindow(state.pickupDate, STANDARD_PICKUP_START, STANDARD_PICKUP_END) && (
                        <div className="flex items-center gap-2 text-xs rounded-lg p-2.5 mb-4" style={{ backgroundColor: '#F5A62315', color: '#d4891a' }}>
                          <AlertTriangle size={13} />
                          +$150 logistics fee applies for dates outside our standard window
                        </div>
                      )}
                      <p className="text-sm font-medium mb-2" style={{ color: '#1B2A4A' }}>Move-Out Time</p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {(['morning', 'afternoon'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => update({ pickupTime: t })}
                            className="py-2.5 px-4 rounded-xl text-sm font-medium border-2 transition-all"
                            style={{
                              borderColor: state.pickupTime === t ? '#1B2A4A' : '#e5e7eb',
                              backgroundColor: state.pickupTime === t ? '#1B2A4A' : '#ffffff',
                              color: state.pickupTime === t ? '#ffffff' : '#374151',
                            }}
                          >
                            {t === 'morning' ? 'Morning (8am–12pm)' : 'Afternoon (12pm–4pm)'}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={state.pickupDateUnsure}
                        onChange={(e) => update({ pickupDateUnsure: e.target.checked, pickupDate: e.target.checked ? '' : state.pickupDate })}
                        className="sr-only"
                      />
                      <div
                        className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                        style={{
                          borderColor: state.pickupDateUnsure ? '#F5A623' : '#d1d5db',
                          backgroundColor: state.pickupDateUnsure ? '#F5A623' : '#ffffff',
                        }}
                      >
                        {state.pickupDateUnsure && <Check size={9} color="white" strokeWidth={3} />}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">I&apos;m not sure of my move-out date yet — I&apos;ll update this later</span>
                  </label>
                </div>

                {/* Return */}
                <div className="rounded-xl border border-gray-200 p-5">
                  <h3 className="text-base font-semibold mb-1" style={{ color: '#1B2A4A' }}>Fall Return Date</h3>
                  <p className="text-xs text-gray-400 mb-3">Standard window: Aug 23–27, 2026</p>

                  {!state.returnDateUnsure && (
                    <>
                      <input
                        type="date"
                        value={state.returnDate}
                        onChange={(e) => update({ returnDate: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 mb-4"
                      />
                      {isOutsideWindow(state.returnDate, STANDARD_RETURN_START, STANDARD_RETURN_END) && (
                        <div className="flex items-center gap-2 text-xs rounded-lg p-2.5 mb-4" style={{ backgroundColor: '#F5A62315', color: '#d4891a' }}>
                          <AlertTriangle size={13} />
                          +$150 logistics fee applies for dates outside our standard window
                        </div>
                      )}
                      <p className="text-sm font-medium mb-2" style={{ color: '#1B2A4A' }}>Return Time</p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {(['morning', 'afternoon'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => update({ returnTime: t })}
                            className="py-2.5 px-4 rounded-xl text-sm font-medium border-2 transition-all"
                            style={{
                              borderColor: state.returnTime === t ? '#1B2A4A' : '#e5e7eb',
                              backgroundColor: state.returnTime === t ? '#1B2A4A' : '#ffffff',
                              color: state.returnTime === t ? '#ffffff' : '#374151',
                            }}
                          >
                            {t === 'morning' ? 'Morning (8am–12pm)' : 'Afternoon (12pm–4pm)'}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={state.returnDateUnsure}
                        onChange={(e) => update({ returnDateUnsure: e.target.checked, returnDate: e.target.checked ? '' : state.returnDate })}
                        className="sr-only"
                      />
                      <div
                        className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                        style={{
                          borderColor: state.returnDateUnsure ? '#F5A623' : '#d1d5db',
                          backgroundColor: state.returnDateUnsure ? '#F5A623' : '#ffffff',
                        }}
                      >
                        {state.returnDateUnsure && <Check size={9} color="white" strokeWidth={3} />}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">I&apos;m not sure of my return date yet — I&apos;ll update this later</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => update({ step: 2 })}
                  className="px-6 py-3 rounded-xl text-sm font-semibold border-2 transition-colors"
                  style={{ borderColor: '#1B2A4A', color: '#1B2A4A' }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => update({ step: 4 })}
                  disabled={!state.pickupDateUnsure && !state.pickupDate || !state.returnDateUnsure && !state.returnDate}
                  className="px-8 py-3 rounded-xl text-white font-semibold text-sm transition-colors disabled:opacity-40"
                  style={{ backgroundColor: '#1B2A4A' }}
                >
                  Next: Pickup & Delivery →
                </button>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Step 4 — Pickup & Delivery Details */}
          {/* ---------------------------------------------------------------- */}
          {state.step === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: '#1B2A4A' }}>Pickup & Delivery Details</h2>
              <p className="text-sm text-gray-500 mb-6">Tell us where to pick up and where to deliver.</p>

              <div className="flex flex-col gap-6">
                {/* Where should we pick up? */}
                <div className="rounded-xl border border-gray-200 p-5">
                  <h3 className="text-base font-semibold mb-4" style={{ color: '#1B2A4A' }}>Where should we pick up?</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Dorm / Building</label>
                      <select
                        value={state.currentBuilding}
                        onChange={(e) => update({ currentBuilding: e.target.value, currentDormOther: e.target.value !== 'Other / Off Campus' ? '' : state.currentDormOther })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 bg-white"
                      >
                        <option value="">Select your dorm or building...</option>
                        {DORMS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    {state.currentBuilding && state.currentBuilding !== 'Other / Off Campus' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Room number or suite</label>
                        <input
                          type="text"
                          value={state.currentRoom}
                          onChange={(e) => update({ currentRoom: e.target.value })}
                          placeholder="e.g. 214 or Suite 3B"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                        />
                      </div>
                    )}
                    {state.currentBuilding === 'Other / Off Campus' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tell us your address or location</label>
                        <textarea
                          rows={3}
                          value={state.currentDormOther}
                          onChange={(e) => update({ currentDormOther: e.target.value })}
                          placeholder="Your full address or location details..."
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Where should we deliver next fall? */}
                <div className="rounded-xl border border-gray-200 p-5">
                  <h3 className="text-base font-semibold mb-1" style={{ color: '#1B2A4A' }}>Where should we deliver next fall?</h3>
                  <p className="text-xs text-gray-400 mb-4">Not sure yet? No problem — you can update this from your dashboard after booking.</p>

                  {/* Not sure yet checkbox */}
                  <label
                    className="flex items-start gap-3 cursor-pointer mb-4 px-4 py-3 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: state.returnLocationUnsure ? '#F5A623' : '#e5e7eb',
                      backgroundColor: state.returnLocationUnsure ? '#F5A62308' : '#ffffff',
                    }}
                  >
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={state.returnLocationUnsure}
                        onChange={(e) => update({ returnLocationUnsure: e.target.checked })}
                        className="sr-only"
                      />
                      <div
                        className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                        style={{
                          borderColor: state.returnLocationUnsure ? '#F5A623' : '#d1d5db',
                          backgroundColor: state.returnLocationUnsure ? '#F5A623' : '#ffffff',
                        }}
                      >
                        {state.returnLocationUnsure && <Check size={11} color="white" strokeWidth={3} />}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">Not sure yet — I&apos;ll update from my dashboard</span>
                  </label>

                  {!state.returnLocationUnsure && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Dorm / Building</label>
                        <select
                          value={state.returnBuilding}
                          onChange={(e) => update({ returnBuilding: e.target.value, returnBuildingOther: e.target.value !== 'Other / Off Campus' ? '' : state.returnBuildingOther })}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 bg-white"
                        >
                          <option value="">Select your dorm or building...</option>
                          {DORMS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      {state.returnBuilding && state.returnBuilding !== 'Other / Off Campus' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Room number or suite</label>
                          <input
                            type="text"
                            value={state.returnRoom}
                            onChange={(e) => update({ returnRoom: e.target.value })}
                            placeholder="e.g. 214 or Suite 3B"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                          />
                        </div>
                      )}
                      {state.returnBuilding === 'Other / Off Campus' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tell us your address or location</label>
                          <textarea
                            rows={3}
                            value={state.returnBuildingOther}
                            onChange={(e) => update({ returnBuildingOther: e.target.value })}
                            placeholder="Your full address or location details..."
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Pickup Coordination */}
                <div className="rounded-xl border border-gray-200 p-5">
                  <h3 className="text-base font-semibold mb-1" style={{ color: '#1B2A4A' }}>Pickup Coordination</h3>
                  <p className="text-sm text-gray-500 mb-4">Will you be present when we arrive?</p>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          borderColor: state.attendedPickup ? '#1B2A4A' : '#d1d5db',
                          backgroundColor: state.attendedPickup ? '#1B2A4A' : '#ffffff',
                        }}
                      >
                        {state.attendedPickup && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <input type="radio" name="attendedPickup" value="yes" checked={state.attendedPickup} onChange={() => update({ attendedPickup: true })} className="sr-only" />
                      <span className="text-sm text-gray-700">Yes, I&apos;ll be there</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          borderColor: !state.attendedPickup ? '#1B2A4A' : '#d1d5db',
                          backgroundColor: !state.attendedPickup ? '#1B2A4A' : '#ffffff',
                        }}
                      >
                        {!state.attendedPickup && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <input type="radio" name="attendedPickup" value="no" checked={!state.attendedPickup} onChange={() => update({ attendedPickup: false })} className="sr-only" />
                      <span className="text-sm text-gray-700">No — I&apos;ll leave my items accessible</span>
                    </label>
                  </div>
                  {!state.attendedPickup && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Where should our team go?</label>
                      <textarea
                        rows={3}
                        value={state.pickupInstructions}
                        onChange={(e) => update({ pickupInstructions: e.target.value })}
                        placeholder="e.g., 'Items will be in the hallway outside room 214', 'In the common room of my suite — door code is 1234'"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
                      />
                      <p className="text-xs text-gray-400 mt-1.5">We&apos;ll coordinate the details with you over text before pickup day.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => update({ step: 3 })}
                  className="px-6 py-3 rounded-xl text-sm font-semibold border-2 transition-colors"
                  style={{ borderColor: '#1B2A4A', color: '#1B2A4A' }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => update({ step: 5 })}
                  disabled={!state.currentBuilding || (!state.returnLocationUnsure && !state.returnBuilding)}
                  className="px-8 py-3 rounded-xl text-white font-semibold text-sm transition-colors disabled:opacity-40"
                  style={{ backgroundColor: '#1B2A4A' }}
                >
                  Next: Your Details →
                </button>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Step 5 — Your Details */}
          {/* ---------------------------------------------------------------- */}
          {state.step === 5 && (
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: '#1B2A4A' }}>Your Details</h2>
              <p className="text-sm text-gray-500 mb-6">Almost done. A few more details and we&apos;re set.</p>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={state.name}
                      onChange={(e) => update({ name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      required
                      value={state.phone}
                      onChange={(e) => update({ phone: e.target.value })}
                      placeholder="(555) 555-5555"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={state.email}
                    onChange={(e) => update({ email: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  />
                </div>

                {/* Promo code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Enter promo code"
                      disabled={state.promoApplied}
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                    {state.promoApplied ? (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor: '#1B2A4A10', color: '#1B2A4A' }}>
                        <Check size={15} />
                        Applied
                      </div>
                    ) : (
                      <button
                        onClick={handleApplyPromo}
                        disabled={!promoInput.trim()}
                        className="px-5 py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-40"
                        style={{ backgroundColor: '#1B2A4A' }}
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  {state.promoApplied && (
                    <p className="text-xs mt-1.5 font-medium" style={{ color: '#1B2A4A' }}>
                      ✓ 10% discount applied!
                    </p>
                  )}
                </div>

                {/* Additional notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Notes (optional)</label>
                  <textarea
                    rows={3}
                    value={state.additionalNotes}
                    onChange={(e) => update({ additionalNotes: e.target.value })}
                    placeholder="Anything else we should know..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
                  />
                </div>

                {/* Condition acknowledgment */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={state.conditionAcknowledged}
                      onChange={(e) => update({ conditionAcknowledged: e.target.checked })}
                      className="sr-only"
                    />
                    <div
                      className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                      style={{
                        borderColor: state.conditionAcknowledged ? '#1B2A4A' : '#d1d5db',
                        backgroundColor: state.conditionAcknowledged ? '#1B2A4A' : '#ffffff',
                      }}
                    >
                      {state.conditionAcknowledged && <Check size={11} color="white" strokeWidth={3} />}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I confirm my items are in packable condition and my mini fridge (if applicable) will be emptied and defrosted before pickup.
                  </span>
                </label>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => update({ step: 4 })}
                  className="px-6 py-3 rounded-xl text-sm font-semibold border-2 transition-colors"
                  style={{ borderColor: '#1B2A4A', color: '#1B2A4A' }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => update({ step: 6 })}
                  disabled={!state.name || !state.phone || !state.email || !state.conditionAcknowledged}
                  className="px-8 py-3 rounded-xl text-white font-semibold text-sm transition-colors disabled:opacity-40"
                  style={{ backgroundColor: '#1B2A4A' }}
                >
                  Next: Review →
                </button>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Step 6 — Review & Confirm */}
          {/* ---------------------------------------------------------------- */}
          {state.step === 6 && state.plan && (
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: '#1B2A4A' }}>Review & Confirm</h2>
              <p className="text-sm text-gray-500 mb-6">Double-check everything before we lock it in.</p>

              {/* Summary */}
              <div className="rounded-xl border border-gray-200 overflow-hidden mb-6">
                {/* Plan */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Plan</p>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold" style={{ color: '#1B2A4A' }}>{PLAN_INFO[state.plan].label}</span>
                    <span className="font-semibold" style={{ color: '#1B2A4A' }}>
                      ${pricing.basePlan.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Items</p>
                  {state.itemsUnsure || (state.plan !== 'individual' && state.items.tier1 === -1) ? (
                    <p className="text-sm italic text-gray-400">TBD — you&apos;ll confirm items at pickup</p>
                  ) : state.plan === 'individual' ? (
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      {state.individualItems.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      {state.items.tier1 > 0 && (
                        <span><strong style={{ color: '#1B2A4A' }}>{state.items.tier1}</strong> small item{state.items.tier1 !== 1 ? 's' : ''} (pillows, bags, gear)</span>
                      )}
                      {state.items.tier2 > 0 && (
                        <span><strong style={{ color: '#1B2A4A' }}>{state.items.tier2}</strong> medium item{state.items.tier2 !== 1 ? 's' : ''} (boxes, mini fridge, fan)</span>
                      )}
                      {state.items.tier3 > 0 && (
                        <span><strong style={{ color: '#1B2A4A' }}>{state.items.tier3}</strong> heavy/furniture item{state.items.tier3 !== 1 ? 's' : ''} (couch, mattress, shelving)</span>
                      )}
                      {state.extraBoxes > 0 && (
                        <span><strong style={{ color: '#1B2A4A' }}>{state.extraBoxes}</strong> extra box{state.extraBoxes !== 1 ? 'es' : ''}</span>
                      )}
                      {state.items.tier1 === 0 && state.items.tier2 === 0 && state.items.tier3 === 0 && state.extraBoxes === 0 && (
                        <span className="italic text-gray-400">No items selected</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Dates</p>
                  <div className="flex flex-col gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium" style={{ color: '#1B2A4A' }}>Move-Out: </span>
                      {state.pickupDateUnsure ? (
                        <span className="italic text-gray-400">TBD — you can update this from your dashboard after booking</span>
                      ) : (
                        <>{formatDate(state.pickupDate)} · {state.pickupTime === 'morning' ? '8am–12pm' : '12pm–4pm'}</>
                      )}
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: '#1B2A4A' }}>Return: </span>
                      {state.returnDateUnsure ? (
                        <span className="italic text-gray-400">TBD — you can update this from your dashboard after booking</span>
                      ) : (
                        <>{formatDate(state.returnDate)} · {state.returnTime === 'morning' ? '8am–12pm' : '12pm–4pm'}</>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pickup & Delivery Locations */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Pickup & Delivery</p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium" style={{ color: '#1B2A4A' }}>Pickup from: </span>
                      {state.currentBuilding === 'Other / Off Campus'
                        ? state.currentDormOther || 'Other / Off Campus'
                        : state.currentBuilding
                          ? `${state.currentBuilding}${state.currentRoom ? `, Room ${state.currentRoom}` : ''}`
                          : 'TBD'}
                    </p>
                    <p>
                      <span className="font-medium" style={{ color: '#1B2A4A' }}>Deliver to: </span>
                      {state.returnLocationUnsure
                        ? 'TBD'
                        : state.returnBuilding === 'Other / Off Campus'
                          ? state.returnBuildingOther || 'Other / Off Campus'
                          : state.returnBuilding
                            ? `${state.returnBuilding}${state.returnRoom ? `, Room ${state.returnRoom}` : ''}`
                            : 'TBD'}
                    </p>
                  </div>
                </div>

                {/* Pickup Coordination */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Pickup Coordination</p>
                  <div className="text-sm text-gray-600">
                    {state.attendedPickup ? (
                      <p>You indicated you&apos;ll be present at pickup.</p>
                    ) : (
                      <>
                        <p className="mb-1">Unattended pickup.</p>
                        {state.pickupInstructions && (
                          <p className="italic text-gray-500">&ldquo;{state.pickupInstructions}&rdquo;</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Details</p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium" style={{ color: '#1B2A4A' }}>Name: </span>{state.name}</p>
                    <p><span className="font-medium" style={{ color: '#1B2A4A' }}>Email: </span>{state.email}</p>
                    <p><span className="font-medium" style={{ color: '#1B2A4A' }}>Phone: </span>{state.phone}</p>
                  </div>
                </div>

                {/* Pricing breakdown */}
                <div className="px-5 py-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Pricing</p>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>{PLAN_INFO[state.plan].label} plan</span>
                      <span>${pricing.basePlan.toFixed(2)}</span>
                    </div>
                    {pricing.overages > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Overage items</span>
                        <span>+${pricing.overages.toFixed(2)}</span>
                      </div>
                    )}
                    {pricing.extraBoxCost > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Extra boxes ({state.extraBoxes} × $5)</span>
                        <span>+${pricing.extraBoxCost.toFixed(2)}</span>
                      </div>
                    )}
                    {pricing.premiumFee > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Non-standard dates fee</span>
                        <span>+${pricing.premiumFee.toFixed(2)}</span>
                      </div>
                    )}
                    {pricing.promoDiscount > 0 && (
                      <div className="flex justify-between" style={{ color: '#1B2A4A' }}>
                        <span>Promo discount (10%)</span>
                        <span>−${pricing.promoDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div
                      className="flex justify-between font-bold text-base pt-2 mt-1 border-t border-gray-200"
                      style={{ color: '#1B2A4A' }}
                    >
                      <span>Total</span>
                      <span>${pricing.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account creation prompt for guests */}
              {!user && (
                <div className="rounded-xl border border-gray-200 p-5 mb-6">
                  {!createAccount ? (
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Save your booking to a dashboard</p>
                        <p className="text-xs text-gray-400 mt-0.5">Create a free account to track and manage your booking.</p>
                      </div>
                      <button
                        onClick={() => setCreateAccount(true)}
                        className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors"
                        style={{ backgroundColor: '#1B2A4A' }}
                      >
                        Create account
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold mb-3" style={{ color: '#1B2A4A' }}>Create your account</p>
                      <p className="text-xs text-gray-400 mb-3">We&apos;ll use the name and email you entered above.</p>
                      <input
                        type="password"
                        value={signupPassword}
                        onChange={(e) => { setSignupPassword(e.target.value); setSignupError('') }}
                        placeholder="Choose a password"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 mb-2"
                      />
                      {signupError && <p className="text-xs text-red-500 mb-2">{signupError}</p>}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (!signupPassword) { setSignupError('Please choose a password.'); return }
                            const result = signup(state.name, state.email, signupPassword)
                            if (result.success) {
                              setCreateAccount(false)
                              setSignupError('')
                            } else {
                              setSignupError(result.error ?? 'Something went wrong.')
                            }
                          }}
                          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                          style={{ backgroundColor: '#F5A623' }}
                        >
                          Create account
                        </button>
                        <button
                          onClick={() => setCreateAccount(false)}
                          className="px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:text-gray-700"
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer mb-6">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor: termsAccepted ? '#1B2A4A' : '#d1d5db',
                      backgroundColor: termsAccepted ? '#1B2A4A' : '#ffffff',
                    }}
                  >
                    {termsAccepted && <Check size={11} color="white" strokeWidth={3} />}
                  </div>
                </div>
                <span className="text-sm text-gray-600 leading-relaxed">
                  I agree to Bulldog Storage&apos;s{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline font-medium text-navy">Terms of Service</a>{' '}
                  and{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline font-medium text-navy">Privacy Policy</a>.
                </span>
              </label>

              {/* CTA */}
              {checkoutError && (
                <p className="text-sm text-red-500 mb-3 text-center">{checkoutError}</p>
              )}
              <button
                onClick={handleConfirm}
                disabled={!termsAccepted || checkoutLoading}
                className="w-full py-4 rounded-xl text-white font-bold text-base transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#F5A623' }}
                onMouseEnter={(e) => { if (termsAccepted && !checkoutLoading) e.currentTarget.style.backgroundColor = '#d4891a' }}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F5A623')}
              >
                {checkoutLoading ? 'Redirecting to payment…' : `Secure My Spot — $${pricing.total.toFixed(2)}`}
              </button>

              <div className="flex justify-start mt-4">
                <button
                  onClick={() => update({ step: 5 })}
                  className="px-6 py-3 rounded-xl text-sm font-semibold border-2 transition-colors"
                  style={{ borderColor: '#1B2A4A', color: '#1B2A4A' }}
                >
                  ← Back
                </button>
              </div>

              <p className="text-xs text-center text-gray-400 mt-4">
                Your spot is reserved once you click. We&apos;ll follow up by email to confirm your window.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
