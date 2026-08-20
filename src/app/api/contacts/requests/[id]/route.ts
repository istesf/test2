import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { db } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: requestId } = await params
    const body = await request.json()
    const { status } = body

    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'accepted' or 'rejected'" },
        { status: 400 }
      )
    }

    const friendRequest = await db.friendRequest.findUnique({
      where: { id: requestId },
    })

    if (!friendRequest) {
      return NextResponse.json({ error: "Friend request not found" }, { status: 404 })
    }

    if (friendRequest.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (friendRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Friend request already processed" },
        { status: 400 }
      )
    }

    const updatedRequest = await db.friendRequest.update({
      where: { id: requestId },
      data: { status },
    })

    if (status === "accepted") {
      await db.$transaction([
        db.contact.create({
          data: {
            ownerId: friendRequest.senderId,
            targetId: friendRequest.receiverId,
          },
        }),
        db.contact.create({
          data: {
            ownerId: friendRequest.receiverId,
            targetId: friendRequest.senderId,
          },
        }),
      ])
    }

    return NextResponse.json({
      message: `Friend request ${status}`,
      request: updatedRequest,
    })
  } catch (error) {
    console.error("Update friend request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: requestId } = await params

    const friendRequest = await db.friendRequest.findUnique({
      where: { id: requestId },
    })

    if (!friendRequest) {
      return NextResponse.json({ error: "Friend request not found" }, { status: 404 })
    }

    if (friendRequest.senderId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (friendRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending requests can be cancelled" },
        { status: 400 }
      )
    }

    await db.friendRequest.delete({
      where: { id: requestId },
    })

    return NextResponse.json({ message: "Friend request cancelled" })
  } catch (error) {
    console.error("Cancel friend request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
