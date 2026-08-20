'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useMessengerStore } from '@/store/messenger'
import { 
  MessageCircle, Settings, User, Phone, Video, Search, MoreVertical,
  Send, Smile, Paperclip, Mic, Image, X, Check, CheckCheck, LogOut,
  Users, Bell, Moon, Sun, Volume2, VolumeX, Shield, Palette,
  ArrowLeft, PhoneCall, PhoneOff, VideoOff, Camera, Minimize2, Maximize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

function AuthModal() {
  const { authMode, setAuthModal, setAuthenticated, setCurrentUser } = useMessengerStore()
  const [isLoading, setIsLoading] = useState(false)
  
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
  const [regName, setRegName] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password: loginPassword,
          redirect: false,
        }),
      })
      
      if (response.ok) {
        const userResponse = await fetch('/api/users')
        if (userResponse.ok) {
          const data = await userResponse.json()
          setCurrentUser(data.user)
          setAuthenticated(true)
          setAuthModal(false)
          toast.success(`Добро пожаловать, ${data.user.name}!`)
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка входа')
      }
    } catch (error) {
      toast.error('Ошибка соединения')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          username: regUsername,
          password: regPassword,
        }),
      })
      
      if (response.ok) {
        const loginRes = await fetch('/api/auth/callback/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: regUsername,
            password: regPassword,
            redirect: false,
          }),
        })
        
        if (loginRes.ok) {
          const userResponse = await fetch('/api/users')
          if (userResponse.ok) {
            const data = await userResponse.json()
            setCurrentUser(data.user)
            setAuthenticated(true)
            setAuthModal(false)
            toast.success('Аккаунт создан! Добро пожаловать!')
          }
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка регистрации')
      }
    } catch (error) {
      toast.error('Ошибка соединения')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Messenger</h1>
            <p className="text-white/80 text-sm mt-1">
              {authMode === 'login' ? 'Войдите в аккаунт' : 'Создайте новый аккаунт'}
            </p>
          </div>

          <div className="p-6">
            <Tabs value={authMode} onValueChange={(v) => setAuthModal(true, v === 'login' ? 'login' : 'register')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-id">Имя пользователя</Label>
                    <Input
                      id="login-id"
                      type="text"
                      placeholder="@username"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Пароль</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Вход...
                      </span>
                    ) : 'Войти'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Имя</Label>
                    <Input
                      id="reg-name"
                      placeholder="Ваше имя"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-username">Имя пользователя</Label>
                    <Input
                      id="reg-username"
                      placeholder="@username"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Пароль</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Минимум 4 символа"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      minLength={4}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Создание...
                      </span>
                    ) : 'Создать аккаунт'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <div className="px-6 pb-6">
            <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Анонимная регистрация</p>
              <p>Email не требуется. Просто выберите имя и пароль!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatList() {
  const { chats, selectChat, selectedChatId, currentUser, onlineUsers } = useMessengerStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [searchUsers, setSearchUsers] = useState<any[]>([])
  const [userSearch, setUserSearch] = useState('')

  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const searchForUsers = async (query: string) => {
    setUserSearch(query)
    if (query.length >= 2) {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setSearchUsers(data.users)
        }
      } catch (error) {
        console.error('Search error:', error)
      }
    } else {
      setSearchUsers([])
    }
  }

  const startChat = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'direct',
          participantIds: [targetUserId],
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setShowNewChat(false)
        setUserSearch('')
        selectChat(data.chat)
        fetchChats()
      }
    } catch (error) {
      toast.error('Ошибка создания чата')
    }
  }

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/chats')
      if (res.ok) {
        const data = await res.json()
        useMessengerStore.getState().setChats(data.chats)
      }
    } catch (error) {
      console.error('Fetch chats error:', error)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchChats()
    }
  }, [currentUser])

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Вчера'
    } else if (days < 7) {
      return date.toLocaleDateString('ru-RU', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
    }
  }

  const getOnlineStatus = (chat: any) => {
    if (chat.type === 'group') return null
    const otherMember = chat.members?.find((m: any) => m.id !== currentUser?.id)
    if (!otherMember) return false
    return onlineUsers.has(otherMember.id) || otherMember.isOnline
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold">Сообщения</h2>
        <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" size="sm">
              <MessageCircle className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый чат</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Поиск пользователей..."
                value={userSearch}
                onChange={(e) => searchForUsers(e.target.value)}
              />
              {searchUsers.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {searchUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => startChat(user.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {user.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full"></span>
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                      {user.isOnline && (
                        <Badge variant="default" className="bg-emerald-500 shrink-0">Онлайн</Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative px-4 pb-2">
        <Search className="absolute left-9 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Нет диалогов</p>
              <p className="text-sm">Начните новый разговор</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => selectChat(chat.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted ${
                  selectedChatId === chat.id ? 'bg-muted' : ''
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={chat.avatar || undefined} />
                    <AvatarFallback>{chat.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  {getOnlineStatus(chat) && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-background rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold truncate">{chat.name}</span>
                    {chat.lastMessage && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage?.content || 'Нет сообщений'}
                    </p>
                    {chat.unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-xs shrink-0">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function MessageBubble({ message, isOwn }: { message: any; isOwn: boolean }) {
  const replyToSender = message.replyTo?.sender?.name

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%] ${isOwn ? 'order-1' : ''}`}>
        {replyToSender && (
          <div className={`px-3 py-2 rounded-t-lg text-xs ${
            isOwn ? 'bg-primary/20 text-primary-foreground ml-auto' : 'bg-muted mr-auto'
          }`}>
            <span className="font-medium">{replyToSender}</span>: {message.replyTo.content}
          </div>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl ${
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted rounded-bl-md'
          }`}
        >
          <p className="break-words">{message.content}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'justify-end' : ''}`}>
          <span className="text-xs text-muted-foreground">
            {new Date(message.createdAt).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {isOwn && (
            <>
              {message.status === 'sent' && <Check className="w-3.5 h-3.5 text-muted-foreground" />}
              {message.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />}
              {message.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ChatView() {
  const { 
    selectedChatId, chats, messages, currentUser, socket, typingUsers,
    addMessage, updateChat, selectChat, setUserStopTyping
  } = useMessengerStore()
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [replyingTo, setReplyingTo] = useState<any>(null)
  const [showCallMenu, setShowCallMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const selectedChat = chats.find(c => c.id === selectedChatId)
  const chatName = selectedChat?.name || 'Чат'
  const chatAvatar = selectedChat?.avatar

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    if (!selectedChatId) return
    try {
      const res = await fetch(`/api/chats/${selectedChatId}/messages`)
      if (res.ok) {
        const data = await res.json()
        useMessengerStore.getState().setMessages(data.messages)
      }
    } catch (error) {
      console.error('Fetch messages error:', error)
    }
  }

  const markAsRead = async () => {
    if (!selectedChatId) return
    try {
      await fetch(`/api/chats/${selectedChatId}/read`, { method: 'POST' })
      updateChat(selectedChatId!, { unreadCount: 0 })
    } catch (error) {
      console.error('Mark as read error:', error)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (selectedChatId && currentUser) {
      fetchMessages()
      markAsRead()
      socket?.emit('chat:join', { chatId: selectedChatId })
      
      return () => {
        socket?.emit('chat:leave', { chatId: selectedChatId })
      }
    }
  }, [selectedChatId])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChatId) return
    
    const content = newMessage.trim()
    setNewMessage('')
    setReplyingTo(null)
    
    stopTyping()

    try {
      const res = await fetch(`/api/chats/${selectedChatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          type: 'text',
          replyToId: replyingTo?.id,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        addMessage(data.message)
        
        socket?.emit('message:send', {
          chatId: selectedChatId,
          messageId: data.message.id,
          content: data.message.content,
          senderId: currentUser!.id,
          senderName: currentUser!.name,
          type: data.message.type,
        })

        updateChat(selectedChatId, {
          lastMessage: {
            id: data.message.id,
            content: data.message.content,
            type: data.message.type,
            createdAt: data.message.createdAt,
            sender: {
              id: currentUser!.id,
              name: currentUser!.name,
              username: currentUser!.username,
              avatar: currentUser!.avatar,
            },
          },
        })
      }
    } catch (error) {
      toast.error('Ошибка отправки сообщения')
    }
  }

  const startTyping = () => {
    if (!isTyping && selectedChatId) {
      setIsTyping(true)
      socket?.emit('typing:start', {
        chatId: selectedChatId,
        userId: currentUser!.id,
        userName: currentUser!.name,
      })
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 3000)
  }

  const stopTyping = () => {
    if (isTyping && selectedChatId) {
      setIsTyping(false)
      socket?.emit('typing:stop', {
        chatId: selectedChatId,
        userId: currentUser!.id,
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const initiateCall = async (type: 'voice' | 'video') => {
    if (!selectedChatId) return
    
    try {
      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChatId,
          type,
        }),
      })

      if (res.ok) {
        const data = await res.call
        socket?.emit('call:initiate', {
          callId: data.id,
          chatId: selectedChatId,
          callerId: currentUser!.id,
          callerName: currentUser!.name,
          type,
          participants: selectedChat?.members.filter(m => m.id !== currentUser!.id).map(m => m.id),
        })
        
        useMessengerStore.getState().setActiveCall(data)
        useMessengerStore.getState().setCallStatus('connecting')
        setShowCallMenu(false)
        toast.success(`${type === 'voice' ? 'Аудио' : 'Видео'} звонок начат...`)
      }
    } catch (error) {
      toast.error('Ошибка начала звонка')
    }
  }

  const currentTypingUsers = Array.from(typingUsers.values()).filter((_, key) =>
    String(key).startsWith(`${selectedChatId}:`)
  )

  const isChatPartnerOnline = selectedChat?.members?.some(
    (m: any) => m.id !== currentUser?.id && useMessengerStore.getState().onlineUsers.has(m.id)
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => selectChat(null)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="relative cursor-pointer flex items-center gap-2">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={chatAvatar || undefined} />
              <AvatarFallback>{chatName.charAt(0)}</AvatarFallback>
            </Avatar>
            {(isChatPartnerOnline || selectedChat?.isOnline) && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full"></span>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{chatName}</h3>
            <p className="text-sm text-muted-foreground">
              {currentTypingUsers.length > 0
                ? `${Array.from(new Set(currentTypingUsers)).join(', ')} печатает...`
                : (isChatPartnerOnline || selectedChat?.isOnline)
                ? '🟢 Онлайн'
                : 'Был(а) недавно'
              }
            </p>
          </div>
        </div>

        <div className="ml-auto relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCallMenu(!showCallMenu)}
          >
            <Phone className="w-5 h-5" />
          </Button>
          
          {showCallMenu && (
            <div className="absolute right-0 top-full mt-2 bg-popover border rounded-lg shadow-lg p-2 z-50">
              <button
                onClick={() => initiateCall('voice')}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-muted transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                Аудиозвонок
              </button>
              <button
                onClick={() => initiateCall('video')}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-muted transition-colors"
              >
                <Video className="w-4 h-4" />
                Видеозвонок
              </button>
            </div>
          )}
        </div>

        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarImage src={chatAvatar || undefined} />
              <AvatarFallback className="text-2xl">{chatName.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="font-medium text-lg">{chatName}</p>
            <p className="text-sm">Начните диалог! Отправьте сообщение.</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === currentUser?.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </ScrollArea>

      {replyingTo && (
        <div className="px-4 py-2 bg-muted border-t flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Ответ для {replyingTo.sender?.name}:</span>
            <span className="truncate max-w-[200px] text-muted-foreground">
              {replyingTo.content}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setReplyingTo(null)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="p-4 border-t bg-background">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                if (e.target.value.trim()) {
                  startTyping()
                } else {
                  stopTyping()
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Написать сообщение..."
              className="min-h-[44px] max-h-32 resize-none pr-10"
              rows={1}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 bottom-1"
            >
              <Smile className="w-5 h-5" />
            </Button>
          </div>
          
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function SettingsView() {
  const { currentUser, setCurrentUser, setCurrentView } = useMessengerStore()
  const [isLoading, setIsLoading] = useState(false)
  
  const [name, setName] = useState(currentUser?.name || '')
  const [username, setUsername] = useState(currentUser?.username || '')
  const [statusText, setStatusText] = useState(currentUser?.statusText || '')
  const [notifications, setNotifications] = useState(currentUser?.notifications ?? true)
  const [soundEnabled, setSoundEnabled] = useState(currentUser?.soundEnabled ?? true)
  const [theme, setTheme] = useState(currentUser?.theme || 'system')

  const saveSettings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          username,
          statusText,
          notifications,
          soundEnabled,
          theme,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setCurrentUser(data.user)
        toast.success('Настройки сохранены')
      }
    } catch (error) {
      toast.error('Ошибка сохранения')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      useMessengerStore.setState({
        isAuthenticated: false,
        currentUser: null,
        showAuthModal: true,
        currentView: 'chats',
        selectedChatId: null,
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => setCurrentView('chats')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">Настройки</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Профиль
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={currentUser?.avatar || undefined} />
                  <AvatarFallback className="text-2xl">{currentUser?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  Изменить фото
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="settings-name">Имя</Label>
                <Input
                  id="settings-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="settings-username">Имя пользователя</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                  <Input
                    id="settings-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="settings-status">Статус</Label>
                <Input
                  id="settings-status"
                  placeholder="Чем вы заняты?"
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                />
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Уведомления
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  <span>Push-уведомления</span>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  <span>Звуки</span>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Внешний вид
            </h3>
            <div className="space-y-2">
              <Label>Тема</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'light', icon: Sun, label: 'Светлая' },
                  { value: 'dark', icon: Moon, label: 'Тёмная' },
                  { value: 'system', icon: Palette, label: 'Системная' },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                      theme === value ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Приватность и безопасность
            </h3>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Shield className="w-5 h-5" />
              Изменить пароль
            </Button>
          </section>

          <Separator />

          <Button
            onClick={saveSettings}
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>

          <Button
            variant="destructive"
            onClick={logout}
            className="w-full"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Выйти из аккаунта
          </Button>
        </div>
      </ScrollArea>
    </div>
  )
}

function CallOverlay() {
  const { activeCall, incomingCall, callStatus, localStream, remoteStream, socket, currentUser } = useMessengerStore()
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (callStatus === 'ongoing') {
      let duration = 0
      setCallDuration(0)
      intervalRef.current = setInterval(() => {
        duration++
        setCallDuration(duration)
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setCallDuration(0)
    }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [callStatus])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const acceptCall = async () => {
    if (!incomingCall) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: incomingCall.type === 'video',
      })

      useMessengerStore.getState().setLocalStream(stream)
      useMessengerStore.getState().setActiveCall(incomingCall)
      useMessengerStore.getState().setIncomingCall(null)
      useMessengerStore.getState().setCallStatus('ongoing')

      socket?.emit('call:accept', {
        callId: incomingCall.id,
        userId: currentUser?.id,
        chatId: incomingCall.chatId,
      })

      await fetch(`/api/calls/${incomingCall.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join' }),
      })

      toast.success('Вы присоединились к звонку')
    } catch (error) {
      toast.error('Не удалось получить доступ к микрофону/камере')
      declineCall()
    }
  }

  const declineCall = async () => {
    if (!incomingCall) return

    socket?.emit('call:decline', {
      callId: incomingCall.id,
      userId: currentUser?.id,
      chatId: incomingCall.chatId,
      callerId: incomingCall.callerId,
    })

    await fetch(`/api/calls/${incomingCall.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'decline' }),
    })

    useMessengerStore.setState({
      incomingCall: null,
      callStatus: 'idle',
    })
  }

  const endCall = async () => {
    if (!activeCall) return

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }

    socket?.emit('call:end', {
      callId: activeCall.id,
      chatId: activeCall.chatId,
      duration: callDuration,
    })

    await fetch(`/api/calls/${activeCall.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'end' }),
    })

    useMessengerStore.setState({
      activeCall: null,
      callStatus: 'idle',
      localStream: null,
      remoteStream: null,
    })
  }

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!isMuted)
      }
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!isVideoOff)
      }
    }
  }

  if (incomingCall) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900 to-slate-800 z-50 flex flex-col items-center justify-center text-white">
        <div className="text-center mb-8">
          <Avatar className="w-28 h-28 mx-auto mb-4 ring-4 ring-white/20">
            <AvatarFallback className="text-4xl bg-emerald-600">
              {incomingCall.callerName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold">{incomingCall.callerName}</h2>
          <p className="text-white/70 mt-2">
            {incomingCall.type === 'video' ? 'Видеозвонок' : 'Аудиозвонок'}
          </p>
          <p className="text-white/50 mt-1 animate-pulse">Входящий вызов...</p>
        </div>

        <div className="flex gap-8">
          <button
            onClick={declineCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
          <button
            onClick={acceptCall}
            className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors animate-pulse"
          >
            <PhoneCall className="w-7 h-7" />
          </button>
        </div>
      </div>
    )
  }

  if (activeCall && callStatus === 'ongoing') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex-1 relative flex items-center justify-center">
          {remoteStream && activeCall.type === 'video' ? (
            <video
              ref={(el) => {
                if (el) el.srcObject = remoteStream
              }}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-white">
              <Avatar className="w-32 h-32 mx-auto mb-4">
                <AvatarFallback className="text-4xl bg-emerald-600">
                  {activeCall.callerName?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">{activeCall.callerName}</h2>
              <p className="text-white/70 mt-2">{formatDuration(callDuration)}</p>
            </div>
          )}

          {localStream && activeCall.type === 'video' && (
            <div className="absolute top-4 right-4 w-32 h-40 rounded-lg overflow-hidden shadow-lg">
              <video
                ref={(el) => {
                  if (el) el.srcObject = localStream
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="absolute top-4 left-4 text-white">
            <Badge variant="secondary" className="bg-black/50">
              {activeCall.type === 'video' ? '📹 Видео' : '📞 Аудио'}
            </Badge>
          </div>
        </div>

        <div className="p-8 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isMuted ? <Mic className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
            </button>

            {activeCall.type === 'video' && (
              <button
                onClick={toggleVideo}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                  isVideoOff ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
              </button>
            )}

            <button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function MessengerApp() {
  const { 
    isAuthenticated, showAuthModal, currentView, selectedChatId,
    connectSocket, disconnectSocket, currentUser
  } = useMessengerStore()

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      connectSocket()
    }
    
    return () => {
      disconnectSocket()
    }
  }, [isAuthenticated, currentUser])

  if (showAuthModal || !isAuthenticated) {
    return (
      <>
        <AuthModal />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
            <h1 className="text-2xl font-bold">Messenger</h1>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="h-screen flex bg-background">
      <aside className={`${
        selectedChatId ? 'hidden md:flex' : 'flex'
      } w-full md:w-96 lg:w-[420px] flex-col border-r`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold hidden sm:block">Messenger</h1>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => useMessengerStore.getState().setCurrentView('settings')}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {currentView === 'chats' || currentView === 'chat' ? (
          <ChatList />
        ) : currentView === 'settings' ? (
          <SettingsView />
        ) : null}
      </aside>

      <main className={`${
        !selectedChatId ? 'hidden md:flex' : 'flex'
      } flex-1 flex-col`}>
        {selectedChatId ? (
          <ChatView />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/30">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="w-24 h-24 mx-auto mb-4 opacity-20" />
              <h2 className="text-xl font-medium">Выберите чат</h2>
              <p className="mt-2">или начните новый разговор</p>
            </div>
          </div>
        )}
      </main>

      <CallOverlay />
    </div>
  )
}
