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
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform to match expected format
    const transformedUsers = users.map(user => ({
      ...user,
      status: 'ACTIVE', // Default status since schema doesn't have it
      default_country_code: '+1', // Default country code since schema doesn't have it
      created_at: user.createdAt,
      updated_at: user.updatedAt
    }))

    return createSuccessResponse(transformedUsers)
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
    const { name, email, password, role } = validatedData

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
        password: passwordHash,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Transform to match expected format
    const transformedUser = {
      ...user,
      status: 'ACTIVE', // Default status since schema doesn't have it
      default_country_code: '+1', // Default country code since schema doesn't have it
      created_at: user.createdAt,
      updated_at: user.updatedAt
    }

    return createSuccessResponse(transformedUser, 201)
  } catch (error) {
    return handleApiError(error)
  }
}