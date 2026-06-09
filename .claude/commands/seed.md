# /seed — Seed DynamoDB with Room Data

Rooms are fixed (not user-created) and must exist in DynamoDB before the app works. This command creates the seed data for all 9 rooms in the jail map.

## Rooms to seed

Coordinates are **placeholders** until Phase 3 — they'll be replaced with real measurements from the jail map image (`public/jail-map.png`).

| id | name | capacity | acceptsBoys | x | y | width | height |
|---|---|---|---|---|---|---|---|
| max-security | Maximum Security | 10 | true | 0 | 0 | 0 | 0 |
| general-population | General Population | (none) | true | 0 | 0 | 0 | 0 |
| psych-ward | Psych Ward | 8 | true | 0 | 0 | 0 | 0 |
| death-row | Death Row | 6 | true | 0 | 0 | 0 | 0 |
| solitary-confinement | Solitary Confinement | 8 | true | 0 | 0 | 0 | 0 |
| processing | Processing | (none) | true | 0 | 0 | 0 | 0 |
| kitchen | Kitchen | (none) | true | 0 | 0 | 0 | 0 |
| staff-office | Staff Office | (none) | **false** | 0 | 0 | 0 | 0 |
| yard | Yard | (none) | true | 0 | 0 | 0 | 0 |
| day-release | Day Release | (none) | true | 0 | 0 | 0 | 0 |

`capacity` is null/unset for uncapped rooms. `acceptsBoys: false` is only on Staff Office.

## Steps

1. Check that `amplify/data/resource.ts` has the Room model defined
2. Check if a seed script exists at `src/scripts/seed-rooms.ts`
3. If not, create it using the Amplify Gen 2 client to run `createRoom` mutations for each room above
4. Run the seed: `npx tsx src/scripts/seed-rooms.ts`
5. Verify the rooms exist by querying `listRooms` in the AppSync console or via the app

## When to run

- Once after initial `npx ampx sandbox` setup
- Again if you tear down and recreate the sandbox (`npx ampx sandbox --once`)
- After updating room coordinates in Phase 3

## After Phase 3 coordinate mapping

Replace the zeros above with measured coordinates from the jail map image.
