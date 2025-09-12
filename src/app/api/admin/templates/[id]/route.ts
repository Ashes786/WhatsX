import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const template = await db.template.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            name: true
          }
        }
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const transformedTemplate = {
      ...template,
      creator_name: template.creator.name
    }

    return NextResponse.json(transformedTemplate)
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, is_active } = body

    // Check if template exists
    const existingTemplate = await db.template.findUnique({
      where: { id: params.id }
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Check if title is already taken by another template
    if (title !== existingTemplate.title) {
      const titleTaken = await db.template.findFirst({
        where: {
          title,
          created_by: session.user.id,
          NOT: {
            id: params.id
          }
        }
      })

      if (titleTaken) {
        return NextResponse.json({ error: 'Template with this title already exists' }, { status: 400 })
      }
    }

    // Update template
    const template = await db.template.update({
      where: { id: params.id },
      data: {
        title,
        content,
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

    return NextResponse.json(transformedTemplate)
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if template exists
    const existingTemplate = await db.template.findUnique({
      where: { id: params.id }
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Delete template
    await db.template.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Template deleted successfully' })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}