export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const runtime = locals.runtime;
    const db = runtime.env.DB;
    const formData = await request.formData();

    const submission = {
      business_name: formData.get('business_name') as string,
      contact_name: formData.get('contact_name') as string,
      contact_email: formData.get('contact_email') as string,
      phone: formData.get('phone') as string || null,
      website: formData.get('website') as string || null,
      street_address: formData.get('street_address') as string || null,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      postal_code: formData.get('postal_code') as string || null,
      ownership_type: formData.get('ownership_type') as string,
      chain_name: formData.get('chain_name') as string || null,
      description: formData.get('description') as string || null,
      accreditation: formData.get('accreditation') as string || null,
    };

    if (!submission.business_name || !submission.contact_email || !submission.city || !submission.state) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please fill in all required fields.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const services = formData.getAll('services[]');
    const servicesJson = JSON.stringify(services);

    await db
      .prepare(
        `INSERT INTO pharmacy_submissions
        (business_name, contact_name, contact_email, phone, website,
         street_address, city, state, postal_code,
         ownership_type, chain_name, services_offered, description, accreditation, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
      )
      .bind(
        submission.business_name,
        submission.contact_name,
        submission.contact_email,
        submission.phone,
        submission.website,
        submission.street_address,
        submission.city,
        submission.state,
        submission.postal_code,
        submission.ownership_type,
        submission.chain_name,
        servicesJson,
        submission.description,
        submission.accreditation
      )
      .run();

    // Send email notification via SendGrid
    try {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${runtime.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            { to: [{ email: 'hello@indiepharmacy.com' }] },
          ],
          from: { email: 'hello@indiepharmacy.com', name: 'Indie Pharmacy' },
          subject: `New Pharmacy Submission: ${submission.business_name}`,
          content: [
            {
              type: 'text/plain',
              value: [
                `New pharmacy submission received:`,
                ``,
                `Business: ${submission.business_name}`,
                `Contact: ${submission.contact_name} (${submission.contact_email})`,
                `Location: ${submission.city}, ${submission.state} ${submission.postal_code || ''}`,
                `Phone: ${submission.phone || 'N/A'}`,
                `Website: ${submission.website || 'N/A'}`,
                `Ownership: ${submission.ownership_type}`,
                `Accreditation: ${submission.accreditation || 'N/A'}`,
                `Services: ${services.join(', ') || 'None listed'}`,
                `Description: ${submission.description || 'N/A'}`,
              ].join('\n'),
            },
          ],
        }),
      });
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }

    const isFetch = request.headers.get('accept')?.includes('application/json');

    if (isFetch) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Thank you! Your pharmacy has been submitted for review. We\'ll email you within 3 business days.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(null, {
      status: 302,
      headers: { 'Location': '/submit?success=true' },
    });
  } catch (error) {
    console.error('Submission error:', error);

    const isFetch = request.headers.get('accept')?.includes('application/json');

    if (isFetch) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'There was an error submitting your pharmacy. Please try again or contact support.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(null, {
      status: 302,
      headers: { 'Location': '/submit?error=true' },
    });
  }
};
