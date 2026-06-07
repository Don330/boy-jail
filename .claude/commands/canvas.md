# /canvas — Jail Map Canvas Work (React Konva)

Use when working on the interactive jail map, room layout, or Boy drag-and-drop behaviour.

## Key files

- `src/components/canvas/JailMap.tsx` — root Stage and Layer, subscribes to realtime context
- `src/components/canvas/Room.tsx` — individual room Rect + label
- `src/components/canvas/BoyToken.tsx` — draggable Boy Group (emoji + name label)
- `src/lib/canvas-utils.ts` — helpers for hit-testing which room a Boy was dropped in

## Layout rules

- Rooms have fixed `x`, `y`, `width`, `height` sourced from the Room DynamoDB records — do not hardcode positions in components
- The Stage fills the viewport; use a `scale` prop to handle different screen sizes
- Boys are positioned relative to their room's origin (`room.x + offset`)

## Drag and drop pattern

```tsx
<Group
  draggable
  onDragEnd={(e) => {
    const newRoom = getRoomAtPoint(e.target.x(), e.target.y(), rooms)
    if (newRoom && newRoom.id !== boy.roomId) {
      moveBoy({ id: boy.id, roomId: newRoom.id }) // fires AppSync mutation
    } else {
      e.target.position(originalPos) // snap back if dropped outside a room
    }
  }}
/>
```

## Security note

- Boy `name` must be rendered as a Konva `Text` node — never inject it into HTML
- Validate that `name` length is capped before rendering (long strings break the canvas layout)

## Performance

- Use `listening={false}` on static Room Rects that don't need event handlers
- Memoize `BoyToken` with `React.memo` — each realtime update re-renders all tokens otherwise
- The Stage should have `perfectDrawEnabled={false}` for better performance on many tokens
