"use client";

import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { MenuIcon, MessageSquare, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useSidebar } from "../ui/sidebar";
import CreatePost from "../post/CreatePost";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useChatModal } from "@/components/chat/ChatModalContext";
import { Input } from "../ui/input";

/** ---------- TYPES ---------- **/

type ConversationUser = {
  _id: string;
  username: string;
  lastMessage?: string;
  timestamp?: string | number;
};

type Message = {
  _id?: string;
  content: string;
  timestamp: string | number;
  sender: { _ref: string };
  recipients?: { _ref: string }[];
};

/** ---------- COMPONENT ---------- **/

function Header() {
  const { toggleSidebar } = useSidebar();
  const { user } = useUser();
  const currentUserId = user?.id;
  const { chatOpen, setChatOpen, prefillMessage, setPrefillMessage } = useChatModal();

  const [searchResults, setSearchResults] = useState<ConversationUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ConversationUser | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState<ConversationUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  /** ---------- EFFECTS ---------- **/

  useEffect(() => {
    if (!selectedUser || !currentUserId) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/messages/conversation?userA=${currentUserId}&userB=${selectedUser._id}`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [selectedUser, chatOpen, currentUserId]);

  useEffect(() => {
    if (!chatOpen || selectedUser || !currentUserId) return;
    setLoading(true);
    fetch(`/api/messages/conversation?userId=${currentUserId}`)
      .then(res => res.json())
      .then(async data => {
        const uniqueUsers: Record<string, ConversationUser> = {};
        const userIds = new Set<string>();

        (data.messages || []).forEach((msg: Message) => {
          const otherUser = msg.sender._ref === currentUserId
            ? msg.recipients?.find(r => r._ref !== currentUserId)
            : msg.sender;

          if (otherUser && !uniqueUsers[otherUser._ref]) {
            uniqueUsers[otherUser._ref] = {
              _id: otherUser._ref,
              lastMessage: msg.content,
              timestamp: msg.timestamp,
              username: "",
            };
            userIds.add(otherUser._ref);
          }
        });

        if (userIds.size) {
          try {
            const res = await fetch(`/api/users/search?ids=${Array.from(userIds).join(",")}`);
            const data = await res.json();
            if (Array.isArray(data.users)) {
              data.users.forEach((u: { _id: string; username: string }) => {
                if (u._id && u.username) {
                  uniqueUsers[u._id].username = u.username;
                }
              });
            }
          } catch {}
        }

        setConversations(Object.values(uniqueUsers));
      })
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, [chatOpen, selectedUser, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

  useEffect(() => {
    if (chatOpen) setMessage(prefillMessage || "");
  }, [chatOpen, prefillMessage]);

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
        setSearchResults(Array.isArray(data.users) ? data.users as ConversationUser[] : []);
      } catch {
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [searchQuery, isSearching]);

  /** ---------- HANDLERS ---------- **/

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
        setMessages(prev => [...prev, data.message]);
        setMessage("");
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  function getAvatar(username: string | undefined, id: string) {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500",
      "bg-yellow-500", "bg-red-500", "bg-indigo-500",
    ];
    const color = colors[id.charCodeAt(0) % colors.length];
    const initials = username ? username.slice(0, 2).toUpperCase() : "?";
    return { color, initials };
  }

  /** ---------- RETURN JSX ---------- **/

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white shadow-sm sticky top-0 z-30">
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

      {error && (
        <div className="fixed bottom-4 left-4 bg-red-100 text-red-700 border border-red-300 rounded px-3 py-2 text-sm shadow">
          {error}
        </div>
      )}

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
            {/* Conversation List */}
            {!selectedUser && !isSearching && (
              <>
                <div className="text-lg font-bold px-8 pt-8 pb-2">Messages</div>
                <div className="flex-1 overflow-y-auto px-4">
                  {loading && <div className="text-gray-500">Loading...</div>}
                  <ul className="divide-y">
                    {conversations.map((user: ConversationUser) => (
                      <li
                        key={user._id}
                        className={`flex items-center gap-3 py-3 px-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <span className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg bg-blue-500`}>
                          {user.username.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{user.username || user._id}</div>
                          <div className="text-sm text-gray-600 truncate">{user.lastMessage}</div>
                        </div>
                        <div className="text-xs text-gray-400 whitespace-nowrap">
                          {user.timestamp ? new Date(user.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </li>
                    ))}
                    {!loading && conversations.length === 0 && (
                      <li className="py-2 text-gray-500 text-center">No messages yet.</li>
                    )}
                  </ul>
                </div>
                <div className="px-8 pb-6 pt-2 flex justify-center border-t">
                  <button
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors text-base font-medium"
                    onClick={() => setIsSearching(true)}
                    aria-label="Start new chat"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Start new chat
                  </button>
                </div>
              </>
            )}
            {/* User Search */}
            {isSearching && !selectedUser && (
              <>
                <div className="flex items-center gap-2 px-8 pt-8 pb-2">
                  <button
                    className="flex items-center gap-1 text-blue-600 hover:underline text-base font-medium focus:outline-none"
                    onClick={() => {
                      setIsSearching(false);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    aria-label="Back to messages"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <span className="text-lg font-bold ml-2">Start a New Chat</span>
                </div>
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
                    {searchResults.map((user: ConversationUser) => (
                      <li
                        key={user._id}
                        className="flex items-center gap-3 py-2 px-2 rounded-lg cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsSearching(false);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                      >
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-base bg-blue-500`}>
                          {user.username.slice(0, 2).toUpperCase()}
                        </span>
                        <span>{user.username}</span>
                      </li>
                    ))}
                    {!loading && searchQuery && searchResults.length === 0 && (
                      <li className="py-2 text-gray-500">No users found.</li>
                    )}
                  </ul>
                </div>
              </>
            )}
            {/* Chat UI for selected user */}
            {selectedUser && (
              <>
                <div className="flex items-center gap-3 px-8 pt-8 pb-4 border-b">
                  <button
                    className="flex items-center gap-1 text-blue-600 hover:underline text-base font-medium focus:outline-none mr-2"
                    onClick={() => setSelectedUser(null)}
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <span className="font-semibold text-lg">{selectedUser.username}</span>
                </div>
                <div className="flex-1 overflow-y-auto px-8 py-4 bg-gray-50" style={{ minHeight: 200, maxHeight: 400 }}>
                  {messages.length === 0 ? (
                    <div className="text-gray-500 text-center mt-8">No messages yet. Say hello!</div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={idx} className={`mb-4 flex ${msg.sender._ref === currentUserId ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm text-sm break-words ${msg.sender._ref === currentUserId ? 'bg-blue-500 text-white' : 'bg-white border text-gray-900'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
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
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
