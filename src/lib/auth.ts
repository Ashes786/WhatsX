import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        try {
          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            console.log('User not found:', credentials.email)
            return null
          }

          if (user.status !== 'ACTIVE') {
            console.log('User account suspended:', credentials.email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!isPasswordValid) {
            console.log('Invalid password for:', credentials.email)
            return null
          }

          console.log('Successful login for:', credentials.email)
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            default_country_code: user.default_country_code
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.status = user.status
        token.default_country_code = user.default_country_code
        console.log('JWT token created for user:', user.email)
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.status = token.status as string
        session.user.default_country_code = token.default_country_code as string
        console.log('Session created for user:', session.user.email)
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login'
  },
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions)