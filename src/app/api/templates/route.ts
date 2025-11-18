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

    // Get admin user IDs
    const adminUsers = await db.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    })
    
    const adminIds = adminUsers.map(admin => admin.id)

    // Get templates based on user role:
    // 1. If user is admin: show all admin templates (public) + their own templates (which are already included in admin templates)
    // 2. If user is not admin: show all admin templates (public) + their own templates (private)
    const templates = await db.template.findMany({
      where: {
        OR: [
          { created_by: { in: adminIds } }, // All admin templates (public to all users)
          ...(adminIds.includes(session.user.id) ? [] : [{ created_by: session.user.id }]) // User's own templates only if not admin
        ]
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    // Get creator information for each template
    const transformedTemplates = await Promise.all(
      templates.map(async (template) => {
        const creator = await db.user.findUnique({
          where: { id: template.created_by },
          select: { name: true, role: true }
        })
        
        return {
          id: template.id,
          title: template.title,
          content: template.content,
          created_at: template.created_at,
          created_by: template.created_by,
          creator_name: creator?.name || 'Unknown',
          is_admin_template: creator?.role === 'ADMIN'
        }
      })
    )

    return createSuccessResponse(transformedTemplates)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      throw new AppError('Unauthorized', 401)
    }

    const { title, content } = await request.json()

    if (!title || !content) {
      throw new AppError('Title and content are required', 400)
    }

    const template = await db.template.create({
      data: {
        created_by: session.user.id,
        title,
        content,
        is_active: true
      }
    })

    // Get creator information
    const creator = await db.user.findUnique({
      where: { id: template.created_by },
      select: { name: true, role: true }
    })

    const transformedTemplate = {
      id: template.id,
      title: template.title,
      content: template.content,
      created_at: template.created_at,
      created_by: template.created_by,
      creator_name: creator?.name || 'Unknown',
      is_admin_template: creator?.role === 'ADMIN'
    }

    return createSuccessResponse(transformedTemplate, 201)
  } catch (error) {
    return handleApiError(error)
  }
}