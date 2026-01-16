# SC DMV Appointment Scraper

Monitors the SC DMV scheduler for available appointments and sends results to the main API for notification dispatch.

## How It Works

1. Launches headless browser (Playwright)
2. Navigates to https://public.scscheduler.com/
3. Captures network requests to discover API endpoints
4. Extracts available appointment slots
5. Sends results to main API → triggers notifications

## Setup

```bash
cd scraper
npm install
npx playwright install chromium
```

## Environment Variables

```bash
# Required
API_ENDPOINT=https://scdmvalerts.com/api/scraper-results
API_SECRET=your-secret-key

# Optional
HEADLESS=true  # Set to 'false' to see browser
```

## Running Locally

```bash
# Single run
npm start

# Watch mode (re-runs on file changes)
npm run dev
```

## Deployment Options

### Option 1: Railway (Recommended)
1. Create new project from this directory
2. Set environment variables
3. Add cron job: `*/5 * * * *` (every 5 minutes)

### Option 2: Render
1. Create new Background Worker
2. Set environment variables
3. Use cron schedule in render.yaml

### Option 3: GitHub Actions
```yaml
name: Scrape SC DMV
on:
  schedule:
    - cron: '*/10 * * * *'  # Every 10 minutes
jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd scraper && npm ci
      - run: npx playwright install chromium
      - run: npm start
        env:
          API_ENDPOINT: ${{ secrets.API_ENDPOINT }}
          API_SECRET: ${{ secrets.API_SECRET }}
```

## Discovery Mode

On first run, the scraper will:
1. Take a screenshot (`debug-screenshot.png`)
2. Log all discovered API endpoints
3. Print page content preview

Use this output to understand the site structure and refine the extraction logic.

## Refining Extraction

Once we understand the SC DMV scheduler structure, update `extractAppointments()` in `index.js` to:
1. Navigate through the booking flow
2. Select service types
3. Extract actual available slots
4. Parse dates, times, and locations
