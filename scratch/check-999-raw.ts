import axios from 'axios';

async function fetchDetail(hId: string) {
  try {
    const { data: text } = await axios.get(
      `https://www.poolvilla-pwth.com/houses/${hId}`,
      { headers: { RSC: "1", Accept: "text/x-component", "User-Agent": "Mozilla/5.0" }, responseType: "text", timeout: 15000 }
    );
    for (const line of text.split("\n")) {
      if (!line.includes('"bk"') || !line.includes('"acc"')) continue;
      const firstBrace = line.indexOf("{");
      if (firstBrace === -1) continue;
      try {
        let depth = 0, end = firstBrace;
        for (let i = firstBrace; i < line.length; i++) {
          if (line[i] === "{") depth++;
          else if (line[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
        }
        const obj = JSON.parse(line.slice(firstBrace, end + 1));
        if (obj.acc && obj.bk) return obj.bk;
      } catch { /**/ }
    }
  } catch (e) { console.error(e); }
}

fetchDetail('999').then(bk => {
  console.log("Raw bk object:");
  console.log(JSON.stringify(bk, null, 2));
});
