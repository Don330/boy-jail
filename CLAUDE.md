# Boy Jail

A real-time multiplayer web game where friends collaboratively manage a jail simulation. Users share a live canvas map of the jail, place characters ("Boys") into rooms, and move them around — all updates broadcast instantly to every connected user.

## Project Goal

Build a fun, shareable multiplayer game that demonstrates real-time collaborative state with AWS infrastructure. End state: a deployed web app friends can open in their browser, create an account, and immediately see each other's actions on a shared jail map.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), TypeScript |
| Styling | Tailwind CSS |
| Canvas | React Konva (interactive jail map) |
| Auth | AWS Cognito (via Amplify Gen 2) |
| API | AWS AppSync (GraphQL + real-time subscriptions) |
| Database | Amazon DynamoDB |
| Hosting | AWS Amplify Hosting |

## Core Features

1. **Shared jail map canvas** — visual grid of rooms (cells, cafeteria, yard, etc.)
2. **Boys** — characters with a name, avatar/emoji, and current room
3. **Real-time updates** — moving a Boy updates all connected users instantly via AppSync subscriptions
4. **Multi-user auth** — friends create accounts and see who else is online
5. **Add/remove Boys** — any user can add a new Boy or release one from jail

## Architecture

```
Browser (Next.js + React Konva)
  │
  ├── Amplify Auth (Cognito) — login/signup
  │
  └── AppSync GraphQL endpoint
        ├── Query: listBoys, listRooms
        ├── Mutation: createBoy, moveBoy, deleteBoy
        └── Subscription: onBoyMoved, onBoyCreated — pushes to all clients
              │
              └── DynamoDB tables: Boys, Rooms
```

## Project Structure

```
/
├── amplify/            # Amplify Gen 2 backend config (auth, data schema)
├── src/
│   ├── app/            # Next.js App Router pages
│   ├── components/
│   │   ├── canvas/     # Konva jail map and room components
│   │   ├── boys/       # Boy card, add-boy form
│   │   └── ui/         # Shared UI primitives
│   ├── lib/            # Amplify client, GraphQL queries/mutations
│   └── types/          # Shared TypeScript types
├── CLAUDE.md
└── README.md
```

## Dev Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint
npx ampx sandbox     # Start Amplify Gen 2 cloud sandbox (backend)
```

## Key Conventions

- All GraphQL types and operations live in `amplify/data/resource.ts`
- Canvas state is derived from DynamoDB — no local-only state for positions
- Subscriptions are set up in a React context provider (`src/lib/realtime-provider.tsx`)
- Boys have: `id`, `name`, `emoji`, `roomId`, `addedBy`, `createdAt`
- Rooms are seeded (not user-created): Cell Block A/B, Cafeteria, Yard, Solitary

## AWS Services Used

- **Cognito** — user pools, friend login
- **AppSync** — managed GraphQL with WebSocket subscriptions
- **DynamoDB** — serverless NoSQL for game state
- **Amplify Hosting** — CI/CD from GitHub, global CDN
