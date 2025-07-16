"use client";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Users, UserCheck, UserX, Ban, Loader2 } from 'lucide-react';

interface ModerationPanelProps {
  slug: string;
  members: { user: { _ref: string }; role: string; status: string }[];
  bannedUsers: { _ref: string }[];
  onAction?: () => void;
}

export function ModerationPanel({ slug, members, bannedUsers, onAction }: ModerationPanelProps) {
  const { user } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleApprove = async (userId: string) => {
    setLoading(userId);
    setError(null);
    try {
      const res = await fetch(`/api/community/${slug}/approve`, {
        method: "POST",
        body: JSON.stringify({ userToApprove: userId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to approve");
      } else {
        onAction?.();
      }
    } catch {
      setError("Failed to approve");
    } finally {
      setLoading(null);
    }
  };
  const handleReject = async (userId: string) => {
    setLoading(userId);
    setError(null);
    try {
      const res = await fetch(`/api/community/${slug}/reject`, {
        method: "POST",
        body: JSON.stringify({ userToReject: userId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to reject");
      } else {
        onAction?.();
      }
    } catch {
      setError("Failed to reject");
    } finally {
      setLoading(null);
    }
  };
  const handleBan = async (userId: string) => {
    setLoading(userId);
    setError(null);
    try {
      await fetch(`/api/community/${slug}/ban`, {
        method: "POST",
        body: JSON.stringify({ userToBan: userId }),
      });
      onAction?.();
    } catch {
      setError("Failed to ban");
    } finally {
      setLoading(null);
    }
  };
  const handleUnban = async (userId: string) => {
    setLoading(userId);
    setError(null);
    try {
      await fetch(`/api/community/${slug}/unban`, {
        method: "POST",
        body: JSON.stringify({ userToUnban: userId }),
      });
      onAction?.();
    } catch {
      setError("Failed to unban");
    } finally {
      setLoading(null);
    }
  };

  const pendingMembers = members.filter((m) => m.status === "pending");
  // const activeMembers = members.filter((m) => m.status === "active");

  return (
    <section className="max-w-2xl mx-auto my-8 p-0 bg-white rounded-2xl shadow-lg border border-blue-100 h-full flex flex-col">
      <header className="flex items-center gap-2 px-6 pt-6 pb-2 border-b border-blue-50">
        <Users className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-blue-900">Pending Requests</h2>
      </header>
      <div className="px-6 pb-6 pt-2">
        {pendingMembers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-blue-500">
            <Users className="w-10 h-10 mb-2" />
            <span className="font-medium">No pending requests.</span>
            <span className="text-sm text-blue-400">New join requests will appear here for review.</span>
          </div>
        ) : (
          <ul className="space-y-4">
            {pendingMembers.map((entry, idx) => (
              entry.user && entry.user._ref ? (
                <li key={entry.user._ref} className="flex items-center gap-4 bg-blue-50/60 border border-blue-100 rounded-xl p-4 shadow-sm">
                  {/* Avatar placeholder (could be replaced with real avatar if available) */}
                  <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700 text-lg">
                    {entry.user._ref.slice(-2).toUpperCase()}
                  </div>
                  <span className="font-mono text-xs text-blue-900 flex-1">{entry.user._ref}</span>
                  <Button onClick={() => handleApprove(entry.user._ref)} size="sm" className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-semibold" disabled={loading === entry.user._ref}>
                    {loading === entry.user._ref ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />} Approve
                  </Button>
                  <Button onClick={() => handleReject(entry.user._ref)} size="sm" variant="destructive" className="flex items-center gap-1" disabled={loading === entry.user._ref}>
                    {loading === entry.user._ref ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />} Reject
                  </Button>
                  <Button onClick={() => handleBan(entry.user._ref)} size="sm" variant="destructive" className="flex items-center gap-1" disabled={loading === entry.user._ref}>
                    <Ban className="w-4 h-4" /> Ban
                  </Button>
                </li>
              ) : (
                <li key={idx} className="flex gap-2 items-center text-red-500 text-xs">Invalid member entry</li>
              )
            ))}
          </ul>
        )}
        {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
      </div>
    </section>
  );
} 