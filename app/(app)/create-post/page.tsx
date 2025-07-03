import CreateCommunityButton from "@/components/header/CreateCommunityButton";
import CreatePostForm from "@/components/post/CreatePostForm";
import { SubredditCombobox } from "@/components/subreddit/SubredditCombobox";
import { getSubreddits } from "@/sanity/lib/subreddit/getSubreddits";
import { Plus } from "lucide-react";
import Image from "next/image";

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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100">
        {/* Hero Section */}
        <section className="w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-12 bg-gradient-to-r from-blue-200 via-white to-blue-100 rounded-b-3xl shadow-lg mb-12">
          <div className="flex-1 flex flex-col items-start md:items-start">
            <div className="flex items-center gap-4 mb-4">
              <Plus className="text-blue-700 w-14 h-14" />
              <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 leading-tight drop-shadow-sm">Create Post</h1>
            </div>
            <p className="text-lg md:text-xl text-blue-700 max-w-xl">Share your thoughts in the <span className="font-bold">{subreddit}</span> community.</p>
          </div>
          <div className="flex-1 flex justify-center md:justify-end mt-8 md:mt-0">
            <Image
              src="/images/full_logo.png"
              alt="Campus Connect Logo"
              width={120}
              height={120}
              className="h-24 w-auto rounded-2xl shadow-xl border-4 border-white bg-white"
              priority
            />
          </div>
        </section>
        {/* Content */}
        <section className="max-w-3xl mx-auto px-4 mb-20">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <CreatePostForm />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100">
      {/* Hero Section */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-12 bg-gradient-to-r from-blue-200 via-white to-blue-100 rounded-b-3xl shadow-lg mb-12">
        <div className="flex-1 flex flex-col items-start md:items-start">
          <div className="flex items-center gap-4 mb-4">
            <Plus className="text-blue-700 w-14 h-14" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 leading-tight drop-shadow-sm">Create Post</h1>
          </div>
          <p className="text-lg md:text-xl text-blue-700 max-w-xl">Select a community for your post.</p>
        </div>
        <div className="flex-1 flex justify-center md:justify-end mt-8 md:mt-0">
          <Image
            src="/images/full_logo.png"
            alt="Campus Connect Logo"
            width={120}
            height={120}
            className="h-24 w-auto rounded-2xl shadow-xl border-4 border-white bg-white"
            priority
          />
        </div>
      </section>
      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 mb-20">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <label className="block text-sm font-medium mb-2">
            Select a community to post in
          </label>
          <SubredditCombobox
            subreddits={subreddits}
            defaultValue={subreddit}
          />
          <hr className="my-6" />
          <p className="mt-4 text-sm text-gray-600">
            If you don&apos;t see your community, you can create it here.
          </p>
          <div className="mt-2">
            <CreateCommunityButton />
          </div>
        </div>
      </section>
    </div>
  );
}

export default CreatePostPage;
