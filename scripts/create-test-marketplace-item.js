const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN, // You'll need a token with write access
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function createTestMarketplaceItem() {
  try {
    // First, let's find a user to use as the seller
    const users = await client.fetch('*[_type == "user"][0...1]{_id, username}');
    
    if (users.length === 0) {
      console.log('No users found in database. Please create a user first.');
      return;
    }

    const seller = users[0];
    console.log('Using seller:', seller);

    // Create a test marketplace item
    const testItem = await client.create({
      _type: 'marketplaceItem',
      title: 'Test Laptop - MacBook Pro 2021',
      description: 'Excellent condition MacBook Pro with M1 chip. Perfect for students. Includes charger and original box.',
      price: 1200,
      category: 'electronics',
      condition: 'like-new',
      status: 'approved', // Set to approved so it shows up
      isActive: true,
      seller: {
        _type: 'reference',
        _ref: seller._id
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Note: We're not including images for this test
    });

    console.log('Test marketplace item created:', testItem._id);
    console.log('You can now view it at: http://localhost:3000/marketplace');
  } catch (error) {
    console.error('Error creating test marketplace item:', error);
  }
}

createTestMarketplaceItem(); 