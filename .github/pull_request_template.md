## What does this PR do?

<!-- One sentence summary -->

## Security checklist

- [ ] AppSync auth rules checked — no `allow.public()` on mutations
- [ ] User input (Boy name/emoji) has max length validation
- [ ] No secrets or env vars exposed to the client (`NEXT_PUBLIC_` only)
- [ ] `addedBy` is derived from `getCurrentUser()`, not from a form field
- [ ] No `dangerouslySetInnerHTML` with user-supplied content
- [ ] `npm audit` — no new high/critical vulnerabilities

## Test notes

<!-- How did you verify this works? -->
