# /schema — Review or Update the Amplify Data Schema

Use this to view, explain, or modify the DynamoDB/AppSync schema for Boy Jail.

## Steps

1. Read `amplify/data/resource.ts` — this is the single source of truth for all models
2. If args are provided, make the requested schema change
3. After any schema change:
   - Update `src/types/index.ts` TypeScript types to match
   - Update relevant GraphQL operations in `src/lib/graphql.ts`
   - Remind the user to run `npx ampx sandbox` to push the schema change to their AWS sandbox

## Current models (reference)

- **Boy** — `id`, `name`, `emoji`, `roomId`, `addedBy`, `createdAt`
- **Room** — `id`, `name`, `type` (CELL | CAFETERIA | YARD | SOLITARY), `capacity`, `x`, `y` (canvas position)

Authorization rules:
- Boys: any authenticated user can create/read/update; only the creator can delete
- Rooms: read-only for users (seeded by admin)
