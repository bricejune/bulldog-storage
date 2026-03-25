import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Bulldog Storage',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-10 transition-colors"
          style={{ color: '#1B2A4A' }}
        >
          ← Back to home
        </Link>

        <h1 className="text-4xl font-bold mb-2" style={{ color: '#1B2A4A' }}>
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-400 mb-12">Last Updated: January 1, 2026</p>

        <div className="space-y-10">

          <Section title="1. Information We Collect">
            <SubSection title="1.1 Personal Information">
              We collect your name, email address, phone number, and booking information (dorm, items, dates). Payment is processed via Stripe — we do not store your payment details directly.
            </SubSection>
            <SubSection title="1.2 Non-Personal Information">
              We collect device information, usage data, and session data stored in your browser&apos;s localStorage.
            </SubSection>
            <SubSection title="1.3 From Third Parties">
              We receive payment confirmation only from Stripe.
            </SubSection>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use your information to:</p>
            <ul className="mt-2 space-y-1 text-sm list-disc pl-5">
              <li>Process and manage your booking</li>
              <li>Communicate scheduling and logistics</li>
              <li>Send receipts and booking confirmations</li>
              <li>Respond to support requests</li>
              <li>Improve our services</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mt-3">We never use your information for advertising or behavioral tracking.</p>
          </Section>

          <Section title="3. How We Share Your Information">
            <p>We do not sell or rent your personal information. Your data is shared only with:</p>
            <ul className="mt-2 space-y-1 text-sm list-disc pl-5">
              <li><strong>Stripe</strong> — for payment processing</li>
              <li><strong>Legal authorities</strong> — if required by law</li>
              <li><strong>Business successors</strong> — in the event of a business transfer, with prior notice to you</li>
            </ul>
          </Section>

          <Section title="4. Data Retention">
            We retain your data for up to 2 years after your booking. You may request deletion by emailing{' '}
            <a href="mailto:help@bulldogstorage.us" style={{ color: '#1B2A4A' }} className="underline">help@bulldogstorage.us</a>.
            Deletion requests are honored within 30 days.
          </Section>

          <Section title="5. Your Rights">
            <SubSection title="5.1 Access and Correction">
              You may request access to or correction of your personal data by emailing us.
            </SubSection>
            <SubSection title="5.2 Opt-Out">
              You may opt out of non-essential communications at any time.
            </SubSection>
            <SubSection title="5.3 Data Deletion">
              You may request deletion of your data within 30 days by contacting us.
            </SubSection>
            <SubSection title="5.4 California Residents (CCPA)">
              You have the right to know what data we collect, the right to delete it, and the right to opt out of its sale. We do not sell your data.
            </SubSection>
          </Section>

          <Section title="6. Security">
            We use HTTPS/TLS encryption for all data in transit. Payment data is handled by Stripe, which is PCI DSS Level 1 certified. Booking session data is stored in your browser&apos;s localStorage.
          </Section>

          <Section title="7. Cookies">
            We use session cookies only to maintain booking progress. We do not use advertising cookies or retargeting.
          </Section>

          <Section title="8. Third-Party Links">
            Our site may link to third-party websites. We are not responsible for the privacy practices of those sites.
          </Section>

          <Section title="9. Children's Privacy">
            Our services are for users 18 and older. If we become aware that we have collected data from a minor, we will delete it promptly.
          </Section>

          <Section title="10. Changes to This Policy">
            We will notify you of material changes at least 7 days in advance via email. Continued use of our services after changes take effect constitutes acceptance.
          </Section>

          <Section title="11. Contact">
            <p>Email: <a href="mailto:help@bulldogstorage.us" style={{ color: '#1B2A4A' }} className="underline">help@bulldogstorage.us</a></p>
            <p>Phone: <a href="tel:+13016536369" style={{ color: '#1B2A4A' }}>(301) 653-6369</a></p>
            <p>Web: <a href="https://bulldogstorage.us" style={{ color: '#1B2A4A' }}>bulldogstorage.us</a></p>
          </Section>

        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4" style={{ color: '#1B2A4A' }}>{title}</h2>
      <div className="text-gray-700 leading-relaxed space-y-3">{children}</div>
    </div>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <h3 className="text-base font-semibold mb-1" style={{ color: '#374151' }}>{title}</h3>
      <div className="text-gray-600 text-sm leading-relaxed">{children}</div>
    </div>
  )
}
