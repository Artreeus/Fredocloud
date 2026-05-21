# FredoCloud

FredoCloud is a collaborative team workspace application built in a Turborepo monorepo. It combines workspace management, goal tracking, announcements, action-item planning, realtime collaboration, analytics, and role-based permissions in a single product.

## Live URLs

- Web: `https://web-pi-umber-98.vercel.app`
- API: `https://api-xi-three-98.vercel.app`
- API health: `https://api-xi-three-98.vercel.app/api/health`
- Swagger UI: `https://api-xi-three-98.vercel.app/api/docs`
- OpenAPI JSON: `https://api-xi-three-98.vercel.app/api/openapi.json`

## Demo Account

- Email: `demo@fredocloud.com`
- Password: `Demo@12345`

Use the demo account for reviewer walkthroughs and quick smoke tests.

## Highlights

- JWT authentication with access and refresh tokens in `httpOnly` cookies
- Multi-workspace support with switching, invitations, and member management
- Goals with milestones, progress tracking, and activity updates
- Announcements with rich-text content, reactions, threaded comments, and mentions
- Action items with Kanban and list views, filters, and bulk status updates
- Realtime updates with Pusher Channels for presence, comments, reactions, announcements, notifications, and action items
- Analytics dashboard with charts and CSV export
- Database-backed RBAC with editable workspace permission matrices
- Optimistic UI flows for key interactions
- Email notifications for invitations and mentions
- Swagger/OpenAPI API documentation

## Advanced Features Implemented

- `Optimistic UI`
- `Advanced RBAC`

## Tech Stack

- Monorepo: Turborepo + pnpm workspaces
- Frontend: Next.js 14, App Router, Tailwind CSS, Zustand
- Backend: Node.js, Express.js
- Database: PostgreSQL + Prisma ORM
- Authentication: JWT + `httpOnly` cookies
- Realtime: Pusher Channels
- File uploads: Cloudinary
- Email: EmailJS
- Charts: Recharts
- Deployment: Vercel (frontend + backend)

## Project Structure

```text
apps/
  api/        Express API, Prisma schema, auth, workspaces, goals, announcements, action items, analytics, docs
  web/        Next.js application, protected UI, Zustand stores, realtime bridge, charts, and public landing page
packages/
  config/     Shared lint/format configuration
  types/      Shared constants and enum-like exports
  utils/      Shared helpers
```

## Core Modules

### Authentication

- Registration, login, token refresh, logout, and current-user profile endpoints
- Cookie-based session flow with protected frontend routes

### Workspaces

- Create, update, switch, and delete workspaces
- Invite members and manage roles
- Permission matrix editing for workspace roles

### Goals

- Goal CRUD with assignees, due dates, statuses, and progress
- Nested milestones and progress rollups
- Goal update feed

### Announcements

- Rich-text announcement publishing
- Pinning, reactions, threaded comments, mentions, and comment moderation

### Action Items

- Kanban board
- Filterable list view
- Quick status changes and bulk updates

### Realtime + Notifications

- Workspace presence via Pusher presence channels
- Live announcement/comment/reaction updates
- Live action-item updates
- In-app notification feed with unread count

### Analytics

- Workspace summary metrics
- Goal and action-item visualizations
- CSV export endpoint

## API Documentation

Swagger UI is available at `/api/docs`, and the raw OpenAPI document is available at `/api/openapi.json`.

Documented API areas include:

- Auth
- Workspaces
- Goals
- Announcements
- Action items
- Notifications
- Analytics
- Uploads
- Health

## Local Development

The setup below assumes `pnpm` is installed and PostgreSQL is reachable from the API environment.

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the templates:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Update the copied files with database, auth, Pusher, Cloudinary, and EmailJS values before starting the apps.

### 3. Generate Prisma client and run migrations

```bash
pnpm --filter api db:generate
pnpm --filter api db:migrate
```

### 4. Seed demo data

```bash
pnpm --filter api db:seed
```

### 5. Start the monorepo

```bash
pnpm dev
```

## Environment Variables

### Backend

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=replace-with-access-secret
JWT_REFRESH_SECRET=replace-with-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
ACCESS_TOKEN_COOKIE_NAME=fredocloud_access_token
REFRESH_TOKEN_COOKIE_NAME=fredocloud_refresh_token
CLIENT_URL=https://your-web-app.vercel.app
COOKIE_DOMAIN=
COOKIE_SAME_SITE=none
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAILJS_SERVICE_ID=
EMAILJS_PUBLIC_KEY=
EMAILJS_PRIVATE_KEY=
EMAILJS_INVITE_TEMPLATE_ID=
EMAILJS_MENTION_TEMPLATE_ID=
APP_NAME=FredoCloud
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=mt1
```

### Frontend

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
ACCESS_TOKEN_COOKIE_NAME=fredocloud_access_token
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_CLUSTER=mt1
```

## Useful Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm --filter api db:generate
pnpm --filter api db:migrate
pnpm --filter api db:seed
```

## Realtime Events (via Pusher Channels)

Workspace events are broadcast on `private-workspace-{workspaceId}`:

- `announcement:new`
- `reaction:update`
- `comment:new`
- `comment:update`
- `comment:delete`
- `action-item:update`
- `notification:new`

Presence events are handled natively on `presence-workspace-{workspaceId}`:

- `pusher:subscription_succeeded` — initial online member list
- `pusher:member_added` — user came online
- `pusher:member_removed` — user went offline

## Vercel Deployment

Both apps are deployed as separate Vercel projects from the same repository.

| Project | Root Directory | URL |
|---------|---------------|-----|
| web | `apps/web` | `https://web-pi-umber-98.vercel.app` |
| api | `apps/api` | `https://api-xi-three-98.vercel.app` |

The API runs as a single `@vercel/node` serverless function. Pusher Channels replaces Socket.io for realtime functionality since Vercel does not support persistent WebSocket connections.

## Notes

- Production is deployed on Vercel for both frontend and backend.
- Production database uses Neon PostgreSQL.
- Cloudinary credentials are required for avatar and file upload flows.
- EmailJS credentials and template IDs are required for invite and mention emails.
- Pusher Channels credentials are required for realtime functionality.
