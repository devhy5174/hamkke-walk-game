import type { CSSProperties } from "react";

interface Props {
  score: number;
  bestScore: number;
  distanceMeters: number;
  onRestart: () => void;
  onShowRanking: () => void;
  onGoHome: () => void;
}

export function GameOverModal({
  score,
  bestScore,
  distanceMeters,
  onRestart,
  onShowRanking,
  onGoHome,
}: Props) {
  const isNewBest = score > 0 && score === bestScore;

  return (
    <div style={backdrop}>
      <div style={card}>
        <div style={{ fontSize: "2.8rem", marginBottom: 6 }}>
          {isNewBest ? "🏆" : "🌿"}
        </div>
        <h2 style={titleStyle}>
          {isNewBest ? "신기록이에요!" : "잘 걸었어요!"}
        </h2>
        <p style={subtitleStyle}>
          {isNewBest ? (
            "최고 기록을 갱신했어요 🎉"
          ) : (
            <>
              오늘도 함께 걸어줘서 고마워요
              <br />
              이젠 진짜로 걸어볼까요?
            </>
          )}
        </p>

        {/* 거리 - 메인 성취 지표 */}
        <div style={distanceBox}>
          <div style={distanceLabel}>오늘 걸은 거리</div>
          <div style={distanceNum}>
            {distanceMeters}
            <span
              style={{ fontSize: "1.2rem", fontWeight: 600, color: "#6CB88A" }}
            >
              m
            </span>
          </div>
        </div>

        {/* 점수 / 최고점 */}
        <div style={scoreRow}>
          <div style={scoreBox}>
            <div style={scoreLabel}>점수</div>
            <div style={{ ...scoreNum, color: "#4A5568" }}>{score}</div>
          </div>
          <div style={divider} />
          <div style={scoreBox}>
            <div style={scoreLabel}>최고</div>
            <div style={{ ...scoreNum, color: "#3DAE79" }}>{bestScore}</div>
          </div>
        </div>

        <button style={restartBtn} onClick={onRestart}>
          한 번 더 걸어볼까요? 🚶
        </button>
        <button style={rankingBtn} onClick={onShowRanking}>
          🌍 전체 랭킹 등록
        </button>
        <button style={homeBtn} onClick={onGoHome}>
          🏠 메인화면 가기
        </button>
      </div>
    </div>
  );
}

const backdrop: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(200, 235, 218, 0.6)",
  backdropFilter: "blur(6px)",
};

const card: CSSProperties = {
  background: "#fff",
  borderRadius: 28,
  padding: "36px 28px 28px",
  textAlign: "center",
  boxShadow: "0 8px 40px rgba(61, 174, 121, 0.18)",
  maxWidth: 310,
  width: "88%",
};

const titleStyle: CSSProperties = {
  margin: "0 0 4px",
  color: "#2D7D52",
  fontSize: "1.6rem",
  fontWeight: 800,
};

const subtitleStyle: CSSProperties = {
  margin: "0 0 18px",
  color: "#7AAD8E",
  fontSize: "0.88rem",
};

const distanceBox: CSSProperties = {
  background: "#F0FAF5",
  borderRadius: 18,
  padding: "16px 20px",
  marginBottom: 12,
};

const distanceLabel: CSSProperties = {
  fontSize: 11,
  color: "#8ABD9E",
  letterSpacing: 0.5,
  marginBottom: 4,
};

const distanceNum: CSSProperties = {
  fontSize: "2.6rem",
  fontWeight: 800,
  color: "#3DAE79",
  lineHeight: 1,
};

const scoreRow: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#F8FDFB",
  border: "1px solid #E0F0E8",
  borderRadius: 14,
  padding: "12px 20px",
  marginBottom: 20,
};

const scoreBox: CSSProperties = { flex: 1 };
const divider: CSSProperties = {
  width: 1,
  height: 36,
  background: "#D0E8DA",
  margin: "0 12px",
};
const scoreLabel: CSSProperties = {
  fontSize: 10,
  color: "#A0B4AC",
  letterSpacing: 1,
};
const scoreNum: CSSProperties = {
  fontSize: 26,
  fontWeight: 800,
  lineHeight: 1.1,
};

const restartBtn: CSSProperties = {
  background: "#3DAE79",
  color: "#fff",
  border: "none",
  borderRadius: 50,
  padding: "15px 0",
  fontSize: "1rem",
  fontWeight: 700,
  cursor: "pointer",
  width: "100%",
  letterSpacing: 0.3,
  boxShadow: "0 4px 16px rgba(61, 174, 121, 0.35)",
  marginBottom: 10,
};

const rankingBtn: CSSProperties = {
  background: "#2D7D52",
  color: "#fff",
  border: "none",
  borderRadius: 50,
  padding: "13px 0",
  fontSize: "0.95rem",
  fontWeight: 700,
  cursor: "pointer",
  width: "100%",
  marginBottom: 8,
  boxShadow: "0 3px 12px rgba(45,125,82,0.3)",
};

const homeBtn: CSSProperties = {
  background: "transparent",
  color: "#A0B4AC",
  border: "1.5px solid #D0E0DA",
  borderRadius: 50,
  padding: "11px 0",
  fontSize: "0.9rem",
  fontWeight: 600,
  cursor: "pointer",
  width: "100%",
};
