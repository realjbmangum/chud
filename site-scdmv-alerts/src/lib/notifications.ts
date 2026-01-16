/**
 * Notification senders for Twilio SMS and Resend Email
 * Using REST APIs directly for Cloudflare Workers compatibility
 */

// ============ Twilio SMS ============

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export async function sendSMS(
  config: TwilioConfig,
  to: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;

  const auth = btoa(`${config.accountSid}:${config.authToken}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: formatPhoneNumber(to),
        From: config.fromNumber,
        Body: body,
      }).toString(),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, messageId: data.sid };
    } else {
      return { success: false, error: data.message || "Failed to send SMS" };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "SMS error" };
  }
}

function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");

  // Add +1 if not present (assuming US)
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return `+${digits}`;
}

// ============ Resend Email ============

interface ResendConfig {
  apiKey: string;
  fromEmail?: string;
}

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(
  config: ResendConfig,
  params: EmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const url = "https://api.resend.com/emails";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.fromEmail || "SC DMV Alerts <alerts@scdmvalerts.com>",
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, messageId: data.id };
    } else {
      return { success: false, error: data.message || "Failed to send email" };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Email error" };
  }
}

// ============ Notification Templates ============

interface AppointmentInfo {
  type?: string;
  location?: string;
  date?: string;
  time?: string;
  bookingUrl?: string;
}

export function formatSMSMessage(appointments: AppointmentInfo[]): string {
  const apt = appointments[0]; // Use first appointment for SMS (keep it short)

  let msg = "SC DMV Alert: Appointment available";

  if (apt.type) {
    msg = `SC DMV: ${formatAppointmentType(apt.type)} appt available`;
  }

  if (apt.date) {
    msg += ` on ${apt.date}`;
  }

  if (apt.location) {
    msg += ` at ${apt.location}`;
  }

  msg += ". Book now: https://public.scscheduler.com/";

  if (appointments.length > 1) {
    msg += ` (+${appointments.length - 1} more)`;
  }

  return msg;
}

export function formatEmailHTML(
  appointments: AppointmentInfo[],
  unsubscribeUrl: string
): string {
  const appointmentList = appointments
    .slice(0, 10) // Limit to 10 appointments
    .map(
      (apt) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${formatAppointmentType(apt.type || "Unknown")}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${apt.location || "Any Location"}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${apt.date || "Check site"} ${apt.time || ""}
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">SC DMV Appointment Available!</h1>
  </div>

  <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin-top: 0;">Good news! We found ${appointments.length} appointment${appointments.length > 1 ? "s" : ""} available at SC DMV.</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background: #f9fafb;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Type</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Location</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Date/Time</th>
        </tr>
      </thead>
      <tbody>
        ${appointmentList}
      </tbody>
    </table>

    <a href="https://public.scscheduler.com/" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
      Book Now
    </a>

    <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
      Appointments fill up fast, so don't wait!
    </p>
  </div>

  <div style="padding: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">
      You're receiving this because you signed up for SC DMV Alerts.<br>
      <a href="${unsubscribeUrl}" style="color: #6b7280;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
  `;
}

export function formatEmailText(
  appointments: AppointmentInfo[],
  unsubscribeUrl: string
): string {
  let text = `SC DMV Appointment Available!\n\n`;
  text += `We found ${appointments.length} appointment(s) available:\n\n`;

  for (const apt of appointments.slice(0, 10)) {
    text += `- ${formatAppointmentType(apt.type || "Unknown")}`;
    if (apt.location) text += ` at ${apt.location}`;
    if (apt.date) text += ` on ${apt.date}`;
    if (apt.time) text += ` at ${apt.time}`;
    text += "\n";
  }

  text += `\nBook now: https://public.scscheduler.com/\n\n`;
  text += `---\nUnsubscribe: ${unsubscribeUrl}`;

  return text;
}

function formatAppointmentType(type: string): string {
  const typeMap: Record<string, string> = {
    drivers_license: "Driver's License",
    real_id: "REAL ID",
    road_test: "Road Test",
    motorcycle_test: "Motorcycle Test",
    cdl: "CDL",
    state_id: "State ID",
  };

  return typeMap[type] || type;
}
