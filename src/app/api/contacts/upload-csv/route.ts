import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { normalizePhoneNumber } from '@/lib/phone-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read CSV file
    const csvContent = await file.text()
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file must have at least a header and one data row' }, { status: 400 })
    }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    // Find required columns
    const phoneIndex = headers.findIndex(h => h === 'phone')
    const nameIndex = headers.findIndex(h => h === 'name')
    const labelIndex = headers.findIndex(h => h === 'label')

    if (phoneIndex === -1) {
      return NextResponse.json({ error: 'CSV must contain a "phone" column' }, { status: 400 })
    }

    const results = {
      imported_count: 0,
      duplicate_count: 0,
      errors: [] as string[],
      imported_items: [] as any[]
    }

    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      try {
        const columns = parseCSVLine(line)
        
        if (columns.length <= phoneIndex) {
          results.errors.push(`Row ${i + 1}: Missing phone number`)
          continue
        }

        const raw_phone = columns[phoneIndex].trim()
        if (!raw_phone) {
          results.errors.push(`Row ${i + 1}: Empty phone number`)
          continue
        }

        const name = nameIndex >= 0 && columns[nameIndex] ? columns[nameIndex].trim() : null
        const label = labelIndex >= 0 && columns[labelIndex] ? columns[labelIndex].trim() : null

        // Normalize phone number
        const e164_phone = normalizePhoneNumber(raw_phone, session.user.default_country_code)

        // Check for duplicates
        const existingContact = await db.contact.findFirst({
          where: {
            userId: session.user.id,
            phoneNumber: e164_phone
          }
        })

        if (existingContact) {
          results.duplicate_count++
          continue
        }

        // Create contact
        const contact = await db.contact.create({
          data: {
            userId: session.user.id,
            name,
            phoneNumber: raw_phone,
            label
          }
        })

        results.imported_count++
        results.imported_items.push({
          row: i + 1,
          name,
          raw_phone,
          e164_phone: raw_phone,
          label
        })

      } catch (error) {
        results.errors.push(`Row ${i + 1}: ${error}`)
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error uploading CSV:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}