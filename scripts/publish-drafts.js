const { createClient } = require('@sanity/client');

// Check for required environment variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  console.error('❌ Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID');
  console.log('Please set this in your environment or .env.local file');
  process.exit(1);
}

if (!dataset) {
  console.error('❌ Missing environment variable: NEXT_PUBLIC_SANITY_DATASET');
  console.log('Please set this in your environment or .env.local file');
  process.exit(1);
}

if (!token) {
  console.error('❌ Missing environment variable: SANITY_API_WRITE_TOKEN');
  console.log('Please set this in your environment or .env.local file');
  console.log('You can get this token from your Sanity project settings');
  process.exit(1);
}

console.log(`✅ Using project: ${projectId}`);
console.log(`✅ Using dataset: ${dataset}`);
console.log(`✅ Using token: ${token.substring(0, 10)}...`);

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function publishDrafts() {
  try {
    console.log('Fetching all draft documents...');
    
    // Get all draft documents with a simpler query
    const drafts = await client.fetch(`
      *[_id in path("drafts.**")]{
        _id,
        _type,
        title
      }
    `);
    
    console.log(`Found ${drafts.length} draft documents`);
    
    if (drafts.length === 0) {
      console.log('✅ No draft documents found. All documents are already published.');
      return;
    }
    
    for (const draft of drafts) {
      console.log(`Processing draft: ${draft.title || draft._type} (${draft._id})`);
      
      try {
        // Get the full draft document
        const draftDoc = await client.getDocument(draft._id);
        
        if (!draftDoc) {
          console.log(`  ⚠️  Draft document not found, skipping: ${draft._id}`);
          continue;
        }
        
        // Remove the "drafts." prefix to get the published document ID
        const publishedId = draft._id.replace('drafts.', '');
        
        // Check if published version exists
        const publishedDoc = await client.getDocument(publishedId);
        
        if (publishedDoc) {
          console.log(`  ✅ Published version already exists: ${publishedId}`);
          continue;
        }
        
        // Create the published version
        const publishedDocData = {
          ...draftDoc,
          _id: publishedId,
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
        };
        
        // Remove draft-specific fields
        delete publishedDocData._rev;
        
        await client.create(publishedDocData);
        console.log(`  ✅ Published: ${publishedId}`);
        
      } catch (err) {
        console.error(`  ❌ Error publishing ${draft._id}:`, err.message);
      }
    }
    
    console.log('\n🎉 Draft publishing completed!');
    console.log('\nNext steps:');
    console.log('1. Try publishing your documents again in Sanity Studio');
    console.log('2. The "draft is missing" error should be resolved');
    
  } catch (err) {
    console.error('Error publishing drafts:', err);
  }
}

publishDrafts(); 