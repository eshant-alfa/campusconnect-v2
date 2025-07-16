const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN, // Needs write access
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function fixMarketplaceItems() {
  try {
    const items = await client.fetch('*[_type == "marketplaceItem"]{_id, status, isActive, images}');
    for (const item of items) {
      const fixedImages = Array.isArray(item.images)
        ? item.images.filter(img => img.asset && img.asset._ref)
        : [];
      await client.patch(item._id)
        .set({
          status: 'approved',
          isActive: true,
          images: fixedImages,
        })
        .commit();
      console.log(`Fixed item: ${item._id}`);
    }
    console.log('All marketplace items fixed!');
  } catch (err) {
    console.error('Error fixing marketplace items:', err);
  }
}

fixMarketplaceItems(); 