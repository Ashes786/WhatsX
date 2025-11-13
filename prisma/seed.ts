import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@whatsx.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@whatsx.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE'
    },
  })

  console.log('Created admin user:', admin)

  // Create a test operator user
  const operatorPassword = await bcrypt.hash('operator123', 10)
  const operator = await prisma.user.upsert({
    where: { email: 'operator@whatsx.com' },
    update: {},
    create: {
      name: 'Test Operator',
      email: 'operator@whatsx.com',
      passwordHash: operatorPassword,
      role: 'OPERATOR',
      status: 'ACTIVE'
    },
  })

  console.log('Created operator user:', operator)

  // Create sample templates
  const template1 = await prisma.template.create({
    data: {
      userId: admin.id,
      title: 'Welcome Message',
      content: 'Hello {name}! Welcome to our service. We\'re excited to have you on board!'
    }
  })

  console.log('Created template:', template1)

  const template2 = await prisma.template.create({
    data: {
      userId: admin.id,
      title: 'Promotional Offer',
      content: 'Hi {name}! Check out our special offer: {offer}. Limited time only!'
    }
  })

  console.log('Created template:', template2)

  // Create sample contacts for operator
  const contact1 = await prisma.contact.create({
    data: {
      userId: operator.id,
      name: 'John Doe',
      phoneNumber: '+1234567890',
      label: 'VIP Customer'
    }
  })

  console.log('Created contact:', contact1)

  const contact2 = await prisma.contact.create({
    data: {
      userId: operator.id,
      name: 'Jane Smith',
      phoneNumber: '+0987654321',
      label: 'Regular Customer'
    }
  })

  console.log('Created contact:', contact2)

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })