# Mint Narcissus — Backend 2.0

Consolidated Express + PostgreSQL (Drizzle) API for the career-closet / outfit borrow platform.

## Stack

- **Node.js 20+** / Express (ESM)
- **PostgreSQL** via **Drizzle ORM**
- **JWT** auth cookies + optional LinkedIn OAuth
- **Socket.io** for chat presence / realtime message events
- **Cloudinary** for outfit image uploads
- **Zod** request validation
- **Pino** structured logging

## Project layout

```
src/
  app.js                 # Express app, middleware, routes
  server.js              # Boot: env validate, DB, HTTP + Socket.io
  config/                # env, database, cloudinary
  middleware/            # auth, validate, errorHandler
  modules/
    auth/                # register/login/LinkedIn/profile
    items/               # catalog + wishlist
    rental/              # borrow lifecycle + messages
  shared/
    errors/              # AppError, asyncHandler
    http/                # response helpers
    validation/          # shared Zod schemas
    logger/              # pino + correlation id
  db/migrations/         # SQL migrations
```

Each module follows:

`*.routes.js` → `*.validators.js` → `*.controller.js` → `*.service.js` → `*.schema.js` (Drizzle)

## Quick start (local)

### 1. Prerequisites

- Node 20+
- PostgreSQL 16+ (or use Docker Compose)

### 2. Install

```bash
cd Backend2.0
npm install
cp .env.example .env
# edit .env — set JWT_SECRET, SESSION_SECRET, DATABASE_URL, Cloudinary, LinkedIn
```

Generate secrets:

```bash
openssl rand -base64 48
```

### 3. Database

```bash
# push schema from Drizzle models (dev-friendly)
npm run db:push

# or apply SQL migrations
npm run db:migrate
```

### 4. Run

```bash
npm run dev    # nodemon
# or
npm start
```

API: `http://localhost:8080`  
Health: `GET /health`

## Docker

```bash
# from Backend2.0/
cp .env.example .env   # ensure JWT_SECRET etc. are set
docker compose up --build
```

This starts:

| Service    | Port | Notes                          |
|-----------|------|--------------------------------|
| `postgres` | 5432 | user/pass/db: postgres/postgres/career_closet |
| `api`      | 8080 | Node app                       |

After first boot, apply schema once (from host or a one-off container):

```bash
npm run db:push
# or
docker compose exec api npx drizzle-kit push
```

## Environment variables

See [`.env.example`](./.env.example). Important:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | yes | PostgreSQL URL |
| `JWT_SECRET` | yes | ≥16 chars; signs auth cookie |
| `SESSION_SECRET` | prod | Passport session secret |
| `CLIENT_URL` | yes | Frontend origin (CORS + OAuth) |
| `CLOUDINARY_*` | for uploads | Image hosting |
| `LINKEDIN_*` | for OAuth | LinkedIn OpenID |

Never commit `.env`, JWT dumps, or `cookies.txt`.

## API overview

| Prefix | Module |
|--------|--------|
| `GET /health` | Liveness + DB check |
| `/api/auth` | Register, login, logout, me, LinkedIn |
| `/api/items` | Feed, my items, create, save, status |
| `/api/messages` | Borrow requests, conversations, messages |

Auth cookie: `token` (httpOnly). Bearer JWT also accepted.

### Response shape

Success:

```json
{ "success": true, "data": { }, "user": { } }
```

Error:

```json
{
  "success": false,
  "message": "…",
  "code": "VALIDATION_ERROR",
  "errors": [{ "path": "email", "message": "…" }]
}
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server with nodemon |
| `npm start` | Production server |
| `npm run db:push` | Push schema to DB |
| `npm run db:generate` | Generate migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Drizzle Studio |

## Architecture notes

- **Controllers** are thin: parse request → call service → send response.
- **Services** own business rules and DB access; throw `AppError` for expected failures.
- **Validators** (Zod) run before controllers via `validate()` middleware.
- **errorHandler** maps `AppError` / Zod / Multer to HTTP responses.

## Related

- Legacy multi-service backend: `../Backend/`
- Frontend: `../Frontend/`
