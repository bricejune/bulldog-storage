import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICE_IDS: Record<string, string> = {
  essentials: process.env.STRIPE_PRICE_ESSENTIALS!,
  flex: process.env.STRIPE_PRICE_FLEX!,
  flexplus: process.env.STRIPE_PRICE_FLEXPLUS!,
  group: process.env.STRIPE_PRICE_GROUP!,
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { plan, total, bookingRef, customerEmail, bookingData } = body

    const origin = req.headers.get('origin') ?? 'https://bulldogstorage.us'

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[]

    if (plan === 'individual') {
      // Individual plan: variable price, charge exact total
      lineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Bulldog Storage — Individual Plan' },
            unit_amount: Math.round(total * 100),
          },
          quantity: 1,
        },
      ]
    } else {
      lineItems = [
        {
          price: PRICE_IDS[plan],
          quantity: 1,
        },
      ]

      // If there are overages, extra boxes, or premium fees on top of the base plan price,
      // add them as a separate line item
      const extras = total - getBasePlanPrice(plan)
      if (extras > 0.01) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: { name: 'Additional fees (overages / extras)' },
            unit_amount: Math.round(extras * 100),
          },
          quantity: 1,
        })
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: customerEmail,
      metadata: {
        bookingRef,
        plan,
        // Store condensed booking info for reference
        name: bookingData.name,
        phone: bookingData.phone,
        pickupDate: bookingData.pickupDate || 'TBD',
        returnDate: bookingData.returnDate || 'TBD',
      },
      success_url: `${origin}/book/success?session_id={CHECKOUT_SESSION_ID}&ref=${bookingRef}`,
      cancel_url: `${origin}/book?cancelled=1`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}

// Base plan prices at early access rates (must match PLAN_INFO in book/page.tsx)
function getBasePlanPrice(plan: string): number {
  const prices: Record<string, number> = {
    essentials: 175,
    flex: 250,
    flexplus: 419.99,
    group: 700,
  }
  return prices[plan] ?? 0
}
