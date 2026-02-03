import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get Supabase credentials from environment
    const supabaseUrl = import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = import.meta.env.SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert email into waitlist table
    const { error } = await supabase
      .from('waitlist')
      .insert([
        {
          email: email.toLowerCase().trim(),
          source: 'landing_page',
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      // Handle duplicate email gracefully
      if (error.code === '23505') {
        return new Response(JSON.stringify({ message: 'Already on the waitlist!' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: 'Failed to join waitlist' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Successfully joined waitlist!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
