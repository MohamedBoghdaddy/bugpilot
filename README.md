# BugPilot

A production-ready SaaS bug tracking and project management system.

**Stack**: Node.js + Express + MongoDB (Mongoose) + Socket.IO — React 19 + Tailwind CSS

---

## Project Structure

```
bugpilot/
├── server/                   # Node.js / Express backend
│   └── src/
│       ├── app.js            # Express configuration, middleware, routes
│       ├── server.js         # HTTP server startup + Socket.IO + DB connection
│       ├── config/db.js      # MongoDB connection
│       ├── modules/          # Feature modules (auth, bugs, users, …)
│       │   ├── auth/         # auth.model · auth.controller · auth.routes · auth.service
│       │   ├── bugs/         # bug.model · bug.controller · bug.routes
│       │   ├── users/        # user.controller · user.routes
│       │   ├── comments/     # comment.model · comment.controller · comment.routes
│       │   ├── stories/      # story.model · story.controller · story.routes
│       │   ├── tasks/        # task.model · task.controller · task.routes
│       │   ├── admin/        # activity.model · admin.controller · admin.routes
│       │   ├── reports/      # report.controller · report.routes
│       │   ├── ai/           # ai.service · ai.controller · ai.routes
│       │   ├── attachments/  # attachment.model · attachment.controller · attachment.routes
│       │   └── permissions/  # permission.controller · permission.routes
│       ├── middlewares/      # authMiddleware · rbac · sanitize · validate · requestLogger
│       ├── services/         # socketService.js
│       └── utils/            # AppError · logger · response
├── client/                   # React 19 frontend (Create React App + Tailwind)
│   └── src/
│       ├── api/              # axios.js (base client) · endpoints.js
│       ├── components/       # layout components
│       ├── context/          # AuthContext
│       └── pages/            # auth · bugs · dashboard · kanban · reports · stories · tasks · users
├── python-service/           # Flask / SQLite reference implementation (not deployed)
│   ├── app.py
│   └── requirements.txt
└── render.yaml               # Render deployment configuration
```

---

## Local Development

### Backend

```bash
cd server

# Install dependencies
npm install

# Create env file from example
cp .env.example .env
# Edit .env — set DATABASE_URL to your MongoDB Atlas URI and JWT_SECRET

# Start dev server (hot-reload)
npm run dev

# Server runs at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### Frontend

```bash
cd client

# Install dependencies
npm install

# Create env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
echo "REACT_APP_SOCKET_URL=http://localhost:5000" >> .env

# Start dev server
npm start

# Frontend runs at http://localhost:3000
```

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | MongoDB Atlas URI — `mongodb+srv://…` |
| `JWT_SECRET` | ✅ | Access token signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Recommended | Refresh token secret (defaults to JWT_SECRET) |
| `PORT` | Auto | HTTP port — Render sets this automatically |
| `NODE_ENV` | Recommended | `development` or `production` |
| `FRONTEND_URL` | Recommended | Deployed frontend URL for CORS |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for AI features |
| `GEMINI_MODEL` | Optional | Defaults to `gemini-1.5-flash` |
| `LOG_LEVEL` | Optional | Winston log level, defaults to `info` |

### Frontend (`client/.env`)

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API URL — e.g. `https://bugpilot-server.onrender.com/api` |
| `REACT_APP_SOCKET_URL` | Backend socket URL — e.g. `https://bugpilot-server.onrender.com` |

---

## Render Deployment

The repo includes `render.yaml` for one-click Render deployments.

### Backend service settings

| Setting | Value |
|---|---|
| Root directory | `server` |
| Build command | `npm install` |
| Start command | `npm start` |
| Health check path | `/api/health` |

### Frontend service settings

| Setting | Value |
|---|---|
| Root directory | `client` |
| Build command | `npm install && npm run build` |
| Publish directory | `build` |

### Required Render environment variables

Set these in the Render dashboard under **Environment**:

- `DATABASE_URL` — your MongoDB Atlas URI
- `JWT_SECRET` — strong random string
- `JWT_REFRESH_SECRET` — different strong random string
- `FRONTEND_URL` — deployed frontend URL (for CORS)
- `REACT_APP_API_URL` — deployed backend URL + `/api`
- `REACT_APP_SOCKET_URL` — deployed backend URL

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — returns `{ success: true, message: "…" }` |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/auth/me` | Current user profile |
| `GET` | `/api/bugs` | List bugs (filtered, paginated) |
| `POST` | `/api/bugs` | Create bug |
| `GET` | `/api/users` | List users |
| `GET` | `/api/admin/stats` | Admin dashboard stats |
| `GET` | `/api/reports/velocity` | Bug resolution velocity |

---

## Roles

| Role | Description |
|---|---|
| `CUSTOMER` | Reports bugs, views own submissions |
| `TESTER` | Creates and updates bug status |
| `DEVELOPER` | Assigns, updates, and resolves bugs |
| `ADMIN` | Full access including user management |

---

## Python Service (Reference Only)

`python-service/app.py` is a lightweight Flask / SQLite implementation kept for reference.
It is **not deployed** — the MERN backend is the production backend.

To run locally if needed:

```bash
cd python-service
pip install -r requirements.txt
python app.py
```
