const axios = require('axios');

async function test() {
  try {
    const { data: text } = await axios.get("https://www.poolvilla-pwth.com/houses", {
      headers: { RSC: "1", Accept: "text/x-component" },
      responseType: "text"
    });
    
    const all = [];
    let pos = 0;
    while (true) {
      const idx = text.indexOf('"data":[{"_id"', pos);
      if (idx === -1) break;
      const arrStart = idx + '"data":'.length;
      let depth = 0, arrEnd = arrStart;
      for (let i = arrStart; i < text.length; i++) {
        if (text[i] === "[") depth++;
        else if (text[i] === "]") { depth--; if (depth === 0) { arrEnd = i; break; } }
      }
      try { all.push(...JSON.parse(text.slice(arrStart, arrEnd + 1))); } catch {}
      pos = arrEnd + 1;
    }
    
    console.log('Total houses extracted from 1 page:', all.length);
    console.log('Text length:', text.length);
    const m = text.match(/"total":(\d+)/);
    if(m) console.log('Total keyword says:', m[1]);
  } catch (e) {
    console.error(e.message);
  }
}
test();
