import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const broadcastLists = await db.broadcastList.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        broadcastContacts: {
          include: {
            contact: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(broadcastLists)
  } catch (error) {
    console.error('Error fetching broadcast lists:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, contactIds } = await request.json()

    if (!title || !contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ error: 'Title and at least one contact are required' }, { status: 400 })
    }

    // Verify all contacts belong to current user
    const contacts = await db.contact.findMany({
      where: {
        id: {
          in: contactIds,
        },
        userId: session.user.id,
      },
    })

    if (contacts.length !== contactIds.length) {
      return NextResponse.json({ error: 'Some contacts not found or access denied' }, { status: 404 })
    }

    // Create broadcast list
    const broadcastList = await db.broadcastList.create({
      data: {
        userId: session.user.id,
        title,
      }
    })

    // Add contacts to broadcast list
    await Promise.all(
      contacts.map(contact =>
        db.broadcastContact.create({
          data: {
            broadcastListId: broadcastList.id,
            contactId: contact.id,
          }
        })
      )
    )

    // Return the complete broadcast list with contacts
    const completeBroadcastList = await db.broadcastList.findUnique({
      where: { id: broadcastList.id },
      include: {
        broadcastContacts: {
          include: {
            contact: true
          }
        }
      }
    })

    return NextResponse.json(completeBroadcastList, { status: 201 })
  } catch (error) {
    console.error('Error creating broadcast list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}