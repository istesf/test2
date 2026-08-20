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

    const { id: callId } = await params
    const body = await request.json()
    const { action, status } = body

    const call = await db.call.findUnique({
      where: { id: callId },
      include: {
        participants: true,
      },
    })

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 })
    }

    const participant = call.participants.find((p) => p.userId === session.user.id)

    if (!participant) {
      return NextResponse.json({ error: "Not a participant of this call" }, { status: 403 })
    }

    let updatedCall

    switch (action) {
      case "join":
        await db.callParticipant.update({
          where: { id: participant.id },
          data: {
            status: "joined",
            joinedAt: new Date(),
          },
        })
        
        updatedCall = await db.call.update({
          where: { id: callId },
          data: { status: "ongoing" },
          include: {
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
        })
        break

      case "leave":
        await db.callParticipant.update({
          where: { id: participant.id },
          data: {
            status: "left",
            leftAt: new Date(),
          },
        })

        const remainingParticipants = await db.callParticipant.findMany({
          where: {
            callId,
            status: "joined",
          },
        })

        if (remainingParticipants.length === 0) {
          const duration = Math.floor(
            (Date.now() - new Date(call.startedAt).getTime()) / 1000
          )
          
          updatedCall = await db.call.update({
            where: { id: callId },
            data: {
              status: "ended",
              endedAt: new Date(),
              duration,
            },
          })
        } else {
          updatedCall = await db.call.findUnique({
            where: { id: callId },
            include: {
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
          })
        }
        break

      case "decline":
        await db.callParticipant.update({
          where: { id: participant.id },
          data: { status: "declined" },
        })

        updatedCall = await db.call.update({
          where: { id: callId },
          data: { status: "declined" },
        })
        break

      case "end":
        if (call.callerId !== session.user.id) {
          return NextResponse.json(
            { error: "Only the caller can end the call" },
            { status: 403 }
          )
        }

        const endDuration = Math.floor(
          (Date.now() - new Date(call.startedAt).getTime()) / 1000
        )

        await db.callParticipant.updateMany({
          where: { callId },
          data: {
            status: "left",
            leftAt: new Date(),
          },
        })

        updatedCall = await db.call.update({
          where: { id: callId },
          data: {
            status: "ended",
            endedAt: new Date(),
            duration: endDuration,
          },
        })
        break

      default:
        if (status) {
          updatedCall = await db.call.update({
            where: { id: callId },
            data: { status },
          })
        } else {
          return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }
    }

    return NextResponse.json({ call: updatedCall })
  } catch (error) {
    console.error("Update call error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: callId } = await params

    const call = await db.call.findUnique({
      where: { id: callId },
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
                isOnline: true,
              },
            },
          },
        },
      },
    })

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 })
    }

    const isParticipant = call.participants.some((p) => p.userId === session.user.id)

    if (!isParticipant) {
      return NextResponse.json({ error: "Not a participant of this call" }, { status: 403 })
    }

    return NextResponse.json({ call })
  } catch (error) {
    console.error("Get call error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
