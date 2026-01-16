import type { APIRoute } from "astro";
import {
  sendSMS,
  sendEmail,
  formatSMSMessage,
  formatEmailHTML,
  formatEmailText,
} from "../../lib/notifications";

interface ScraperPayload {
  source: string;
  scrapedAt: string;
  appointments: Array<{
    type?: string;
    location?: string;
    date?: string;
    time?: string;
    bookingUrl?: string;
    raw?: string;
  }>;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime.env;
    const db = env.DB;

    // Verify API secret
    const authHeader = request.headers.get("Authorization");
    const expectedToken = `Bearer ${env.SCRAPER_API_SECRET}`;

    if (authHeader !== expectedToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload: ScraperPayload = await request.json();

    if (!payload.appointments || payload.appointments.length === 0) {
      return new Response(JSON.stringify({ message: "No appointments to process" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Log the availability check
    await db
      .prepare(
        `INSERT INTO availability_checks (appointment_type, region, slots_found, slots_data, is_new)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind("mixed", "any", payload.appointments.length, JSON.stringify(payload.appointments), 1)
      .run();

    // Get all active subscribers with their unsubscribe tokens
    const subscribers = await db
      .prepare(
        `SELECT id, email, phone, tier, appointment_type, preferred_region,
                alerts_sent_today, last_alert_date, unsubscribe_token
         FROM subscribers
         WHERE status = 'active'`
      )
      .all();

    if (!subscribers.results || subscribers.results.length === 0) {
      return new Response(JSON.stringify({ message: "No active subscribers" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const siteUrl = env.SITE_URL || "https://scdmvalerts.com";

    let emailsSent = 0;
    let smsSent = 0;
    let errors: string[] = [];

    for (const sub of subscribers.results) {
      // Reset daily counter if it's a new day
      const lastAlertDate = sub.last_alert_date as string | null;
      let alertsSentToday = (sub.alerts_sent_today as number) || 0;

      if (lastAlertDate !== today) {
        alertsSentToday = 0;
      }

      // Check if subscriber can receive more alerts
      const tier = sub.tier as string;
      const maxAlerts = tier === "paid" ? Infinity : 3;

      if (alertsSentToday >= maxAlerts) {
        continue; // Skip, already at daily limit
      }

      // Filter appointments by subscriber preferences
      const subType = sub.appointment_type as string;
      const subRegion = sub.preferred_region as string;

      const matchingAppointments = payload.appointments.filter((apt) => {
        // Match by type if specified
        if (subType && apt.type && apt.type !== subType) {
          return false;
        }
        // Match by region if not "any"
        if (subRegion && subRegion !== "any" && apt.location) {
          // Simple substring match for now
          if (!apt.location.toLowerCase().includes(subRegion.toLowerCase())) {
            return false;
          }
        }
        return true;
      });

      if (matchingAppointments.length === 0) {
        continue; // No matching appointments for this subscriber
      }

      const email = sub.email as string;
      const phone = sub.phone as string | null;
      const unsubscribeToken = sub.unsubscribe_token as string;
      const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=${unsubscribeToken}`;

      // Send email to all subscribers
      const emailResult = await sendEmail(
        { apiKey: env.RESEND_API_KEY },
        {
          to: email,
          subject: `SC DMV: ${matchingAppointments.length} Appointment${matchingAppointments.length > 1 ? "s" : ""} Available`,
          html: formatEmailHTML(matchingAppointments, unsubscribeUrl),
          text: formatEmailText(matchingAppointments, unsubscribeUrl),
        }
      );

      if (emailResult.success) {
        emailsSent++;
        await logNotification(db, sub.id as string, "email", matchingAppointments, "sent");
      } else {
        errors.push(`Email to ${email}: ${emailResult.error}`);
        await logNotification(db, sub.id as string, "email", matchingAppointments, "failed", emailResult.error);
      }

      // Send SMS only to paid users with phone number
      if (tier === "paid" && phone) {
        const smsResult = await sendSMS(
          {
            accountSid: env.TWILIO_ACCOUNT_SID,
            authToken: env.TWILIO_AUTH_TOKEN,
            fromNumber: env.TWILIO_PHONE_NUMBER,
          },
          phone,
          formatSMSMessage(matchingAppointments)
        );

        if (smsResult.success) {
          smsSent++;
          await logNotification(db, sub.id as string, "sms", matchingAppointments, "sent");
        } else {
          errors.push(`SMS to ${phone}: ${smsResult.error}`);
          await logNotification(db, sub.id as string, "sms", matchingAppointments, "failed", smsResult.error);
        }
      }

      // Update alert counter
      await db
        .prepare(
          `UPDATE subscribers
           SET alerts_sent_today = alerts_sent_today + 1,
               last_alert_date = ?,
               updated_at = datetime('now')
           WHERE id = ?`
        )
        .bind(today, sub.id)
        .run();
    }

    return new Response(
      JSON.stringify({
        success: true,
        appointmentsReceived: payload.appointments.length,
        subscribersProcessed: subscribers.results.length,
        emailsSent,
        smsSent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Scraper results error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process scraper results" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

async function logNotification(
  db: D1Database,
  subscriberId: string,
  channel: "email" | "sms",
  appointmentData: unknown,
  status: "sent" | "failed" | "pending",
  errorMessage?: string
) {
  await db
    .prepare(
      `INSERT INTO notifications (subscriber_id, channel, appointment_data, status, error_message)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(subscriberId, channel, JSON.stringify(appointmentData), status, errorMessage || null)
    .run();
}

// Type imports
type D1Database = import("@cloudflare/workers-types").D1Database;
