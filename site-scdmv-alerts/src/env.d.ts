/// <reference types="astro/client" />

type D1Database = import("@cloudflare/workers-types").D1Database;

interface Env {
  DB: D1Database;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_ID: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  RESEND_API_KEY: string;
  SITE_URL: string;
  SCRAPER_API_SECRET: string;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
