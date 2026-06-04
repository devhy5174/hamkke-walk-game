import { useEffect } from "react";
import type { RefObject, MutableRefObject } from "react";
import type { GameEngine } from "../game/GameEngine";

interface Props {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  engineRef: MutableRefObject<GameEngine | null>;
}

export function GameCanvas({ canvasRef, engineRef }: Props) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 캔버스 픽셀 크기를 CSS 표시 크기에 맞게 동기화
    const sync = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    sync();
    window.addEventListener("resize", sync);

    // React synthetic 이벤트는 passive로 등록돼 preventDefault 불가 →
    // DOM에 직접 { passive: false }로 등록해야 스크롤 막기 가능
    const toCanvasX = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      return (clientX - rect.left) * (canvas.width / rect.width);
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (engineRef.current) {
        engineRef.current.touchX = toCanvasX(e.touches[0].clientX);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (engineRef.current) {
        engineRef.current.touchX = toCanvasX(e.touches[0].clientX);
      }
    };
    const onTouchEnd = () => {
      if (engineRef.current) engineRef.current.touchX = null;
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);

    return () => {
      window.removeEventListener("resize", sync);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [canvasRef, engineRef]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef as RefObject<HTMLCanvasElement>}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
