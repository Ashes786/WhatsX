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

    const contact = await db.contact.findFirst({
      where: {
        id: params.id,
        owner_id: session.user.id
      }
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Error fetching contact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, raw_phone, label } = body

    // Check if contact exists and belongs to user
    const existingContact = await db.contact.findFirst({
      where: {
        id: params.id,
        owner_id: session.user.id
      }
    })

    if (!existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Normalize phone number if provided
    let e164_phone = existingContact.e164_phone
    if (raw_phone && raw_phone !== existingContact.raw_phone) {
      e164_phone = normalizePhoneNumber(raw_phone, session.user.default_country_code)
      
      // Check if new phone number conflicts with existing contacts
      const conflictingContact = await db.contact.findFirst({
        where: {
          owner_id: session.user.id,
          e164_phone: e164_phone,
          NOT: {
            id: params.id
          }
        }
      })

      if (conflictingContact) {
        return NextResponse.json({ error: 'Contact with this phone number already exists' }, { status: 400 })
      }
    }

    // Update contact
    const contact = await db.contact.update({
      where: { id: params.id },
      data: {
        name: name || null,
        raw_phone: raw_phone || existingContact.raw_phone,
        e164_phone,
        label: label || null
      }
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if contact exists and belongs to user
    const existingContact = await db.contact.findFirst({
      where: {
        id: params.id,
        owner_id: session.user.id
      }
    })

    if (!existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Delete contact
    await db.contact.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Contact deleted successfully' })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function normalizePhoneNumber(rawPhone: string, defaultCountryCode?: string): string | null {
  // Strip all non-digit and non-plus characters
  let s = rawPhone.replace(/[^\d+]/g, '')
  
  if (!s) return null
  
  // If it begins with "00", replace leading "00" with "+"
  if (s.startsWith('00')) {
    s = '+' + s.substring(2)
  }
  
  // If it begins with "+", keep it
  if (s.startsWith('+')) {
    return s
  }
  
  // If it begins with a single "0" and default country code exists
  if (s.startsWith('0') && defaultCountryCode) {
    return defaultCountryCode + s.substring(1)
  }
  
  // If it's a plain local number and default country code exists
  if (defaultCountryCode && s.length <= 10) {
    return defaultCountryCode + s
  }
  
  // Return as-is (best effort)
  return s
}