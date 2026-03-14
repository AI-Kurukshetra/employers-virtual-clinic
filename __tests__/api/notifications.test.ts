jest.mock('@/lib/api-auth', () => ({
  requireSession: async () => ({ error: new Response('Unauthorized', { status: 401 }), session: null })
}))

describe('Notifications API', () => {
  it('returns 401 when no session', async () => {
    const req = new Request('http://localhost/api/notifications') as unknown as never
    const { GET } = await import('@/app/api/notifications/route')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })
})
