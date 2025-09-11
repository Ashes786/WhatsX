import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messages = await db.message.findMany({
      where: {
        userId: session.user?.id,
      },
      include: {
        template: true,
        recipients: {
          include: {
            contact: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, contactIds, templateId } = await request.json()

    if (!content || !contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ error: 'Content and at least one contact are required' }, { status: 400 })
    }

    // Get unique contacts and remove duplicates
    const uniqueContactIds = [...new Set(contactIds)]
    
    // Verify all contacts belong to the current user
    const contacts = await db.contact.findMany({
      where: {
        id: {
          in: uniqueContactIds,
        },
        userId: session.user?.id,
      },
    })

    if (contacts.length !== uniqueContactIds.length) {
      return NextResponse.json({ error: 'Some contacts not found or access denied' }, { status: 404 })
    }

    // Create message with recipients
    const message = await db.message.create({
      data: {
        content,
        userId: session.user?.id,
        templateId: templateId || null,
        status: 'DRAFT',
        recipients: {
          create: contacts.map(contact => ({
            contactId: contact.id,
            status: 'PENDING',
          })),
        },
      },
      include: {
        template: true,
        recipients: {
          include: {
            contact: true,
          },
        },
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}