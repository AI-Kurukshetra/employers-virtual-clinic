import { render, screen } from '@testing-library/react'
import RegisterPage from '@/app/(auth)/register/page'

jest.mock('@/lib/supabase/client', () => ({
  createBrowserSupabase: () => ({
    auth: { signUp: jest.fn().mockResolvedValue({ data: {}, error: null }) }
  })
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}))

describe('Register page', () => {
  it('renders step 1 fields', () => {
    render(<RegisterPage />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })
})
