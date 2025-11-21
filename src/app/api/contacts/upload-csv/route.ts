import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session-utils'
import { db } from '@/lib/db'
import { normalizePhoneNumber } from '@/lib/phone-utils'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    console.log('CSV Upload - Current user:', currentUser)

    const formData = await request.formData()
    const file = formData.get('file') as File

    console.log('CSV Upload - File received:', file?.name, file?.size, file?.type)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read CSV file
    const csvContent = await file.text()
    console.log('CSV Upload - File content length:', csvContent.length)
    const lines = csvContent.split('\n').filter(line => line.trim())
    console.log('CSV Upload - Total lines:', lines.length)
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file must have at least a header and one data row' }, { status: 400 })
    }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    console.log('CSV Upload - Headers found:', headers)
    
    // Find required columns
    const phoneIndex = headers.findIndex(h => h === 'phone')
    const nameIndex = headers.findIndex(h => h === 'name')
    const labelIndex = headers.findIndex(h => h === 'label')
    
    console.log('CSV Upload - Column indexes - phone:', phoneIndex, 'name:', nameIndex, 'label:', labelIndex)

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
      if (!line) {
        console.log(`CSV Upload - Skipping empty line ${i}`)
        continue
      }

      try {
        const columns = parseCSVLine(line)
        console.log(`CSV Upload - Processing line ${i}:`, columns)
        
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

        console.log(`CSV Upload - Parsed data for line ${i}:`, { raw_phone, name, label })

        // Normalize phone number (use default +1 if no country code provided)
        const e164_phone = normalizePhoneNumber(raw_phone, '+1')
        console.log(`CSV Upload - Phone normalization for line ${i}:`, { raw_phone, e164_phone })

        // Check for duplicates
        const existingContact = await db.contact.findFirst({
          where: {
            userId: currentUser.id,
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
            userId: currentUser.id,
            name,
            phoneNumber: raw_phone,
            label
          }
        })

        console.log('CSV Upload - Created contact:', contact)
        results.imported_count++
        results.imported_items.push({
          row: i + 1,
          name,
          raw_phone,
          e164_phone: raw_phone,
          label
        })

      } catch (error) {
        console.error(`CSV Upload - Error processing row ${i + 1}:`, error)
        results.errors.push(`Row ${i + 1}: ${error}`)
      }
    }

    console.log('CSV Upload - Final results:', results)
    return NextResponse.json(results)
  } catch (error) {
    console.error('CSV Upload - Error uploading CSV:', error)
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
  return result.map(item => item.trim().replace(/^"|"$/g, '')) // Remove surrounding quotes
}