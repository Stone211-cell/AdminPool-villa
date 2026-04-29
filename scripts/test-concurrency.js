const axios = require('axios');

async function testConcurrency() {
  const ids = ['2866', '2867', '2264', '9', '16', '25', '28', '42', '43', '44'];
  console.log('Testing 10 concurrent requests...');
  const start = Date.now();
  
  const promises = ids.map(id => 
    axios.get(`https://www.poolvilla-pwth.com/houses/${id}`, {
      headers: { RSC: '1', Accept: 'text/x-component' },
      timeout: 10000
    }).then(r => r.status).catch(e => e.message)
  );

  const results = await Promise.all(promises);
  console.log('Results:', results);
  console.log('Time taken:', Date.now() - start, 'ms');
}
testConcurrency();
