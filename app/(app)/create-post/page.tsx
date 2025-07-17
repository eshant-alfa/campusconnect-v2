import CreateCommunityButton from "@/components/header/CreateCommunityButton";
import CreatePostForm from "@/components/post/CreatePostForm";
import { SubredditCombobox } from "@/components/subreddit/SubredditCombobox";
import { getSubreddits } from "@/sanity/lib/subreddit/getSubreddits";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

async function CreatePostPage({
  searchParams,
}: {
  searchParams: Promise<{ subreddit: string }>;
}) {
  const { subreddit } = await searchParams;

  // get all subreddits
  const subreddits = await getSubreddits();

  if (subreddit) {
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
              <CreatePostForm subreddit={subreddit} />
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Community Selection
                </label>
                <SubredditCombobox
                  subreddits={subreddits}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreatePostPage;
