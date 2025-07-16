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

async function fixMarketplaceImages() {
  try {
    console.log('Fetching marketplace items...');
    const items = await client.fetch('*[_type == "marketplaceItem"]{_id, title, images, status, isActive}');
    
    console.log(`Found ${items.length} marketplace items`);
    
    for (const item of items) {
      console.log(`Processing: ${item.title} (${item._id})`);
      
      // Remove images with null assets or invalid structure
      const validImages = Array.isArray(item.images) 
        ? item.images.filter(img => {
            // Only keep images that have a proper asset reference
            return img && 
                   img._type === 'image' && 
                   img.asset && 
                   img.asset._ref && 
                   typeof img.asset._ref === 'string' &&
                   img.asset._ref.startsWith('image-');
          })
        : [];
      
      console.log(`  - Original images: ${item.images?.length || 0}`);
      console.log(`  - Valid images: ${validImages.length}`);
      
      // If no valid images remain, we need to handle this case
      if (validImages.length === 0) {
        console.log(`  ⚠️  No valid images found for: ${item.title}`);
        console.log(`  - Setting images to empty array`);
      }
      
      // Update the item
      await client.patch(item._id)
        .set({
          images: validImages,
          status: 'approved',
          isActive: true,
        })
        .commit();
      
      console.log(`  ✅ Fixed: ${item.title}`);
    }
    
    console.log('\n🎉 All marketplace items fixed!');
    console.log('\nNext steps:');
    console.log('1. Go to your Marketplace page - items should now show');
    console.log('2. Edit each item to upload new images');
    console.log('3. The images will now display properly');
    
  } catch (err) {
    console.error('Error fixing marketplace images:', err);
  }
}

fixMarketplaceImages(); 