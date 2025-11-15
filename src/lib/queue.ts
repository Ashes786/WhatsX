import { Queue, Worker } from 'bullmq'
import { db } from '@/lib/db'
import WhatsAppCloudAPI from '@/lib/whatsapp'

// Create a message queue
export const messageQueue = new Queue('message-queue', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
})

// WhatsApp Service using the new Cloud API
class WhatsAppService {
  static async sendMessage(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const result = await WhatsAppCloudAPI.sendMessage(phoneNumber, message)
      return result
    } catch (error) {
      console.error('WhatsApp Service error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  static async sendTemplateMessage(
    phoneNumber: string, 
    templateName: string, 
    parameters?: Array<{ type: string; text?: string }>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const result = await WhatsAppCloudAPI.sendTemplateMessage(phoneNumber, templateName, 'en', parameters)
      return result
    } catch (error) {
      console.error('WhatsApp Template Service error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}

// Create a worker to process messages
const messageWorker = new Worker(
  'message-queue',
  async (job) => {
    const { messageId, contactIds } = job.data
    
    try {
      // Get the message details
      const message = await db.message.findUnique({
        where: { id: messageId },
        include: {
          deliveryLogs: {
            include: {
              contact: true
            }
          }
        }
      })
      
      if (!message) {
        throw new Error(`Message ${messageId} not found`)
      }
      
      // Send message to each contact
      for (const deliveryLog of message.deliveryLogs) {
        try {
          const result = await WhatsAppService.sendMessage(
            deliveryLog.contact.phoneNumber,
            message.content
          )
          
          // Update delivery log
          await db.deliveryLog.update({
            where: { id: deliveryLog.id },
            data: {
              status: result.success ? 'DELIVERED' : 'FAILED',
              responseDetail: result.error || (result.messageId ? `Message ID: ${result.messageId}` : null)
            }
          })
          
        } catch (error) {
          // Update delivery log with error
          await db.deliveryLog.update({
            where: { id: deliveryLog.id },
            data: {
              status: 'FAILED',
              responseDetail: error instanceof Error ? error.message : 'Unknown error'
            }
          })
        }
      }
      
      // Update message status
      await db.message.update({
        where: { id: messageId },
        data: {
          status: 'SENT'
        }
      })
      
    } catch (error) {
      console.error(`Failed to process message ${messageId}:`, error)
      
      // Update message status to failed
      await db.message.update({
        where: { id: messageId },
        data: {
          status: 'FAILED'
        }
      })
      
      throw error
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  }
)

// Handle worker errors
messageWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})

messageWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`)
})

export { WhatsAppService }