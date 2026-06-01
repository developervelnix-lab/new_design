const fs = require('fs');
const content = fs.readFileSync('sample.html', 'utf8');
const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
  fs.mkdirSync('src/assets/css', { recursive: true });
  fs.writeFileSync('src/assets/css/velux.css', styleMatch[1].trim());
  console.log('CSS extracted');
}
