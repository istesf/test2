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

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatar: true,
        status: true,
        statusText: true,
        isOnline: true,
        lastSeen: true,
        theme: true,
        notifications: true,
        soundEnabled: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, username, avatar, status, statusText, theme, notifications, soundEnabled } = body

    if (username) {
      const existingUser = await db.user.findFirst({
        where: {
          username,
          NOT: { id: session.user.id },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 }
        )
      }
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (username !== undefined) updateData.username = username
    if (avatar !== undefined) updateData.avatar = avatar
    if (status !== undefined) updateData.status = status
    if (statusText !== undefined) updateData.statusText = statusText
    if (theme !== undefined) updateData.theme = theme
    if (notifications !== undefined) updateData.notifications = notifications
    if (soundEnabled !== undefined) updateData.soundEnabled = soundEnabled

    const user = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatar: true,
        status: true,
        statusText: true,
        isOnline: true,
        lastSeen: true,
        theme: true,
        notifications: true,
        soundEnabled: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
