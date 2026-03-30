import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

const PRICE_IDS: Record<string, string> = {
  essentials: process.env.STRIPE_PRICE_ESSENTIALS!,
  flex: process.env.STRIPE_PRICE_FLEX!,
  flexplus: process.env.STRIPE_PRICE_FLEXPLUS!,
  group: process.env.STRIPE_PRICE_GROUP!,
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  })

  try {
    const body = await req.json()
    const { plan, total, bookingRef, customerEmail, bookingData } = body

    const origin = req.headers.get('origin') ?? 'https://bulldogstorage.us'

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[]

    if (plan === 'individual') {
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
    const message = err instanceof Error ? err.message : 'Failed to create checkout session'
    console.error('Stripe checkout error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function getBasePlanPrice(plan: string): number {
  const prices: Record<string, number> = {
    essentials: 175,
    flex: 250,
    flexplus: 419.99,
    group: 700,
  }
  return prices[plan] ?? 0
}
