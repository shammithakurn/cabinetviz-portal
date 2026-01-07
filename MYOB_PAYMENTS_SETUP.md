# MYOB Payments Integration Guide

This guide explains how to set up and configure MYOB Payments for CabinetViz Portal in New Zealand.

## Important Discovery

**MYOB uses Stripe Connect as their payment backend for New Zealand.** This means when customers pay via MYOB Online Invoice Payments, the payment is actually processed by Stripe behind the scenes.

---

## Table of Contents

1. [Payment Options Overview](#payment-options-overview)
2. [Option A: MYOB Online Invoice Payments](#option-a-myob-online-invoice-payments)
3. [Option B: MYOB API Integration](#option-b-myob-api-integration)
4. [Option C: Direct Stripe (Alternative)](#option-c-direct-stripe-alternative)
5. [Recommended Approach](#recommended-approach)
6. [Setup Instructions](#setup-instructions)
7. [Fee Comparison](#fee-comparison)

---

## Payment Options Overview

Since you're registered with MYOB, you have these options:

| Option | Pros | Cons |
|--------|------|------|
| **MYOB Online Invoice Payments** | Native integration, auto-reconciliation, includes PayPal | Less customizable, requires MYOB invoice workflow |
| **MYOB API + Website** | Custom checkout, still uses MYOB/Stripe | More development work, complex setup |
| **Direct Stripe** | Full control, embedded checkout | May conflict with MYOB registration |

---

## Option A: MYOB Online Invoice Payments

**This is the simplest option** and uses Stripe behind the scenes.

### How It Works

1. Customer selects a package on your website
2. Your website creates an invoice in MYOB via API
3. Customer receives email with "Pay Securely" button
4. Customer pays via MYOB's Stripe-powered payment page
5. Payment auto-reconciles in MYOB
6. Your website polls MYOB API to update order status

### Supported Payment Methods (NZ)
- VISA
- MasterCard
- Apple Pay
- Google Pay
- PayPal
- PayPal Pay in 4 (Buy Now Pay Later)

### Fees (New Zealand)
- **Transaction fee**: 2.7% + $0.25 per transaction
- **No setup fees**
- **No cancellation fees**
- **Chargeback fee**: $25 per chargeback
- **Surcharging available**: Pass 2.7% to customers (optional)

### Setup Requirements
1. MYOB Business subscription
2. Verified New Zealand business
3. Bank account for settlements
4. Identity verification (driver's licence or passport)

---

## Option B: MYOB API Integration

Build a custom integration that creates invoices via MYOB API.

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Pricing Page   │────▶│  Order Summary   │────▶│  MYOB Invoice   │
│   /pricing      │     │   /checkout      │     │   Created       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                 ┌──────────────────┐
                                                 │  Email to        │
                                                 │  Customer        │
                                                 └──────────────────┘
                                                        │
                                                        ▼
                                                 ┌──────────────────┐
                                                 │  MYOB Payment    │
                                                 │  (via Stripe)    │
                                                 └──────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Update Order   │◀────│  Poll MYOB API   │◀────│  Payment        │
│  Status         │     │  for Payment     │     │  Complete       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### MYOB API Endpoints Needed

1. **Authentication**: OAuth 2.0 (updated March 2025)
2. **Create Invoice**: `POST /{cf_uri}/Sale/Invoice`
3. **Get Invoice Status**: `GET /{cf_uri}/Sale/Invoice/{UID}`
4. **Create Customer**: `POST /{cf_uri}/Contact/Customer`

### Required API Fields for Invoice
- Date (YYYY-MM-DD HH:MM:SS)
- Customer UID
- InvoiceType (Item, Service, Professional, TimeBilling, Miscellaneous)
- Line items with quantities and amounts
- OnlinePaymentMethod: 'All' (to enable online payments)

---

## Option C: Direct Stripe (Alternative)

If you can create a separate Stripe account not linked to MYOB, you can use our existing Stripe integration.

**Steps to check:**
1. Contact MYOB support and ask if you can have both:
   - MYOB Online Invoice Payments for accounting
   - Separate Stripe account for website payments
2. If possible, create a new Stripe account with a different email
3. Use the existing `STRIPE_SETUP.md` guide

---

## Recommended Approach

For CabinetViz Portal, I recommend **Option B: MYOB API Integration** with a hybrid approach:

### Phase 1: Quick Start (MYOB Invoice Links)
1. Enable MYOB Online Invoice Payments in your MYOB account
2. On your website, collect order details
3. Create invoice via MYOB API with OnlinePaymentMethod: 'All'
4. Redirect customer to MYOB invoice or send email
5. Poll MYOB API to check payment status

### Phase 2: Enhanced Experience
1. Build embedded payment form using MYOB's payment link
2. Use webhooks or polling to detect payments
3. Auto-update customer dashboard

### Why This Approach?
- Uses your existing MYOB registration
- Supports all payment methods (Cards, Apple Pay, PayPal)
- Auto-reconciliation in MYOB
- Single source of truth for accounting
- PayPal Pay in 4 gives customers BNPL option

---

## Setup Instructions

### Step 1: Enable MYOB Online Invoice Payments

1. Log into [MYOB Business](https://app.myob.com)
2. Go to **Sales** > **Online invoice payments**
3. Click **Get started**
4. Complete the application:
   - Enter estimated annual sales
   - Add bank account details
   - Verify your identity
5. Wait for approval (usually 24-48 hours)

### Step 2: Get MYOB API Access

1. Go to [MYOB Developer Centre](https://developer.myob.com/)
2. Register for an API key
3. Note: As of March 2025, OAuth 2.0 is required
4. Follow the [OAuth 2.0 Authentication Guide](https://apisupport.myob.com/hc/en-us/articles/13065472856719-MYOB-OAuth2-0-Authentication-Guide-Post-March-2025)

### Step 3: Configure Environment Variables

Add to your `.env.local`:

```env
# MYOB API Configuration
MYOB_CLIENT_ID="your-myob-client-id"
MYOB_CLIENT_SECRET="your-myob-client-secret"
MYOB_REDIRECT_URI="https://your-domain.com/api/myob/callback"
MYOB_BUSINESS_ID="your-company-file-guid"

# Optional: Keep Stripe config for future use
# STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxx"
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxx"
```

### Step 4: Test the Integration

1. Create a test invoice in MYOB
2. Send it with online payment enabled
3. Use a test card to pay
4. Verify payment appears in MYOB

---

## Fee Comparison

| Provider | Transaction Fee | Notes |
|----------|-----------------|-------|
| **MYOB NZ** | 2.7% + $0.25 | Includes PayPal, Apple Pay, Google Pay |
| **Direct Stripe** | 2.9% + $0.30 | Standard rate for NZ |
| **PayPal Direct** | 3.6% + $0.45 | Higher fees |

**MYOB is actually cheaper than direct Stripe for NZ businesses!**

---

## Implementation Status - COMPLETED

The MYOB API integration has been implemented. Here are the key files:

### MYOB Integration Files
- `lib/myob.ts` - Server-side MYOB API utilities
- `lib/myob-client.ts` - Client-side utilities
- `app/api/myob/invoice/route.ts` - Create invoices API
- `app/api/myob/payment-status/route.ts` - Check payment status API
- `app/api/myob/auth/status/route.ts` - Check auth status API
- `app/api/myob/auth/callback/route.ts` - OAuth callback handler
- `components/myob/MYOBCheckout.tsx` - Checkout component

### Stripe Integration Files (Backup)
- `lib/stripe.ts` - Server-side Stripe utilities
- `lib/stripe-client.ts` - Client-side utilities
- `app/api/stripe/*` - Stripe API routes
- `components/stripe/*` - Stripe UI components

The checkout flow automatically detects which provider is configured and uses the appropriate integration.

---

## File Structure

```
lib/
├── myob.ts              # Server-side MYOB API utilities
├── myob-client.ts       # Client-side utilities
├── stripe.ts            # Server-side Stripe utilities (backup)
├── stripe-client.ts     # Client-side Stripe utilities (backup)
└── constants/
    └── pricing.ts       # Pricing tiers and helpers

app/api/myob/
├── invoice/
│   └── route.ts         # Create MYOB invoices
├── payment-status/
│   └── route.ts         # Check payment status
└── auth/
    ├── status/
    │   └── route.ts     # Check MYOB auth status
    └── callback/
        └── route.ts     # OAuth callback handler

app/
├── pricing/
│   └── page.tsx         # Pricing page
├── checkout/
│   ├── page.tsx         # Checkout page
│   ├── CheckoutClient.tsx # Client component (auto-detects provider)
│   └── success/
│       ├── page.tsx     # Success page
│       └── PaymentStatusChecker.tsx # Payment polling component

components/myob/
├── index.ts
└── MYOBCheckout.tsx     # MYOB checkout component
```

---

## Next Steps

1. **Enable MYOB Online Invoice Payments** in your MYOB account
   - Log into MYOB Business
   - Go to Sales > Online invoice payments
   - Complete the application (identity verification, bank details)

2. **Register for MYOB API access** at [developer.myob.com](https://developer.myob.com/)
   - Create a developer account
   - Register your application
   - Get Client ID and Client Secret

3. **Configure environment variables** in your `.env.local`:
   ```env
   MYOB_CLIENT_ID="your-client-id"
   MYOB_CLIENT_SECRET="your-client-secret"
   MYOB_REDIRECT_URI="http://localhost:3000/api/myob/auth/callback"
   MYOB_BUSINESS_ID="your-company-file-guid"
   ```

4. **Test the integration**:
   - Start your local development server
   - Go to /pricing and select a package
   - Click "Generate Invoice"
   - Complete payment via MYOB PayDirect
   - Check payment status updates automatically

---

## Resources

- [MYOB Online Invoice Payments (NZ)](https://www.myob.com/nz/support/myob-business/sales/receiving-payments/online-invoice-payments)
- [MYOB Developer Centre](https://developer.myob.com/)
- [MYOB API Support](https://apisupport.myob.com/)
- [Stripe + MYOB Case Study](https://stripe.com/gb/customers/myob)
- [MYOB Fees & Charges](https://www.myob.com/nz/support/myob-business/sales/receiving-payments/online-invoice-payments/fees-and-charges-for-online-payments)
