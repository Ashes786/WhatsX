import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@whatsx.com' },
    update: {},
    create: {
      email: 'admin@whatsx.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create Demo End User
  const userPassword = await bcrypt.hash('demo123', 12)
  const demoUser = await prisma.user.upsert({
    where: { email: 'user@demo.com' },
    update: {},
    create: {
      email: 'user@demo.com',
      name: 'Demo User',
      password: userPassword,
      role: 'END_USER',
    },
  })

  // Create additional demo users
  const user2Password = await bcrypt.hash('user123', 12)
  const user2 = await prisma.user.upsert({
    where: { email: 'john@company.com' },
    update: {},
    create: {
      email: 'john@company.com',
      name: 'John Smith',
      password: user2Password,
      role: 'END_USER',
    },
  })

  const user3Password = await bcrypt.hash('user123', 12)
  const user3 = await prisma.user.upsert({
    where: { email: 'jane@business.com' },
    update: {},
    create: {
      email: 'jane@business.com',
      name: 'Jane Doe',
      password: user3Password,
      role: 'END_USER',
    },
  })

  // Create Templates for Admin
  const adminTemplates = [
    {
      title: 'Welcome Message',
      content: 'Welcome to our platform! We\'re excited to have you on board. If you have any questions, feel free to reach out to our support team.',
    },
    {
      title: 'Meeting Reminder',
      content: 'This is a reminder about our upcoming meeting scheduled for {date} at {time}. Please make sure to attend. Looking forward to our discussion!',
    },
    {
      title: 'Promotional Offer',
      content: 'Special offer just for you! Get {discount}% off on all products. Use code {code} at checkout. Offer valid until {expiry_date}.',
    },
    {
      title: 'Payment Reminder',
      content: 'This is a friendly reminder that your payment of ${amount} is due on {due_date}. Please ensure timely payment to avoid any late fees.',
    },
  ]

  for (const template of adminTemplates) {
    await prisma.template.create({
      data: {
        ...template,
        userId: admin.id,
      },
    })
  }

  // Create Templates for Demo User
  const userTemplates = [
    {
      title: 'Follow Up',
      content: 'Hi {name}, just following up on our previous conversation. Please let me know if you have any questions or need further assistance.',
    },
    {
      title: 'Thank You',
      content: 'Thank you for your business! We appreciate your trust in our services and look forward to working with you again.',
    },
  ]

  for (const template of userTemplates) {
    await prisma.template.create({
      data: {
        ...template,
        userId: demoUser.id,
      },
    })
  }

  // Create Contacts for Demo User
  const demoUserContacts = [
    { name: 'Alice Johnson', phoneNumber: '+1234567890', label: 'Client' },
    { name: 'Bob Smith', phoneNumber: '+0987654321', label: 'Lead' },
    { name: 'Carol Williams', phoneNumber: '+1122334455', label: 'Client' },
    { name: 'David Brown', phoneNumber: '+5566778899', label: 'Prospect' },
    { name: 'Eva Davis', phoneNumber: '+9988776655', label: 'Client' },
  ]

  for (const contact of demoUserContacts) {
    await prisma.contact.create({
      data: {
        ...contact,
        userId: demoUser.id,
      },
    })
  }

  // Create Contacts for User 2
  const user2Contacts = [
    { name: 'Frank Miller', phoneNumber: '+1112223333', label: 'VIP' },
    { name: 'Grace Wilson', phoneNumber: '+4445556666', label: 'Client' },
    { name: 'Henry Moore', phoneNumber: '+7778889999', label: 'Lead' },
  ]

  for (const contact of user2Contacts) {
    await prisma.contact.create({
      data: {
        ...contact,
        userId: user2.id,
      },
    })
  }

  // Create Contacts for User 3
  const user3Contacts = [
    { name: 'Ivy Taylor', phoneNumber: '+3334445555', label: 'Client' },
    { name: 'Jack Anderson', phoneNumber: '+6667778888', label: 'Prospect' },
  ]

  for (const contact of user3Contacts) {
    await prisma.contact.create({
      data: {
        ...contact,
        userId: user3.id,
      },
    })
  }

  // Create Sample Messages
  const sampleMessages = [
    {
      content: 'Welcome to our service! We\'re excited to have you join us.',
      userId: demoUser.id,
      contactIds: [demoUserContacts[0].phoneNumber, demoUserContacts[1].phoneNumber],
    },
    {
      content: 'This is a reminder about your upcoming appointment tomorrow at 2 PM.',
      userId: demoUser.id,
      contactIds: [demoUserContacts[2].phoneNumber],
    },
    {
      content: 'Thank you for your recent purchase! Your order has been confirmed.',
      userId: user2.id,
      contactIds: [user2Contacts[0].phoneNumber],
    },
  ]

  for (const messageData of sampleMessages) {
    // Find contacts by phone number for this user
    const contacts = await prisma.contact.findMany({
      where: {
        userId: messageData.userId,
        phoneNumber: {
          in: messageData.contactIds,
        },
      },
    })

    if (contacts.length > 0) {
      const message = await prisma.message.create({
        data: {
          content: messageData.content,
          userId: messageData.userId,
          status: 'DRAFT',
        },
      })

      // Create message recipients
      for (const contact of contacts) {
        await prisma.messageRecipient.create({
          data: {
            messageId: message.id,
            contactId: contact.id,
            status: 'PENDING',
          },
        })
      }
    }
  }

  console.log('Database seeded successfully!')
  console.log('Admin user:', { email: admin.email, password: 'admin123' })
  console.log('Demo user:', { email: demoUser.email, password: 'demo123' })
  console.log('Additional users created:', user2.email, user3.email)
  console.log('Templates, contacts, and sample messages created for all users')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })