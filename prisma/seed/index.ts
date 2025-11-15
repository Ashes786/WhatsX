import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  console.log('Admin password hash:', adminPassword)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@whatsx.com' },
    update: {},
    create: {
      email: 'admin@whatsx.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  // Create end user
  const endUserPassword = await bcrypt.hash('operator123', 10)
  console.log('End User password hash:', endUserPassword)
  
  const endUser = await prisma.user.upsert({
    where: { email: 'operator@whatsx.com' },
    update: {},
    create: {
      email: 'operator@whatsx.com',
      name: 'End User',
      passwordHash: endUserPassword,
      role: 'END_USER',
      status: 'ACTIVE',
    },
  })

  // Test password verification
  const adminTest = await bcrypt.compare('admin123', adminPassword)
  const endUserTest = await bcrypt.compare('operator123', endUserPassword)
  
  console.log('Admin password verification:', adminTest)
  console.log('End User password verification:', endUserTest)

  // Create some sample templates
  const template1 = await prisma.template.create({
    data: {
      title: 'Welcome Message',
      content: 'Hello {name}, welcome to our service!',
      userId: admin.id,
    },
  })

  const template2 = await prisma.template.create({
    data: {
      title: 'Promotional Offer',
      content: 'Hi {name}, check out our latest offer: {offer}',
      userId: admin.id,
    },
  })

  // Create some sample contacts
  const contact1 = await prisma.contact.upsert({
    where: {
      userId_phoneNumber: {
        userId: endUser.id,
        phoneNumber: '+1234567890'
      }
    },
    update: {},
    create: {
      name: 'John Doe',
      phoneNumber: '+1234567890',
      label: 'VIP Customer',
      userId: endUser.id,
    },
  })

  const contact2 = await prisma.contact.upsert({
    where: {
      userId_phoneNumber: {
        userId: endUser.id,
        phoneNumber: '+0987654321'
      }
    },
    update: {},
    create: {
      name: 'Jane Smith',
      phoneNumber: '+0987654321',
      label: 'Lead',
      userId: endUser.id,
    },
  })

  console.log('Database seeded successfully!')
  console.log('Admin user: admin@whatsx.com / admin123')
  console.log('End User: operator@whatsx.com / operator123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })