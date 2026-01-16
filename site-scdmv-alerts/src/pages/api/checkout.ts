import type { APIRoute } from "astro";
import { createCheckoutSession } from "../../lib/stripe";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime.env;
    const db = env.DB;

    const formData = await request.formData();
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const phone = formData.get("phone")?.toString().trim() || null;
    const appointmentType = formData.get("appointment_type")?.toString();
    const region = formData.get("region")?.toString() || "any";

    // Validation
    if (!email || !appointmentType) {
      return Response.redirect(new URL("/?error=missing_fields", request.url), 302);
    }

    // Check if already a paid subscriber
    const existing = await db
      .prepare("SELECT id, tier, status FROM subscribers WHERE email = ?")
      .bind(email)
      .first();

    if (existing?.tier === "paid" && existing?.status === "active") {
      return Response.redirect(new URL("/?error=already_subscribed", request.url), 302);
    }

    // Create or update subscriber record (will upgrade to paid after webhook)
    if (!existing) {
      await db
        .prepare(
          `INSERT INTO subscribers (email, phone, appointment_type, preferred_region, tier, status)
           VALUES (?, ?, ?, ?, 'free', 'active')`
        )
        .bind(email, phone, appointmentType, region)
        .run();
    } else if (existing.status === "unsubscribed") {
      await db
        .prepare(
          `UPDATE subscribers
           SET status = 'active', phone = ?, appointment_type = ?, preferred_region = ?, updated_at = datetime('now')
           WHERE email = ?`
        )
        .bind(phone, appointmentType, region, email)
        .run();
    }

    // Create Stripe checkout session
    const siteUrl = env.SITE_URL || new URL(request.url).origin;

    const session = await createCheckoutSession(env.STRIPE_SECRET_KEY, {
      priceId: env.STRIPE_PRICE_ID,
      successUrl: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${siteUrl}/#pricing`,
      customerEmail: email,
      metadata: {
        email,
        appointment_type: appointmentType,
        region,
      },
    });

    return Response.redirect(session.url, 303);

  } catch (error) {
    console.error("Checkout error:", error);
    return Response.redirect(new URL("/?error=checkout_failed", request.url), 302);
  }
};
