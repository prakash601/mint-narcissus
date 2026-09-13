# Mint Narcissus — Project Docs

Interview Outfit Coordinator ("Look good, land the job"): connects people who need interview outfits with donors/lenders who share professional clothing.

Active stack is **Backend2.0 + Frontend**. The legacy `Backend/` microservices (auth/items/messaging/gateway) are superseded and kept for reference only.

## Docs index

- [Getting started](./getting-started.md) — run Backend2.0 + Frontend locally or with Docker
- [Backend2.0](./backend.md) — Express + Postgres API, modules, endpoint reference, auth, realtime, validation
- [Frontend](./frontend.md) — Vite + React app, role routing, state, API layer, pages

## System at a glance

| Part | Tech | Default URL | Source |
|------|------|-------------|--------|
| Backend2.0 API | Node 20+, Express 4 (ESM), Drizzle + Postgres 16, Socket.io, Zod, Pino | `http://localhost:8080` | `Backend2.0/` |
| Frontend | Vite 7, React 19, Redux Toolkit, React Router 7, Tailwind 4, axios, socket.io-client | `http://localhost:5173` | `Frontend/` |
| Database | Postgres 16 (`career_closet`) | `localhost:5432` | `Backend2.0/docker-compose.yml` |

Auth is a JWT in an httpOnly `token` cookie (Bearer also accepted). Frontend sends `withCredentials: true`. CORS/Socket.io/OAuth all use a single `CLIENT_URL` origin.

## Borrow lifecycle (happy path)

1. Lender lists outfit (`POST /api/items`)
2. Borrower browses feed, saves, sends borrow request (`POST /api/messages/request`)
3. Lender approves (`PATCH /api/messages/requests/:id/approve`) then confirms lend (`.../confirm-lend`) — conversation opens
4. Borrower accepts agreement (`POST /api/messages/requests/:id/agreement`) — item flips to `Borrowed`
5. Chat over REST + Socket.io; lender marks returned (`PATCH .../returned`) — item flips back to `Available`
6. Both sides rate (`POST .../rate`)
