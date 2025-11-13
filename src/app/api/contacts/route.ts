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
      throw new AppError('Unauthorized - Please login again', 401)
    }

    const contacts = await db.contact.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        addedAt: 'desc'
      }
    })

    // Transform to match expected format
    const transformedContacts = contacts.map(contact => ({
      ...contact,
      raw_phone: contact.phoneNumber,
      e164_phone: contact.phoneNumber,
      label: contact.label || '',
      added_at: contact.addedAt
    }))

    return createSuccessResponse(transformedContacts)
  } catch (error) {
    console.error('Contacts API Error:', error)
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
    const validatedData = createContactSchema.parse(body)
    const { name, raw_phone, label } = validatedData

    // Validate phone number
    const phoneValidation = validatePhoneNumber(raw_phone)
    if (!phoneValidation.valid) {
      throw new AppError(phoneValidation.error || 'Invalid phone number', 400)
    }

    // Normalize phone number (simplified for now)
    const e164_phone = raw_phone

    // Check if contact with same phone already exists
    const existingContact = await db.contact.findFirst({
      where: {
        userId: session.user.id,
        phoneNumber: e164_phone
      }
    })

    if (existingContact) {
      throw new AppError('Contact with this phone number already exists', 400)
    }

    // Create contact
    const contact = await db.contact.create({
      data: {
        userId: session.user.id,
        name: name || '',
        phoneNumber: raw_phone,
        label: label || null
      }
    })

    // Transform to match expected format
    const transformedContact = {
      ...contact,
      raw_phone: contact.phoneNumber,
      e164_phone: contact.phoneNumber,
      label: contact.label || '',
      added_at: contact.addedAt
    }

    return createSuccessResponse(transformedContact, 201)
  } catch (error) {
    console.error('Contacts POST API Error:', error)
    return handleApiError(error)
  }
}