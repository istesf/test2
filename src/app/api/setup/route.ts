import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST() {
  try {
    await prisma.$executeRaw`SELECT 1`
    
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    return NextResponse.json({
      status: "connected",
      message: "Database connection successful",
      tables: tables
    })
  } catch (error: any) {
    if (error.code === "P1001" || error.message?.includes("can reach database")) {
      return NextResponse.json(
        { error: "Cannot connect to database. Check DATABASE_URL" },
        { status: 500 }
      )
    }
    
    if (error.code === "P1003") {
      return NextResponse.json(
        { error: "Database does not exist" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Database connection failed" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      status: "ok",
      users: userCount,
      message: "Database is working"
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Database error" },
      { status: 500 }
    )
  }
}
