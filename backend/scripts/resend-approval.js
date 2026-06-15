require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { sendProductApprovedEmail } = require('../src/services/email.service');

const prisma = new PrismaClient();

async function main() {
  console.log('Searching for approved products for developer: pranavjain7928@gmail.com...');
  
  // Find the developer in the DB
  const developer = await prisma.user.findUnique({
    where: { email: 'pranavjain7928@gmail.com' }
  });

  if (!developer) {
    console.error('❌ Developer pranavjain7928@gmail.com not found in the database.');
    return;
  }

  // Find approved products by this developer
  const products = await prisma.product.findMany({
    where: {
      developerId: developer.id,
      status: 'APPROVED'
    }
  });

  if (products.length === 0) {
    console.log('ℹ️ No approved products found for this developer. Checking pending review products...');
    const pendingProducts = await prisma.product.findMany({
      where: {
        developerId: developer.id,
        status: 'PENDING_REVIEW'
      }
    });
    
    if (pendingProducts.length > 0) {
      console.log(`Found ${pendingProducts.length} pending products. Please approve one from the Admin Panel first.`);
    } else {
      console.log('No products found under this developer account.');
    }
    return;
  }

  console.log(`Found ${products.length} approved product(s). Sending approval email(s)...`);
  for (const product of products) {
    console.log(`Sending approval email for "${product.title}" to ${developer.email}...`);
    try {
      await sendProductApprovedEmail(developer.email, developer.name, product.title);
      console.log(`✅ Success! Email sent for "${product.title}".`);
    } catch (err) {
      console.error(`❌ Failed to send email for "${product.title}":`, err.message);
    }
  }
}

main()
  .catch(e => console.error('Error running resend script:', e))
  .finally(() => prisma.$disconnect());
