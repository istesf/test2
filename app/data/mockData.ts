import { Chat } from "../types/index";

export const initialChats: Chat[] = [
  {
    id: "1",
    name: "Alice Johnson",
    avatarColor: "bg-emerald-600",
    messages: [
      {
        id: "m1",
        senderId: "1",
        text: "Hey! Are we still on for tomorrow?",
        timestamp: "10:30",
      },
      {
        id: "m2",
        senderId: "me",
        text: "Hi Alice! Yes, absolutely. Looking forward to it.",
        timestamp: "10:32",
      },
      {
        id: "m3",
        senderId: "1",
        text: "Great! I'll send you the details later tonight.",
        timestamp: "10:33",
      },
    ],
  },
  {
    id: "2",
    name: "Bob Smith",
    avatarColor: "bg-blue-600",
    messages: [
      {
        id: "m4",
        senderId: "2",
        text: "Did you see the latest project update?",
        timestamp: "09:15",
      },
      {
        id: "m5",
        senderId: "me",
        text: "Not yet, is it important?",
        timestamp: "09:20",
      },
      {
        id: "m6",
        senderId: "2",
        text: "Very! Check your email when you get a chance.",
        timestamp: "09:21",
      },
    ],
  },
  {
    id: "3",
    name: "Design Team",
    avatarColor: "bg-purple-600",
    messages: [
      {
        id: "m7",
        senderId: "3",
        text: "The new Figma file is ready for review.",
        timestamp: "Yesterday",
      },
      {
        id: "m8",
        senderId: "me",
        text: "Awesome, I'll take a look right now.",
        timestamp: "Yesterday",
      },
      {
        id: "m9",
        senderId: "3",
        text: "Let me know if you need any changes.",
        timestamp: "Yesterday",
      },
    ],
  },
  {
    id: "4",
    name: "Charlie Brown",
    avatarColor: "bg-orange-600",
    messages: [
      {
        id: "m10",
        senderId: "4",
        text: "Hey, how's the weather there?",
        timestamp: "Mon",
      },
      {
        id: "m11",
        senderId: "me",
        text: "It's raining cats and dogs!",
        timestamp: "Mon",
      },
    ],
  },
];
