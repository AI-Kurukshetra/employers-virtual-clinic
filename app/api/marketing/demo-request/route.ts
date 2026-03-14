import { createAdminSupabase } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      name = '',
      email = '',
      company = '',
      company_size = '',
      role = '',
      phone = '',
      message = '',
      source_page = '/contact',
    } = body ?? {}

    if (!name || !email) {
      return NextResponse.json({ success: false, message: 'Name and email are required' }, { status: 400 })
    }

    const supabase = createAdminSupabase()
    const { error } = await supabase.from('demo_requests').insert({
      name,
      email,
      company,
      company_size,
      role,
      phone,
      message,
      source_page,
    })

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "We'll be in touch within 24 hours" })
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 })
  }
}
