import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { db } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: chatId } = await params

    const membership = await db.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: session.user.id,
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this chat" }, { status: 403 })
    }

    await db.message.updateMany({
      where: {
        chatId,
        senderId: { not: session.user.id },
        status: { not: "read" },
        deletedAt: null,
      },
      data: { status: "read" },
    })

    const unreadMessages = await db.message.findMany({
      where: {
        chatId,
        senderId: { not: session.user.id },
        deletedAt: null,
      },
      select: { id: true },
    })

    for (const msg of unreadMessages) {
      await db.messageReadReceipt.upsert({
        where: {
          messageId_userId: {
            messageId: msg.id,
            userId: session.user.id,
          },
        },
        update: {},
        create: {
          messageId: msg.id,
          userId: session.user.id,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark as read error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
