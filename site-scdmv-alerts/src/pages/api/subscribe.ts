import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const formData = await request.formData();

    const email = formData.get("email")?.toString().trim().toLowerCase();
    const phone = formData.get("phone")?.toString().trim() || null;
    const appointmentType = formData.get("appointment_type")?.toString();
    const region = formData.get("region")?.toString() || "any";

    // Validation
    if (!email || !appointmentType) {
      return new Response(
        JSON.stringify({ error: "Email and appointment type are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const validTypes = ["drivers_license", "real_id", "road_test", "motorcycle_test", "cdl", "state_id"];
    if (!validTypes.includes(appointmentType)) {
      return new Response(
        JSON.stringify({ error: "Invalid appointment type" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if email already exists
    const existing = await db
      .prepare("SELECT id, status FROM subscribers WHERE email = ?")
      .bind(email)
      .first();

    if (existing) {
      if (existing.status === "unsubscribed") {
        // Reactivate
        await db
          .prepare(
            `UPDATE subscribers
             SET status = 'active',
                 appointment_type = ?,
                 preferred_region = ?,
                 phone = ?,
                 updated_at = datetime('now')
             WHERE email = ?`
          )
          .bind(appointmentType, region, phone, email)
          .run();

        return new Response(
          JSON.stringify({ success: true, message: "Welcome back! Your subscription has been reactivated." }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "This email is already subscribed" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Insert new subscriber
    await db
      .prepare(
        `INSERT INTO subscribers (email, phone, appointment_type, preferred_region, tier, status)
         VALUES (?, ?, ?, ?, 'free', 'active')`
      )
      .bind(email, phone, appointmentType, region)
      .run();

    return new Response(
      JSON.stringify({ success: true, message: "You're subscribed! We'll notify you when appointments open up." }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Subscribe error:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
