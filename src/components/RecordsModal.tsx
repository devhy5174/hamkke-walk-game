import type { CSSProperties } from 'react';
import { getRecords, formatDate } from '../utils/records';

interface Props {
  onClose: () => void;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export function RecordsModal({ onClose }: Props) {
  const records = getRecords();

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={card} onClick={e => e.stopPropagation()}>

        <div style={header}>
          <span style={{ fontSize: '1.8rem' }}>🏆</span>
          <h2 style={title}>내 기록</h2>
          <p style={subtitle}>상위 10개 기록</p>
        </div>

        {records.length === 0 ? (
          <div style={empty}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🌿</div>
            <div style={{ color: '#7AAD8E', fontSize: '0.9rem' }}>아직 기록이 없어요</div>
            <div style={{ color: '#A0B4AC', fontSize: '0.8rem', marginTop: 4 }}>게임을 플레이하면 여기에 쌓여요!</div>
          </div>
        ) : (
          <div style={list}>
            {/* 헤더 */}
            <div style={{ ...row, background: 'transparent', paddingBottom: 4 }}>
              <span style={colRank} />
              <span style={{ ...colScore, color: '#A0B4AC', fontSize: 10, fontWeight: 600 }}>점수</span>
              <span style={{ ...colDist, color: '#A0B4AC', fontSize: 10, fontWeight: 600 }}>거리</span>
              <span style={{ ...colDate, color: '#A0B4AC', fontSize: 10, fontWeight: 600 }}>날짜</span>
            </div>

            {records.map((r, i) => (
              <div key={i} style={{ ...row, background: i % 2 === 0 ? '#F8FDFB' : 'transparent' }}>
                <span style={colRank}>
                  {MEDALS[i] ?? <span style={{ color: '#A0B4AC', fontWeight: 700 }}>{i + 1}</span>}
                </span>
                <span style={{ ...colScore, color: i === 0 ? '#3DAE79' : '#4A5568' }}>
                  {r.score.toLocaleString()}
                </span>
                <span style={colDist}>{r.distanceMeters}m</span>
                <span style={colDate}>{formatDate(r.date)}</span>
              </div>
            ))}
          </div>
        )}

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
  padding: '28px 24px 24px',
  boxShadow: '0 8px 40px rgba(61,174,121,0.18)',
  maxWidth: 320,
  width: '90%',
  maxHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
};

const header: CSSProperties = {
  textAlign: 'center',
  marginBottom: 16,
};

const title: CSSProperties = {
  margin: '4px 0 2px',
  fontSize: '1.4rem',
  fontWeight: 800,
  color: '#2D7D52',
};

const subtitle: CSSProperties = {
  margin: 0,
  fontSize: '0.8rem',
  color: '#A0B4AC',
};

const empty: CSSProperties = {
  textAlign: 'center',
  padding: '28px 0',
};

const list: CSSProperties = {
  overflowY: 'auto',
  marginBottom: 16,
  borderRadius: 12,
  border: '1px solid #E0F0E8',
  overflow: 'hidden',
};

const row: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '32px 1fr 60px 44px',
  alignItems: 'center',
  padding: '9px 12px',
  gap: 4,
};

const colRank: CSSProperties = { fontSize: 18, textAlign: 'center' };
const colScore: CSSProperties = { fontSize: 15, fontWeight: 700 };
const colDist: CSSProperties = { fontSize: 12, color: '#7AAD8E', textAlign: 'right' };
const colDate: CSSProperties = { fontSize: 11, color: '#A0B4AC', textAlign: 'right' };

const closeBtn: CSSProperties = {
  background: '#3DAE79',
  color: '#fff',
  border: 'none',
  borderRadius: 50,
  padding: '13px 0',
  fontSize: '1rem',
  fontWeight: 700,
  cursor: 'pointer',
  width: '100%',
  boxShadow: '0 4px 16px rgba(61,174,121,0.3)',
};
