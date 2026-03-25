import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Bulldog Storage',
}

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-gray-400 mb-12">Last Updated: January 1, 2026</p>

        <div className="prose prose-lg max-w-none">

          <Section title="1. Acceptance of Terms">
            <SubSection title="1.1 Eligibility">
              By using Bulldog Storage&apos;s Services, you affirm that you are at least 18 years of age.
            </SubSection>
            <SubSection title="1.2 Agreement to Terms">
              Completing a booking constitutes full agreement to these Terms.
            </SubSection>
          </Section>

          <Section title="2. Services Provided">
            <SubSection title="2.1 Core Service">
              Seasonal student storage with door-to-door pickup and delivery. All items logged at pickup and stored in a secure facility.
            </SubSection>
            <SubSection title="2.2 What Makes Us Different">
              Bulldog Storage caps daily pickup bookings to ensure every student receives a real time window and every item is handled with care. We are a student-run operation.
            </SubSection>
            <SubSection title="2.3 Storage Plan Pricing">
              <ul className="mt-2 space-y-1 text-sm">
                <li><strong>Individual:</strong> $50/item, $100 minimum, up to 3 boxes</li>
                <li><strong>Essentials:</strong> $175 early / $225 regular, 5 items, 3 free boxes</li>
                <li><strong>Flex:</strong> $250 early / $300 regular, 10 items, 7 free boxes</li>
                <li><strong>Flex Plus:</strong> $419.99 early / $500 regular, 20 items, 12 free boxes</li>
                <li><strong>Group:</strong> $700, 30 items, 20 free boxes</li>
              </ul>
            </SubSection>
            <SubSection title="2.4 Item Tiers and Overage Rates">
              <ul className="mt-2 space-y-1 text-sm">
                <li><strong>Tier 1 Small:</strong> $25/item overage</li>
                <li><strong>Tier 2 Medium:</strong> $50/item overage</li>
                <li><strong>Tier 3 Heavy:</strong> $75/item overage</li>
              </ul>
              <p className="mt-2">Overage rates are applied to least expensive items first.</p>
            </SubSection>
            <SubSection title="2.5 Individual Plan">
              $50/item, $100 minimum. Boxes, bins, and bags only — no furniture.
            </SubSection>
            <SubSection title="2.6 Plan Upgrades">
              You may upgrade your plan before pickup. Downgrades are not permitted after booking.
            </SubSection>
          </Section>

          <Section title="3. Booking and Payment">
            <SubSection title="3.1 Payment">
              Full payment is required at booking via Stripe.
            </SubSection>
            <SubSection title="3.2 Final Pricing">
              Final pricing is based on actual item count at pickup.
            </SubSection>
            <SubSection title="3.3 Auto-Charge Authorization">
              By booking, you authorize Bulldog Storage to auto-charge your payment method for overages and applicable fees.
            </SubSection>
            <SubSection title="3.4 Promo Codes">
              Promo codes provide a 10% discount and cannot be combined with other offers.
            </SubSection>
          </Section>

          <Section title="4. Customer Responsibilities">
            <SubSection title="4.1 Accurate Information">
              Customers are required to provide accurate information at booking.
            </SubSection>
            <SubSection title="4.2 Item Preparation">
              Mini fridges must be emptied and defrosted. Fragile items must be disclosed prior to pickup.
            </SubSection>
            <SubSection title="4.3 Appointment Windows">
              The customer is responsible for being present or having items accessible during their scheduled pickup window.
            </SubSection>
            <SubSection title="4.4 Item Condition Acknowledgment">
              Customers acknowledge item condition at the time of booking.
            </SubSection>
          </Section>

          <Section title="5. Item Categories and Prohibited Items">
            <SubSection title="5.1 Accepted Items">
              Items in Tier 1, Tier 2, and Tier 3 categories as described in Section 2.4.
            </SubSection>
            <SubSection title="5.2 Prohibited Items">
              Bulldog Storage does not accept: perishables, hazardous materials, illegal substances, cash or jewelry, live plants or animals, or firearms.
            </SubSection>
            <SubSection title="5.3 Oversized and Unlisted Items">
              Email <a href="mailto:help@bulldogstorage.us" style={{ color: '#1B2A4A' }}>help@bulldogstorage.us</a> for approval of items not listed in the standard categories.
            </SubSection>
          </Section>

          <Section title="6. Insurance and Liability">
            <SubSection title="6.1 Coverage">
              Coverage of up to $100 per item when properly packed.
            </SubSection>
            <SubSection title="6.2 Total Liability Cap">
              Total liability is capped at $500 per booking.
            </SubSection>
            <SubSection title="6.3 Damage Claims">
              Damage claims must be submitted within 48 hours of delivery with supporting photos.
            </SubSection>
            <SubSection title="6.4 Non-Covered Items">
              Coverage does not apply to: pre-existing damage, improperly packed items, moisture or pest damage, or natural disasters.
            </SubSection>
          </Section>

          <Section title="7. Scheduling and Dates">
            <SubSection title="7.1 Standard Windows">
              Pickup: May 4–8, 2026. Return: Aug 23–27, 2026.
            </SubSection>
            <SubSection title="7.2 Premium Dates">
              A $150 fee applies for dates outside the standard windows.
            </SubSection>
            <SubSection title="7.3 Appointment Changes">
              Changes are free if made 7 or more days before pickup. A $50 fee applies for changes made within 7 days.
            </SubSection>
          </Section>

          <Section title="8. Cancellations and Refunds">
            <ul className="space-y-2 text-gray-700">
              <li><strong>7+ days before pickup:</strong> Full refund minus a $25 processing fee</li>
              <li><strong>3–7 days before pickup:</strong> 50% refund</li>
              <li><strong>Under 72 hours:</strong> No refund</li>
              <li><strong>No-shows:</strong> Forfeit full amount</li>
            </ul>
          </Section>

          <Section title="9. Storage Period">
            Items are stored from pickup through return date. Extended storage beyond the agreed return date is charged at $25/week. Items unclaimed 30 or more days after the return date may be considered abandoned.
          </Section>

          <Section title="10. Packing Help Add-On">
            For $40, one team member will assist with packing on pickup day.
          </Section>

          <Section title="11. Fee Schedule">
            <table className="w-full text-sm border-collapse mt-2">
              <tbody>
                {[
                  ['Oversized Item Fee', '$50'],
                  ['Unregistered Item Fee', '$50'],
                  ['Mispacked Item Fee', '$25'],
                  ['Item Holding Fee', '$25/day'],
                  ['Item Disposal Fee', '$25/item'],
                  ['Item Leakage Fee', '$50/item'],
                  ['Packing Assistance Fee', '$40/item'],
                  ['Rescheduling Fee', '$50'],
                  ['Extended Storage Fee', '$25/week'],
                  ['Premium Date Fee', '$150/date'],
                  ['Late Payment Fee', '$25/occurrence'],
                ].map(([label, amount]) => (
                  <tr key={label} className="border-b border-gray-100">
                    <td className="py-2 pr-4 text-gray-700">{label}</td>
                    <td className="py-2 font-semibold text-right" style={{ color: '#1B2A4A' }}>{amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="12. Prohibited Conduct">
            You agree not to: misrepresent items or information, store prohibited items, tamper with others&apos; belongings, or use our services for any illegal purpose.
          </Section>

          <Section title="13. Privacy">
            Your privacy is governed by our Privacy Policy, available at{' '}
            <Link href="/privacy" style={{ color: '#1B2A4A' }} className="underline">bulldogstorage.us/privacy</Link>.
          </Section>

          <Section title="14. Termination">
            Bulldog Storage may cancel bookings for violations of these Terms without refund.
          </Section>

          <Section title="15. Dispute Resolution">
            These Terms are governed by the laws of the State of Connecticut. Send written notice to{' '}
            <a href="mailto:help@bulldogstorage.us" style={{ color: '#1B2A4A' }}>help@bulldogstorage.us</a> first.
            If unresolved within 14 days, disputes shall be settled by binding arbitration under AAA rules.
          </Section>

          <Section title="16. Modifications">
            Bulldog Storage may update these Terms at any time. Continued use of our services constitutes acceptance of the updated Terms.
          </Section>

          <Section title="17. Contact">
            <p>Email: <a href="mailto:help@bulldogstorage.us" style={{ color: '#1B2A4A' }}>help@bulldogstorage.us</a></p>
            <p>Phone: <a href="tel:+13016536369" style={{ color: '#1B2A4A' }}>(301) 653-6369</a></p>
            <p>Web: <a href="https://bulldogstorage.us" style={{ color: '#1B2A4A' }}>bulldogstorage.us</a></p>
          </Section>

          <Section title="18. Entire Agreement">
            These Terms, together with our Privacy Policy, constitute the entire agreement between you and Bulldog Storage.
          </Section>

        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
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
