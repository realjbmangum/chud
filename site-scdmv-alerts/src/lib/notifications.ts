/**
 * Notification senders for Twilio SMS and SendGrid Email
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

// ============ SendGrid Email ============

interface SendGridConfig {
  apiKey: string;
  fromEmail?: string;
  fromName?: string;
}

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(
  config: SendGridConfig,
  params: EmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const fromEmail = config.fromEmail || "alerts@scdmvappointments.com";
  const fromName = config.fromName || "SC DMV Alerts";

  const body = JSON.stringify({
    personalizations: [
      {
        to: [{ email: params.to }],
      },
    ],
    from: {
      email: fromEmail,
      name: fromName,
    },
    subject: params.subject,
    content: [
      {
        type: "text/plain",
        value: params.text || params.subject,
      },
      {
        type: "text/html",
        value: params.html,
      },
    ],
  });

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body,
    });

    if (response.ok || response.status === 202) {
      // SendGrid returns 202 Accepted on success
      const messageId = response.headers.get("X-Message-Id") || undefined;
      return { success: true, messageId };
    } else {
      const responseText = await response.text();
      let errorMsg = `HTTP ${response.status}`;
      try {
        const data = JSON.parse(responseText);
        if (data.errors && data.errors.length > 0) {
          errorMsg = data.errors.map((e: { message: string }) => e.message).join(", ");
        }
      } catch {
        errorMsg = responseText || errorMsg;
      }
      return { success: false, error: errorMsg };
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

// ============ Welcome Email ============

interface WelcomeEmailParams {
  tier: "free" | "pro" | "cdl";
  appointmentType: string;
  region: string;
  unsubscribeUrl: string;
}

export function formatWelcomeEmailHTML(params: WelcomeEmailParams): string {
  const { tier, appointmentType, region, unsubscribeUrl } = params;
  const typeName = formatAppointmentType(appointmentType);
  const regionName = region === "any" ? "all SC locations" : formatRegionName(region);

  const tierDetails = {
    free: { name: "Free", alerts: "1 email alert per day", price: null },
    pro: { name: "Pro", alerts: "up to 3 email alerts per day", price: "$5.99/month" },
    cdl: { name: "CDL Pro", alerts: "up to 5 email alerts per day", price: "$19.99/month" },
  }[tier];

  const cancelSection = tier !== "free" ? `
    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <h3 style="margin: 0 0 8px 0; color: #92400e; font-size: 14px;">Cancel Your Subscription</h3>
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        You can cancel anytime — no fees, no questions asked. Your alerts continue until the end of your billing period.
        Email <a href="mailto:support@scdmvappointments.com" style="color: #92400e; font-weight: 600;">support@scdmvappointments.com</a> and we'll cancel it immediately.
      </p>
    </div>` : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
  <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <img src="https://scdmvappointments.com/scdmvappt-logo.png" alt="SC DMV Alerts" style="width: 48px; height: 48px; margin-bottom: 12px;" />
    <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to SC DMV Alerts!</h1>
    <p style="color: #bfdbfe; margin: 8px 0 0 0; font-size: 14px;">${tierDetails.name} Plan</p>
  </div>

  <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin-top: 0; font-size: 16px;">Thanks for signing up! We're now monitoring SC DMV appointments for you.</p>

    <div style="background: #f0f9ff; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Your Alert Settings</h3>
      <table style="width: 100%; font-size: 14px;">
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Appointment Type</td>
          <td style="padding: 4px 0; font-weight: 600;">${typeName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Region</td>
          <td style="padding: 4px 0; font-weight: 600;">${regionName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Alert Frequency</td>
          <td style="padding: 4px 0; font-weight: 600;">${tierDetails.alerts}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Alert Hours</td>
          <td style="padding: 4px 0; font-weight: 600;">6 AM – 6 PM Eastern</td>
        </tr>${tier !== "free" ? `
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Billing</td>
          <td style="padding: 4px 0; font-weight: 600;">${tierDetails.price}</td>
        </tr>` : ""}
      </table>
    </div>

    <h3 style="font-size: 16px; margin: 24px 0 12px 0;">What happens next?</h3>
    <ol style="padding-left: 20px; color: #4b5563;">
      <li style="margin-bottom: 8px;">We check all 65 SC DMV locations every hour for new openings</li>
      <li style="margin-bottom: 8px;">When appointments matching your preferences open up, you'll get an email</li>
      <li style="margin-bottom: 8px;">Click the link in the email to book directly on the SC DMV site</li>
    </ol>

    <p style="color: #6b7280; font-size: 14px;">
      <strong>Tip:</strong> Appointments fill up fast! When you get an alert, book within a few minutes for the best chance of getting your preferred time.
    </p>

    ${cancelSection}

    <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <h3 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Stop Email Alerts</h3>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        Don't want alerts anymore? Click the unsubscribe link at the bottom of any alert email, or
        <a href="${unsubscribeUrl}" style="color: #2563eb;">unsubscribe now</a>.
        ${tier !== "free" ? "Note: unsubscribing stops alerts but does not cancel your subscription. Email support to cancel billing." : ""}
      </p>
    </div>
  </div>

  <div style="padding: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">
      SC DMV Alerts · <a href="https://scdmvappointments.com" style="color: #9ca3af;">scdmvappointments.com</a><br>
      <a href="${unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe</a> · <a href="https://scdmvappointments.com/privacy" style="color: #9ca3af;">Privacy</a> · <a href="https://scdmvappointments.com/terms" style="color: #9ca3af;">Terms</a>
    </p>
  </div>
</body>
</html>
  `;
}

export function formatWelcomeEmailText(params: WelcomeEmailParams): string {
  const { tier, appointmentType, region, unsubscribeUrl } = params;
  const typeName = formatAppointmentType(appointmentType);
  const regionName = region === "any" ? "all SC locations" : formatRegionName(region);

  const tierDetails = {
    free: { name: "Free", alerts: "1 email alert per day", price: null },
    pro: { name: "Pro", alerts: "up to 3 email alerts per day", price: "$5.99/month" },
    cdl: { name: "CDL Pro", alerts: "up to 5 email alerts per day", price: "$19.99/month" },
  }[tier];

  let text = `Welcome to SC DMV Alerts! (${tierDetails.name} Plan)\n\n`;
  text += `Thanks for signing up! We're now monitoring SC DMV appointments for you.\n\n`;
  text += `YOUR ALERT SETTINGS\n`;
  text += `- Appointment Type: ${typeName}\n`;
  text += `- Region: ${regionName}\n`;
  text += `- Alert Frequency: ${tierDetails.alerts}\n`;
  text += `- Alert Hours: 6 AM - 6 PM Eastern\n`;
  if (tierDetails.price) text += `- Billing: ${tierDetails.price}\n`;
  text += `\nWHAT HAPPENS NEXT\n`;
  text += `1. We check all 65 SC DMV locations every hour for new openings\n`;
  text += `2. When appointments matching your preferences open up, you'll get an email\n`;
  text += `3. Click the link in the email to book directly on the SC DMV site\n\n`;
  text += `Tip: Appointments fill up fast! Book within a few minutes of getting an alert.\n\n`;
  if (tier !== "free") {
    text += `CANCEL YOUR SUBSCRIPTION\n`;
    text += `You can cancel anytime - no fees, no questions asked.\n`;
    text += `Email support@scdmvappointments.com and we'll cancel it immediately.\n\n`;
  }
  text += `STOP EMAIL ALERTS\n`;
  text += `Unsubscribe: ${unsubscribeUrl}\n`;
  if (tier !== "free") {
    text += `Note: unsubscribing stops alerts but does not cancel your subscription. Email support to cancel billing.\n`;
  }
  text += `\n---\nSC DMV Alerts · scdmvappointments.com\n`;

  return text;
}

function formatRegionName(region: string): string {
  const regionMap: Record<string, string> = {
    greenville: "Greenville Area",
    columbia: "Columbia Area",
    charleston: "Charleston Area",
    myrtle_beach: "Myrtle Beach Area",
    spartanburg: "Spartanburg Area",
    florence: "Florence Area",
    rock_hill: "Rock Hill Area",
    aiken: "Aiken Area",
  };
  return regionMap[region] || region;
}

function formatAppointmentType(type: string): string {
  const typeMap: Record<string, string> = {
    road_test: "Road Test (Class D)",
    motorcycle_test: "Motorcycle Test",
    cdl_a: "CDL Class A",
    cdl_b: "CDL Class B",
    cdl_c: "CDL Class C",
    class_e: "Class E (Non-Commercial)",
  };

  return typeMap[type] || type;
}
