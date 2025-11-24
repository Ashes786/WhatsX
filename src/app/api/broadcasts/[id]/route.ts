import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const broadcastListId = params.id

    // Verify the broadcast list belongs to the current user
    const broadcastList = await db.broadcastList.findUnique({
      where: { id: broadcastListId }
    })

    if (!broadcastList) {
      return NextResponse.json({ error: 'Broadcast list not found' }, { status: 404 })
    }

    if (broadcastList.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete the broadcast list (this will cascade delete the broadcast contacts)
    await db.broadcastList.delete({
      where: { id: broadcastListId }
    })

    return NextResponse.json({ message: 'Broadcast list deleted successfully' })
  } catch (error) {
    console.error('Error deleting broadcast list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}