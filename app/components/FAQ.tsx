'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What if I need to change my plan after booking?',
    answer:
      'No problem. Email us at help@bulldogstorage.us and we\'ll update your plan. Changes are easy as long as pickup is more than 48 hours away.',
  },
  {
    question: 'What happens if my item gets damaged?',
    answer:
      'We treat your items like they\'re ours. If something gets damaged in our care, contact us immediately and we\'ll make it right. We log everything at pickup so there\'s never a dispute about what we received.',
  },
  {
    question: 'Can I add items after I\'ve booked?',
    answer:
      'Yes — email us and we\'ll update your item list. If additions push you into a higher plan, we\'ll let you know the price difference before anything changes.',
  },
  {
    question: 'What if I miss my pickup window?',
    answer:
      'Contact us as soon as possible. We\'ll do our best to reschedule, though availability may be limited during peak move-out week.',
  },
  {
    question: 'Do I need to be there for pickup?',
    answer:
      'You or a trusted friend should be there so we can log items together. This protects both you and us.',
  },
  {
    question: 'What\'s your cancellation policy?',
    answer:
      'Cancellations more than 7 days before pickup are fully refunded. Within 7 days, we\'ll issue a credit good for next year.',
  },
  {
    question: 'What counts as a Tier 1, 2, or 3 item?',
    answer:
      'Tier 1 is anything small and light — posters, pillows, small bags. Tier 2 is medium stuff like boxes, bins, and appliances. Tier 3 is heavy furniture. Full list is in the "What Can I Store?" section above.',
  },
  {
    question: 'Can I store items not on the list?',
    answer:
      'Probably yes — email help@bulldogstorage.us with what you have and we\'ll confirm the tier and pricing.',
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="w-full text-left py-5 px-0 flex items-center justify-between gap-4 group"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-gray-900 group-hover:text-navy transition-colors" style={{ color: open ? '#1B2A4A' : undefined }}>
          {question}
        </span>
        <ChevronDown
          size={20}
          className="flex-shrink-0 text-gray-400 transition-transform duration-200"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            color: open ? '#F5A623' : undefined,
          }}
        />
      </button>
      {open && (
        <div className="pb-5">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B2A4A' }}>
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-500">
            Have a question we didn&apos;t answer? Email us at{' '}
            <a href="mailto:help@bulldogstorage.us" className="underline font-medium" style={{ color: '#1B2A4A' }}>
              help@bulldogstorage.us
            </a>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-2">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}
