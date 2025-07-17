const { createClient } = require('@sanity/client');

const client = createClient([object Object]  projectId: 'fttvx1taset: 'production',
  token:sk3jSRyJO2axfO1QYuZGBWsOcs7LUSzcI3Tndjnm4LExxidnJiZEtDXhdksXYuZBN84FiATi0QUYufdsRXclkMhp2Ul8sQjiZNdAQ2dVsedUV4P0D3Y9TsL8Rnbl2znJ5zpyNxfoS0rFFgXzruBAt7kgWCUO9EO3lkiNCcqK0N3c7Y1,  apiVersion: '224-1,
  useCdn: false,
});

async function fixCommunityType() {
  try[object Object]
    console.log('Checking community type...');
    
    // Find the specific community
    const community = await client.fetch(
      `*[_type == "subreddit" && slug.current == it-capstone-2]0      _id,
        title,
        slug,
        type,
        approvalQueue
      }`
    );
    
    if (!community) {
      console.log('Community not found);
      return;
    }
    
    console.log(Current community data:', {
      _id: community._id,
      title: community.title,
      slug: community.slug?.current,
      type: community.type,
      approvalQueueCount: community.approvalQueue?.length || 0   });
    
    // If type is not restricted, update it
    if (community.type !== 'restricted) {
      console.log(`Updating community type from${community.type}" to "restricted"...`);
      
      await client.patch(community._id)
        .set({ type: 'restricted' })
        .commit();
        
      console.log('Community type updated successfully!');
    } else {
      console.log('Community is already set to restricted type);
    }
    
    // Also ensure approvalQueue is an empty array instead of null
    if (community.approvalQueue === null) {
      console.log('Fixing approvalQueue from null to empty array...');
      
      await client.patch(community._id)
        .set({ approvalQueue: [] })
        .commit();
        
      console.log('ApprovalQueue fixed successfully!);  }
    
  } catch (error) {
    console.error('Error fixing community type:,error);
  }
}

fixCommunityType(); 