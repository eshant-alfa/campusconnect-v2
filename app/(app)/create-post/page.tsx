import CreateCommunityButton from "@/components/header/CreateCommunityButton";
import CreatePostForm from "@/components/post/CreatePostForm";
import { SubredditCombobox } from "@/components/subreddit/SubredditCombobox";
import { getUserCommunities } from "@/sanity/lib/user/getUserCommunities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

async function CreatePostPage({
  searchParams,
}: {
  searchParams: Promise<{ subreddit: string }>;
}) {
  const { subreddit } = await searchParams;

  // Get current user
  let user = null;
  try {
    user = await currentUser();
  } catch (error) {
    console.error("Error getting current user:", error);
  }

  // Get user's joined communities only
  const userCommunities = user ? await getUserCommunities(user.id) : [];

  if (subreddit) {
    // Check if user is a member of the selected community
    const isMemberOfSelected = userCommunities.some((c: any) => c.slug?.current === subreddit);
    
    if (!user) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>You need to sign in to create posts.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link
                href="/sign-in"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    if (!isMemberOfSelected) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Membership Required</CardTitle>
              <CardDescription>You must be a member of this community to create posts.</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                You need to join the <strong>{subreddit}</strong> community first.
              </p>
              <Link
                href={`/community/${subreddit}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Community
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="mx-auto max-w-4xl px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Create Post</h1>
                  <p className="text-gray-600 mt-1">
                    Share your thoughts in the{" "}
                    <Link
                      href={`/community/${subreddit}`}
                      className="font-semibold text-blue-600 hover:text-blue-700 underline"
                    >
                      {subreddit}
                    </Link>{" "}
                    community
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-semibold text-gray-900">
                New Post
              </CardTitle>
              <CardDescription className="text-gray-600">
                Craft your message and share it with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreatePostForm 
                subreddit={subreddit} 
                isMember={userCommunities.some((c: any) => c.slug?.current === subreddit)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create Post</h1>
                <p className="text-gray-600 mt-1">
                  Choose a community to share your content
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Select Community
            </CardTitle>
            <CardDescription className="text-gray-600">
              Choose where you'd like to share your post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!user ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In Required</h3>
                <p className="text-gray-600 mb-4">You need to sign in to create posts.</p>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            ) : userCommunities.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Communities Joined</h3>
                <p className="text-gray-600 mb-4">
                  You need to join at least one community before you can create posts.
                </p>
                <div className="space-y-3">
                  <Link
                    href="/search"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-3"
                  >
                    Browse Communities
                  </Link>
                  <CreateCommunityButton />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select a Community
                  </label>
                  <SubredditCombobox
                    subreddits={userCommunities}
                    defaultValue={subreddit}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Don't see your community? Create a new one!
                  </p>
                  <CreateCommunityButton />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreatePostPage;
