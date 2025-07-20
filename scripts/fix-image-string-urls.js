const { adminClient } = require('../sanity/lib/adminClient')

async function fixImageStringUrls() {
  try {
    console.log('🔍 Searching for documents with string URLs in image fields...')
    
    // Find all user documents
    const users = await adminClient.fetch(`
      *[_type == "user" && defined(image)]{
        _id,
        _type,
        clerkId,
        image
      }
    `)
    
    console.log(`Found ${users.length} users with image fields`)
    
    let fixedCount = 0
    let errorCount = 0
    
    for (const user of users) {
      try {
        // Check if image is a string (URL) instead of an object
        if (typeof user.image === 'string') {
          console.log(`❌ Found string URL in user ${user._id}:`, user.image.substring(0, 50) + '...')
          
          // Remove the string URL by setting image to null
          await adminClient.patch(user._id)
            .set({ image: null })
            .commit()
          
          console.log(`✅ Fixed user ${user._id} - removed string URL`)
          fixedCount++
        }
      } catch (error) {
        console.error(`❌ Error fixing user ${user._id}:`, error.message)
        errorCount++
      }
    }
    
    // Also check for any other document types that might have image fields with string URLs
    const otherDocs = await adminClient.fetch(`
      *[_type != "user" && defined(image) && typeof(image) == "string"]{
        _id,
        _type,
        image
      }
    `)
    
    console.log(`Found ${otherDocs.length} other documents with string URLs in image fields`)
    
    for (const doc of otherDocs) {
      try {
        console.log(`❌ Found string URL in ${doc._type} ${doc._id}:`, doc.image.substring(0, 50) + '...')
        
        // Remove the string URL by setting image to null
        await adminClient.patch(doc._id)
          .set({ image: null })
          .commit()
        
        console.log(`✅ Fixed ${doc._type} ${doc._id} - removed string URL`)
        fixedCount++
      } catch (error) {
        console.error(`❌ Error fixing ${doc._type} ${doc._id}:`, error.message)
        errorCount++
      }
    }
    
    console.log('\n📊 Summary:')
    console.log(`✅ Fixed: ${fixedCount} documents`)
    console.log(`❌ Errors: ${errorCount} documents`)
    console.log('🎉 Cleanup complete!')
    
  } catch (error) {
    console.error('❌ Script failed:', error)
  }
}

// Run the script
fixImageStringUrls() 