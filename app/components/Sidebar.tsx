import React from "react";
import { Chat } from "../types/index";

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
}

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
}: SidebarProps) {
  return (
    <aside className="flex h-full flex-col bg-zinc-900">
      <header className="border-b border-zinc-800 p-6">
        <h1 className="text-3xl font-bold tracking-tight text-accent">wwww</h1>
      </header>
      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`flex w-full items-center border-b border-zinc-800 p-4 text-left transition-colors hover:bg-zinc-800/50 ${
              chat.id === activeChatId ? "bg-zinc-800" : ""
            }`}
          >
            <div
              className={`mr-4 flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white ${chat.avatarColor}`}
            >
              {chat.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <h2 className="truncate text-base font-semibold text-zinc-100">
                {chat.name}
              </h2>
              <p className="truncate text-sm text-zinc-400">
                {chat.messages[chat.messages.length - 1]?.text || "No messages"}
              </p>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
