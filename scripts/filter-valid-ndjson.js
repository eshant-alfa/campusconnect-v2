const fs = require('fs');
const input = 'export.cleaned.ndjson';
const output = 'export.cleaned.valid.ndjson';

const lines = fs.readFileSync(input, 'utf-8').split('\n');
const valid = lines.filter(line => {
  try {
    const obj = JSON.parse(line);
    return obj && typeof obj._type === 'string';
  } catch {
    return false;
  }
});
fs.writeFileSync(output, valid.join('\n'));
console.log('Wrote only valid lines to', output); 