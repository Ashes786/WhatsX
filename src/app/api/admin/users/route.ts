import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createUserSchema, handleApiError, createSuccessResponse, AppError } from '@/lib/validation'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 401)
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        default_country_code: true,
        created_at: true,
        updated_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return createSuccessResponse(users)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 401)
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = createUserSchema.parse(body)
    const { name, email, password, role, status, default_country_code } = validatedData

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new AppError('User already exists', 400)
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password_hash: passwordHash,
        role,
        status,
        default_country_code: default_country_code || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        default_country_code: true,
        created_at: true,
        updated_at: true
      }
    })

    return createSuccessResponse(user, 201)
  } catch (error) {
    return handleApiError(error)
  }
}