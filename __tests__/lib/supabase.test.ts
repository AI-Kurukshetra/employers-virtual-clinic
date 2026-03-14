import { createBrowserSupabase } from '@/lib/supabase/client'

describe('Supabase client', () => {
  it('creates browser client without throwing', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
    expect(() => createBrowserSupabase()).not.toThrow()
  })
})
