// Stripe API helpers for Cloudflare Workers
// Using REST API directly instead of SDK (better Workers compatibility)

const STRIPE_API = "https://api.stripe.com/v1";

export async function createCheckoutSession(
  secretKey: string,
  params: {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail: string;
    metadata?: Record<string, string>;
  }
): Promise<{ id: string; url: string }> {
  const body = new URLSearchParams({
    "mode": "subscription",
    "payment_method_types[0]": "card",
    "line_items[0][price]": params.priceId,
    "line_items[0][quantity]": "1",
    "success_url": params.successUrl,
    "cancel_url": params.cancelUrl,
    "customer_email": params.customerEmail,
    "allow_promotion_codes": "true",
  });

  if (params.metadata) {
    Object.entries(params.metadata).forEach(([key, value]) => {
      body.append(`metadata[${key}]`, value);
    });
  }

  const response = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to create checkout session");
  }

  return response.json();
}

export async function constructWebhookEvent(
  payload: string,
  signature: string,
  webhookSecret: string
): Promise<StripeEvent> {
  // Verify webhook signature
  const encoder = new TextEncoder();
  const parts = signature.split(",");

  let timestamp = "";
  let signatures: string[] = [];

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === "t") timestamp = value;
    if (key === "v1") signatures.push(value);
  }

  if (!timestamp || signatures.length === 0) {
    throw new Error("Invalid signature format");
  }

  // Check timestamp (allow 5 min tolerance)
  const timestampAge = Math.floor(Date.now() / 1000) - parseInt(timestamp);
  if (timestampAge > 300) {
    throw new Error("Webhook timestamp too old");
  }

  // Compute expected signature
  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedPayload)
  );

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  // Verify signature matches
  const isValid = signatures.some(sig => sig === expectedSignature);
  if (!isValid) {
    throw new Error("Invalid webhook signature");
  }

  return JSON.parse(payload);
}

export async function getSubscription(
  secretKey: string,
  subscriptionId: string
): Promise<StripeSubscription> {
  const response = await fetch(`${STRIPE_API}/subscriptions/${subscriptionId}`, {
    headers: {
      "Authorization": `Bearer ${secretKey}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get subscription");
  }

  return response.json();
}

// Types
export interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

export interface StripeSubscription {
  id: string;
  status: string;
  customer: string;
  metadata: Record<string, string>;
}
