import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    let whereClause: any = {}
    
    if (session.user.role === 'ADMIN') {
      // Admin can see all logs or filter by specific user
      if (userId) {
        whereClause.message = {
          userId: userId
        }
      }
    } else {
      // Regular users can only see their own logs
      whereClause.message = {
        userId: session.user.id
      }
    }

    // Add date filtering
    if (startDate || endDate) {
      whereClause.timestamp = {}
      if (startDate) {
        whereClause.timestamp.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.timestamp.lte = new Date(endDate)
      }
    }

    const deliveryLogs = await db.deliveryLog.findMany({
      where: whereClause,
      include: {
        message: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        contact: true
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    return NextResponse.json(deliveryLogs)
  } catch (error) {
    console.error('Error fetching delivery logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}