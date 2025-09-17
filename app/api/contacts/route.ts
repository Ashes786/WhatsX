import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createContactSchema, validatePhoneNumber, handleApiError, createSuccessResponse, AppError } from '@/lib/validation'
import { normalizePhoneNumber } from '@/lib/phone-utils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      throw new AppError('Unauthorized', 401)
    }

    const contacts = await db.contact.findMany({
      where: {
        owner_id: session.user.id
      },
      orderBy: {
        added_at: 'desc'
      }
    })

    return createSuccessResponse(contacts)
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
    const validatedData = createContactSchema.parse(body)
    const { name, raw_phone, label } = validatedData

    // Validate phone number
    const phoneValidation = validatePhoneNumber(raw_phone)
    if (!phoneValidation.valid) {
      throw new AppError(phoneValidation.error || 'Invalid phone number', 400)
    }

    // Normalize phone number
    const e164_phone = normalizePhoneNumber(raw_phone, session.user.default_country_code)

    // Check if contact with same normalized phone already exists
    const existingContact = await db.contact.findFirst({
      where: {
        owner_id: session.user.id,
        e164_phone: e164_phone
      }
    })

    if (existingContact) {
      throw new AppError('Contact with this phone number already exists', 400)
    }

    // Create contact
    const contact = await db.contact.create({
      data: {
        owner_id: session.user.id,
        name: name || null,
        raw_phone,
        e164_phone,
        label: label || null
      }
    })

    return createSuccessResponse(contact, 201)
  } catch (error) {
    return handleApiError(error)
  }
}