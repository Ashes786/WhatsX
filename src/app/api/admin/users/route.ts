import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session-utils'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createUserSchema, handleApiError, createSuccessResponse, AppError } from '@/lib/validation'

export async function GET() {
  try {
    const adminUser = await requireAdmin()
    console.log('Admin Users GET - Current admin user:', adminUser)

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
    const adminUser = await requireAdmin()
    console.log('Admin Users POST - Current admin user:', adminUser)

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

    console.log('Admin Users POST - Created user:', user)
    console.log('Admin Users POST - Current admin user still:', adminUser)

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