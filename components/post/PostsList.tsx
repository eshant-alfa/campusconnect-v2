import { getPosts } from "@/sanity/lib/post/getPosts";
import { currentUser } from "@clerk/nextjs/server";
import Post from "./Post";

async function PostsList() {
  const posts = await getPosts();
  let user = null;
  
  try {
    user = await currentUser();
  } catch (error) {
    console.error("Error getting current user in PostsList:", error);
    // Continue without user
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Post key={post._id} post={post} userId={user?.id || null} />
      ))}
    </div>
  );
}

export default PostsList;
