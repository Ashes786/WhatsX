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
        creator: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    // Transform the response to include creator_name
    const transformedTemplates = templates.map(template => ({
      ...template,
      creator_name: template.creator.name
    }))

    return createSuccessResponse(transformedTemplates)
  } catch (error) {
    return handleApiError(error)
  }
}