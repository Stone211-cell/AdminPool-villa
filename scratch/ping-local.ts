// scratch/ping-local.ts
import axios from "axios";

async function ping() {
  console.log("Pinging local server at http://localhost:3000/api/availability...");
  const start = Date.now();
  try {
    const res = await axios.get("http://localhost:3000/api/availability", { timeout: 10000 });
    console.log("SUCCESS!");
    console.log("Status:", res.status);
    console.log("Keys in response:", Object.keys(res.data));
    if (res.data.houses) {
      console.log("Number of houses in response:", res.data.houses.length);
    }
    console.log("Time taken:", Date.now() - start, "ms");
  } catch (e: any) {
    console.log("FAILED!");
    console.log("Error message:", e.message);
    if (e.response) {
      console.log("Response status:", e.response.status);
      console.log("Response headers:", e.response.headers);
    }
  }
}

ping();
