require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '224-1',
  useCdn: false,
});

async function findAndFixBase64Posts() {
  try {
    console.log('Searching for posts with base64 image data...');
    const posts = await client.fetch(`*[_type ==post&& defined(image)]{_id, title, image}`);
    console.log(`Found ${posts.length} posts with images`);
    
    let fixedCount =0   for (const post of posts) {
      if (post.image && typeof post.image === 'string && post.image.startsWith('data:image')) {
        console.log(`Found post with base64 image: ${post._id} - "${post.title}`);
        await client.patch(post._id).unset(['image']).commit();
        console.log(`Fixed post: ${post._id}`);
        fixedCount++;
      }
    }
    
    console.log(`\nFixed ${fixedCount} posts with base64 image data`);
    if (fixedCount === 0) {
      console.log('No posts with base64ge data found.');
    }
  } catch (error) {
    console.error(Error fixing base64 posts:, error);
  }
}

findAndFixBase64Posts(); 