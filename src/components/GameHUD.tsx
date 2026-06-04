import type { CSSProperties } from 'react';
import { GAUGE_CAPACITY } from '../game/constants';
import type { GameTheme } from '../game/themes';

interface Props {
  score: number;
  bestScore: number;
  distanceMeters: number;
  gaugeCount: number;
  isPowerMode: boolean;
  powerTimeLeft: number;
  currentTheme: GameTheme;
}

export function GameHUD({
  score, bestScore, distanceMeters,
  gaugeCount, isPowerMode, powerTimeLeft,
  currentTheme,
}: Props) {
  const gaugePct = gaugeCount / GAUGE_CAPACITY;
  const gaugeFull = gaugeCount >= GAUGE_CAPACITY;

  return (
    <>
      {/* ── 상단 스탯 카드 ── */}
      <div style={hudCard}>

        {/* 점수 (좌) */}
        <div>
          <div style={label}>점수</div>
          <div style={{ ...bigNum, color: '#3DAE79' }}>{score}</div>
          <div style={sub}>{currentTheme.emoji} {currentTheme.name}</div>
          <div style={{ ...sub, color: '#8ABD9E', marginTop: 1 }}>🏃 {distanceMeters}m</div>
        </div>

        {/* 물병 게이지 — 막대 형태 (중앙) */}
        <div style={center}>
          {isPowerMode ? (
            /* 파워모드 중: 게이지 숨기고 아이콘만 표시 */
            <div style={{ fontSize: 22, lineHeight: 1 }}>⚡</div>
          ) : (
            <>
              <div style={gaugeLabel}>💧 물병 게이지</div>
              <div style={gaugeTrack}>
                <div style={{
                  height: '100%',
                  width: `${gaugePct * 100}%`,
                  background: gaugeFull
                    ? 'linear-gradient(90deg, #FFD166, #FF8C42)'
                    : 'linear-gradient(90deg, #64B5F6, #1976D2)',
                  borderRadius: 5,
                  transition: 'width 0.25s ease, background 0.3s',
                  boxShadow: gaugeFull ? '0 0 8px rgba(255,190,50,0.7)' : 'none',
                }} />
              </div>
              <div style={{
                ...gaugeCountText,
                color: gaugeFull ? '#FF8C42' : '#5C9CB5',
                fontWeight: gaugeFull ? 800 : 600,
              }}>
                {gaugeFull ? '⚡ FULL!' : `${gaugeCount} / 10`}
              </div>
            </>
          )}
        </div>

        {/* 최고 점수 (우) */}
        <div style={{ textAlign: 'right' }}>
          <div style={label}>최고</div>
          <div style={{ ...bigNum, color: '#4A5568' }}>{bestScore}</div>
        </div>
      </div>

    </>
  );
}

const hudCard: CSSProperties = {
  position: 'absolute',
  top: 12, left: 12, right: 12,
  background: 'rgba(255,255,255,0.94)',
  backdropFilter: 'blur(12px)',
  borderRadius: 18,
  padding: '12px 16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
  pointerEvents: 'none',
};

const label: CSSProperties = {
  fontSize: 10, color: '#A0B4AC', letterSpacing: 1, fontWeight: 600, marginBottom: 1,
};

const bigNum: CSSProperties = {
  fontSize: 28, fontWeight: 800, lineHeight: 1,
};

const sub: CSSProperties = {
  fontSize: 11, color: '#7AAD8E', marginTop: 3, fontWeight: 500,
};

const center: CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, padding: '0 10px',
};

const gaugeLabel: CSSProperties = {
  fontSize: 10, color: '#7ABCCE', fontWeight: 600, letterSpacing: 0.5,
};

const gaugeTrack: CSSProperties = {
  width: '100%',
  height: 10,
  background: 'rgba(100,181,246,0.15)',
  borderRadius: 5,
  overflow: 'hidden',
  border: '1px solid rgba(100,181,246,0.25)',
};

const gaugeCountText: CSSProperties = {
  fontSize: 11, letterSpacing: 0.3,
};

