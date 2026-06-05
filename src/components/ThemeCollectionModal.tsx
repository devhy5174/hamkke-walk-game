import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { THEMES } from '../game/themes';
import type { GameTheme } from '../game/themes';
import { ROAD_L, ROAD_R } from '../game/constants';
import { renderBackground, renderDecorations } from '../game/themeRenderer';
import { getUnlockedThemes } from '../utils/themeCollection';

// 테마별 장애물 이미지 소스
import obsParRock   from '../assets/images/obstacles/obs-park-rock.png';
import obsParPuddle from '../assets/images/obstacles/obs-park-puddle.png';
import obsForRock   from '../assets/images/obstacles/obs-forest-rock.png';
import obsForPuddle from '../assets/images/obstacles/obs-forest-puddle.png';
import obsAutRock   from '../assets/images/obstacles/obs-autumn-rock.png';
import obsCheRock   from '../assets/images/obstacles/obs-cherry-rock.png';
import obsSnoRock   from '../assets/images/obstacles/obs-snow-rock.png';
import obsMtnRock   from '../assets/images/obstacles/obs-mountain-rock.png';

const ROCK_SRCS: Record<string, string> = {
  park: obsParRock, forest: obsForRock,
  autumn: obsParRock, cherry: obsParRock,
  snow: obsParRock, mountain: obsForRock,
};
const PUDDLE_SRCS: Record<string, string> = {
  park: obsParPuddle, forest: obsForPuddle,
  autumn: obsAutRock, cherry: obsCheRock,
  snow: obsSnoRock, mountain: obsMtnRock,
};

const DESCRIPTIONS: Record<string, string> = {
  park:     '상쾌한 공기, 꽃과 잔디 위를 걸어요',
  forest:   '피톤치드 가득한 초록 숲 산책',
  autumn:   '바스락바스락 단풍잎이 쌓인 길',
  cherry:   '분홍빛 꽃잎이 날리는 봄길',
  snow:     '하얀 눈밭 위에 발자국을 남겨요',
  mountain: '정상을 향한 마지막 도전!',
};

function rangeText(i: number) {
  const start = THEMES[i].minDistance;
  const end = THEMES[i + 1]?.minDistance;
  return end ? `${start}m ~ ${end}m` : `${start}m ~`;
}

// ── 애니메이션 배경 캔버스 ──────────────────────────────────────────────────

function ThemePreviewCanvas({ theme }: { theme: GameTheme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    // 장애물 이미지 로드
    const rockImg = new Image();
    const puddleImg = new Image();
    rockImg.src = ROCK_SRCS[theme.id];
    puddleImg.src = PUDDLE_SRCS[theme.id];

    let scrollY = 0;
    let aliveTime = 0;
    let lastNow = 0;
    let rafId: number;

    const draw = (now: number) => {
      const dt = lastNow ? Math.min((now - lastNow) / 1000, 0.05) : 0;
      lastNow = now;
      aliveTime += dt;
      scrollY = (scrollY + 70 * dt) % 60;

      const pathLeft = w * ROAD_L;
      const pathWidth = w * (ROAD_R - ROAD_L);
      const rc = { ctx, width: w, height: h, pathLeft, pathWidth, isPowerMode: false, scrollY, aliveTime };

      renderBackground(rc, theme);
      renderDecorations(rc, theme);

      // 장애물 오버레이 (이미지 로드 후)
      if (rockImg.complete && rockImg.naturalWidth) {
        ctx.save();
        ctx.filter = 'saturate(1.4) contrast(1.1)';
        ctx.drawImage(rockImg, pathLeft + 12, h * 0.52, 50, 54);
        ctx.restore();
      }
      if (puddleImg.complete && puddleImg.naturalWidth) {
        ctx.save();
        ctx.filter = 'saturate(1.5) contrast(1.1)';
        ctx.drawImage(puddleImg, pathLeft + pathWidth - 72, h * 0.42, 60, 60);
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%', borderRadius: 16 }}
    />
  );
}

// ── 테마 상세 팝업 ───────────────────────────────────────────────────────────

function ThemeDetailPopup({ theme, index, onClose }: { theme: GameTheme; index: number; onClose: () => void }) {
  return (
    <div style={detailBackdrop} onClick={onClose}>
      <div style={detailCard} onClick={e => e.stopPropagation()}>
        <div style={{ height: 190, borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
          <ThemePreviewCanvas theme={theme} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 28 }}>{theme.emoji}</span>
          <div>
            <div style={detailName}>{theme.name}</div>
            <div style={detailRange}>{rangeText(index)}</div>
          </div>
        </div>
        <p style={detailDesc}>{DESCRIPTIONS[theme.id]}</p>
        <button style={closeBtn} onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

// ── 메인 도감 모달 ───────────────────────────────────────────────────────────

interface Props { onClose: () => void; }

export function ThemeCollectionModal({ onClose }: Props) {
  const unlocked = getUnlockedThemes();
  const count = unlocked.length;
  const [selected, setSelected] = useState<{ theme: GameTheme; index: number } | null>(null);

  return (
    <>
      <div style={backdrop} onClick={onClose}>
        <div style={card} onClick={e => e.stopPropagation()}>

          <div style={header}>
            <div style={{ fontSize: '2rem', marginBottom: 4 }}>🗺️</div>
            <h2 style={title}>산책 도감</h2>
            <p style={subtitle}>
              <span style={{ color: '#3DAE79', fontWeight: 800 }}>{count}</span>
              <span style={{ color: '#A0B4AC' }}> / {THEMES.length} 구간 방문</span>
            </p>
            <div style={progressTrack}>
              <div style={{ ...progressFill, width: `${(count / THEMES.length) * 100}%` }} />
            </div>
          </div>

          <div style={grid}>
            {THEMES.map((theme, i) => {
              const isUnlocked = unlocked.includes(theme.id);
              return (
                <div
                  key={theme.id}
                  style={isUnlocked ? gridItemUnlocked : gridItemLocked}
                  onClick={isUnlocked ? () => setSelected({ theme, index: i }) : undefined}
                >
                  <span style={{ fontSize: 28 }}>{isUnlocked ? theme.emoji : '🔒'}</span>
                  <div style={gridName(isUnlocked)}>
                    {isUnlocked ? theme.name : '미방문'}
                  </div>
                  <div style={gridRange}>
                    {isUnlocked ? rangeText(i) : `${theme.minDistance}m~`}
                  </div>
                </div>
              );
            })}
          </div>

          <button style={closeBtn} onClick={onClose}>닫기</button>
        </div>
      </div>

      {selected && (
        <ThemeDetailPopup
          theme={selected.theme}
          index={selected.index}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

// ── 스타일 ──────────────────────────────────────────────────────────────────

const backdrop: CSSProperties = {
  position: 'absolute', inset: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(200,235,218,0.55)',
  backdropFilter: 'blur(6px)', zIndex: 50,
};

const card: CSSProperties = {
  background: '#fff', borderRadius: 28,
  padding: '28px 22px 22px',
  boxShadow: '0 8px 40px rgba(61,174,121,0.18)',
  maxWidth: 340, width: '92%',
  maxHeight: '84vh',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
};

const header: CSSProperties = { textAlign: 'center', marginBottom: 16 };
const title: CSSProperties = { margin: '0 0 2px', fontSize: '1.4rem', fontWeight: 800, color: '#2D7D52' };
const subtitle: CSSProperties = { margin: '0 0 10px', fontSize: '0.9rem' };

const progressTrack: CSSProperties = {
  height: 6, background: '#E8F5EE', borderRadius: 3, overflow: 'hidden', margin: '0 12px',
};
const progressFill: CSSProperties = {
  height: '100%', background: 'linear-gradient(90deg, #52C87A, #3DAE79)',
  borderRadius: 3, transition: 'width 0.5s ease',
};

const grid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 10, flex: 1, overflowY: 'auto', marginBottom: 14,
};

const baseGridItem: CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  padding: '12px 6px', borderRadius: 16, textAlign: 'center',
  cursor: 'pointer',
};
const gridItemUnlocked: CSSProperties = {
  ...baseGridItem, background: '#F0FAF5', border: '1.5px solid #D0EEE0',
};
const gridItemLocked: CSSProperties = {
  ...baseGridItem, background: '#F8F8F8', border: '1.5px solid #EBEBEB',
  opacity: 0.6, cursor: 'default',
};
const gridName = (unlocked: boolean): CSSProperties => ({
  fontSize: 11, fontWeight: 700, marginTop: 6,
  color: unlocked ? '#2D7D52' : '#B0B0B0',
});
const gridRange: CSSProperties = { fontSize: 9, color: '#A0B4AC', marginTop: 2 };

const closeBtn: CSSProperties = {
  background: '#3DAE79', color: '#fff', border: 'none',
  borderRadius: 50, padding: '13px 0', fontSize: '1rem', fontWeight: 700,
  cursor: 'pointer', width: '100%', boxShadow: '0 4px 16px rgba(61,174,121,0.3)',
};

// 상세 팝업
const detailBackdrop: CSSProperties = {
  position: 'absolute', inset: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 60,
};
const detailCard: CSSProperties = {
  background: '#fff', borderRadius: 24, padding: '20px 20px 18px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
  maxWidth: 320, width: '88%',
};
const detailName: CSSProperties = { fontSize: '1.2rem', fontWeight: 800, color: '#2D7D52' };
const detailRange: CSSProperties = { fontSize: 12, color: '#8ABD9E', marginTop: 2 };
const detailDesc: CSSProperties = {
  fontSize: '0.88rem', color: '#7AAD8E', margin: '8px 0 16px', lineHeight: 1.5,
};
