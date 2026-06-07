# /cognito — Auth & User Identity Work

Use when working on login, signup, session handling, or anything involving user identity.

## Setup

- Auth is configured in `amplify/auth/resource.ts`
- The `<Authenticator>` wrapper from `@aws-amplify/ui-react` handles the full login/signup UI — use it in `src/app/layout.tsx`
- `Amplify.configure()` must be called once at app startup using the generated `amplifyconfiguration.json`

## Getting the current user

```ts
import { getCurrentUser } from 'aws-amplify/auth'

const { username, userId } = await getCurrentUser()
```

- Use `username` as the `addedBy` value when creating a Boy
- Never trust a user ID passed from the client — always derive it server-side or from the Cognito token

## Auth in Server Components (Next.js App Router)

```ts
import { fetchAuthSession } from 'aws-amplify/auth/server'
import { runWithAmplifyServerContext } from '@aws-amplify/adapter-nextjs'

const session = await runWithAmplifyServerContext({
  nextServerContext: { cookies },
  operation: (ctx) => fetchAuthSession(ctx),
})
```

## Common issues

- "Not authenticated" error on AppSync call: `Amplify.configure` must run before the first GraphQL call — ensure it's imported in `layout.tsx` before any data fetching
- Token expiry breaks WebSocket subscriptions: Amplify handles token refresh automatically if configured with `ssr: true`
- User sees other users' delete buttons: always check `boy.addedBy === currentUser.username` before rendering destructive actions

## Security rules

- Never store the Cognito JWT in `localStorage` — Amplify uses httpOnly cookies in SSR mode
- The `addedBy` field on Boy is set server-side from the token, never from a form field
- Restrict `deleteBoy` in the AppSync schema to `allow.owner({ ownerField: 'addedBy' })`
