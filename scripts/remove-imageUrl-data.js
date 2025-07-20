// Script to remove any remaining imageUrl data from Sanity
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

async function removeImageUrlData() {
  console.log('🔍 Searching for documents with imageUrl field...');
  
  try {
    // Find all documents that have an imageUrl field
    const documentsWithImageUrl = await client.fetch(`
      *[defined(imageUrl)]{
        _id,
        _type,
        imageUrl
      }
    `);
    
    if (documentsWithImageUrl.length === 0) {
      console.log('✅ No documents with imageUrl field found!');
      return;
    }
    
    console.log(`📊 Found ${documentsWithImageUrl.length} documents with imageUrl field`);
    console.log('📋 Documents by type:');
    
    const typeCount = {};
    documentsWithImageUrl.forEach(doc => {
      typeCount[doc._type] = (typeCount[doc._type] || 0) + 1;
    });
    
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} documents`);
    });
    
    console.log('\n📝 Documents that will be cleaned:');
    documentsWithImageUrl.forEach(doc => {
      console.log(`  - ${doc._type} (${doc._id}): ${doc.imageUrl}`);
    });
    
    console.log('\n🗑️ Removing imageUrl field from all documents...');
    
    // Remove imageUrl field from each document
    for (const doc of documentsWithImageUrl) {
      try {
        await client.patch(doc._id).unset(['imageUrl']).commit();
        console.log(`✅ Removed imageUrl from ${doc._type} (${doc._id})`);
      } catch (error) {
        console.error(`❌ Failed to remove imageUrl from ${doc._type} (${doc._id}):`, error.message);
      }
    }
    
    console.log('\n🎉 Cleanup completed!');
    
    // Verify cleanup
    const remainingDocs = await client.fetch(`
      *[defined(imageUrl)]{
        _id,
        _type
      }
    `);
    
    if (remainingDocs.length === 0) {
      console.log('✅ Verification: No documents with imageUrl field remain');
    } else {
      console.log(`❌ Verification: ${remainingDocs.length} documents still have imageUrl field`);
    }
    
  } catch (error) {
    console.error('💥 Error during cleanup:', error.message);
  }
}

removeImageUrlData(); 