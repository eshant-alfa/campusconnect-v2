"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function CreatePost() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null);

  // Fetch membership status for the current community
  useEffect(() => {
    const fetchStatus = async () => {
      const communityName = pathname.includes("/community/")
        ? pathname.split("/community/")[1]?.split("/")[0]
        : null;
      if (communityName && user) {
        try {
          const res = await fetch(`/api/community/${communityName}/membership-status`);
          if (res.ok) {
            const data = await res.json();
            setMembershipStatus(data.status);
          }
        } catch {}
      }
    };
    fetchStatus();
  }, [pathname, user]);

  const handleCreatePost = () => {
    // Extract the community name from the pathname if it follows the pattern /community/[name]
    const communityName = pathname.includes("/community/")
      ? pathname.split("/community/")[1]?.split("/")[0]
      : null;

    // If we're in a community, redirect to create post with that community pre-selected
    if (communityName) {
      router.push(`/create-post?subreddit=${communityName}`);
    } else {
      // Otherwise just go to the create post page
      router.push("/create-post");
    }
  };

  const isPending = membershipStatus === "pending";
  const isActive = membershipStatus === "active";
  return (
    <Button onClick={handleCreatePost} disabled={!user || isPending || (!isActive && !!user)}>
      <Plus className="w-4 h-4 mr-2" />
      {!user
        ? "Sign in to create post"
        : isPending
        ? "Pending Approval"
        : isActive
        ? "Create Post"
        : "Join to create post"}
    </Button>
  );
}

export default CreatePost;
