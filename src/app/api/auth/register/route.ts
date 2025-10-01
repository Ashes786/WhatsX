import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('REGISTER DEBUG: Registration request received')
    
    const { name, email, password, role } = await request.json()
    
    console.log('REGISTER DEBUG: Received data:', { name, email, role: role || 'END_USER' })

    if (!name || !email || !password || !role) {
      console.log('REGISTER DEBUG: Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    console.log('REGISTER DEBUG: Checking if user already exists...')
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('REGISTER DEBUG: User already exists:', email)
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    console.log('REGISTER DEBUG: Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('REGISTER DEBUG: Password hashed successfully')

    // Create user
    console.log('REGISTER DEBUG: Creating user...')
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      }
    })

    console.log('REGISTER DEBUG: User created successfully:', { id: user.id, email: user.email, name: user.name, role: user.role })

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('REGISTER DEBUG: Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}