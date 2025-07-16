#!/usr/bin/env tsx

/**
 * Script to fix community types for existing communities
 * Run with: npx tsx scripts/fix-community-types.ts
 */

import { adminClient } from '../sanity/lib/adminClient';

async function fixCommunityTypes() {
  console.log("🔧 Checking and fixing community types...\n");

  try {
    // Fetch all communities
    const communities = await adminClient.fetch(`
      *[_type == "subreddit"]{
        _id,
        title,
        slug,
        type,
        members,
        approvalQueue
      }
    `);

    console.log(`Found ${communities.length} communities\n`);

    for (const community of communities) {
      console.log(`Checking community: ${community.title} (${community.slug?.current || 'no slug'})`);
      
      // If type is not set, set it to "restricted" for safety
      if (!community.type) {
        console.log(`  ❌ No type set - setting to "restricted"`);
        
        await adminClient
          .patch(community._id)
          .set({ type: 'restricted' })
          .commit();
        
        console.log(`  ✅ Updated type to "restricted"`);
      } else {
        console.log(`  ✅ Type already set to "${community.type}"`);
      }

      // Check if members array exists and has proper structure
      if (!community.members || community.members.length === 0) {
        console.log(`  ℹ️  No members found`);
      } else {
        console.log(`  ℹ️  Has ${community.members.length} members`);
      }

      // Check approval queue
      if (!community.approvalQueue || community.approvalQueue.length === 0) {
        console.log(`  ℹ️  No pending approvals`);
      } else {
        console.log(`  ℹ️  Has ${community.approvalQueue.length} pending approvals`);
      }

      console.log('');
    }

    console.log("✅ Community type check completed!");
    
  } catch (error) {
    console.error("❌ Error fixing community types:", error);
    process.exit(1);
  }
}

// Run the script
fixCommunityTypes(); 