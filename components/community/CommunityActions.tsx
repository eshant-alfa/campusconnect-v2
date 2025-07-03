"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useTransition } from "react";
import { joinCommunity } from "@/action/joinCommunity";
import { leaveCommunity } from "@/action/leaveCommunity";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CommunityActionsProps {
  communityId: string;
  isMember: boolean;
  isModerator: boolean;
}

export default function CommunityActions({
  communityId,
  isMember,
  isModerator,
}: CommunityActionsProps) {
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [localIsMember, setLocalIsMember] = useState(isMember);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleJoin = () => {
    if (!user) return;

    setError(null);
    console.log("Attempting to join community:", communityId);
    
    startTransition(async () => {
      try {
        const result = await joinCommunity(communityId);
        console.log("Join result:", result);
        
        if ("error" in result) {
          setError(result.error || "Failed to join community");
        } else {
          setLocalIsMember(true);
          router.refresh();
        }
      } catch (err) {
        console.error("Error joining community:", err);
        setError("An unexpected error occurred");
      }
    });
  };

  const handleLeave = () => {
    if (!user) return;

    setError(null);
    console.log("Attempting to leave community:", communityId);
    
    startTransition(async () => {
      try {
        const result = await leaveCommunity(communityId);
        console.log("Leave result:", result);
        
        if ("error" in result) {
          setError(result.error || "Failed to leave community");
        } else {
          setLocalIsMember(false);
          router.refresh();
        }
      } catch (err) {
        console.error("Error leaving community:", err);
        setError("An unexpected error occurred");
      }
    });
  };

  if (!user) {
    return (
      <Button variant="outline" disabled>
        Sign in to join
      </Button>
    );
  }

  if (isModerator) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" disabled>
          Moderator
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <p className="text-sm text-red-500 mr-2">{error}</p>
      )}
      
      {localIsMember ? (
        <Button
          variant="outline"
          onClick={handleLeave}
          disabled={isPending}
        >
          {isPending ? "Leaving..." : "Leave Community"}
        </Button>
      ) : (
        <Button
          onClick={handleJoin}
          disabled={isPending}
        >
          {isPending ? "Joining..." : "Join Community"}
        </Button>
      )}
    </div>
  );
} 