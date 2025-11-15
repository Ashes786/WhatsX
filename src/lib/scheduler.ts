import { messageQueue } from '@/lib/queue'

export interface ScheduledMessageJob {
  messageId: string
  contactIds: string[]
  userId: string
  scheduledAt: Date
}

export class MessageScheduler {
  static async scheduleMessage(
    messageId: string,
    contactIds: string[],
    userId: string,
    scheduledAt: Date
  ): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      const job = await messageQueue.add(
        'send-scheduled-message',
        {
          messageId,
          contactIds,
          userId,
          scheduledAt
        },
        {
          delay: scheduledAt.getTime() - Date.now(),
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        }
      )

      return {
        success: true,
        jobId: job.id
      }
    } catch (error) {
      console.error('Failed to schedule message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  static async cancelScheduledMessage(jobId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await messageQueue.remove(jobId)
      return { success: true }
    } catch (error) {
      console.error('Failed to cancel scheduled message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  static async getScheduledMessages(): Promise<any[]> {
    try {
      const waitingJobs = await messageQueue.getWaiting()
      const delayedJobs = await messageQueue.getDelayed()
      
      return [...waitingJobs, ...delayedJobs].map(job => ({
        id: job.id,
        data: job.data,
        delay: job.opts?.delay,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason
      }))
    } catch (error) {
      console.error('Failed to get scheduled messages:', error)
      return []
    }
  }
}

export default MessageScheduler