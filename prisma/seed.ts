// prisma/seed.ts
// Seed database with test users and sample jobs

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test customer
  const customerPassword = await bcrypt.hash('customer123', 10)
  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      password: customerPassword,
      name: 'John Smith',
      company: 'Smith Joinery',
      phone: '+64 21 123 4567',
      role: 'CUSTOMER',
    },
  })
  console.log('✅ Created customer:', customer.email)

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cabinetviz.com' },
    update: {},
    create: {
      email: 'admin@cabinetviz.com',
      password: adminPassword,
      name: 'Admin User',
      company: 'CabinetViz',
      role: 'ADMIN',
    },
  })
  console.log('✅ Created admin:', admin.email)

  // Create designer user
  const designerPassword = await bcrypt.hash('designer123', 10)
  const designer = await prisma.user.upsert({
    where: { email: 'designer@cabinetviz.com' },
    update: {},
    create: {
      email: 'designer@cabinetviz.com',
      password: designerPassword,
      name: 'Sarah Designer',
      company: 'CabinetViz',
      role: 'DESIGNER',
    },
  })
  console.log('✅ Created designer:', designer.email)

  // Create sample jobs for the customer
  const job1 = await prisma.job.upsert({
    where: { jobNumber: 'JOB-2024-001' },
    update: {},
    create: {
      jobNumber: 'JOB-2024-001',
      title: 'Modern Kitchen Renovation',
      description: 'Complete kitchen redesign with island bench and walk-in pantry',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      projectType: 'KITCHEN',
      roomType: 'L_SHAPED',
      roomWidth: 4500,
      roomLength: 3800,
      roomHeight: 2700,
      cabinetStyle: 'Modern Shaker',
      materialType: 'Polytec Melamine',
      colorScheme: 'White/Oak',
      handleStyle: 'Brushed Nickel Bar',
      budget: 15000,
      package: 'PROFESSIONAL',
      quotedPrice: 299,
      progress: 65,
      userId: customer.id,
    },
  })

  const job2 = await prisma.job.upsert({
    where: { jobNumber: 'JOB-2024-002' },
    update: {},
    create: {
      jobNumber: 'JOB-2024-002',
      title: 'Master Bedroom Walk-in Wardrobe',
      description: 'Walk-in wardrobe with his and hers sections, shoe rack, and island drawer unit',
      status: 'REVIEW',
      priority: 'NORMAL',
      projectType: 'WARDROBE',
      roomType: 'WALK_IN',
      roomWidth: 3200,
      roomLength: 2800,
      roomHeight: 2400,
      cabinetStyle: 'Contemporary',
      materialType: 'Laminex',
      colorScheme: 'Warm White',
      budget: 8000,
      package: 'PROFESSIONAL',
      quotedPrice: 149,
      progress: 100,
      userId: customer.id,
    },
  })

  const job3 = await prisma.job.upsert({
    where: { jobNumber: 'JOB-2024-003' },
    update: {},
    create: {
      jobNumber: 'JOB-2024-003',
      title: 'Home Office Built-ins',
      description: 'Custom desk with overhead storage and filing cabinets',
      status: 'PENDING',
      priority: 'NORMAL',
      projectType: 'HOME_OFFICE',
      roomWidth: 3000,
      roomLength: 2500,
      roomHeight: 2400,
      cabinetStyle: 'Modern',
      materialType: 'Melamine',
      colorScheme: 'White/Charcoal',
      budget: 5000,
      package: 'BASIC',
      progress: 0,
      userId: customer.id,
    },
  })

  const job4 = await prisma.job.upsert({
    where: { jobNumber: 'JOB-2024-004' },
    update: {},
    create: {
      jobNumber: 'JOB-2024-004',
      title: 'Bathroom Vanity Unit',
      description: 'Double basin vanity with soft-close drawers',
      status: 'COMPLETED',
      priority: 'LOW',
      projectType: 'BATHROOM_VANITY',
      roomWidth: 1800,
      roomLength: 600,
      roomHeight: 850,
      cabinetStyle: 'Modern',
      materialType: 'Polyurethane',
      colorScheme: 'Matte White',
      budget: 3500,
      package: 'PROFESSIONAL',
      quotedPrice: 149,
      progress: 100,
      userId: customer.id,
    },
  })

  console.log('✅ Created sample jobs:', [job1.jobNumber, job2.jobNumber, job3.jobNumber, job4.jobNumber].join(', '))

  // Add some comments
  await prisma.comment.createMany({
    data: [
      {
        jobId: job1.id,
        content: 'Started working on the 3D model. Kitchen layout looks great!',
        authorName: 'Sarah Designer',
        authorRole: 'DESIGNER',
      },
      {
        jobId: job1.id,
        content: 'Can we explore a darker benchtop option as well?',
        authorName: 'John Smith',
        authorRole: 'CUSTOMER',
      },
      {
        jobId: job2.id,
        content: 'Renders are ready for your review. Please check the deliverables section.',
        authorName: 'Sarah Designer',
        authorRole: 'DESIGNER',
      },
    ],
  })
  console.log('✅ Created sample comments')

  // Add status history
  await prisma.statusHistory.createMany({
    data: [
      {
        jobId: job1.id,
        fromStatus: null,
        toStatus: 'PENDING',
        note: 'Job created',
        changedBy: customer.name,
      },
      {
        jobId: job1.id,
        fromStatus: 'PENDING',
        toStatus: 'QUOTED',
        note: 'Quote sent: $299',
        changedBy: admin.name,
      },
      {
        jobId: job1.id,
        fromStatus: 'QUOTED',
        toStatus: 'IN_PROGRESS',
        note: 'Customer approved quote',
        changedBy: admin.name,
      },
    ],
  })
  console.log('✅ Created status history')

  // Add notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: customer.id,
        title: 'Renders Ready for Review',
        message: 'Your wardrobe renders are ready! Check them out and let us know if you need any changes.',
        type: 'DELIVERABLE_READY',
        link: `/jobs/${job2.id}`,
      },
      {
        userId: customer.id,
        title: 'Progress Update',
        message: 'Your kitchen project is now 65% complete.',
        type: 'STATUS_UPDATE',
        link: `/jobs/${job1.id}`,
      },
    ],
  })
  console.log('✅ Created notifications')

  console.log('')
  console.log('🎉 Database seeded successfully!')
  console.log('')
  console.log('📋 Test Accounts:')
  console.log('─────────────────────────────────────────')
  console.log('CUSTOMER LOGIN:')
  console.log('  Email:    customer@test.com')
  console.log('  Password: customer123')
  console.log('')
  console.log('ADMIN LOGIN:')
  console.log('  Email:    admin@cabinetviz.com')
  console.log('  Password: admin123')
  console.log('')
  console.log('DESIGNER LOGIN:')
  console.log('  Email:    designer@cabinetviz.com')
  console.log('  Password: designer123')
  console.log('─────────────────────────────────────────')
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
