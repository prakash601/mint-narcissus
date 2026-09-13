# Backend2.0 API

Consolidated Express + PostgreSQL backend. Source: `Backend2.0/`. Entry: `src/server.js` (env validate, DB connect, HTTP + Socket.io) over `src/app.js` (middleware, routes, error handlers).

## Stack and layout

- Node 20+ / Express 4 (ESM), Drizzle ORM + `pg`, JWT cookie auth + LinkedIn OAuth (passport-oauth2), Socket.io, Cloudinary + multer, Zod validation, Pino logging, helmet + express-rate-limit
- Pattern per module: `*.routes.js` -> `*.validators.js` -> `*.controller.js` -> `*.service.js` -> `*.schema.js`

```
src/
  app.js server.js
  config/ env.js database.js cloudinary.js
  middleware/ auth.js validate.js errorHandler.js security.js
  modules/auth/ auth.routes.js auth.validators.js auth.controller.js auth.service.js auth.schema.js passport.js
  modules/items/ item.routes.js item.validators.js item.controller.js item.service.js item.schema.js upload.utils.js
  modules/rental/ rental.routes.js rental.validators.js rental.controller.js rental.service.js rental.schema.js socket.handler.js
  shared/errors/ AppError.js asyncHandler.js
  shared/http/ response.js
  shared/constants/ status.js
  shared/logger/ (+ correlationId, requestContext, httpLogger)
  db/migrations/ db/seed.js
```

## Middleware order (app.js)

helmet -> CORS (`CLIENT_URL`, credentials) -> json/urlencoded -> cookieParser -> strip spoofable `x-user-id` -> correlationId -> requestContext -> httpLogger -> `POST /api` rate limit -> passport -> routes -> 404 -> errorHandler.

Security extras: `trust proxy = 1`, auth endpoints have a stricter rate limit (`authRateLimiter`, default 30/15min vs 300/15min general).

## Auth (`/api/auth`)

| Method | Path | Auth | Body / notes |
|--------|------|------|--------------|
| POST | `/api/auth/register` | no | `{name, email, password 8-128 chars}` |
| POST | `/api/auth/login` | no | `{email, password}` |
| POST | `/api/auth/logout` | no | clears `token` cookie |
| GET | `/api/auth/me` | yes | current user |
| PATCH | `/api/auth/me` | yes | `{activeRole borrower/lender, bio, profilePhoto, size{height,fitType,topSize,bottomSize}}`, at least one field |
| GET | `/api/auth/linkedin?mode=login\|signup` | no | sets `linkedin_auth_mode` cookie, starts OAuth |
| GET | `/api/auth/linkedin/callback` | no | redirects to `CLIENT_URL/login?error=...` or `/register?error=...` on failure |

Guards (`middleware/auth.js`): `auth` (JWT cookie -> `req.user`), `requireProfileComplete` (`isProfileComplete`), `requireRole("borrower"\|"lender")` (`activeRole`).

## Items (`/api/items`)

Item statuses: `Available` (default, in feed), `Borrowed` (system only, hidden, locked), `Unavailable` (lender toggle). Lender manual toggle only allows `Available <-> Unavailable`.

| Method | Path | Role | Notes |
|--------|------|------|-------|
| GET | `/api/items` | borrower | feed, query: `size, category, interviewType, page, limit (1-50, default 10)` |
| GET | `/api/items/saved` | borrower | wishlist (registered before `/:id` to avoid shadowing) |
| GET | `/api/items/my` | lender | own listings, newest first |
| POST | `/api/items` | lender | `multipart/form-data`, `images[5]` max; fields: `title, description, lenderDetails, category, size, interviewTypes` required; `outfitImageUrl?, fabricType?, confidenceNote?, measurements?` (measurements may be JSON string) |
| GET | `/api/items/:id` | any auth | item detail |
| POST | `/api/items/:id/save` | borrower | save; 400 if already saved |
| DELETE | `/api/items/:id/save` | borrower | unsave; 404 if missing |
| PATCH | `/api/items/:id/status` | lender | `{status: Available\|Unavailable}`; blocked while `Borrowed` |
| DELETE | `/api/items/:id` | lender | owner only; blocked while `Borrowed` |

Images go to Cloudinary (`mint-narcissus/items`) via `upload.utils.js`; update replaces the image set.

## Rental / messages (`/api/messages`)

Borrow statuses: `pending -> approved -> agreement_pending -> borrowed -> returned -> rated`, plus `rejected / cancelled`. Transitions are enforced by `canTransitionBorrow(current, next, actor)`; competing `pending/approved` requests auto-reject when one loan starts.

| Method | Path | Who | Notes |
|--------|------|-----|-------|
| POST | `/api/messages/request` | borrower | `{outfitId: positive int}` |
| GET | `/api/messages/requests/incoming` | lender | query `status?, page?, limit? (1-50, default 20)` |
| GET | `/api/messages/requests/my-requests` | borrower | same query |
| GET | `/api/messages/requests/:id` | participant | single request |
| PATCH | `/api/messages/requests/:id/approve` | lender | pending -> approved, opens conversation |
| PATCH | `/api/messages/requests/:id/reject` | lender | pending -> rejected |
| PATCH | `/api/messages/requests/:id/cancel` | borrower | pending -> cancelled |
| PATCH | `/api/messages/requests/:id/confirm-lend` | lender | approved -> agreement_pending |
| POST | `/api/messages/requests/:id/agreement` | borrower | agreement_pending -> borrowed, item -> `Borrowed` |
| PATCH | `/api/messages/requests/:id/returned` | lender | borrowed -> returned, item -> `Available` |
| POST | `/api/messages/requests/:id/rate` | participant | `{rating 1-5}`; both sides rate -> `rated` |
| GET | `/api/messages/conversations` | participant | list, latest first |
| GET | `/api/messages/conversations/:conversationId` | participant | history, `?page&limit (1-100, default 30)` |
| POST | `/api/messages/conversations/:conversationId` | participant | `{text 1-5000 chars}`, emits `new_message` |
| PATCH | `/api/messages/conversations/:conversationId/read` | participant | reset unread count |

## Realtime (Socket.io, same port)

Auth via `token` cookie (JWT verify). Client:

```js
import { io } from "socket.io-client";
const socket = io("http://localhost:8080", { withCredentials: true });
socket.emit("join_conversation", conversationId, (ack) => {});
socket.on("new_message", (msg) => {});
socket.on("user_online", ({ userId }) => {});
socket.on("user_offline", ({ userId }) => {});
```

Server checks `userCanAccessConversation(userId, id)` on join; emits presence per room. Sending via REST auto-broadcasts, so clients only listen.

## Responses and errors

Success: `{ success: true, data, user? }`. Error: `{ success: false, message, code, errors? }` with codes like `VALIDATION_ERROR`. Services throw `AppError`; `errorHandler` maps AppError/Zod/Multer to HTTP. Logging is Pino with correlation id (`x-request-id` echoed) and redaction in `shared/logger`.

## Scripts and tests

| Script | Purpose |
|--------|---------|
| `npm run dev / start` | nodemon / node `src/server.js` |
| `npm run db:push / generate / migrate / studio / seed` | Drizzle schema push, gen, migrate, UI, seed |
| `npm test / test:watch / test:coverage` | vitest run / watch / coverage |

Tests in `tests/unit` (AppError, middleware, status transitions, validators, auth/rental services) and `tests/integration/app.test.js`.
