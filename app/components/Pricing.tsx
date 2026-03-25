import Link from 'next/link'

const plans = [
  {
    id: 'individual',
    name: 'Individual',
    earlyPrice: null as number | null,
    regularPrice: null as number | null,
    priceDisplay: '$50/item',
    subPrice: '($100 min)',
    items: 3,
    blurb: 'Best for students storing just a few things — a box or two, a fridge, a bag. Pay only for what you need.',
    badge: null as string | null,
    popular: false,
    showSmallPrint: false,
  },
  {
    id: 'essentials',
    name: 'Essentials',
    earlyPrice: 175 as number | null,
    regularPrice: 225 as number | null,
    priceDisplay: '$175',
    subPrice: 'early access',
    items: 5,
    blurb: 'Great for a light move-out — a few boxes, a lamp, maybe a fan. Simple and affordable.',
    badge: 'Save $50',
    popular: false,
    showSmallPrint: true,
  },
  {
    id: 'flex',
    name: 'Flex',
    earlyPrice: 250 as number | null,
    regularPrice: 300 as number | null,
    priceDisplay: '$250',
    subPrice: 'early access',
    items: 10,
    blurb: 'The go-to for most students — covers the typical mix of boxes, a chair, fridge, and a few extra items.',
    badge: 'Save $50',
    popular: true,
    showSmallPrint: true,
  },
  {
    id: 'flexplus',
    name: 'Flex Plus',
    earlyPrice: 419.99 as number | null,
    regularPrice: 500 as number | null,
    priceDisplay: '$419.99',
    subPrice: 'early access',
    items: 20,
    blurb: 'For students who have really settled in — furniture, appliances, the works. Plenty of room.',
    badge: 'Save $80',
    popular: false,
    showSmallPrint: true,
  },
  {
    id: 'group',
    name: 'Group',
    earlyPrice: 700 as number | null,
    regularPrice: 700 as number | null,
    priceDisplay: '$700',
    subPrice: null as string | null,
    items: 30,
    blurb: 'Perfect for suitemates splitting a booking. More items, one pickup, one price.',
    badge: null as string | null,
    popular: false,
    showSmallPrint: true,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-navy">
            Simple Plans. No Surprises.
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Every plan includes any mix of items up to your limit — boxes, furniture, appliances, whatever you&apos;ve got. Tiers only matter if you go over your limit.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border-2 shadow-sm overflow-hidden ${
                plan.popular
                  ? 'border-gold bg-navy'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Popular ribbon */}
              {plan.popular && (
                <div className="absolute top-4 right-0 text-white text-xs font-bold px-3 py-1 rounded-l-full bg-gold">
                  MOST POPULAR
                </div>
              )}

              {/* Save badge */}
              {plan.badge && !plan.popular && (
                <div className="absolute top-4 right-4 text-white text-xs font-bold px-2.5 py-1 rounded-full bg-navy">
                  {plan.badge}
                </div>
              )}
              {plan.badge && plan.popular && (
                <div className="absolute top-12 right-0 text-navy text-xs font-bold px-3 py-1 rounded-l-full bg-gold">
                  {plan.badge}
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                {/* Plan name */}
                <h3 className={`text-lg font-bold mb-1 ${plan.popular ? 'text-gold' : 'text-navy'}`}>
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-3">
                  <span className={`text-3xl font-bold ${plan.popular ? 'text-white' : 'text-navy'}`}>
                    {plan.priceDisplay}
                  </span>
                  {plan.subPrice && (
                    <span className={`text-sm ml-1 ${plan.popular ? 'text-white/60' : 'text-gray-500'}`}>
                      {plan.subPrice}
                    </span>
                  )}
                  {plan.earlyPrice && plan.regularPrice && plan.earlyPrice !== plan.regularPrice && (
                    <div className="mt-1">
                      <span className={`text-sm line-through ${plan.popular ? 'text-white/40' : 'text-gray-400'}`}>
                        ${plan.regularPrice} regular
                      </span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="mb-4 flex items-center gap-2">
                  <span className={`text-xs ${plan.popular ? 'text-gold' : 'text-navy'}`}>✓</span>
                  <span className={`text-sm ${plan.popular ? 'text-gray-200' : 'text-gray-700'}`}>
                    Up to <strong>{plan.items} items</strong>, any mix
                  </span>
                </div>

                {/* Blurb */}
                <p className={`text-xs leading-relaxed mb-4 flex-1 ${plan.popular ? 'text-white/70' : 'text-gray-500'}`}>
                  {plan.blurb}
                </p>

                {/* Small print */}
                {plan.showSmallPrint && (
                  <p className={`text-xs mb-4 leading-relaxed ${plan.popular ? 'text-white/40' : 'text-gray-400'}`}>
                    Includes any mix of Tier 1, 2, and 3 items up to your plan limit. Overage rates only apply beyond your included items.
                  </p>
                )}

                {/* CTA */}
                <Link
                  href="/book"
                  className={`block text-center py-3 px-4 rounded-xl text-sm font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-gold text-white hover:bg-gold-dark'
                      : 'bg-navy text-white hover:bg-navy-dark'
                  }`}
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
