import Link from 'next/link'

export default function Hero() {
  const trustBadges = [
    { icon: '📦', text: 'Capped daily bookings' },
    { icon: '🐾', text: 'Student-run, Yale-based' },
    { icon: '✅', text: 'Every item logged & tracked' },
    { icon: '🔒', text: 'Careful handling guaranteed' },
  ]

  return (
    <section className="relative overflow-hidden bg-navy pt-[88px]">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, #F5A623 0%, transparent 50%), radial-gradient(circle at 80% 20%, #F5A623 0%, transparent 40%)'
      }} />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center py-20 lg:py-28">

          {/* Text content — centered */}
          <div className="max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-sm font-medium text-white/80">Now booking for May 2026</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 text-white">
              Storage.<br />
              <span className="text-gold">Picked Up.</span><br />
              Dropped Off.<br />
              Done.
            </h1>

            <p className="text-lg sm:text-xl text-white/70 max-w-xl mb-10 leading-relaxed mx-auto">
              Yale&apos;s most careful student storage service. We cap our bookings so your stuff always gets the attention it deserves.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-navy font-bold text-base transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] bg-gold hover:bg-gold-light"
              >
                Book Now →
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-base transition-all border-2 border-white/30 text-white hover:bg-white/10"
              >
                See Pricing
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Trust badges bar */}
      <div className="border-t border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {trustBadges.map((badge) => (
              <div key={badge.text} className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{badge.icon}</span>
                <span className="text-sm font-medium text-white/80 leading-snug">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
