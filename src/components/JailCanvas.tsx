'use client';

import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Group, Circle, Text, Rect } from 'react-konva';
import { getCurrentUser } from 'aws-amplify/auth';
import { client } from '@/lib/data-client';
import { BoyCard } from '@/components/BoyCard';

const MAP_W = 1536;
const MAP_H = 1024;

type Room = {
  id: string; name: string;
  x: number; y: number; width: number; height: number;
  capacity: number | null; acceptsBoys: boolean;
};
type Boy = {
  id: string; name: string; emoji: string;
  roomId: string; addedBy: string; addedByName: string | null;
  severity: string | null; sentenceRoom: string | null; crime: string;
  jailId: string;
};

function getRoomAtPoint(x: number, y: number, rooms: Room[]) {
  return rooms.find(r => x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) ?? null;
}

function getBoyPosition(boy: Boy, boys: Boy[], rooms: Room[]) {
  const room = rooms.find(r => r.id === boy.roomId);
  if (!room) return { x: MAP_W / 2, y: MAP_H / 2 };

  const sorted = [...boys.filter(b => b.roomId === boy.roomId)].sort((a, b) => a.id.localeCompare(b.id));
  const index = sorted.findIndex(b => b.id === boy.id);
  const cols = Math.max(1, Math.ceil(Math.sqrt(sorted.length)));
  const col = index % cols;
  const row = Math.floor(index / cols);
  const TOKEN = 50;
  const PAD = 30;

  return {
    x: room.x + PAD + col * (TOKEN + 10) + TOKEN / 2,
    y: room.y + PAD + row * (TOKEN + 18) + TOKEN / 2,
  };
}

function severityFill(s: string | null) {
  if (s === 'petty') return '#86efac';
  if (s === 'misdemeanor') return '#fde68a';
  if (s === 'felony') return '#fca5a5';
  if (s === 'capital') return '#c084fc';
  return '#e4e4e7';
}

function BoyToken({ boy, x, y, onDragEnd, onSelect }: {
  boy: Boy; x: number; y: number;
  onDragEnd: (x: number, y: number) => void;
  onSelect: () => void;
}) {
  // Prevent click firing after a drag — set true on dragStart, clear on next frame after dragEnd
  const draggingRef = useRef(false);

  return (
    <Group
      x={x} y={y} draggable
      onDragStart={() => { draggingRef.current = true; }}
      onDragEnd={e => {
        onDragEnd(e.target.x(), e.target.y());
        requestAnimationFrame(() => { draggingRef.current = false; });
      }}
      onClick={() => { if (!draggingRef.current) onSelect(); }}
    >
      <Circle radius={22} fill={severityFill(boy.severity)} stroke="#292524" strokeWidth={1.5} shadowBlur={4} shadowOpacity={0.2} />
      <Text text={boy.emoji} fontSize={20} offsetX={10} offsetY={10} listening={false} />
      <Text
        text={boy.name.length > 10 ? boy.name.slice(0, 9) + '…' : boy.name}
        fontSize={9}
        fill="#1c1917"
        fontStyle="bold"
        align="center"
        width={80}
        offsetX={40}
        y={26}
        listening={false}
      />
    </Group>
  );
}

interface JailCanvasProps {
  jailId: string;
  currentUsername: string;
  currentDisplayName: string;
  onActivity?: (message: string) => void;
}

export function JailCanvas({ jailId, currentUsername, currentDisplayName, onActivity }: JailCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [boys, setBoys] = useState<Boy[]>([]);
  const [resetKeys, setResetKeys] = useState<Record<string, number>>({});
  const [selectedBoy, setSelectedBoy] = useState<Boy | null>(null);
  const [flashingRooms, setFlashingRooms] = useState<Set<string>>(new Set<string>());

  // Refs so subscription callbacks always read latest state without recreating subscriptions
  const boysRef = useRef<Boy[]>([]);
  const roomsRef = useRef<Room[]>([]);
  useEffect(() => { boysRef.current = boys; }, [boys]);
  useEffect(() => { roomsRef.current = rooms; }, [rooms]);

  useEffect(() => {
    const img = new window.Image();
    img.src = '/jail-map.png';
    img.onload = () => setBgImage(img);
  }, []);

  useEffect(() => {
    function update() {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        const h = containerRef.current.offsetHeight;
        setScale(Math.min(w / MAP_W, h / MAP_H));
      }
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    client.models.Room.list().then(({ data }) => {
      if (data) setRooms(data as Room[]);
    });
  }, []);

  // Initial fetch of boys for this jail
  useEffect(() => {
    client.models.Boy.list({ filter: { jailId: { eq: jailId } } }).then(({ data }) => {
      if (data) setBoys(data as Boy[]);
    });
  }, [jailId]);

  // Subscribe: a boy was added — add to canvas if not already present
  useEffect(() => {
    const sub = client.models.Boy.onCreate({
      filter: { jailId: { eq: jailId } },
    }).subscribe({
      next: (boy) => {
        setBoys(prev => prev.some(b => b.id === boy.id) ? prev : [...prev, boy as Boy]);
      },
      error: (err) => console.error('Boy.onCreate error', err),
    });
    return () => sub.unsubscribe();
  }, [jailId]);

  // Subscribe: a boy was updated (moved) — update roomId in canvas
  useEffect(() => {
    const sub = client.models.Boy.onUpdate({
      filter: { jailId: { eq: jailId } },
    }).subscribe({
      next: (boy) => {
        setBoys(prev => prev.map(b => b.id === boy.id ? { ...b, ...(boy as Boy) } : b));
      },
      error: (err) => console.error('Boy.onUpdate error', err),
    });
    return () => sub.unsubscribe();
  }, [jailId]);

  // Subscribe: a boy was deleted — remove from canvas
  useEffect(() => {
    const sub = client.models.Boy.onDelete({
      filter: { jailId: { eq: jailId } },
    }).subscribe({
      next: (boy) => {
        setBoys(prev => prev.filter(b => b.id !== boy.id));
      },
      error: (err) => console.error('Boy.onDelete error', err),
    });
    return () => sub.unsubscribe();
  }, [jailId]);

  // Subscribe: an event was created — show a toast for other users' actions
  useEffect(() => {
    const sub = client.models.Event.onCreate({
      filter: { jailId: { eq: jailId } },
    }).subscribe({
      next: (event) => {
        // Skip events created by the current user — no need to notify yourself
        if (event.actorUserId === currentUsername) return;

        const boy = boysRef.current.find(b => b.id === event.targetBoyId);
        const label = boy ? `${boy.emoji} ${boy.name}` : 'A boy';
        const toRoom = roomsRef.current.find(r => r.id === event.toRoomId);

        if (event.action === 'create') {
          onActivity?.(`${event.actorUserId} added ${label}`);
        } else if (event.action === 'move') {
          onActivity?.(`${event.actorUserId} moved ${label} to ${toRoom?.name ?? event.toRoomId}`);
        } else if (event.action === 'delete') {
          onActivity?.(`${event.actorUserId} removed ${label}`);
        }
      },
      error: (err) => console.error('Event.onCreate error', err),
    });
    return () => sub.unsubscribe();
  }, [jailId, currentUsername, onActivity]);

  function snapBack(boyId: string) {
    setResetKeys(prev => ({ ...prev, [boyId]: (prev[boyId] ?? 0) + 1 }));
  }

  function flashRoom(roomId: string) {
    setFlashingRooms(prev => new Set([...prev, roomId]));
    setTimeout(() => {
      setFlashingRooms(prev => {
        const next = new Set(prev);
        next.delete(roomId);
        return next;
      });
    }, 600);
  }

  async function handleDragEnd(boy: Boy, newX: number, newY: number) {
    const target = getRoomAtPoint(newX, newY, rooms);

    if (!target || !target.acceptsBoys) { snapBack(boy.id); return; }

    if (target.capacity !== null) {
      const occupants = boys.filter(b => b.roomId === target.id && b.id !== boy.id).length;
      if (occupants >= target.capacity) { snapBack(boy.id); flashRoom(target.id); return; }
    }

    if (target.id === boy.roomId) { snapBack(boy.id); return; }

    const fromRoomId = boy.roomId;
    setBoys(prev => prev.map(b => b.id === boy.id ? { ...b, roomId: target.id } : b));

    try {
      await client.models.Boy.update({ id: boy.id, roomId: target.id });
      await client.models.Event.create({
        jailId,
        jailGroup: `jail-${jailId}`,
        actorUserId: currentUsername,
        actorName: currentDisplayName,
        action: 'move',
        targetBoyId: boy.id,
        fromRoomId,
        toRoomId: target.id,
      });
    } catch {
      setBoys(prev => prev.map(b => b.id === boy.id ? { ...b, roomId: fromRoomId } : b));
      snapBack(boy.id);
    }
  }

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <Stage width={MAP_W * scale} height={MAP_H * scale} scaleX={scale} scaleY={scale}>
        <Layer>
          {bgImage && <KonvaImage image={bgImage} width={MAP_W} height={MAP_H} />}
          {boys.map(boy => {
            const pos = getBoyPosition(boy, boys, rooms);
            return (
              <BoyToken
                key={`${boy.id}-${resetKeys[boy.id] ?? 0}`}
                boy={boy}
                x={pos.x}
                y={pos.y}
                onDragEnd={(x, y) => handleDragEnd(boy, x, y)}
                onSelect={() => setSelectedBoy(boy)}
              />
            );
          })}
        </Layer>
        <Layer listening={false}>
          {rooms.map(room => {
            const flashing = flashingRooms.has(room.id);
            const occupancy = boys.filter(b => b.roomId === room.id).length;
            const isFull = room.capacity !== null && occupancy >= room.capacity;
            return (
              <Group key={room.id}>
                {flashing && (
                  <Rect
                    x={room.x} y={room.y}
                    width={room.width} height={room.height}
                    fill="#ef4444" opacity={0.35}
                    cornerRadius={4}
                  />
                )}
                {room.capacity !== null && (
                  <Group x={room.x + room.width - 40} y={room.y + 6}>
                    <Rect
                      x={0} y={0} width={34} height={18}
                      fill={isFull ? '#ef4444' : '#1c1917'}
                      opacity={0.85} cornerRadius={9}
                    />
                    <Text
                      text={`${occupancy}/${room.capacity}`}
                      fontSize={11} fontStyle="bold"
                      fill="#ffffff" width={34} align="center" y={3}
                    />
                  </Group>
                )}
              </Group>
            );
          })}
        </Layer>
      </Stage>

      {selectedBoy && (
        <BoyCard
          boy={selectedBoy}
          currentUsername={currentUsername}
          currentDisplayName={currentDisplayName}
          onClose={() => setSelectedBoy(null)}
          onDeleted={(id) => {
            setBoys(prev => prev.filter(b => b.id !== id));
            setSelectedBoy(null);
          }}
        />
      )}
    </div>
  );
}
