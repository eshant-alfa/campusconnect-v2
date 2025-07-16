"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, UserX, Loader2 } from "lucide-react";

interface PendingApprovalsProps {
  slug: string;
}

export default function PendingApprovals({ slug }: PendingApprovalsProps) {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching pending requests for slug:', slug);
      const timestamp = Date.now();
      const res = await fetch(`/api/community/${slug}/pending?t=${timestamp}`, {
        cache: 'no-store'
      });
      const data = await res.json();
      console.log('Pending API response:', data);
      if (res.ok) {
        setPending(data.pending || []);
        console.log('Updated pending list with', data.pending?.length || 0, 'items');
      } else {
        setError(data.error || "Failed to fetch pending requests");
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setError("Failed to fetch pending requests");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
    // Optionally, add polling or Pusher for real-time updates
  }, [slug]);

  const handleApprove = async (userId: string) => {
    console.log('Approving user:', userId);
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/community/${slug}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToApproveId: userId }),
      });
      console.log('Approve response status:', res.status);
      if (res.ok) {
        console.log('Approve successful, waiting before refreshing pending list');
        // Add a small delay to ensure database update is complete
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchPending(); // Refresh the list
      } else {
        const errorData = await res.json();
        console.error('Approve failed:', errorData);
      }
    } catch (err) {
      console.error("Failed to approve user:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (userId: string) => {
    console.log('Denying user:', userId);
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/community/${slug}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToReject: userId }),
      });
      console.log('Reject response status:', res.status);
      if (res.ok) {
        console.log('Reject successful, waiting before refreshing pending list');
        // Add a small delay to ensure database update is complete
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchPending(); // Refresh the list
      } else {
        const errorData = await res.json();
        console.error('Reject failed:', errorData);
      }
    } catch (err) {
      console.error("Failed to reject user:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="px-6 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-blue-900">Pending Approvals</h3>
        </div>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-blue-900">Pending Approvals</h3>
        </div>
        <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <div className="px-6 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-blue-900">Pending Approvals</h3>
        </div>
        <div className="text-gray-500 text-sm p-3 bg-gray-50 rounded-lg border border-gray-200">
          No pending requests
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <UserPlus className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-blue-900">Pending Approvals</h3>
      </div>
      <div className="space-y-3">
        {pending.map((req) => (
          <div key={req.user._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={req.user.imageUrl} alt={req.user.username} />
                <AvatarFallback className="text-xs">
                  {req.user.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">
                  {req.user.username || "Unknown User"}
                </div>
                <div className="text-xs text-gray-500">
                  Requested {new Date(req.requestedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                onClick={() => handleApprove(req.user._id)}
                disabled={actionLoading === req.user._id}
              >
                {actionLoading === req.user._id ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <UserPlus className="w-3 h-3 mr-1" />
                )}
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                className="flex-1 text-xs"
                onClick={() => handleDeny(req.user._id)}
                disabled={actionLoading === req.user._id}
              >
                {actionLoading === req.user._id ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <UserX className="w-3 h-3 mr-1" />
                )}
                Deny
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 