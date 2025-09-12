export interface DuplicateInfo {
  raw: string
  normalized?: string
  reason: 'duplicate_in_upload' | 'duplicate_existing_contact' | 'unparseable' | 'same_as_another_normalized'
}

export interface DedupeResult {
  recipients_final: string[]
  duplicates: DuplicateInfo[]
}

export function normalizePhoneNumber(rawPhone: string, defaultCountryCode?: string): string | null {
  // Strip all non-digit and non-plus characters
  let s = rawPhone.replace(/[^\d+]/g, '')
  
  if (!s) return null
  
  // If it begins with "00", replace leading "00" with "+"
  if (s.startsWith('00')) {
    s = '+' + s.substring(2)
  }
  
  // If it begins with "+", keep it
  if (s.startsWith('+')) {
    return s
  }
  
  // If it begins with a single "0" and default country code exists
  if (s.startsWith('0') && defaultCountryCode) {
    return defaultCountryCode + s.substring(1)
  }
  
  // If it's a plain local number and default country code exists
  if (defaultCountryCode && s.length <= 10) {
    return defaultCountryCode + s
  }
  
  // Return as-is (best effort)
  return s
}

export function dedupeRecipients(
  recipientsRaw: string[],
  ownerContactsE164: string[],
  defaultCountryCode?: string
): DedupeResult {
  const normalizedMap = new Map<string, { raws: string[]; reasons: string[] }>()
  const duplicates: DuplicateInfo[] = []

  for (const raw of recipientsRaw) {
    const trimmedRaw = raw.trim()
    if (!trimmedRaw) {
      duplicates.push({
        raw: trimmedRaw,
        reason: 'unparseable'
      })
      continue
    }

    const normalized = normalizePhoneNumber(trimmedRaw, defaultCountryCode)
    
    if (!normalized) {
      duplicates.push({
        raw: trimmedRaw,
        reason: 'unparseable'
      })
      continue
    }

    // Check if normalized phone exists in existing contacts
    if (ownerContactsE164.includes(normalized)) {
      duplicates.push({
        raw: trimmedRaw,
        normalized,
        reason: 'duplicate_existing_contact'
      })
      continue
    }

    // Check if normalized phone already exists in current upload
    if (normalizedMap.has(normalized)) {
      const existing = normalizedMap.get(normalized)!
      existing.raws.push(trimmedRaw)
      existing.reasons.push('duplicate_in_upload')
      duplicates.push({
        raw: trimmedRaw,
        normalized,
        reason: 'duplicate_in_upload'
      })
      continue
    }

    // Add to normalized map
    normalizedMap.set(normalized, {
      raws: [trimmedRaw],
      reasons: []
    })
  }

  // Extract final recipients
  const recipientsFinal = Array.from(normalizedMap.keys())

  return {
    recipients_final: recipientsFinal,
    duplicates
  }
}

export function generateMessagePreview(templateContent: string, messageOverride?: string): string {
  if (messageOverride) {
    return messageOverride
  }
  
  // For prototype, we'll just return the template content as-is
  // In a real implementation, you might handle variable substitution here
  return templateContent
}