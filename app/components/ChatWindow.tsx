import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { Chat } from "../types/index";

interface ChatWindowProps {
  chat: Chat;
  onSendMessage: (text: string) => void;
  onBack: () => void;
}

export default function ChatWindow({
  chat,
  onSendMessage,
  onBack,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  return (
    <section className="flex h-full flex-col bg-zinc-950">
      <header className="flex items-center border-b border-zinc-800 p-4">
        <button
          onClick={onBack}
          className="mr-4 text-zinc-400 hover:text-zinc-100 md:hidden"
          aria-label="Back to chat list"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div
          className={`mr-3 flex h-10 w-10 items-center justify-center rounded-full font-semibold text-white ${chat.avatarColor}`}
        >
          {chat.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">{chat.name}</h2>
          <p className="text-xs text-emerald-400">Online</p>
        </div>
      </header>

      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
        {chat.messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isMe={message.senderId === "me"}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
