<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Boy Jail — Agent Guidance

Project-specific guidance for AI tools working in this repo. Read `CLAUDE.md` for project overview and `DESIGN.md` for the full game design.

## Canvas Agent

When working on the jail map or any Konva canvas components:

- The canvas renders in `src/components/canvas/JailMap.tsx`
- Each room is a `<Rect>` with an `id` matching the DynamoDB Room `id`
- Boys are draggable `<Group>` elements (emoji + label) positioned within their room's bounds
- On drag end, fire the `moveBoy` GraphQL mutation with the new `roomId`
- Subscribe to `onBoyMoved` to receive other users' moves in real time
- Rooms are **fixed layout** — positions come from the Room table's `x`/`y` fields, not draggable

## Realtime Agent

When debugging or extending real-time behaviour:

- The AppSync subscription setup lives in `src/lib/realtime-provider.tsx`
- All subscriptions are initialised once in the provider and stored in React context
- Check the Amplify Gen 2 sandbox logs (`npx ampx sandbox`) for subscription errors
- Common issue: Cognito token expiry breaks WebSocket — ensure `Amplify.configure` uses `ssr: true` in Next.js

## Auth Agent

When working on login, signup, or user identity:

- Auth is handled by Amplify UI components (`@aws-amplify/ui-react`) — use the `<Authenticator>` wrapper in `src/app/layout.tsx`
- The current user's username is available via `getCurrentUser()` from `aws-amplify/auth`
- `addedBy` on Boy records stores the Cognito username

## AWS / Infrastructure Agent

When working on AWS config, costs, or Amplify setup:

- All infrastructure is defined in `amplify/` using Amplify Gen 2 TypeScript config
- Sandbox = personal dev environment (runs in your AWS account, costs ~$0 with free tier)
- Prod deployment = triggered by push to `main` via Amplify Hosting
- DynamoDB is on-demand billing — essentially free at hobby scale
- AppSync is ~$4 per million queries — negligible for friends playing a game

## Security Agent

**Always active** — apply these checks whenever writing or reviewing any code in this project, not just when `/security` is explicitly called.

### Non-negotiable rules

1. **AppSync auth rules** — every model mutation must have `allow.authenticated()`. Never `allow.public()` on writes. `deleteBoy` must be owner-only.
2. **User input** — Boy `name`, `emoji`, and `crime` are user-supplied. Always enforce max length in the Amplify schema (`maxLength`) AND in the frontend form. Render name as Konva `Text`, never as HTML.
3. **No secret leakage** — only `NEXT_PUBLIC_` env vars reach the browser. Cognito client secret, AWS credentials, and any API keys must never appear in `src/`.
4. **Token storage** — never `localStorage.setItem` a Cognito JWT. Amplify SSR mode uses httpOnly cookies automatically.
5. **`addedBy` is server-derived** — set from `getCurrentUser()` in the mutation handler, never from a client form field or URL param.
6. **`dangerouslySetInnerHTML`** — forbidden with any user-supplied content. If it appears anywhere near Boy name/emoji data, flag it immediately.

### When to run a full `/security` audit

- Before every `git push origin main`
- After adding any new GraphQL mutation or subscription
- After adding any new user-facing form or input
- After any dependency update (`npm install <package>`)

### Severity escalation

- **Critical**: auth bypass, secret exposure, XSS with user input → block the change, fix before proceeding
- **High**: missing auth rule on mutation, unvalidated input stored in DB → fix before merging
- **Medium**: missing length validation, overly broad IAM, outdated dep with known CVE → fix in same PR
- **Low**: missing rate limiting, verbose error messages → note in PR description, fix soon
