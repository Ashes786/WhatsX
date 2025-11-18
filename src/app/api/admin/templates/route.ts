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

    const transformedTemplates = templates.map(template => ({
      ...template,
      creator_name: template.creator.name
    }))

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
      },
      include: {
        creator: {
          select: {
            name: true
          }
        }
      }
    })

    const transformedTemplate = {
      ...template,
      creator_name: template.creator.name
    }

    return NextResponse.json(transformedTemplate, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}