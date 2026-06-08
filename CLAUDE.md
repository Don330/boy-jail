# Boy Jail

Real-time multiplayer jail simulation. Friends share a live canvas, add characters ("Boys"), and drag them between rooms — synced instantly to all users via AppSync subscriptions.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Canvas | React Konva |
| Auth | AWS Cognito (Amplify Gen 2) |
| API + Realtime | AWS AppSync (GraphQL + subscriptions) |
| Database | DynamoDB — Boys, Rooms tables |
| Hosting | AWS Amplify Hosting (auto-deploys from `main`) |
| Testing | Vitest + RTL (unit), Playwright (E2E), MSW (mocks) |

## Dev Commands

```bash
npx ampx sandbox   # start AWS dev backend (leave running)
npm run dev        # start frontend at localhost:3000
npm run build      # production build
npm run lint       # ESLint
```

## Conventions

- Strict TypeScript — no `any`, no unsafe casts
- Server Components by default; `'use client'` only when needed
- All GraphQL ops in `src/lib/graphql.ts` using the Amplify Gen 2 typed client
- Canvas state derived from DynamoDB only — no local-only position state
- Subscriptions: every `subscribe()` must have `unsubscribe()` in `useEffect` cleanup
- `addedBy` always from `getCurrentUser()` — never from client input
- Boy `name`: max 30 chars. `emoji`: max 2 chars. Enforced in schema + form.
- Run `/security` before every push

## Rooms (seeded, not user-created)

`cell-block-a` · `cell-block-b` · `cafeteria` · `yard` · `solitary`

## Custom Commands

`/dev` · `/deploy` · `/security` · `/appsync` · `/canvas` · `/cognito` · `/schema` · `/add-boy` · `/seed` · `/test` · `/e2e`
