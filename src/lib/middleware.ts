import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function requireRole(request: NextRequest, requiredRole: string) {
  const token = await getToken({ req: request })
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  if (token.role !== requiredRole && token.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  return null // Continue with the request
}

export async function requireAuth(request: NextRequest) {
  const token = await getToken({ req: request })
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  return null // Continue with the request
}

export async function getUserFromRequest(request: NextRequest) {
  const token = await getToken({ req: request })
  return token
}