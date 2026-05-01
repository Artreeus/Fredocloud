# FredoCloud Collaborative Team Hub

FredoCloud is a collaborative workspace platform built as a Turborepo monorepo with a Next.js frontend and an Express + Prisma backend. It covers authentication, workspaces, goals, announcements, action items, and the advanced features chosen for Milestone 9.

## Tech stack

- Monorepo: Turborepo + pnpm workspaces
- Frontend: Next.js 14 App Router, Tailwind CSS, Zustand
- Backend: Node.js, Express.js, Prisma ORM
- Database: PostgreSQL
- Auth: JWT access/refresh tokens in `httpOnly` cookies
- Realtime-ready tooling: Socket.io-compatible backend structure
- File uploads: Cloudinary-ready upload API

## Chosen advanced features

- `Optimistic UI`
- `Advanced RBAC`

## Advanced feature usage

### Optimistic UI

- Creating a goal updates the goals list immediately with a temporary syncing card before the API confirms.
- Toggling an announcement reaction updates the reaction count instantly and rolls back automatically if the API rejects the action.
- Dragging an action item between Kanban columns updates the status immediately and shows a syncing state while the backend request finishes.
- Rollbacks surface an inline toast so users understand why a visible change was undone.

### Advanced RBAC

- Workspace permissions are stored per role in the database using `WorkspaceRolePermission`.
- Admins or owners with `MANAGE_MEMBERS` can edit the permission matrix from `/settings/workspace`.
- The UI conditionally shows or disables actions based on workspace permissions such as:
  - `CREATE_GOAL`
  - `POST_ANNOUNCEMENT`
  - `PIN_ANNOUNCEMENT`
  - `INVITE_MEMBER`
  - `MANAGE_MEMBERS`
  - `CREATE_ACTION_ITEM`
  - `UPDATE_ACTION_ITEM`
  - `DELETE_CONTENT`
  - `MANAGE_WORKSPACE`
- Backend endpoints enforce the same permissions, so hidden buttons are backed by real authorization checks.

## Project structure

```text
apps/
  api/        Express API, Prisma schema, migrations, auth, workspace, goals, announcements, action items
  web/        Next.js App Router app with Tailwind, Zustand stores, protected pages, optimistic UI
packages/
  config/     Shared ESLint and Prettier configuration
  types/      Shared constants and type-like exports
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

3. Generate Prisma client and apply migrations:

   ```bash
   pnpm --filter api db:generate
   pnpm --filter api db:migrate
   ```

4. Seed the local demo data:

   ```bash
   pnpm --filter api db:seed
   ```

5. Start both applications:

   ```bash
   pnpm dev
   ```

## Default local URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`

## Demo credentials

- Email: `demo@fredocloud.com`
- Password: `Demo@12345`

## Useful commands

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm --filter api db:generate`
- `pnpm --filter api db:migrate`
- `pnpm --filter api db:seed`
