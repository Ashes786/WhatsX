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
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const user = await db.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, session, trigger }) {
      console.log('JWT callback - trigger:', trigger)
      console.log('JWT callback - user:', user)
      console.log('JWT callback - session:', session)
      
      if (user) {
        token.role = user.role
        token.id = user.id
        console.log('JWT token created with user:', user)
      }
      console.log('JWT callback - token:', token)
      return token
    },
    async session({ session, token, user, trigger, newSession, isNewUser }) {
      console.log('Session callback - trigger:', trigger)
      console.log('Session callback - token:', token)
      console.log('Session callback - user:', user)
      
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        console.log('Session created with token:', token)
        console.log('Session created with user ID:', token.id, 'Role:', token.role)
      }
      console.log('Session callback - session:', session)
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode
}