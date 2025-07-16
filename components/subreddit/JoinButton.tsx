"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface JoinButtonProps {
  slug: string;
  type: "public" | "restricted" | "private";
  isMember: boolean;
  isPending: boolean;
}

export function JoinButton({ slug, type, isMember, isPending }: JoinButtonProps) {
  const { isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(false);
  // Only treat as joined if isMember is true and isPending is false
  const [status, setStatus] = useState(isMember && !isPending ? "joined" : isPending ? "pending" : "none");
  const [error, setError] = useState<string | null>(null);

  // Fetch membership status on mount and after join/leave
  useEffect(() => {
    if (!user) return;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/community/${slug}/membership-status`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "active") setStatus("joined");
          else if (data.status === "pending") setStatus("pending");
          else setStatus("none");
        }
      } catch {}
    };
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleJoin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/community/${slug}/join`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (type === "public") setStatus("joined");
        else if (type === "restricted") setStatus("pending");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to join");
      }
    } catch {
      setError("Failed to join");
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    console.log('Attempting to leave community:', slug);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/community/${slug}/leave`, { method: "POST" });
      console.log('Leave response status:', res.status);
      if (res.ok) {
        console.log('Successfully left community');
        setStatus("none");
      } else {
        const data = await res.json();
        console.error('Leave error response:', data);
        setError(data.error || "Failed to leave");
      }
    } catch (err) {
      console.error('Leave request failed:', err);
      setError("Failed to leave");
    } finally {
      setLoading(false);
    }
  };

  if (type === "private") return null;
  if (!isSignedIn) return <Button disabled>Sign in to join</Button>;
  if (status === "joined")
    return (
      <Button
        variant="outline"
        className="text-green-700 border-green-600 hover:bg-green-50 focus-visible:ring-green-600"
        onClick={handleLeave}
        disabled={loading}
        aria-label="Leave community"
      >
        Leave
      </Button>
    );
  if (status === "pending")
    return <Button disabled className="bg-yellow-100 text-yellow-700 border-yellow-300">Pending Approval</Button>;
  return (
    <div className="flex flex-col gap-1">
      <Button
        onClick={handleJoin}
        disabled={loading}
        variant="default"
        aria-label={type === "restricted" ? "Request to Join" : "Join community"}
      >
        {type === "restricted" ? "Request to Join" : "Join"}
      </Button>
      {error && <span className="text-red-600 text-xs mt-1">{error}</span>}
    </div>
  );
} 