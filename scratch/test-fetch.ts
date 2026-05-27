// scratch/test-fetch.ts
import { fetchHouses } from "../lib/api/houses";

async function main() {
  console.log("Starting fetchHouses...");
  try {
    const start = Date.now();
    const houses = await fetchHouses();
    console.log(`Fetched ${houses.length} houses in ${Date.now() - start}ms`);
  } catch (err) {
    console.error("Error fetching houses:", err);
  }
}

main();
