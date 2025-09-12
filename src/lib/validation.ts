import { z } from 'zod'
import { NextResponse } from 'next/server'

// User validation schemas
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'END_USER']),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional().default('ACTIVE'),
  default_country_code: z.string().optional()
})

export const updateUserSchema = createUserSchema.partial().extend({
  password: z.string().min(6, 'Password must be at least 6 characters').optional()
})

// Template validation schemas
export const createTemplateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content must be less than 5000 characters'),
  is_active: z.boolean().optional().default(true)
})

export const updateTemplateSchema = createTemplateSchema.partial()

// Contact validation schemas
export const createContactSchema = z.object({
  name: z.string().max(100, 'Name must be less than 100 characters').optional(),
  raw_phone: z.string().min(1, 'Phone number is required'),
  label: z.string().max(50, 'Label must be less than 50 characters').optional()
})

export const updateContactSchema = createContactSchema.partial()

// Prepare to send validation schema
export const prepareToSendSchema = z.object({
  template_id: z.string().optional(),
  message_override: z.string().max(5000, 'Message must be less than 5000 characters').optional(),
  recipients_raw: z.array(z.string()).min(1, 'At least one recipient is required'),
  default_country_code: z.string().optional()
})

// CSV validation
export function validateCSVData(data: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  data.forEach((row, index) => {
    const rowNum = index + 1 // +1 because header is row 0

    // Check required phone field
    if (!row.phone || typeof row.phone !== 'string' || !row.phone.trim()) {
      errors.push(`Row ${rowNum}: Phone number is required and must be a string`)
    }

    // Validate name if present
    if (row.name && typeof row.name !== 'string') {
      errors.push(`Row ${rowNum}: Name must be a string`)
    }

    // Validate label if present
    if (row.label && typeof row.label !== 'string') {
      errors.push(`Row ${rowNum}: Label must be a string`)
    }

    // Validate phone format (basic check)
    if (row.phone && typeof row.phone === 'string') {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/
      if (!phoneRegex.test(row.phone)) {
        errors.push(`Row ${rowNum}: Phone number contains invalid characters`)
      }
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

// Phone number validation
export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required and must be a string' }
  }

  // Remove all non-digit and non-plus characters for validation
  const cleaned = phone.replace(/[^\d+]/g, '')

  if (!cleaned) {
    return { valid: false, error: 'Phone number cannot be empty' }
  }

  // Basic validation for phone number format
  if (cleaned.length < 10) {
    return { valid: false, error: 'Phone number is too short' }
  }

  if (cleaned.length > 15) {
    return { valid: false, error: 'Phone number is too long' }
  }

  // If it contains a plus, it must be at the beginning
  if (cleaned.includes('+') && !cleaned.startsWith('+')) {
    return { valid: false, error: 'Plus sign must be at the beginning of the phone number' }
  }

  return { valid: true }
}

// Error handling utilities
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    )
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      },
      { status: 400 }
    )
  }

  console.error('Unexpected error:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status })
}