import React from "react";
import { Message } from "../types/index";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

export default function MessageBubble({ message, isMe }: MessageBubbleProps) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 md:max-w-[60%] ${
          isMe
            ? "rounded-br-none bg-accent text-white"
            : "rounded-bl-none bg-zinc-800 text-zinc-100"
        }`}
      >
        <p className="break-words text-sm md:text-base">{message.text}</p>
        <span
          className={`mt-1 block text-right text-xs ${
            isMe ? "text-emerald-100/80" : "text-zinc-400"
          }`}
        >
          {message.timestamp}
        </span>
      </div>
    </div>
  );
}
