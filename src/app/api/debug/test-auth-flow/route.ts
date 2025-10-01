import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('TEST AUTH FLOW: Starting test for:', email)

    // Step 1: Check if user exists
    console.log('TEST AUTH FLOW: Step 1 - Finding user...')
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('TEST AUTH FLOW: User not found')
      return NextResponse.json({ 
        success: false, 
        step: 'find_user', 
        error: 'User not found' 
      })
    }

    console.log('TEST AUTH FLOW: User found:', { id: user.id, email: user.email, name: user.name, role: user.role })

    // Step 2: Test password comparison
    console.log('TEST AUTH FLOW: Step 2 - Testing password comparison...')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      console.log('TEST AUTH FLOW: Password comparison failed')
      return NextResponse.json({ 
        success: false, 
        step: 'password_compare', 
        error: 'Invalid password' 
      })
    }

    console.log('TEST AUTH FLOW: Password comparison successful')

    // Step 3: Return user object (simulating successful auth)
    console.log('TEST AUTH FLOW: Step 3 - Authentication successful')
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })

  } catch (error) {
    console.error('TEST AUTH FLOW: Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}