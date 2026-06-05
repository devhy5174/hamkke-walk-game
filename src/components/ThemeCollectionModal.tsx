import type { CSSProperties } from 'react';
import { THEMES } from '../game/themes';
import { getUnlockedThemes } from '../utils/themeCollection';

interface Props {
  onClose: () => void;
}

// 각 테마의 거리 범위 텍스트
function rangeText(i: number): string {
  const start = THEMES[i].minDistance;
  const end = THEMES[i + 1]?.minDistance;
  return end ? `${start}m ~ ${end}m` : `${start}m ~`;
}

// 테마별 한 줄 소개
const DESCRIPTIONS: Record<string, string> = {
  park:     '상쾌한 공기, 꽃과 잔디 위를 걸어요',
  forest:   '피톤치드 가득한 초록 숲 산책',
  autumn:   '바스락바스락 단풍잎이 쌓인 길',
  cherry:   '분홍빛 꽃잎이 날리는 봄길',
  snow:     '하얀 눈밭 위에 발자국을 남겨요',
  mountain: '정상을 향한 마지막 도전!',
};

export function ThemeCollectionModal({ onClose }: Props) {
  const unlocked = getUnlockedThemes();
  const count = unlocked.length;

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={card} onClick={e => e.stopPropagation()}>

        <div style={header}>
          <div style={{ fontSize: '2rem', marginBottom: 4 }}>🗺️</div>
          <h2 style={title}>산책 도감</h2>
          <p style={subtitle}>
            <span style={{ color: '#3DAE79', fontWeight: 800 }}>{count}</span>
            <span style={{ color: '#A0B4AC' }}> / {THEMES.length} 구간 방문</span>
          </p>
          {/* 진행바 */}
          <div style={progressTrack}>
            <div style={{ ...progressFill, width: `${(count / THEMES.length) * 100}%` }} />
          </div>
        </div>

        <div style={list}>
          {THEMES.map((theme, i) => {
            const isUnlocked = unlocked.includes(theme.id);
            return (
              <div key={theme.id} style={isUnlocked ? itemUnlocked : itemLocked}>
                <div style={iconWrap}>
                  {isUnlocked
                    ? <span style={{ fontSize: 28 }}>{theme.emoji}</span>
                    : <span style={{ fontSize: 22 }}>🔒</span>
                  }
                </div>
                <div style={info}>
                  {isUnlocked ? (
                    <>
                      <div style={themeName}>{theme.name}</div>
                      <div style={themeRange}>{rangeText(i)}</div>
                      <div style={themeDesc}>{DESCRIPTIONS[theme.id]}</div>
                    </>
                  ) : (
                    <>
                      <div style={{ ...themeName, color: '#C0C8C4' }}>미방문 구간</div>
                      <div style={themeRange}>{rangeText(i)} 도달 시 해금</div>
                    </>
                  )}
                </div>
                {isUnlocked && (
                  <div style={badge}>방문 ✓</div>
                )}
              </div>
            );
          })}
        </div>

        <button style={closeBtn} onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

const backdrop: CSSProperties = {
  position: 'absolute', inset: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(200,235,218,0.55)',
  backdropFilter: 'blur(6px)',
  zIndex: 50,
};

const card: CSSProperties = {
  background: '#fff',
  borderRadius: 28,
  padding: '28px 22px 22px',
  boxShadow: '0 8px 40px rgba(61,174,121,0.18)',
  maxWidth: 340,
  width: '92%',
  maxHeight: '84vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const header: CSSProperties = { textAlign: 'center', marginBottom: 14 };

const title: CSSProperties = {
  margin: '0 0 2px', fontSize: '1.4rem', fontWeight: 800, color: '#2D7D52',
};

const subtitle: CSSProperties = { margin: '0 0 10px', fontSize: '0.9rem' };

const progressTrack: CSSProperties = {
  height: 6, background: '#E8F5EE', borderRadius: 3, overflow: 'hidden',
  margin: '0 12px',
};

const progressFill: CSSProperties = {
  height: '100%',
  background: 'linear-gradient(90deg, #52C87A, #3DAE79)',
  borderRadius: 3,
  transition: 'width 0.5s ease',
};

const list: CSSProperties = {
  flex: 1, overflowY: 'auto',
  display: 'flex', flexDirection: 'column', gap: 8,
  marginBottom: 14,
};

const baseItem: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '12px 14px', borderRadius: 16,
};

const itemUnlocked: CSSProperties = {
  ...baseItem,
  background: '#F0FAF5',
  border: '1px solid #D0EEE0',
};

const itemLocked: CSSProperties = {
  ...baseItem,
  background: '#F8F8F8',
  border: '1px solid #EBEBEB',
  opacity: 0.75,
};

const iconWrap: CSSProperties = {
  width: 44, height: 44,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: '#fff', borderRadius: 12,
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  flexShrink: 0,
};

const info: CSSProperties = { flex: 1, minWidth: 0 };

const themeName: CSSProperties = {
  fontSize: 14, fontWeight: 700, color: '#2D7D52',
};

const themeRange: CSSProperties = {
  fontSize: 11, color: '#8ABD9E', marginTop: 1,
};

const themeDesc: CSSProperties = {
  fontSize: 11, color: '#7AAD8E', marginTop: 2,
  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
};

const badge: CSSProperties = {
  fontSize: 10, fontWeight: 700,
  color: '#3DAE79', background: '#E0F4EB',
  borderRadius: 50, padding: '3px 8px',
  whiteSpace: 'nowrap',
};

const closeBtn: CSSProperties = {
  background: '#3DAE79', color: '#fff',
  border: 'none', borderRadius: 50,
  padding: '13px 0', fontSize: '1rem', fontWeight: 700,
  cursor: 'pointer', width: '100%',
  boxShadow: '0 4px 16px rgba(61,174,121,0.3)',
};
