const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

const promoDir = path.join(__dirname, 'public', 'promotion');
const files = fs.readdirSync(promoDir).filter(f => f.endsWith('.jpg'));

async function processImages() {
  console.log(`Found ${files.length} images to process.`);
  for (const file of files) {
    const filePath = path.join(promoDir, file);
    try {
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
      
      let price = 'other';
      if (text.includes('2,900') || text.includes('2900')) price = '2900';
      else if (text.includes('3,500') || text.includes('3500')) price = '3500';
      else if (text.includes('3,900') || text.includes('3900') || text.includes('8,900') || text.includes('3,9OO')) price = '3900';
      else if (text.includes('4,900') || text.includes('4900')) price = '4900';
      
      const targetDir = path.join(promoDir, price);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      fs.renameSync(filePath, path.join(targetDir, file));
      console.log(`Moved ${file} to folder ${price}`);
    } catch (e) {
      console.log(`Failed to process ${file}: ${e.message}`);
    }
  }
  console.log("Done processing all images.");
}

processImages();
