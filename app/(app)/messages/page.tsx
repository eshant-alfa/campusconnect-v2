"use client";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle } from "lucide-react";
import UserSearchModal from "@/components/messages/UserSearchModal";
import ConversationList from "@/components/messages/ConversationList";
import MessageThread from "@/components/messages/MessageThread";
import { useUser } from "@clerk/nextjs";

export default function MessagesPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const { user } = useUser();

  // When a user is selected, create/find conversation and select it
  const handleSelectUser = async (user: any) => {
    setSearchOpen(false);
    const res = await fetch("/api/messages/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantClerkId: user.clerkId }),
    });
    const data = await res.json();
    if (data.conversation?._id) {
      setSelectedConversation(data.conversation._id);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white">
      {/* Sidebar */}
      <aside className="w-80 border-r flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-700" /> Messages
          </h2>
          <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline" aria-label="New Message">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0 max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  <span className="sr-only">Start a Conversation</span>
                </DialogTitle>
              </DialogHeader>
              <UserSearchModal onSelectUser={handleSelectUser} />
            </DialogContent>
          </Dialog>
        </div>
        <ConversationList
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
        />
      </aside>
      {/* Main thread area */}
      <main className="flex-1 flex flex-col">
        <MessageThread conversationId={selectedConversation} currentUserId={user?.id} />
      </main>
    </div>
  );
} 