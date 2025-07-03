"use client";
import React, { createContext, useContext, useState } from "react";

type ChatModalContextType = {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  search: string;
  setSearch: (search: string) => void;
  prefillMessage: string;
  setPrefillMessage: (msg: string) => void;
  openChatWithUsernameAndMessage: (username: string, message: string) => void;
};

const ChatModalContext = createContext<ChatModalContextType | undefined>(undefined);

export function ChatModalProvider({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [prefillMessage, setPrefillMessage] = useState("");

  function openChatWithUsernameAndMessage(username: string, message: string) {
    setSearch(username);
    setPrefillMessage(message);
    setChatOpen(true);
  }

  return (
    <ChatModalContext.Provider value={{ chatOpen, setChatOpen, search, setSearch, prefillMessage, setPrefillMessage, openChatWithUsernameAndMessage }}>
      {children}
    </ChatModalContext.Provider>
  );
}

export function useChatModal() {
  const ctx = useContext(ChatModalContext);
  if (!ctx) throw new Error("useChatModal must be used within a ChatModalProvider");
  return ctx;
} 