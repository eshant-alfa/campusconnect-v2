import Post from "@/components/post/Post";
import { urlFor } from "@/sanity/lib/image";
import { getPostsForSubreddit } from "@/sanity/lib/subreddit/getPostsForSubreddit";
import { getSubredditBySlug } from "@/sanity/lib/subreddit/getSubredditBySlug";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { JoinButton } from "@/components/subreddit/JoinButton";
import { ModerationPanel } from "@/components/subreddit/ModerationPanel";
import CommunityRules from "@/components/community/CommunityRules";
import ModerationLogs from "@/components/community/ModerationLogs";
import Appeals from "@/components/community/Appeals";
import WelcomeMessage from "@/components/community/WelcomeMessage";
import DeleteButton from "@/components/DeleteButton";
import { CommunityInfoSidebar } from "@/components/community/CommunityInfoSidebar";
import { client } from "@/sanity/lib/client";

async function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const community = await getSubredditBySlug(slug);
  if (!community) return null;

  const user = await currentUser();
  const posts = await getPostsForSubreddit(community._id);

  // Get Sanity user ID for current user if logged in
  let sanityUserId: string | null = null;
  if (user) {
    const sanityUser = await client.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id}`,
      { clerkId: user.id }
    );
    sanityUserId = sanityUser?._id || null;
  }

  // Membership logic using Sanity user ID
  const members = community.members || [];
  const approvalQueue = community.approvalQueue || [];
  const bannedUsers = community.bannedUsers || [];
  
  const isMember = sanityUserId ? members.some((m: any) => m.user && m.user._ref === sanityUserId && m.status === "active") : false;
  const isPending = sanityUserId ? members.some((m: any) => m.user && m.user._ref === sanityUserId && m.status === "pending") || approvalQueue.some((q: any) => q.user && q.user._ref === sanityUserId) : false;
  const isMod = sanityUserId ? members.some((m: any) => m.user && m.user._ref === sanityUserId && ["owner", "moderator"].includes(m.role)) : false;

  // User role for advanced features
  const userRole: 'owner' | 'moderator' | 'member' | 'guest' =
    !user || !sanityUserId
      ? 'guest'
      : members.find((m: any) => m.user && m.user._ref === sanityUserId)?.role === 'owner'
      ? 'owner'
      : members.find((m: any) => m.user && m.user._ref === sanityUserId)?.role === 'moderator'
      ? 'moderator'
      : isMember
      ? 'member'
      : 'guest';

  return (
    <>
      {/* Community Header - Redesigned Academic Minimalist */}
      <section className="relative w-full border-b bg-gradient-to-br from-blue-50 to-white">
        {/* Banner/Cover Image (optional, fallback gradient) */}
        <div className="absolute inset-0 h-40 md:h-56 bg-gradient-to-r from-blue-200 to-blue-400 opacity-60" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-8 pb-6 flex flex-col md:flex-row items-center gap-8 md:gap-10">
          {/* Avatar */}
          <div className="flex-shrink-0 relative h-28 w-28 md:h-32 md:w-32 rounded-full border-4 border-blue-200 bg-white shadow-lg flex items-center justify-center overflow-hidden">
            {community?.image && community.image.asset?._ref ? (
              <Image
                src={urlFor(community.image).url()}
                alt={community.image.alt || `${community.title} community icon`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <span className="text-4xl text-blue-400 font-bold">{community?.title?.[0] || '?'}</span>
            )}
          </div>
          {/* Info & Actions */}
          <div className="flex-1 flex flex-col gap-3 w-full">
            <div className="flex flex-col md:flex-row md:items-center md:gap-4 w-full">
              <h1 className="text-4xl font-extrabold text-blue-900 flex items-center gap-3 mb-2 md:mb-0">
                {community?.title}
                {/* Badges */}
                {/* Removed nsfw and tags badges as these fields do not exist in the schema */}
                {community?.type === 'restricted' && (
                  <span className="ml-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200 uppercase">Restricted</span>
                )}
                {community?.type === 'private' && (
                  <span className="ml-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 border border-gray-300 uppercase">Private</span>
                )}
                {/* User Status Tag */}
                {user && userRole !== 'guest' && (
                  <span className={`ml-1 px-3 py-1 rounded-full text-xs font-semibold border uppercase ${
                    userRole === 'owner' 
                      ? 'bg-purple-100 text-purple-700 border-purple-200' 
                      : userRole === 'moderator'
                      ? 'bg-orange-100 text-orange-700 border-orange-200'
                      : 'bg-green-100 text-green-700 border-green-200'
                  }`}>
                    {userRole === 'owner' ? 'Owner' : userRole === 'moderator' ? 'Moderator' : 'Member'}
                  </span>
                )}
              </h1>
              {/* Join/Leave/Request/Pending Button and Delete (owner only) */}
              <div className="flex gap-3 mt-2 md:mt-0 md:ml-auto">
                {userRole === 'owner' ? (
                  <DeleteButton
                    contentId={community._id}
                    contentType="community"
                    contentOwnerId={user?.id || ''}
                  />
                ) : (
                  <JoinButton
                    slug={slug}
                    type={community.type || 'public'}
                    isMember={isMember}
                    isPending={isPending}
                  />
                )}
              </div>
            </div>
            {community?.description && (
              <p className="text-lg text-gray-600 mt-1 max-w-2xl">{community.description}</p>
            )}
            {/* Removed member count, online status, and tags from header as per user request and schema. */}
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="w-full max-w-7xl mx-auto mt-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Posts Feed */}
          <div className="lg:col-span-3">
            {/* Posts */}
            <div className="flex flex-col gap-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Post key={post._id} post={post} userId={user?.id || null} />
                ))
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-blue-100">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600">Be the first to share something in this community!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Community Info Sidebar */}
          <div className="lg:col-span-1.5 max-w-[380px] w-full">
            <CommunityInfoSidebar
              community={community}
              userRole={userRole}
              isMember={isMember}
              isPending={isPending}
              memberCount={members.length}
              slug={slug}
            />
          </div>
        </div>
      </section>
    </>
  );
}

export default CommunityPage;
