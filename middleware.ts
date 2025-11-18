import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Add any custom middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // This is called before a request is completed
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/admin/:path*',
  ],
};