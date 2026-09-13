# Getting started (Backend2.0 + Frontend)

## Prerequisites

- Node.js 20+, npm 10+
- PostgreSQL 16+ locally, or Docker for the compose stack
- Cloudinary account (only for item image uploads)
- LinkedIn Developer app (only for LinkedIn OAuth)

## 1. Backend2.0 setup

```bash
cd Backend2.0
npm install
cp .env.example .env
# edit .env — at minimum JWT_SECRET, DATABASE_URL, CLIENT_URL
openssl rand -base64 48   # use output as JWT_SECRET
```

Required env (see `Backend2.0/.env.example` and `src/config/env.js`):

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | yes | e.g. `postgresql://postgres:postgres@localhost:5432/career_closet?sslmode=disable` |
| `JWT_SECRET` | yes | 16+ chars, strong random value |
| `CLIENT_URL` | yes in prod | single frontend origin, default `http://localhost:5173` |
| `JWT_EXPIRE` / `COOKIE_MAX_AGE_MS` | no | defaults `1d` / 86400000 |
| `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` | for uploads | item images |
| `LINKEDIN_CLIENT_ID/SECRET/CALLBACK_URL` | for OAuth | callback default `http://localhost:8080/api/auth/linkedin/callback` |
| `PORT` / `NODE_ENV` / `LOG_LEVEL` | no | defaults `8080` / `development` / `debug` |

Boot validation (`validateEnv()`) fails fast if `JWT_SECRET` is short or `DATABASE_URL` is missing.

## 2. Database

```bash
# dev-friendly push from Drizzle schemas
npm run db:push

# or migration workflow
npm run db:generate
npm run db:migrate

# optional seed
npm run db:seed

# inspect
npm run db:studio
```

Drizzle config: `drizzle.config.js` — schemas at `src/modules/**/*.schema.js`, output `src/db/migrations`, dialect `postgresql`.

## 3. Run backend

```bash
npm run dev    # nodemon src/server.js
npm start      # production
npm test       # vitest (unit + integration)
```

- API: `http://localhost:8080`
- Health: `GET /health` (checks Postgres with `SELECT 1`, returns `ok`/`degraded`)

## 4. Frontend setup

```bash
cd Frontend
npm install
cp .env.example .env
npm run dev
```

`Frontend/.env.example`:

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_LOG_LEVEL=debug
```

- Dev server prints its URL (typically `http://localhost:5173`)
- `VITE_API_BASE_URL` must point at Backend2.0 (`/api` prefix included)
- `CLIENT_URL` in backend `.env` must match the frontend origin or cookies/CORS/Socket.io break

Other scripts: `npm run build`, `npm run preview`, `npm run lint`, `npm run format`.

## 5. Docker (backend + db)

```bash
cd Backend2.0
cp .env.example .env
docker compose up --build
```

Starts `postgres:5432` (`postgres/postgres/career_closet`) and `api:8080`. Compose overrides `DATABASE_URL` to the internal host. After first boot apply schema once:

```bash
npm run db:push
# or
docker compose exec api npx drizzle-kit push
```

## 6. Smoke test

1. `GET http://localhost:8080/health` -> `{"status":"ok",...}`
2. `POST http://localhost:8080/api/auth/register` with `{"name","email","password (8+ chars)"}`
3. Open `http://localhost:5173`, register, complete ProfileSetup (role + size), browse as borrower / list as lender
4. Never commit `.env`, JWT dumps, or `cookies.txt`
