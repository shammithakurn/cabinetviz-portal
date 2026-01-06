# Stripe Payment Integration Setup Guide

This guide explains how to set up and configure Stripe payments for CabinetViz Portal.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create Stripe Account](#create-stripe-account)
3. [Get API Keys](#get-api-keys)
4. [Create Products and Prices](#create-products-and-prices)
5. [Configure Webhooks](#configure-webhooks)
6. [Environment Variables](#environment-variables)
7. [Customer Portal Configuration](#customer-portal-configuration)
8. [Testing with Test Mode](#testing-with-test-mode)
9. [Going Live](#going-live)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- Access to your CabinetViz codebase
- A valid email address for Stripe account

---

## Create Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Enter your email and create a password
3. Verify your email address
4. Complete the account setup wizard (you can skip business details for now in test mode)

---

## Get API Keys

1. Log into [Stripe Dashboard](https://dashboard.stripe.com)
2. **Important**: Make sure you're in **Test Mode** (toggle in the top-right)
3. Go to **Developers** → **API keys**
4. Copy your keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - click "Reveal test key" to see it

---

## Create Products and Prices

You need to create products for each pricing tier. Do this in **Test Mode** first.

### One-Time Packages

Go to **Products** → **Add product**

#### Basic Package
- **Name**: Basic Package
- **Description**: Perfect for simple cabinet projects
- **Pricing**:
  - Price: NZ$99.00
  - Type: One-time
  - Currency: NZD
- Click **Save product**
- Copy the **Price ID** (starts with `price_`)

#### Professional Package
- **Name**: Professional Package
- **Description**: Most popular for detailed projects
- **Pricing**:
  - Price: NZ$199.00
  - Type: One-time
  - Currency: NZD
- Copy the **Price ID**

#### Premium Package
- **Name**: Premium Package
- **Description**: Complete package for complex projects
- **Pricing**:
  - Price: NZ$349.00
  - Type: One-time
  - Currency: NZD
- Copy the **Price ID**

### Subscription Plans

#### Starter Plan
- **Name**: Starter Plan
- **Description**: For small businesses getting started
- **Pricing** (add two prices):
  1. Monthly: NZ$149.00/month (recurring)
  2. Yearly: NZ$1,490.00/year (recurring)
- Copy both **Price IDs**

#### Pro Plan
- **Name**: Pro Plan
- **Description**: For growing cabinet businesses
- **Pricing**:
  1. Monthly: NZ$349.00/month
  2. Yearly: NZ$3,490.00/year
- Copy both **Price IDs**

#### Enterprise Plan
- **Name**: Enterprise Plan
- **Description**: For high-volume cabinet makers
- **Pricing**:
  1. Monthly: NZ$699.00/month
  2. Yearly: NZ$6,990.00/year
- Copy both **Price IDs**

---

## Configure Webhooks

Webhooks allow Stripe to notify your application of payment events.

### Local Development (with Stripe CLI)

1. Install Stripe CLI:
   ```bash
   # Windows (with scoop)
   scoop install stripe

   # macOS
   brew install stripe/stripe-cli/stripe

   # Or download from https://stripe.com/docs/stripe-cli
   ```

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Copy the webhook signing secret (starts with `whsec_`)

### Production Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret**

---

## Environment Variables

Create/update your `.env.local` file with these values:

```env
# Stripe API Keys
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxx"

# Webhook Secret (from CLI or Dashboard)
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxx"

# One-Time Package Price IDs
STRIPE_PRICE_BASIC="price_xxxxxxxxxxxx"
STRIPE_PRICE_PROFESSIONAL="price_xxxxxxxxxxxx"
STRIPE_PRICE_PREMIUM="price_xxxxxxxxxxxx"

# Subscription Price IDs
STRIPE_PRICE_STARTER_MONTHLY="price_xxxxxxxxxxxx"
STRIPE_PRICE_STARTER_YEARLY="price_xxxxxxxxxxxx"
STRIPE_PRICE_PRO_MONTHLY="price_xxxxxxxxxxxx"
STRIPE_PRICE_PRO_YEARLY="price_xxxxxxxxxxxx"
STRIPE_PRICE_ENTERPRISE_MONTHLY="price_xxxxxxxxxxxx"
STRIPE_PRICE_ENTERPRISE_YEARLY="price_xxxxxxxxxxxx"
```

---

## Customer Portal Configuration

The Customer Portal allows customers to manage their subscriptions.

1. Go to **Settings** → **Billing** → **Customer portal**
2. Enable the customer portal
3. Configure allowed features:
   - ✅ Update payment methods
   - ✅ View invoice history
   - ✅ Cancel subscriptions (set to "at end of billing period")
   - ✅ Switch plans (optional)
4. Add your business details (name, support email)
5. Click **Save**

---

## Testing with Test Mode

### Test Card Numbers

Use these card numbers in test mode:

| Card Type | Number | CVC | Expiry |
|-----------|--------|-----|--------|
| Success | 4242 4242 4242 4242 | Any 3 digits | Any future date |
| Decline | 4000 0000 0000 0002 | Any 3 digits | Any future date |
| Requires Auth | 4000 0025 0000 3155 | Any 3 digits | Any future date |
| Insufficient Funds | 4000 0000 0000 9995 | Any 3 digits | Any future date |

### Testing Subscriptions

1. Create a subscription with a test card
2. To test renewal: Use Stripe CLI to trigger invoice:
   ```bash
   stripe invoices pay INVOICE_ID
   ```

3. To test cancellation:
   - Use the customer portal, or
   - Cancel via your dashboard billing page

### Testing Webhooks

1. Start the Stripe CLI listener:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

2. In another terminal, trigger test events:
   ```bash
   # Test checkout completion
   stripe trigger checkout.session.completed

   # Test subscription events
   stripe trigger customer.subscription.created
   stripe trigger invoice.payment_failed
   ```

### Common Test Scenarios

1. **Successful one-time purchase**:
   - Go to /pricing
   - Select a package
   - Complete checkout with 4242 4242 4242 4242
   - Verify redirect to success page
   - Check database for Payment record

2. **Successful subscription**:
   - Go to /pricing
   - Switch to Subscriptions tab
   - Select a plan
   - Complete checkout
   - Verify subscription in database
   - Check Stripe Dashboard for subscription

3. **Failed payment**:
   - Use 4000 0000 0000 0002
   - Verify error handling
   - Check webhook received payment_intent.payment_failed

4. **Subscription cancellation**:
   - Go to /dashboard/billing
   - Click "Cancel Subscription"
   - Verify cancelAtPeriodEnd is true
   - Check subscription status in Stripe

---

## Going Live

When ready for production:

1. **Complete Stripe account activation**:
   - Go to **Settings** → **Account details**
   - Complete all required business information
   - Submit for verification

2. **Switch to Live Mode**:
   - Toggle "Test Mode" off in Stripe Dashboard
   - Get Live API keys (start with `sk_live_` and `pk_live_`)

3. **Create Live Products**:
   - Recreate all products in Live mode
   - Get new Price IDs

4. **Update Environment Variables**:
   - Replace test keys with live keys
   - Update all Price IDs
   - Create new webhook endpoint with live signing secret

5. **Set up production webhooks**:
   - Add your production URL endpoint
   - Select the same events as test mode
   - Get the live webhook signing secret

6. **Test with real card**:
   - Make a small real payment
   - Verify it appears in Stripe Dashboard
   - Refund the test payment

---

## Troubleshooting

### "No Stripe price ID configured"
- Verify all STRIPE_PRICE_* environment variables are set
- Restart your development server after adding env vars

### Webhook signature verification failed
- Ensure STRIPE_WEBHOOK_SECRET is correct
- For local dev, make sure Stripe CLI is running
- Check the webhook endpoint is receiving raw body (not parsed JSON)

### Checkout session creation fails
- Check STRIPE_SECRET_KEY is correct
- Verify the Price ID exists in your Stripe account
- Check browser console and server logs for errors

### Customer portal not working
- Ensure Customer Portal is enabled in Stripe Dashboard
- Verify the user has a stripeCustomerId in database
- Check that subscription has a valid stripeSubscriptionId

### Payment succeeds but database not updated
- Check webhook endpoint is receiving events
- Verify STRIPE_WEBHOOK_SECRET matches
- Check server logs for webhook processing errors
- Ensure metadata (userId) is being passed correctly

### International payments failing
- Enable additional payment methods in Stripe Dashboard
- Check your account supports the customer's currency
- Verify automatic tax is configured if required

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Pricing Page   │────▶│  Checkout Page   │────▶│  Success Page   │
│   /pricing      │     │   /checkout      │     │ /checkout/success│
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │ Stripe Embedded  │
                        │    Checkout      │
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Stripe Servers  │
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │ Webhook Endpoint │────▶│    Database     │
                        │/api/stripe/webhook│    │   (Prisma)      │
                        └──────────────────┘     └─────────────────┘
```

---

## File Structure

```
lib/
├── stripe.ts           # Server-side Stripe utilities (secret key)
├── stripe-client.ts    # Client-side utilities (publishable key)
└── constants/
    └── pricing.ts      # Pricing tiers and helpers

app/api/stripe/
├── checkout/
│   ├── route.ts        # Create checkout sessions
│   └── status/
│       └── route.ts    # Get session status
├── webhook/
│   └── route.ts        # Handle Stripe webhooks
├── portal/
│   └── route.ts        # Create customer portal sessions
└── subscription/
    ├── cancel/
    │   └── route.ts    # Cancel subscription
    └── resume/
        └── route.ts    # Resume cancelled subscription

app/
├── pricing/
│   └── page.tsx        # Pricing page
├── checkout/
│   ├── page.tsx        # Checkout page
│   └── success/
│       └── page.tsx    # Success confirmation
└── dashboard/
    └── billing/
        └── page.tsx    # Subscription management

components/stripe/
├── index.ts
├── PricingTabs.tsx     # Pricing display component
├── EmbeddedCheckout.tsx # Stripe Elements checkout
└── SubscriptionManager.tsx # Subscription management UI
```

---

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For application issues:
- Check server logs
- Review webhook delivery in Stripe Dashboard
- Test with Stripe CLI for local debugging
