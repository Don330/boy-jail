# /test — Run Unit & Component Tests (Vitest)

Runs the Vitest suite and reports failures with suggested fixes.

## Stack

- **Vitest** — test runner
- **React Testing Library** — component tests
- **MSW** (Mock Service Worker) — mocks AppSync GraphQL responses

## Steps

1. Run `npm run test` (configured to run `vitest run`)
2. If tests fail, read the failing test file and the source file it tests
3. Diagnose whether the failure is in the test or the implementation
4. Suggest a fix — prefer fixing the implementation, only fix the test if the test expectation is genuinely wrong

## If no test suite exists yet

Vitest is installed during the initial scaffold. If `vitest.config.ts` or `npm run test` is missing, the setup hasn't been completed — prompt the user to finish the scaffold step.

## What to test (priority order)

1. **AppSync mutations** — `createBoy`, `moveBoy`, `deleteBoy` — verify auth rules and data shape
2. **Capacity logic** — moving a Boy into a full room should be rejected
3. **Canvas hit-testing** — `getRoomAtPoint` correctly identifies which room a position is in
4. **Boy validation** — name length cap, emoji length, crime length
5. **Invite code generation/parsing** — uniqueness and URL parsing
6. **Permission checks** — only Boy creator can delete

## What NOT to test

- Trivial display components with no logic
- Third-party components from `@aws-amplify/ui-react`
- Tailwind class output
