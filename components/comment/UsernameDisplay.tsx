"use client";
import { useEffect, useState } from "react";

interface UsernameDisplayProps {
  clerkId: string | null | undefined;
  fallback?: string | null | undefined;
}

export default function UsernameDisplay({ clerkId, fallback }: UsernameDisplayProps) {
  const [username, setUsername] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!clerkId) return;
    fetch(`/api/users/${clerkId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUsername(data.user.username || null);
          setImageUrl(data.user.imageUrl || null);
        }
      });
  }, [clerkId]);

  // Always show username or fallback, never Clerk user ID
  if (!username) return <span>{fallback || "Anonymous"}</span>;
  return (
    <span className="flex items-center gap-2">
      {imageUrl && (
        <img src={imageUrl} alt={username} className="w-6 h-6 rounded-full object-cover" />
      )}
      {username}
    </span>
  );
} 