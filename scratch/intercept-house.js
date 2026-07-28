const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/')) {
      const status = response.status();
      console.log('API Response:', status, url);
      if (status === 200 || status === 201) {
        try {
          const text = await response.text();
          if (text.length > 0) {
            console.log('Response body (first 300 chars):', text.slice(0, 300));
          }
        } catch (e) {}
      }
    }
  });

  console.log('Navigating to poolvillacity.co.th/CITY-293...');
  await page.goto('https://poolvillacity.co.th/CITY-293', { waitUntil: 'networkidle' });
  
  console.log('Waiting 3 seconds...');
  await page.waitForTimeout(3000);
  
  await browser.close();
})();
