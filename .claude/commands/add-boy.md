# /add-boy — Scaffold a New Boy Feature

Use this when adding a new property, behaviour, or UI element related to the Boy entity.

## What to check first

1. Read `amplify/data/resource.ts` to see the current Boy schema
2. Read `src/types/index.ts` for the TypeScript Boy type
3. Check `src/components/boys/` for existing components

## Steps

Given a description of the new feature (passed as args), implement:

1. **Schema change** — update `amplify/data/resource.ts` if a new field is needed
2. **Type update** — update `src/types/index.ts` to match
3. **GraphQL** — add/update queries/mutations in `src/lib/graphql.ts`
4. **Component** — update or create the relevant component in `src/components/boys/`
5. **Canvas** — if the change affects how Boys are displayed on the map, update `src/components/canvas/`

Always keep the Boy type in sync between the Amplify schema and TypeScript types.
