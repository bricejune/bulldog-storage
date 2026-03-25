'use client'

import { useState } from 'react'
import { Mail, Phone, ExternalLink } from 'lucide-react'

export default function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Show success state without backend
    setSubmitted(true)
  }

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B2A4A' }}>
            We&apos;re Real People. Reach Out Anytime.
          </h2>
          <p className="text-lg text-gray-500">
            We typically respond within a few hours. During move-out week we&apos;re on call.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-bold mb-6" style={{ color: '#1B2A4A' }}>Get in Touch</h3>
              <div className="flex flex-col gap-5">
                <a
                  href="mailto:help@bulldogstorage.us"
                  className="flex items-center gap-4 group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{ backgroundColor: '#1B2A4A10' }}
                  >
                    <Mail size={20} style={{ color: '#1B2A4A' }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Email</p>
                    <p className="text-base font-semibold group-hover:underline" style={{ color: '#1B2A4A' }}>
                      help@bulldogstorage.us
                    </p>
                  </div>
                </a>

                <a
                  href="tel:+13016536369"
                  className="flex items-center gap-4 group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#1B2A4A10' }}
                  >
                    <Phone size={20} style={{ color: '#1B2A4A' }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Phone</p>
                    <p className="text-base font-semibold group-hover:underline" style={{ color: '#1B2A4A' }}>
                      (301) 653-6369
                    </p>
                  </div>
                </a>

              </div>
            </div>

            <div className="rounded-2xl p-6 border border-gray-100" style={{ backgroundColor: '#F8F9FA' }}>
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold" style={{ color: '#1B2A4A' }}>Move-out week?</span>{' '}
                We&apos;re on call and monitoring messages around the clock. Don&apos;t hesitate to reach out for anything.
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full min-h-64 text-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                  style={{ backgroundColor: '#1B2A4A10' }}
                >
                  ✅
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#1B2A4A' }}>Message Sent!</h3>
                <p className="text-gray-600">We&apos;ll get back to you within a few hours.</p>
                <button
                  onClick={() => { setSubmitted(false); setFormState({ name: '', email: '', message: '' }) }}
                  className="text-sm font-medium underline mt-2"
                  style={{ color: '#1B2A4A' }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all"
                    style={{ '--tw-ring-color': '#1B2A4A40' } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder="your.name@yale.edu"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder="What can we help you with?"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-colors"
                  style={{ backgroundColor: '#F5A623' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d4891a')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F5A623')}
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
