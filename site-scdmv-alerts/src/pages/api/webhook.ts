import type { APIRoute } from "astro";
import { constructWebhookEvent } from "../../lib/stripe";
import {
  sendEmail,
  formatWelcomeEmailHTML,
  formatWelcomeEmailText,
} from "../../lib/notifications";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime.env;
    const db = env.DB;

    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    const event = await constructWebhookEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          customer: string;
          subscription: string;
          customer_email: string;
          metadata: { email?: string; tier?: string };
        };

        const email = session.metadata?.email || session.customer_email;
        const tier = session.metadata?.tier || "pro"; // Default to "pro" if not specified

        if (email) {
          await db
            .prepare(
              `UPDATE subscribers
               SET tier = ?,
                   stripe_customer_id = ?,
                   stripe_subscription_id = ?,
                   updated_at = datetime('now')
               WHERE email = ?`
            )
            .bind(tier, session.customer, session.subscription, email.toLowerCase())
            .run();

          console.log(`Upgraded ${email} to ${tier} tier`);

          // Send welcome email for paid tier
          const subscriber = await db
            .prepare("SELECT appointment_type, preferred_region, unsubscribe_token FROM subscribers WHERE email = ?")
            .bind(email.toLowerCase())
            .first();

          if (subscriber && env.SENDGRID_API_KEY) {
            const siteUrl = env.SITE_URL || "https://scdmvappointments.com";
            const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=${subscriber.unsubscribe_token}`;

            await sendEmail(
              {
                apiKey: env.SENDGRID_API_KEY,
                fromEmail: env.SENDGRID_FROM_EMAIL || "alerts@scdmvappointments.com",
                fromName: "SC DMV Alerts",
              },
              {
                to: email.toLowerCase(),
                subject: `Welcome to SC DMV Alerts ${tier === "cdl" ? "CDL Pro" : "Pro"}!`,
                html: formatWelcomeEmailHTML({
                  tier: tier as "pro" | "cdl",
                  appointmentType: (subscriber.appointment_type as string) || "road_test",
                  region: (subscriber.preferred_region as string) || "any",
                  unsubscribeUrl,
                }),
                text: formatWelcomeEmailText({
                  tier: tier as "pro" | "cdl",
                  appointmentType: (subscriber.appointment_type as string) || "road_test",
                  region: (subscriber.preferred_region as string) || "any",
                  unsubscribeUrl,
                }),
              }
            );
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as {
          id: string;
          customer: string;
        };

        await db
          .prepare(
            `UPDATE subscribers
             SET tier = 'free',
                 stripe_subscription_id = NULL,
                 updated_at = datetime('now')
             WHERE stripe_subscription_id = ?`
          )
          .bind(subscription.id)
          .run();

        console.log(`Downgraded subscription ${subscription.id} to free`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as {
          id: string;
          status: string;
          metadata?: { tier?: string };
        };

        // Handle subscription status changes (past_due, unpaid, etc.)
        if (["past_due", "unpaid", "canceled"].includes(subscription.status)) {
          await db
            .prepare(
              `UPDATE subscribers
               SET tier = 'free',
                   updated_at = datetime('now')
               WHERE stripe_subscription_id = ?`
            )
            .bind(subscription.id)
            .run();

          console.log(`Subscription ${subscription.id} status: ${subscription.status}, downgraded to free`);
        } else if (subscription.status === "active") {
          // Restore to their paid tier (pro or cdl) from metadata, default to pro
          const tier = subscription.metadata?.tier || "pro";
          await db
            .prepare(
              `UPDATE subscribers
               SET tier = ?,
                   updated_at = datetime('now')
               WHERE stripe_subscription_id = ?`
            )
            .bind(tier, subscription.id)
            .run();

          console.log(`Subscription ${subscription.id} reactivated as ${tier}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Webhook failed" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
};
