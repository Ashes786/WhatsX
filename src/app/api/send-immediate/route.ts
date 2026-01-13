import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session-utils'
import { db } from '@/lib/db'
import { WhatsAppAPI } from '@/lib/whatsapp'

/**
 * Immediate message sender - bypasses queue, sends directly
 * Use this for testing or when Redis is not available
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, contactIds } = await request.json()

    if (!content || !contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ error: 'Content and at least one contact are required' }, { status: 400 })
    }

    // Get unique contacts
    const uniqueContactIds = [...new Set(contactIds)]

    // Get contacts
    const contacts = await db.contact.findMany({
      where: {
        id: {
          in: uniqueContactIds
        },
        userId: currentUser.id
      }
    })

    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No valid contacts found' }, { status: 404 })
    }

    const results = []

    // Send messages directly to each contact
    for (const contact of contacts) {
      try {
        console.log(`📤 Sending message to ${contact.phoneNumber}: ${content}`)

        // Send via WhatsApp API (uses WAWP automatically)
        const whatsappResult = await WhatsAppAPI.sendMessage(contact.phoneNumber, content)

        console.log(`✅ Result: ${whatsappResult.success ? 'SUCCESS' : 'FAILED'}`, whatsappResult)

        if (whatsappResult.success) {
          // Create message record
          const message = await db.message.create({
            data: {
              userId: currentUser.id,
              content: content,
              status: 'SENT'
            }
          })

          // Create delivery log
          await db.deliveryLog.create({
            data: {
              messageId: message.id,
              contactId: contact.id,
              status: 'DELIVERED',
              responseDetail: `Message ID: ${whatsappResult.messageId}`
            }
          })

          results.push({
            contact: contact.phoneNumber,
            status: 'DELIVERED',
            messageId: whatsappResult.messageId
          })
        } else {
          // Still create message record with failed status
          const message = await db.message.create({
            data: {
              userId: currentUser.id,
              content: content,
              status: 'FAILED'
            }
          })

          // Create delivery log with error
          await db.deliveryLog.create({
            data: {
              messageId: message.id,
              contactId: contact.id,
              status: 'FAILED',
              responseDetail: whatsappResult.error || 'Unknown error'
            }
          })

          results.push({
            contact: contact.phoneNumber,
            status: 'FAILED',
            error: whatsappResult.error
          })
        }
      } catch (error) {
        console.error(`❌ Error sending to ${contact.phoneNumber}:`, error)
        results.push({
          contact: contact.phoneNumber,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      total: results.length,
      delivered: results.filter(r => r.status === 'DELIVERED').length,
      failed: results.filter(r => r.status === 'FAILED').length,
      results
    })

  } catch (error) {
    console.error('Error in send-immediate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
