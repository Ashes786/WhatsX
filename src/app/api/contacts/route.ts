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

    const contacts = await db.contact.findMany({
      where: {
        userId: session.user?.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contacts: contactList } = await request.json()

    if (!contactList || !Array.isArray(contactList)) {
      return NextResponse.json({ error: 'Invalid contacts data' }, { status: 400 })
    }

    const results = {
      added: [],
      duplicates: [],
      errors: []
    }

    for (const contactData of contactList) {
      try {
        const { name, phoneNumber, label } = contactData

        if (!name || !phoneNumber) {
          results.errors.push({ contact: contactData, error: 'Name and phone number are required' })
          continue
        }

        // Check for duplicate contact for this user
        const existingContact = await db.contact.findFirst({
          where: {
            userId: session.user?.id,
            phoneNumber: phoneNumber.trim(),
          },
        })

        if (existingContact) {
          results.duplicates.push({ contact: contactData, existing: existingContact })
          continue
        }

        // Create new contact
        const newContact = await db.contact.create({
          data: {
            name: name.trim(),
            phoneNumber: phoneNumber.trim(),
            label: label?.trim() || null,
            userId: session.user?.id,
          },
        })

        results.added.push(newContact)
      } catch (error) {
        results.errors.push({ contact: contactData, error: 'Failed to create contact' })
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error creating contacts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}