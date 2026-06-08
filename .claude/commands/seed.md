# /seed — Seed DynamoDB with Initial Room Data

Rooms are fixed (not user-created) and must exist in DynamoDB before the app works. This command creates the seed data.

## Rooms to seed

| id | name | type | x | y | width | height | capacity |
|---|---|---|---|---|---|---|---|
| cell-block-a | Cell Block A | CELL | 50 | 50 | 200 | 150 | 12 |
| cell-block-b | Cell Block B | CELL | 300 | 50 | 200 | 150 | 12 |
| cafeteria | Cafeteria | CAFETERIA | 50 | 250 | 200 | 150 | 30 |
| yard | Yard | YARD | 300 | 250 | 200 | 150 | 50 |
| solitary | Solitary Confinement | SOLITARY | 550 | 50 | 150 | 100 | 1 |

## Steps

1. Check that `amplify/data/resource.ts` has a Room model defined
2. Check if a seed script exists at `src/scripts/seed-rooms.ts`
3. If not, create it using the Amplify Gen 2 client to run `createRoom` mutations for each room above
4. Run the seed: `npx tsx src/scripts/seed-rooms.ts`
5. Verify the rooms exist by querying `listRooms` in the AppSync console or via the app

## When to run

- Once after initial `npx ampx sandbox` setup
- Again if you tear down and recreate the sandbox (`npx ampx sandbox --once`)
- In CI for E2E tests (seed before tests, clean up after)
