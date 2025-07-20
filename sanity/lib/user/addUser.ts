import { adminClient } from "../adminClient";

export async function addOrUpdateUser({
  clerkId,
  username,
  email,
  image,
}: {
  clerkId: string;
  username: string;
  email: string;
  image: string;
}) {
  console.log('addOrUpdateUser: Starting for clerkId:', clerkId);
  
  try {
    // Try to find the user by clerkId first
    const existing = await adminClient.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id, username, email}`,
      { clerkId }
    );
    
    if (existing?._id) {
      console.log('addOrUpdateUser: Updating existing user:', existing._id);
      // Update the user if they exist
      const updatedUser = await adminClient
        .patch(existing._id)
        .set({ username, email, image: image, clerkId })
        .commit();
      console.log('addOrUpdateUser: User updated successfully');
      return updatedUser;
    }
    
    // Also check for users with the same email to prevent duplicates
    if (email) {
      const existingByEmail = await adminClient.fetch(
        `*[_type == "user" && email == $email][0]{_id, clerkId}`,
        { email }
      );
      
      if (existingByEmail?._id) {
        console.log('addOrUpdateUser: Found user with same email, updating clerkId:', existingByEmail._id);
        // Update the existing user with the new clerkId
        const updatedUser = await adminClient
          .patch(existingByEmail._id)
          .set({ username, email, image: image, clerkId })
          .commit();
        console.log('addOrUpdateUser: User updated with new clerkId successfully');
        return updatedUser;
      }
    }
    
    console.log('addOrUpdateUser: Creating new user');
    // Create new user
    const newUser = await adminClient.create({
      _type: "user",
      clerkId,
      username,
      email,
      image: image,
      joinedAt: new Date().toISOString(),
    });
    
    console.log('addOrUpdateUser: New user created:', newUser._id);
    return newUser;
  } catch (error) {
    console.error('addOrUpdateUser: Error:', error);
    
    // If creation failed, try to find the user again (in case it was created by another process)
    try {
      const existing = await adminClient.fetch(
        `*[_type == "user" && clerkId == $clerkId][0]{_id}`,
        { clerkId }
      );
      
      if (existing?._id) {
        console.log('addOrUpdateUser: Found user after error, returning:', existing._id);
        return existing;
      }
    } catch (lookupError) {
      console.error('addOrUpdateUser: Error in fallback lookup:', lookupError);
    }
    
    throw error;
  }
}
