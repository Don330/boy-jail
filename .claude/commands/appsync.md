# /appsync — AppSync & Real-time Work

Use when adding or debugging GraphQL operations, subscriptions, or AppSync authorization rules.

## Steps

Given a description of the change (passed as args):

1. Read `amplify/data/resource.ts` — all models and auth rules are defined here
2. Check `src/lib/graphql.ts` for existing queries/mutations/subscriptions
3. Check `src/lib/realtime-provider.tsx` for active subscription setup

## Adding a new subscription

1. Define the subscription event in `amplify/data/resource.ts` if needed
2. Add the subscription document to `src/lib/graphql.ts`
3. Subscribe in `realtime-provider.tsx` using `client.graphql({ query: ... })`
4. Clean up the subscription in the `useEffect` return — memory leaks on unmount cause stale updates

## Common AppSync patterns for this project

```ts
// Subscribe to boy moves
const sub = client.graphql({ query: onBoyMoved }).subscribe({
  next: ({ data }) => updateCanvasState(data.onBoyMoved),
  error: (err) => console.error('Subscription error', err),
})
// cleanup:
return () => sub.unsubscribe()
```

## Authorization checklist (run for any schema change)

- Write operations (`create`, `update`, `delete`) must have `allow.authenticated()`
- `delete` on Boy must be `allow.owner({ ownerField: 'addedBy' })`
- Never add `allow.public()` to any mutation
- Subscriptions inherit the model's auth rules automatically in Amplify Gen 2

## Debugging

- Subscription not firing? Check the Amplify sandbox logs: `npx ampx sandbox`
- Auth errors on subscribe? Ensure `Amplify.configure` runs before any GraphQL call — use `src/lib/amplify-config.ts` imported at the top of `layout.tsx`
- Schema changes not reflected? Restart `npx ampx sandbox` after editing `amplify/data/resource.ts`
