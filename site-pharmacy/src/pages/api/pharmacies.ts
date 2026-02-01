export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const db = locals.runtime.env.DB;

    const state = url.searchParams.get('state')?.toUpperCase();
    const city = url.searchParams.get('city');
    const services = url.searchParams.getAll('service');
    const accreditation = url.searchParams.get('accreditation');
    const ownership = url.searchParams.get('ownership');
    const acceptsGoodrx = url.searchParams.get('accepts_goodrx');
    const wheelchairAccessible = url.searchParams.get('wheelchair_accessible');
    const language = url.searchParams.get('language');
    const search = url.searchParams.get('q');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 24;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const bindings: any[] = [];

    if (state) {
      conditions.push('state = ?');
      bindings.push(state);
    }

    if (city) {
      conditions.push('LOWER(city) = LOWER(?)');
      bindings.push(city);
    }

    if (search) {
      conditions.push('(LOWER(business_name) LIKE LOWER(?) OR LOWER(city) LIKE LOWER(?))');
      bindings.push(`%${search}%`, `%${search}%`);
    }

    for (const svc of services) {
      conditions.push("services_offered LIKE ?");
      bindings.push(`%"${svc}"%`);
    }

    if (accreditation) {
      conditions.push('accreditation = ?');
      bindings.push(accreditation);
    }

    if (ownership) {
      conditions.push('ownership_type = ?');
      bindings.push(ownership);
    }

    if (acceptsGoodrx === '1') {
      conditions.push('accepts_goodrx = 1');
    }

    if (wheelchairAccessible === '1') {
      conditions.push('wheelchair_accessible = 1');
    }

    if (language) {
      conditions.push("languages_spoken LIKE ?");
      bindings.push(`%"${language}"%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await db
      .prepare(`SELECT COUNT(*) as total FROM pharmacies ${where}`)
      .bind(...bindings)
      .first();
    const total = (countResult as any)?.total || 0;

    // Get results
    const result = await db
      .prepare(`SELECT * FROM pharmacies ${where} ORDER BY featured DESC, business_name ASC LIMIT ? OFFSET ?`)
      .bind(...bindings, limit, offset)
      .all();

    return new Response(JSON.stringify({
      pharmacies: result.results || [],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Pharmacies API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch pharmacies' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
