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
      throw new AppError('Unauthorized', 401)
    }

    // Get recent prepare-to-send jobs for the current user
    const jobs = await db.prepareToSendJob.findMany({
      where: {
        user_id: session.user.id
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 10, // Limit to last 10 jobs
      select: {
        id: true,
        message_preview: true,
        recipients_final: true,
        created_at: true,
        template_id: true
      }
    })

    // Parse JSON fields
    const parsedJobs = jobs.map(job => ({
      ...job,
      recipients_final: JSON.parse(job.recipients_final),
      created_at: job.created_at.toISOString()
    }))

    return createSuccessResponse(parsedJobs)
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
      if (!template.is_active) {
        throw new AppError('Template is not active', 400)
      }
      templateContent = template.content
    }

    // Get user's existing contacts for duplicate checking
    const userContacts = await db.contact.findMany({
      where: {
        owner_id: session.user.id
      },
      select: {
        e164_phone: true
      }
    })

    const ownerContactsE164 = userContacts
      .map(contact => contact.e164_phone)
      .filter((phone): phone is string => phone !== null)

    // Perform deduplication
    const dedupeResult = dedupeRecipients(
      recipients_raw,
      ownerContactsE164,
      default_country_code || session.user.default_country_code || undefined
    )

    // Generate message preview
    const messagePreview = generateMessagePreview(templateContent, message_override)

    // Save the prepare-to-send job (optional, for audit purposes)
    await db.prepareToSendJob.create({
      data: {
        user_id: session.user.id,
        template_id: template_id || null,
        message_preview,
        recipients_raw: JSON.stringify(recipients_raw),
        recipients_final: JSON.stringify(dedupeResult.recipients_final),
        duplicates: JSON.stringify(dedupeResult.duplicates)
      }
    })

    return createSuccessResponse({
      recipients_final: dedupeResult.recipients_final,
      duplicates: dedupeResult.duplicates,
      message_preview
    })

  } catch (error) {
    return handleApiError(error)
  }
}