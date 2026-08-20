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

    const receivedRequests = await db.friendRequest.findMany({
      where: {
        receiverId: session.user.id,
        status: "pending",
      },
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
      orderBy: { createdAt: "desc" },
    })

    const sentRequests = await db.friendRequest.findMany({
      where: {
        senderId: session.user.id,
        status: "pending",
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      received: receivedRequests,
      sent: sentRequests,
    })
  } catch (error) {
    console.error("Get friend requests error:", error)
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
    const { receiverId, message } = body

    if (!receiverId || receiverId === session.user.id) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      )
    }

    const existingContact = await db.contact.findUnique({
      where: {
        ownerId_targetId: {
          ownerId: session.user.id,
          targetId: receiverId,
        },
      },
    })

    if (existingContact) {
      return NextResponse.json(
        { error: "Already contacts with this user" },
        { status: 409 }
      )
    }

    const existingRequest = await db.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId },
          { senderId: receiverId, receiverId: session.user.id },
        ],
        status: "pending",
      },
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: "Friend request already exists" },
        { status: 409 }
      )
    }

    const friendRequest = await db.friendRequest.create({
      data: {
        senderId: session.user.id,
        receiverId,
        message,
      },
      include: {
        sender: { select: { id: true, name: true, username: true, avatar: true } },
        receiver: { select: { id: true, name: true, username: true, avatar: true } },
      },
    })

    return NextResponse.json({ request: friendRequest }, { status: 201 })
  } catch (error) {
    console.error("Send friend request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
