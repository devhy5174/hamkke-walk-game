import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { THEMES } from "../game/themes";
import type { GameTheme } from "../game/themes";
import { ROAD_L, ROAD_R } from "../game/constants";
import { renderBackground, renderDecorations } from "../game/themeRenderer";
import { getUnlockedThemes } from "../utils/themeCollection";

import footprintSrc from "../assets/images/item-footprint.png";

// 테마별 장애물 이미지 소스
import obsParRock from "../assets/images/obstacles/obs-park-rock.png";
import obsParPuddle from "../assets/images/obstacles/obs-park-puddle.png";
import obsForRock from "../assets/images/obstacles/obs-forest-rock.png";
import obsForPuddle from "../assets/images/obstacles/obs-forest-puddle.png";
import obsAutRock from "../assets/images/obstacles/obs-autumn-rock.png";
import obsCheRock from "../assets/images/obstacles/obs-cherry-rock.png";
import obsSnoRock from "../assets/images/obstacles/obs-snow-rock.png";
import obsMtnRock from "../assets/images/obstacles/obs-mountain-rock.png";

const ROCK_SRCS: Record<string, string> = {
  park: obsParRock,
  forest: obsForRock,
  autumn: obsParRock,
  cherry: obsParRock,
  snow: obsParRock,
  bamboo: obsForRock,
  moonlight: obsForRock,
};
const PUDDLE_SRCS: Record<string, string> = {
  park: obsParPuddle,
  forest: obsForPuddle,
  autumn: obsAutRock,
  cherry: obsCheRock,
  snow: obsSnoRock,
  bamboo: obsMtnRock,
  moonlight: obsMtnRock,
};

const DESCRIPTIONS: Record<string, string> = {
  park: "상쾌한 공기, 꽃과 잔디 위를 걸어요",
  forest: "피톤치드 가득한 초록 숲 산책",
  autumn: "바스락바스락 단풍잎이 쌓인 길",
  cherry: "분홍빛 꽃잎이 날리는 봄길",
  snow: "하얀 눈밭 위에 발자국을 남겨요",
  bamboo: "대나무 사이로 살랑이는 잎이 날리는 고요한 숲길",
  moonlight:
    "별빛 아래 황금 발자국만 빛나는 보상 구간. 여기까지 온 당신, 대단해요! ✨",
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
    const ctx = canvas.getContext("2d")!;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    // 장애물 이미지 로드
    const rockImg = new Image();
    const puddleImg = new Image();
    rockImg.src = ROCK_SRCS[theme.id];
    puddleImg.src = PUDDLE_SRCS[theme.id];
    // 숲·대나무: 정적 웅덩이는 공원 웅덩이 사용
    const parkPuddleImg = new Image();
    parkPuddleImg.src = PUDDLE_SRCS["park"];

    // 달빛길 황금 발자국
    const footprintImg = new Image();
    footprintImg.src = footprintSrc;
    let goldenFpCanvas: HTMLCanvasElement | null = null;

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
      const rc = {
        ctx,
        width: w,
        height: h,
        pathLeft,
        pathWidth,
        isPowerMode: false,
        scrollY,
        aliveTime,
      };

      renderBackground(rc, theme);
      renderDecorations(rc, theme);

      // 달빛길: 황금 발자국 이미지 오버레이
      if (theme.id === "moonlight") {
        if (footprintImg.complete && footprintImg.naturalWidth) {
          if (!goldenFpCanvas) {
            goldenFpCanvas = document.createElement("canvas");
            goldenFpCanvas.width = 128;
            goldenFpCanvas.height = 128;
            const gc = goldenFpCanvas.getContext("2d")!;
            gc.drawImage(footprintImg, 0, 0, 128, 128);
            const imgData = gc.getImageData(0, 0, 128, 128);
            const d = imgData.data;
            for (let i = 0; i < d.length; i += 4) {
              if (d[i + 3] > 20) {
                d[i] = 212;
                d[i + 1] = 175;
                d[i + 2] = 55;
              }
            }
            gc.putImageData(imgData, 0, 0);
          }
          const positions = [
            { x: pathLeft + pathWidth * 0.25, y: h * 0.3 },
            { x: pathLeft + pathWidth * 0.65, y: h * 0.52 },
            { x: pathLeft + pathWidth * 0.4, y: h * 0.72 },
          ];
          positions.forEach(({ x, y }, idx) => {
            const pulse =
              0.7 + Math.abs(Math.sin(aliveTime * 2.5 + idx * 1.3)) * 0.3;
            const r = 20;
            ctx.save();
            ctx.shadowColor = "#FFD700";
            ctx.shadowBlur = 20 * pulse;
            ctx.globalAlpha = pulse;
            ctx.drawImage(goldenFpCanvas!, x - r, y - r, r * 2, r * 2);
            ctx.restore();
          });
        }
      } else {
        // 장애물 오버레이 (이미지 로드 후)
        if (rockImg.complete && rockImg.naturalWidth) {
          ctx.save();
          ctx.filter = "saturate(1.4) contrast(1.1)";
          ctx.drawImage(rockImg, pathLeft + 12, h * 0.52, 50, 54);
          ctx.restore();
          // 눈길: 돌 위에 눈 쌓임
          if (theme.id === "snow") {
            const rx = pathLeft + 12, ry = h * 0.52, rw = 50, rh = 54;
            const cx = rx + rw / 2, topY = ry + rh * 0.18;
            ctx.save();
            ctx.fillStyle = "rgba(228,238,252,1)";
            ctx.beginPath();
            ctx.ellipse(cx, topY, rw * 0.3, rh * 0.18, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,1)";
            ctx.beginPath();
            ctx.ellipse(cx - rw * 0.06, topY - rh * 0.04, rw * 0.14, rh * 0.08, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
        if (puddleImg.complete && puddleImg.naturalWidth) {
          ctx.save();
          ctx.filter = "saturate(1.5) contrast(1.1)";
          ctx.drawImage(puddleImg, pathLeft + pathWidth - 72, h * 0.42, 60, 60);
          ctx.restore();
        }
        // 숲: 정적 웅덩이도 표시
        if (
          theme.id === "forest" &&
          parkPuddleImg.complete &&
          parkPuddleImg.naturalWidth
        ) {
          ctx.save();
          ctx.filter = "saturate(1.4) contrast(1.1)";
          ctx.drawImage(
            parkPuddleImg,
            pathLeft + pathWidth * 0.4,
            h * 0.68,
            58,
            44,
          );
          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        borderRadius: 16,
      }}
    />
  );
}

// ── 테마 상세 팝업 ───────────────────────────────────────────────────────────

function ThemeDetailPopup({
  theme,
  index,
  onClose,
  onPractice,
  allUnlocked,
}: {
  theme: GameTheme;
  index: number;
  onClose: () => void;
  onPractice?: (theme: GameTheme) => void;
  allUnlocked: boolean;
}) {
  return (
    <div style={detailBackdrop} onClick={onClose}>
      <div style={detailCard} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            height: 190,
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 14,
          }}
        >
          <ThemePreviewCanvas theme={theme} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 28 }}>{theme.emoji}</span>
          <div>
            <div style={detailName}>{theme.name}</div>
            <div style={detailRange}>{rangeText(index)}</div>
          </div>
        </div>
        <p style={detailDesc}>{DESCRIPTIONS[theme.id]}</p>
        {allUnlocked && onPractice && (
          <button style={practiceBtn} onClick={() => onPractice(theme)}>
            🎮 산책하기
          </button>
        )}
        <button style={closeBtn} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}

// ── 메인 도감 모달 ───────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  onPractice?: (theme: GameTheme) => void;
}

const PRACTICE_NOTICE_KEY = "hamkke-practice-notified";

export function ThemeCollectionModal({ onClose, onPractice }: Props) {
  const unlocked = getUnlockedThemes();
  const count = unlocked.length;
  const allUnlocked = count >= THEMES.length;
  const [selected, setSelected] = useState<{
    theme: GameTheme;
    index: number;
  } | null>(null);
  const [showPracticeNotice, setShowPracticeNotice] = useState(
    () => allUnlocked && !localStorage.getItem(PRACTICE_NOTICE_KEY),
  );

  const handlePractice = (theme: GameTheme) => {
    setSelected(null);
    onClose();
    onPractice?.(theme);
  };

  const dismissNotice = () => {
    localStorage.setItem(PRACTICE_NOTICE_KEY, "1");
    setShowPracticeNotice(false);
  };

  return (
    <>
      <div style={backdrop} onClick={onClose}>
        <div style={card} onClick={(e) => e.stopPropagation()}>
          <div style={header}>
            <div style={{ fontSize: "2rem", marginBottom: 4 }}>🗺️</div>
            <h2 style={title}>산책 도감</h2>
            <p style={subtitle}>
              <span style={{ color: "#3DAE79", fontWeight: 800 }}>{count}</span>
              <span style={{ color: "#A0B4AC" }}>
                {" "}
                / {THEMES.length} 구간 방문
              </span>
            </p>
            <div style={progressTrack}>
              <div
                style={{
                  ...progressFill,
                  width: `${(count / THEMES.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div style={grid}>
            {THEMES.map((theme, i) => {
              const isUnlocked = unlocked.includes(theme.id);
              const isBonus = theme.id === "moonlight";
              return (
                <div
                  key={theme.id}
                  style={
                    isUnlocked
                      ? isBonus
                        ? gridItemBonus
                        : gridItemUnlocked
                      : isBonus
                        ? gridItemBonusLocked
                        : gridItemLocked
                  }
                  className={
                    isUnlocked && isBonus ? "moonlight-unlocked-card" : ""
                  }
                  onClick={
                    isUnlocked
                      ? () => setSelected({ theme, index: i })
                      : undefined
                  }
                >
                  {isUnlocked && isBonus ? (
                    <span className="moon-emoji" style={{ fontSize: 28 }}>
                      {theme.emoji}
                    </span>
                  ) : (
                    <span style={{ fontSize: 28 }}>
                      {isUnlocked ? theme.emoji : isBonus ? "✨" : "🔒"}
                    </span>
                  )}
                  <div style={gridName(isUnlocked, isBonus)}>
                    {isUnlocked
                      ? theme.name
                      : isBonus
                        ? "보너스 구간"
                        : "미방문"}
                  </div>
                  <div
                    style={{
                      ...gridRange,
                      color: isBonus && !isUnlocked ? "#C8A000" : undefined,
                    }}
                  >
                    {isUnlocked ? rangeText(i) : `${theme.minDistance}m~`}
                  </div>
                  {isUnlocked && isBonus && (
                    <span className="sparkle-icon">✨</span>
                  )}
                </div>
              );
            })}
          </div>

          <button style={closeBtn} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>

      {/* 산책 모드 최초 안내 팝업 */}
      {showPracticeNotice && (
        <div style={noticeBackdrop} onClick={dismissNotice}>
          <div style={noticeCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "2.8rem", marginBottom: 8 }}>🎮</div>
            <div style={noticeTitle}>산책 산책 모드 활성화!</div>
            <div style={noticeBody}>
              모든 테마를 해금했어요 🎉
              <br />각 테마를 탭하면 <strong>산책하기</strong> 버튼이 생겨요.
              <br />
              장애물에 부딪혀도 괜찮으니 마음껏 산책해보세요!
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.55)",
                marginBottom: 18,
              }}
            >
              기록·랭킹에는 반영되지 않아요
            </div>
            <button style={noticeBtn} onClick={dismissNotice}>
              알겠어요! 산책해볼게요 ✨
            </button>
          </div>
        </div>
      )}

      {selected && (
        <ThemeDetailPopup
          theme={selected.theme}
          index={selected.index}
          onClose={() => setSelected(null)}
          onPractice={handlePractice}
          allUnlocked={allUnlocked}
        />
      )}
    </>
  );
}

// ── 스타일 ──────────────────────────────────────────────────────────────────

const backdrop: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(200,235,218,0.55)",
  backdropFilter: "blur(6px)",
  zIndex: 50,
};

const card: CSSProperties = {
  background: "#fff",
  borderRadius: 28,
  padding: "28px 22px 22px",
  boxShadow: "0 8px 40px rgba(61,174,121,0.18)",
  maxWidth: 340,
  width: "92%",
  maxHeight: "84vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const header: CSSProperties = { textAlign: "center", marginBottom: 16 };
const title: CSSProperties = {
  margin: "0 0 2px",
  fontSize: "1.4rem",
  fontWeight: 800,
  color: "#2D7D52",
};
const subtitle: CSSProperties = { margin: "0 0 10px", fontSize: "0.9rem" };

const progressTrack: CSSProperties = {
  height: 6,
  background: "#E8F5EE",
  borderRadius: 3,
  overflow: "hidden",
  margin: "0 12px",
};
const progressFill: CSSProperties = {
  height: "100%",
  background: "linear-gradient(90deg, #52C87A, #3DAE79)",
  borderRadius: 3,
  transition: "width 0.5s ease",
};

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 10,
  flex: 1,
  overflowY: "auto",
  marginBottom: 14,
};

const baseGridItem: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "12px 6px",
  borderRadius: 16,
  textAlign: "center",
  cursor: "pointer",
};
const gridItemUnlocked: CSSProperties = {
  ...baseGridItem,
  background: "#F0FAF5",
  border: "1.5px solid #D0EEE0",
};
const gridItemLocked: CSSProperties = {
  ...baseGridItem,
  background: "#F8F8F8",
  border: "1.5px solid #EBEBEB",
  opacity: 0.6,
  cursor: "default",
};
const gridItemBonus: CSSProperties = {
  ...baseGridItem,
  background: "#FFFBEA",
  border: "1.5px solid #FFD700",
  position: "relative",
};
const gridItemBonusLocked: CSSProperties = {
  ...baseGridItem,
  background: "#FFFBEA",
  border: "1.5px dashed #FFD700",
  cursor: "default",
};
const gridName = (unlocked: boolean, bonus = false): CSSProperties => ({
  fontSize: 11,
  fontWeight: 700,
  marginTop: 6,
  color: bonus ? "#B8860B" : unlocked ? "#2D7D52" : "#B0B0B0",
});
const gridRange: CSSProperties = {
  fontSize: 9,
  color: "#A0B4AC",
  marginTop: 2,
};

const practiceBtn: CSSProperties = {
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  color: "#fff",
  border: "none",
  borderRadius: 50,
  padding: "12px 0",
  fontSize: "0.95rem",
  fontWeight: 700,
  cursor: "pointer",
  width: "100%",
  marginBottom: 8,
  boxShadow: "0 4px 14px rgba(102,126,234,0.4)",
};

const closeBtn: CSSProperties = {
  background: "#3DAE79",
  color: "#fff",
  border: "none",
  borderRadius: 50,
  padding: "13px 0",
  fontSize: "1rem",
  fontWeight: 700,
  cursor: "pointer",
  width: "100%",
  boxShadow: "0 4px 16px rgba(61,174,121,0.3)",
};

// 산책 모드 안내 팝업
const noticeBackdrop: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(30,10,60,0.75)",
  backdropFilter: "blur(6px)",
  zIndex: 70,
};
const noticeCard: CSSProperties = {
  background: "linear-gradient(145deg, #4a3080, #2d1a5e)",
  border: "1.5px solid rgba(180,140,255,0.35)",
  borderRadius: 28,
  padding: "32px 28px 24px",
  textAlign: "center",
  maxWidth: 300,
  width: "88%",
  boxShadow: "0 12px 40px rgba(102,60,220,0.5)",
};
const noticeTitle: CSSProperties = {
  fontSize: "1.3rem",
  fontWeight: 800,
  color: "#fff",
  marginBottom: 12,
  letterSpacing: -0.3,
};
const noticeBody: CSSProperties = {
  fontSize: "0.88rem",
  color: "rgba(255,255,255,0.8)",
  lineHeight: 1.7,
  marginBottom: 8,
};
const noticeBtn: CSSProperties = {
  width: "100%",
  padding: "14px 0",
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  border: "none",
  borderRadius: 50,
  fontSize: "0.95rem",
  fontWeight: 800,
  color: "#fff",
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(102,126,234,0.5)",
};

// 상세 팝업
const detailBackdrop: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,0.4)",
  backdropFilter: "blur(4px)",
  zIndex: 60,
};
const detailCard: CSSProperties = {
  background: "#fff",
  borderRadius: 24,
  padding: "20px 20px 18px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
  maxWidth: 320,
  width: "88%",
};
const detailName: CSSProperties = {
  fontSize: "1.2rem",
  fontWeight: 800,
  color: "#2D7D52",
};
const detailRange: CSSProperties = {
  fontSize: 12,
  color: "#8ABD9E",
  marginTop: 2,
};
const detailDesc: CSSProperties = {
  fontSize: "0.88rem",
  color: "#7AAD8E",
  margin: "8px 0 16px",
  lineHeight: 1.5,
};
