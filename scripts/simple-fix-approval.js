// Simple script to fix approval queue - run this from the Next.js app context
// You can run this by adding it to a page temporarily

async function fixApprovalQueue() {
  try {
    console.log('🔧 Fixing approval queue fields...\n');

    // This would need to be run from within the Next.js app context
    // where environment variables are available
    
    const response = await fetch('/api/community/demo-forum/data');
    const community = await response.json();
    
    console.log('Current community data:', community);
    
    if (!community.approvalQueue || community.approvalQueue === null) {
      console.log('Approval queue is null - needs fixing');
      
      // You can fix this manually in Sanity Studio by:
      // 1. Going to http://localhost:3000/studio
      // 2. Finding the "Demo Forum" community
      // 3. Setting the "Approval Queue" field to an empty array []
      // 4. Saving the document
    } else {
      console.log('Approval queue is properly initialized');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Export for use in Next.js
if (typeof window !== 'undefined') {
  window.fixApprovalQueue = fixApprovalQueue;
}

module.exports = { fixApprovalQueue }; 