import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function cleanZero() {
  console.log('🧹 Clearing all test members, payments, revenue, attendance & workout logs...');

  // 1. Wipe all operational and financial data to clean zero
  await prisma.auditLog.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.workoutPlan.deleteMany();
  await prisma.member.deleteMany();

  console.log('✅ Wiped all Members, Payments (Revenue = 0 BDT), Attendance, and Workouts to ZERO.');

  // 2. Ensure User Portals are ready with distinct passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const trainerPasswordHash = await bcrypt.hash('trainer123', 10);
  const receptionPasswordHash = await bcrypt.hash('reception123', 10);
  const memberPasswordHash = await bcrypt.hash('member123', 10);

  // Upsert users
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: adminPasswordHash, role: 'ADMIN' },
    create: {
      username: 'admin',
      email: 'admin@bulletgym.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      fullName: 'Ahsan Bullet Admin',
      phone: '+880 1819-000111',
    },
  });

  await prisma.user.upsert({
    where: { username: 'reception' },
    update: { passwordHash: receptionPasswordHash, role: 'RECEPTIONIST' },
    create: {
      username: 'reception',
      email: 'reception@bulletgym.com',
      passwordHash: receptionPasswordHash,
      role: 'RECEPTIONIST',
      fullName: 'Sultana Razia (Front Desk)',
      phone: '+880 1812-445566',
    },
  });

  await prisma.user.upsert({
    where: { username: 'trainer' },
    update: { passwordHash: trainerPasswordHash, role: 'TRAINER' },
    create: {
      username: 'trainer',
      email: 'trainer@bulletgym.com',
      passwordHash: trainerPasswordHash,
      role: 'TRAINER',
      fullName: 'Coach Tanvir Ahmed',
      phone: '+880 1711-002233',
    },
  });

  await prisma.user.upsert({
    where: { username: 'member' },
    update: { passwordHash: memberPasswordHash, role: 'MEMBER' },
    create: {
      username: 'member',
      email: 'member@bulletgym.com',
      passwordHash: memberPasswordHash,
      role: 'MEMBER',
      fullName: 'Gym Member Portal',
      phone: '+880 1818-778899',
    },
  });

  // 3. Ensure Membership Packages exist
  const existingPlans = await prisma.membershipPlan.count();
  if (existingPlans === 0) {
    await prisma.membershipPlan.createMany({
      data: [
        { name: 'Daily Drop-in Pass', duration: '1 Day', durationDays: 1, price: 500, isPopular: false, description: 'Single-session pass to gym floor and cardio equipment.' },
        { name: 'Weekly Pass', duration: '7 Days', durationDays: 7, price: 1200, isPopular: false, description: '7-day unlimited access for visitors and travelers.' },
        { name: 'Monthly Standard', duration: '1 Month', durationDays: 30, price: 2500, isPopular: true, description: '30-day all-access membership to strength and cardio zones.' },
        { name: 'Quarterly Beast', duration: '3 Months', durationDays: 90, price: 6500, isPopular: false, description: '3-month package with free trainer orientation.' },
        { name: 'Half-Year Shred', duration: '6 Months', durationDays: 180, price: 12000, isPopular: false, description: '6-month comprehensive transformation pass.' },
        { name: 'Annual Bullet VIP', duration: '1 Year', durationDays: 365, price: 22000, isPopular: true, description: '1-year unlimited VIP access, locker, and 2 trainer sessions.' },
      ],
    });
  }

  // 4. Ensure Trainers exist
  const existingTrainers = await prisma.trainer.count();
  if (existingTrainers === 0) {
    await prisma.trainer.createMany({
      data: [
        { name: 'Tanvir Ahmed', phone: '+880 1711-002233', email: 'tanvir@bulletgym.com', specialization: 'Bodybuilding & Powerlifting', salary: 35000, bio: '7+ years experience in hypertrophy and strength.' },
        { name: 'Farhana Akter', phone: '+880 1812-334455', email: 'farhana@bulletgym.com', specialization: 'CrossFit & HIIT Conditioning', salary: 32000, bio: 'Certified functional fitness instructor.' },
        { name: 'Rashedul Karim', phone: '+880 1913-667788', email: 'rashed@bulletgym.com', specialization: 'Fat Loss & Clinical Nutrition', salary: 30000, bio: 'Specialist in metabolic conditioning.' },
      ],
    });
  }

  console.log('🎉 Database successfully zeroed out! Ready for clean production operations.');
}

cleanZero()
  .catch((e) => {
    console.error('Error zeroing database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
