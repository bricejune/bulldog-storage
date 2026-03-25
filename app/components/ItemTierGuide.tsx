const tiers = [
  {
    tier: 'Tier 1',
    label: 'Small',
    overage: '$25/item',
    color: '#1B2A4A',
    items: [
      'Handbag',
      'Mirror',
      'Poster / Picture Frame',
      'Pillow',
      'Reading Pillow',
      'Poster Tube',
      'Umbrella',
      'Lacrosse / Hockey Stick',
      'Instrument Case',
      'Broom / Mop',
    ],
  },
  {
    tier: 'Tier 2',
    label: 'Medium',
    overage: '$50/item',
    color: '#F5A623',
    items: [
      'Moving Box',
      'Tote Bin',
      'Storage Tub',
      'Duffel Bag',
      'Suitcase',
      'Hard-Shell Case',
      'Laundry Basket',
      'Trash Can',
      'Beanbag Chair',
      'Mini Fridge',
      'Microwave',
      'TV / Monitor',
      'Fan',
      'Lamp',
      'Area Rug',
      'Step Stool / Ladder',
      'Ironing Board',
      'Vacuum',
      'Shoe Rack',
      'Desk Chair',
      'Papasan / Circle Chair',
      'Folding Chair',
      'Nightstand',
    ],
  },
  {
    tier: 'Tier 3',
    label: 'Heavy',
    overage: '$75/item',
    color: '#374151',
    items: [
      'Shelving',
      'Drawers',
      'Ottoman / Trunk',
      'Headboard',
      'Couch / Futon',
      'Trunk',
      'Mattress',
    ],
  },
]

export default function ItemTierGuide() {
  return (
    <section id="items" className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B2A4A' }}>
            What Can I Store?
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Book a plan and store any combination of these items up to your limit — no sorting needed. Overage rates below only apply if you exceed your plan&apos;s item count.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.tier}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-5" style={{ backgroundColor: tier.color }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                      {tier.tier}
                    </p>
                    <h3 className="text-xl font-bold text-white">{tier.label}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/70">Overage</p>
                    <p className="text-lg font-bold text-white">{tier.overage}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="px-6 py-5">
                <ul className="space-y-1.5">
                  {tier.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: tier.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center mt-8 text-sm text-gray-500">
          Don&apos;t see your item?{' '}
          <a
            href="mailto:help@bulldogstorage.us"
            className="font-medium underline hover:text-navy transition-colors"
            style={{ color: '#1B2A4A' }}
          >
            Email help@bulldogstorage.us
          </a>{' '}
          and we&apos;ll sort it out.
        </p>
      </div>
    </section>
  )
}
