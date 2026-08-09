import axios from 'axios';

const token = "mzQORJ4TeoDpIYFmmHgfsnV62+QRBxMYVJPbBV3b2AXNEsb8ysiqibKy1OiaohCfigkzK0ouoQINGxoA+dP9aEImSpug6kxmR3qGGQ+V4lmXVs/gtFhSA5flfiTL4fOADbeMmAAV2KVu9YOXEn6htQdB04t89/1O/w1cDnyilFU=";

async function checkWebhook() {
  try {
    const res = await axios.get('https://api.line.me/v2/bot/channel/webhook/endpoint', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Webhook info:', res.data);
  } catch (e: any) {
    console.log('Error checking webhook:', e.response?.data || e.message);
  }
}
checkWebhook();
