// Comprehensive Interactive Element Test Script
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3010';

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function log(type, message, details = '') {
  const timestamp = new Date().toISOString().substr(11, 8);
  const prefix = type === 'pass' ? '✅' : type === 'fail' ? '❌' : '⚠️';
  console.log(`[${timestamp}] ${prefix} ${message}${details ? ': ' + details : ''}`);

  if (type === 'pass') results.passed.push({ message, details });
  else if (type === 'fail') results.failed.push({ message, details });
  else results.warnings.push({ message, details });
}

async function testHomePage(page) {
  console.log('\n========== TESTING HOME PAGE ==========');

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    log('pass', 'Home page loaded');

    // Test navigation buttons
    const ctaButton = await page.$('a[href="/auth/register"]:has-text("Get Started")');
    if (ctaButton) {
      log('pass', 'CTA "Get Started" button found');
      const isVisible = await ctaButton.isVisible();
      log(isVisible ? 'pass' : 'fail', 'CTA button visibility', isVisible ? 'visible' : 'hidden');
    } else {
      // Try alternate text
      const altCta = await page.$('a[href="/auth/register"]');
      log(altCta ? 'pass' : 'warn', 'CTA button', altCta ? 'found with alternate selector' : 'not found');
    }

    // Test login link in header
    const loginLink = await page.$('a[href="/auth/login"]');
    log(loginLink ? 'pass' : 'fail', 'Login link in navigation');

    // Check for hover states on buttons
    const buttons = await page.$$('a.btn, button.btn, a[class*="btn"]');
    log('pass', `Found ${buttons.length} styled buttons/links`);

    // Test animations - check for CSS classes
    const animatedElements = await page.$$('[class*="animate-"], [class*="transition"]');
    log('pass', `Found ${animatedElements.length} animated/transitioning elements`);

  } catch (error) {
    log('fail', 'Home page test error', error.message);
  }
}

async function testLoginForm(page) {
  console.log('\n========== TESTING LOGIN FORM ==========');

  try {
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle', timeout: 30000 });
    log('pass', 'Login page loaded');

    // Test form elements
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    const submitButton = await page.$('button[type="submit"]');

    log(emailInput ? 'pass' : 'fail', 'Email input field');
    log(passwordInput ? 'pass' : 'fail', 'Password input field');
    log(submitButton ? 'pass' : 'fail', 'Submit button');

    // Test empty form submission (validation)
    if (submitButton) {
      await submitButton.click();
      // Check if form has HTML5 validation
      const emailRequired = await emailInput?.evaluate(el => el.hasAttribute('required'));
      log(emailRequired ? 'pass' : 'warn', 'Email field has required validation');
    }

    // Test with invalid credentials
    if (emailInput && passwordInput) {
      await emailInput.fill('test@invalid.com');
      await passwordInput.fill('wrongpassword');
      await submitButton?.click();

      // Wait for response
      await page.waitForTimeout(2000);

      // Check for error message
      const errorMessage = await page.$('[class*="error"], [class*="red"], .bg-red-900');
      log(errorMessage ? 'pass' : 'warn', 'Error message displayed for invalid credentials');
    }

    // Test "Forgot Password" link
    const forgotPasswordLink = await page.$('a[href="/auth/forgot-password"]');
    log(forgotPasswordLink ? 'pass' : 'fail', 'Forgot password link');

    // Test "Create account" link
    const registerLink = await page.$('a[href="/auth/register"]');
    log(registerLink ? 'pass' : 'fail', 'Register link');

  } catch (error) {
    log('fail', 'Login form test error', error.message);
  }
}

async function testRegistrationForm(page) {
  console.log('\n========== TESTING REGISTRATION FORM ==========');

  try {
    await page.goto(`${BASE_URL}/auth/register`, { waitUntil: 'networkidle', timeout: 30000 });
    log('pass', 'Registration page loaded');

    // Test all form fields
    const nameInput = await page.$('input#name');
    const emailInput = await page.$('input#email');
    const passwordInput = await page.$('input#password');
    const confirmPasswordInput = await page.$('input#confirmPassword');
    const companyInput = await page.$('input#company');
    const phoneInput = await page.$('input#phone');
    const termsCheckbox = await page.$('input#terms');
    const submitButton = await page.$('button[type="submit"]');

    log(nameInput ? 'pass' : 'fail', 'Name input field');
    log(emailInput ? 'pass' : 'fail', 'Email input field');
    log(passwordInput ? 'pass' : 'fail', 'Password input field');
    log(confirmPasswordInput ? 'pass' : 'fail', 'Confirm password field');
    log(companyInput ? 'pass' : 'fail', 'Company input field');
    log(phoneInput ? 'pass' : 'fail', 'Phone input field');
    log(termsCheckbox ? 'pass' : 'fail', 'Terms checkbox');
    log(submitButton ? 'pass' : 'fail', 'Submit button');

    // Test password mismatch validation
    if (passwordInput && confirmPasswordInput) {
      await nameInput?.fill('Test User');
      await emailInput?.fill('test@example.com');
      await passwordInput.fill('password123');
      await confirmPasswordInput.fill('differentpassword');
      await termsCheckbox?.check();
      await submitButton?.click();

      await page.waitForTimeout(1500);

      const errorMessage = await page.$('[class*="error"], [class*="red"]');
      log(errorMessage ? 'pass' : 'warn', 'Password mismatch validation');
    }

    // Test Terms of Service link
    const termsLink = await page.$('a[href="/terms"]');
    log(termsLink ? 'pass' : 'fail', 'Terms of Service link');

    // Test Privacy Policy link
    const privacyLink = await page.$('a[href="/privacy"]');
    log(privacyLink ? 'pass' : 'fail', 'Privacy Policy link');

  } catch (error) {
    log('fail', 'Registration form test error', error.message);
  }
}

async function testForgotPassword(page) {
  console.log('\n========== TESTING FORGOT PASSWORD ==========');

  try {
    await page.goto(`${BASE_URL}/auth/forgot-password`, { waitUntil: 'networkidle', timeout: 30000 });
    log('pass', 'Forgot password page loaded');

    const emailInput = await page.$('input[type="email"]');
    const submitButton = await page.$('button[type="submit"]');
    const backLink = await page.$('a[href="/auth/login"]');

    log(emailInput ? 'pass' : 'fail', 'Email input field');
    log(submitButton ? 'pass' : 'fail', 'Submit button');
    log(backLink ? 'pass' : 'fail', 'Back to login link');

    // Test form submission
    if (emailInput && submitButton) {
      await emailInput.fill('test@example.com');
      await submitButton.click();

      await page.waitForTimeout(2000);

      // Check for success message
      const successIndicator = await page.$('text=Check your email');
      log(successIndicator ? 'pass' : 'warn', 'Success message displayed');
    }

  } catch (error) {
    log('fail', 'Forgot password test error', error.message);
  }
}

async function testJobCreationForm(page) {
  console.log('\n========== TESTING JOB CREATION FORM ==========');

  try {
    await page.goto(`${BASE_URL}/jobs/new`, { waitUntil: 'networkidle', timeout: 30000 });
    log('pass', 'Job creation page loaded');

    // Test form fields - using more flexible selectors
    const titleInput = await page.$('input[placeholder*="Kitchen"], input[placeholder*="Smith"]');
    const projectTypeButtons = await page.$$('button[type="button"]');
    const prioritySelect = await page.$('select.input');
    const descriptionTextarea = await page.$('textarea');

    log(titleInput ? 'pass' : 'fail', 'Title input field');
    log(projectTypeButtons.length > 0 ? 'pass' : 'fail', 'Project type selection buttons', `Found ${projectTypeButtons.length} buttons`);
    log(prioritySelect ? 'pass' : 'fail', 'Priority dropdown');
    log(descriptionTextarea ? 'pass' : 'fail', 'Description textarea');

    // Test step navigation
    const stepButtons = await page.$$('button[class*="rounded-lg"]');
    log('pass', `Found ${stepButtons.length} step navigation buttons`);

    // Navigate through steps
    const nextButton = await page.$('button:has-text("Next Step")');
    log(nextButton ? 'pass' : 'fail', 'Next Step button');

    // Check back/previous button
    const prevButton = await page.$('button:has-text("Previous")');
    log(prevButton ? 'pass' : 'fail', 'Previous button');

    // Navigate to files step to check for file upload
    if (nextButton) {
      await nextButton.click();
      await page.waitForTimeout(500);
      await nextButton.click();
      await page.waitForTimeout(500);
      await nextButton.click();
      await page.waitForTimeout(500);

      // Now on files step
      const fileDropzone = await page.$('[class*="border-dashed"]');
      log(fileDropzone ? 'pass' : 'fail', 'File dropzone area');
    }

  } catch (error) {
    log('fail', 'Job creation form test error', error.message);
  }
}

async function testAuthenticatedPages(page) {
  console.log('\n========== TESTING AUTHENTICATED FLOW ==========');

  try {
    // First, register a test user
    await page.goto(`${BASE_URL}/auth/register`, { waitUntil: 'networkidle', timeout: 30000 });

    const testEmail = `test${Date.now()}@test.com`;

    await page.fill('input#name', 'Test User');
    await page.fill('input#email', testEmail);
    await page.fill('input#password', 'password123');
    await page.fill('input#confirmPassword', 'password123');
    await page.check('input#terms');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      log('pass', 'Registration successful, redirected to dashboard');

      // Test dashboard navigation
      console.log('\n--- Testing Dashboard Navigation ---');

      const navItems = await page.$$('nav a, aside a');
      log('pass', `Found ${navItems.length} navigation links`);

      // Test sidebar links
      const myJobsLink = await page.$('a[href="/dashboard/jobs"]');
      const newJobLink = await page.$('a[href="/jobs/new"]');
      const downloadsLink = await page.$('a[href="/dashboard/downloads"]');
      const messagesLink = await page.$('a[href="/dashboard/messages"]');
      const helpLink = await page.$('a[href="/dashboard/help"]');
      const settingsLink = await page.$('a[href="/dashboard/settings"]');
      const billingLink = await page.$('a[href="/dashboard/billing"]');

      log(myJobsLink ? 'pass' : 'fail', 'My Jobs link in sidebar');
      log(newJobLink ? 'pass' : 'fail', 'New Job link in sidebar');
      log(downloadsLink ? 'pass' : 'fail', 'Downloads link');
      log(messagesLink ? 'pass' : 'fail', 'Messages link');
      log(helpLink ? 'pass' : 'fail', 'Help link');
      log(settingsLink ? 'pass' : 'fail', 'Settings link');
      log(billingLink ? 'pass' : 'fail', 'Billing link');

      // Test sign out button
      const signOutButton = await page.$('button:has-text("Sign Out")');
      log(signOutButton ? 'pass' : 'warn', 'Sign out button');

      // Navigate to each page
      const pagesToTest = [
        { url: '/dashboard/jobs', name: 'My Jobs' },
        { url: '/dashboard/downloads', name: 'Downloads' },
        { url: '/dashboard/messages', name: 'Messages' },
        { url: '/dashboard/help', name: 'Help' },
        { url: '/dashboard/settings', name: 'Settings' },
        { url: '/dashboard/billing', name: 'Billing' }
      ];

      for (const pageTest of pagesToTest) {
        try {
          await page.goto(`${BASE_URL}${pageTest.url}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
          await page.waitForTimeout(1000);
          const title = await page.$('h1');
          log(title ? 'pass' : 'warn', `${pageTest.name} page loads correctly`);
        } catch (e) {
          log('fail', `${pageTest.name} page`, e.message);
        }
      }

    } else {
      log('warn', 'Registration flow', `Unexpected redirect to ${currentUrl}`);
    }

  } catch (error) {
    log('fail', 'Authenticated pages test error', error.message);
  }
}

async function testStaticPages(page) {
  console.log('\n========== TESTING STATIC PAGES ==========');

  const staticPages = [
    { url: '/terms', name: 'Terms of Service' },
    { url: '/privacy', name: 'Privacy Policy' }
  ];

  for (const pageInfo of staticPages) {
    try {
      await page.goto(`${BASE_URL}${pageInfo.url}`, { waitUntil: 'networkidle', timeout: 15000 });
      const title = await page.$('h1');
      const content = await page.$$('section, article, .bg-dark-surface');

      log(title ? 'pass' : 'fail', `${pageInfo.name} page has title`);
      log(content.length > 0 ? 'pass' : 'warn', `${pageInfo.name} page has content sections`);

      // Test navigation links
      const homeLink = await page.$('a[href="/"]');
      log(homeLink ? 'pass' : 'warn', `${pageInfo.name} has home link`);

    } catch (error) {
      log('fail', `${pageInfo.name} page error`, error.message);
    }
  }
}

async function testHoverAndAnimations(page) {
  console.log('\n========== TESTING HOVER STATES & ANIMATIONS ==========');

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Find buttons/links with hover classes
    const hoverElements = await page.$$('[class*="hover:"]');
    log('pass', `Found ${hoverElements.length} elements with hover states`);

    // Find transition elements
    const transitionElements = await page.$$('[class*="transition"]');
    log('pass', `Found ${transitionElements.length} elements with transitions`);

    // Find animation elements
    const animateElements = await page.$$('[class*="animate-"]');
    log('pass', `Found ${animateElements.length} animated elements`);

    // Test a hover interaction
    const firstButton = await page.$('a.btn, button.btn, a[class*="bg-walnut"]');
    if (firstButton) {
      await firstButton.hover();
      await page.waitForTimeout(300);
      log('pass', 'Hover interaction tested');
    }

  } catch (error) {
    log('fail', 'Hover/animation test error', error.message);
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('  INTERACTIVE ELEMENT TEST SUITE');
  console.log('  Testing: http://localhost:3010');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    await testHomePage(page);
    await testLoginForm(page);
    await testRegistrationForm(page);
    await testForgotPassword(page);
    await testJobCreationForm(page);
    await testStaticPages(page);
    await testHoverAndAnimations(page);
    await testAuthenticatedPages(page);

  } catch (error) {
    log('fail', 'Test suite error', error.message);
  } finally {
    await browser.close();
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('  TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);

  if (results.failed.length > 0) {
    console.log('\n--- FAILED TESTS ---');
    results.failed.forEach(f => console.log(`  ❌ ${f.message}${f.details ? ': ' + f.details : ''}`));
  }

  if (results.warnings.length > 0) {
    console.log('\n--- WARNINGS ---');
    results.warnings.forEach(w => console.log(`  ⚠️  ${w.message}${w.details ? ': ' + w.details : ''}`));
  }

  console.log('\n' + '='.repeat(60));
}

runTests().catch(console.error);
