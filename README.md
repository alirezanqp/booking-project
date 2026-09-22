# Salon booking

## Stack

- `apps/api` — NestJS + Prisma + PostgreSQL + Redis
- `apps/web` — Next.js (RTL / Persian)
- `packages/shared` — shared enums/helpers

## Local run

```bash
docker compose up -d
pnpm install
cd apps/api && pnpm exec prisma db push && pnpm exec tsx prisma/seed.ts
pnpm dev:api   # :3001
pnpm dev:web   # :3000
```

OTP codes print in the API console (`[DevSms]`).

Seed phones: `09120000000` (customer), `09121111111` / `09122222222` (professionals).
