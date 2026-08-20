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

    const contacts = await db.contact.findMany({
      where: { ownerId: session.user.id },
      include: {
        target: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            status: true,
            isOnline: true,
            lastSeen: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ 
      contacts: contacts.map((c) => ({
        ...c.target,
        contactId: c.id,
        nickname: c.nickname,
        isBlocked: c.isBlocked,
        isFavorite: c.isFavorite,
      }))
    })
  } catch (error) {
    console.error("Get contacts error:", error)
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
    const { targetId } = body

    if (!targetId || targetId === session.user.id) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      )
    }

    const existingContact = await db.contact.findUnique({
      where: {
        ownerId_targetId: {
          ownerId: session.user.id,
          targetId,
        },
      },
    })

    if (existingContact) {
      return NextResponse.json(
        { error: "Contact already exists" },
        { status: 409 }
      )
    }

    const targetUser = await db.user.findUnique({
      where: { id: targetId },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    await db.$transaction([
      db.contact.create({
        data: {
          ownerId: session.user.id,
          targetId,
        },
      }),
      db.contact.create({
        data: {
          ownerId: targetId,
          targetId: session.user.id,
        },
      }),
    ])

    return NextResponse.json(
      { message: "Contact added successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Add contact error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
