# /e2e — Run End-to-End Tests (Playwright)

Runs the full-app Playwright suite against a running dev server.

## Stack

- **Playwright** — browser automation
- Tests run against `localhost:3000` (Next.js dev server)
- Authenticates against a test Cognito user pool

## Steps

1. Ensure `npm run dev` is running (or start it in a separate terminal)
2. Ensure `npx ampx sandbox` is running (AWS backend)
3. Run `npx playwright test`
4. On failure, open the Playwright report: `npx playwright show-report`

## Critical E2E flow (v1 DOD)

The single most important E2E test is the v1 Definition of Done flow:

1. Sign up User A
2. User A creates a jail → receives invite code
3. Sign up User B in a second browser context
4. User B joins via invite code → sees same jail
5. User A creates a Boy → User B sees it appear in real time
6. User B drags the Boy to another room → User A sees the move
7. Both users see each other in the online presence list

If this passes end-to-end with two browser contexts, the v1 user loop works.

## Test data

- Tests should create their own jails (don't share state with the dev jail)
- Use a `beforeAll` to seed a test user and a `afterAll` to clean up
- Test jails should be named with a prefix like `e2e-` so they're easy to identify and prune

## When to run

- Before merging any PR that touches auth, AppSync, or canvas
- Before deploying to production
- After any Amplify Gen 2 dep update
