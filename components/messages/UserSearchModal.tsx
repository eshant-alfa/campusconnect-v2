"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import UsernameDisplay from "../comment/UsernameDisplay";

interface UserSearchModalProps {
  onSelectUser: (user: any) => void;
}

export default function UserSearchModal({ onSelectUser }: UserSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    if (debounceTimeout) clearTimeout(debounceTimeout);
    const timeout = setTimeout(() => {
      fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.users || []);
          setLoading(false);
        });
    }, 350);
    setDebounceTimeout(timeout);
    // Cleanup
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <>
      <div className="p-6 w-full">
        <div className="mb-4">
          <span className="sr-only" id="user-search-modal-title">Start a Conversation</span>
        </div>
        <Input
          autoFocus
          placeholder="Search users by name or username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-4"
        />
        {loading && <div className="text-blue-600 text-sm mb-2">Searching...</div>}
        <div className="max-h-72 overflow-y-auto divide-y">
          {results.length === 0 && !loading && (
            <div className="text-gray-500 text-center py-8">No users found</div>
          )}
          {results.map((user) => (
            <button
              key={user._id}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition text-left"
              onClick={() => onSelectUser(user)}
              aria-label={`Start conversation with ${user.username}`}
            >
              {user.profileImage ? (
                <Image src={user.profileImage} alt={user.username} width={40} height={40} className="rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg">
                  {user.username?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="flex flex-col items-start">
                <UsernameDisplay clerkId={user.clerkId} fallback={user.username} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
} 