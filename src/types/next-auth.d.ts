import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      status: string
      default_country_code?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    status: string
    default_country_code?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    status: string
    default_country_code?: string
  }
}