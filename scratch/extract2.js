const fs = require('fs');
const js = fs.readFileSync('scratch/main.js', 'utf8');

const regex = /["'](\/[a-zA-Z0-9_\-]+(\/[a-zA-Z0-9_\-]+)*)["']/g;
const paths = [...js.matchAll(regex)].map(m => m[1]);

const interesting = paths.filter(p => p.length > 3 && !p.endsWith('.js') && !p.endsWith('.css') && !p.endsWith('.html'));
const unique = [...new Set(interesting)].sort();

fs.writeFileSync('scratch/paths.txt', unique.join('\n'));
