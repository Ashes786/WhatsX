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
        password: adminPassword,
        role: 'ADMIN',
      },
    })

    // Create multiple sample templates for admin
    const adminTemplates = [
      {
        name: 'Welcome Message',
        content: 'Hello {{name}}, welcome to WhatsX! We are excited to have you on board.',
      },
      {
        name: 'Promotional Offer',
        content: 'Hi {{name}}, check out our latest offer! Get 20% off on all services this month.',
      },
      {
        name: 'Meeting Reminder',
        content: 'Dear {{name}}, this is a reminder about our meeting scheduled at {{time}} on {{date}}.',
      },
      {
        name: 'Feedback Request',
        content: 'Hi {{name}}, we value your feedback! Please take a moment to rate our service.',
      }
    ]

    for (const template of adminTemplates) {
      await prisma.template.create({
        data: {
          name: template.name,
          content: template.content,
          userId: admin.id,
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
        password: endUserPassword,
        role: 'END_USER',
      },
    })

    // Create sample contacts for the end user
    const contacts = [
      { name: 'John Doe', phone: '+1234567890' },
      { name: 'Jane Smith', phone: '+1987654321' },
      { name: 'Bob Johnson', phone: '+1555555555' },
      { name: 'Alice Brown', phone: '+1444444444' },
      { name: 'Charlie Wilson', phone: '+1333333333' },
      { name: 'Diana Davis', phone: '+1222222222' },
    ]

    for (const contact of contacts) {
      await prisma.contact.create({
        data: {
          userId: endUser.id,
          name: contact.name,
          phone: contact.phone,
        },
      })
    }

    console.log('End user created: user@whatsx.com / user123')
    console.log(`${contacts.length} contacts created for end user`)
  } else {
    console.log('End user already exists')
  }

  // Create additional sample users for demonstration
  const sampleUsers = [
    {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'END_USER',
    },
    {
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'END_USER',
    },
    {
      name: 'Carol Williams',
      email: 'carol@example.com',
      role: 'END_USER',
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
          password: password,
          role: userData.role,
        }
      })

      // Create some contacts for additional users
      const userContacts = [
        { name: 'Contact 1', phone: '+1111111111' },
        { name: 'Contact 2', phone: '+2222222222' },
      ]

      for (const contact of userContacts) {
        await prisma.contact.create({
          data: {
            userId: user.id,
            name: contact.name,
            phone: contact.phone,
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