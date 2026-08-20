# Messenger

Современный веб-мессенджер с поддержкой реального времени, звонков и анонимной регистрации.

## Возможности

- **Анонимная регистрация** - без email, только имя пользователя и пароль
- **Реальное время** - мгновенная доставка сообщений через WebSocket
- **Онлайн-статус** - видно, когда пользователь онлайн
- **Аудиозвонки** - голосовые вызовы через WebRTC
- **Видеозвонки** - видеосвязь с камерой
- **Индикаторы печати** - видно, когда собеседник печатает
- **Статусы сообщений** - отправлено/доставлено/прочитано
- **Поиск пользователей** - быстрый поиск по имени или username
- **Контакты** - добавление в друзья
- **Настройки** - тема, уведомления, звуки

## Технологии

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM (SQLite)
- **Real-time**: Socket.IO WebSocket сервер
- **Звонки**: WebRTC + сигнализация через WebSocket
- **Состояние**: Zustand store

## Установка

```bash
# Клонировать репозиторий
git clone <repo-url>
cd messenger

# Установить зависимости
bun install

# Настроить переменные окружения
cp .env.example .env

# Применить схему базы данных
bun run db:push

# Запустить WebSocket сервис
cd mini-services/messenger-ws && bun install && bun run dev &

# Запустить основной сервер
bun run dev
```

## Переменные окружения

```env
DATABASE_URL="file:./db/custom.db"
NEXTAUTH_SECRET="your-secret-key-here"
```

## Структура проекта

```
src/
├── app/
│   ├── api/          # API маршруты
│   │   ├── auth/     # Авторизация
│   │   ├── chats/    # Чаты и сообщения
│   │   ├── users/    # Пользователи
│   │   ├── contacts/ # Контакты
│   │   └── calls/    # Звонки
│   └── page.tsx      # Главная страница
├── components/
│   ├── ui/           # shadcn/ui компоненты
│   └── messenger/    # Компоненты мессенджера
├── lib/
│   ├── auth/         # Конфигурация NextAuth
│   └── db.ts         # Prisma клиент
├── store/
│   └── messenger.ts  # Zustand store
└── ...
mini-services/
└── messenger-ws/     # WebSocket сервер
```

## API Эндпоинты

### Авторизация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/[...nextauth]` - Вход/выход

### Пользователи
- `GET /api/users` - Получить текущего пользователя
- `PUT /api/users` - Обновить профиль
- `GET /api/users/search?q=` - Поиск пользователей

### Чаты
- `GET /api/chats` - Список чатов
- `POST /api/chats` - Создать чат
- `GET /api/chats/[id]` - Детали чата
- `DELETE /api/chats/[id]` - Покинуть чат
- `GET /api/chats/[id]/messages` - Сообщения чата
- `POST /api/chats/[id]/messages` - Отправить сообщение
- `POST /api/chats/[id]/read` - Отметить как прочитанное

### Контакты
- `GET /api/contacts` - Список контактов
- `POST /api/contacts` - Добавить контакт
- `GET /api/contacts/requests` - Запросы дружбы
- `POST /api/contacts/requests` - Отправить запрос
- `PUT /api/contacts/requests/[id]` - Принять/отклонить
- `DELETE /api/contacts/requests/[id]` - Отменить запрос

### Звонки
- `POST /api/calls` - Начать звонок
- `GET /api/calls` - История звонков
- `GET /api/calls/[id]` - Детали звонка
- `PUT /api/calls/[id]` - Управление звонком

## Лицензия

MIT
