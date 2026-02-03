import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  entry.count++
  return entry.count > RATE_LIMIT_MAX
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const { email } = await request.json()

    // Validate email
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Insert into Supabase
    const { error } = await supabase
      .from('waitlist')
      .insert({ email: email.toLowerCase().trim() })

    if (error) {
      // Handle duplicate email
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'You\'re already on the list!' },
          { status: 200 }
        )
      }

      if (process.env.NODE_ENV !== 'production') {
        console.error('Supabase error:', error)
      }
      return NextResponse.json(
        { error: 'Something went wrong' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Successfully joined waitlist' },
      { status: 200 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
