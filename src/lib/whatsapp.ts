import axios from 'axios'

export interface WhatsAppMessage {
  messaging_product: 'whatsapp'
  to: string
  type: 'text' | 'template' | 'media'
  text?: {
    body: string
  }
  template?: {
    name: string
    language: {
      code: string
    }
    components?: Array<{
      type: string
      parameters: Array<{
        type: string
        text?: string
        image?: {
          link: string
        }
      }>
    }>
  }
  media?: {
    id?: string
    link?: string
    caption?: string
    filename?: string
  }
}

export interface WhatsAppResponse {
  messaging_product: string
  contacts: Array<{
    input: string
    wa_id: string
  }>
  messages: Array<{
    id: string
  }>
}

export class WhatsAppCloudAPI {
  private static readonly BASE_URL = 'https://graph.facebook.com/v18.0'
  private static readonly ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
  private static readonly PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
  private static readonly VERSION = 'v18.0'

  static async sendMessage(
    phoneNumber: string,
    message: string,
    type: 'text' | 'template' = 'text'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.ACCESS_TOKEN || !this.PHONE_NUMBER_ID) {
        console.warn('WhatsApp Cloud API credentials not configured, using mock implementation')
        return this.mockSendMessage(phoneNumber, message)
      }

      const payload: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(phoneNumber),
        type,
        ...(type === 'text' && {
          text: {
            body: message
          }
        })
      }

      const response = await axios.post<WhatsAppResponse>(
        `${this.BASE_URL}/${this.VERSION}/${this.PHONE_NUMBER_ID}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.messages && response.data.messages.length > 0) {
        return {
          success: true,
          messageId: response.data.messages[0].id
        }
      }

      return {
        success: false,
        error: 'No message ID returned from WhatsApp API'
      }

    } catch (error: any) {
      console.error('WhatsApp Cloud API error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Unknown WhatsApp API error'
      }
    }
  }

  static async sendTemplateMessage(
    phoneNumber: string,
    templateName: string,
    languageCode: string = 'en',
    parameters?: Array<{ type: string; text?: string }>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.ACCESS_TOKEN || !this.PHONE_NUMBER_ID) {
        console.warn('WhatsApp Cloud API credentials not configured, using mock implementation')
        return this.mockSendMessage(phoneNumber, `Template: ${templateName}`)
      }

      const payload: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(phoneNumber),
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          },
          ...(parameters && {
            components: [{
              type: 'body',
              parameters
            }]
          })
        }
      }

      const response = await axios.post<WhatsAppResponse>(
        `${this.BASE_URL}/${this.VERSION}/${this.PHONE_NUMBER_ID}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.messages && response.data.messages.length > 0) {
        return {
          success: true,
          messageId: response.data.messages[0].id
        }
      }

      return {
        success: false,
        error: 'No message ID returned from WhatsApp API'
      }

    } catch (error: any) {
      console.error('WhatsApp Cloud API template error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Unknown WhatsApp API error'
      }
    }
  }

  static async getMessageStatus(messageId: string): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
      if (!this.ACCESS_TOKEN) {
        return {
          success: false,
          error: 'WhatsApp Cloud API credentials not configured'
        }
      }

      const response = await axios.get(
        `${this.BASE_URL}/${this.VERSION}/${messageId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`
          }
        }
      )

      return {
        success: true,
        status: response.data.conversation?.origin?.type || 'unknown'
      }

    } catch (error: any) {
      console.error('WhatsApp Cloud API status check error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Unknown WhatsApp API error'
      }
    }
  }

  private static formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters and ensure it starts with country code
    const cleaned = phoneNumber.replace(/\D/g, '')
    
    // If it doesn't start with country code, assume it's a US number (you can modify this logic)
    if (cleaned.length === 10) {
      return `1${cleaned}`
    }
    
    return cleaned
  }

  private static mockSendMessage(phoneNumber: string, message: string): { success: boolean; messageId?: string; error?: string } {
    console.log(`[MOCK] Sending WhatsApp message to ${phoneNumber}: ${message}`)
    
    // Simulate API delay
    const delay = Math.random() * 1000 + 500 // 500-1500ms delay
    const startTime = Date.now()
    
    while (Date.now() - startTime < delay) {
      // Busy wait to simulate delay
    }
    
    // Simulate 95% success rate
    if (Math.random() > 0.05) {
      const mockMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log(`[MOCK] Message sent successfully with ID: ${mockMessageId}`)
      return {
        success: true,
        messageId: mockMessageId
      }
    } else {
      const error = 'Simulated WhatsApp API failure'
      console.log(`[MOCK] Message failed: ${error}`)
      return {
        success: false,
        error
      }
    }
  }

  static isConfigured(): boolean {
    return !!(this.ACCESS_TOKEN && this.PHONE_NUMBER_ID)
  }
}

export default WhatsAppCloudAPI