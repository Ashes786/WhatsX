import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10) // Reduced rounds for testing
  console.log('Admin password hash:', adminPassword)
  
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

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10) // Reduced rounds for testing
  console.log('User password hash:', userPassword)
  
  const user = await prisma.user.upsert({
    where: { email: 'user@whatsx.com' },
    update: {},
    create: {
      email: 'user@whatsx.com',
      name: 'Regular User',
      password: userPassword,
      role: 'END_USER',
    },
  })

  // Test password verification
  const adminTest = await bcrypt.compare('admin123', adminPassword)
  const userTest = await bcrypt.compare('user123', userPassword)
  
  console.log('Admin password verification:', adminTest)
  console.log('User password verification:', userTest)

  // Create some sample templates
  const template1 = await prisma.template.create({
    data: {
      name: 'Welcome Message',
      content: 'Hello {name}, welcome to our service!',
      category: 'Welcome',
      userId: admin.id,
    },
  })

  const template2 = await prisma.template.create({
    data: {
      name: 'Promotional Offer',
      content: 'Hi {name}, check out our latest offer: {offer}',
      category: 'Promotion',
      userId: admin.id,
    },
  })

  // Create some sample contacts
  const contact1 = await prisma.contact.create({
    data: {
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
      tags: 'VIP, Customer',
      userId: user.id,
    },
  })

  const contact2 = await prisma.contact.create({
    data: {
      name: 'Jane Smith',
      phone: '+0987654321',
      email: 'jane@example.com',
      tags: 'Lead',
      userId: user.id,
    },
  })

  console.log('Database seeded successfully!')
  console.log('Admin user: admin@whatsx.com / admin123')
  console.log('Regular user: user@whatsx.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })