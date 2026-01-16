/**
 * SC DMV Appointment Scraper
 *
 * Monitors public.scscheduler.com for available appointments
 * and sends results to our API for notification dispatch.
 *
 * Run on a schedule (every 5-10 minutes) via:
 * - Railway cron
 * - Render cron
 * - GitHub Actions
 * - Or any Node.js hosting with cron support
 */

import { chromium } from 'playwright';

// Configuration
const CONFIG = {
  schedulerUrl: 'https://public.scscheduler.com/',
  apiEndpoint: process.env.API_ENDPOINT || 'http://localhost:4321/api/scraper-results',
  apiSecret: process.env.API_SECRET || 'dev-secret',
  headless: process.env.HEADLESS !== 'false',
  timeout: 60000,
};

// Appointment types we're looking for
const APPOINTMENT_TYPES = [
  'drivers_license',
  'real_id',
  'road_test',
  'motorcycle_test',
  'cdl',
  'state_id',
];

async function scrape() {
  console.log(`[${new Date().toISOString()}] Starting SC DMV scraper...`);

  const browser = await chromium.launch({
    headless: CONFIG.headless,
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  // Capture API requests to discover endpoints
  const apiCalls = [];
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('api') || url.includes('schedule') || url.includes('slot') || url.includes('appoint')) {
      apiCalls.push({
        url,
        method: request.method(),
        headers: request.headers(),
      });
    }
  });

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api') || url.includes('schedule') || url.includes('slot') || url.includes('appoint')) {
      try {
        const body = await response.json().catch(() => null);
        if (body) {
          console.log(`[API Response] ${url}`, JSON.stringify(body).slice(0, 200));
        }
      } catch (e) {
        // Ignore non-JSON responses
      }
    }
  });

  try {
    console.log(`Navigating to ${CONFIG.schedulerUrl}...`);
    await page.goto(CONFIG.schedulerUrl, {
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout,
    });

    // Wait for the page to fully load
    await page.waitForTimeout(3000);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'scraper/debug-screenshot.png', fullPage: true });
    console.log('Screenshot saved to scraper/debug-screenshot.png');

    // Log page title and URL
    console.log(`Page title: ${await page.title()}`);
    console.log(`Current URL: ${page.url()}`);

    // Log any discovered API calls
    if (apiCalls.length > 0) {
      console.log('\n=== Discovered API Endpoints ===');
      apiCalls.forEach((call, i) => {
        console.log(`${i + 1}. ${call.method} ${call.url}`);
      });
    }

    // Try to find appointment-related elements
    const appointments = await extractAppointments(page);

    if (appointments.length > 0) {
      console.log(`Found ${appointments.length} available appointments`);
      await sendResults(appointments);
    } else {
      console.log('No appointments found in this scan');
    }

    // Log page content structure for debugging
    const bodyText = await page.textContent('body');
    console.log('\n=== Page Content Preview ===');
    console.log(bodyText?.slice(0, 500) || 'No content');

  } catch (error) {
    console.error('Scraper error:', error);
  } finally {
    await browser.close();
    console.log(`[${new Date().toISOString()}] Scraper finished`);
  }
}

async function extractAppointments(page) {
  const appointments = [];

  // This is a placeholder - we need to discover the actual page structure
  // by running the scraper and examining the screenshot + console output

  // Common patterns to look for:
  // 1. Calendar grids with clickable dates
  // 2. Time slot buttons
  // 3. Location dropdowns
  // 4. Service type selection

  // Try to find any elements that might indicate available slots
  const possibleSlotSelectors = [
    '[class*="available"]',
    '[class*="slot"]',
    '[class*="time"]',
    '[class*="appointment"]',
    'button:has-text("Book")',
    'button:has-text("Schedule")',
    'a:has-text("Book")',
    '.calendar-day:not(.disabled)',
  ];

  for (const selector of possibleSlotSelectors) {
    try {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        console.log(`Found ${elements.length} elements matching: ${selector}`);

        for (const el of elements.slice(0, 10)) {
          const text = await el.textContent();
          if (text) {
            appointments.push({
              selector,
              text: text.trim(),
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    } catch (e) {
      // Selector didn't match, continue
    }
  }

  return appointments;
}

async function sendResults(appointments) {
  try {
    const response = await fetch(CONFIG.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.apiSecret}`,
      },
      body: JSON.stringify({
        source: 'scdmv-scraper',
        scrapedAt: new Date().toISOString(),
        appointments,
      }),
    });

    if (response.ok) {
      console.log('Results sent to API successfully');
    } else {
      console.error('Failed to send results:', await response.text());
    }
  } catch (error) {
    console.error('Error sending results:', error);
  }
}

// Run the scraper
scrape().catch(console.error);
