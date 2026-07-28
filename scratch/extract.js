const fs = require('fs');
const js = fs.readFileSync('scratch/main.js', 'utf8');

// Find all string literals that look like paths
const matches = [...js.matchAll(/["'](\/[a-zA-Z0-9_\-]+(\/[a-zA-Z0-9_\-]+)*)["']/g)].map(m => m[1]);
const unique = [...new Set(matches)];
console.log(unique.filter(u => u.includes('house') || u.includes('property') || u.includes('api')));

// Also find strings starting with 'http'
const httpMatches = [...js.matchAll(/["'](https?:\/\/[a-zA-Z0-9_\-\.\/]+)["']/g)].map(m => m[1]);
console.log([...new Set(httpMatches)]);
