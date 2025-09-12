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

    // Get user's prepare-to-send jobs instead of messages
    const jobs = await db.prepareToSendJob.findMany({
      where: {
        user_id: session.user?.id,
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
        created_at: 'desc',
      },
    })

    // Transform jobs to match expected message format
    const messages = jobs.map(job => ({
      id: job.id,
      content: job.message_preview,
      status: 'DRAFT', // You can enhance this based on actual job status
      createdAt: job.created_at.toISOString(),
      recipients: job.recipients_final.map((phone, index) => ({
        contact: {
          id: `contact-${index}`, // This is a placeholder, you'd need proper contact IDs
          name: phone,
          phoneNumber: phone,
        },
        status: 'PENDING',
      })),
    }))

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
        owner_id: session.user?.id,
      },
    })

    if (contacts.length !== uniqueContactIds.length) {
      return NextResponse.json({ error: 'Some contacts not found or access denied' }, { status: 404 })
    }

    // Prepare recipient data for the job
    const recipientsRaw = contacts.map(c => c.raw_phone)
    const recipientsFinal = contacts.map(c => c.e164_phone || c.raw_phone)
    
    // Create prepare-to-send job instead of a message
    const job = await db.prepareToSendJob.create({
      data: {
        user_id: session.user?.id,
        template_id: templateId || null,
        message_preview: content,
        recipients_raw: JSON.stringify(recipientsRaw),
        recipients_final: JSON.stringify(recipientsFinal),
        duplicates: JSON.stringify([]), // No duplicates for now
      },
    })

    return NextResponse.json({
      id: job.id,
      content: job.message_preview,
      status: 'DRAFT',
      createdAt: job.created_at.toISOString(),
      recipients: recipientsFinal.map((phone, index) => ({
        contact: {
          id: contacts[index].id,
          name: contacts[index].name || phone,
          phoneNumber: phone,
        },
        status: 'PENDING',
      })),
    })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}