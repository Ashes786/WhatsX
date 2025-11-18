import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { handleApiError, createSuccessResponse, AppError } from '@/lib/validation'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 401)
    }

    const user = await db.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Transform to match expected format
    const transformedUser = {
      ...user,
      default_country_code: '+1', // Default country code since schema doesn't have it
      created_at: user.createdAt,
      updated_at: user.createdAt // Use createdAt as fallback since updatedAt doesn't exist
    }

    return createSuccessResponse(transformedUser)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 401)
    }

    const body = await request.json()
    const { name, email, password, role, status, default_country_code } = body

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      throw new AppError('User not found', 404)
    }

    // Check if email is already taken by another user
    if (email !== existingUser.email) {
      const emailTaken = await db.user.findUnique({
        where: { email }
      })

      if (emailTaken) {
        throw new AppError('Email already taken', 400)
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      role,
      status
    }

    // Update password if provided
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12)
    }

    // Update user
    const user = await db.user.update({
      where: { id: params.id },
      data: updateData,
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

    return createSuccessResponse(transformedUser)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 401)
    }

    const body = await request.json()
    const { status, role } = body

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      throw new AppError('User not found', 404)
    }

    // Prepare update data
    const updateData: any = {}
    
    if (status !== undefined) {
      updateData.status = status
    }
    
    if (role !== undefined) {
      updateData.role = role
    }

    // Update user
    const user = await db.user.update({
      where: { id: params.id },
      data: updateData,
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

    return createSuccessResponse(transformedUser)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 401)
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      throw new AppError('User not found', 404)
    }

    // Delete user
    await db.user.delete({
      where: { id: params.id }
    })

    return createSuccessResponse({ message: 'User deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}