// lib/stripe.ts
// Server-side Stripe utilities - NEVER import this file in client components
// This file contains the secret key and should only be used in:
// - API routes (app/api/...)
// - Server components
// - Server actions

import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import {
  CURRENCY,
  ONE_TIME_PACKAGE_DETAILS,
  SUBSCRIPTION_PLAN_DETAILS,
  type OneTimePackageType,
  type SubscriptionPlanType,
  type BillingCycle,
} from '@/lib/constants/pricing'

// ============================================
// STRIPE CLIENT INITIALIZATION
// ============================================

// Initialize Stripe with the secret key
// Note: Will be null if STRIPE_SECRET_KEY is not set (allows build to succeed)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

const stripeClient = stripeSecretKey
  ? new Stripe(stripeSecretKey, { typescript: true })
  : null

/**
 * Get the Stripe instance, throwing if not configured
 * Use this in API routes to ensure Stripe is available
 */
function getStripe(): Stripe {
  if (!stripeClient) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }
  return stripeClient
}

// Export for external use (e.g., webhook verification)
export { getStripe }

// ============================================
// CUSTOMER MANAGEMENT
// ============================================

/**
 * Get or create a Stripe customer for a user
 * This ensures we have a consistent customer ID for each user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const stripe = getStripe()

  // First, check if user already has a subscription with a Stripe customer ID
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  })

  if (existingSubscription?.stripeCustomerId) {
    return existingSubscription.stripeCustomerId
  }

  // Check if a customer already exists in Stripe with this email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id
  }

  // Create a new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId, // Store our internal user ID for reference
    },
  })

  return customer.id
}

/**
 * Update Stripe customer details
 */
export async function updateStripeCustomer(
  customerId: string,
  updates: {
    email?: string
    name?: string
    phone?: string
  }
): Promise<Stripe.Customer> {
  const stripe = getStripe()
  return stripe.customers.update(customerId, updates)
}

// ============================================
// CHECKOUT SESSION CREATION
// ============================================

interface CreateCheckoutSessionParams {
  userId: string
  userEmail: string
  userName?: string
  priceId: string
  mode: 'payment' | 'subscription'
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
  jobId?: string // For one-time payments linked to a job
  allowPromotionCodes?: boolean
}

/**
 * Create a Stripe Checkout Session for embedded checkout
 * Returns the client secret needed for the embedded checkout form
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  userName,
  priceId,
  mode,
  successUrl,
  cancelUrl: _cancelUrl, // Not used in embedded mode, kept for API compatibility
  metadata = {},
  jobId,
  allowPromotionCodes = true,
}: CreateCheckoutSessionParams): Promise<{
  sessionId: string
  clientSecret: string
}> {
  const stripe = getStripe()

  // Get or create the Stripe customer
  const customerId = await getOrCreateStripeCustomer(userId, userEmail, userName)

  // Build the session configuration
  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    // Use embedded mode for embedded checkout (no redirect)
    ui_mode: 'embedded',
    return_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    // Allow multiple currencies based on customer location
    // Stripe will handle conversion to NZD for settlement
    currency: CURRENCY.CODE.toLowerCase(),
    // Enable automatic tax calculation if configured in Stripe Dashboard
    automatic_tax: { enabled: true },
    // Allow promotion codes for discounts
    allow_promotion_codes: allowPromotionCodes,
    // Store metadata for webhook processing
    metadata: {
      userId,
      jobId: jobId || '',
      ...metadata,
    },
    // For subscriptions, configure billing portal access
    ...(mode === 'subscription' && {
      subscription_data: {
        metadata: {
          userId,
        },
      },
    }),
    // Collect billing address for tax purposes
    billing_address_collection: 'required',
    // Phone number collection (optional)
    phone_number_collection: {
      enabled: true,
    },
  }

  const session = await stripe.checkout.sessions.create(sessionConfig)

  if (!session.client_secret) {
    throw new Error('Failed to create checkout session - no client secret returned')
  }

  return {
    sessionId: session.id,
    clientSecret: session.client_secret,
  }
}

/**
 * Create checkout session for a one-time package purchase
 */
export async function createOneTimeCheckoutSession(
  userId: string,
  userEmail: string,
  userName: string | undefined,
  packageType: OneTimePackageType,
  jobId?: string
): Promise<{ sessionId: string; clientSecret: string }> {
  const packageDetails = ONE_TIME_PACKAGE_DETAILS[packageType]

  if (!packageDetails.stripePriceId) {
    throw new Error(`No Stripe price ID configured for package: ${packageType}`)
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return createCheckoutSession({
    userId,
    userEmail,
    userName,
    priceId: packageDetails.stripePriceId,
    mode: 'payment',
    successUrl: `${baseUrl}/checkout/success`,
    cancelUrl: `${baseUrl}/pricing`,
    metadata: {
      type: 'one_time',
      packageType,
    },
    jobId,
  })
}

/**
 * Create checkout session for a subscription
 */
export async function createSubscriptionCheckoutSession(
  userId: string,
  userEmail: string,
  userName: string | undefined,
  planType: SubscriptionPlanType,
  billingCycle: BillingCycle
): Promise<{ sessionId: string; clientSecret: string }> {
  const planDetails = SUBSCRIPTION_PLAN_DETAILS[planType]
  const priceId =
    billingCycle === 'YEARLY'
      ? planDetails.stripePriceIdYearly
      : planDetails.stripePriceIdMonthly

  if (!priceId) {
    throw new Error(
      `No Stripe price ID configured for plan: ${planType} (${billingCycle})`
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return createCheckoutSession({
    userId,
    userEmail,
    userName,
    priceId,
    mode: 'subscription',
    successUrl: `${baseUrl}/checkout/success`,
    cancelUrl: `${baseUrl}/pricing`,
    metadata: {
      type: 'subscription',
      planType,
      billingCycle,
    },
  })
}

// ============================================
// CHECKOUT SESSION RETRIEVAL
// ============================================

/**
 * Retrieve a checkout session by ID
 * Used to verify payment status after checkout
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe()
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'customer', 'subscription', 'payment_intent'],
  })
}

/**
 * Get checkout session status for the success page
 */
export async function getCheckoutSessionStatus(sessionId: string): Promise<{
  status: 'complete' | 'open' | 'expired'
  customerEmail: string | null
  paymentStatus: string
  mode: 'payment' | 'subscription' | 'setup'
  metadata: Record<string, string>
}> {
  const session = await getCheckoutSession(sessionId)

  // Safely get customer email - handle deleted customers
  let customerEmail: string | null = null
  if (session.customer && typeof session.customer === 'object' && 'email' in session.customer) {
    customerEmail = (session.customer as Stripe.Customer).email || null
  }

  return {
    status: session.status || 'open',
    customerEmail,
    paymentStatus: session.payment_status,
    mode: session.mode || 'payment',
    metadata: (session.metadata as Record<string, string>) || {},
  }
}

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

/**
 * Get a subscription from Stripe
 */
export async function getStripeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe()
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method', 'latest_invoice'],
  })
}

/**
 * Cancel a subscription at period end
 * The subscription will remain active until the current period ends
 */
export async function cancelSubscriptionAtPeriodEnd(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe()
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

/**
 * Cancel a subscription immediately
 */
export async function cancelSubscriptionImmediately(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe()
  return stripe.subscriptions.cancel(subscriptionId)
}

/**
 * Resume a subscription that was set to cancel at period end
 */
export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe()
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}

/**
 * Update subscription to a different plan
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe()
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations', // Handle prorated charges
  })
}

// ============================================
// CUSTOMER PORTAL
// ============================================

/**
 * Create a customer portal session
 * Allows customers to manage their subscriptions, payment methods, and invoices
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session.url
}

// ============================================
// PAYMENT INTENT (for custom payment flows)
// ============================================

/**
 * Create a payment intent for custom payment flows
 * Use this if you need more control than Checkout Sessions provide
 */
export async function createPaymentIntent(
  amount: number, // In NZD (will be converted to cents)
  customerId: string,
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe()
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: CURRENCY.CODE.toLowerCase(),
    customer: customerId,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: metadata || {},
  })
}

// ============================================
// WEBHOOK SIGNATURE VERIFICATION
// ============================================

/**
 * Verify webhook signature and construct event
 * IMPORTANT: Use the raw body, not parsed JSON
 */
export function constructWebhookEvent(
  rawBody: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable')
  }

  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
}

// ============================================
// INVOICE MANAGEMENT
// ============================================

/**
 * Get upcoming invoice for a subscription
 * Useful for showing customers what they'll be charged next
 */
export async function getUpcomingInvoice(
  customerId: string,
  subscriptionId?: string
): Promise<Stripe.UpcomingInvoice> {
  const stripe = getStripe()
  return stripe.invoices.createPreview({
    customer: customerId,
    subscription: subscriptionId,
  })
}

/**
 * List invoices for a customer
 */
export async function listInvoices(
  customerId: string,
  limit = 10
): Promise<Stripe.Invoice[]> {
  const stripe = getStripe()
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  })

  return invoices.data
}

// ============================================
// REFUNDS
// ============================================

/**
 * Create a refund for a payment
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number, // Optional partial refund amount in dollars
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<Stripe.Refund> {
  const stripe = getStripe()
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents if provided
    reason,
  })
}

// ============================================
// PRICE LOOKUP
// ============================================

/**
 * Get price details from Stripe
 * Useful for verifying prices match your configuration
 */
export async function getPrice(priceId: string): Promise<Stripe.Price> {
  const stripe = getStripe()
  return stripe.prices.retrieve(priceId, {
    expand: ['product'],
  })
}

/**
 * List all active prices
 */
export async function listActivePrices(): Promise<Stripe.Price[]> {
  const stripe = getStripe()
  const prices = await stripe.prices.list({
    active: true,
    expand: ['data.product'],
  })

  return prices.data
}
