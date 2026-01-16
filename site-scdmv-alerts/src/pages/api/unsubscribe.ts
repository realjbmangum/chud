import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response("Missing unsubscribe token", { status: 400 });
    }

    const subscriber = await db
      .prepare("SELECT id, email FROM subscribers WHERE unsubscribe_token = ?")
      .bind(token)
      .first();

    if (!subscriber) {
      return new Response(unsubscribePage("Invalid or expired unsubscribe link."), {
        status: 404,
        headers: { "Content-Type": "text/html" },
      });
    }

    await db
      .prepare("UPDATE subscribers SET status = 'unsubscribed', updated_at = datetime('now') WHERE unsubscribe_token = ?")
      .bind(token)
      .run();

    return new Response(unsubscribePage("You've been unsubscribed. You won't receive any more alerts."), {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });

  } catch (error) {
    console.error("Unsubscribe error:", error);
    return new Response(unsubscribePage("Something went wrong. Please try again."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
};

function unsubscribePage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribe - SC DMV Alerts</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f9fafb; }
    .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
    h1 { font-size: 1.5rem; margin: 0 0 1rem; color: #111827; }
    p { color: #6b7280; margin: 0 0 1.5rem; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <h1>SC DMV Alerts</h1>
    <p>${message}</p>
    <a href="/">Back to home</a>
  </div>
</body>
</html>`;
}
