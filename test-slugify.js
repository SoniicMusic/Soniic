const slugify = require('slugify');

console.log('Testing current slugify behavior:');
console.log('========================================');

const testCases = [
  "Tokyo's Revenge",
  "Miley & The Band (feat. Artist)",
  "Hello, World!",
  "Artist's Name - Song Title",
  "50 Cent & Jay-Z",
  "Björk",
  "Café del Mar",
  "Rock'n'Roll"
];

testCases.forEach(test => {
  console.log(`Input: "${test}"`);
  console.log(`Current (lower): "${slugify(test, { lower: true })}"`);
  console.log(`With strict: "${slugify(test, { lower: true, strict: true })}"`);
  console.log('---');
});
