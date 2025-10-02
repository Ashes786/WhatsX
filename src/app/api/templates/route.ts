import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { handleApiError, createSuccessResponse, AppError } from '@/lib/validation'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      throw new AppError('Unauthorized', 401)
    }

    const templates = await db.template.findMany({
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the response to include creator_name
    const transformedTemplates = templates.map(template => ({
      id: template.id,
      name: template.name,
      content: template.content,
      category: template.category,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      userId: template.userId,
      creator_name: template.user.name
    }))

    return createSuccessResponse(transformedTemplates)
  } catch (error) {
    return handleApiError(error)
  }
}