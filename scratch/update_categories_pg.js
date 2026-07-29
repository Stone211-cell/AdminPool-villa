const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  console.log("Connected to database");

  const { rows: houses } = await client.query('SELECT id, h_id FROM houses');
  
  let promoCount = 0;
  let recommendCount = 0;

  for (let i = 0; i < houses.length; i++) {
    const house = houses[i];
    let category = "NORMAL";
    
    // Assign 4 random promo houses and 4 recommend houses
    if (promoCount < 4 && Math.random() > 0.5) {
      category = "PROMOTION";
      promoCount++;
    } else if (recommendCount < 4 && Math.random() > 0.5) {
      category = "RECOMMENDED";
      recommendCount++;
    }

    if (category !== "NORMAL") {
      await client.query('UPDATE houses SET category = $1 WHERE id = $2', [category, house.id]);
      console.log(`Updated house ${house.h_id} to ${category}`);
    }
  }

  await client.end();
  console.log("Done");
}

main().catch(console.error);
