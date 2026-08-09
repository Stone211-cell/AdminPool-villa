import axios from 'axios';

const token = "mzQORJ4TeoDpIYFmmHgfsnV62+QRBxMYVJPbBV3b2AXNEsb8ysiqibKy1OiaohCfigkzK0ouoQINGxoA+dP9aEImSpug6kxmR3qGGQ+V4lmXVs/gtFhSA5flfiTL4fOADbeMmAAV2KVu9YOXEn6htQdB04t89/1O/w1cDnyilFU=";

async function checkInfo() {
  try {
    const res = await axios.get('https://api.line.me/v2/bot/info', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Bot info:', res.data);
  } catch (e: any) {
    console.log('Error:', e.response?.data || e.message);
  }
}
checkInfo();
