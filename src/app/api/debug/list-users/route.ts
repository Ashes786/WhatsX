import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('DEBUG: Listing all users...')
    
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    console.log('DEBUG: Users found:', users)

    return NextResponse.json({
      message: 'Users found',
      count: users.length,
      users: users,
    })
  } catch (error) {
    console.error('DEBUG: Error listing users:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}