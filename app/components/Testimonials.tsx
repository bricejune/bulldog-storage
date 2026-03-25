const testimonials = [
  {
    quote: 'Bulldog Storage made move-out week actually manageable. Showed up on time, logged everything, zero stress.',
    author: "Yale '27",
    detail: 'Stored with us May 2025',
  },
  {
    quote: 'I was nervous about my monitor and mini fridge. They wrapped everything carefully and sent me a full item list. 10/10.',
    author: "Yale '26",
    detail: 'Flex Plan',
  },
  {
    quote: 'Everything came back in perfect condition. The item log they sent me made me feel totally at ease over the summer.',
    author: "Yale '27",
    detail: 'Essentials Plan',
  },
]

export default function Testimonials() {
  return (
    <section className="py-24 px-5 sm:px-8 lg:px-12 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black mb-4 text-navy">
            What Students Are Saying
          </h2>
          <p className="text-lg text-gray-500">
            Real feedback from Yale students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col gap-5 hover:shadow-md transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, s) => (
                  <span key={s} className="text-base text-gold">★</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 leading-relaxed flex-1 text-base">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm bg-navy flex-shrink-0">
                  Y
                </div>
                <div>
                  <p className="text-sm font-bold text-navy">{t.author}</p>
                  <p className="text-xs text-gray-400">{t.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
