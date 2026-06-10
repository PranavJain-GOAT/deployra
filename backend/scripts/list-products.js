const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      developer: { select: { email: true } },
      createdAt: true
    }
  });

  console.log('--- PRODUCT LIST ---');
  console.table(products.map(p => ({
    id: p.id,
    title: p.title,
    status: p.status,
    developer: p.developer?.email,
    createdAt: p.createdAt
  })));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
