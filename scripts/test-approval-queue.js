const { adminClient } = require('../sanity/lib/adminClient');

async function testApprovalQueue() {
  try {
    console.log('🔍 Testing approval queue functionality...\n');

    // Fetch all communities with their approval queues
    const communities = await adminClient.fetch(`
      *[_type == "subreddit"]{
        _id,
        title,
        slug,
        type,
        "membersCount": count(members),
        "approvalQueueCount": count(approvalQueue),
        members[]{user->{_id, username, clerkId}, role, status},
        approvalQueue[]{user->{_id, username, clerkId}, requestedAt}
      }
    `);

    console.log(`Found ${communities.length} communities:\n`);

    communities.forEach((community, index) => {
      console.log(`${index + 1}. ${community.title} (${community.slug?.current || 'no slug'})`);
      console.log(`   Type: ${community.type || 'NOT SET'}`);
      console.log(`   Members: ${community.membersCount}`);
      console.log(`   Approval Queue: ${community.approvalQueueCount}`);
      
      if (community.approvalQueueCount > 0) {
        console.log(`   Pending users:`);
        community.approvalQueue.forEach((item, idx) => {
          console.log(`     ${idx + 1}. ${item.user?.username || 'Unknown'} (${item.user?._id}) - Requested: ${item.requestedAt}`);
        });
      }
      
      // Check for pending members in members array
      const pendingMembers = community.members?.filter(m => m.status === 'pending') || [];
      if (pendingMembers.length > 0) {
        console.log(`   Pending members in members array: ${pendingMembers.length}`);
        pendingMembers.forEach((member, idx) => {
          console.log(`     ${idx + 1}. ${member.user?.username || 'Unknown'} (${member.user?._id})`);
        });
      }
      
      console.log('');
    });

    // Check if any communities need type fixing
    const communitiesWithoutType = communities.filter(c => !c.type);
    if (communitiesWithoutType.length > 0) {
      console.log('⚠️  Communities without type set:');
      communitiesWithoutType.forEach(c => {
        console.log(`   - ${c.title} (${c.slug?.current || 'no slug'})`);
      });
      console.log('');
    }

    // Check for communities with pending requests
    const communitiesWithPending = communities.filter(c => c.approvalQueueCount > 0);
    if (communitiesWithPending.length > 0) {
      console.log('✅ Communities with pending approval requests:');
      communitiesWithPending.forEach(c => {
        console.log(`   - ${c.title}: ${c.approvalQueueCount} pending`);
      });
    } else {
      console.log('ℹ️  No communities have pending approval requests');
    }

  } catch (error) {
    console.error('❌ Error testing approval queue:', error);
  }
}

// Run the test
testApprovalQueue(); 