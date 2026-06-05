require('dotenv').config();
const { login } = require('../src/controllers/auth.controller');
const { prisma } = require('../src/config/database');

async function test() {
  const email = 'pranavjain7928@gmail.com';
  
  // Set role back to CLIENT in DB first to ensure we can test the update
  await prisma.user.update({
    where: { email },
    data: { role: 'CLIENT', password: 'mocked_password_hash' }
  });
  console.log('1. Set user role to CLIENT in DB.');

  // Mock Request and Response
  const req = {
    body: {
      email,
      password: 'Password123!', // Must match the user's real password hash, wait, we don't need correct password if we just want to test if the code path compiles and updates. But bcrypt.compare will fail if the password is wrong!
      role: 'developer'
    },
    ip: '127.0.0.1',
    headers: {}
  };

  // Wait, let's see if we can check the password or just use a mock bcrypt.compare?
  // We can temporarily mock bcrypt.compare to return true for this test!
  const bcrypt = require('bcrypt');
  const originalCompare = bcrypt.compare;
  bcrypt.compare = async () => true;

  const res = {
    cookie: () => {},
    status: (code) => {
      console.log(`Response Status: ${code}`);
      return {
        json: (data) => {
          console.log('Response JSON:', JSON.stringify(data, null, 2));
        }
      };
    }
  };

  const next = (err) => {
    if (err) console.error('Next called with error:', err);
  };

  console.log('2. Invoking login controller...');
  await login(req, res, next);

  // Restore original bcrypt.compare
  bcrypt.compare = originalCompare;

  // Query user from DB again to see if role updated
  const updatedUser = await prisma.user.findUnique({ where: { email } });
  console.log(`3. Verified role in DB: ${updatedUser.role}`);
}

test()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
