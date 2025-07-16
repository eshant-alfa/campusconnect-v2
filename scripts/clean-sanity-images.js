const fs = require('fs');
const readline = require('readline');

const inputFile = 'export.ndjson';
const outputFile = 'export.cleaned.ndjson';

// List all schema types and field names that should be images
const imageFields = [
  { type: 'event', field: 'image' },
  { type: 'post', field: 'image' },
  { type: 'user', field: 'image' },
  { type: 'subreddit', field: 'image' },
  // Add more as needed
];

function isBadImageValue(val) {
  return typeof val === 'string' && (
    val.startsWith('data:image') ||
    val.startsWith('http')
  );
}

function cleanImageField(doc, field) {
  if (!doc[field]) return;
  if (Array.isArray(doc[field])) {
    // Clean arrays of images
    doc[field] = doc[field].filter(img => {
      if (isBadImageValue(img)) {
        console.log(`Removing bad image from array in ${doc._type} ${doc._id}`);
        return false;
      }
      // If it's an object, check for nested asset
      if (typeof img === 'object' && img !== null && isBadImageValue(img.asset)) {
        console.log(`Removing bad nested image from array in ${doc._type} ${doc._id}`);
        return false;
      }
      return true;
    });
  } else if (isBadImageValue(doc[field])) {
    // Clean top-level string image
    console.log(`Removing bad image from ${doc._type} ${doc._id}`);
    delete doc[field];
  } else if (typeof doc[field] === 'object' && doc[field] !== null) {
    // Clean nested asset field
    if (isBadImageValue(doc[field].asset)) {
      console.log(`Removing bad nested image from ${doc._type} ${doc._id}`);
      delete doc[field];
    }
  }
}

async function process() {
  const rl = readline.createInterface({
    input: fs.createReadStream(inputFile),
    crlfDelay: Infinity
  });
  const out = fs.createWriteStream(outputFile);

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      let doc = JSON.parse(trimmed);
      if (!doc || typeof doc._type !== 'string') {
        // Only write valid Sanity documents
        continue;
      }
      for (const { type, field } of imageFields) {
        if (doc._type === type) {
          cleanImageField(doc, field);
        }
      }
      out.write(JSON.stringify(doc) + '\n');
    } catch (err) {
      console.warn('Skipping invalid line:', trimmed);
    }
  }
  out.end();
  console.log('Done! Cleaned file written to', outputFile);
}

process(); 