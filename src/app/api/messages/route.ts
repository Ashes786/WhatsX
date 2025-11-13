import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messages = await db.message.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        deliveryLogs: {
          include: {
            contact: true
          }
        },
        mediaAttachments: true,
        schedule: true
      },
      orderBy: {
        createdAt: 'desc'
      }
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

    const { content, contactIds, scheduledAt, mediaAttachments } = await request.json()

    if (!content || !contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ error: 'Content and at least one contact are required' }, { status: 400 })
    }

    // Get unique contacts and remove duplicates
    const uniqueContactIds = [...new Set(contactIds)]
    
    // Verify all contacts belong to current user
    const contacts = await db.contact.findMany({
      where: {
        id: {
          in: uniqueContactIds,
        },
        userId: session.user.id,
      },
    })

    if (contacts.length !== uniqueContactIds.length) {
      return NextResponse.json({ error: 'Some contacts not found or access denied' }, { status: 404 })
    }

    // Create message
    const messageData: any = {
      userId: session.user.id,
      content,
      status: scheduledAt ? 'SCHEDULED' : 'SENT'
    }

    if (scheduledAt) {
      messageData.scheduledAt = new Date(scheduledAt)
    }

    const message = await db.message.create({
      data: messageData,
      include: {
        deliveryLogs: true,
        mediaAttachments: true,
        schedule: true
      }
    })

    // Create delivery logs for each contact
    const deliveryLogs = await Promise.all(
      contacts.map(contact =>
        db.deliveryLog.create({
          data: {
            messageId: message.id,
            contactId: contact.id,
            status: 'SENT'
          }
        })
      )
    )

    // Create schedule if needed
    if (scheduledAt) {
      await db.schedule.create({
        data: {
          messageId: message.id,
          sendAt: new Date(scheduledAt),
          repeatType: 'NONE',
          timezone: 'UTC',
          isActive: true
        }
      })
    }

    // Create media attachments if provided
    if (mediaAttachments && Array.isArray(mediaAttachments)) {
      await Promise.all(
        mediaAttachments.map((attachment: any) =>
          db.mediaAttachment.create({
            data: {
              messageId: message.id,
              fileUrl: attachment.fileUrl,
              fileType: attachment.fileType,
              sizeKb: attachment.sizeKb
            }
          })
        )
      )
    }

    // Return the complete message with all relations
    const completeMessage = await db.message.findUnique({
      where: { id: message.id },
      include: {
        deliveryLogs: {
          include: {
            contact: true
          }
        },
        mediaAttachments: true,
        schedule: true
      }
    })

    return NextResponse.json(completeMessage, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}