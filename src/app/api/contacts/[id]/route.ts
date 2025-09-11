import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, phoneNumber, label } = await request.json()
    const { id } = params

    // Check if contact exists and belongs to current user
    const existingContact = await db.contact.findFirst({
      where: {
        id,
        userId: session.user?.id,
      },
    })

    if (!existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Check for duplicate phone number (excluding current contact)
    if (phoneNumber && phoneNumber !== existingContact.phoneNumber) {
      const duplicateContact = await db.contact.findFirst({
        where: {
          userId: session.user?.id,
          phoneNumber: phoneNumber.trim(),
          id: { not: id },
        },
      })

      if (duplicateContact) {
        return NextResponse.json({ error: 'A contact with this phone number already exists' }, { status: 400 })
      }
    }

    const contact = await db.contact.update({
      where: { id },
      data: {
        name: name?.trim() || existingContact.name,
        phoneNumber: phoneNumber?.trim() || existingContact.phoneNumber,
        label: label?.trim() || null,
      },
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

    const { id } = params

    const existingContact = await db.contact.findFirst({
      where: {
        id,
        userId: session.user?.id,
      },
    })

    if (!existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    await db.contact.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Contact deleted successfully' })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}