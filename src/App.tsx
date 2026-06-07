import { useRef, useState } from "react";
import { useGame } from "./hooks/useGame";
import { GameCanvas } from "./components/GameCanvas";
import { GameHUD } from "./components/GameHUD";
import { GameOverModal } from "./components/GameOverModal";
import { MilestoneToast } from "./components/MilestoneToast";
import { ThemeToast } from "./components/ThemeToast";
import { PowerOverlay } from "./components/PowerOverlay";
import { RecordsModal } from "./components/RecordsModal";
import { RankingModal } from "./components/RankingModal";
import { ThemeCollectionModal } from "./components/ThemeCollectionModal";
import { CharacterSelect } from "./components/CharacterSelect";
import { SpeechBubble } from "./components/SpeechBubble";
import { CHARACTERS, getSavedCharId, saveCharId } from "./game/characters";
import "./App.css";

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    score,
    gaugeCount,
    distanceMeters,
    isPowerMode,
    powerTimeLeft,
    isSlowMode,
    slowTimeLeft,
    bestScore,
    gameEnded,
    gameOver,
    isStarted,
    currentTheme,
    activeMilestone,
    activeThemeToast,
    dodgerMsg,
    startGame,
    showResult,
    confirmComplete,
    backToPhotoMode,
    engineRef,
    isComplete,
    isPhotoMode,
    showCompletionOverlay,
    moonlightTimeLeft,
    photoMsg,
  } = useGame(canvasRef);

  const [showRecords, setShowRecords] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showRankingViewOnly, setShowRankingViewOnly] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [rankingDone, setRankingDone] = useState(false);
  const [selectedCharId, setSelectedCharId] = useState(getSavedCharId());

  const selectedChar =
    CHARACTERS.find((c) => c.id === selectedCharId) ?? CHARACTERS[0];

  const handleSelectChar = (id: string) => {
    setSelectedCharId(id);
    saveCharId(id);
  };

  const handleStart = () => {
    startGame(selectedChar.src);
  };

  const handleRestart = () => {
    startGame(selectedChar.src);
  };

  return (
    <div className="app">
      <GameCanvas canvasRef={canvasRef} engineRef={engineRef} />

      {isStarted && (
        <GameHUD
          score={score}
          bestScore={bestScore}
          distanceMeters={distanceMeters}
          gaugeCount={gaugeCount}
          isPowerMode={isPowerMode}
          powerTimeLeft={powerTimeLeft}
          isSlowMode={isSlowMode}
          slowTimeLeft={slowTimeLeft}
          currentTheme={currentTheme}
          moonlightTimeLeft={moonlightTimeLeft}
        />
      )}
      {isStarted && (
        <SpeechBubble
          message={isPhotoMode ? photoMsg : dodgerMsg}
          engineRef={engineRef}
          canvasRef={canvasRef}
          multiline={isPhotoMode}
          persistent={isPhotoMode}
        />
      )}
      {isStarted && <MilestoneToast milestone={activeMilestone} />}
      {isStarted && <ThemeToast theme={activeThemeToast} />}
      {isStarted && !isPhotoMode && (
        <PowerOverlay
          isPowerMode={isPowerMode}
          powerTimeLeft={powerTimeLeft}
          isMoonlight={currentTheme.id === "moonlight"}
        />
      )}

      {!isStarted && (
        <div className="overlay">
          <div className="start-card">
            <h1 className="game-title">산책길 모험</h1>
            <p className="game-desc">
              발자국을 모으고 물병으로 에너지를 충전하며
              <br />
              6개의 테마 산책길을 달려보세요!
            </p>

            {/* 캐릭터 선택 */}
            <CharacterSelect
              selected={selectedCharId}
              onSelect={handleSelectChar}
            />

            <div className="hint-row">
              <span className="hint">🟡 발자국 수집 → +10점</span>
              <span className="hint">
                💧 물병 10개 → 파워워커 발동 (무적+2배)
              </span>
              <span className="hint">⏱️ 시계 → 6초간 속도 절반으로</span>
              <span className="hint">🪨 돌·동물·사람 → 피하세요!</span>
            </div>
            <button className="btn-primary" onClick={handleStart}>
              걷기 시작 🌿
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowCollection(true)}
            >
              🗺️ 산책 도감
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowRankingViewOnly(true)}
            >
              🌍 전체 랭킹 보기
            </button>
          </div>
        </div>
      )}

      {/* 달빛길 포토모드 — 탭해서 결과 보기 */}
      {isPhotoMode && !gameEnded && (
        <div
          onClick={confirmComplete}
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 30,
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              background: "rgba(255,215,0,0.15)",
              border: "1px solid rgba(255,215,0,0.4)",
              borderRadius: 50,
              padding: "10px 28px",
              color: "rgba(255,215,0,0.9)",
              fontSize: "0.85rem",
              fontWeight: 700,
            }}
          >
            탭해서 완주 결과 보기 ✨
          </div>
        </div>
      )}

      {/* 달빛길 완주 오버레이 */}
      {showCompletionOverlay && !gameOver && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(5,5,30,0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 30,
          }}
        >
          <div
            style={{
              textAlign: "center",
              color: "#fff",
              padding: "32px 36px",
              borderRadius: 28,
              background: "rgba(255,215,0,0.1)",
              border: "1.5px solid rgba(255,215,0,0.4)",
              maxWidth: 300,
            }}
          >
            <div style={{ fontSize: "2.8rem", marginBottom: 10 }}>🌙✨🏆</div>
            <div
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                marginBottom: 6,
                color: "#FFD700",
              }}
            >
              달빛길 완주!
            </div>
            <div
              style={{
                fontSize: "0.88rem",
                color: "rgba(255,215,0,0.85)",
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              🎉 모든 테마를 해금했어요!
            </div>
            <div
              style={{
                fontSize: "0.82rem",
                opacity: 0.75,
                lineHeight: 1.7,
                marginBottom: 14,
              }}
            >
              공원부터 달빛길까지,
              <br />
              끝까지 함께 달려줘서 고마워요 🌿
              <br />
              덕분에 정말 즐거운 산책이었어요!
            </div>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                marginBottom: 16,
                color: "#FFD700",
              }}
            >
              {score.toLocaleString()}점 · {distanceMeters}m
            </div>
            {rankingDone ? (
              <button
                onClick={() => {
                  engineRef.current?.stop();
                  window.location.reload();
                }}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  border: "none",
                  borderRadius: 50,
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "#1A1A00",
                  cursor: "pointer",
                  marginBottom: 10,
                  boxShadow: "0 4px 20px rgba(255,215,0,0.5)",
                }}
              >
                🏠 메인으로 가기
              </button>
            ) : (
              <button
                onClick={() => setShowRanking(true)}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  border: "none",
                  borderRadius: 50,
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "#1A1A00",
                  cursor: "pointer",
                  marginBottom: 10,
                  boxShadow: "0 4px 20px rgba(255,215,0,0.5)",
                }}
              >
                🏆 전체 랭킹 등록
              </button>
            )}
            <button
              onClick={backToPhotoMode}
              style={{
                width: "100%",
                padding: "10px 0",
                background: "transparent",
                border: "1px solid rgba(255,215,0,0.4)",
                borderRadius: 50,
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "rgba(255,215,0,0.7)",
                cursor: "pointer",
              }}
            >
              📸 달빛길로 돌아가기
            </button>
          </div>
        </div>
      )}

      {/* 게임 종료 오버레이 — 화면 보다가 탭하면 결과 팝업 */}
      {gameEnded && !isComplete && !gameOver && (
        <div
          onClick={showResult}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.32)",
            backdropFilter: "blur(2px)",
            zIndex: 30,
          }}
        >
          <div
            style={{
              textAlign: "center",
              color: "#fff",
              padding: "28px 36px",
              borderRadius: 24,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.22)",
            }}
          >
            <div style={{ fontSize: "2.4rem", marginBottom: 8 }}>🌿</div>
            <div
              style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                marginBottom: 6,
                letterSpacing: -0.3,
              }}
            >
              오늘도 잘 걸었어요!
            </div>
            <div
              style={{ fontSize: "0.85rem", opacity: 0.75, fontWeight: 500 }}
            >
              탭해서 결과 확인
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <GameOverModal
          score={score}
          bestScore={bestScore}
          distanceMeters={distanceMeters}
          onRestart={handleRestart}
          onShowRanking={() => setShowRanking(true)}
          onGoHome={() => {
            engineRef.current?.stop();
            window.location.reload();
          }}
        />
      )}

      {showCollection && (
        <ThemeCollectionModal onClose={() => setShowCollection(false)} />
      )}
      {showRecords && <RecordsModal onClose={() => setShowRecords(false)} />}
      {showRanking && (
        <RankingModal
          score={score}
          distanceMeters={distanceMeters}
          onClose={() => {
            setShowRanking(false);
            if (isComplete) setRankingDone(true);
          }}
        />
      )}
      {showRankingViewOnly && (
        <RankingModal viewOnly onClose={() => setShowRankingViewOnly(false)} />
      )}
    </div>
  );
}

export default App;
