// Verification script to check if all imageUrl data has been removed
const { createClient } = require('@sanity/client');

// Using your actual Sanity configuration
const projectId = 'fttvx1fa';
const dataset = 'production';
const token = 'skE6xCtEa8134ggbpGF8pDOkSwGOw2SWDp6Av9k4B01BrvpUQTDlROCAN7e6zAnXzRkcU2IuaBcaJKFhCpvSw39jUOODdVhmB94FHwQvmhFLwxItbRj4h9xhAZwE1foOU7i0sdnvvbDiINNv7xHGuBOpDg7O64Bm8BvKuHi6ZpI61KqO2xV9';

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function verifyCleanup() {
  console.log('🔍 Verifying imageUrl cleanup...');
  
  try {
    // Check if any documents still have imageUrl field
    const documentsWithImageUrl = await client.fetch(`
      *[defined(imageUrl)]{
        _id,
        _type,
        imageUrl
      }
    `);
    
    if (documentsWithImageUrl.length === 0) {
      console.log('✅ SUCCESS: No documents with imageUrl field found!');
      console.log('🎉 All imageUrl data has been successfully removed!');
    } else {
      console.log(`❌ Found ${documentsWithImageUrl.length} documents still with imageUrl field:`);
      documentsWithImageUrl.forEach(doc => {
        console.log(`  - ${doc._type} (${doc._id}): ${doc.imageUrl}`);
      });
    }
    
    // Also check for documents with the correct 'image' field
    const documentsWithImage = await client.fetch(`
      *[defined(image)]{
        _id,
        _type
      }
    `);
    
    console.log(`📊 Documents with correct 'image' field: ${documentsWithImage.length}`);
    
    // Check for any documents that might have both fields
    const documentsWithBoth = await client.fetch(`
      *[defined(imageUrl) && defined(image)]{
        _id,
        _type
      }
    `);
    
    if (documentsWithBoth.length > 0) {
      console.log(`⚠️ Found ${documentsWithBoth.length} documents with both imageUrl and image fields`);
    }
    
  } catch (error) {
    console.error('💥 Error during verification:', error.message);
  }
}

verifyCleanup(); 