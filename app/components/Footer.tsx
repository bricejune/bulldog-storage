import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone } from 'lucide-react'

export default function Footer() {
  const links = [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Contact', href: '/#contact' },
    { label: 'Book Now', href: '/book' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ]

  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="flex flex-col gap-5">
            <Image
              src="/logo-woodmark.png"
              alt="Bulldog Storage"
              width={140}
              height={140}
              className="h-20 w-auto object-contain brightness-0 invert"
            />
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Yale&apos;s most careful student storage service. We cap our bookings so your stuff always gets the attention it deserves.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">Quick Links</h4>
            <ul className="flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">Contact</h4>
            <div className="flex flex-col gap-4">
              <a
                href="mailto:help@bulldogstorage.us"
                className="flex items-center gap-2.5 text-sm text-white/70 hover:text-white transition-colors"
              >
                <Mail size={15} className="flex-shrink-0" />
                help@bulldogstorage.us
              </a>
              <a
                href="tel:+13016536369"
                className="flex items-center gap-2.5 text-sm text-white/70 hover:text-white transition-colors"
              >
                <Phone size={15} className="flex-shrink-0" />
                (301) 653-6369
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © 2026 Bulldog Storage. Yale&apos;s most careful storage service.
          </p>
          <p className="text-xs text-white/40">
            New Haven, CT
          </p>
        </div>
      </div>
    </footer>
  )
}
