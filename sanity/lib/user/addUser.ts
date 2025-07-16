import { adminClient } from "../adminClient";

export async function addOrUpdateUser({
  clerkId,
  username,
  email,
  imageUrl,
}: {
  clerkId: string;
  username: string;
  email: string;
  imageUrl: string;
}) {
  console.log('addOrUpdateUser: Starting for clerkId:', clerkId);
  
  // Try to find the user by clerkId
  const existing = await adminClient.fetch(
    `*[_type == "user" && clerkId == $clerkId][0]{_id}`,
    { clerkId }
  );
  
  if (existing?._id) {
    console.log('addOrUpdateUser: Updating existing user:', existing._id);
    // Update the user if they exist
    const updatedUser = await adminClient
      .patch(existing._id)
      .set({ username, email, imageUrl, clerkId })
      .commit();
    console.log('addOrUpdateUser: User updated successfully');
    return updatedUser;
  }
  
  console.log('addOrUpdateUser: Creating new user');
  // Create new user
  const newUser = await adminClient.create({
    _type: "user",
    clerkId,
    username,
    email,
    imageUrl,
    joinedAt: new Date().toISOString(),
  });
  
  console.log('addOrUpdateUser: New user created:', newUser._id);
  return newUser;
}
