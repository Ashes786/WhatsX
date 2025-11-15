import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { MessageScheduler } from '@/lib/scheduler'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      content, 
      contactIds, 
      broadcastListId, 
      scheduledAt, 
      mediaAttachments,
      templateId,
      templateVariables 
    } = await request.json()

    if (!content || (!contactIds && !broadcastListId)) {
      return NextResponse.json({ 
        error: 'Content and either contactIds or broadcastListId are required' 
      }, { status: 400 })
    }

    let finalContactIds: string[] = []

    // Handle direct contact selection
    if (contactIds && Array.isArray(contactIds)) {
      finalContactIds = [...new Set(contactIds)] // Remove duplicates
    }

    // Handle broadcast list selection
    if (broadcastListId) {
      const broadcastList = await db.broadcastList.findUnique({
        where: { id: broadcastListId },
        include: {
          broadcastContacts: {
            include: {
              contact: true
            }
          }
        }
      })

      if (!broadcastList || broadcastList.userId !== session.user.id) {
        return NextResponse.json({ error: 'Broadcast list not found or access denied' }, { status: 404 })
      }

      const broadcastContactIds = broadcastList.broadcastContacts.map(bc => bc.contact.id)
      finalContactIds = [...new Set([...finalContactIds, ...broadcastContactIds])] // Merge and remove duplicates
    }

    if (finalContactIds.length === 0) {
      return NextResponse.json({ error: 'No contacts selected' }, { status: 400 })
    }

    // Verify all contacts belong to current user
    const contacts = await db.contact.findMany({
      where: {
        id: {
          in: finalContactIds,
        },
        userId: session.user.id,
      },
    })

    if (contacts.length !== finalContactIds.length) {
      return NextResponse.json({ error: 'Some contacts not found or access denied' }, { status: 404 })
    }

    // Process template if provided
    let finalContent = content
    if (templateId && templateVariables) {
      const template = await db.template.findUnique({
        where: { id: templateId }
      })

      if (template) {
        finalContent = template.content
        // Replace template variables
        Object.entries(templateVariables).forEach(([key, value]) => {
          finalContent = finalContent.replace(new RegExp(`{${key}}`, 'g'), String(value))
        })
      }
    }

    // Create message
    const messageData: any = {
      userId: session.user.id,
      content: finalContent,
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
      const schedule = await db.schedule.create({
        data: {
          messageId: message.id,
          sendAt: new Date(scheduledAt),
          repeatType: 'NONE',
          timezone: 'UTC',
          isActive: true
        }
      })

      // Add to queue for scheduled sending
      const scheduleResult = await MessageScheduler.scheduleMessage(
        message.id,
        contacts.map(c => c.id),
        session.user.id,
        new Date(scheduledAt)
      )

      if (!scheduleResult.success) {
        console.error('Failed to schedule message:', scheduleResult.error)
        // Don't fail the whole operation, just log it
      }
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

    return NextResponse.json({
      ...completeMessage,
      duplicateContactsRemoved: finalContactIds.length - contacts.length
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating bulk message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}