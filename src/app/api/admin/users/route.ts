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
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform to match expected format
    const transformedUsers = users.map(user => ({
      ...user,
      default_country_code: '+1', // Default country code since schema doesn't have it
      created_at: user.createdAt,
      updated_at: user.createdAt // Use createdAt as fallback since updatedAt doesn't exist
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
        passwordHash,
        role,
        status: 'ACTIVE' // Default status
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    })

    // Transform to match expected format
    const transformedUser = {
      ...user,
      default_country_code: '+1', // Default country code since schema doesn't have it
      created_at: user.createdAt,
      updated_at: user.createdAt // Use createdAt as fallback since updatedAt doesn't exist
    }

    return createSuccessResponse(transformedUser, 201)
  } catch (error) {
    return handleApiError(error)
  }
}