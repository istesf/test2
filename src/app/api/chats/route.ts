import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const chatMembers = await db.chatMember.findMany({
      where: { userId: session.user.id },
      include: {
        chat: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true,
                    status: true,
                    isOnline: true,
                  },
                },
              },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true,
                  },
                },
              },
            },
            _count: {
              select: {
                messages: {
                  where: {
                    NOT: { senderId: session.user.id },
                    status: { not: "read" },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    })

    const chats = chatMembers.map((cm) => {
      const chat = cm.chat
      const otherMember = chat.members.find((m) => m.userId !== session.user.id)
      const lastMessage = chat.messages[0]
      
      return {
        id: chat.id,
        type: chat.type,
        name: chat.type === "group" ? chat.name : otherMember?.user?.name || "Unknown",
        avatar: chat.type === "group" ? chat.avatar : otherMember?.user?.avatar,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              type: lastMessage.type,
              createdAt: lastMessage.createdAt,
              sender: lastMessage.sender,
            }
          : null,
        unreadCount: chat._count.messages,
        members: chat.members.map((m) => ({
          ...m.user,
          role: m.role,
        })),
        isOnline: otherMember?.user?.isOnline || false,
        updatedAt: chat.updatedAt,
      }
    })

    chats.sort((a, b) => {
      const aDate = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0
      const bDate = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0
      return bDate - aDate
    })

    return NextResponse.json({ chats })
  } catch (error) {
    console.error("Get chats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type = "direct", participantIds, name, avatar } = body

    if (type === "direct") {
      if (!participantIds || participantIds.length !== 1) {
        return NextResponse.json(
          { error: "Direct chat requires exactly one participant" },
          { status: 400 }
        )
      }

      const targetUserId = participantIds[0]

      const existingChatMembers = await db.chatMember.findMany({
        where: { userId: session.user.id },
        include: {
          chat: {
            include: { members: true },
          },
        },
      })

      for (const cm of existingChatMembers) {
        if (
          cm.chat.type === "direct" &&
          cm.chat.members.length === 2 &&
          cm.chat.members.some((m) => m.userId === targetUserId)
        ) {
          return NextResponse.json({ chatId: cm.chat.id })
        }
      }

      const chat = await db.chat.create({
        data: {
          type: "direct",
          createdBy: session.user.id,
          members: {
            create: [
              { userId: session.user.id, role: "admin" },
              { userId: targetUserId, role: "member" },
            ],
          },
        },
      })

      return NextResponse.json({ chat: chat.id }, { status: 201 })
    } else {
      if (!name) {
        return NextResponse.json(
          { error: "Group chat requires a name" },
          { status: 400 }
        )
      }

      if (!participantIds || participantIds.length < 1) {
        return NextResponse.json(
          { error: "Group chat requires at least one participant" },
          { status: 400 }
        )
      }

      const chat = await db.chat.create({
        data: {
          type: "group",
          name,
          avatar,
          createdBy: session.user.id,
          members: {
            create: [
              { userId: session.user.id, role: "admin" },
              ...participantIds.map((id: string) => ({ userId: id, role: "member" })),
            ],
          },
        },
      })

      return NextResponse.json({ chat: chat.id }, { status: 201 })
    }
  } catch (error) {
    console.error("Create chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
