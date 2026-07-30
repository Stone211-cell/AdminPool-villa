import axios from 'axios';

async function check() {
  const { data: text } = await axios.get("https://www.poolvilla-pwth.com/houses", {
    headers: { RSC: "1", Accept: "text/x-component", "User-Agent": "Mozilla/5.0" },
    responseType: "text",
  });

  const all = [];
  let pos = 0;
  while (true) {
    const marker = '"data":[{"_id"';
    const idx = text.indexOf(marker, pos);
    if (idx === -1) break;
    const arrStart = idx + '"data":'.length;
    let depth = 0, arrEnd = arrStart;
    for (let i = arrStart; i < text.length; i++) {
      if (text[i] === "[") depth++;
      else if (text[i] === "]") { depth--; if (depth === 0) { arrEnd = i; break; } }
    }
    try { all.push(...JSON.parse(text.slice(arrStart, arrEnd + 1))); } catch { /**/ }
    pos = arrEnd + 1;
  }
  
  const house999 = all.find(h => h.h_id === "999");
  console.log("Poolvilla-pwth.com Data for 999:", house999);
}

check().catch(console.error);
