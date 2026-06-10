const axios = require('axios');

async function testPublic() {
  try {
    const res = await axios.get('http://localhost:5001/api/v1/products/public');
    console.log('✅ Public Products retrieved:');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

testPublic();
