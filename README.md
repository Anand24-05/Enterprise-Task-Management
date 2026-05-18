# TaskFlow Pro 🚀

A full-stack MERN task management application with role-based authentication, real-time notifications, team collaboration, and a polished dark UI.

---

## Project Structure

```
TaskFlow-Pro/
├── backend/          # Node.js + Express + MongoDB API
│   ├── server.js
│   └── src/
│       ├── config/       # DB connection
│       ├── controllers/  # Business logic
│       ├── middleware/    # Auth, rate-limiting
│       ├── models/        # Mongoose schemas
│       ├── routes/        # API routes
│       ├── socket/        # Socket.io real-time
│       └── utils/         # JWT, email helpers
└── frontend/         # React + Vite + Tailwind
    └── src/
        ├── components/   # Reusable UI
        ├── pages/        # Route-level pages
        ├── redux/        # State management
        └── services/     # API + Socket clients
```

---

## Features

- **Authentication** — JWT access + refresh tokens, HTTP-only cookies, email verification
- **Role-Based Access** — `user` and `company` roles with different permissions
- **Calendar View** — Monthly calendar with color-coded tasks; create/read/update/delete by date type
- **Collaboration** — Team task board grouped by employee; company-wide visibility
- **Real-time Notifications** — Socket.io push for task assignments and collaborator adds
- **Dashboard** — Stats, completion rate donut chart, recent tasks
- **Profile & Settings** — Edit profile, change password/email, pick UI theme
- **Security** — Helmet, CORS, Mongo sanitization, rate limiting, XSS protection

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- A Gmail account (for email verification) with an App Password

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

**Required `.env` values:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow_pro
JWT_SECRET=change_this_to_a_long_random_string
JWT_REFRESH_SECRET=another_long_random_string
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → generate one for "Mail".

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so no CORS issues in development.

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register user or company |
| GET | `/verify-email?token=...` | Verify email |
| POST | `/login` | Login with userId + password |
| POST | `/refresh-token` | Refresh access token |
| POST | `/logout` | Logout (clears cookies) |
| GET | `/me` | Get current user |

### Tasks (`/api/tasks`) — Protected
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/date/:date` | Get tasks for a date (YYYY-MM-DD) |
| GET | `/month/:year/:month` | Get tasks for a month |
| POST | `/` | Create task |
| PUT | `/:id` | Update task |
| PATCH | `/:id/toggle-done` | Toggle done/undone |
| DELETE | `/:id` | Delete task |
| POST | `/assign` | Company assigns task to user |
| GET | `/search?q=...` | Search tasks |

### Collaboration (`/api/collaboration`) — Protected
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all company members + their tasks |
| GET | `/members` | List company members |
| POST | `/task` | Create collaborative task |

### Users (`/api/users`) — Protected
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get profile + stats |
| PUT | `/profile` | Update profile |
| PUT | `/change-password` | Change password |
| PUT | `/change-email` | Change email |
| GET | `/dashboard` | Dashboard stats + recent tasks |

### Notifications (`/api/notifications`) — Protected
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all notifications |
| PATCH | `/read-all` | Mark all as read |
| PATCH | `/:id/read` | Mark one as read |

---

## Role Permissions

### Regular User
- Create / read / update / delete own tasks
- View collaboration board (if in a company)
- Create collaborative tasks

### Company
- All user permissions
- Assign tasks to employees (`POST /api/tasks/assign`)
- View all employee tasks in collaboration board
- Employees join by entering the company's `userId` as `companyId` during signup

---

## Calendar Rules
- **Today** — Can create, read, update, delete
- **Future dates** — Can create, read, update, delete
- **Past dates** — Can read, update, delete (no create)

---

## Real-time Events (Socket.io)

Connect with `auth.token = accessToken`. The server emits:

| Event | Trigger |
|-------|---------|
| `notification` | Task assigned, collaborator added |

---

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Socket.io, Nodemailer, Helmet, express-rate-limit

**Frontend:** React 18, Vite, Redux Toolkit, React Router v6, Tailwind CSS, Framer Motion, React Icons, React Hot Toast, Socket.io-client, date-fns, Axios
