# SC DMV Alerts

DMV appointment alert service for South Carolina. Monitors public.scscheduler.com for available appointments and sends SMS/email alerts to subscribers.

## Stack
- Astro + Tailwind CSS (frontend)
- Cloudflare Pages (hosting)
- Cloudflare D1 (SQLite database)
- Stripe (payments)
- Twilio (SMS)
- Resend (email)
- Puppeteer (scraping - separate worker)

## Project Structure
```
src/
  layouts/       # Base layout
  components/    # UI components
  pages/         # Routes
    api/         # API endpoints (Astro server endpoints)
  styles/        # Tailwind global styles
db/
  schema.sql     # D1 database schema
```

## Database (Cloudflare D1)

Schema in `db/schema.sql`. Tables:
- `subscribers` - email, phone, tier, status, appointment_type, region
- `availability_checks` - tracking what slots we've seen
- `notifications` - log of sent alerts

### D1 Setup
```bash
# Create database
wrangler d1 create scdmv-alerts-db

# Copy the database_id to wrangler.jsonc

# Run migrations
wrangler d1 execute scdmv-alerts-db --local --file=./db/schema.sql
wrangler d1 execute scdmv-alerts-db --remote --file=./db/schema.sql
```

### Accessing D1 in Astro
```typescript
// In API routes
export const POST: APIRoute = async ({ locals }) => {
  const db = locals.runtime.env.DB;
  const result = await db.prepare("SELECT * FROM subscribers").all();
  return new Response(JSON.stringify(result));
};
```

## Key URLs
- SC DMV Scheduler: https://public.scscheduler.com/
- Competitor (NC): https://www.ncdmvappointments.com/

## Business Model
- Free tier: 3 alerts/day, email only
- Paid tier: $5.99/mo, unlimited alerts, SMS + email

## Secrets (set via wrangler)
```bash
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put TWILIO_ACCOUNT_SID
wrangler secret put TWILIO_AUTH_TOKEN
wrangler secret put RESEND_API_KEY
```

## PRD
See `/tasks/prd-sc-dmv-alerts.md` for full requirements.
