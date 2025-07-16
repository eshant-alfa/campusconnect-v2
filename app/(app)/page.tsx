import PostsList from "@/components/post/PostsList";
import Link from "next/link";
import { getSubreddits } from "@/sanity/lib/subreddit/getSubreddits";
import Image from "next/image";
import { GetSubredditsQueryResult } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";

// Use a type intersection instead of interface extension
// This allows us to add the 'members' property to the type
// and fixes the linter error about interface extension

type CommunityWithMembers = GetSubredditsQueryResult[number] & {
  members?: Array<{ user: any; status: string }>;
};

export default async function Home() {
  // Fetch featured communities (limit 4 for grid)
  const communities = (await getSubreddits()).slice(0, 4) as CommunityWithMembers[];

  // Check if user is a member of any community
  const user = await currentUser();
  let isMemberOfAny = false;
  if (user) {
    const sanityUser = await client.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id}`,
      { clerkId: user.id }
    );
    const sanityUserId = sanityUser?._id || null;
    if (sanityUserId) {
      // Fetch all communities and check if user is a member
      const allCommunities = await getSubreddits();
      isMemberOfAny = allCommunities.some((community: any) =>
        (community.members || []).some(
          (m: any) => m.user && m.user._ref === sanityUserId && m.status === "active"
        )
      );
    }
  }

  return (
    <>
      {/* Banner */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-200 border-b">
        <div className="mx-auto max-w-7xl px-4 py-10 flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-3">Campus Connect</h1>
            <p className="text-lg text-blue-800 mb-4 max-w-xl">
              Your academic community hub. Join, share, and connect with students, faculty, and campus groups.
            </p>
            {user ? (
              isMemberOfAny ? (
                <Link href="/create-post">
                  <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg px-6 py-3 text-lg shadow transition-colors">
                    Create a Post
                  </button>
                </Link>
              ) : (
                <button className="bg-gray-300 text-gray-500 font-semibold rounded-lg px-6 py-3 text-lg shadow cursor-not-allowed" disabled>
                  Join a community to create a post
                </button>
              )
            ) : (
              <Link href="/sign-in">
                <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg px-6 py-3 text-lg shadow transition-colors">
                  Sign in to create a post
                </button>
              </Link>
            )}
          </div>
          <div className="flex-1 flex justify-center">
            <Image src="/cc_full_logo.png" alt="Campus Connect Logo" width={180} height={180} className="rounded-full shadow-lg border-4 border-blue-200 bg-white" />
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="w-full max-w-7xl mx-auto mt-10 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left/Main Column */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            {/* Featured Communities */}
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Featured Communities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {communities.map((community) => (
                  <Link key={(community as any).slug} href={`/community/${(community as any).slug}`} className="block bg-white rounded-2xl shadow-lg border border-blue-100 hover:border-blue-300 transition-colors p-5 h-full">
                    <div className="flex flex-col items-center gap-3">
                      {(community as any).image && (community as any).image.asset?._ref ? (
                        <Image
                          src={urlFor((community as any).image).width(64).height(64).url()}
                          alt={(community as any).title || "Community"}
                          width={64}
                          height={64}
                          className="rounded-full border-2 border-blue-200 bg-white object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-400">
                          {(community as any).title?.[0] || "?"}
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-blue-900 text-center truncate w-full">{(community as any).title}</h3>
                      <p className="text-sm text-gray-600 text-center line-clamp-2">{(community as any).description}</p>
                      <span className="text-xs text-blue-700 font-medium mt-2">{Array.isArray(community.members) ? community.members.length : 0} members</span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-4 text-right">
                <Link href="/search" className="text-blue-700 hover:underline font-medium">View all communities &rarr;</Link>
              </div>
            </div>

            {/* Recent Posts */}
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Recent Posts</h2>
              <div className="flex flex-col gap-4">
                <PostsList />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 flex flex-col gap-8">
            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-blue-900 mb-2">Quick Links</h3>
              <Link href="/search" className="text-blue-700 hover:underline font-medium">All Communities</Link>
              <Link href="/events" className="text-blue-700 hover:underline font-medium">Events</Link>
              <Link href="/surveys" className="text-blue-700 hover:underline font-medium">Surveys & Polls</Link>
              <Link href="/resources" className="text-blue-700 hover:underline font-medium">Resources</Link>
              <Link href="/marketplace" className="text-blue-700 hover:underline font-medium">Marketplace</Link>
            </div>
            {/* About Card */}
            <div className="bg-blue-50 rounded-2xl shadow border border-blue-100 p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-2">About Campus Connect</h3>
              <p className="text-sm text-blue-900">
                Campus Connect is your all-in-one platform for campus life. Discover communities, join events, share resources, and connect with your peers in a safe, academic environment.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
