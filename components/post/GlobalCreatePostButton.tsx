"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function GlobalCreatePostButton() {
  const router = useRouter();
  const { user } = useUser();
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMembership = async () => {
      setLoading(true);
      if (!user) {
        setIsMember(null);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/user/membership-status");
        if (res.ok) {
          const data = await res.json();
          setIsMember(data.isMember);
        } else {
          setIsMember(false);
        }
      } catch {
        setIsMember(false);
      } finally {
        setLoading(false);
      }
    };
    checkMembership();
  }, [user]);

  const handleCreatePost = () => {
    router.push("/create-post");
  };

  let buttonText = "Create Post";
  if (!user) buttonText = "Sign in to create post";
  else if (loading) buttonText = "Checking membership...";
  else if (isMember === false) buttonText = "Join to create post";

  return (
    <Button
      onClick={handleCreatePost}
      disabled={!user || isMember === false || loading}
      className={isMember === false ? "bg-gray-300 text-gray-500 cursor-not-allowed" : ""}
    >
      <Plus className="w-4 h-4 mr-2" />
      {buttonText}
    </Button>
  );
}

export default GlobalCreatePostButton; 