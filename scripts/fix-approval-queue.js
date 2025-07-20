const { adminClient } = require('../sanity/lib/adminClient');

async function fixApprovalQueue() {
  try {
    console.log('🔧 Fixing approval queue fields...\n');

    // Find communities with null approvalQueue
    const communities = await adminClient.fetch(`
      *[_type == "subreddit" && !defined(approvalQueue) || approvalQueue == null]{
        _id,
        title,
        slug,
        type,
        approvalQueue
      }
    `);

    console.log(`Found ${communities.length} communities with null/missing approvalQueue:\n`);

    for (const community of communities) {
      console.log(`Fixing: ${community.title} (${community.slug?.current || 'no slug'})`);
      
      try {
        await adminClient
          .patch(community._id)
          .set({ approvalQueue: [] })
          .commit();
        
        console.log(`✅ Fixed approvalQueue for ${community.title}`);
      } catch (error) {
        console.error(`❌ Failed to fix ${community.title}:`, error.message);
      }
    }

    // Also check for communities with empty approvalQueue arrays
    const communitiesWithEmptyQueue = await adminClient.fetch(`
      *[_type == "subreddit" && defined(approvalQueue) && count(approvalQueue) == 0]{
        _id,
        title,
        slug,
        type
      }
    `);

    console.log(`\nFound ${communitiesWithEmptyQueue.length} communities with empty approvalQueue arrays (this is normal):`);
    communitiesWithEmptyQueue.forEach(c => {
      console.log(`  - ${c.title} (${c.slug?.current || 'no slug'})`);
    });

    console.log('\n🎉 Approval queue fix completed!');

  } catch (error) {
    console.error('❌ Error fixing approval queue:', error);
  }
}

// Run the script
fixApprovalQueue(); 