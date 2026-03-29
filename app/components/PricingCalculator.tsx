'use client'

import { useState } from 'react'
import Link from 'next/link'

const PLANS = [
  { id: 'individual', name: 'Individual', price: null, items: 3, perItem: 50, min: 100 },
  { id: 'essentials', name: 'Essentials', price: 175, items: 5 },
  { id: 'flex', name: 'Flex', price: 250, items: 10 },
  { id: 'flexplus', name: 'Flex Plus', price: 419.99, items: 20 },
  { id: 'group', name: 'Group', price: 700, items: 30 },
]

const OVERAGE = { tier1: 25, tier2: 50, tier3: 75 }

function calcTotal(tier1: number, tier2: number, tier3: number) {
  const total = tier1 + tier2 + tier3

  // Individual
  const individualCost = Math.max(100, total * 50)

  // For each plan, calculate base + overages
  const results = PLANS.map((plan) => {
    if (plan.id === 'individual') {
      return { ...plan, cost: individualCost, overageCost: 0, recommended: false }
    }
    const limit = plan.items
    let remaining = limit
    let overageCost = 0

    // Apply most expensive items to plan first (tier3, tier2, tier1)
    const t3Used = Math.min(tier3, remaining); remaining -= t3Used
    const t2Used = Math.min(tier2, remaining); remaining -= t2Used
    const t1Used = Math.min(tier1, remaining)

    // Overages for items beyond limit
    const t3Over = Math.max(0, tier3 - t3Used)
    const t2Over = Math.max(0, tier2 - t2Used)
    const t1Over = Math.max(0, tier1 - t1Used)
    overageCost = t3Over * OVERAGE.tier3 + t2Over * OVERAGE.tier2 + t1Over * OVERAGE.tier1

    return { ...plan, cost: plan.price! + overageCost, overageCost, recommended: false }
  })

  // Find best value (lowest cost for the item count)
  let bestIdx = 0
  let bestCost = Infinity
  results.forEach((r, i) => {
    if (r.cost < bestCost) { bestCost = r.cost; bestIdx = i }
  })
  results[bestIdx].recommended = true

  return results
}

export default function PricingCalculator() {
  const [tier1, setTier1] = useState(0)
  const [tier2, setTier2] = useState(0)
  const [tier3, setTier3] = useState(0)

  const total = tier1 + tier2 + tier3
  const results = calcTotal(tier1, tier2, tier3)
  const recommended = results.find(r => r.recommended)!

  const Counter = ({ label, sublabel, value, onChange }: {
    label: string, sublabel: string, value: number, onChange: (v: number) => void
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-semibold text-navy text-sm">{label}</p>
        <p className="text-xs text-gray-400">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-navy hover:text-navy transition-colors font-bold"
        >−</button>
        <span className="w-6 text-center font-bold text-navy text-lg">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full border-2 border-gold flex items-center justify-center text-gold hover:bg-gold hover:text-white transition-colors font-bold"
        >+</button>
      </div>
    </div>
  )

  return (
    <section className="py-24 px-5 sm:px-8 lg:px-12 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black mb-4 text-navy">
            Find Your Plan
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Tell us roughly what you're bringing — we'll show you the best plan and exact price.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left — item counters */}
          <div className="bg-[#F8F9FA] rounded-3xl p-8">
            <h3 className="font-bold text-navy text-lg mb-1">What are you storing?</h3>
            <p className="text-sm text-gray-400 mb-6">Rough estimates are fine — you can adjust later.</p>

            <Counter
              label="Small items"
              sublabel="Pillows, posters, handbags, sports gear"
              value={tier1}
              onChange={setTier1}
            />
            <Counter
              label="Medium items"
              sublabel="Boxes, bins, mini fridge, desk chair, fan"
              value={tier2}
              onChange={setTier2}
            />
            <Counter
              label="Heavy / furniture"
              sublabel="Couch, mattress, shelving, drawers"
              value={tier3}
              onChange={setTier3}
            />

            {total > 0 && (
              <div className="mt-5 pt-5 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Total items</span>
                <span className="text-2xl font-black text-navy">{total}</span>
              </div>
            )}
          </div>

          {/* Right — plan results */}
          <div className="flex flex-col gap-3">
            {total === 0 ? (
              <div className="flex flex-col items-center justify-center bg-[#F8F9FA] rounded-3xl p-12 text-center h-full">
                <p className="text-gray-500 font-medium">Add items to see your best plan and price.</p>
              </div>
            ) : (
              <>
                {results.map((plan) => (
                  <div
                    key={plan.id}
                    className={`rounded-2xl p-5 border-2 transition-all ${
                      plan.recommended
                        ? 'border-gold bg-navy text-white shadow-xl'
                        : 'border-gray-100 bg-white text-navy'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`font-bold text-base ${plan.recommended ? 'text-white' : 'text-navy'}`}>
                              {plan.name}
                            </p>
                            {plan.recommended && (
                              <span className="text-xs font-bold bg-gold text-navy px-2 py-0.5 rounded-full">
                                Best value
                              </span>
                            )}
                          </div>
                          <p className={`text-xs ${plan.recommended ? 'text-white/60' : 'text-gray-400'}`}>
                            {plan.id === 'individual'
                              ? 'Up to 3 boxes only'
                              : `Up to ${plan.items} items · ${plan.overageCost > 0 ? `$${plan.overageCost} in overages` : 'no overages'}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black ${plan.recommended ? 'text-gold' : 'text-navy'}`}>
                          ${plan.cost % 1 === 0 ? plan.cost : plan.cost.toFixed(2)}
                        </p>
                        {plan.id !== 'individual' && plan.overageCost > 0 && (
                          <p className={`text-xs ${plan.recommended ? 'text-white/50' : 'text-gray-400'}`}>
                            ${(plan as any).price} + ${plan.overageCost} overages
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <Link
                  href="/book"
                  className="mt-2 block text-center py-4 px-6 rounded-2xl font-bold text-navy bg-gold hover:bg-gold-dark transition-all shadow-lg hover:shadow-xl text-base"
                >
                  Book the {recommended.name} Plan →
                </Link>
                <p className="text-center text-xs text-gray-400">
                  All prices shown are early access rates. Final cost confirmed at pickup.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
