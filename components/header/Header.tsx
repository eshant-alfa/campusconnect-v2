"use client";

import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { ChevronLeftIcon, MenuIcon, MessageSquare, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useSidebar } from "../ui/sidebar";
import CreatePost from "../post/CreatePost";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useChatModal } from "@/components/chat/ChatModalContext";
import { Input } from "../ui/input";

function Header() {
  const { toggleSidebar, open, isMobile } = useSidebar();
  const { user } = useUser();
  const currentUserId = user?.id;
  const { chatOpen, setChatOpen, openChatWithUsernameAndMessage, prefillMessage, setPrefillMessage } = useChatModal();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch messages with selected user
  useEffect(() => {
    if (!selectedUser || !currentUserId) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/messages/conversation?userA=${currentUserId}&userB=${selectedUser._id}`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (e) {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [selectedUser, chatOpen, currentUserId]);

  // Fetch all conversations/messages for the current user when chat opens and no user is selected
  useEffect(() => {
    if (!chatOpen || selectedUser || !currentUserId) return;
    setLoading(true);
    fetch(`/api/messages/conversation?userId=${currentUserId}`)
      .then(res => res.json())
      .then(async data => {
        // Group messages by sender (other than current user)
        const uniqueUsers: Record<string, any> = {};
        const userIds: Set<string> = new Set();
        (data.messages || []).forEach((msg: any) => {
          const otherUser = msg.sender?._ref === currentUserId
            ? (msg.recipients?.find((r: any) => r._ref !== currentUserId) || msg.sender)
            : msg.sender;
          if (otherUser && !uniqueUsers[otherUser._ref]) {
            uniqueUsers[otherUser._ref] = {
              _id: otherUser._ref,
              lastMessage: msg.content,
              timestamp: msg.timestamp,
            };
            userIds.add(otherUser._ref);
          }
        });
        // Fetch usernames for all unique user IDs
        let usernames: Record<string, string> = {};
        if (userIds.size > 0) {
          try {
            const res = await fetch(`/api/users/search?ids=${Array.from(userIds).join(',')}`);
            const data = await res.json();
            if (Array.isArray(data.users)) {
              data.users.forEach((user: any) => {
                usernames[user._id] = user.username;
              });
            }
          } catch (e) {}
        }
        // Map usernames into conversations
        const conversationsWithNames = Object.values(uniqueUsers).map((conv: any) => ({
          ...conv,
          username: usernames[conv._id] || conv._id,
        }));
        setConversations(conversationsWithNames);
      })
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, [chatOpen, selectedUser, currentUserId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedUser]);

  // Set message input to prefillMessage when chat opens
  useEffect(() => {
    if (chatOpen) {
      setMessage(prefillMessage || "");
    }
  }, [chatOpen, prefillMessage]);

  // Search users by username when searchQuery changes (debounced)
  useEffect(() => {
    if (!isSearching) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        setSearchResults(Array.isArray(data.users) ? data.users : []);
      } catch (e) {
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    // eslint-disable-next-line
  }, [searchQuery, isSearching]);

  // Send message
  const handleSend = async () => {
    if (!currentUserId || !selectedUser?._id || !message.trim()) {
      setError("Missing user or message");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: currentUserId, recipientId: selectedUser._id, content: message }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setMessage("");
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch (e) {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Helper for avatar initials and color
  function getAvatar(username: string | undefined, id: string) {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500',
    ];
    const color = colors[id.charCodeAt(0) % colors.length];
    const initials = username ? username.slice(0, 2).toUpperCase() : '?';
    return { color, initials };
  }

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white shadow-sm sticky top-0 z-30">
      {/* Left: Menu + Logo */}
      <div className="flex items-center gap-3">
        <button
          aria-label="Open sidebar"
          className="p-2 rounded hover:bg-gray-100 transition"
          onClick={toggleSidebar}
        >
          <MenuIcon className="w-7 h-7" />
        </button>
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo_text.png"
            alt="Campus Connect"
            width={200}
            height={60}
            className="h-14 w-auto"
            priority
          />
        </Link>
      </div>
      {/* Right: Chat, Create Post, User */}
      <div className="flex items-center gap-3">
        <button
          aria-label="Open chat"
          className="rounded-full p-2 hover:bg-gray-100 transition"
          onClick={() => {
            setPrefillMessage("");
            setChatOpen(true);
          }}
        >
          <MessageSquare className="w-6 h-6" />
        </button>
        <CreatePost />
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <Button asChild variant="outline">
            <SignInButton mode="modal" />
          </Button>
        </SignedOut>
      </div>

      {/* Chat Drawer/Modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-0 max-w-lg w-full relative flex flex-col md:min-h-[500px] min-h-[400px]">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => {
                setChatOpen(false);
                setSelectedUser(null);
                setSearchResults([]);
                setMessages([]);
                setConversations([]);
                setIsSearching(false);
              }}
              aria-label="Close chat"
            >
              ×
            </button>
            {!selectedUser && !isSearching && (
              <>
                <div className="text-lg font-bold px-8 pt-8 pb-2">Messages</div>
                <div className="flex-1 overflow-y-auto px-4">
                  {loading && <div className="text-gray-500">Loading...</div>}
                  <ul className="divide-y">
                    {conversations.map((user) => {
                      const { color, initials } = getAvatar(user.username, user._id);
                      return (
                        <li
                          key={user._id}
                          className={`flex items-center gap-3 py-3 px-2 rounded-lg cursor-pointer transition-colors ${selectedUser?._id === user._id ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <span className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg ${color}`}>{initials}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">{user.username || user._id}</div>
                            <div className="text-sm text-gray-600 truncate">{user.lastMessage}</div>
                          </div>
                          <div className="text-xs text-gray-400 whitespace-nowrap">{new Date(user.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </li>
                      );
                    })}
                    {!loading && conversations.length === 0 && (
                      <li className="py-2 text-gray-500 text-center">No messages yet.</li>
                    )}
                  </ul>
                </div>
                <div className="px-8 pb-6 pt-2 flex justify-center border-t">
                  <button
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors text-base font-medium"
                    onClick={() => {
                      setIsSearching(true);
                      console.log('Start new chat clicked, showing search input');
                    }}
                    aria-label="Start new chat"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Start new chat
                  </button>
                </div>
              </>
            )}
            {isSearching && !selectedUser && (
              <>
                <div className="flex items-center gap-2 px-8 pt-8 pb-2">
                  <button
                    className="flex items-center gap-1 text-blue-600 hover:underline text-base font-medium focus:outline-none"
                    onClick={() => {
                      setIsSearching(false);
                      setSearchQuery("");
                      setSearchResults([]);
                      console.log('Back to conversations list');
                    }}
                    aria-label="Back to messages"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <span className="text-lg font-bold ml-2">Start a New Chat</span>
                </div>
                {/* Search Bar */}
                <div className="px-8 pb-4">
                  <Input
                    className="w-full rounded-2xl shadow bg-gray-50 border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    placeholder="Search users by username..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="px-8 pb-6 flex flex-col gap-2">
                  {loading && <div className="text-gray-500">Searching...</div>}
                  <ul className="divide-y">
                    {searchResults.map((user) => {
                      const { color, initials } = getAvatar(user.username, user._id);
                      return (
                        <li
                          key={user._id}
                          className="flex items-center gap-3 py-2 px-2 rounded-lg cursor-pointer hover:bg-gray-100"
                          onClick={() => setSelectedUser(user)}
                        >
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-base ${color}`}>{initials}</span>
                          <span>{user.username}</span>
                        </li>
                      );
                    })}
                    {!loading && searchQuery && searchResults.length === 0 && (
                      <li className="py-2 text-gray-500">No users found.</li>
                    )}
                  </ul>
                </div>
              </>
            )}
            {selectedUser && (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-8 pt-8 pb-4 border-b">
                  <button
                    className="flex items-center gap-1 text-blue-600 hover:underline text-base font-medium focus:outline-none mr-2"
                    onClick={() => setSelectedUser(null)}
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  {(() => {
                    const { color, initials } = getAvatar(selectedUser.username, selectedUser._id);
                    return <span className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg ${color}`}>{initials}</span>;
                  })()}
                  <span className="font-semibold text-lg">{selectedUser.username}</span>
                </div>
                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto px-8 py-4 bg-gray-50" style={{ minHeight: 200, maxHeight: 400 }}>
                  {messages.length === 0 ? (
                    <div className="text-gray-500 text-center mt-8">No messages yet. Say hello!</div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={msg._id || idx} className={`mb-4 flex ${msg.sender?._ref === currentUserId ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm text-sm break-words ${msg.sender?._ref === currentUserId ? 'bg-blue-500 text-white' : 'bg-white border text-gray-900'}`}>
                          {msg.content}
                          <div className="text-xs text-gray-400 mt-1 text-right">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                {/* Message input */}
                <form
                  className="flex items-end gap-2 px-8 pb-6 pt-2 border-t bg-transparent"
                  onSubmit={e => {
                    e.preventDefault();
                    if (!sending && message.trim()) handleSend();
                  }}
                >
                  <div className="flex-1 bg-white rounded-2xl shadow-md px-4 py-3 flex items-center min-h-[48px] max-h-[140px] focus-within:ring-2 focus-within:ring-blue-400 transition">
                    <textarea
                      className="flex-1 bg-transparent border-none outline-none resize-none text-base placeholder-gray-400 min-h-[32px] max-h-[120px]"
                      placeholder="Type your message..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (!sending && message.trim()) handleSend();
                        }
                      }}
                      rows={1}
                    />
                  </div>
                  <button
                    type="submit"
                    className={`relative flex items-center justify-center rounded-full p-3 shadow-lg transition-colors duration-150 ${message.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    disabled={!message.trim() || sending}
                    aria-label="Send message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6.75l10.5 0-10.5 0v6.75z" />
                    </svg>
                  </button>
                </form>
                {error && <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-8 py-2 text-sm mt-2 mx-8 shadow-sm">{error}</div>}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
