// lib/myob.ts
// Server-side MYOB API utilities - NEVER import this file in client components
// This file contains the client credentials and should only be used in:
// - API routes (app/api/...)
// - Server components
// - Server actions

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
// MYOB CONFIGURATION
// ============================================

const MYOB_CONFIG = {
  clientId: process.env.MYOB_CLIENT_ID,
  clientSecret: process.env.MYOB_CLIENT_SECRET,
  redirectUri: process.env.MYOB_REDIRECT_URI,
  businessId: process.env.MYOB_BUSINESS_ID,
  apiBaseUrl: 'https://api.myob.com/accountright',
  authUrl: 'https://secure.myob.com/oauth2/account/authorize',
  tokenUrl: 'https://secure.myob.com/oauth2/v1/authorize',
}

// Token storage (in production, store in database)
let cachedAccessToken: string | null = null
let cachedRefreshToken: string | null = null
let tokenExpiresAt: number | null = null

// ============================================
// TYPES
// ============================================

export interface MYOBCustomer {
  UID: string
  CompanyName?: string
  FirstName: string
  LastName: string
  IsIndividual: boolean
  DisplayID: string
  Addresses: MYOBAddress[]
  Notes?: string
}

export interface MYOBAddress {
  Location: number
  Street?: string
  City?: string
  State?: string
  PostCode?: string
  Country?: string
  Email?: string
  Phone1?: string
  Website?: string
}

export interface MYOBInvoice {
  UID?: string
  Number?: string
  Date: string
  Customer: { UID: string }
  Lines: MYOBInvoiceLine[]
  IsTaxInclusive: boolean
  InvoiceDeliveryStatus?: string
  Comment?: string
  ShipToAddress?: string
  Terms?: {
    PaymentIsDue: string
    DiscountDate?: number
    BalanceDueDate: number
    DiscountForEarlyPayment?: number
  }
  TotalTax?: number
  TotalAmount?: number
  BalanceDueAmount?: number
  Status?: string
  OnlinePaymentMethod?: 'All' | 'None'
  URI?: string
}

export interface MYOBInvoiceLine {
  Type: 'Transaction' | 'Header' | 'Subtotal'
  Description: string
  Account?: { UID: string }
  TaxCode?: { UID: string }
  Total: number
  Quantity?: number
  UnitPrice?: number
}

export interface MYOBTaxCode {
  UID: string
  Code: string
  Description: string
  Rate: number
}

export interface MYOBAccount {
  UID: string
  DisplayID: string
  Name: string
  Type: string
  IsActive: boolean
}

export interface MYOBTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
}

export interface CreateInvoiceResult {
  invoiceUID: string
  invoiceNumber: string
  paymentUrl: string
  totalAmount: number
}

// ============================================
// AUTHENTICATION
// ============================================

/**
 * Check if MYOB is configured
 */
export function isMYOBConfigured(): boolean {
  return !!(
    MYOB_CONFIG.clientId &&
    MYOB_CONFIG.clientSecret &&
    MYOB_CONFIG.businessId
  )
}

/**
 * Get MYOB OAuth authorization URL
 * Use this to redirect users to MYOB for authentication
 */
export function getAuthorizationUrl(state?: string): string {
  if (!MYOB_CONFIG.clientId || !MYOB_CONFIG.redirectUri) {
    throw new Error('MYOB client ID or redirect URI not configured')
  }

  const params = new URLSearchParams({
    client_id: MYOB_CONFIG.clientId,
    redirect_uri: MYOB_CONFIG.redirectUri,
    response_type: 'code',
    scope: 'CompanyFile',
  })

  if (state) {
    params.append('state', state)
  }

  return `${MYOB_CONFIG.authUrl}?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<MYOBTokenResponse> {
  if (!MYOB_CONFIG.clientId || !MYOB_CONFIG.clientSecret || !MYOB_CONFIG.redirectUri) {
    throw new Error('MYOB credentials not configured')
  }

  const response = await fetch(MYOB_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: MYOB_CONFIG.clientId,
      client_secret: MYOB_CONFIG.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: MYOB_CONFIG.redirectUri,
      scope: 'CompanyFile',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code for token: ${error}`)
  }

  const tokens = await response.json() as MYOBTokenResponse

  // Cache the tokens
  cachedAccessToken = tokens.access_token
  cachedRefreshToken = tokens.refresh_token
  tokenExpiresAt = Date.now() + tokens.expires_in * 1000

  return tokens
}

/**
 * Refresh the access token
 */
export async function refreshAccessToken(): Promise<MYOBTokenResponse> {
  if (!MYOB_CONFIG.clientId || !MYOB_CONFIG.clientSecret || !cachedRefreshToken) {
    throw new Error('Cannot refresh token: missing credentials or refresh token')
  }

  const response = await fetch(MYOB_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: MYOB_CONFIG.clientId,
      client_secret: MYOB_CONFIG.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: cachedRefreshToken,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  const tokens = await response.json() as MYOBTokenResponse

  // Update cached tokens
  cachedAccessToken = tokens.access_token
  cachedRefreshToken = tokens.refresh_token
  tokenExpiresAt = Date.now() + tokens.expires_in * 1000

  return tokens
}

/**
 * Get a valid access token, refreshing if necessary
 */
async function getValidAccessToken(): Promise<string> {
  // Check if we need to refresh
  if (!cachedAccessToken || !tokenExpiresAt || Date.now() >= tokenExpiresAt - 60000) {
    if (cachedRefreshToken) {
      await refreshAccessToken()
    } else {
      throw new Error('No valid access token. Please re-authenticate with MYOB.')
    }
  }

  if (!cachedAccessToken) {
    throw new Error('No access token available')
  }

  return cachedAccessToken
}

/**
 * Set tokens manually (e.g., from database)
 */
export function setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
  cachedAccessToken = accessToken
  cachedRefreshToken = refreshToken
  tokenExpiresAt = Date.now() + expiresIn * 1000
}

// ============================================
// API HELPERS
// ============================================

/**
 * Make an authenticated request to the MYOB API
 */
async function myobRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = await getValidAccessToken()

  if (!MYOB_CONFIG.businessId) {
    throw new Error('MYOB business ID not configured')
  }

  const url = `${MYOB_CONFIG.apiBaseUrl}/${MYOB_CONFIG.businessId}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'x-myobapi-key': MYOB_CONFIG.clientId || '',
      'x-myobapi-version': 'v2',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`MYOB API error (${response.status}): ${errorText}`)
  }

  // Handle empty responses (e.g., successful POST/PUT)
  const text = await response.text()
  if (!text) {
    return {} as T
  }

  return JSON.parse(text) as T
}

// ============================================
// CUSTOMER MANAGEMENT
// ============================================

/**
 * Search for a customer by email
 */
export async function findCustomerByEmail(email: string): Promise<MYOBCustomer | null> {
  const response = await myobRequest<{ Items: MYOBCustomer[] }>(
    `/Contact/Customer?$filter=Addresses/any(a: a/Email eq '${encodeURIComponent(email)}')`
  )

  return response.Items?.[0] || null
}

/**
 * Get a customer by UID
 */
export async function getCustomer(uid: string): Promise<MYOBCustomer> {
  return myobRequest<MYOBCustomer>(`/Contact/Customer/${uid}`)
}

/**
 * Create a new customer in MYOB
 */
export async function createCustomer(
  email: string,
  name: string,
  company?: string,
  phone?: string
): Promise<MYOBCustomer> {
  // Parse name into first and last
  const nameParts = name.trim().split(' ')
  const firstName = nameParts[0] || 'Customer'
  const lastName = nameParts.slice(1).join(' ') || ''

  // Generate a unique display ID
  const displayId = `C${Date.now().toString().slice(-8)}`

  const customerData = {
    CompanyName: company || undefined,
    FirstName: firstName,
    LastName: lastName,
    IsIndividual: !company,
    DisplayID: displayId,
    Addresses: [
      {
        Location: 1, // Primary address
        Email: email,
        Phone1: phone || undefined,
      },
    ],
  }

  const response = await myobRequest<MYOBCustomer>('/Contact/Customer', {
    method: 'POST',
    body: JSON.stringify(customerData),
  })

  return response
}

/**
 * Get or create a MYOB customer for a user
 */
export async function getOrCreateMYOBCustomer(
  userId: string,
  email: string,
  name: string,
  company?: string,
  phone?: string
): Promise<MYOBCustomer> {
  // First check if user already has a MYOB customer ID stored
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Try to find existing customer by email
  let customer = await findCustomerByEmail(email)

  if (!customer) {
    // Create new customer
    customer = await createCustomer(email, name, company, phone)
  }

  return customer
}

// ============================================
// TAX CODES & ACCOUNTS
// ============================================

/**
 * Get the GST tax code
 */
export async function getGSTTaxCode(): Promise<MYOBTaxCode | null> {
  const response = await myobRequest<{ Items: MYOBTaxCode[] }>(
    '/GeneralLedger/TaxCode?$filter=Code eq \'GST\''
  )

  return response.Items?.[0] || null
}

/**
 * Get the income account for sales
 */
export async function getSalesIncomeAccount(): Promise<MYOBAccount | null> {
  // Look for a standard income account (4-xxxx accounts are typically income)
  const response = await myobRequest<{ Items: MYOBAccount[] }>(
    '/GeneralLedger/Account?$filter=Type eq \'Income\' and IsActive eq true&$top=1'
  )

  return response.Items?.[0] || null
}

// ============================================
// INVOICE MANAGEMENT
// ============================================

/**
 * Create an invoice for a one-time package purchase
 */
export async function createOneTimePackageInvoice(
  userId: string,
  userEmail: string,
  userName: string,
  packageType: OneTimePackageType,
  jobId?: string
): Promise<CreateInvoiceResult> {
  const packageDetails = ONE_TIME_PACKAGE_DETAILS[packageType]

  // Get or create customer
  const customer = await getOrCreateMYOBCustomer(userId, userEmail, userName)

  // Get tax code and account
  const gstTaxCode = await getGSTTaxCode()
  const incomeAccount = await getSalesIncomeAccount()

  if (!gstTaxCode || !incomeAccount) {
    throw new Error('Required MYOB tax code or income account not found')
  }

  // Calculate amounts (prices are GST inclusive in NZ)
  const totalAmount = packageDetails.price
  const gstRate = gstTaxCode.Rate / 100
  const gstAmount = totalAmount - (totalAmount / (1 + gstRate))

  const invoiceData: MYOBInvoice = {
    Date: new Date().toISOString().split('T')[0] + ' 00:00:00',
    Customer: { UID: customer.UID },
    IsTaxInclusive: true,
    OnlinePaymentMethod: 'All', // Enable online payments
    Comment: `CabinetViz - ${packageDetails.name}${jobId ? ` (Job: ${jobId})` : ''}`,
    Terms: {
      PaymentIsDue: 'DayOfMonthAfterEOM',
      BalanceDueDate: 14, // Due in 14 days
    },
    Lines: [
      {
        Type: 'Transaction',
        Description: `${packageDetails.name} - ${packageDetails.description}`,
        Account: { UID: incomeAccount.UID },
        TaxCode: { UID: gstTaxCode.UID },
        Total: totalAmount,
        Quantity: 1,
        UnitPrice: totalAmount,
      },
    ],
  }

  // Create the invoice
  const response = await myobRequest<{ UID: string }>('/Sale/Invoice/Service', {
    method: 'POST',
    body: JSON.stringify(invoiceData),
  })

  // Get the created invoice to get the invoice number
  const createdInvoice = await myobRequest<MYOBInvoice>(
    `/Sale/Invoice/Service/${response.UID}`
  )

  // Generate the payment URL (MYOB PayDirect)
  const paymentUrl = `https://paydirect.myob.com/pay/${response.UID}`

  // Store payment record in database
  await prisma.payment.create({
    data: {
      userId,
      amount: totalAmount,
      currency: CURRENCY.CODE,
      status: 'PENDING',
      type: 'ONE_TIME',
      description: `${packageDetails.name} Package`,
      jobId: jobId || undefined,
      invoiceNumber: createdInvoice.Number || undefined,
      invoiceUrl: paymentUrl,
    },
  })

  return {
    invoiceUID: response.UID,
    invoiceNumber: createdInvoice.Number || '',
    paymentUrl,
    totalAmount,
  }
}

/**
 * Create an invoice for a subscription
 */
export async function createSubscriptionInvoice(
  userId: string,
  userEmail: string,
  userName: string,
  planType: SubscriptionPlanType,
  billingCycle: BillingCycle
): Promise<CreateInvoiceResult> {
  const planDetails = SUBSCRIPTION_PLAN_DETAILS[planType]
  const price = billingCycle === 'YEARLY' ? planDetails.yearlyPrice : planDetails.monthlyPrice

  // Get or create customer
  const customer = await getOrCreateMYOBCustomer(userId, userEmail, userName)

  // Get tax code and account
  const gstTaxCode = await getGSTTaxCode()
  const incomeAccount = await getSalesIncomeAccount()

  if (!gstTaxCode || !incomeAccount) {
    throw new Error('Required MYOB tax code or income account not found')
  }

  const periodText = billingCycle === 'YEARLY' ? 'Annual' : 'Monthly'

  const invoiceData: MYOBInvoice = {
    Date: new Date().toISOString().split('T')[0] + ' 00:00:00',
    Customer: { UID: customer.UID },
    IsTaxInclusive: true,
    OnlinePaymentMethod: 'All',
    Comment: `CabinetViz ${planDetails.name} - ${periodText} Subscription`,
    Terms: {
      PaymentIsDue: 'DayOfMonthAfterEOM',
      BalanceDueDate: 14,
    },
    Lines: [
      {
        Type: 'Transaction',
        Description: `${planDetails.name} Plan - ${periodText} Subscription`,
        Account: { UID: incomeAccount.UID },
        TaxCode: { UID: gstTaxCode.UID },
        Total: price,
        Quantity: 1,
        UnitPrice: price,
      },
    ],
  }

  const response = await myobRequest<{ UID: string }>('/Sale/Invoice/Service', {
    method: 'POST',
    body: JSON.stringify(invoiceData),
  })

  const createdInvoice = await myobRequest<MYOBInvoice>(
    `/Sale/Invoice/Service/${response.UID}`
  )

  const paymentUrl = `https://paydirect.myob.com/pay/${response.UID}`

  // Store payment record
  await prisma.payment.create({
    data: {
      userId,
      amount: price,
      currency: CURRENCY.CODE,
      status: 'PENDING',
      type: 'SUBSCRIPTION',
      description: `${planDetails.name} ${periodText} Subscription`,
      invoiceNumber: createdInvoice.Number || undefined,
      invoiceUrl: paymentUrl,
    },
  })

  return {
    invoiceUID: response.UID,
    invoiceNumber: createdInvoice.Number || '',
    paymentUrl,
    totalAmount: price,
  }
}

/**
 * Get invoice status
 */
export async function getInvoiceStatus(invoiceUID: string): Promise<{
  status: 'OPEN' | 'CLOSED' | 'CREDIT'
  balanceDue: number
  totalAmount: number
  paidAmount: number
}> {
  const invoice = await myobRequest<MYOBInvoice>(
    `/Sale/Invoice/Service/${invoiceUID}`
  )

  const totalAmount = invoice.TotalAmount || 0
  const balanceDue = invoice.BalanceDueAmount || 0
  const paidAmount = totalAmount - balanceDue

  let status: 'OPEN' | 'CLOSED' | 'CREDIT' = 'OPEN'
  if (balanceDue <= 0 && totalAmount > 0) {
    status = 'CLOSED'
  } else if (totalAmount < 0) {
    status = 'CREDIT'
  }

  return {
    status,
    balanceDue,
    totalAmount,
    paidAmount,
  }
}

/**
 * Check if an invoice has been paid
 */
export async function isInvoicePaid(invoiceUID: string): Promise<boolean> {
  const status = await getInvoiceStatus(invoiceUID)
  return status.status === 'CLOSED'
}

/**
 * List recent invoices for a customer
 */
export async function listCustomerInvoices(
  customerUID: string,
  limit = 20
): Promise<MYOBInvoice[]> {
  const response = await myobRequest<{ Items: MYOBInvoice[] }>(
    `/Sale/Invoice/Service?$filter=Customer/UID eq guid'${customerUID}'&$top=${limit}&$orderby=Date desc`
  )

  return response.Items || []
}

// ============================================
// PAYMENT POLLING
// ============================================

/**
 * Poll for payment status and update database
 * Call this periodically or after checkout to sync payment status
 */
export async function syncPaymentStatus(paymentId: string): Promise<{
  status: string
  isPaid: boolean
}> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  })

  if (!payment || !payment.invoiceUrl) {
    return { status: 'NOT_FOUND', isPaid: false }
  }

  // Extract invoice UID from payment URL
  const invoiceUID = payment.invoiceUrl.split('/').pop()
  if (!invoiceUID) {
    return { status: 'INVALID_URL', isPaid: false }
  }

  try {
    const invoiceStatus = await getInvoiceStatus(invoiceUID)

    if (invoiceStatus.status === 'CLOSED' && payment.status !== 'PAID') {
      // Update payment record
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      })

      // If this is a subscription payment, activate the subscription
      if (payment.type === 'SUBSCRIPTION') {
        await activateSubscription(payment.userId)
      }

      return { status: 'PAID', isPaid: true }
    }

    return { status: payment.status, isPaid: payment.status === 'PAID' }
  } catch (error) {
    console.error('Error syncing payment status:', error)
    return { status: 'ERROR', isPaid: false }
  }
}

/**
 * Activate a subscription after payment
 */
async function activateSubscription(userId: string): Promise<void> {
  // Get the pending subscription or create from payment details
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (existingSubscription) {
    // Update existing subscription
    await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    })
  }
}

// ============================================
// EMAIL INVOICE
// ============================================

/**
 * Send invoice email to customer
 * Note: This requires the file to be online and using AccountRight's built-in emailing
 */
export async function emailInvoice(invoiceUID: string): Promise<boolean> {
  try {
    await myobRequest(`/Sale/Invoice/Service/${invoiceUID}/SendEmail`, {
      method: 'POST',
      body: JSON.stringify({
        SendTo: 'Customer',
        ToAddresses: [], // Will use customer's email from contact
        Subject: 'Invoice from CabinetViz',
        Message: 'Please find your invoice attached. You can pay online using the secure payment link.',
      }),
    })
    return true
  } catch (error) {
    console.error('Error sending invoice email:', error)
    return false
  }
}

// ============================================
// EXPORT FOR EXTERNAL USE
// ============================================

export {
  MYOB_CONFIG,
  myobRequest,
}
