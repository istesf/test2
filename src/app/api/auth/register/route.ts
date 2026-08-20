import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, username, password, email } = body

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: "Имя, имя пользователя и пароль обязательны" },
        { status: 400 }
      )
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: "Пароль должен быть минимум 4 символа" },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Имя пользователя должно быть минимум 3 символа" },
        { status: 400 }
      )
    }

    const autoEmail = email || `${username.toLowerCase().replace(/\s+/g, '_')}@messenger.local`

    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email: autoEmail }, { username }],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким именем или email уже существует" },
        { status: 409 }
      )
    }

    const hashedPassword = await hash(password, 12)

    const user = await db.user.create({
      data: {
        name,
        username,
        email: autoEmail,
        password: hashedPassword,
        status: "online",
        isOnline: true,
      },
    })

    return NextResponse.json(
      {
        message: "Аккаунт успешно создан!",
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          status: user.status,
          isOnline: user.isOnline,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
