import type { CSSProperties } from "react";
import { GAUGE_CAPACITY } from "../game/constants";
import type { GameTheme } from "../game/themes";

interface Props {
  score: number;
  bestScore: number;
  distanceMeters: number;
  gaugeCount: number;
  isPowerMode: boolean;
  powerTimeLeft: number;
  isSlowMode: boolean;
  slowTimeLeft: number;
  currentTheme: GameTheme;
  moonlightTimeLeft: number;
}

interface HudStyle {
  bg: string;
  border: string;
  shadow: string;
  scoreColor: string;
  bestColor: string;
  labelColor: string;
  subColor: string;
  gaugeBar: string;
  gaugeBarFull: string;
  gaugeTrack: string;
  gaugeTrackBorder: string;
  gaugeTextColor: string;
  gaugeTextFull: string;
  slowColor: string;
  moonColor: string;
}

const THEME_HUD: Record<string, HudStyle> = {
  park: {
    bg: "rgba(238,255,244,0.95)",
    border: "rgba(61,174,121,0.22)",
    shadow: "0 2px 16px rgba(61,174,121,0.10)",
    scoreColor: "#2D9B5A",
    bestColor: "#4A7560",
    labelColor: "#8ABDA0",
    subColor: "#7AAD8E",
    gaugeBar: "linear-gradient(90deg,#64B5F6,#1976D2)",
    gaugeBarFull: "linear-gradient(90deg,#FFD166,#FF8C42)",
    gaugeTrack: "rgba(100,181,246,0.14)",
    gaugeTrackBorder: "rgba(100,181,246,0.25)",
    gaugeTextColor: "#4A90A8",
    gaugeTextFull: "#E07020",
    slowColor: "#3BAAD0",
    moonColor: "#C8A000",
  },
  forest: {
    bg: "rgba(12,30,18,0.92)",
    border: "rgba(100,200,100,0.22)",
    shadow: "0 2px 18px rgba(0,60,0,0.30)",
    scoreColor: "#7EE88A",
    bestColor: "#5BBD6A",
    labelColor: "#3A6A45",
    subColor: "#55855E",
    gaugeBar: "linear-gradient(90deg,#4CAF50,#1B5E20)",
    gaugeBarFull: "linear-gradient(90deg,#FFD166,#FF8C42)",
    gaugeTrack: "rgba(78,160,80,0.18)",
    gaugeTrackBorder: "rgba(78,160,80,0.30)",
    gaugeTextColor: "#6CBF70",
    gaugeTextFull: "#FFB830",
    slowColor: "#60C8E0",
    moonColor: "#FFD700",
  },
  autumn: {
    bg: "rgba(255,247,237,0.95)",
    border: "rgba(210,80,30,0.20)",
    shadow: "0 2px 16px rgba(180,60,20,0.10)",
    scoreColor: "#C04810",
    bestColor: "#8B3810",
    labelColor: "#C8906A",
    subColor: "#B07858",
    gaugeBar: "linear-gradient(90deg,#FFA040,#E64A00)",
    gaugeBarFull: "linear-gradient(90deg,#FFD166,#FF5722)",
    gaugeTrack: "rgba(255,152,0,0.14)",
    gaugeTrackBorder: "rgba(255,152,0,0.25)",
    gaugeTextColor: "#C07030",
    gaugeTextFull: "#D03800",
    slowColor: "#5BAED0",
    moonColor: "#C8A000",
  },
  cherry: {
    bg: "rgba(255,238,248,0.95)",
    border: "rgba(220,100,160,0.22)",
    shadow: "0 2px 16px rgba(200,80,140,0.10)",
    scoreColor: "#B02870",
    bestColor: "#882060",
    labelColor: "#D490B0",
    subColor: "#C078A0",
    gaugeBar: "linear-gradient(90deg,#F48FB1,#C2185B)",
    gaugeBarFull: "linear-gradient(90deg,#FFD166,#FF8C42)",
    gaugeTrack: "rgba(244,143,177,0.14)",
    gaugeTrackBorder: "rgba(244,143,177,0.28)",
    gaugeTextColor: "#C060A0",
    gaugeTextFull: "#E03068",
    slowColor: "#7090D0",
    moonColor: "#C8A000",
  },
  snow: {
    bg: "rgba(232,248,255,0.95)",
    border: "rgba(100,180,230,0.28)",
    shadow: "0 2px 16px rgba(80,160,220,0.12)",
    scoreColor: "#1255B0",
    bestColor: "#0A3A80",
    labelColor: "#70A8C8",
    subColor: "#5898B8",
    gaugeBar: "linear-gradient(90deg,#80DEEA,#0097A7)",
    gaugeBarFull: "linear-gradient(90deg,#FFD166,#FF8C42)",
    gaugeTrack: "rgba(128,222,234,0.16)",
    gaugeTrackBorder: "rgba(128,222,234,0.30)",
    gaugeTextColor: "#4090B0",
    gaugeTextFull: "#E07020",
    slowColor: "#4090D8",
    moonColor: "#C8A000",
  },
  bamboo: {
    bg: "rgba(14,28,14,0.92)",
    border: "rgba(140,200,100,0.22)",
    shadow: "0 2px 18px rgba(10,40,10,0.30)",
    scoreColor: "#A8D6A0",
    bestColor: "#78B870",
    labelColor: "#3A5E3A",
    subColor: "#527852",
    gaugeBar: "linear-gradient(90deg,#66BB6A,#2E7D32)",
    gaugeBarFull: "linear-gradient(90deg,#FFD166,#FF8C42)",
    gaugeTrack: "rgba(102,187,106,0.18)",
    gaugeTrackBorder: "rgba(102,187,106,0.30)",
    gaugeTextColor: "#68A868",
    gaugeTextFull: "#FFB830",
    slowColor: "#60C0D8",
    moonColor: "#FFD700",
  },
  moonlight: {
    bg: "rgba(8,5,24,0.93)",
    border: "rgba(255,215,0,0.28)",
    shadow: "0 2px 20px rgba(160,100,255,0.20)",
    scoreColor: "#FFD700",
    bestColor: "#C8A000",
    labelColor: "rgba(255,215,0,0.42)",
    subColor: "rgba(255,215,0,0.55)",
    gaugeBar: "linear-gradient(90deg,#CE93D8,#7B1FA2)",
    gaugeBarFull: "linear-gradient(90deg,#FFD166,#FF8C42)",
    gaugeTrack: "rgba(206,147,216,0.14)",
    gaugeTrackBorder: "rgba(206,147,216,0.28)",
    gaugeTextColor: "#B080D0",
    gaugeTextFull: "#FFB830",
    slowColor: "#60C0FF",
    moonColor: "#FFD700",
  },
};

const DEFAULT_HUD = THEME_HUD.park;

export function GameHUD({
  score,
  bestScore,
  distanceMeters,
  gaugeCount,
  isPowerMode,
  isSlowMode,
  slowTimeLeft,
  currentTheme,
  moonlightTimeLeft,
}: Props) {
  const s = THEME_HUD[currentTheme.id] ?? DEFAULT_HUD;
  const gaugePct = gaugeCount / GAUGE_CAPACITY;
  const gaugeFull = gaugeCount >= GAUGE_CAPACITY;

  const card: CSSProperties = {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    background: s.bg,
    backdropFilter: "blur(14px)",
    borderRadius: 18,
    border: `1px solid ${s.border}`,
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: s.shadow,
    pointerEvents: "none",
    transition: "background 0.6s, border 0.6s, box-shadow 0.6s",
  };

  const label: CSSProperties = {
    fontSize: 10,
    color: s.labelColor,
    letterSpacing: 1,
    fontWeight: 600,
    marginBottom: 1,
  };

  const bigNum: CSSProperties = {
    fontSize: 28,
    fontWeight: 800,
    lineHeight: 1,
  };

  const sub: CSSProperties = {
    fontSize: 11,
    color: s.subColor,
    marginTop: 3,
    fontWeight: 500,
  };

  return (
    <div style={card}>
      {/* 점수 (좌) */}
      <div>
        <div style={label}>점수</div>
        <div style={{ ...bigNum, color: s.scoreColor }}>{score}</div>
        <div style={sub}>
          {currentTheme.emoji} {currentTheme.name}
        </div>
        <div style={{ ...sub, marginTop: 1 }}>🏃 {distanceMeters}m</div>
      </div>

      {/* 물병 게이지 (중앙) */}
      <div style={centerBox}>
        {isPowerMode ? (
          <div style={{ fontSize: 22, lineHeight: 1 }}>⚡</div>
        ) : (
          <>
            <div style={{ fontSize: 10, color: s.labelColor, fontWeight: 600, letterSpacing: 0.5 }}>
              💧 물병 게이지
            </div>
            <div style={{
              width: "100%",
              height: 10,
              background: s.gaugeTrack,
              borderRadius: 5,
              overflow: "hidden",
              border: `1px solid ${s.gaugeTrackBorder}`,
            }}>
              <div style={{
                height: "100%",
                width: `${gaugePct * 100}%`,
                background: gaugeFull ? s.gaugeBarFull : s.gaugeBar,
                borderRadius: 5,
                transition: "width 0.25s ease, background 0.3s",
                boxShadow: gaugeFull ? "0 0 8px rgba(255,190,50,0.7)" : "none",
              }} />
            </div>
            <div style={{
              fontSize: 11,
              letterSpacing: 0.3,
              color: gaugeFull ? s.gaugeTextFull : s.gaugeTextColor,
              fontWeight: gaugeFull ? 800 : 600,
            }}>
              {gaugeFull ? "⚡ FULL!" : `${gaugeCount} / 10`}
            </div>
          </>
        )}
        {isSlowMode && (
          <div style={{ fontSize: 11, color: s.slowColor, fontWeight: 700, marginTop: 2 }}>
            ⏱️ {Math.ceil(slowTimeLeft)}s
          </div>
        )}
      </div>

      {/* 최고 점수 (우) */}
      <div style={{ textAlign: "right" }}>
        <div style={label}>최고</div>
        <div style={{ ...bigNum, color: s.bestColor }}>{bestScore}</div>
        {moonlightTimeLeft > 0 && (
          <div style={{ fontSize: 11, color: s.moonColor, fontWeight: 800, marginTop: 2 }}>
            🌙 {moonlightTimeLeft}s
          </div>
        )}
      </div>
    </div>
  );
}

const centerBox: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  flex: 1,
  padding: "0 10px",
};
