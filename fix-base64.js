const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fttvx1fa',
  dataset: 'production',
  token: 'sk3jSRyJO2axfO1QYuZGBWsOcs7LUSzcI3Tndjnm4cLExxidnJiZEtDXhdksXYuZBN84PFiATi0BQUYufdsRXclkMhp2Ul8sQjiZNdAQ2dVsedUV4iP0D3QY9TsL8Rnbl2znJ5zpyNxfoS0rFFgXzruBAt7kgWCUO9EO3lkiNCcqK0N3c7Y1',
  apiVersion: '2024-01-01',
  useCdn: false,
});

function isBase64Image(val) {
  return typeof val === 'string' && val.startsWith('data:image');
}

async function fixAllBase64Images() {
  // Fetch all documents (limit 10,000 for safety)
  const docs = await client.fetch('*[defined(_id)][0...10000]');
  let fixedCount = 0;
  for (const doc of docs) {
    let needsPatch = false;
    const unsetFields = [];
    for (const key of Object.keys(doc)) {
      if (isBase64Image(doc[key])) {
        console.log(`Found base64 image in doc ${doc._type} (${doc._id}) field '${key}'`);
        unsetFields.push(key);
        needsPatch = true;
      }
    }
    if (needsPatch) {
      await client.patch(doc._id).unset(unsetFields).commit();
      console.log(`Fixed doc: ${doc._type} (${doc._id}) - unset fields: ${unsetFields.join(', ')}`);
      fixedCount++;
    }
  }
  if (fixedCount === 0) {
    console.log('No base64 images found in any document or field.');
  } else {
    console.log(`Fixed ${fixedCount} documents with base64 images.`);
  }
}

fixAllBase64Images().catch(console.error); 