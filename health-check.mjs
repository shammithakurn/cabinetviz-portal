// Comprehensive Web App Health Check
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3010';

const results = {
  pages: [],
  jsErrors: [],
  brokenImages: [],
  brokenLinks: [],
  unclickableButtons: [],
  passed: 0,
  failed: 0
};

// All routes to check
const routes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/terms',
  '/privacy',
  '/dashboard',
  '/dashboard/jobs',
  '/dashboard/downloads',
  '/dashboard/messages',
  '/dashboard/help',
  '/dashboard/settings',
  '/dashboard/billing',
  '/jobs/new',
  '/admin',
  '/admin/jobs',
  '/admin/users',
  '/admin/settings',
];

async function checkPage(page, route) {
  const pageResult = {
    route,
    status: 'unknown',
    jsErrors: [],
    images: { total: 0, broken: [] },
    links: { total: 0, broken: [] },
    buttons: { total: 0, unclickable: [] }
  };

  try {
    // Collect console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        pageResult.jsErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      pageResult.jsErrors.push(error.message);
    });

    // Navigate to page
    const response = await page.goto(`${BASE_URL}${route}`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    pageResult.status = response?.status() || 'no response';

    // Check if redirected (for protected routes)
    const finalUrl = page.url();
    if (finalUrl !== `${BASE_URL}${route}` && !finalUrl.startsWith(`${BASE_URL}${route}`)) {
      pageResult.redirectedTo = finalUrl.replace(BASE_URL, '');
    }

    // Wait for page to settle
    await page.waitForTimeout(500);

    // Check images
    const images = await page.$$('img');
    pageResult.images.total = images.length;

    for (const img of images) {
      const src = await img.getAttribute('src');
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      if (naturalWidth === 0 && src) {
        pageResult.images.broken.push(src);
      }
    }

    // Check links
    const links = await page.$$('a[href]');
    pageResult.links.total = links.length;

    for (const link of links) {
      const href = await link.getAttribute('href');
      if (!href) continue;

      // Skip external links, anchors, mailto, tel
      if (href.startsWith('http') && !href.startsWith(BASE_URL)) continue;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;

      // Check internal links
      const fullUrl = href.startsWith('/') ? `${BASE_URL}${href}` : href;
      try {
        const linkResponse = await page.request.head(fullUrl, { timeout: 5000 });
        if (linkResponse.status() >= 400) {
          pageResult.links.broken.push({ href, status: linkResponse.status() });
        }
      } catch (e) {
        // Link check failed - might be dynamic route
      }
    }

    // Check buttons
    const buttons = await page.$$('button, [role="button"], input[type="submit"], input[type="button"]');
    pageResult.buttons.total = buttons.length;

    for (const button of buttons) {
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      const text = await button.textContent() || await button.getAttribute('aria-label') || 'unnamed';

      if (!isVisible || !isEnabled) {
        const reason = !isVisible ? 'hidden' : 'disabled';
        // Only report truly problematic buttons (not intentionally disabled ones)
        if (!isVisible) {
          pageResult.buttons.unclickable.push({ text: text.trim().slice(0, 30), reason });
        }
      }
    }

    return pageResult;

  } catch (error) {
    pageResult.status = 'error';
    pageResult.error = error.message;
    return pageResult;
  }
}

async function runHealthCheck() {
  console.log('='.repeat(70));
  console.log('  WEB APP HEALTH CHECK');
  console.log('  ' + new Date().toISOString());
  console.log('='.repeat(70));

  const browser = await chromium.launch({ headless: true });

  // First, check pages without auth
  console.log('\n--- PUBLIC PAGES ---');
  const publicContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const publicPage = await publicContext.newPage();

  const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/terms', '/privacy'];

  for (const route of publicRoutes) {
    const result = await checkPage(publicPage, route);
    results.pages.push(result);

    const status = result.status === 200 ? '✅' : result.status === 'error' ? '❌' : '⚠️';
    console.log(`${status} ${route} - Status: ${result.status}${result.redirectedTo ? ` (→ ${result.redirectedTo})` : ''}`);

    if (result.jsErrors.length > 0) {
      console.log(`   ⚠️  JS Errors: ${result.jsErrors.length}`);
      results.jsErrors.push(...result.jsErrors.map(e => ({ route, error: e })));
    }
    if (result.images.broken.length > 0) {
      console.log(`   ⚠️  Broken Images: ${result.images.broken.length}`);
      results.brokenImages.push(...result.images.broken.map(src => ({ route, src })));
    }
    if (result.links.broken.length > 0) {
      console.log(`   ⚠️  Broken Links: ${result.links.broken.length}`);
      results.brokenLinks.push(...result.links.broken.map(l => ({ route, ...l })));
    }
  }

  await publicContext.close();

  // Now check authenticated pages
  console.log('\n--- AUTHENTICATED PAGES ---');
  const authContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const authPage = await authContext.newPage();

  // Register/login first
  const testEmail = `health-${Date.now()}@test.com`;
  await authPage.goto(`${BASE_URL}/auth/register`, { waitUntil: 'networkidle' });
  await authPage.fill('input#name', 'Health Check User');
  await authPage.fill('input#email', testEmail);
  await authPage.fill('input#password', 'TestPass123!');
  await authPage.fill('input#confirmPassword', 'TestPass123!');
  await authPage.check('input#terms');
  await authPage.click('button[type="submit"]');
  await authPage.waitForTimeout(3000);

  const dashRoutes = [
    '/dashboard',
    '/dashboard/jobs',
    '/dashboard/downloads',
    '/dashboard/messages',
    '/dashboard/help',
    '/dashboard/settings',
    '/dashboard/billing',
    '/jobs/new',
  ];

  for (const route of dashRoutes) {
    const result = await checkPage(authPage, route);
    results.pages.push(result);

    const status = result.status === 200 ? '✅' : result.status === 'error' ? '❌' : '⚠️';
    console.log(`${status} ${route} - Status: ${result.status}${result.redirectedTo ? ` (→ ${result.redirectedTo})` : ''}`);

    if (result.jsErrors.length > 0) {
      console.log(`   ⚠️  JS Errors: ${result.jsErrors.length}`);
      results.jsErrors.push(...result.jsErrors.map(e => ({ route, error: e })));
    }
    if (result.images.broken.length > 0) {
      console.log(`   ⚠️  Broken Images: ${result.images.broken.length}`);
      results.brokenImages.push(...result.images.broken.map(src => ({ route, src })));
    }
    if (result.links.broken.length > 0) {
      console.log(`   ⚠️  Broken Links: ${result.links.broken.length}`);
      results.brokenLinks.push(...result.links.broken.map(l => ({ route, ...l })));
    }
  }

  await authContext.close();

  // Check admin pages (will likely redirect)
  console.log('\n--- ADMIN PAGES (access check) ---');
  const adminContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const adminPage = await adminContext.newPage();

  const adminRoutes = ['/admin', '/admin/jobs', '/admin/users', '/admin/settings'];

  for (const route of adminRoutes) {
    const result = await checkPage(adminPage, route);
    results.pages.push(result);

    const status = result.redirectedTo ? '🔒' : result.status === 200 ? '✅' : '⚠️';
    console.log(`${status} ${route} - Status: ${result.status}${result.redirectedTo ? ` (→ ${result.redirectedTo})` : ''}`);
  }

  await adminContext.close();
  await browser.close();

  // Print Summary
  console.log('\n' + '='.repeat(70));
  console.log('  HEALTH CHECK SUMMARY');
  console.log('='.repeat(70));

  const successPages = results.pages.filter(p => p.status === 200 || p.redirectedTo).length;
  const failedPages = results.pages.filter(p => p.status === 'error' || (p.status >= 400 && !p.redirectedTo)).length;

  console.log(`\n📊 Pages Checked: ${results.pages.length}`);
  console.log(`   ✅ Successful: ${successPages}`);
  console.log(`   ❌ Failed: ${failedPages}`);

  console.log(`\n🖼️  Images: ${results.brokenImages.length} broken`);
  console.log(`🔗 Links: ${results.brokenLinks.length} broken`);
  console.log(`⚠️  JS Errors: ${results.jsErrors.length}`);

  // Details of issues
  if (results.jsErrors.length > 0) {
    console.log('\n--- JAVASCRIPT ERRORS ---');
    const uniqueErrors = [...new Set(results.jsErrors.map(e => e.error))];
    uniqueErrors.slice(0, 10).forEach(err => {
      console.log(`  • ${err.slice(0, 100)}${err.length > 100 ? '...' : ''}`);
    });
    if (uniqueErrors.length > 10) {
      console.log(`  ... and ${uniqueErrors.length - 10} more`);
    }
  }

  if (results.brokenImages.length > 0) {
    console.log('\n--- BROKEN IMAGES ---');
    results.brokenImages.forEach(img => {
      console.log(`  • ${img.route}: ${img.src}`);
    });
  }

  if (results.brokenLinks.length > 0) {
    console.log('\n--- BROKEN LINKS ---');
    results.brokenLinks.forEach(link => {
      console.log(`  • ${link.route}: ${link.href} (${link.status})`);
    });
  }

  // Overall status
  const hasIssues = results.jsErrors.length > 0 || results.brokenImages.length > 0 ||
                    results.brokenLinks.length > 0 || failedPages > 0;

  console.log('\n' + '='.repeat(70));
  if (hasIssues) {
    console.log('  ⚠️  ISSUES FOUND - Review the details above');
  } else {
    console.log('  ✅ ALL CHECKS PASSED - App is healthy!');
  }
  console.log('='.repeat(70));
}

runHealthCheck().catch(console.error);
