import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@whatsx.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@whatsx.com',
      password_hash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      default_country_code: '+92'
    },
  })

  // Create sample template using upsert to avoid unique constraint violations
  const template = await prisma.template.upsert({
    where: { 
      title_created_by: {
        title: 'Welcome Message',
        created_by: admin.id
      }
    },
    update: {},
    create: {
      title: 'Welcome Message',
      content: 'Hello {{name}}, welcome to WhatsX! We are excited to have you on board.',
      created_by: admin.id,
      is_active: true,
    },
  })

  // Create sample end user
  const endUserPassword = await bcrypt.hash('user123', 12)
  const endUser = await prisma.user.upsert({
    where: { email: 'user@whatsx.com' },
    update: {},
    create: {
      name: 'Regular User',
      email: 'user@whatsx.com',
      password_hash: endUserPassword,
      role: 'END_USER',
      status: 'ACTIVE',
      default_country_code: '+1',
    },
  })

  // Delete existing contacts for this user to avoid duplicates
  await prisma.contact.deleteMany({
    where: { owner_id: endUser.id }
  })

  // Create sample contacts for the end user
  const contacts = [
    { name: 'John Doe', raw_phone: '+1234567890', label: 'Friend' },
    { name: 'Jane Smith', raw_phone: '+1987654321', label: 'Colleague' },
    { name: 'Bob Johnson', raw_phone: '+1555555555', label: 'Family' },
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

  console.log('Database seeded successfully!')
  console.log('Admin user: admin@whatsx.com / admin123')
  console.log('End user: user@whatsx.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })