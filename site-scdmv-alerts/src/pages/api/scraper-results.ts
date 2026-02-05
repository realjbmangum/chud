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
    slotId?: string;
    type?: string;
    typeName?: string;
    location?: string;
    address?: string;
    region?: string;
    date?: string;
    dayOfWeek?: string;
    time?: string;
    bookingUrl?: string;
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

    // Store appointments in database using batched upserts
    // (individual queries per appointment hit Cloudflare's subrequest limit)
    const validAppointments = payload.appointments.filter((apt) => apt.slotId);
    const BATCH_SIZE = 100;

    for (let i = 0; i < validAppointments.length; i += BATCH_SIZE) {
      const chunk = validAppointments.slice(i, i + BATCH_SIZE);
      const statements = chunk.map((apt) =>
        db
          .prepare(
            `INSERT INTO appointments (slot_id, appointment_type, type_name, location, address, region, date, day_of_week, time, booking_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(slot_id) DO UPDATE SET last_seen_at = datetime('now')`
          )
          .bind(
            apt.slotId,
            apt.type || "unknown",
            apt.typeName || null,
            apt.location || "Unknown",
            apt.address || null,
            apt.region || "any",
            apt.date || "",
            apt.dayOfWeek || null,
            apt.time || "",
            apt.bookingUrl || "https://public.scscheduler.com/"
          )
      );
      await db.batch(statements);
    }

    // Log availability check + cleanup old data (batched to save subrequests)
    await db.batch([
      db.prepare(
        `INSERT INTO availability_checks (appointment_type, region, slots_found, is_new)
         VALUES (?, ?, ?, ?)`
      ).bind("mixed", "any", payload.appointments.length, 1),
      db.prepare(`DELETE FROM availability_checks WHERE checked_at < datetime('now', '-1 day')`),
      db.prepare(`DELETE FROM notifications WHERE sent_at < datetime('now', '-7 days')`),
      db.prepare(`DELETE FROM appointments WHERE last_seen_at < datetime('now', '-7 days')`),
      db.prepare(`DELETE FROM sent_appointments WHERE sent_at < datetime('now', '-14 days')`),
    ]);

    // DB size alert check (once per hour when scraper runs)
    if (env.ALERT_EMAIL) {
      const rowCounts = await db
        .prepare(`
          SELECT
            (SELECT COUNT(*) FROM subscribers) as subscribers,
            (SELECT COUNT(*) FROM notifications) as notifications,
            (SELECT COUNT(*) FROM appointments) as appointments,
            (SELECT COUNT(*) FROM sent_appointments) as sent_appointments
        `)
        .first();

      const totalRows =
        (rowCounts?.subscribers || 0) +
        (rowCounts?.notifications || 0) +
        (rowCounts?.appointments || 0) +
        (rowCounts?.sent_appointments || 0);
      const ALERT_THRESHOLD = 50000;

      if (totalRows > ALERT_THRESHOLD) {
        await sendEmail(
          {
            apiKey: env.SENDGRID_API_KEY,
            fromEmail: env.SENDGRID_FROM_EMAIL || "alerts@scdmvappointments.com",
            fromName: "SC DMV Alerts System",
          },
          {
            to: env.ALERT_EMAIL,
            subject: `⚠️ SC DMV Alerts: Database size warning (${totalRows} rows)`,
            text: `Database row count: Subscribers=${rowCounts?.subscribers}, Notifications=${rowCounts?.notifications}, Appointments=${rowCounts?.appointments}, Sent=${rowCounts?.sent_appointments}. Total: ${totalRows} rows`,
            html: `<p>Database row count:</p><ul><li>Subscribers: ${rowCounts?.subscribers}</li><li>Notifications: ${rowCounts?.notifications}</li><li>Appointments: ${rowCounts?.appointments}</li><li>Sent: ${rowCounts?.sent_appointments}</li></ul><p>Total: ${totalRows} rows</p>`,
          }
        );
      }
    }

    // Get all active subscribers
    const subscribers = await db
      .prepare(
        `SELECT id, email, phone, tier, appointment_type, preferred_region,
                alerts_sent_today, last_alert_date, last_alert_at, unsubscribe_token
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

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const siteUrl = env.SITE_URL || "https://scdmvappointments.com";

    // Check if within allowed hours (6am-6pm ET)
    const etHour = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" })).getHours();
    if (etHour < 6 || etHour >= 18) {
      return new Response(
        JSON.stringify({
          message: "Outside notification hours (6am-6pm ET)",
          currentHourET: etHour,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    let emailsSent = 0;
    let smsSent = 0;
    let errors: string[] = [];
    let skippedReasons: string[] = [];

    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

    // Process each subscriber
    for (const sub of subscribers.results) {
      const lastAlertDate = sub.last_alert_date as string | null;
      let alertsSentToday = (sub.alerts_sent_today as number) || 0;

      // Reset counter if new day
      if (lastAlertDate !== today) {
        await db
          .prepare(`UPDATE subscribers SET alerts_sent_today = 0, last_alert_date = ? WHERE id = ?`)
          .bind(today, sub.id)
          .run();
        alertsSentToday = 0;
      }

      // Check tier limits
      const tier = sub.tier as string;
      let maxAlerts = 1;
      if (tier === "pro") maxAlerts = 3;
      else if (tier === "cdl") maxAlerts = 5;

      if (alertsSentToday >= maxAlerts) {
        skippedReasons.push(`${sub.email}: daily limit reached (${alertsSentToday}/${maxAlerts})`);
        continue;
      }

      // Check 3-hour cooldown
      const lastAlertAt = sub.last_alert_at as string | null;
      if (lastAlertAt) {
        const lastAlertTime = new Date(lastAlertAt).getTime();
        const timeSinceLastAlert = now.getTime() - lastAlertTime;
        if (timeSinceLastAlert < THREE_HOURS_MS) {
          const hoursRemaining = ((THREE_HOURS_MS - timeSinceLastAlert) / (60 * 60 * 1000)).toFixed(1);
          skippedReasons.push(`${sub.email}: cooldown active (${hoursRemaining}h remaining)`);
          continue;
        }
      }

      // Find NEW appointments for this subscriber (not already sent)
      const subType = sub.appointment_type as string;
      const subRegion = sub.preferred_region as string;

      // Build query to find unsent appointments matching preferences
      let query = `
        SELECT a.id, a.slot_id, a.appointment_type, a.type_name, a.location, a.address,
               a.region, a.date, a.day_of_week, a.time, a.booking_url
        FROM appointments a
        WHERE a.last_seen_at >= datetime('now', '-1 hour')
      `;
      const params: any[] = [];

      // Filter by type
      if (subType && subType !== "any") {
        query += ` AND a.appointment_type = ?`;
        params.push(subType);
      }

      // Filter by region
      if (subRegion && subRegion !== "any") {
        query += ` AND a.region = ?`;
        params.push(subRegion);
      }

      // Exclude already-sent appointments
      query += ` AND a.id NOT IN (
        SELECT appointment_id FROM sent_appointments
        WHERE subscriber_id = ?
      )`;
      params.push(sub.id);

      query += ` LIMIT 50`; // Limit to prevent huge emails

      const newAppointments = await db.prepare(query).bind(...params).all();

      if (!newAppointments.results || newAppointments.results.length === 0) {
        skippedReasons.push(`${sub.email}: no new appointments`);
        continue;
      }

      // Format appointments for email/SMS
      const formattedAppointments = newAppointments.results.map((apt: any) => ({
        type: apt.appointment_type,
        typeName: apt.type_name,
        location: apt.location,
        address: apt.address,
        region: apt.region,
        date: apt.date,
        dayOfWeek: apt.day_of_week,
        time: apt.time,
        bookingUrl: apt.booking_url,
      }));

      const email = sub.email as string;
      const phone = sub.phone as string | null;
      const unsubscribeToken = sub.unsubscribe_token as string;
      const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=${unsubscribeToken}`;

      // Send email
      const emailResult = await sendEmail(
        {
          apiKey: env.SENDGRID_API_KEY,
          fromEmail: env.SENDGRID_FROM_EMAIL || "alerts@scdmvappointments.com",
          fromName: "SC DMV Alerts",
        },
        {
          to: email,
          subject: `SC DMV: ${formattedAppointments.length} New Appointment${formattedAppointments.length > 1 ? "s" : ""} Available`,
          html: formatEmailHTML(formattedAppointments, unsubscribeUrl),
          text: formatEmailText(formattedAppointments, unsubscribeUrl),
        }
      );

      if (emailResult.success) {
        emailsSent++;
        await logNotification(db, sub.id as string, "email", formattedAppointments, "sent");
      } else {
        errors.push(`Email to ${email}: ${emailResult.error}`);
        await logNotification(db, sub.id as string, "email", formattedAppointments, "failed", emailResult.error);
      }

      // Send SMS to Pro/CDL users
      if ((tier === "pro" || tier === "cdl") && phone) {
        const smsResult = await sendSMS(
          {
            accountSid: env.TWILIO_ACCOUNT_SID,
            authToken: env.TWILIO_AUTH_TOKEN,
            fromNumber: env.TWILIO_PHONE_NUMBER,
          },
          phone,
          formatSMSMessage(formattedAppointments)
        );

        if (smsResult.success) {
          smsSent++;
          await logNotification(db, sub.id as string, "sms", formattedAppointments, "sent");
        } else {
          errors.push(`SMS to ${phone}: ${smsResult.error}`);
          await logNotification(db, sub.id as string, "sms", formattedAppointments, "failed", smsResult.error);
        }
      }

      // Mark appointments as sent + update counter (batched)
      const sentStatements = newAppointments.results.map((apt: any) =>
        db
          .prepare(`INSERT OR IGNORE INTO sent_appointments (subscriber_id, appointment_id) VALUES (?, ?)`)
          .bind(sub.id, apt.id)
      );
      sentStatements.push(
        db
          .prepare(
            `UPDATE subscribers
             SET alerts_sent_today = ?,
                 last_alert_date = ?,
                 last_alert_at = ?,
                 updated_at = datetime('now')
             WHERE id = ?`
          )
          .bind(alertsSentToday + 1, today, now.toISOString(), sub.id)
      );
      await db.batch(sentStatements);
    }

    return new Response(
      JSON.stringify({
        success: true,
        appointmentsReceived: payload.appointments.length,
        appointmentsStored: validAppointments.length,
        subscribersProcessed: subscribers.results.length,
        emailsSent,
        smsSent,
        errorsCount: errors.length,
        skippedCount: skippedReasons.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Scraper results error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        error: "Failed to process scraper results",
        message: errorMessage,
      }),
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
  const count = Array.isArray(appointmentData) ? appointmentData.length : 1;
  await db
    .prepare(
      `INSERT INTO notifications (subscriber_id, channel, appointment_data, status, error_message)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(subscriberId, channel, JSON.stringify({ count }), status, errorMessage || null)
    .run();
}

type D1Database = import("@cloudflare/workers-types").D1Database;
