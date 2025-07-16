"use client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ConversationListProps {
  selectedConversation: string | null;
  setSelectedConversation: (id: string) => void;
}

export default function ConversationList({ selectedConversation, setSelectedConversation }: ConversationListProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => {
        setConversations(data.conversations || []);
        setLoading(false);
      });
  }, []);

  // Helper to format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes === 0 ? 'now' : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-blue-600 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
        Loading conversations...
      </div>
    );
  }
  
  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div className="text-gray-500 font-medium">No conversations yet</div>
        <div className="text-sm text-gray-400 mt-1">Start messaging to see conversations here</div>
      </div>
    );
  }
  
  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conv) => {
        const other = conv.participants.find((p: any) => p.clerkId !== undefined && p.clerkId !== "");
        const hasUnread = conv.unreadCount > 0;
        return (
          <div key={conv._id}>
            <button
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200
                ${selectedConversation === conv._id ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-50"}
              `}
              onClick={() => setSelectedConversation(conv._id)}
              aria-label={`Open conversation with ${other?.name}`}
            >
              <div className="relative flex-shrink-0">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={other?.profileImage} alt={other?.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-lg">
                    {other?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" aria-label="Online" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold truncate text-base ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>{other?.name}</span>
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{conv.updatedAt ? formatTime(conv.updatedAt) : ""}</span>
                </div>
                <span className="text-xs text-gray-500 truncate">@{other?.username}</span>
                <span className={`text-sm mt-0.5 truncate ${hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{conv.lastMessage || "No messages yet"}</span>
              </div>
              {hasUnread && (
                <Badge variant="default" className="ml-2 text-xs px-2 py-0.5 bg-blue-600 text-white">{conv.unreadCount}</Badge>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
} 