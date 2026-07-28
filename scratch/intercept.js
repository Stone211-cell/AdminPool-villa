const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('request', request => {
    const url = request.url();
    if (url.includes('api.poolvillacity.co.th') || url.includes('/api/')) {
      console.log('API Request:', request.method(), url);
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api.poolvillacity.co.th') || url.includes('/api/')) {
      console.log('API Response:', response.status(), url);
      try {
        const text = await response.text();
        if (text.length > 0) {
          console.log('Response body (first 200 chars):', text.slice(0, 200));
        }
      } catch (e) {
        console.log('Could not read response body');
      }
    }
  });

  console.log('Navigating to poolvillacity.co.th...');
  await page.goto('https://poolvillacity.co.th/', { waitUntil: 'networkidle' });
  
  console.log('Waiting 5 seconds for any late requests...');
  await page.waitForTimeout(5000);
  
  await browser.close();
})();
