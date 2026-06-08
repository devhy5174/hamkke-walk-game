import { useEffect, useRef, useState } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import type { GameEngine } from '../game/GameEngine';

interface Props {
  message: string | null;
  engineRef: MutableRefObject<GameEngine | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  multiline?: boolean;
  persistent?: boolean;
  editable?: boolean;
  onEdit?: (text: string) => void;
}

export function SpeechBubble({ message, engineRef, canvasRef, multiline, persistent, editable, onEdit }: Props) {
  const [pos, setPos] = useState({ left: '50%', bottom: '28%' });
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(message ?? '');
  }, [message]);

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

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  if (!message && !editable) return null;
  if (!message) return null;

  const handleConfirm = () => {
    setIsEditing(false);
    if (draft.trim()) onEdit?.(draft.trim());
    else setDraft(message ?? '');
  };

  return (
    <div
      className={`speech-bubble${multiline ? ' multiline' : ''}`}
      style={{
        left: pos.left,
        bottom: pos.bottom,
        animation: persistent ? 'bubbleFadeIn 0.5s ease forwards' : undefined,
        cursor: editable ? 'pointer' : undefined,
      }}
    >
      {isEditing ? (
        <div className="speech-bubble-inner" style={{ padding: '6px 10px' }}>
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={handleConfirm}
            onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            style={{
              border: 'none', outline: 'none',
              background: 'transparent',
              fontSize: '0.9rem', fontWeight: 700,
              color: '#2D7D52', width: 180,
              textAlign: 'center',
            }}
          />
        </div>
      ) : (
        <div
          className="speech-bubble-inner"
          onClick={() => editable && setIsEditing(true)}
          style={editable ? { cursor: 'pointer' } : undefined}
        >
          {message}{editable && <span style={{ fontSize: '0.7rem', marginLeft: 4, opacity: 0.5 }}>✏️</span>}
        </div>
      )}
    </div>
  );
}
