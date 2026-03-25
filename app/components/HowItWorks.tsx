export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Book Your Plan',
      body: 'Pick the plan that fits your stuff, tell us roughly what you have, and choose your dates. No stress — everything is an estimate.',
      icon: '🗓️',
    },
    {
      number: '02',
      title: 'We Pick Everything Up',
      body: 'We show up in your move-out window, log every item on the spot, and haul it all away safely. You can be there or just leave your things accessible.',
      icon: '🚛',
    },
    {
      number: '03',
      title: 'We Bring It Back',
      body: "When school starts back up, we return everything to your new room. You get your full item list so you know exactly what's coming.",
      icon: '🏠',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 px-5 sm:px-8 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-black mb-4 text-navy">
            How It Works
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Three steps. No drama, no guessing, no missing stuff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" style={{ top: '40px', left: '20%', right: '20%' }} />

          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center text-center gap-6">
              {/* Step circle */}
              <div className="relative">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${
                  index === 1 ? 'bg-gold' : 'bg-navy'
                }`}>
                  {step.icon}
                </div>
                <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 border-white shadow-md ${
                  index === 1 ? 'bg-navy text-white' : 'bg-gold text-navy'
                }`}>
                  {index + 1}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3 text-navy">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed max-w-xs mx-auto text-[15px]">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <a
            href="/book"
            className="inline-flex items-center justify-center px-9 py-4 rounded-xl text-navy font-bold text-base transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] bg-gold hover:bg-gold-light"
          >
            Book Your Spot →
          </a>
        </div>
      </div>
    </section>
  )
}
