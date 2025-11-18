import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    throw new Error('No authenticated session found')
  }
  
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  
  return user
}