import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'

export interface User {
  id: string
  email: string
  name: string
  username: string
  avatar?: string | null
  status: string
  statusText?: string | null
  isOnline: boolean
  lastSeen?: Date | null
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  type: string
  status: string
  replyToId?: string | null
  createdAt: string
  sender?: {
    id: string
    name: string
    username: string
    avatar?: string | null
  }
  replyTo?: {
    id: string
    content: string
    sender?: {
      name: string
    }
  } | null
}

export interface Chat {
  id: string
  type: string
  name?: string | null
  avatar?: string | null
  lastMessage?: {
    id: string
    content: string
    type: string
    createdAt: string
    sender: {
      id: string
      name: string
      username: string
      avatar?: string | null
    }
  } | null
  unreadCount: number
  members: Partial<User>[]
  isOnline: boolean
  updatedAt: string
}

export interface CallInfo {
  id: string
  chatId: string
  callerId: string
  callerName: string
  type: 'voice' | 'video'
  status: string
  participants: {
    user: User
    status: string
  }[]
}

interface MessengerState {
  isAuthenticated: boolean
  currentUser: User | null
  
  currentView: 'chats' | 'chat' | 'settings' | 'profile'
  selectedChatId: string | null
  showAuthModal: boolean
  authMode: 'login' | 'register'
  
  chats: Chat[]
  messages: Message[]
  onlineUsers: Set<string>
  typingUsers: Map<string, string>
  
  activeCall: CallInfo | null
  incomingCall: CallInfo | null
  callStatus: 'idle' | 'ringing' | 'ongoing' | 'connecting'
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  
  socket: Socket | null
  
  setCurrentUser: (user: User | null) => void
  setAuthenticated: (value: boolean) => void
  setAuthModal: (show: boolean, mode?: 'login' | 'register') => void
  
  setCurrentView: (view: 'chats' | 'chat' | 'settings' | 'profile') => void
  selectChat: (chatId: string | null) => void
  
  setChats: (chats: Chat[]) => void
  addChat: (chat: Chat) => void
  updateChat: (chatId: string, updates: Partial<Chat>) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  
  setUserOnline: (userId: string) => void
  setUserOffline: (userId: string) => void
  setUserTyping: (chatId: string, userId: string, userName: string) => void
  setUserStopTyping: (chatId: string, userId: string) => void
  
  setActiveCall: (call: CallInfo | null) => void
  setIncomingCall: (call: CallInfo | null) => void
  setCallStatus: (status: 'idle' | 'ringing' | 'ongoing' | 'connecting') => void
  setLocalStream: (stream: MediaStream | null) => void
  setRemoteStream: (stream: MediaStream | null) => void
  
  connectSocket: () => void
  disconnectSocket: () => void
}

const SOCKET_URL = '/'

export const useMessengerStore = create<MessengerState>((set, get) => ({
  isAuthenticated: false,
  currentUser: null,
  currentView: 'chats',
  selectedChatId: null,
  showAuthModal: true,
  authMode: 'login',
  chats: [],
  messages: [],
  onlineUsers: new Set(),
  typingUsers: new Map(),
  activeCall: null,
  incomingCall: null,
  callStatus: 'idle',
  localStream: null,
  remoteStream: null,
  socket: null,

  setCurrentUser: (user) => set({ currentUser: user }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setAuthModal: (show, mode = 'login') => set({ showAuthModal: show, authMode: mode }),

  setCurrentView: (view) => set({ currentView: view }),
  selectChat: (chatId) => set({ selectedChatId: chatId, currentView: chatId ? 'chat' : 'chats' }),

  setChats: (chats) => set({ chats }),
  addChat: (chat) => set((state) => ({ 
    chats: [chat, ...state.chats.filter(c => c.id !== chat.id)] 
  })),
  updateChat: (chatId, updates) => set((state) => ({
    chats: state.chats.map(c => c.id === chatId ? { ...c, ...updates } : c)
  })),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  updateMessage: (messageId, updates) => set((state) => ({
    messages: state.messages.map(m => m.id === messageId ? { ...m, ...updates } : m)
  })),

  setUserOnline: (userId) => set((state) => {
    const newOnlineUsers = new Set(state.onlineUsers)
    newOnlineUsers.add(userId)
    return { 
      onlineUsers: newOnlineUsers,
      chats: state.chats.map(c => ({
        ...c,
        isOnline: c.members.some(m => m.id === userId) ? true : c.isOnline
      }))
    }
  }),
  setUserOffline: (userId) => set((state) => {
    const newOnlineUsers = new Set(state.onlineUsers)
    newOnlineUsers.delete(userId)
    return { 
      onlineUsers: newOnlineUsers,
      chats: state.chats.map(c => ({
        ...c,
        isOnline: c.members.some(m => m.id === userId) ? false : c.isOnline
      }))
    }
  }),
  setUserTyping: (chatId, userId, userName) => set((state) => {
    const newTypingUsers = new Map(state.typingUsers)
    newTypingUsers.set(`${chatId}:${userId}`, userName)
    return { typingUsers: newTypingUsers }
  }),
  setUserStopTyping: (chatId, userId) => set((state) => {
    const newTypingUsers = new Map(state.typingUsers)
    newTypingUsers.delete(`${chatId}:${userId}`)
    return { typingUsers: newTypingUsers }
  }),

  setActiveCall: (call) => set({ activeCall: call }),
  setIncomingCall: (call) => set({ incomingCall: call }),
  setCallStatus: (status) => set({ callStatus: status }),
  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),

  connectSocket: () => {
    const { socket: existingSocket, currentUser } = get()
    
    if (existingSocket?.connected || !currentUser) return

    const socket = io(SOCKET_URL, {
      path: '/',
      query: { XTransformPort: '3003' },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      socket.emit('authenticate', { userId: currentUser!.id })
      
      const { chats } = get()
      chats.forEach(chat => {
        socket.emit('chat:join', { chatId: chat.id })
      })
    })

    socket.on('message:new', (data) => {
      const message: Message = {
        ...data,
        createdAt: data.timestamp || new Date().toISOString(),
        sender: {
          id: data.senderId,
          name: data.senderName,
          username: data.senderName,
        },
      }
      get().addMessage(message)
      
      get().updateChat(data.chatId, {
        lastMessage: {
          id: message.id,
          content: message.content,
          type: message.type,
          createdAt: message.createdAt,
          sender: message.sender!,
        },
        unreadCount: data.chatId === get().selectedChatId ? 0 : undefined,
      })
    })

    socket.on('user:online', (data) => get().setUserOnline(data.userId))
    socket.on('user:offline', (data) => get().setUserOffline(data.userId))

    socket.on('user:typing', (data) => get().setUserTyping(data.chatId, data.userId, data.userName))
    socket.on('user:stop-typing', (data) => get().setUserStopTyping(data.chatId, data.userId))

    socket.on('messages:read', (data) => {
      data.messageIds.forEach((id: string) => {
        get().updateMessage(id, { status: 'read' })
      })
    })

    socket.on('call:incoming', (data) => {
      const call: CallInfo = {
        id: data.callId,
        chatId: data.chatId,
        callerId: data.callerId,
        callerName: data.callerName,
        type: data.type,
        status: 'ringing',
        participants: [],
      }
      set({ incomingCall: call, callStatus: 'ringing' })
    })

    socket.on('call:user-joined', (data) => {
      console.log('User joined call:', data.userId)
    })

    socket.on('call:user-declined', (data) => {
      console.log('User declined call:', data.userId)
    })

    socket.on('call:user-left', (data) => {
      console.log('User left call:', data.userId)
    })

    socket.on('call:ended', (data) => {
      set({ activeCall: null, callStatus: 'idle', localStream: null, remoteStream: null })
    })

    socket.on('webrtc:offer', async (data) => {
      console.log('Received WebRTC offer from:', data.fromUserId)
    })

    socket.on('webrtc:answer', async (data) => {
      console.log('Received WebRTC answer from:', data.fromUserId)
    })

    socket.on('webrtc:ice-candidate', async (data) => {
      console.log('Received ICE candidate from:', data.fromUserId)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    set({ socket })
  },

  disconnectSocket: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({ socket: null })
    }
  },
}))
