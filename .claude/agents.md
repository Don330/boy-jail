# Claude Code Agents — Boy Jail

Custom agent guidance for working on this project.

## Canvas Agent

When asked to work on the jail map or any Konva canvas components:

- The canvas renders in `src/components/canvas/JailMap.tsx`
- Each room is a `<Rect>` with an `id` matching the DynamoDB Room `id`
- Boys are draggable `<Group>` elements (emoji + label) positioned within their room's bounds
- On drag end, fire the `moveBoy` GraphQL mutation with the new `roomId`
- Subscribe to `onBoyMoved` to receive other users' moves in real time
- Rooms are **fixed layout** — positions come from the Room table's `x`/`y` fields, not draggable

## Realtime Agent

When asked to debug or extend real-time behaviour:

- The AppSync subscription setup lives in `src/lib/realtime-provider.tsx`
- All subscriptions are initialised once in the provider and stored in React context
- Check the Amplify Gen 2 sandbox logs (`npx ampx sandbox`) for subscription errors
- Common issue: Cognito token expiry breaks WebSocket — ensure `Amplify.configure` uses `ssr: true` in Next.js

## Auth Agent

When asked about login, signup, or user identity:

- Auth is handled by Amplify UI components (`@aws-amplify/ui-react`) — use the `<Authenticator>` wrapper in `src/app/layout.tsx`
- The current user's username is available via `getCurrentUser()` from `aws-amplify/auth`
- `addedBy` on Boy records stores the Cognito username

## AWS / Infrastructure Agent

When asked about AWS config, costs, or Amplify setup:

- All infrastructure is defined in `amplify/` using Amplify Gen 2 TypeScript config
- Sandbox = personal dev environment (runs in your AWS account, costs ~$0 with free tier)
- Prod deployment = triggered by push to `main` via Amplify Hosting
- DynamoDB is on-demand billing — essentially free at hobby scale
- AppSync is ~$4 per million queries — negligible for friends playing a game
