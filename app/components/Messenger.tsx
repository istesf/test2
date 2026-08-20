"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { initialChats } from "../data/mockData";
import { Chat, Message } from "../types/index";

export default function Messenger() {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(
    initialChats[0].id
  );
  const [isMobileChatView, setIsMobileChatView] = useState(false);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setIsMobileChatView(true);
  };

  const handleSendMessage = (text: string) => {
    if (!activeChatId || !text.trim()) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: "me",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      )
    );
  };

  const handleBackToList = () => {
    setIsMobileChatView(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-950">
      <div
        className={`w-full border-r border-zinc-800 md:w-1/3 lg:w-1/4 ${
          isMobileChatView ? "hidden md:block" : "block"
        }`}
      >
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
        />
      </div>
      <div
        className={`w-full md:w-2/3 lg:w-3/4 ${
          isMobileChatView ? "block" : "hidden md:block"
        }`}
      >
        {activeChat ? (
          <ChatWindow
            chat={activeChat}
            onSendMessage={handleSendMessage}
            onBack={handleBackToList}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
