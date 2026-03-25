export default function WhyBulldog() {
  const reasons = [
    {
      emoji: '📦',
      tag: 'Capped bookings',
      title: 'Small by design.',
      body: 'We keep our operation intentionally small — not to be exclusive, but because we believe fewer bookings means better service. When we take your stuff, it gets our full attention.',
    },
    {
      emoji: '⚡',
      tag: 'On-time pickup',
      title: "We're fast when it matters.",
      body: "We know move-out week is chaotic and the last thing you need is to wait around. We show up in your window, work quickly, and get everything handled so you can focus on finals and goodbyes.",
    },
    {
      emoji: '📋',
      tag: 'Full item log',
      title: 'Every item, accounted for.',
      body: "We log everything we take, and you get a record of it. When we return your things at the start of the semester, you'll know exactly what to expect — no surprises, no missing items.",
    },
  ]

  return (
    <section id="why" className="py-24 px-5 sm:px-8 lg:px-12 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black mb-4 text-navy">
            Why Bulldog Storage?
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            We built this service to make move-out the least stressful part of your semester.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col gap-5 hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-navy/5">
                {reason.emoji}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3 text-navy">{reason.title}</h3>
                <p className="text-gray-600 leading-relaxed text-[15px]">{reason.body}</p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <span className="text-xs font-bold text-gold uppercase tracking-widest">
                  {reason.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
