const axios = require('axios');

async function testRoutes() {
  const routes = [
    '/',
    '/houses',
    '/calendar',
    '/availability',
    '/bookings',
    '/api/trpc/booking.getAll', // common in tRPC
  ];

  for (const route of routes) {
    try {
      const { status } = await axios.get(`https://www.poolvilla-pwth.com${route}`, {
        headers: { RSC: "1" },
        validateStatus: () => true,
        timeout: 5000
      });
      console.log(`[${status}] ${route}`);
    } catch (e) {
      console.log(`[ERR] ${route}`);
    }
  }
}
testRoutes();
