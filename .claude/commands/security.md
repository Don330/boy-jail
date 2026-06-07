# /security — Security Audit for Boy Jail

Audits the current diff or specified files against security concerns specific to this stack. Run before any PR or deploy.

## Scope

Check every layer of the stack:

### 1. AWS Amplify / AppSync Authorization
- Every model in `amplify/data/resource.ts` must have explicit `.authorization()` rules — no model should be publicly writable without auth
- Mutations (createBoy, moveBoy, deleteBoy) must require `authenticated` users — verify no `allow public` on write operations
- Check that `deleteBoy` is owner-only (`ownerField: 'addedBy'`) and not open to all authenticated users
- Verify subscription filters prevent users from receiving events they shouldn't see

### 2. Amazon Cognito
- Confirm `Amplify.configure()` is called server-side in Next.js (SSR safe) and the config does not expose secret keys
- User pool settings: ensure email verification is required and MFA is considered
- Never store Cognito tokens in `localStorage` — check for this pattern in `src/`
- Check that `getCurrentUser()` is called server-side or in a protected route, never trusted from client-supplied data

### 3. Next.js / React
- No `dangerouslySetInnerHTML` with user-supplied content (Boy names are user input — must be sanitised)
- Environment variables: only `NEXT_PUBLIC_` vars should be in client code — check for any secret leakage
- Check `next.config.ts` for insecure headers or disabled security features
- API routes (if any in `src/app/api/`) must verify the Cognito session server-side before acting

### 4. User Input (Boy names, emoji)
- Boy `name` field: enforce max length in both the Amplify schema and the frontend form
- Emoji field: validate it is actually a single emoji character, not arbitrary unicode or script
- No raw user input should be interpolated into GraphQL queries — use variables, never string concat

### 5. DynamoDB / Data Access
- Confirm AppSync resolvers use parameterised expressions — check generated resolver code if visible
- Verify no Lambda resolvers (if added later) run with overly broad IAM roles

### 6. Dependency hygiene
- Run `npm audit` and flag any high/critical vulnerabilities
- Check that `aws-amplify` and `@aws-amplify/ui-react` are on a current minor version

## Output format

For each issue found:
- **Severity**: Critical / High / Medium / Low
- **Location**: file path + line number
- **Issue**: what is wrong
- **Fix**: specific code change to make it safe

If no issues are found in a category, state "Clean" for that section.
