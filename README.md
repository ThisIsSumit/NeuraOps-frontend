# NeuraOps Frontend

NeuraOps Frontend is a React 19 + TypeScript application for infrastructure operations workflows. It provides a polished UI for dashboards, service management, DNS management, notifications, and an AI assistant experience.

## Overview

This repository currently represents the frontend layer and is best suited for:
- Product demos and UI prototyping
- Frontend development and component iteration
- Gradual API integration work

Current implementation note:
- A large part of the app uses mocked/simulated state data through the local store.
- AI functionality includes optional Gemini integration in [src/services/gemini.ts](src/services/gemini.ts).

## Tech Stack

- React 19
- TypeScript
- Vite 6
- React Router 7
- Zustand
- TanStack Query
- Tailwind CSS v4
- Recharts
- Motion
- Lucide React
- React Hook Form + Zod
- Google GenAI SDK

## Key Routes

Routes are defined in [src/App.tsx](src/App.tsx).

- `/login`
- `/dashboard`
- `/services`
- `/services/new`
- `/services/:id`
- `/dns`
- `/ai-agent`
- `/settings`
- `/notifications`

## Project Structure

```text
src/
  App.tsx
  main.tsx
  index.css
  components/
    layout/
      AppShell.tsx
      Navbar.tsx
      Sidebar.tsx
    ui/
      Badge.tsx
      Button.tsx
      Card.tsx
      CodeBlock.tsx
      CommandPalette.tsx
      Input.tsx
      MetricCard.tsx
      Toggle.tsx
  lib/
    utils.ts
  pages/
    AIAgent.tsx
    Dashboard.tsx
    DNSManager.tsx
    Login.tsx
    NewService.tsx
    Notifications.tsx
    ServiceDetail.tsx
    Services.tsx
    Settings.tsx
    index.tsx
  services/
    gemini.ts
  store/
    index.ts
  types/
    index.ts
```

## Getting Started

### Prerequisites

- Node.js 18 or later (Node.js 20+ recommended)
- npm

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app runs on port `3000` based on the current Vite script.

## Available Scripts

Scripts are defined in [package.json](package.json).

- `npm run dev` : Start Vite dev server on `0.0.0.0:3000`
- `npm run build` : Build production bundle
- `npm run preview` : Preview the production build
- `npm run clean` : Remove `dist` directory (uses `rm -rf`, Unix-style)
- `npm run lint` : Run TypeScript type-check (`tsc --noEmit`)

## Environment Variables

Set variables in a local `.env` file at project root.

```env
GEMINI_API_KEY=your_api_key_here
```

Usage details:
- [vite.config.ts](vite.config.ts) injects `GEMINI_API_KEY` into `process.env.GEMINI_API_KEY`.
- [src/services/gemini.ts](src/services/gemini.ts) reads this key and falls back gracefully when missing.

## Build and Deployment

### Production Build

```bash
npm run build
```

Build output is generated in the `dist` directory.

### Preview Build Locally

```bash
npm run preview
```

### Backend 

This frontend connects to the **NeuraOps Backend** — a Node.js + TypeScript monorepo with 5 microservices.

 

| Service | Port | Responsibility |
|---|---|---|
| API Gateway | 3000 | Single entry point, JWT auth, WebSocket server |
| Auth Service | 3001 | JWT, bcrypt, API keys, RBAC |
| Deploy Service | 3002 | Dockerode, BullMQ job queue, metrics polling |
| DNS Service | 3003 | Cloudflare API v4 integration |
| AI Service | 3004 | Claude tool use, SSE streaming, conversation history |

 

See the [backend repository](https://github.com/ThisIsSumit/neuraops-backend) for setup instructions. The fastest way to get the backend running locally is:

 

```bash

git clone https://github.com/ThisIsSumit/neuraops-backend
cd neuraops-backend
start.bat        # Windows one-click setup

```
 
The frontend expects the API Gateway at `http://localhost:3000` by default. Change `VITE_API_URL` in `.env` if your backend runs elsewhere.

 
---

## Notes for Contributors

- Keep UI and state updates consistent with the existing patterns in [src/store/index.ts](src/store/index.ts).
- Reuse primitives from [src/components/ui](src/components/ui) for design consistency.
- Keep route additions centralized in [src/App.tsx](src/App.tsx) and [src/pages/index.tsx](src/pages/index.tsx).

