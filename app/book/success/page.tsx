'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SuccessContent() {
  const params = useSearchParams()
  const ref = params.get('ref')
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Mark the booking as confirmed in localStorage
    try {
      const storageKey = 'bulldog-booking-draft'
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const booking = JSON.parse(raw)
        const confirmed = { ...booking, confirmed: true, bookingRef: ref ?? booking.bookingRef }
        localStorage.setItem(storageKey, JSON.stringify(confirmed))
        // Also save under user-specific key if logged in
        const sessionRaw = localStorage.getItem('BULLDOG_SESSION')
        if (sessionRaw) {
          const session = JSON.parse(sessionRaw)
          if (session?.id) {
            localStorage.setItem(`bulldog-booking-${session.id}`, JSON.stringify(confirmed))
          }
        }
      }
    } catch {
      // ignore
    }
    setDone(true)
  }, [ref])

  if (!done) return null

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <img
          src="/logo-woodmark.png"
          alt="Bulldog Storage"
          className="h-14 mx-auto mb-10 brightness-0"
          style={{ filter: 'brightness(0) saturate(100%) invert(14%) sepia(37%) saturate(700%) hue-rotate(190deg) brightness(90%) contrast(95%)' }}
        />

        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: '#F5A623' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B2A4A' }}>
          You&apos;re booked!
        </h1>
        <p className="text-gray-500 mb-2">
          Payment confirmed. We&apos;ll be in touch before pickup.
        </p>
        {ref && (
          <p className="text-sm font-mono font-semibold mb-8" style={{ color: '#1B2A4A' }}>
            Booking ref: {ref}
          </p>
        )}

        <Link
          href="/dashboard"
          className="inline-block w-full py-4 rounded-xl text-white font-bold text-base transition-colors"
          style={{ backgroundColor: '#1B2A4A' }}
        >
          View My Dashboard
        </Link>
        <Link
          href="/"
          className="inline-block mt-3 text-sm text-gray-400 hover:text-gray-600"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
