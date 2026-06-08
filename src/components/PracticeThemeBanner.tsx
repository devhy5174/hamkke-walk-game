import type { CSSProperties } from "react";
import type { GameTheme } from "../game/themes";

interface Props {
  theme: GameTheme;
}

const THEME_STYLES: Record<string, {
  bg: string;
  border: string;
  color: string;
  shadow: string;
  subColor: string;
}> = {
  park: {
    bg: "linear-gradient(135deg, rgba(34,90,50,0.88), rgba(50,130,70,0.88))",
    border: "rgba(100,200,120,0.5)",
    color: "#EAFFF0",
    shadow: "rgba(50,160,80,0.45)",
    subColor: "rgba(180,255,200,0.7)",
  },
  forest: {
    bg: "linear-gradient(135deg, rgba(20,60,30,0.90), rgba(35,90,45,0.90))",
    border: "rgba(80,160,90,0.5)",
    color: "#D8F5E0",
    shadow: "rgba(30,100,40,0.5)",
    subColor: "rgba(150,220,160,0.7)",
  },
  autumn: {
    bg: "linear-gradient(135deg, rgba(130,50,10,0.88), rgba(190,80,20,0.88))",
    border: "rgba(240,140,50,0.5)",
    color: "#FFF0D8",
    shadow: "rgba(200,80,10,0.45)",
    subColor: "rgba(255,200,130,0.7)",
  },
  cherry: {
    bg: "linear-gradient(135deg, rgba(180,60,100,0.82), rgba(220,100,140,0.82))",
    border: "rgba(255,180,200,0.5)",
    color: "#FFF0F5",
    shadow: "rgba(200,80,120,0.4)",
    subColor: "rgba(255,210,225,0.8)",
  },
  snow: {
    bg: "linear-gradient(135deg, rgba(60,90,140,0.88), rgba(90,130,190,0.88))",
    border: "rgba(180,210,255,0.5)",
    color: "#EEF5FF",
    shadow: "rgba(80,120,200,0.4)",
    subColor: "rgba(200,225,255,0.75)",
  },
  bamboo: {
    bg: "linear-gradient(135deg, rgba(30,65,35,0.90), rgba(50,95,55,0.90))",
    border: "rgba(120,190,100,0.45)",
    color: "#E8F8E5",
    shadow: "rgba(40,110,50,0.45)",
    subColor: "rgba(170,230,160,0.7)",
  },
  moonlight: {
    bg: "linear-gradient(135deg, rgba(15,10,45,0.92), rgba(30,20,75,0.92))",
    border: "rgba(255,215,0,0.45)",
    color: "#FFF8DC",
    shadow: "rgba(200,160,0,0.5)",
    subColor: "rgba(255,220,100,0.75)",
  },
};

export function PracticeThemeBanner({ theme }: Props) {
  const s = THEME_STYLES[theme.id] ?? THEME_STYLES.park;

  const style: CSSProperties = {
    position: "absolute",
    top: 16,
    left: "50%",
    transform: "translateX(-50%)",
    background: s.bg,
    backdropFilter: "blur(10px)",
    border: `1.5px solid ${s.border}`,
    borderRadius: 18,
    padding: "10px 20px 8px",
    textAlign: "center",
    pointerEvents: "none",
    zIndex: 20,
    boxShadow: `0 4px 18px ${s.shadow}`,
    whiteSpace: "nowrap",
  };

  return (
    <div style={style}>
      <div style={{ fontSize: "1.3rem", lineHeight: 1, marginBottom: 3 }}>
        {theme.emoji}
      </div>
      <div style={{
        fontSize: "0.95rem",
        fontWeight: 800,
        color: s.color,
        letterSpacing: 0.5,
        lineHeight: 1,
      }}>
        {theme.name}
      </div>
      <div style={{
        fontSize: "0.65rem",
        fontWeight: 600,
        color: s.subColor,
        marginTop: 3,
        letterSpacing: 0.3,
      }}>
        산책 모드 · 상하좌우 드래그 가능 · 기록 저장 안 됨
      </div>
    </div>
  );
}
