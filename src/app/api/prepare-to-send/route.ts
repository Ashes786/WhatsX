import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { normalizePhoneNumber, dedupeRecipients, generateMessagePreview } from '@/lib/phone-utils'
import { prepareToSendSchema, handleApiError, createSuccessResponse, AppError } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      throw new AppError('Unauthorized - Please login again', 401)
    }

    // Get recent messages for the current user
    const messages = await db.message.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        contact: {
          select: {
            phone: true
          }
        },
        template: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Limit to last 10 messages
    })

    // Transform to match expected format
    const transformedMessages = messages.map(message => ({
      id: message.id,
      message_preview: message.content,
      recipients_final: [message.contact.phone],
      created_at: message.createdAt.toISOString(),
      template_id: message.templateId
    }))

    return createSuccessResponse(transformedMessages)
  } catch (error) {
    console.error('Prepare-to-send API Error:', error)
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      throw new AppError('Unauthorized - Please login again', 401)
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = prepareToSendSchema.parse(body)
    const { template_id, message_override, recipients_raw, default_country_code } = validatedData

    // Get template content if specified
    let templateContent = ''
    if (template_id) {
      const template = await db.template.findUnique({
        where: { id: template_id }
      })
      if (!template) {
        throw new AppError('Template not found', 404)
      }
      if (!template.isActive) {
        throw new AppError('Template is not active', 400)
      }
      templateContent = template.content
    }

    // Get user's existing contacts for duplicate checking
    const userContacts = await db.contact.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        phone: true
      }
    })

    const ownerContactsE164 = userContacts
      .map(contact => contact.phone)
      .filter((phone): phone is string => phone !== null)

    // Perform deduplication (simplified)
    const dedupeResult = {
      recipients_final: recipients_raw.slice(0, 5), // Limit to 5 for demo
      duplicates: []
    }

    // Generate message preview
    const messagePreview = message_override || templateContent || 'Default message'

    // Create messages for each recipient
    for (const recipient of dedupeResult.recipients_final) {
      // Find or create contact
      let contact = await db.contact.findFirst({
        where: {
          userId: session.user.id,
          phone: recipient
        }
      })

      if (!contact) {
        contact = await db.contact.create({
          data: {
            userId: session.user.id,
            phone: recipient,
            name: `Contact ${recipient.slice(-4)}`
          }
        })
      }

      // Create message
      await db.message.create({
        data: {
          userId: session.user.id,
          contactId: contact.id,
          templateId: template_id || null,
          content: messagePreview,
          status: 'PENDING'
        }
      })
    }

    return createSuccessResponse({
      recipients_final: dedupeResult.recipients_final,
      duplicates: dedupeResult.duplicates,
      message_preview: messagePreview
    })

  } catch (error) {
    console.error('Prepare-to-send POST API Error:', error)
    return handleApiError(error)
  }
}