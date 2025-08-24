// scripts/clearDb.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function clearDB() {
  try {
    console.log("🧹 Clearing database...");

    await prisma.transaction.deleteMany();
    await prisma.monthlyBalance.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.due.deleteMany();
    await prisma.notes.deleteMany();

    // await prisma.account.deleteMany();
    // await prisma.session.deleteMany();
    // await prisma.verification.deleteMany();
    // await prisma.user.deleteMany();

    console.log("✅ All data deleted successfully.");
  } catch (error) {
    console.error("❌ Error clearing DB:", error);
  } finally {
    await prisma.$disconnect();
  }
}


