// app/api/stripe/webhook/route.ts
// Stripe webhook handler for payment and subscription events
// IMPORTANT: This endpoint must receive the raw body, not parsed JSON

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { constructWebhookEvent } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import {
  SUBSCRIPTION_PLAN_DETAILS,
  type SubscriptionPlanType,
} from '@/lib/constants/pricing'

// ============================================
// WEBHOOK CONFIGURATION
// ============================================

// Disable body parsing - we need the raw body for signature verification
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ============================================
// TYPE DEFINITIONS
// ============================================

// Use a more flexible type for webhook data objects
// Stripe's types can be strict and not always match the actual payload
interface SubscriptionData {
  id: string
  status: string
  customer: string | { id: string }
  items: {
    data: Array<{
      price: {
        id: string
        recurring?: {
          interval: string
        }
      }
    }>
  }
  metadata?: Record<string, string>
  created: number
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  canceled_at?: number | null
}

interface InvoiceData {
  id: string
  subscription?: string | { id: string } | null
  customer: string | { id: string }
  amount_paid?: number
  amount_due?: number
  currency?: string
  hosted_invoice_url?: string | null
}

interface PaymentIntentData {
  id: string
  payment_method?: {
    card?: {
      last4: string
      brand: string
    }
  } | string | null
}

// ============================================
// WEBHOOK HANDLER
// ============================================

export async function POST(request: NextRequest) {
  try {
    // 1. Get the raw body as text for signature verification
    const body = await request.text()

    // 2. Get the Stripe signature from headers
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // 3. Verify the webhook signature and construct the event
    let event: Stripe.Event

    try {
      event = constructWebhookEvent(body, signature)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    // 4. Handle the event based on type
    console.log(`Processing Stripe webhook: ${event.type}`)

    switch (event.type) {
      // ============================================
      // CHECKOUT EVENTS
      // ============================================

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session)
        break

      // ============================================
      // SUBSCRIPTION EVENTS
      // ============================================

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as unknown as SubscriptionData)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as unknown as SubscriptionData)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as unknown as SubscriptionData)
        break

      // ============================================
      // INVOICE/PAYMENT EVENTS
      // ============================================

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as unknown as InvoiceData)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as unknown as InvoiceData)
        break

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as unknown as PaymentIntentData)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as unknown as PaymentIntentData)
        break

      // ============================================
      // UNHANDLED EVENTS
      // ============================================

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // 5. Return success response
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// ============================================
// CHECKOUT HANDLERS
// ============================================

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id)

  const userId = session.metadata?.userId
  const type = session.metadata?.type // 'one_time' or 'subscription'

  if (!userId) {
    console.error('No userId in session metadata')
    return
  }

  if (type === 'one_time') {
    // Handle one-time payment completion
    await handleOneTimePaymentComplete(session, userId)
  } else if (type === 'subscription') {
    // Subscription is handled by customer.subscription.created event
    console.log('Subscription checkout completed - waiting for subscription.created event')
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  console.log('Checkout session expired:', session.id)

  // Optionally clean up any pending records
  const userId = session.metadata?.userId
  if (userId) {
    // Mark any pending payments as cancelled
    await prisma.payment.updateMany({
      where: {
        stripeCheckoutSessionId: session.id,
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
      },
    })
  }
}

async function handleOneTimePaymentComplete(
  session: Stripe.Checkout.Session,
  userId: string
) {
  const packageType = session.metadata?.packageType
  const jobId = session.metadata?.jobId

  // Get payment details from the session
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : (session.payment_intent as { id: string } | null)?.id

  // Create payment record
  await prisma.payment.create({
    data: {
      userId,
      amount: (session.amount_total || 0) / 100, // Convert from cents
      currency: session.currency?.toUpperCase() || 'NZD',
      status: 'PAID',
      type: 'ONE_TIME',
      description: `${packageType} Package Purchase`,
      stripePaymentIntentId: paymentIntentId || undefined,
      stripeCheckoutSessionId: session.id,
      paidAt: new Date(),
      jobId: jobId || undefined,
    },
  })

  // If linked to a job, mark the job as paid
  if (jobId) {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        package: packageType || 'PROFESSIONAL',
      },
    })
  }

  // Create notification for user
  await prisma.notification.create({
    data: {
      userId,
      title: 'Payment Successful',
      message: `Your payment for the ${packageType} package has been received.`,
      type: 'PAYMENT_RECEIVED',
      link: jobId ? `/jobs/${jobId}` : '/dashboard',
    },
  })

  console.log(`One-time payment completed for user ${userId}`)
}

// ============================================
// SUBSCRIPTION HANDLERS
// ============================================

async function handleSubscriptionCreated(subscription: SubscriptionData) {
  console.log('Subscription created:', subscription.id)

  const userId = subscription.metadata?.userId
  if (!userId) {
    console.error('No userId in subscription metadata')
    return
  }

  const priceId = subscription.items.data[0]?.price.id
  const planType = getPlanTypeFromPriceId(priceId)
  const billingInterval = subscription.items.data[0]?.price.recurring?.interval
  const billingCycle = billingInterval === 'year' ? 'YEARLY' : 'MONTHLY'

  const planDetails = planType ? SUBSCRIPTION_PLAN_DETAILS[planType] : null
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id

  // Create or update subscription in database
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: planType || 'PRO',
      status: mapStripeStatus(subscription.status),
      billingCycle,
      pricePerCycle:
        billingCycle === 'YEARLY'
          ? planDetails?.yearlyPrice || 0
          : planDetails?.monthlyPrice || 0,
      startDate: new Date(subscription.created * 1000),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      projectsLimit: planDetails?.projectsPerMonth || 5,
    },
    update: {
      plan: planType || 'PRO',
      status: mapStripeStatus(subscription.status),
      billingCycle,
      pricePerCycle:
        billingCycle === 'YEARLY'
          ? planDetails?.yearlyPrice || 0
          : planDetails?.monthlyPrice || 0,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      projectsLimit: planDetails?.projectsPerMonth || 5,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  })

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      title: 'Subscription Started',
      message: `Welcome to the ${planType} plan! Your subscription is now active.`,
      type: 'PAYMENT_RECEIVED',
      link: '/dashboard',
    },
  })

  console.log(`Subscription created for user ${userId}: ${planType}`)
}

async function handleSubscriptionUpdated(subscription: SubscriptionData) {
  console.log('Subscription updated:', subscription.id)

  // Find subscription by Stripe ID
  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!existingSubscription) {
    console.error('Subscription not found in database:', subscription.id)
    return
  }

  const priceId = subscription.items.data[0]?.price.id
  const planType = getPlanTypeFromPriceId(priceId)
  const billingInterval = subscription.items.data[0]?.price.recurring?.interval
  const billingCycle = billingInterval === 'year' ? 'YEARLY' : 'MONTHLY'
  const planDetails = planType ? SUBSCRIPTION_PLAN_DETAILS[planType] : null

  // Update subscription
  await prisma.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      plan: planType || existingSubscription.plan,
      status: mapStripeStatus(subscription.status),
      billingCycle,
      pricePerCycle:
        billingCycle === 'YEARLY'
          ? planDetails?.yearlyPrice || existingSubscription.pricePerCycle
          : planDetails?.monthlyPrice || existingSubscription.pricePerCycle,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      stripePriceId: priceId,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      cancelledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      projectsLimit: planDetails?.projectsPerMonth || existingSubscription.projectsLimit,
    },
  })

  // Notify if subscription is set to cancel
  if (subscription.cancel_at_period_end && !existingSubscription.cancelAtPeriodEnd) {
    await prisma.notification.create({
      data: {
        userId: existingSubscription.userId,
        title: 'Subscription Cancellation Scheduled',
        message: `Your subscription will end on ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}.`,
        type: 'STATUS_UPDATE',
        link: '/dashboard',
      },
    })
  }

  console.log(`Subscription updated: ${subscription.id}`)
}

async function handleSubscriptionDeleted(subscription: SubscriptionData) {
  console.log('Subscription deleted:', subscription.id)

  // Find and update subscription
  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!existingSubscription) {
    console.error('Subscription not found in database:', subscription.id)
    return
  }

  await prisma.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
  })

  // Create notification
  await prisma.notification.create({
    data: {
      userId: existingSubscription.userId,
      title: 'Subscription Ended',
      message: 'Your subscription has been cancelled. We hope to see you again!',
      type: 'STATUS_UPDATE',
      link: '/pricing',
    },
  })

  console.log(`Subscription deleted for user ${existingSubscription.userId}`)
}

// ============================================
// INVOICE/PAYMENT HANDLERS
// ============================================

async function handleInvoicePaid(invoice: InvoiceData) {
  console.log('Invoice paid:', invoice.id)

  // Only process subscription invoices
  if (!invoice.subscription) return

  const subscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription.id

  // Find subscription in our database
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  })

  if (!subscription) {
    console.error('Subscription not found for invoice:', invoice.id)
    return
  }

  // Create payment record
  await prisma.payment.create({
    data: {
      userId: subscription.userId,
      amount: (invoice.amount_paid || 0) / 100,
      currency: invoice.currency?.toUpperCase() || 'NZD',
      status: 'PAID',
      type: 'SUBSCRIPTION',
      description: `${subscription.plan} Subscription - ${subscription.billingCycle}`,
      stripeInvoiceId: invoice.id,
      invoiceUrl: invoice.hosted_invoice_url || undefined,
      paidAt: new Date(),
      subscriptionMonth: new Date().toISOString().slice(0, 7), // "2025-01"
    },
  })

  // Reset monthly usage if it's a new billing period
  const now = new Date()
  const lastReset = subscription.lastResetDate

  if (
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear()
  ) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        projectsUsedThisMonth: 0,
        lastResetDate: now,
      },
    })
  }

  console.log(`Invoice paid for subscription ${subscriptionId}`)
}

async function handleInvoicePaymentFailed(invoice: InvoiceData) {
  console.log('Invoice payment failed:', invoice.id)

  if (!invoice.subscription) return

  const subscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription.id

  // Find subscription
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  })

  if (!subscription) return

  // Update subscription status
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'PAST_DUE',
    },
  })

  // Create notification
  await prisma.notification.create({
    data: {
      userId: subscription.userId,
      title: 'Payment Failed',
      message:
        'We were unable to process your subscription payment. Please update your payment method.',
      type: 'STATUS_UPDATE',
      link: '/dashboard',
    },
  })

  // Create failed payment record
  await prisma.payment.create({
    data: {
      userId: subscription.userId,
      amount: (invoice.amount_due || 0) / 100,
      currency: invoice.currency?.toUpperCase() || 'NZD',
      status: 'FAILED',
      type: 'SUBSCRIPTION',
      description: `${subscription.plan} Subscription Payment Failed`,
      stripeInvoiceId: invoice.id,
    },
  })

  console.log(`Invoice payment failed for subscription ${subscriptionId}`)
}

async function handlePaymentIntentSucceeded(paymentIntent: PaymentIntentData) {
  console.log('Payment intent succeeded:', paymentIntent.id)

  // Get card details if available
  let cardLast4: string | undefined
  let cardBrand: string | undefined

  if (paymentIntent.payment_method && typeof paymentIntent.payment_method === 'object') {
    cardLast4 = paymentIntent.payment_method.card?.last4
    cardBrand = paymentIntent.payment_method.card?.brand
  }

  // Update any pending payment records
  await prisma.payment.updateMany({
    where: {
      stripePaymentIntentId: paymentIntent.id,
      status: 'PENDING',
    },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      cardLast4,
      cardBrand,
    },
  })
}

async function handlePaymentIntentFailed(paymentIntent: PaymentIntentData) {
  console.log('Payment intent failed:', paymentIntent.id)

  await prisma.payment.updateMany({
    where: {
      stripePaymentIntentId: paymentIntent.id,
      status: 'PENDING',
    },
    data: {
      status: 'FAILED',
    },
  })
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function mapStripeStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    unpaid: 'PAST_DUE',
    canceled: 'CANCELLED',
    incomplete: 'PENDING',
    incomplete_expired: 'EXPIRED',
    trialing: 'TRIALING',
    paused: 'PAUSED',
  }
  return statusMap[stripeStatus] || 'PENDING'
}

function getPlanTypeFromPriceId(priceId: string): SubscriptionPlanType | null {
  // Check each plan's price IDs
  for (const [planType, details] of Object.entries(SUBSCRIPTION_PLAN_DETAILS)) {
    if (
      details.stripePriceIdMonthly === priceId ||
      details.stripePriceIdYearly === priceId
    ) {
      return planType as SubscriptionPlanType
    }
  }

  // Check environment variables as fallback
  if (
    priceId === process.env.STRIPE_PRICE_STARTER_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_STARTER_YEARLY
  ) {
    return 'STARTER'
  }
  if (
    priceId === process.env.STRIPE_PRICE_PRO_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_PRO_YEARLY
  ) {
    return 'PRO'
  }
  if (
    priceId === process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_ENTERPRISE_YEARLY
  ) {
    return 'ENTERPRISE'
  }

  return null
}
