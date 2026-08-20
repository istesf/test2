import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { chatId, type = "voice" } = body

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      )
    }

    const membership = await db.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: session.user.id,
        },
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this chat" },
        { status: 403 }
      )
    }

    const members = await db.chatMember.findMany({
      where: { chatId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            isOnline: true,
          },
        },
      },
    })

    const call = await db.call.create({
      data: {
        chatId,
        callerId: session.user.id,
        type,
        status: "initiated",
        participants: {
          create: [
            {
              userId: session.user.id,
              status: "joined",
              joinedAt: new Date(),
            },
            ...members
              .filter((m) => m.userId !== session.user.id)
              .map((m) => ({
                userId: m.userId,
                status: "invited",
              })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                isOnline: true,
              },
            },
          },
        },
        caller: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({ call }, { status: 201 })
  } catch (error) {
    console.error("Initiate call error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const calls = await db.callParticipant.findMany({
      where: { userId: session.user.id },
      include: {
        call: {
          include: {
            caller: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { call: { startedAt: "desc" } },
      take: 50,
    })

    return NextResponse.json({
      calls: calls.map((cp) => cp.call),
    })
  } catch (error) {
    console.error("Get calls error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
