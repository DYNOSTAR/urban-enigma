# Sure Odds MVP

A production-ready monorepo MVP for real-time football correct-score predictions using a transparent Poisson model.

## Monorepo structure

```text
.
├── apps
│   ├── api                 # Express + Socket.IO + Prisma backend
│   └── web                 # Next.js frontend
├── packages
│   └── shared              # Shared types and Zod schemas
├── docker-compose.yml      # Local PostgreSQL only
├── package.json
└── pnpm-workspace.yaml
```

## Tech stack
- Frontend: Next.js + TypeScript + Tailwind + TanStack Query
- Backend: Node.js + Express + Socket.IO + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Auth: Email/password + bcrypt + JWT access + refresh token rotation (hashed refresh tokens)
- Validation: Zod
- Security: Helmet, CORS allowlist, auth rate limiting, secure cookie option

## Local development

### 1) Install and start local Postgres
```bash
docker compose up -d
```

### 2) Configure env vars
- Copy `apps/api/.env.example` to `apps/api/.env`
- Copy `apps/web/.env.example` to `apps/web/.env.local`

### 3) Install and setup DB
```bash
pnpm install
pnpm db:migrate
pnpm db:seed
```

### 4) Run web + api
```bash
pnpm dev
```
- Web: `http://localhost:3000`
- API: `http://localhost:4000`

## Required scripts
```bash
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## API endpoints
### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

### User
- `GET /me`

### Matches
- `GET /matches?date=today|tomorrow&leagueId=&minConfidence=`
- `GET /matches/:id`

### Favorites
- `POST /favorites/:matchId`
- `DELETE /favorites/:matchId`
- `GET /favorites`

### Admin
- `POST /admin/leagues`
- `POST /admin/teams`
- `POST /admin/matches`
- `POST /admin/refresh-predictions`

## Prediction engine
- Poisson-based scoreline probabilities from 0-0 to 4-4
- Uses team strength ratings + home advantage
- Outputs best scoreline, top 3 scorelines, confidence (capped at 85), markets, explanation
- Background refresh every 2 minutes for next 48-hour matches
- Socket.IO emits `prediction:update` payload `{ matchId, prediction }`

## Deployment guides

### 1) Render backend (apps/api)
Create Render **Web Service** from `/apps/api`.

- Build command:
```bash
pnpm install --frozen-lockfile && pnpm -C apps/api build
```
- Start command:
```bash
pnpm -C apps/api start
```

Set environment variables:
- `DATABASE_URL` (Render Postgres URL)
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN` (your Vercel URL, e.g. `https://your-app.vercel.app`)
- `NODE_ENV=production`
- `ADMIN_EMAIL` (optional)
- `ADMIN_PASSWORD` (optional)
- `COOKIE_SECURE=true`

Run migrations on deploy (recommended):
- Add post-deploy command:
```bash
pnpm -C apps/api prisma:migrate && pnpm -C apps/api prisma:seed
```
(Seeding is optional in production.)

### 2) Render PostgreSQL
- Create a Render PostgreSQL instance.
- Copy internal connection string to `DATABASE_URL`.
- Ensure SSL-compatible connection string for Prisma in production.

### 3) Vercel frontend (apps/web)
Import `/apps/web` into Vercel.

Set env vars:
- `NEXT_PUBLIC_API_URL` (e.g. `https://your-api.onrender.com`)
- `NEXT_PUBLIC_SOCKET_URL` (same value as API URL)

The web app uses these env vars for REST and Socket.IO.

## CORS + Socket notes
- Backend REST and Socket.IO both use the same allowlist from `CORS_ORIGIN`.
- Provide comma-separated origins for local + prod, for example:
  `http://localhost:3000,https://your-app.vercel.app`

## Seed data
`pnpm db:seed` creates:
- 2 leagues
- 8 teams
- 10 upcoming matches (today/tomorrow)
- initial predictions
- admin user from `ADMIN_EMAIL` + `ADMIN_PASSWORD`

## Disclaimer
Predictions are probabilistic and informational only.
