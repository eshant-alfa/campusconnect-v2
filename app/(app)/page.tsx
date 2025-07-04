import PostsList from "@/components/post/PostsList";
import { Users, Clock, ArrowRight, Plus, BookOpen, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getSubreddits } from "@/sanity/lib/subreddit/getSubreddits";
import { getUserCommunities } from "@/sanity/lib/subreddit/getUserCommunities";
import { currentUser } from "@clerk/nextjs/server";

// Define a type for community
interface Community {
  _id: string;
  title?: string;
  slug: { current: string } | string | null;
  memberCount?: number;
  postCount?: number;
}

export default async function Home() {
  // Fetch all communities and user's joined communities
  const user = await currentUser();
  const allCommunities: Community[] = await getSubreddits();
  const joinedCommunities: Community[] = user ? await getUserCommunities(user.id) : [];
  const joinedIds = new Set(joinedCommunities.map((c) => c._id));
  const notJoinedCommunities = allCommunities.filter((c) => !joinedIds.has(c._id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100">
      {/* Hero Section */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-16 bg-gradient-to-r from-blue-200 via-white to-blue-100 rounded-b-3xl shadow-lg mb-12">
        <div className="flex-1 flex flex-col items-start md:items-start">
          <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900 mb-4 leading-tight drop-shadow-sm">Welcome to Campus Connect</h1>
          <p className="text-xl md:text-2xl text-blue-700 mb-6 max-w-xl">Connect, share, and discover everything happening on your campus all in one safe, modern platform.</p>
        </div>
        <div className="flex-1 flex justify-center md:justify-end mt-8 md:mt-0">
          <Image
            src="/images/full_logo.png"
            alt="Campus Connect Logo"
            width={220}
            height={220}
            className="h-44 w-auto rounded-2xl shadow-xl border-4 border-white bg-white"
            priority
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 px-4 mb-16">
        <Link 
          href="/create-post"
          className="group bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center border-t-4 border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <Plus className="w-10 h-10 text-blue-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Create Post</h2>
          <p className="text-gray-600">Share your thoughts with the campus</p>
        </Link>
        <Link 
          href="/resources"
          className="group bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center border-t-4 border-green-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <BookOpen className="w-10 h-10 text-green-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Resources</h2>
          <p className="text-gray-600">Access student services and support</p>
        </Link>
        <Link 
          href="/weather"
          className="group bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center border-t-4 border-yellow-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <span className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mb-4 text-2xl">🌤️</span>
          <h2 className="text-xl font-bold mb-2">Weather</h2>
          <p className="text-gray-600">Check campus conditions</p>
        </Link>
      </section>

      {/* Feed Section */}
      <section className="max-w-5xl mx-auto px-4 mb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Feed</h2>
                <p className="text-gray-600">Latest posts from communities you&apos;ve joined</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Heart className="w-4 h-4" />
              <span>Sorted by engagement</span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <PostsList />
          </div>
          <div className="text-center mt-8">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
              Load More Posts
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Community Highlights */}
      <section className="py-8 bg-white/60">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular Communities</h2>
            <p className="text-gray-600">Join the most active discussions</p>
          </div>
          <div className="relative">
            <div className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar">
              {notJoinedCommunities.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">You have joined all available communities!</div>
              ) : (
                notJoinedCommunities.map((community) => (
                  <div
                    key={community._id}
                    className="min-w-[320px] max-w-xs flex-shrink-0 bg-white rounded-xl p-6 shadow-md border-t-4 border-blue-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg mb-4 flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{community.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>{community.memberCount || 0} members</span>
                      <span>{community.postCount ? `${community.postCount} posts` : ''}</span>
                    </div>
                    <Link
                      href={`/community/${typeof community.slug === 'string' ? community.slug : community.slug?.current ?? ''}`}
                      className="w-full mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors block text-center font-medium border border-blue-100"
                    >
                      Join Community
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
