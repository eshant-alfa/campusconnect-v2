const { adminClient } = require('../sanity/lib/adminClient');

async function cleanupDuplicateUsers() {
  try {
    console.log('🧹 Cleaning up duplicate users...\n');

    // Find all users
    const users = await adminClient.fetch(`
      *[_type == "user"]{
        _id,
        clerkId,
        email,
        username,
        createdAt
      } | order(email asc, createdAt asc)
    `);

    console.log(`Found ${users.length} total users\n`);

    // Group users by email
    const usersByEmail = {};
    users.forEach(user => {
      if (user.email) {
        if (!usersByEmail[user.email]) {
          usersByEmail[user.email] = [];
        }
        usersByEmail[user.email].push(user);
      }
    });

    // Find duplicates
    const duplicates = Object.entries(usersByEmail)
      .filter(([email, userList]) => userList.length > 1)
      .map(([email, userList]) => ({ email, users: userList }));

    console.log(`Found ${duplicates.length} email addresses with duplicate users:\n`);

    let deletedCount = 0;

    for (const duplicate of duplicates) {
      console.log(`📧 Email: ${duplicate.email}`);
      console.log(`   Users: ${duplicate.users.length}`);
      
      // Sort by creation date (keep the oldest)
      const sortedUsers = duplicate.users.sort((a, b) => 
        new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      );
      
      const keepUser = sortedUsers[0];
      const deleteUsers = sortedUsers.slice(1);
      
      console.log(`   Keeping: ${keepUser._id} (${keepUser.username}) - Created: ${keepUser.createdAt}`);
      
      for (const deleteUser of deleteUsers) {
        console.log(`   Deleting: ${deleteUser._id} (${deleteUser.username}) - Created: ${deleteUser.createdAt}`);
        
        try {
          await adminClient.delete(deleteUser._id);
          deletedCount++;
          console.log(`   ✅ Deleted successfully`);
        } catch (error) {
          console.error(`   ❌ Failed to delete:`, error.message);
        }
      }
      console.log('');
    }

    // Also check for users with same clerkId
    const usersByClerkId = {};
    users.forEach(user => {
      if (user.clerkId) {
        if (!usersByClerkId[user.clerkId]) {
          usersByClerkId[user.clerkId] = [];
        }
        usersByClerkId[user.clerkId].push(user);
      }
    });

    const clerkIdDuplicates = Object.entries(usersByClerkId)
      .filter(([clerkId, userList]) => userList.length > 1)
      .map(([clerkId, userList]) => ({ clerkId, users: userList }));

    if (clerkIdDuplicates.length > 0) {
      console.log(`Found ${clerkIdDuplicates.length} clerkId duplicates:\n`);
      
      for (const duplicate of clerkIdDuplicates) {
        console.log(`🆔 ClerkId: ${duplicate.clerkId}`);
        console.log(`   Users: ${duplicate.users.length}`);
        
        const sortedUsers = duplicate.users.sort((a, b) => 
          new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );
        
        const keepUser = sortedUsers[0];
        const deleteUsers = sortedUsers.slice(1);
        
        console.log(`   Keeping: ${keepUser._id} (${keepUser.username})`);
        
        for (const deleteUser of deleteUsers) {
          console.log(`   Deleting: ${deleteUser._id} (${deleteUser.username})`);
          
          try {
            await adminClient.delete(deleteUser._id);
            deletedCount++;
            console.log(`   ✅ Deleted successfully`);
          } catch (error) {
            console.error(`   ❌ Failed to delete:`, error.message);
          }
        }
        console.log('');
      }
    }

    console.log(`🎉 Cleanup completed! Deleted ${deletedCount} duplicate users.`);

  } catch (error) {
    console.error('❌ Error cleaning up duplicate users:', error);
  }
}

// Run the script
cleanupDuplicateUsers(); 