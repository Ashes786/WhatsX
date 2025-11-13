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
      title: template.title,
      content: template.content,
      createdAt: template.createdAt,
      userId: template.userId,
      creator_name: template.user.name
    }))

    return createSuccessResponse(transformedTemplates)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized - Admin access required', 401)
    }

    const { title, content } = await request.json()

    if (!title || !content) {
      throw new AppError('Title and content are required', 400)
    }

    const template = await db.template.create({
      data: {
        userId: session.user.id,
        title,
        content
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    })

    const transformedTemplate = {
      id: template.id,
      title: template.title,
      content: template.content,
      createdAt: template.createdAt,
      userId: template.userId,
      creator_name: template.user.name
    }

    return createSuccessResponse(transformedTemplate, 201)
  } catch (error) {
    return handleApiError(error)
  }
}