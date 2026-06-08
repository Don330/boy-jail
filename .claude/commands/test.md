# /test — Run Tests

Runs the test suite and reports failures with suggested fixes.

## Steps

1. Run `npm test -- --watchAll=false` (or `npm run test` if configured)
2. If tests fail, read the failing test file and the source file it tests
3. Diagnose whether the failure is in the test or the implementation
4. Suggest a fix — prefer fixing the implementation, only fix the test if the test expectation is genuinely wrong

## If no test suite exists yet

Prompt: "No tests found. Would you like me to add tests for a specific component or function?"

Recommended test targets for Boy Jail (in priority order):
1. `moveBoy` mutation — verify roomId updates correctly
2. `getRoomAtPoint` canvas utility — verify hit-testing logic
3. Auth guard — verify unauthenticated users can't call mutations
4. Boy name validation — verify max length and empty string rejection
