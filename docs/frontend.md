# Frontend app

Vite + React client for the Career Closet platform. Source: `Frontend/`. Path alias `@` maps to `src` (vite.config.js + jsconfig.json). Global tokens in `src/index.css`.

## Stack and scripts

- React 19, React Router 7, Redux Toolkit + react-redux, axios, socket.io-client, react-hook-form + zod, Tailwind 4 (@tailwindcss/vite), radix-ui, lucide-react, sonner, vaul
- `npm run dev` (Vite), `npm run build`, `npm run preview`, `npm run lint` (eslint), `npm run format` (prettier on `src/**/*.{js,ts,json,css}`)

## Env

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_LOG_LEVEL=debug
```

`VITE_API_BASE_URL` must include the `/api` prefix and match the backend origin allowed by `CLIENT_URL`.

## Routing (role-driven, App.jsx)

Unauthenticated: `*` -> Login, `/register` -> Register. Authenticated but incomplete profile: `ProfileSetup`. Complete profile renders by `user.activeRole` (Redux, persisted as `activeRole` in localStorage):

Borrower (`BorrowerLayout`): `/` Browse, `/saved` Saved, `/my-requests` MyRequests, `/messages` Messages, `/settings` Settings, `*` NotFound.

Lender (`LenderLayout`): `/` MyOutfits, `/requests` Requests, `/messages` Messages, `/list` ListOutfit, `/settings` Settings, `*` NotFound.

## API layer (`src/api/`)

- `axios.js`: baseURL from `VITE_API_BASE_URL`, `withCredentials: true` (httpOnly cookie auth — never send Bearer/`x-user-id`), `x-request-id` correlation header, envelope check on `{success}`, 401 dispatches `logout()` except for `/auth/me` session checks
- `endpoints.js`: `AUTH_ENDPOINTS` (register/login/logout/me), `ITEM_ENDPOINTS` (feed/my/create/detail/save/unsave/saved/update-status/delete), `RENTAL_ENDPOINTS` (request/my-requests/incoming/detail/approve/reject/cancel/confirm-lend/agreement/returned/rate/conversations/history/send/read)
- `auth.api.js, items.api.js, rental.api.js`: thin wrappers used by pages/slices

Item create/update sends `multipart/form-data` with field `images` (up to 5 files); `measurements` must be a JSON string inside multipart bodies.

## State (`src/store/`)

`store.js` + `authSlice.js` (user, session, logout), `itemsSlice.js` (feed, detail, saved, my items), `rentalSlice.js` (requests, conversations, messages). Realtime messages merge into rental state; toasts via `sonner` (`Toaster` in App).

## Pages and components

- `pages/auth/`: Login, Register, ProfileSetup (sets `activeRole` + size/bio, gates the app until `isProfileComplete`)
- `pages/borrower/`: Browse (feed + filters), Saved (wishlist), MyRequests (outgoing lifecycle)
- `pages/lender/`: MyOutfits (own listings + status toggle), Requests (incoming approve/reject/confirm/return), ListOutfit (create form + uploads)
- `pages/shared/`: Messages (conversations + socket presence), Settings, NotFound
- `components/`: `borrower/`, `lender/`, `outfits/`, `layout/`, `shared/`, `ui/` (shadcn-style primitives)
- `utils/`: `icons.js` (central icon registry — add then re-export), `mockData.js` (UI mock data)

## Realtime

```js
import { io } from "socket.io-client";
const socket = io("http://localhost:8080", { withCredentials: true });
socket.emit("join_conversation", id);
socket.on("new_message", appendMessage);
```

Join/leave on open/navigate; send via REST (server broadcasts). Show presence with `user_online` / `user_offline`.

## Contributor notes

- Use `@/...` imports; follow existing `src/components` grouping
- Run `npm run lint` and `npm run format` before a PR
- UI PRs should include screenshots/GIFs; link the issue (`Closes #..`)
- Suggested VS Code extensions: Tailwind CSS IntelliSense, ESLint, Prettier, Path Intellisense, npm Intellisense, ES7+ React snippets, Code Spell Checker, Color Highlight
