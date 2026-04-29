const axios = require('axios');

axios.get('https://www.poolvilla-pwth.com/houses/9', {
  headers: { RSC: '1', Accept: 'text/x-component', 'User-Agent': 'Mozilla/5.0' },
  responseType: 'text', timeout: 15000
}).then(r => {
  const text = r.data;
  // The RSC stream has lines like: N:{"acc":{...},"bk":{...}}
  // Find the JSON chunk that has BOTH acc and bk
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.includes('"bk"') && line.includes('"acc"')) {
      // Find the { that starts the data object
      const firstBrace = line.indexOf('{');
      if (firstBrace === -1) continue;
      try {
        // Try to parse from that position
        let depth = 0, end = firstBrace;
        for (let i = firstBrace; i < line.length; i++) {
          if (line[i] === '{') depth++;
          else if (line[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
        }
        const obj = JSON.parse(line.slice(firstBrace, end + 1));
        if (obj.acc && obj.bk) {
          console.log('=== acc keys ===', Object.keys(obj.acc));
          console.log('=== bk keys ===', Object.keys(obj.bk));
          console.log('=== bookings ===', obj.bk.bookings.slice(0, 2));
          console.log('=== base_price ===', obj.bk.base_price);
          break;
        }
      } catch(e) {}
    }
  }
}).catch(e => console.error('ERROR:', e.message));
