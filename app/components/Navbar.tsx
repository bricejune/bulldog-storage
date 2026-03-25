'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = () => {
    logout()
    router.push('/')
    setMenuOpen(false)
  }

  const firstName = user?.name?.split(' ')[0] ?? ''

  const baseNavLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-18" style={{ height: '88px' }}>
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-woodmark.png"
              alt="Bulldog Storage"
              width={140}
              height={140}
              className="h-20 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {baseNavLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-500 hover:text-navy transition-colors"
              >
                {link.label}
              </a>
            ))}

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-500 hover:text-navy transition-colors"
                >
                  Dashboard
                </Link>
                <span className="text-sm font-medium" style={{ color: '#1B2A4A' }}>
                  Hi, {firstName}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-semibold px-4 py-2 rounded-xl border-2 transition-all hover:bg-gray-50"
                  style={{ borderColor: '#1B2A4A', color: '#1B2A4A' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="text-sm font-medium text-gray-500 hover:text-navy transition-colors"
              >
                Sign In
              </Link>
            )}

            <Link
              href="/book"
              className="text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all shadow-md hover:shadow-lg bg-gold hover:bg-gold-dark"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-navy hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-5 py-5 flex flex-col gap-4">
            {baseNavLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-navy py-1 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-navy py-1 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <span className="text-sm font-medium py-1" style={{ color: '#1B2A4A' }}>
                  Hi, {firstName}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-semibold px-5 py-3 rounded-xl border-2 text-left transition-colors"
                  style={{ borderColor: '#1B2A4A', color: '#1B2A4A' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="text-sm font-medium text-gray-700 hover:text-navy py-1 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
            )}

            <Link
              href="/book"
              className="text-sm font-bold px-5 py-3.5 rounded-xl text-white text-center transition-colors bg-gold hover:bg-gold-dark"
              onClick={() => setMenuOpen(false)}
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
