/**
 * SC DMV Road Test Appointment Scraper
 *
 * Monitors publicwebsiteapi.scscheduler.com for available road test appointments
 * and sends results to our API for notification dispatch.
 *
 * Run on a schedule (every 5-10 minutes) via cron.
 */

// Configuration
const CONFIG = {
  apiBaseUrl: 'https://publicwebsiteapi.scscheduler.com/api',
  notifyEndpoint: process.env.API_ENDPOINT || 'https://scdmv-alerts.pages.dev/api/scraper-results',
  apiSecret: process.env.SCRAPER_API_SECRET || 'dev-secret',
};

// SC regions with representative zip codes
const REGIONS = {
  greenville: ['29601', '29607', '29615'],
  columbia: ['29201', '29205', '29210'],
  charleston: ['29401', '29405', '29407'],
  myrtle_beach: ['29572', '29577', '29582'],
  spartanburg: ['29301', '29303', '29306'],
  florence: ['29501', '29505'],
  rock_hill: ['29730', '29732'],
  aiken: ['29801', '29803'],
};

// Test types from SiteData
const TEST_TYPES = [
  { id: 1, name: 'Automobile (Class D)', code: 'road_test' },
  { id: 2, name: 'Motorcycle', code: 'motorcycle_test' },
  { id: 3, name: 'Non CDL Class E', code: 'cdl' },
  { id: 4, name: 'Non CDL Class F', code: 'cdl' },
  { id: 5, name: 'Class A', code: 'cdl' },
  { id: 6, name: 'Class B', code: 'cdl' },
  { id: 7, name: 'Class C', code: 'cdl' },
];

async function fetchAvailability(typeId, zipCode) {
  try {
    const response = await fetch(`${CONFIG.apiBaseUrl}/AvailableLocation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ typeId, zipCode }),
    });

    if (!response.ok) {
      console.error(`API error for zip ${zipCode}: ${response.status}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error(`Fetch error for zip ${zipCode}:`, error.message);
    return [];
  }
}

function extractAppointments(locations, testType, region) {
  const appointments = [];

  for (const location of locations) {
    if (!location.Availability?.LocationAvailabilityDates) continue;

    for (const dateInfo of location.Availability.LocationAvailabilityDates) {
      for (const slot of dateInfo.AvailableTimeSlots || []) {
        appointments.push({
          type: testType.code,
          typeName: testType.name,
          location: location.Name,
          address: location.Address,
          region: region,
          date: dateInfo.FormattedAvailabilityDate,
          dayOfWeek: dateInfo.DayOfWeek,
          time: slot.FormattedTime,
          slotId: slot.SlotId,
          bookingUrl: 'https://public.scscheduler.com/',
        });
      }
    }
  }

  return appointments;
}

async function scrape() {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting SC DMV scraper...`);

  const allAppointments = [];
  const seenSlots = new Set();

  // Query each region for each test type
  for (const [region, zipCodes] of Object.entries(REGIONS)) {
    for (const testType of TEST_TYPES) {
      // Only check first zip per region to avoid duplicate locations
      const zipCode = zipCodes[0];

      console.log(`Checking ${testType.name} near ${zipCode} (${region})...`);

      const locations = await fetchAvailability(testType.id, zipCode);
      const appointments = extractAppointments(locations, testType, region);

      // Dedupe by slotId
      for (const apt of appointments) {
        if (!seenSlots.has(apt.slotId)) {
          seenSlots.add(apt.slotId);
          allAppointments.push(apt);
        }
      }

      // Small delay to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  console.log(`Found ${allAppointments.length} unique appointments`);

  // Send to our notification API
  if (allAppointments.length > 0) {
    await sendResults(allAppointments);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[${new Date().toISOString()}] Scraper finished in ${elapsed}s`);
}

async function sendResults(appointments) {
  try {
    const response = await fetch(CONFIG.notifyEndpoint, {
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

    const result = await response.json();

    if (response.ok) {
      console.log('Results sent successfully:', result);
    } else {
      console.error('Failed to send results:', result);
    }
  } catch (error) {
    console.error('Error sending results:', error.message);
  }
}

// Run the scraper
scrape().catch(console.error);
