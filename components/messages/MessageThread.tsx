"use client";
import { useEffect, useState, useRef } from "react";
import { MessageCircle, Paperclip, Send, MoreVertical, Phone, Video, Search } from "lucide-react";
import { pusherClient } from "@/lib/pusherClient";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface MessageThreadProps {
  conversationId: string | null;
  currentUserId: string | null | undefined;
}

interface ConversationPartner {
  _id: string;
  name: string;
  username: string;
  profileImage?: string;
  clerkId: string;
}

export default function MessageThread({ conversationId, currentUserId }: MessageThreadProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationPartner, setConversationPartner] = useState<ConversationPartner | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch conversation details and messages when conversation changes
  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    
    // Fetch conversation details first
    fetch(`/api/messages/${conversationId}/details`)
      .then((res) => res.json())
      .then((data) => {
        if (data.conversation) {
          const participants = data.conversation.participants || [];
          // Find the other participant (not the current user)
          let partner = participants.find((p: any) => p.clerkId && p.clerkId !== currentUserId);
          // Fallback: if not found, use the first participant
          if (!partner && participants.length > 0) partner = participants[0];
          setConversationPartner(partner);
          console.log('Conversation partner:', partner);
        }
      })
      .catch(console.error);

    // Fetch messages
    fetch(`/api/messages/${conversationId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || []);
        setLoading(false);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        
        // Mark messages as read
        fetch(`/api/messages/${conversationId}/read`, { method: 'POST' })
          .catch(console.error);
      });
  }, [conversationId, currentUserId]);

  // Subscribe to Pusher for real-time updates
  useEffect(() => {
    if (!conversationId) return;
    if (!pusherClient) return;
    
    channelRef.current = pusherClient.subscribe(`conversation-${conversationId}`);
    
    channelRef.current.bind("new-message", (data: any) => {
      setMessages((prev) => [...prev, data.message]);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      
      // Mark new message as read if it's not from current user
      if (data.message.sender?.clerkId !== currentUserId) {
        fetch(`/api/messages/${conversationId}/read`, { method: 'POST' })
          .catch(console.error);
      }
    });

    channelRef.current.bind("typing-start", (data: any) => {
      if (data.userId !== currentUserId) {
        setIsTyping(true);
      }
    });

    channelRef.current.bind("typing-stop", (data: any) => {
      if (data.userId !== currentUserId) {
        setIsTyping(false);
      }
    });

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        pusherClient.unsubscribe(`conversation-${conversationId}`);
      }
    };
  }, [conversationId, currentUserId]);

  // Handle typing indicators
  const handleTyping = () => {
    if (!conversationId || !pusherClient) return;
    
    // Emit typing start
    fetch("/api/messages/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, action: "start" }),
    });

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout for typing stop
    const timeout = setTimeout(() => {
      fetch("/api/messages/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, action: "stop" }),
      });
    }, 1000);

    setTypingTimeout(timeout);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;
    
    setSending(true);
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content: input.trim() }),
      });
      setInput("");
      
      // Stop typing indicator
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      fetch("/api/messages/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, action: "stop" }),
      });
      
      // Optimistically, message will be appended by Pusher event
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;
    
    // For now, just show a placeholder. In a real app, you'd upload to a service like AWS S3
    console.log("File upload:", file.name);
    // TODO: Implement file upload functionality
  };

  // Helper to determine if the message is sent by the current user
  const isMine = (msg: any) => {
    return msg.sender?.clerkId && currentUserId && msg.sender.clerkId === currentUserId;
  };

  // Helper to format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-blue-400">
        <MessageCircle className="w-16 h-16 mb-4" />
        <div className="text-lg font-bold">Start a conversation</div>
        <div className="text-sm text-blue-600 mt-2">Search for a user to begin messaging</div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-blue-600">Loading messages...</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Conversation Header (sticky) */}
      <div className="sticky top-0 z-10 flex items-center gap-3 p-4 border-b bg-white shadow-sm">
        {conversationPartner?.username && (
          <>
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={conversationPartner.profileImage} alt={conversationPartner.username} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
                  {conversationPartner?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" aria-label="Online" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-semibold text-gray-900 leading-tight">{conversationPartner.username}</h3>
              <span className="text-xs text-gray-500 leading-tight">@{conversationPartner.username}</span>
            </div>
          </>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-500 h-full">
            <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
            <div className="text-center">
              <div className="font-medium">No messages yet</div>
              <div className="text-sm">Start the conversation!</div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const mine = isMine(msg);
            const prev = messages[idx - 1];
            const showAvatar = !prev || prev.sender?.clerkId !== msg.sender?.clerkId;
            return (
              <div key={msg._id} className={`flex w-full ${mine ? 'justify-end' : 'justify-start'}`}>
                {!mine && showAvatar && (
                  <Avatar className="w-8 h-8 mr-2 mt-auto">
                    <AvatarImage src={msg.sender?.profileImage} alt={msg.sender?.name} />
                    <AvatarFallback className="bg-gray-100 text-gray-700 text-sm font-semibold">
                      {msg.sender?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex flex-col items-${mine ? 'end' : 'start'} max-w-[70%]`}>
                  <div className={`px-4 py-2 rounded-2xl shadow-sm ${mine ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white text-gray-900 border rounded-bl-md'}`}> 
                    <div className="break-words text-sm">{msg.content}</div>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <span>{formatTime(msg.sentAt)}</span>
                    {mine && msg.isRead && (
                      <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                {mine && showAvatar && (
                  <Avatar className="w-8 h-8 ml-2 mt-auto">
                    <AvatarImage src={msg.sender?.profileImage} alt={msg.sender?.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
                      {msg.sender?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        )}
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-end gap-2 max-w-[70%]">
            <Avatar className="w-8 h-8">
              <AvatarImage src={conversationPartner?.profileImage} alt={conversationPartner?.name} />
              <AvatarFallback className="bg-gray-100 text-gray-700 text-sm font-semibold">
                {conversationPartner?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-md shadow-sm border">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input (sticky) */}
      <div className="sticky bottom-0 z-10 bg-white border-t p-4">
        <form className="flex items-end gap-2" onSubmit={handleSend}>
          <div className="flex-1 flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                className="w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                disabled={sending}
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
                aria-label="Type your message"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 transition shadow-sm"
            disabled={sending || !input.trim()}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
} 