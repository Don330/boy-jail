'use client';

import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Group, Circle, Text } from 'react-konva';
import { getCurrentUser } from 'aws-amplify/auth';
import { client } from '@/lib/data-client';

const MAP_W = 1536;
const MAP_H = 1024;

type Room = {
  id: string; name: string;
  x: number; y: number; width: number; height: number;
  capacity: number | null; acceptsBoys: boolean;
};
type Boy = {
  id: string; name: string; emoji: string;
  roomId: string; addedBy: string; severity: string | null;
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

function BoyToken({ boy, x, y, onDragEnd }: {
  boy: Boy; x: number; y: number;
  onDragEnd: (x: number, y: number) => void;
}) {
  return (
    <Group x={x} y={y} draggable onDragEnd={e => onDragEnd(e.target.x(), e.target.y())}>
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

export function JailCanvas({ jailId, boyVersion = 0 }: { jailId: string; boyVersion?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [boys, setBoys] = useState<Boy[]>([]);
  // Changing a boy's reset key forces its token to remount at the computed position (snap-back)
  const [resetKeys, setResetKeys] = useState<Record<string, number>>({});

  useEffect(() => {
    const img = new window.Image();
    img.src = '/jail-map.png';
    img.onload = () => setBgImage(img);
  }, []);

  useEffect(() => {
    function update() {
      if (containerRef.current) {
        setScale(containerRef.current.offsetWidth / MAP_W);
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

  useEffect(() => {
    client.models.Boy.list({ filter: { jailId: { eq: jailId } } }).then(({ data }) => {
      if (data) setBoys(data as Boy[]);
    });
  }, [jailId, boyVersion]);

  function snapBack(boyId: string) {
    setResetKeys(prev => ({ ...prev, [boyId]: (prev[boyId] ?? 0) + 1 }));
  }

  async function handleDragEnd(boy: Boy, newX: number, newY: number) {
    const target = getRoomAtPoint(newX, newY, rooms);

    if (!target || !target.acceptsBoys) { snapBack(boy.id); return; }

    if (target.capacity !== null) {
      const occupants = boys.filter(b => b.roomId === target.id && b.id !== boy.id).length;
      if (occupants >= target.capacity) { snapBack(boy.id); return; }
    }

    if (target.id === boy.roomId) { snapBack(boy.id); return; }

    const fromRoomId = boy.roomId;
    setBoys(prev => prev.map(b => b.id === boy.id ? { ...b, roomId: target.id } : b));

    try {
      const { username } = await getCurrentUser();
      await client.models.Boy.update({ id: boy.id, roomId: target.id });
      await client.models.Event.create({
        jailId,
        actorUserId: username,
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
    <div ref={containerRef} className="w-full">
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
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
