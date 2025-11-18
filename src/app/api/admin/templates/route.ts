import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all templates (admin can see all templates for management purposes)
    const templates = await db.template.findMany({
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
          ...template,
          creator_name: creator?.name || 'Unknown',
          is_admin_template: creator?.role === 'ADMIN'
        }
      })
    )

    return NextResponse.json(transformedTemplates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, is_active } = body

    // Check if template with same title already exists for this admin
    const existingTemplate = await db.template.findFirst({
      where: {
        title,
        created_by: session.user.id
      }
    })

    if (existingTemplate) {
      return NextResponse.json({ error: 'Template with this title already exists' }, { status: 400 })
    }

    // Create template
    const template = await db.template.create({
      data: {
        title,
        content,
        created_by: session.user.id,
        is_active: is_active ?? true
      }
    })

    // Get creator information
    const creator = await db.user.findUnique({
      where: { id: template.created_by },
      select: { name: true, role: true }
    })

    const transformedTemplate = {
      ...template,
      creator_name: creator?.name || 'Unknown',
      is_admin_template: creator?.role === 'ADMIN'
    }

    return NextResponse.json(transformedTemplate, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}