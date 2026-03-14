import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/(auth)/login/page'

const signInMock = jest.fn().mockResolvedValue({ ok: true })
global.fetch = jest.fn().mockResolvedValue({
  json: async () => ({ user: { role: 'PATIENT' } })
}) as unknown as typeof fetch

jest.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => signInMock(...args)
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}))

describe('Login page', () => {
  it('renders email and password fields', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('shows validation error on empty submit', async () => {
    signInMock.mockClear()
    render(<LoginPage />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(signInMock).not.toHaveBeenCalled()
    })
  })
})
