import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { upsertRanking, getTopRankings, getTopRankingsByDistance, getSavedNickname, persistNickname } from '../utils/ranking';
import type { RankEntry } from '../utils/ranking';
import { hasProfanity, isValidNickname } from '../utils/profanity';

type Step = 'input' | 'loading' | 'done';
type Tab = 'score' | 'distance';

interface Props {
  score?: number;
  distanceMeters?: number;
  viewOnly?: boolean;
  onClose: () => void;
  bottomOffset?: number;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export function RankingModal({ score = 0, distanceMeters = 0, viewOnly = false, onClose, bottomOffset = 60 }: Props) {
  const [step, setStep] = useState<Step>(viewOnly ? 'loading' : 'input');
  const [tab, setTab] = useState<Tab>('score');

  useEffect(() => {
    if (!viewOnly) return;
    getTopRankings(50)
      .then(top => setRankings(top))
      .catch(() => {})
      .finally(() => setStep('done'));
    getTopRankingsByDistance(50)
      .then(top => setDistanceRankings(top))
      .catch(() => {});
  }, [viewOnly]);
  const [nickname, setNickname] = useState(getSavedNickname());
  const [rankings, setRankings] = useState<RankEntry[]>([]);
  const [distanceRankings, setDistanceRankings] = useState<RankEntry[]>([]);
  const [myId, setMyId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) { setError('닉네임을 입력해주세요'); return; }
    if (trimmed.length > 10) { setError('10자 이하로 입력해주세요'); return; }
    if (!isValidNickname(trimmed)) { setError('한글·영문·숫자를 포함해주세요 🙅'); return; }

    // 욕설 체크 (빠른 클라이언트 검증)
    if (hasProfanity(trimmed)) {
      setError('사용할 수 없는 닉네임이에요 🙅');
      return;
    }

    setStep('loading');
    setError('');

    try {
      // 같은 닉네임이면 기존 기록 업데이트, 없으면 새로 등록
      const id = await upsertRanking(trimmed, score, distanceMeters);
      persistNickname(trimmed);
      setMyId(id);
      const top = await getTopRankings(50);
      setRankings(top);
      getTopRankingsByDistance(50).then(d => setDistanceRankings(d)).catch(() => {});
      setStep('done');
    } catch (e) {
      console.error('[Firebase 에러]', e);
      if (e instanceof Error && e.message === 'NICKNAME_TAKEN') {
        setError('다른 사람이 사용 중인 닉네임이에요. 다른 이름을 써주세요!');
      } else if (e instanceof Error && e.message.startsWith('NOT_BEATEN:')) {
        const [, bestScore, bestDist] = e.message.split(':');
        setError(`이미 더 좋은 기록이 있어요! (최고 ${Number(bestScore).toLocaleString()}점 · ${bestDist}m)`);
      } else {
        setError('등록에 실패했어요. 인터넷 연결을 확인해주세요.');
      }
      setStep('input');
    }
  };

  return (
    <div style={{ ...backdrop, bottom: bottomOffset }}>
      <div style={card}>

        {/* ── 닉네임 입력 ── */}
        {step === 'input' && <>
          <div style={headerArea}>
            <div style={{ fontSize: '2rem' }}>🏆</div>
            <h2 style={title}>랭킹 등록</h2>
            <div style={scorePreview}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3DAE79' }}>
                {score.toLocaleString()}
              </span>
              <span style={{ color: '#7AAD8E', fontSize: '0.88rem', marginLeft: 4 }}>
                점 · {distanceMeters}m
              </span>
            </div>
          </div>

          <input
            style={inputStyle}
            placeholder="닉네임 (최대 10자)"
            value={nickname}
            maxLength={10}
            autoFocus
            onChange={e => { setNickname(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          {error && <p style={errorStyle}>{error}</p>}

          <button style={submitBtn} onClick={handleSubmit}>등록하기 →</button>
          <button style={cancelBtn} onClick={onClose}>취소</button>
        </>}

        {/* ── 로딩 ── */}
        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: '44px 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
            <div style={{ color: '#7AAD8E', fontWeight: 600 }}>{viewOnly ? '불러오는 중...' : '등록 중...'}</div>
          </div>
        )}

        {/* ── 전체 랭킹 ── */}
        {step === 'done' && (() => {
          const activeList = tab === 'score' ? rankings : distanceRankings;
          const myIdx = viewOnly
            ? activeList.findIndex(r => r.nickname === getSavedNickname())
            : activeList.findIndex(r => r.id === myId);
          const myEntry = myIdx >= 0 ? activeList[myIdx] : null;

          return <>
            <div style={headerArea}>
              <div style={{ fontSize: '2rem' }}>🌍</div>
              <h2 style={title}>전체 랭킹</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#A0B4AC' }}>상위 50위</p>
            </div>

            {/* 탭 */}
            <div style={tabBar}>
              <button style={tab === 'score' ? tabActiveBtn : tabBtn} onClick={() => setTab('score')}>점수순</button>
              <button style={tab === 'distance' ? tabActiveBtn : tabBtn} onClick={() => setTab('distance')}>거리순</button>
            </div>

            <div style={rankList}>
              {/* 컬럼 헤더 */}
              <div style={{ ...rankRow, background: 'transparent', paddingBottom: 4 }}>
                <span style={colRankH} />
                <span style={{ ...colNameH, fontSize: 10, color: '#A0B4AC', fontWeight: 600 }}>닉네임</span>
                {tab === 'score' ? <>
                  <span style={{ ...colScoreH, fontSize: 10, color: '#A0B4AC', fontWeight: 600 }}>점수</span>
                  <span style={{ ...colDistH, fontSize: 10, color: '#A0B4AC', fontWeight: 600 }}>거리</span>
                </> : <>
                  <span style={{ ...colScoreH, fontSize: 10, color: '#A0B4AC', fontWeight: 600 }}>거리</span>
                  <span style={{ ...colDistH, fontSize: 10, color: '#A0B4AC', fontWeight: 600 }}>점수</span>
                </>}
              </div>

              {activeList.map((r, i) => {
                const isMe = viewOnly ? r.nickname === getSavedNickname() : r.id === myId;
                return (
                  <div key={r.id} style={{
                    ...rankRow,
                    background: i % 2 === 0 ? '#FAFAFA' : 'transparent',
                  }}>
                    <span style={colRankH}>
                      {i < 3
                        ? <span style={{ fontSize: 18 }}>{MEDALS[i]}</span>
                        : <span style={{ color: '#A0B4AC', fontSize: 13, fontWeight: 700 }}>{i + 1}</span>
                      }
                    </span>
                    <span style={{ ...colNameH, color: '#4A5568' }}>
                      {r.nickname}{isMe && <span style={{ color: '#3DAE79', marginLeft: 2 }}>★</span>}
                    </span>
                    {tab === 'score' ? <>
                      <span style={{ ...colScoreH, color: '#4A5568', fontWeight: 600 }}>
                        {r.score.toLocaleString()}
                      </span>
                      <span style={{ ...colDistH, color: '#8ABD9E' }}>
                        {r.distanceMeters}m
                      </span>
                    </> : <>
                      <span style={{ ...colScoreH, color: '#4A5568', fontWeight: 600 }}>
                        {r.distanceMeters}m
                      </span>
                      <span style={{ ...colDistH, color: '#8ABD9E' }}>
                        {r.score.toLocaleString()}
                      </span>
                    </>}
                  </div>
                );
              })}

              {activeList.length === 0 && (
                <div style={{ textAlign: 'center', padding: 20, color: '#A0B4AC' }}>첫 번째 기록이에요!</div>
              )}
            </div>

            {/* 내 순위 요약 */}
            {myEntry ? (
              <div style={myRankBar}>
                <span style={{ fontSize: '0.8rem', color: '#7AAD8E' }}>내 순위</span>
                <span style={{ fontWeight: 800, color: '#2D7D52', fontSize: '1rem' }}>
                  전체 {myIdx + 1}위
                </span>
                <span style={{ color: '#3DAE79', fontWeight: 700 }}>
                  {tab === 'score' ? `${myEntry.score.toLocaleString()}점` : `${myEntry.distanceMeters}m`}
                </span>
              </div>
            ) : getSavedNickname() ? (
              <div style={{ ...myRankBar, justifyContent: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#A0B4AC' }}>50위 밖이에요. 도전해보세요! 🏃</span>
              </div>
            ) : null}

            <button style={submitBtn} onClick={onClose}>닫기</button>
          </>;
        })()}

      </div>
    </div>
  );
}

// ── 스타일 ──────────────────────────────────────────────────────────────────

const backdrop: CSSProperties = {
  position: 'absolute', top: 0, left: 0, right: 0, bottom: 60,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(200,235,218,0.55)',
  backdropFilter: 'blur(6px)',
  zIndex: 60,
};

const card: CSSProperties = {
  background: '#fff',
  borderRadius: 28,
  padding: '28px 24px 24px',
  boxShadow: '0 8px 40px rgba(61,174,121,0.18)',
  maxWidth: 320,
  width: '90%',
  maxHeight: '82vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const headerArea: CSSProperties = {
  textAlign: 'center', marginBottom: 16,
};

const title: CSSProperties = {
  margin: '4px 0 4px',
  fontSize: '1.4rem', fontWeight: 800, color: '#2D7D52',
};

const scorePreview: CSSProperties = {
  display: 'flex', alignItems: 'baseline',
  justifyContent: 'center', gap: 2,
};

const inputStyle: CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  border: '1.5px solid #D0E8DA',
  borderRadius: 12,
  padding: '13px 16px',
  fontSize: '16px', // iOS 자동 줌 방지 (16px 미만 시 자동 확대됨)
  outline: 'none',
  marginBottom: 6,
  fontFamily: 'inherit',
  color: '#2D7D52',
};

const errorStyle: CSSProperties = {
  margin: '0 0 8px', fontSize: '0.82rem', color: '#E57373', textAlign: 'center',
};

const submitBtn: CSSProperties = {
  background: '#3DAE79', color: '#fff',
  border: 'none', borderRadius: 50,
  padding: '14px 0', fontSize: '1rem', fontWeight: 700,
  cursor: 'pointer', width: '100%',
  boxShadow: '0 4px 16px rgba(61,174,121,0.3)',
  marginTop: 8,
};

const cancelBtn: CSSProperties = {
  background: 'transparent', color: '#A0B4AC',
  border: 'none', borderRadius: 50,
  padding: '10px 0', fontSize: '0.9rem', fontWeight: 500,
  cursor: 'pointer', width: '100%', marginTop: 4,
};

const myRankBar: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#F0FAF5',
  border: '1.5px solid #A8D5B8',
  borderRadius: 12,
  padding: '8px 14px',
  marginTop: 10,
  gap: 8,
};

const tabBar: CSSProperties = {
  display: 'flex',
  gap: 6,
  marginBottom: 10,
};

const tabBtn: CSSProperties = {
  flex: 1,
  padding: '8px 0',
  border: '1.5px solid #D0E8DA',
  borderRadius: 50,
  background: 'transparent',
  color: '#A0B4AC',
  fontSize: '0.88rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const tabActiveBtn: CSSProperties = {
  ...tabBtn,
  background: '#3DAE79',
  border: '1.5px solid #3DAE79',
  color: '#fff',
};

const rankList: CSSProperties = {
  flex: 1, overflowY: 'auto',
  border: '1px solid #E0F0E8', borderRadius: 12,
  marginBottom: 12,
};

const rankRow: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '36px 1fr 70px 50px',
  alignItems: 'center',
  padding: '8px 12px',
  gap: 4,
};

const colRankH: CSSProperties = { textAlign: 'center' };
const colNameH: CSSProperties = { fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const colScoreH: CSSProperties = { fontSize: 14, textAlign: 'right' };
const colDistH: CSSProperties = { fontSize: 12, textAlign: 'right' };
