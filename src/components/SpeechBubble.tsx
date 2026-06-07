import { useEffect, useState } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import type { GameEngine } from '../game/GameEngine';

interface Props {
  message: string | null;
  engineRef: MutableRefObject<GameEngine | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  multiline?: boolean;
  persistent?: boolean;
}

export function SpeechBubble({ message, engineRef, canvasRef, multiline, persistent }: Props) {
  const [pos, setPos] = useState({ left: '50%', bottom: '28%' });

  useEffect(() => {
    if (!message) return;
    let rafId: number;

    const track = () => {
      const engine = engineRef.current;
      const canvas = canvasRef.current;
      if (engine && canvas && engine.playerPos) {
        const pp = engine.playerPos;
        const leftPct = ((pp.x + pp.width / 2) / canvas.width) * 100;
        const bottomPct = 100 - (pp.y / canvas.height) * 100 + 4;
        setPos({ left: `${leftPct}%`, bottom: `${bottomPct}%` });
      }
      rafId = requestAnimationFrame(track);
    };

    rafId = requestAnimationFrame(track);
    return () => cancelAnimationFrame(rafId);
  }, [message, engineRef, canvasRef]);

  if (!message) return null;

  return (
    <div
      className={`speech-bubble${multiline ? ' multiline' : ''}`}
      style={{
        left: pos.left,
        bottom: pos.bottom,
        animation: persistent ? 'bubbleFadeIn 0.5s ease forwards' : undefined,
        opacity: persistent ? undefined : undefined,
      }}
    >
      <div className="speech-bubble-inner">{message}</div>
    </div>
  );
}
