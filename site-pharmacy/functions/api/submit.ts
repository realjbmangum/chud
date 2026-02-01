// Cloudflare Pages Function to handle pharmacy submission form
// POST /api/submit

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();

    // Extract form fields
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
    };

    // Collect services (checkboxes)
    const services = formData.getAll('services[]');
    const servicesJson = JSON.stringify(services);

    // Insert into database
    const db = context.env.DB;
    await db
      .prepare(
        `INSERT INTO pharmacy_submissions
        (business_name, contact_name, contact_email, phone, website,
         street_address, city, state, postal_code,
         ownership_type, chain_name, services_offered, description, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
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
        submission.description
      )
      .run();

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you! Your pharmacy has been submitted for review. We\'ll email you within 3 business days.',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Submission error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'There was an error submitting your pharmacy. Please try again or contact support.',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
