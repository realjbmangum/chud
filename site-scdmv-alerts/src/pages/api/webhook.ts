import type { APIRoute } from "astro";
import { constructWebhookEvent } from "../../lib/stripe";

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
          metadata: { email?: string };
        };

        const email = session.metadata?.email || session.customer_email;

        if (email) {
          await db
            .prepare(
              `UPDATE subscribers
               SET tier = 'paid',
                   stripe_customer_id = ?,
                   stripe_subscription_id = ?,
                   updated_at = datetime('now')
               WHERE email = ?`
            )
            .bind(session.customer, session.subscription, email.toLowerCase())
            .run();

          console.log(`Upgraded ${email} to paid tier`);
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
          await db
            .prepare(
              `UPDATE subscribers
               SET tier = 'paid',
                   updated_at = datetime('now')
               WHERE stripe_subscription_id = ?`
            )
            .bind(subscription.id)
            .run();
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
