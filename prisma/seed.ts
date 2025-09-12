import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@whatsx.com' }
  })

  if (!existingAdmin) {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12)
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@whatsx.com',
        password_hash: adminPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        default_country_code: '+92'
      },
    })

    // Create multiple sample templates for admin
    const adminTemplates = [
      {
        title: 'Welcome Message',
        content: 'Hello {{name}}, welcome to WhatsX! We are excited to have you on board.',
        is_active: true,
      },
      {
        title: 'Promotional Offer',
        content: 'Hi {{name}}, check out our latest offer! Get 20% off on all services this month.',
        is_active: true,
      },
      {
        title: 'Meeting Reminder',
        content: 'Dear {{name}}, this is a reminder about our meeting scheduled at {{time}} on {{date}}.',
        is_active: true,
      },
      {
        title: 'Feedback Request',
        content: 'Hi {{name}}, we value your feedback! Please take a moment to rate our service.',
        is_active: false, // Inactive template
      }
    ]

    for (const template of adminTemplates) {
      await prisma.template.create({
        data: {
          title: template.title,
          content: template.content,
          created_by: admin.id,
          is_active: template.is_active,
        },
      })
    }

    console.log('Admin user created: admin@whatsx.com / admin123')
    console.log(`${adminTemplates.length} templates created for admin`)
  } else {
    console.log('Admin user already exists')
  }

  // Check if end user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'user@whatsx.com' }
  })

  if (!existingUser) {
    // Create sample end user
    const endUserPassword = await bcrypt.hash('user123', 12)
    const endUser = await prisma.user.create({
      data: {
        name: 'Regular User',
        email: 'user@whatsx.com',
        password_hash: endUserPassword,
        role: 'END_USER',
        status: 'ACTIVE',
        default_country_code: '+1',
      },
    })

    // Create sample contacts for the end user
    const contacts = [
      { name: 'John Doe', raw_phone: '+1234567890', label: 'Friend' },
      { name: 'Jane Smith', raw_phone: '+1987654321', label: 'Colleague' },
      { name: 'Bob Johnson', raw_phone: '+1555555555', label: 'Family' },
      { name: 'Alice Brown', raw_phone: '+1444444444', label: 'Client' },
      { name: 'Charlie Wilson', raw_phone: '+1333333333', label: 'Partner' },
      { name: 'Diana Davis', raw_phone: '+1222222222', label: 'Friend' },
    ]

    for (const contact of contacts) {
      await prisma.contact.create({
        data: {
          owner_id: endUser.id,
          name: contact.name,
          raw_phone: contact.raw_phone,
          e164_phone: contact.raw_phone,
          label: contact.label,
        },
      })
    }

    // Create some sample prepare-to-send jobs for the end user
    const prepareJobs = [
      {
        message_preview: 'Hello everyone! This is a test message.',
        recipients_final: ['+1234567890', '+1987654321', '+1555555555'],
        duplicates: JSON.stringify([
          { raw: '+1234567890', normalized: '+1234567890', reason: 'duplicate_in_upload' }
        ])
      },
      {
        message_preview: 'Meeting reminder for tomorrow at 2 PM.',
        recipients_final: ['+1444444444', '+1333333333'],
        duplicates: JSON.stringify([])
      },
      {
        message_preview: 'Thanks for your feedback!',
        recipients_final: ['+1222222222'],
        duplicates: JSON.stringify([])
      }
    ]

    for (const job of prepareJobs) {
      await prisma.prepareToSendJob.create({
        data: {
          user_id: endUser.id,
          message_preview: job.message_preview,
          recipients_raw: JSON.stringify(job.recipients_final),
          recipients_final: JSON.stringify(job.recipients_final),
          duplicates: job.duplicates,
        }
      })
    }

    console.log('End user created: user@whatsx.com / user123')
    console.log(`${contacts.length} contacts created for end user`)
    console.log(`${prepareJobs.length} prepare-to-send jobs created`)
  } else {
    console.log('End user already exists')
  }

  // Create additional sample users for demonstration
  const sampleUsers = [
    {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'END_USER',
      status: 'ACTIVE',
      country: '+44',
    },
    {
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'END_USER',
      status: 'SUSPENDED',
      country: '+61',
    },
    {
      name: 'Carol Williams',
      email: 'carol@example.com',
      role: 'END_USER',
      status: 'ACTIVE',
      country: '+1',
    }
  ]

  for (const userData of sampleUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (!existingUser) {
      const password = await bcrypt.hash('password123', 12)
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password_hash: password,
          role: userData.role,
          status: userData.status,
          default_country_code: userData.country,
        }
      })

      // Create some contacts for additional users
      const userContacts = [
        { name: 'Contact 1', raw_phone: userData.country + '1111111111' },
        { name: 'Contact 2', raw_phone: userData.country + '2222222222' },
      ]

      for (const contact of userContacts) {
        await prisma.contact.create({
          data: {
            owner_id: user.id,
            name: contact.name,
            raw_phone: contact.raw_phone,
            e164_phone: contact.raw_phone,
          }
        })
      }

      console.log(`Created user: ${userData.email} / password123`)
    }
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })