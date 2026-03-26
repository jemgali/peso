import { PrismaClient } from '@/generated/prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { hashPassword } from '../src/lib/password'
import { generateId } from 'better-auth'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminEmail = 'jemgalleto2578@gmail.com'
  
  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    console.log('Admin user already exists.')
    return
  }

  const hashedPassword = await hashPassword('admin123')
  const userId = generateId() // Generate a unique ID for the user

  // Create the User
  const user = await prisma.user.create({
    data: {
      id: userId,
      name: 'System Admin',
      email: adminEmail,
      emailVerified: true, // Automatically verify the admin
      role: 'admin',       // Set the role to admin
    }
  })

  // Better Auth also requires an Account entry for email/password logins
  await prisma.account.create({
    data: {
      id: generateId(),
      userId: user.id,
      accountId: user.id,
      providerId: 'credential', // 'credential' is used for email/password
      password: hashedPassword,
    }
  })

  console.log('Superuser created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })