# Boy Jail — Game Design

## Pitch

A real-time multiplayer jail simulation where friends share a hand-drawn jail canvas, add characters ("Boys") with sentences and crimes, and drag them between rooms — all synced live. Half RPG, half chaos sandbox.

## Core Loop

1. Create a jail or join one with an invite code
2. Add Boys (give them a name, emoji, sentence, severity, and crime)
3. Drag Boys between rooms on the shared canvas
4. Watch friends do the same in real time
5. React to the chaos via the activity feed

## Rooms

10 rooms total, visual layout from the reference canvas image. Boys can be placed in 9 of them; Staff Office is off-limits.

| Room | Hard cap | Notes |
|---|---|---|
| Maximum Security | 10 | Top-left ward |
| General Population | none | Communal center |
| Psych Ward | 8 | Top-right ward |
| Death Row | 6 | Middle-left, individual cells |
| Solitary Confinement | 8 | Middle-right, 8 individual cells |
| Processing | none | Intake, bottom-center-left |
| Kitchen | none | Bottom-center-right |
| Staff Office | — | **Off-limits to Boys** |
| Yard | none | Outdoor recreation, bottom-left |
| Day Release | none | Outdoor garden, bottom-right |

Capacity is enforced on housing/restricted rooms only. Open rooms have no cap to keep gameplay flexible.

## Permissions

- **Move** any Boy: any authenticated jail member
- **Delete** a Boy: only the user who created it
- **Add** a Boy: any authenticated jail member
- **Staff Office**: no one can place a Boy here

## Multi-tenancy

- Each friend group gets their own jail (multi-tenant)
- One user can belong to multiple jails (multi-jail membership)
- Rooms are global (every jail uses the same canvas/layout)
- Boys and Events are scoped to a single jail

## Auth

- AWS Cognito user pool
- Email + password
- Google social login (federated identity)
- Email verification required on signup

## Invite Flow

- Each jail has a 6-character code (e.g. `JAIL-X7K9`)
- Same code works as paste-in (join screen) or URL (`/join/X7K9`)
- Creator of the jail can regenerate the code if needed

## Real-time Behaviour

- **Boy moves, creates, deletes** broadcast to all online users via AppSync subscriptions
- **Toast notifications** appear when other users act
- **Activity feed** (persistent sidebar) shows chronological event history per jail
- **Online presence** shows avatars of currently active users in the corner
- Live cursors (Figma-style) deferred to v2

## Schemas

### Jail
```ts
{
  id: string
  name: string
  inviteCode: string       // 6 chars, unique
  createdBy: string        // Cognito username
  createdAt: timestamp
}
```

### JailMember (join table)
```ts
{
  jailId: string
  userId: string           // Cognito username
  joinedAt: timestamp
}
```

### Room (global, seeded once)
```ts
{
  id: string               // e.g. "max-security", "solitary-cell-1"
  name: string
  x: number                // pixel position on canvas
  y: number
  width: number
  height: number
  capacity: number | null  // null = unlimited
  acceptsBoys: boolean     // false for staff-office
}
```

### Boy
```ts
{
  id: string
  jailId: string
  name: string             // max 30 chars
  emoji: string            // max 2 chars
  imageUrl: string | null  // v2: user upload or AI-generated
  sentenceRoom:
    | "max" | "general" | "psych" | "death" | "solitary"
    | "processing" | "kitchen" | "yard" | "day-release"
  severity: "petty" | "misdemeanor" | "felony" | "capital"
  crime: string            // max 60 chars, free text
  roomId: string           // current location (can differ from sentenceRoom)
  addedBy: string          // Cognito username, set server-side
  createdAt: timestamp
}
```

### Event (activity feed)
```ts
{
  id: string
  jailId: string
  actorUserId: string
  action: "create" | "move" | "delete"
  targetBoyId: string
  fromRoomId: string | null  // null for create
  toRoomId: string | null    // null for delete
  timestamp: timestamp
}
```

## Canvas Display

- Background: the hand-drawn reference image (provided)
- Foreground: Konva tokens rendered per Boy — emoji + name label
- Drag a token to a different room → fires `moveBoy` mutation
- Tokens snap back if dropped outside any room or in a full room
- Boy card on click → shows name, sentence, severity, crime, addedBy

## Out of Scope (v1)

Saved as v2+ candidates so we can revisit:
- User-uploaded Boy avatars (S3 via Amplify Storage)
- AI-generated Boy avatars (DALL-E or similar)
- Live cursors (Figma-style multiplayer cursors)
- Strict placement restrictions (sentence enforces room)
- Public jail discovery
- Mobile-optimized canvas
- Boy "release" history / archived Boys
- Per-jail customization (custom rooms, themes)
- Sentence countdown / time-based events
- Inter-jail interactions (transfer Boys between jails)

## v1 Definition of Done

A user can:
1. Sign up with email or Google
2. Create a new jail, get an invite code
3. Share the code/URL with a friend
4. Friend signs up, joins via code, sees the same canvas
5. Both users add Boys, drag them between rooms
6. Both users see each other's actions in real time (canvas + toast + feed)
7. Online presence shows both users in the corner

Once that loop works end-to-end, v1 is done.
