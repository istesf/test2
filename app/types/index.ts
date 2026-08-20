export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  name: string;
  avatarColor: string;
  messages: Message[];
}
