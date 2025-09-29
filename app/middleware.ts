import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
})

export const config = {
  matcher: [
    '/api/uploads/:path*',
    '/api/generation/:path*',
    '/api/results/:path*',
    '/api/user/:path*',
    '/dashboard'
  ]
}