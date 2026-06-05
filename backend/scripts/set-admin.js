/**
 * One-time script: Set pranavjain792879@gmail.com to ADMIN role in DB.
 * Run: node scripts/set-admin.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ADMIN_EMAIL = 'pranavjain792879@gmail.com';

  const user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (!user) {
    console.log(`❌ User ${ADMIN_EMAIL} not found in database.`);
    console.log('   The account will automatically get ADMIN role when they sign up.');
    return;
  }

  if (user.role === 'ADMIN') {
    console.log(`✅ ${ADMIN_EMAIL} already has ADMIN role. Nothing to do.`);
    return;
  }

  const updated = await prisma.user.update({
    where: { email: ADMIN_EMAIL },
    data: { role: 'ADMIN' },
  });

  console.log(`✅ Successfully updated ${updated.email} → role: ${updated.role}`);
  console.log(`   Name: ${updated.name}`);
  console.log(`   ID:   ${updated.id}`);
  console.log('');
  console.log('⚠️  The user must log out and log back in for the role change to take effect.');
}

main()
  .catch(e => { console.error('❌ Script failed:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
