# FredoCloud Collaborative Team Hub

This repository contains Milestone 1 of the FredoCloud intern assignment. It is organized as a Turborepo monorepo with separate frontend and backend applications, plus shared packages for config, utilities, and type-like constants.

## Tech stack

- Monorepo: Turborepo + pnpm workspaces
- Frontend: Next.js 14 App Router + Tailwind CSS + Zustand
- Backend: Node.js + Express.js + Prisma ORM
- Database: PostgreSQL via Prisma provider
- Tooling: ESLint, Prettier

## Project structure

```text
apps/
  api/        Express API, Prisma schema, health endpoint
  web/        Next.js app with Tailwind and App Router
packages/
  config/     Shared ESLint and Prettier configuration
  types/      Shared constants and placeholder type-like exports
  utils/      Shared utility helpers
```

## Getting started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the environment templates and fill them in:

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   cp apps/api/.env.example apps/api/.env
   ```

3. Generate the Prisma client:

   ```bash
   pnpm --filter api db:generate
   ```

4. Start both applications:

   ```bash
   pnpm dev
   ```

## Default local URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`

## Milestone 1 acceptance checklist

- `pnpm dev` starts both `web` and `api`
- `pnpm build` builds both apps
- `pnpm --filter api db:generate` generates the Prisma client
- `web` serves a landing page on port `3000`
- `api` responds on `GET /api/health`
