# My contributions — Team Mint Narcissus

**Career Closet** (interview-outfit rental platform) was built by an **8-person team**
in the freeCodeCamp Spring 2026 cohort.

- **Upstream (team repo):** https://github.com/nhcarrigan-spring-2026-cohort/mint-narcissus
- **This repo:** my personal fork — https://github.com/prakash601/mint-narcissus

I was the **top contributor**. Everything below is verifiable from git history in
this repository — nothing here is claimed from memory.

## My role: top contributor (100 of 154 commits, 65%)

| Contributor | Commits | Share |
|---|---:|---:|
| **Prakash Sankhla (me)** | 65 | 42.2% |
| Prakash Sankhla | 35 | 22.7% |
| Prince Ubakaeze | 11 | 7.1% |
| Syed-Zahaab-Hussain | 10 | 6.5% |
| Krutika Waghmare | 10 | 6.5% |
| Kapil Singh Negi | 9 | 5.8% |
| Jaco Botha | 9 | 5.8% |
| Pawan Singh | 4 | 2.6% |
| Naomi Carrigan | 1 | 0.6% |

Active period: **2026-02-07 → 2026-09-14**.

## What I owned

Authorship below is computed across all branches (`git log --all`). **90 files are
authored by me alone; 88 more by me and a teammate.**

### Backend 2.0 — my module (~57 files, sole author)

| Area | Path | Files |
|---|---|---:|
| Auth domain | `Backend2.0/src/modules/auth/` | 18 |
| Shared layer | `Backend2.0/src/shared/` | 13 |
| Database | `Backend2.0/src/db/` | 10 |
| Unit tests | `Backend2.0/tests/unit/` | 9 |
| Middleware | `Backend2.0/src/middleware/` | 4 |
| Config | `Backend2.0/src/config/` | 3 |

### Concurrency & data integrity

The rental lifecycle is the part of the product with real correctness risk — two
borrowers requesting the same item at the same moment. I hardened it:

- `9927599` — parameterised the interviewTypes SQL (removing an injection path)
  **and** added `SELECT … FOR UPDATE` row locks plus a lazy-init pool, so the
  read-check-write sequence became atomic. That is the double-booking fix.
- `Backend2.0/src/modules/rental/` — rental controllers/routes/schema/service/validators.

### Authentication & abuse prevention

- `e7bc7aa` — httpOnly-cookie-only tokens, per-request cookie options, and
  stripping client-supplied `x-user-id` so it can't spoof identity past the limiter.
- `723bf5c` — stopped leaking 5xx internals, fixed a 401 → logout redirect loop,
  added a rate-limit `keyGenerator`.
- JWT (httpOnly cookie), Passport.js LinkedIn OAuth, RBAC, `express-rate-limit`,
  `helmet`, `zod` validation.

### Realtime messaging

- `bfad015` + `73396cc` — the messages page, the Socket.io client service, and
  authenticated connections with presence.
- `socketHandler.js` on the backend (co-authored with Syed-Zahaab-Hussain).

### Data & developer experience

- `2e07330` — seed script: 50 users, plus items, requests, chats and ratings, so the
  app is runnable locally in one command.
- `08e1981` — wired the settings screens to real API data instead of mocks.
- `82491e9` — Backend2.0 and Frontend onboarding guides; plus `docs/README.md`,
  `docs/backend.md`, `docs/frontend.md`, `docs/getting-started.md`.

## What is **not** my work

Stated plainly so this document is trustworthy:

- **Most of the frontend UI kit** — `Frontend/src/components/` (50 files) and
  `Frontend/src/pages/` (18 files) are largely teammates' work.
- `Backend/services/auth-service/src/utils/jwt.js` (Syed-Zahaab-Hussain) and much of
  the original microservices skeleton in `Backend/services/` (auth, items,
  messaging, requests services were shared across the team).
- Docker/compose scaffolding and the initial project structure came from the team
  and the cohort template.

## How to verify

```sh
git shortlog -sne --all                        # commit counts per person
git log --author='Prakash' --oneline | wc -l   # my commit count
git log --format='%an' -- Backend2.0/src/modules/auth/   # who wrote the auth module
```

Team credits are also listed in the [README](README.md#team).
