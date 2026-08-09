import axios from 'axios';

async function test() {
  const payload = {
    events: [
      {
        type: 'message',
        message: { type: 'text', text: 'myid' },
        source: { userId: 'U123456789' },
        replyToken: 'dummy-token'
      }
    ]
  };

  try {
    console.log('Testing localhost...');
    const res = await axios.post('http://localhost:3000/api/webhook/line', payload);
    console.log('Localhost OK:', res.data);
  } catch (e: any) {
    console.log('Localhost fail:', e.message);
  }

  try {
    console.log('Testing Vercel...');
    const res2 = await axios.post('https://pool-villaptong.vercel.app/api/webhook/line', payload);
    console.log('Vercel OK:', res2.data);
  } catch (e: any) {
    console.log('Vercel fail:', e.message);
    if (e.response) console.log('Data:', e.response.data);
  }
}
test();
