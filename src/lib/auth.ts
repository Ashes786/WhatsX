import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          console.log('AUTH DEBUG: Authorize function called with email:', credentials?.email)
          
          if (!credentials?.email || !credentials?.password) {
            console.log('AUTH DEBUG: Missing credentials')
            return null
          }

          console.log('AUTH DEBUG: Looking for user in database...')
          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            console.log('AUTH DEBUG: User not found in database:', credentials.email)
            return null
          }

          console.log('AUTH DEBUG: User found, comparing passwords...')
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log('AUTH DEBUG: Invalid password for user:', credentials.email)
            return null
          }

          console.log('AUTH DEBUG: Password valid, returning user object')
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('AUTH DEBUG: Authorization error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  secret: process.env.NEXTAUTH_SECRET,
}